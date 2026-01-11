// FILE: src/services/progressSharingService.js
// 📊 Member Progress Sharing System
// Allow members to share their wellness data with therapists

import { db } from '../firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit 
} from 'firebase/firestore';
import { logAuditEvent, AUDIT_ACTIONS } from './auditService';

// ============================================
// 🔐 SHARING PERMISSIONS
// ============================================

export const SHARING_LEVELS = {
  NONE: 'none',               // No sharing
  SUMMARY_ONLY: 'summary',    // Only aggregated stats
  MOODS: 'moods',             // Mood history
  JOURNAL: 'journal',         // Journal entries (most sensitive)
  FULL: 'full'                // Everything
};

export const SHAREABLE_DATA = {
  moodHistory: 'Mood Check-ins',
  journalEntries: 'Journal Entries',
  moodTrends: 'Mood Trends & Analytics',
  activityStats: 'Activity Statistics',
  groupParticipation: 'Support Group Activity',
  achievements: 'Achievements & Progress'
};

// ============================================
// 📝 SHARING CONSENT MANAGEMENT
// ============================================

// Create or update sharing consent
export const updateSharingConsent = async (memberId, therapistId, consent) => {
  const {
    organizationId,
    sharingLevel,
    sharedData = [],    // Array of SHAREABLE_DATA keys
    expiresAt = null,   // Optional expiration date
    notes = ''
  } = consent;

  const consentData = {
    memberId,
    therapistId,
    organizationId,
    sharingLevel,
    sharedData,
    expiresAt,
    notes,
    grantedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: sharingLevel !== SHARING_LEVELS.NONE
  };

  // Store in member's consent subcollection
  await setDoc(
    doc(db, 'users', memberId, 'sharingConsents', therapistId),
    consentData
  );

  // Also store reference in therapist's accessible members
  await setDoc(
    doc(db, 'organizations', organizationId, 'therapistAccess', therapistId, 'members', memberId),
    {
      memberId,
      sharingLevel,
      sharedData,
      grantedAt: consentData.grantedAt,
      expiresAt
    }
  );

  // Log audit event
  await logAuditEvent(organizationId, {
    action: 'sharing_consent_updated',
    actorId: memberId,
    actorName: 'Member',
    actorRole: 'member',
    targetType: 'therapist',
    targetId: therapistId,
    details: { sharingLevel, sharedData }
  });

  return { success: true, consent: consentData };
};

// Revoke sharing consent
export const revokeSharingConsent = async (memberId, therapistId, organizationId) => {
  await updateSharingConsent(memberId, therapistId, {
    organizationId,
    sharingLevel: SHARING_LEVELS.NONE,
    sharedData: []
  });

  // Mark as inactive
  await updateDoc(
    doc(db, 'users', memberId, 'sharingConsents', therapistId),
    { isActive: false, revokedAt: new Date().toISOString() }
  );

  return { success: true };
};

// Get member's sharing consents
export const getMemberConsents = async (memberId) => {
  const consentsQuery = query(
    collection(db, 'users', memberId, 'sharingConsents'),
    where('isActive', '==', true)
  );
  
  const snapshot = await getDocs(consentsQuery);
  return snapshot.docs.map(doc => ({ therapistId: doc.id, ...doc.data() }));
};

// Get therapist's accessible members
export const getTherapistAccessibleMembers = async (organizationId, therapistId) => {
  const accessQuery = query(
    collection(db, 'organizations', organizationId, 'therapistAccess', therapistId, 'members')
  );
  
  const snapshot = await getDocs(accessQuery);
  return snapshot.docs.map(doc => ({ memberId: doc.id, ...doc.data() }));
};

// ============================================
// 📊 GET SHARED DATA
// ============================================

// Check if therapist can access specific data
export const canAccessData = async (memberId, therapistId, dataType) => {
  try {
    const consentDoc = await getDoc(
      doc(db, 'users', memberId, 'sharingConsents', therapistId)
    );
    
    if (!consentDoc.exists()) return false;
    
    const consent = consentDoc.data();
    
    // Check if consent is active and not expired
    if (!consent.isActive) return false;
    if (consent.expiresAt && new Date(consent.expiresAt) < new Date()) return false;
    
    // Check sharing level
    if (consent.sharingLevel === SHARING_LEVELS.FULL) return true;
    if (consent.sharingLevel === SHARING_LEVELS.NONE) return false;
    
    // Check specific data permissions
    return consent.sharedData.includes(dataType);
  } catch (error) {
    console.error('Error checking access:', error);
    return false;
  }
};

