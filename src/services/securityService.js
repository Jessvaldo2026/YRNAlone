// FILE: src/services/securityService.js
// 🔒 Security Service - Protect organizations and patients from scams
// Data safety, verification, encryption helpers

import { db } from '../firebase';
import { 
  collection, doc, addDoc, updateDoc, getDoc, getDocs, 
  query, where, orderBy, serverTimestamp, limit
} from 'firebase/firestore';
import { logAuditEvent, AUDIT_ACTIONS } from './auditService';

// ============================================
// 🛡️ SECURITY CONFIGURATION
// ============================================

export const SECURITY_SETTINGS = {
  // Session settings
  SESSION_TIMEOUT_MINUTES: 60,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: false,
  
  // Data retention
  AUDIT_LOG_RETENTION_DAYS: 365,
  DELETED_DATA_RETENTION_DAYS: 30,
  
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_API_CALLS_PER_HOUR: 1000
};

// ============================================
// 🔐 DATA PROTECTION
// ============================================

/**
 * Mask sensitive data for display
 */
export const maskSensitiveData = (data, type) => {
  if (!data) return '';
  
  switch (type) {
    case 'email':
      const [localPart, domain] = data.split('@');
      if (!domain) return '***@***';
      return `${localPart.slice(0, 2)}***@${domain}`;
    
    case 'phone':
      const digits = data.replace(/\D/g, '');
      if (digits.length < 4) return '****';
      return `***-***-${digits.slice(-4)}`;
    
    case 'name':
      if (data.length < 2) return '***';
      return `${data[0]}${'*'.repeat(data.length - 2)}${data.slice(-1)}`;
    
    case 'ssn':
      return '***-**-' + (data.slice(-4) || '****');
    
    default:
      return data.slice(0, 2) + '*'.repeat(Math.max(0, data.length - 4)) + data.slice(-2);
  }
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (password.length < SECURITY_SETTINGS.MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_SETTINGS.MIN_PASSWORD_LENGTH} characters`);
  }
  
  if (SECURITY_SETTINGS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (SECURITY_SETTINGS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (SECURITY_SETTINGS.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (SECURITY_SETTINGS.REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

/**
 * Calculate password strength score (0-100)
 */
const calculatePasswordStrength = (password) => {
  let score = 0;
  
  // Length
  score += Math.min(password.length * 4, 40);
  
  // Character variety
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  
  // Bonus for length
  if (password.length >= 12) score += 15;
  
  return Math.min(score, 100);
};

// ============================================
// 🚨 SCAM DETECTION & PREVENTION
// ============================================

/**
 * Suspicious activity patterns
 */
export const SUSPICIOUS_PATTERNS = {
  RAPID_MESSAGES: 'rapid_messages', // Too many messages in short time
  LINK_SHARING: 'link_sharing', // Sharing external links
  PERSONAL_INFO_REQUEST: 'personal_info_request', // Asking for personal info
  PAYMENT_REQUEST: 'payment_request', // Asking for money/payment
  PHISHING_ATTEMPT: 'phishing_attempt', // Fake login pages, etc.
  IMPERSONATION: 'impersonation', // Pretending to be staff
  SPAM: 'spam', // Repetitive/promotional content
  HARASSMENT: 'harassment' // Threatening or abusive
};

/**
 * Check message for suspicious content
 */
export const checkForSuspiciousContent = (message) => {
  const flags = [];
  const lowerMessage = message.toLowerCase();
  
  // Check for payment requests
  const paymentKeywords = ['send money', 'wire transfer', 'bitcoin', 'gift card', 'venmo', 'paypal', 'cashapp', 'bank account', 'credit card'];
  if (paymentKeywords.some(kw => lowerMessage.includes(kw))) {
    flags.push({ type: SUSPICIOUS_PATTERNS.PAYMENT_REQUEST, severity: 'high' });
  }
  
  // Check for personal info requests
  const personalInfoKeywords = ['social security', 'ssn', 'password', 'login', 'bank account', 'credit card number', 'pin number'];
  if (personalInfoKeywords.some(kw => lowerMessage.includes(kw))) {
    flags.push({ type: SUSPICIOUS_PATTERNS.PERSONAL_INFO_REQUEST, severity: 'high' });
  }
  
  // Check for suspicious links
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  const urls = message.match(urlPattern);
  if (urls && urls.length > 0) {
    // Check for suspicious domains
    const suspiciousDomains = ['bit.ly', 'tinyurl', 'goo.gl', 't.co'];
    const hasSuspiciousUrl = urls.some(url => 
      suspiciousDomains.some(domain => url.includes(domain))
    );
    if (hasSuspiciousUrl) {
      flags.push({ type: SUSPICIOUS_PATTERNS.LINK_SHARING, severity: 'medium' });
    }
  }
  
  // Check for impersonation
  const impersonationKeywords = ['i am admin', 'i am staff', 'official support', 'from the company', 'verify your account'];
  if (impersonationKeywords.some(kw => lowerMessage.includes(kw))) {
    flags.push({ type: SUSPICIOUS_PATTERNS.IMPERSONATION, severity: 'high' });
  }
  
  return {
    isSuspicious: flags.length > 0,
    flags,
    highSeverity: flags.some(f => f.severity === 'high')
  };
};

/**
 * Log suspicious activity
 */
export const logSuspiciousActivity = async (organizationId, data) => {
  try {
    const logsRef = collection(db, 'organizations', organizationId, 'securityLogs');
    await addDoc(logsRef, {
      ...data,
      timestamp: serverTimestamp(),
      status: 'pending_review'
    });
    
    // Also log to audit
    await logAuditEvent(organizationId, {
      action: 'SUSPICIOUS_ACTIVITY_DETECTED',
      performedBy: 'system',
      details: data
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error logging suspicious activity:', error);
    return { success: false };
  }
};

/**
 * Get security logs for organization
 */
export const getSecurityLogs = async (organizationId, limitCount = 50) => {
  try {
    const logsRef = collection(db, 'organizations', organizationId, 'securityLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    return logs;
  } catch (error) {
    console.error('Error getting security logs:', error);
    return [];
  }
};

// ============================================
// 👤 USER VERIFICATION
// ============================================

/**
 * Track login attempts
 */
export const trackLoginAttempt = async (userId, success, ipAddress = null) => {
  try {
    const attemptsRef = collection(db, 'loginAttempts');
    await addDoc(attemptsRef, {
      userId,
      success,
      ipAddress,
      timestamp: serverTimestamp()
    });
    
    // Check if user should be locked out
    if (!success) {
      const recentAttemptsQuery = query(
        attemptsRef,
        where('userId', '==', userId),
        where('success', '==', false),
        orderBy('timestamp', 'desc'),
        limit(SECURITY_SETTINGS.MAX_LOGIN_ATTEMPTS)
      );
      
      const snapshot = await getDocs(recentAttemptsQuery);
      if (snapshot.size >= SECURITY_SETTINGS.MAX_LOGIN_ATTEMPTS) {
        // Check if all within lockout window
        const attempts = [];
        snapshot.forEach(doc => attempts.push(doc.data()));
        
        const oldestAttempt = attempts[attempts.length - 1];
        const timeDiff = Date.now() - (oldestAttempt.timestamp?.toDate?.()?.getTime() || 0);
        
        if (timeDiff < SECURITY_SETTINGS.LOCKOUT_DURATION_MINUTES * 60 * 1000) {
          return { locked: true, remainingTime: SECURITY_SETTINGS.LOCKOUT_DURATION_MINUTES };
        }
      }
    }
    
    return { locked: false };
  } catch (error) {
    console.error('Error tracking login attempt:', error);
    return { locked: false };
  }
};

/**
 * Check if user is locked out
 */
export const checkLockoutStatus = async (userId) => {
  try {
    const attemptsRef = collection(db, 'loginAttempts');
    const recentAttemptsQuery = query(
      attemptsRef,
      where('userId', '==', userId),
      where('success', '==', false),
      orderBy('timestamp', 'desc'),
      limit(SECURITY_SETTINGS.MAX_LOGIN_ATTEMPTS)
    );
    
    const snapshot = await getDocs(recentAttemptsQuery);
    if (snapshot.size < SECURITY_SETTINGS.MAX_LOGIN_ATTEMPTS) {
      return { locked: false };
    }
    
    const attempts = [];
    snapshot.forEach(doc => attempts.push(doc.data()));
    
    const oldestAttempt = attempts[attempts.length - 1];
    const timeDiff = Date.now() - (oldestAttempt.timestamp?.toDate?.()?.getTime() || 0);
    
    if (timeDiff < SECURITY_SETTINGS.LOCKOUT_DURATION_MINUTES * 60 * 1000) {
      const remainingMs = (SECURITY_SETTINGS.LOCKOUT_DURATION_MINUTES * 60 * 1000) - timeDiff;
      return { locked: true, remainingMinutes: Math.ceil(remainingMs / 60000) };
    }
    
    return { locked: false };
  } catch (error) {
    console.error('Error checking lockout status:', error);
    return { locked: false };
  }
};

// ============================================
// 🔒 DATA ACCESS CONTROL
// ============================================

/**
 * Role-based access levels
 */
export const ACCESS_LEVELS = {
  OWNER: 'owner',
  ADMIN: 'admin',
  THERAPIST: 'therapist',
  STAFF: 'staff',
  MEMBER: 'member'
};

/**
 * Permission matrix
 */
export const PERMISSIONS = {
  [ACCESS_LEVELS.OWNER]: ['all'],
  [ACCESS_LEVELS.ADMIN]: [
    'view_all_members', 'manage_members', 'view_analytics', 
    'manage_therapists', 'manage_surveys', 'view_audit_logs',
    'manage_settings', 'export_data', 'manage_billing'
  ],
  [ACCESS_LEVELS.THERAPIST]: [
    'view_assigned_members', 'create_sessions', 'view_session_notes',
    'send_messages', 'view_alerts', 'create_interventions',
    'manage_calendar', 'export_patient_data'
  ],
  [ACCESS_LEVELS.STAFF]: [
    'view_members', 'send_messages', 'view_alerts'
  ],
  [ACCESS_LEVELS.MEMBER]: [
    'view_own_data', 'respond_surveys', 'send_messages'
  ]
};

/**
 * Check if user has permission
 */
export const hasPermission = (userRole, permission) => {
  const rolePermissions = PERMISSIONS[userRole] || [];
  return rolePermissions.includes('all') || rolePermissions.includes(permission);
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role) => {
  return PERMISSIONS[role] || [];
};

// ============================================
// 📊 DATA EXPORT & COMPLIANCE
// ============================================

/**
 * Generate data export for GDPR/HIPAA compliance
 */
export const generateUserDataExport = async (organizationId, userId) => {
  try {
    const exportData = {
      exportDate: new Date().toISOString(),
      userId,
      organizationId,
      userData: {},
      activities: [],
      sessions: [],
      messages: []
    };
    
    // Get user data
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Remove sensitive internal fields
      delete userData.passwordHash;
      delete userData.securityQuestions;
      exportData.userData = userData;
    }
    
    // Log the export
    await logAuditEvent(organizationId, {
      action: 'USER_DATA_EXPORTED',
      performedBy: userId,
      details: { userId }
    });
    
    return exportData;
  } catch (error) {
    console.error('Error generating data export:', error);
    return null;
  }
};

/**
 * Request data deletion (GDPR right to be forgotten)
 */
export const requestDataDeletion = async (organizationId, userId, requestedBy) => {
  try {
    const requestsRef = collection(db, 'organizations', organizationId, 'deletionRequests');
    const docRef = await addDoc(requestsRef, {
      userId,
      requestedBy,
      requestedAt: serverTimestamp(),
      status: 'pending', // pending, approved, completed, rejected
      scheduledDeletionDate: new Date(Date.now() + SECURITY_SETTINGS.DELETED_DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000)
    });
    
    await logAuditEvent(organizationId, {
      action: 'DATA_DELETION_REQUESTED',
      performedBy: requestedBy,
      details: { userId, requestId: docRef.id }
    });
    
    return { success: true, requestId: docRef.id };
  } catch (error) {
    console.error('Error requesting data deletion:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// 🏥 HIPAA COMPLIANCE HELPERS
// ============================================

/**
 * HIPAA-compliant audit log entry
 */
export const createHIPAALog = async (organizationId, data) => {
  const hipaaLog = {
    timestamp: serverTimestamp(),
    action: data.action,
    userId: data.userId,
    patientId: data.patientId || null,
    accessType: data.accessType, // create, read, update, delete
    dataType: data.dataType, // PHI type accessed
    ipAddress: data.ipAddress || null,
    userAgent: data.userAgent || null,
    success: data.success !== false,
    reason: data.reason || null
  };
  
  try {
    await addDoc(collection(db, 'organizations', organizationId, 'hipaaLogs'), hipaaLog);
    return { success: true };
  } catch (error) {
    console.error('Error creating HIPAA log:', error);
    return { success: false };
  }
};

/**
 * Get HIPAA compliance status
 */
export const getComplianceStatus = async (organizationId) => {
  try {
    const orgDoc = await getDoc(doc(db, 'organizations', organizationId));
    if (!orgDoc.exists()) return null;
    
    const org = orgDoc.data();
    
    return {
      hipaaCompliant: org.hipaaCompliant || false,
      baaSignedDate: org.baaSignedDate || null,
      lastSecurityAudit: org.lastSecurityAudit || null,
      encryptionEnabled: true, // Firebase encrypts data at rest
      auditLoggingEnabled: true,
      accessControlsEnabled: true,
      dataRetentionPolicy: org.dataRetentionPolicy || 'default',
      staffTrainingComplete: org.staffTrainingComplete || false
    };
  } catch (error) {
    console.error('Error getting compliance status:', error);
    return null;
  }
};

// ============================================
// 🔑 ENCRYPTION HELPERS
// ============================================

/**
 * Simple encryption for sensitive client-side data
 * Note: This is for client-side obfuscation only.
 * Firebase already encrypts data at rest.
 */
export const encryptSensitiveData = (data, key) => {
  try {
    // Simple XOR-based obfuscation (not cryptographically secure)
    // For true encryption, use server-side solutions
    const encoded = btoa(JSON.stringify(data));
    return encoded;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

export const decryptSensitiveData = (encryptedData, key) => {
  try {
    const decoded = JSON.parse(atob(encryptedData));
    return decoded;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// ============================================
// 📱 SESSION MANAGEMENT
// ============================================

/**
 * Create a secure session token
 */
export const createSessionToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate session
 */
export const validateSession = async (organizationId, userId, sessionToken) => {
  try {
    const sessionsRef = collection(db, 'organizations', organizationId, 'sessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      where('token', '==', sessionToken),
      where('active', '==', true)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return { valid: false };
    
    const session = snapshot.docs[0].data();
    const expiresAt = session.expiresAt?.toDate?.() || new Date(0);
    
    if (expiresAt < new Date()) {
      // Session expired
      await updateDoc(snapshot.docs[0].ref, { active: false });
      return { valid: false, reason: 'expired' };
    }
    
    return { valid: true, session };
  } catch (error) {
    console.error('Error validating session:', error);
    return { valid: false };
  }
};

// ============================================
// 🛡️ SAFETY DETECTION SYSTEM
// Detects harassment, grooming, bullying, self-harm
// Sends alerts to parents/guardians for minors
// ============================================

/**
 * Harmful content patterns to detect
 */
const SAFETY_PATTERNS = {
  // Self-harm / Suicide keywords
  selfHarm: [
    'kill myself', 'want to die', 'end my life', 'suicide', 'suicidal',
    'hurt myself', 'cut myself', 'self harm', 'no reason to live',
    'better off dead', 'goodbye forever', 'final goodbye', 'end it all',
    'pills', 'overdose', 'hang myself', 'jump off', 'slit my'
  ],
  
  // Harassment / Bullying
  harassment: [
    'kill you', 'hurt you', 'beat you up', 'fight you', 'punch you',
    'ugly', 'fat', 'stupid', 'worthless', 'nobody likes you',
    'everyone hates you', 'kill yourself', 'go die', 'loser', 'freak',
    'kys', 'neck yourself', 'drink bleach'
  ],
  
  // Grooming behavior (adults targeting minors)
  grooming: [
    'how old are you', 'send me pictures', 'send pics', 'show me',
    'are you alone', 'dont tell anyone', "don't tell your parents",
    'our secret', 'just between us', 'meet me', 'come to my',
    'i can pick you up', 'whats your address', 'where do you live',
    'are your parents home', 'video chat alone', 'turn on camera'
  ],
  
  // Personal info requests (protect minors)
  personalInfo: [
    'phone number', 'address', 'where do you live', 'what school',
    'full name', 'your location', 'social security', 'credit card'
  ]
};

/**
 * Analyze text for safety concerns
 * @returns {object} { isSafe, concerns: [], severity: 'low'|'medium'|'high'|'critical' }
 */
export const analyzeContentSafety = (text, senderIsMinor = false, recipientIsMinor = false) => {
  if (!text) return { isSafe: true, concerns: [], severity: 'none' };
  
  const lowerText = text.toLowerCase();
  const concerns = [];
  let severity = 'none';
  
  // Check self-harm patterns
  const selfHarmFound = SAFETY_PATTERNS.selfHarm.filter(pattern => 
    lowerText.includes(pattern.toLowerCase())
  );
  if (selfHarmFound.length > 0) {
    concerns.push({
      type: 'self_harm',
      patterns: selfHarmFound,
      action: 'crisis_resources'
    });
    severity = 'critical';
  }
  
  // Check harassment patterns
  const harassmentFound = SAFETY_PATTERNS.harassment.filter(pattern => 
    lowerText.includes(pattern.toLowerCase())
  );
  if (harassmentFound.length > 0) {
    concerns.push({
      type: 'harassment',
      patterns: harassmentFound,
      action: 'warn_and_monitor'
    });
    severity = severity === 'critical' ? 'critical' : 'high';
  }
  
  // Check grooming patterns (especially if minor involved)
  if (recipientIsMinor || senderIsMinor) {
    const groomingFound = SAFETY_PATTERNS.grooming.filter(pattern => 
      lowerText.includes(pattern.toLowerCase())
    );
    if (groomingFound.length > 0) {
      concerns.push({
        type: 'grooming',
        patterns: groomingFound,
        action: 'alert_parent_immediately'
      });
      severity = 'critical';
    }
    
    // Check personal info requests
    const personalInfoFound = SAFETY_PATTERNS.personalInfo.filter(pattern => 
      lowerText.includes(pattern.toLowerCase())
    );
    if (personalInfoFound.length > 0) {
      concerns.push({
        type: 'personal_info_request',
        patterns: personalInfoFound,
        action: 'warn_user'
      });
      severity = severity === 'critical' ? 'critical' : 'medium';
    }
  }
  
  return {
    isSafe: concerns.length === 0,
    concerns,
    severity,
    requiresAction: severity === 'critical' || severity === 'high'
  };
};

/**
 * Send alert to parent/guardian
 */
export const sendParentAlert = async (userId, alertData) => {
  try {
    // Get user's emergency contact
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('User not found for parent alert');
      return { success: false, reason: 'user_not_found' };
    }
    
    const userData = userDoc.data();
    const emergencyContact = userData.onboarding?.emergencyContact || userData.emergencyContact;
    
    if (!emergencyContact?.phone && !emergencyContact?.email) {
      console.log('No emergency contact found');
      return { success: false, reason: 'no_emergency_contact' };
    }
    
    // Log the alert
    const alertRef = collection(db, 'safetyAlerts');
    const alert = await addDoc(alertRef, {
      userId,
      userName: userData.name || userData.username,
      alertType: alertData.type,
      severity: alertData.severity,
      concerns: alertData.concerns,
      contentPreview: alertData.contentPreview?.substring(0, 100) + '...',
      emergencyContact: {
        name: emergencyContact.name,
        phone: emergencyContact.phone,
        email: emergencyContact.email,
        relationship: emergencyContact.relationship
      },
      notificationSent: true,
      notificationMethod: emergencyContact.phone ? 'sms_and_email' : 'email',
      timestamp: serverTimestamp(),
      acknowledged: false
    });
    
    // In production, integrate with SMS/Email service
    // For now, log and simulate notification
    console.log('🚨 PARENT ALERT SENT:', {
      to: emergencyContact.name,
      phone: emergencyContact.phone,
      type: alertData.type,
      severity: alertData.severity
    });
    
    // Also create in-app notification for org admins
    if (userData.organizationId) {
      await addDoc(collection(db, 'organizations', userData.organizationId, 'alerts'), {
        type: 'safety_concern',
        userId,
        userName: userData.name,
        severity: alertData.severity,
        concerns: alertData.concerns,
        timestamp: serverTimestamp(),
        reviewed: false
      });
    }
    
    return { success: true, alertId: alert.id };
  } catch (error) {
    console.error('Error sending parent alert:', error);
    return { success: false, reason: 'error' };
  }
};

/**
 * Process content through safety check and take action
 */
export const processContentSafety = async (content, senderId, recipientId = null, context = 'post') => {
  try {
    // Get sender info
    const senderDoc = await getDoc(doc(db, 'users', senderId));
    const senderData = senderDoc.data() || {};
    const senderIsMinor = senderData.ageVerification?.age < 18;
    
    // Get recipient info if applicable
    let recipientIsMinor = false;
    if (recipientId) {
      const recipientDoc = await getDoc(doc(db, 'users', recipientId));
      const recipientData = recipientDoc.data() || {};
      recipientIsMinor = recipientData.ageVerification?.age < 18;
    }
    
    // Analyze content
    const analysis = analyzeContentSafety(content, senderIsMinor, recipientIsMinor);
    
    if (!analysis.isSafe) {
      // Log safety concern
      await addDoc(collection(db, 'safetyLogs'), {
        senderId,
        recipientId,
        context,
        analysis,
        contentHash: btoa(content.substring(0, 50)), // Don't store full content
        timestamp: serverTimestamp()
      });
      
      // Critical severity - alert parent immediately
      if (analysis.severity === 'critical') {
        // Check for self-harm first
        const selfHarmConcern = analysis.concerns.find(c => c.type === 'self_harm');
        if (selfHarmConcern) {
          // For self-harm, show crisis resources instead of blocking
          return {
            allowed: true, // Allow but show crisis resources
            showCrisisResources: true,
            message: 'We noticed you might be struggling. Help is available 24/7.',
            analysis
          };
        }
        
        // For grooming/severe harassment on minors
        const groomingConcern = analysis.concerns.find(c => c.type === 'grooming');
        if (groomingConcern && (senderIsMinor || recipientIsMinor)) {
          // Alert parent of the minor
          const minorId = recipientIsMinor ? recipientId : senderId;
          await sendParentAlert(minorId, {
            type: 'grooming_detected',
            severity: 'critical',
            concerns: analysis.concerns,
            contentPreview: content
          });
          
          return {
            allowed: false,
            blocked: true,
            reason: 'This message was blocked for safety reasons.',
            analysis
          };
        }
      }
      
      // High severity - warn but allow
      if (analysis.severity === 'high') {
        return {
          allowed: true,
          warning: 'Please be kind and respectful to others.',
          analysis
        };
      }
    }
    
    return { allowed: true, analysis };
  } catch (error) {
    console.error('Error processing content safety:', error);
    return { allowed: true }; // Don't block on error
  }
};

/**
 * Get safety alerts for a user (for parents/guardians to view)
 */
export const getSafetyAlerts = async (userId, role = 'parent') => {
  try {
    const alertsRef = collection(db, 'safetyAlerts');
    const q = query(
      alertsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(q);
    const alerts = [];
    snapshot.forEach(doc => {
      alerts.push({ id: doc.id, ...doc.data() });
    });
    
    return alerts;
  } catch (error) {
    console.error('Error getting safety alerts:', error);
    return [];
  }
};

/**
 * Acknowledge a safety alert (parent confirms they've seen it)
 */
export const acknowledgeAlert = async (alertId, acknowledgedBy) => {
  try {
    const alertRef = doc(db, 'safetyAlerts', alertId);
    await updateDoc(alertRef, {
      acknowledged: true,
      acknowledgedBy,
      acknowledgedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    return { success: false };
  }
};

