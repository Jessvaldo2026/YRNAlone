// FILE: src/services/guardianService.js
// 👨‍👩‍👧 GUARDIAN PORTAL SERVICE
// Manages parent/guardian accounts and child linking for COPPA compliance

import { db } from '../firebase';
import {
  collection, addDoc, getDoc, getDocs, doc, updateDoc,
  deleteDoc, query, where, orderBy, Timestamp, setDoc
} from 'firebase/firestore';

// ============================================
// 📋 CONSTANTS
// ============================================

export const GUARDIAN_PERMISSIONS = {
  VIEW_MOOD_TRENDS: 'view_mood_trends',      // Can see mood averages/trends
  VIEW_APP_USAGE: 'view_app_usage',          // Can see time spent, features used
  RECEIVE_CRISIS_ALERTS: 'receive_crisis_alerts', // Immediate notification for crisis
  APPROVE_GROUPS: 'approve_groups',          // Approve which groups child joins
  VIEW_ACHIEVEMENTS: 'view_achievements'     // Can see badges/progress
};

// What parents can NEVER see (privacy protected)
export const PROTECTED_DATA = [
  'journal_entries',
  'private_messages',
  'group_chat_content',
  'buddy_conversations',
  'detailed_mood_notes'
];

export const LINK_STATUS = {
  PENDING: 'pending',      // Awaiting child approval
  ACTIVE: 'active',        // Link is active
  REVOKED: 'revoked',      // Child or parent revoked
  EXPIRED: 'expired'       // Link request expired
};

export const ACCOUNT_TYPES = {
  CHILD: 'child',          // Regular user under 18
  PARENT: 'parent',        // Parent/guardian account
  ADULT: 'adult'           // Regular user 18+
};

// ============================================
// 🎂 AGE VERIFICATION
// ============================================

export const calculateAge = (birthday) => {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export const getAccountTypeByAge = (birthday) => {
  const age = calculateAge(birthday);

  if (age < 13) {
    return { type: ACCOUNT_TYPES.CHILD, requiresParent: true, age };
  } else if (age < 18) {
    return { type: ACCOUNT_TYPES.CHILD, requiresParent: false, age };
  } else {
    return { type: ACCOUNT_TYPES.ADULT, requiresParent: false, age };
  }
};

export const isMinor = (birthday) => {
  return calculateAge(birthday) < 18;
};

export const requiresParentalConsent = (birthday) => {
  return calculateAge(birthday) < 13;
};

// ============================================
// 👨‍👩‍👧 GUARDIAN LINK MANAGEMENT
// ============================================

// Create a guardian link request (parent initiates)
export const createGuardianLinkRequest = async (parentId, childEmail) => {
  try {
    // Find child by email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', childEmail.toLowerCase())
    );
    const snapshot = await getDocs(usersQuery);

    if (snapshot.empty) {
      return { success: false, error: 'No account found with that email' };
    }

    const childDoc = snapshot.docs[0];
    const childData = childDoc.data();
    const childId = childDoc.id;

    // Check if child account exists and is a minor
    if (!childData.birthday || !isMinor(childData.birthday)) {
      return { success: false, error: 'This account is not eligible for guardian linking' };
    }

    // Check for existing active link
    const existingQuery = query(
      collection(db, 'guardianLinks'),
      where('childId', '==', childId),
      where('parentId', '==', parentId),
      where('status', 'in', [LINK_STATUS.PENDING, LINK_STATUS.ACTIVE])
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      return { success: false, error: 'A link request already exists for this account' };
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Create link request
    const linkData = {
      parentId,
      childId,
      childEmail: childData.email,
      childName: childData.name || childData.username,
      status: LINK_STATUS.PENDING,
      verificationCode,
      permissions: Object.values(GUARDIAN_PERMISSIONS), // All permissions by default
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      lastUpdated: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'guardianLinks'), linkData);

    // Notify child of pending request
    await createChildNotification(childId, {
      type: 'guardian_request',
      title: 'Guardian Link Request',
      message: 'A parent/guardian wants to link to your account',
      linkId: docRef.id,
      parentId
    });

    return {
      success: true,
      linkId: docRef.id,
      verificationCode,
      message: 'Link request sent! The child will need to approve it.'
    };
  } catch (error) {
    console.error('Error creating guardian link:', error);
    return { success: false, error: error.message };
  }
};