// Get shared mood data for therapist
export const getSharedMoodData = async (organizationId, therapistId, memberId, days = 30) => {
  // Verify access
  const hasAccess = await canAccessData(memberId, therapistId, 'moodHistory');
  if (!hasAccess) {
    return { success: false, error: 'No access to mood data' };
  }

  // Get member's mood history
  const memberDoc = await getDoc(doc(db, 'users', memberId));
  if (!memberDoc.exists()) {
    return { success: false, error: 'Member not found' };
  }

  const memberData = memberDoc.data();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const moodHistory = (memberData.moodHistory || [])
    .filter(m => new Date(m.timestamp || m.date) >= startDate)
    .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));

  // Log access
  await logAuditEvent(organizationId, {
    action: AUDIT_ACTIONS.VIEW_MEMBER_MOOD,
    actorId: therapistId,
    actorRole: 'therapist',
    targetType: 'member',
    targetId: memberId,
    targetName: memberData.name || memberData.username
  });

  return {
    success: true,
    data: {
      moodHistory,
      summary: calculateMoodSummary(moodHistory)
    }
  };
};

// Get shared journal entries for therapist
export const getSharedJournalEntries = async (organizationId, therapistId, memberId, limitCount = 20) => {
  // Verify access
  const hasAccess = await canAccessData(memberId, therapistId, 'journalEntries');
  if (!hasAccess) {
    return { success: false, error: 'No access to journal data' };
  }

  const memberDoc = await getDoc(doc(db, 'users', memberId));
  if (!memberDoc.exists()) {
    return { success: false, error: 'Member not found' };
  }

  const memberData = memberDoc.data();
  const journalEntries = (memberData.journalEntries || [])
    .sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date))
    .slice(0, limitCount);

  // Log access
  await logAuditEvent(organizationId, {
    action: AUDIT_ACTIONS.VIEW_MEMBER_JOURNAL,
    actorId: therapistId,
    actorRole: 'therapist',
    targetType: 'member',
    targetId: memberId,
    targetName: memberData.name || memberData.username
  });

  return {
    success: true,
    data: { journalEntries }
  };
};

// Get full shared progress report
export const getSharedProgressReport = async (organizationId, therapistId, memberId) => {
  const consentDoc = await getDoc(
    doc(db, 'users', memberId, 'sharingConsents', therapistId)
  );
  
  if (!consentDoc.exists() || !consentDoc.data().isActive) {
    return { success: false, error: 'No active sharing consent' };
  }

  const consent = consentDoc.data();
  const memberDoc = await getDoc(doc(db, 'users', memberId));
  const memberData = memberDoc.data();

  const report = {
    memberId,
    memberName: memberData.name || memberData.username,
    generatedAt: new Date().toISOString(),
    sharingLevel: consent.sharingLevel,
    sections: {}
  };

  // Add sections based on consent
  if (consent.sharedData.includes('moodHistory') || consent.sharingLevel === SHARING_LEVELS.FULL) {
    const moodData = await getSharedMoodData(organizationId, therapistId, memberId, 30);
    if (moodData.success) {
      report.sections.mood = moodData.data;
    }
  }

  if (consent.sharedData.includes('activityStats') || consent.sharingLevel === SHARING_LEVELS.FULL) {
    report.sections.activity = {
      daysActive: memberData.stats?.daysActive || 0,
      postsCreated: memberData.stats?.postsCreated || 0,
      supportGiven: memberData.stats?.supportGiven || 0,
      lastActive: memberData.lastActive || memberData.updatedAt
    };
  }

  if (consent.sharedData.includes('achievements') || consent.sharingLevel === SHARING_LEVELS.FULL) {
    report.sections.achievements = memberData.achievements || [];
  }

  // Log access
  await logAuditEvent(organizationId, {
    action: AUDIT_ACTIONS.VIEW_MEMBER_PROFILE,
    actorId: therapistId,
    actorRole: 'therapist',
    targetType: 'member',
    targetId: memberId,
    targetName: memberData.name || memberData.username,
    details: { reportType: 'progress_report' }
  });

  return { success: true, report };
};

// ============================================
// 📈 MOOD ANALYTICS HELPERS
// ============================================

const calculateMoodSummary = (moodHistory) => {
  if (moodHistory.length === 0) {
    return { avgScore: 0, trend: 'stable', distribution: {} };
  }

  const moodScores = {
    'happy': 9, '😊': 9, 'loved': 8, '🥰': 8, 'calm': 7, '😌': 7,
    'neutral': 5, '😐': 5, 'tired': 4, '😴': 4,
    'anxious': 3, '😰': 3, 'sad': 2, '😢': 2, 'angry': 2, '😡': 2
  };

  const scores = moodHistory.map(m => {
    const mood = (m.mood || m.label || m.emoji || '').toLowerCase();
    return moodScores[mood] || 5;
  });

  const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

  // Calculate trend (compare first half vs second half)
  const mid = Math.floor(scores.length / 2);
  const firstHalf = scores.slice(mid);
  const secondHalf = scores.slice(0, mid);
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.length > 0 
    ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length 
    : firstAvg;

  let trend = 'stable';
  if (secondAvg > firstAvg + 1) trend = 'improving';
  else if (secondAvg < firstAvg - 1) trend = 'declining';

  // Distribution
  const distribution = moodHistory.reduce((acc, m) => {
    const mood = m.mood || m.label || m.emoji || 'unknown';
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});

  return {
    avgScore: parseFloat(avgScore),
    trend,
    distribution,
    totalCheckIns: moodHistory.length,
    mostFrequentMood: Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown'
  };
};

// ============================================
// 🔔 SHARING REQUEST SYSTEM
// ============================================

// Therapist requests access from member
export const requestDataAccess = async (organizationId, therapistId, therapistName, memberId, requestedData) => {
  const requestData = {
    therapistId,
    therapistName,
    memberId,
    requestedData,
    status: 'pending',
    requestedAt: new Date().toISOString()
  };

  await setDoc(
    doc(db, 'users', memberId, 'accessRequests', therapistId),
    requestData
  );

  // TODO: Send notification to member
  // Could trigger a push notification or email

  return { success: true, request: requestData };
};

// Member responds to access request
export const respondToAccessRequest = async (memberId, therapistId, approved, sharingLevel = null, sharedData = []) => {
  const requestDoc = await getDoc(doc(db, 'users', memberId, 'accessRequests', therapistId));
  
  if (!requestDoc.exists()) {
    return { success: false, error: 'Request not found' };
  }

  const request = requestDoc.data();

  if (approved) {
    // Grant access
    await updateSharingConsent(memberId, therapistId, {
      organizationId: request.organizationId,
      sharingLevel: sharingLevel || SHARING_LEVELS.MOODS,
      sharedData: sharedData.length > 0 ? sharedData : request.requestedData
    });
  }

  // Update request status
  await updateDoc(
    doc(db, 'users', memberId, 'accessRequests', therapistId),
    { 
      status: approved ? 'approved' : 'denied',
      respondedAt: new Date().toISOString()
    }
  );

  return { success: true, approved };
};

// Get pending access requests for member
export const getPendingAccessRequests = async (memberId) => {
  const requestsQuery = query(
    collection(db, 'users', memberId, 'accessRequests'),
    where('status', '==', 'pending')
  );
  
  const snapshot = await getDocs(requestsQuery);
  return snapshot.docs.map(doc => ({ therapistId: doc.id, ...doc.data() }));
};

export default {
  SHARING_LEVELS,
  SHAREABLE_DATA,
  updateSharingConsent,
  revokeSharingConsent,
  getMemberConsents,
  getTherapistAccessibleMembers,
  canAccessData,
  getSharedMoodData,
  getSharedJournalEntries,
  getSharedProgressReport,
  requestDataAccess,
  respondToAccessRequest,
  getPendingAccessRequests
};