// Child approves guardian link
export const approveGuardianLink = async (linkId, childId, verificationCode) => {
  try {
    const linkDoc = await getDoc(doc(db, 'guardianLinks', linkId));

    if (!linkDoc.exists()) {
      return { success: false, error: 'Link request not found' };
    }

    const linkData = linkDoc.data();

    if (linkData.childId !== childId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (linkData.status !== LINK_STATUS.PENDING) {
      return { success: false, error: 'This request has already been processed' };
    }

    if (linkData.verificationCode !== verificationCode) {
      return { success: false, error: 'Invalid verification code' };
    }

    if (new Date(linkData.expiresAt) < new Date()) {
      await updateDoc(doc(db, 'guardianLinks', linkId), {
        status: LINK_STATUS.EXPIRED
      });
      return { success: false, error: 'This request has expired' };
    }

    // Activate the link
    await updateDoc(doc(db, 'guardianLinks', linkId), {
      status: LINK_STATUS.ACTIVE,
      approvedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });

    // Notify parent
    await createParentNotification(linkData.parentId, {
      type: 'link_approved',
      title: 'Guardian Link Approved',
      message: `${linkData.childName} has approved your guardian link`,
      childId,
      linkId
    });

    return { success: true, message: 'Guardian link approved!' };
  } catch (error) {
    console.error('Error approving guardian link:', error);
    return { success: false, error: error.message };
  }
};

// Deny guardian link request
export const denyGuardianLink = async (linkId, childId, reason = '') => {
  try {
    const linkDoc = await getDoc(doc(db, 'guardianLinks', linkId));

    if (!linkDoc.exists()) {
      return { success: false, error: 'Link request not found' };
    }

    const linkData = linkDoc.data();

    if (linkData.childId !== childId) {
      return { success: false, error: 'Unauthorized' };
    }

    await updateDoc(doc(db, 'guardianLinks', linkId), {
      status: LINK_STATUS.REVOKED,
      revokedBy: 'child',
      revokedReason: reason,
      revokedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });

    // Notify parent
    await createParentNotification(linkData.parentId, {
      type: 'link_denied',
      title: 'Guardian Link Denied',
      message: 'Your guardian link request was not approved',
      childId,
      linkId
    });

    return { success: true };
  } catch (error) {
    console.error('Error denying guardian link:', error);
    return { success: false, error: error.message };
  }
};

// Revoke an active guardian link
export const revokeGuardianLink = async (linkId, revokedBy, reason = '') => {
  try {
    const linkDoc = await getDoc(doc(db, 'guardianLinks', linkId));

    if (!linkDoc.exists()) {
      return { success: false, error: 'Link not found' };
    }

    const linkData = linkDoc.data();

    await updateDoc(doc(db, 'guardianLinks', linkId), {
      status: LINK_STATUS.REVOKED,
      revokedBy,
      revokedReason: reason,
      revokedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });

    // Notify the other party
    if (revokedBy === 'child') {
      await createParentNotification(linkData.parentId, {
        type: 'link_revoked',
        title: 'Guardian Link Revoked',
        message: `${linkData.childName} has revoked the guardian link`,
        childId: linkData.childId,
        linkId
      });
    } else {
      await createChildNotification(linkData.childId, {
        type: 'link_revoked',
        title: 'Guardian Link Revoked',
        message: 'Your parent/guardian has revoked their link to your account',
        parentId: linkData.parentId,
        linkId
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error revoking guardian link:', error);
    return { success: false, error: error.message };
  }
};

// Get all guardian links for a user (as parent or child)
export const getGuardianLinks = async (userId, role = 'both') => {
  try {
    const links = [];

    if (role === 'parent' || role === 'both') {
      const parentQuery = query(
        collection(db, 'guardianLinks'),
        where('parentId', '==', userId),
        where('status', 'in', [LINK_STATUS.PENDING, LINK_STATUS.ACTIVE])
      );
      const parentSnapshot = await getDocs(parentQuery);
      parentSnapshot.forEach(doc => {
        links.push({ id: doc.id, ...doc.data(), role: 'parent' });
      });
    }

    if (role === 'child' || role === 'both') {
      const childQuery = query(
        collection(db, 'guardianLinks'),
        where('childId', '==', userId),
        where('status', 'in', [LINK_STATUS.PENDING, LINK_STATUS.ACTIVE])
      );
      const childSnapshot = await getDocs(childQuery);
      childSnapshot.forEach(doc => {
        links.push({ id: doc.id, ...doc.data(), role: 'child' });
      });
    }

    return links;
  } catch (error) {
    console.error('Error getting guardian links:', error);
    return [];
  }
};

// Update guardian link permissions
export const updateLinkPermissions = async (linkId, parentId, permissions) => {
  try {
    const linkDoc = await getDoc(doc(db, 'guardianLinks', linkId));

    if (!linkDoc.exists()) {
      return { success: false, error: 'Link not found' };
    }

    const linkData = linkDoc.data();

    if (linkData.parentId !== parentId) {
      return { success: false, error: 'Unauthorized' };
    }

    await updateDoc(doc(db, 'guardianLinks', linkId), {
      permissions,
      lastUpdated: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating permissions:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// 👀 PARENT DASHBOARD DATA
// ============================================

// Get limited child data for parent dashboard
export const getChildDataForParent = async (parentId, childId, linkId) => {
  try {
    // Verify active link
    const linkDoc = await getDoc(doc(db, 'guardianLinks', linkId));

    if (!linkDoc.exists()) {
      return { success: false, error: 'Link not found' };
    }

    const linkData = linkDoc.data();

    if (linkData.parentId !== parentId || linkData.childId !== childId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (linkData.status !== LINK_STATUS.ACTIVE) {
      return { success: false, error: 'Link is not active' };
    }

    // Get child profile
    const childDoc = await getDoc(doc(db, 'users', childId));
    if (!childDoc.exists()) {
      return { success: false, error: 'Child account not found' };
    }

    const childData = childDoc.data();
    const permissions = linkData.permissions || [];
    const result = {
      name: childData.name || childData.username,
      lastActive: childData.lastActive,
      memberSince: childData.createdAt
    };

    // Only include data based on permissions
    if (permissions.includes(GUARDIAN_PERMISSIONS.VIEW_MOOD_TRENDS)) {
      result.moodTrends = await getChildMoodTrends(childId);
    }

    if (permissions.includes(GUARDIAN_PERMISSIONS.VIEW_APP_USAGE)) {
      result.appUsage = await getChildAppUsage(childId);
    }

    if (permissions.includes(GUARDIAN_PERMISSIONS.VIEW_ACHIEVEMENTS)) {
      result.achievements = childData.achievements || [];
      result.streak = childData.streak || 0;
      result.stats = childData.stats || {};
    }

    // Log this access for child transparency
    await logParentAccess(parentId, childId, linkId, Object.keys(result));

    // Notify child that parent viewed their data
    await createChildNotification(childId, {
      type: 'parent_viewed_data',
      title: 'Data Viewed',
      message: 'Your parent/guardian viewed your dashboard data',
      parentId,
      viewedAt: new Date().toISOString()
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting child data:', error);
    return { success: false, error: error.message };
  }
};

// Get mood trends (averages, not individual entries)
const getChildMoodTrends = async (childId) => {
  try {
    const moodsQuery = query(
      collection(db, 'users', childId, 'moods'),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(moodsQuery);

    if (snapshot.empty) {
      return { hasData: false };
    }

    const moods = snapshot.docs.map(doc => doc.data());
    const last7Days = moods.filter(m => {
      const date = new Date(m.timestamp);
      return date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    });

    const last30Days = moods.filter(m => {
      const date = new Date(m.timestamp);
      return date > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    });

    // Calculate averages (no individual entries shared)
    const avgScore = (entries) => {
      if (entries.length === 0) return null;
      const total = entries.reduce((sum, e) => sum + (e.score || 5), 0);
      return Math.round((total / entries.length) * 10) / 10;
    };

    return {
      hasData: true,
      weeklyAverage: avgScore(last7Days),
      monthlyAverage: avgScore(last30Days),
      weeklyCheckIns: last7Days.length,
      monthlyCheckIns: last30Days.length,
      trend: last7Days.length >= 2
        ? (avgScore(last7Days.slice(0, 3)) >= avgScore(last7Days.slice(-3)) ? 'improving' : 'declining')
        : 'stable',
      lastCheckIn: moods[0]?.timestamp || null
    };
  } catch (error) {
    console.error('Error getting mood trends:', error);
    return { hasData: false, error: error.message };
  }
};

// Get app usage stats
const getChildAppUsage = async (childId) => {
  try {
    const childDoc = await getDoc(doc(db, 'users', childId));
    const childData = childDoc.data();

    return {
      daysActive: childData.stats?.daysActive || 0,
      currentStreak: childData.streak || 0,
      longestStreak: childData.longestStreak || 0,
      journalEntriesCount: childData.stats?.journalEntries || 0,
      groupsJoined: childData.stats?.groupsJoined || 0,
      lastActive: childData.lastActive || childData.lastActivityDate || null,
      toolsUsedCount: childData.stats?.toolsUsed || 0
    };
  } catch (error) {
    console.error('Error getting app usage:', error);
    return {};
  }
};

// Log parent access for transparency
const logParentAccess = async (parentId, childId, linkId, dataViewed) => {
  try {
    await addDoc(collection(db, 'parentAccessLog'), {
      parentId,
      childId,
      linkId,
      dataViewed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error logging parent access:', error);
  }
};

// ============================================
// 🚨 CRISIS ALERTS FOR PARENTS
// ============================================

// Send crisis alert to parent
export const sendCrisisAlertToParent = async (childId, alertType, details = {}) => {
  try {
    // Get active guardian links for this child
    const linksQuery = query(
      collection(db, 'guardianLinks'),
      where('childId', '==', childId),
      where('status', '==', LINK_STATUS.ACTIVE)
    );
    const linksSnapshot = await getDocs(linksQuery);

    const alerts = [];

    for (const linkDoc of linksSnapshot.docs) {
      const linkData = linkDoc.data();

      // Only send if parent has crisis alert permission
      if (linkData.permissions?.includes(GUARDIAN_PERMISSIONS.RECEIVE_CRISIS_ALERTS)) {
        const alertId = await createParentNotification(linkData.parentId, {
          type: 'crisis_alert',
          priority: 'high',
          title: 'Urgent: Crisis Alert',
          message: `Your child may need support. Please check in with them.`,
          childId,
          alertType,
          details: {
            timestamp: new Date().toISOString(),
            ...details
          },
          linkId: linkDoc.id
        });

        alerts.push({ parentId: linkData.parentId, alertId });
      }
    }

    return { success: true, alertsSent: alerts.length };
  } catch (error) {
    console.error('Error sending crisis alert:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// 🔔 NOTIFICATIONS
// ============================================

// Create notification for child
const createChildNotification = async (childId, notification) => {
  try {
    await addDoc(collection(db, 'users', childId, 'guardianNotifications'), {
      ...notification,
      read: false,
      createdAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating child notification:', error);
    return { success: false };
  }
};

// Create notification for parent
const createParentNotification = async (parentId, notification) => {
  try {
    const docRef = await addDoc(collection(db, 'parentNotifications'), {
      parentId,
      ...notification,
      read: false,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating parent notification:', error);
    return null;
  }
};

// Get notifications for parent
export const getParentNotifications = async (parentId, limit = 50) => {
  try {
    const notifQuery = query(
      collection(db, 'parentNotifications'),
      where('parentId', '==', parentId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(notifQuery);

    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting parent notifications:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationRead = async (collectionPath, notificationId) => {
  try {
    await updateDoc(doc(db, collectionPath, notificationId), {
      read: true,
      readAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking notification read:', error);
    return { success: false };
  }
};

// Get guardian notifications for child
export const getChildGuardianNotifications = async (childId, limit = 50) => {
  try {
    const notifQuery = query(
      collection(db, 'users', childId, 'guardianNotifications'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(notifQuery);

    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting child notifications:', error);
    return [];
  }
};

// ============================================
// 🆘 COPPA CONSENT MANAGEMENT
// ============================================

// For users under 13, parent must create account
export const createChildAccountWithParent = async (parentId, childData) => {
  try {
    // Verify parent account exists and is a parent type
    const parentDoc = await getDoc(doc(db, 'users', parentId));
    if (!parentDoc.exists() || parentDoc.data().accountType !== ACCOUNT_TYPES.PARENT) {
      return { success: false, error: 'Invalid parent account' };
    }

    // Verify child age requires parent
    const ageInfo = getAccountTypeByAge(childData.birthday);
    if (!ageInfo.requiresParent) {
      return { success: false, error: 'This age does not require parental consent' };
    }

    // Create child profile (auth user should already exist)
    const childProfile = {
      ...childData,
      accountType: ACCOUNT_TYPES.CHILD,
      parentCreated: true,
      parentId,
      coppaConsentAt: new Date().toISOString(),
      coppaConsentBy: parentId,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', childData.uid), childProfile);

    // Auto-create guardian link
    const linkData = {
      parentId,
      childId: childData.uid,
      childEmail: childData.email,
      childName: childData.name,
      status: LINK_STATUS.ACTIVE,
      permissions: Object.values(GUARDIAN_PERMISSIONS),
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      coppaRequired: true,
      lastUpdated: new Date().toISOString()
    };

    await addDoc(collection(db, 'guardianLinks'), linkData);

    return { success: true, message: 'Child account created with parental consent' };
  } catch (error) {
    console.error('Error creating child account:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// 🔧 UTILITIES
// ============================================

// Generate 6-character verification code
const generateVerificationCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Check if user has active parent link
export const hasActiveParentLink = async (childId) => {
  try {
    const linksQuery = query(
      collection(db, 'guardianLinks'),
      where('childId', '==', childId),
      where('status', '==', LINK_STATUS.ACTIVE)
    );
    const snapshot = await getDocs(linksQuery);
    return !snapshot.empty;
  } catch (error) {
    return false;
  }
};

// Get parent access log for child transparency
export const getParentAccessLog = async (childId, limit = 20) => {
  try {
    const logQuery = query(
      collection(db, 'parentAccessLog'),
      where('childId', '==', childId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(logQuery);

    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting access log:', error);
    return [];
  }
};

export default {
  // Constants
  GUARDIAN_PERMISSIONS,
  PROTECTED_DATA,
  LINK_STATUS,
  ACCOUNT_TYPES,

  // Age verification
  calculateAge,
  getAccountTypeByAge,
  isMinor,
  requiresParentalConsent,

  // Link management
  createGuardianLinkRequest,
  approveGuardianLink,
  denyGuardianLink,
  revokeGuardianLink,
  getGuardianLinks,
  updateLinkPermissions,
  hasActiveParentLink,

  // Parent dashboard
  getChildDataForParent,

  // Crisis alerts
  sendCrisisAlertToParent,

  // Notifications
  getParentNotifications,
  getChildGuardianNotifications,
  markNotificationRead,

  // COPPA
  createChildAccountWithParent,

  // Transparency
  getParentAccessLog
};
