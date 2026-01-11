// FILE: src/services/accountManagementService.js
// 🔒 ACCOUNT LOCK/SUSPEND SERVICE
// Admin functionality to manage user accounts (lock, suspend, ban)

import { db } from '../firebase';
import {
  collection, addDoc, getDoc, getDocs, doc, updateDoc,
  query, where, orderBy, limit as firestoreLimit, Timestamp
} from 'firebase/firestore';

// ============================================
// 📋 ACCOUNT STATUS CONSTANTS
// ============================================

export const ACCOUNT_STATUS = {
  ACTIVE: 'active',           // Normal active account
  LOCKED: 'locked',           // Temporary lock (user can request unlock)
  SUSPENDED: 'suspended',     // Time-based suspension
  BANNED: 'banned'            // Permanent ban
};

export const STATUS_REASONS = {
  TERMS_VIOLATION: 'terms_violation',
  HARASSMENT: 'harassment',
  SPAM: 'spam',
  INAPPROPRIATE_CONTENT: 'inappropriate_content',
  UNDERAGE: 'underage',
  FRAUD: 'fraud',
  SECURITY_CONCERN: 'security_concern',
  USER_REQUEST: 'user_request',
  ADMIN_ACTION: 'admin_action',
  OTHER: 'other'
};

export const REASON_LABELS = {
  terms_violation: 'Terms of Service Violation',
  harassment: 'Harassment or Bullying',
  spam: 'Spam or Abuse',
  inappropriate_content: 'Inappropriate Content',
  underage: 'Underage Account (COPPA)',
  fraud: 'Fraudulent Activity',
  security_concern: 'Security Concern',
  user_request: 'User Requested',
  admin_action: 'Administrative Action',
  other: 'Other'
};

// ============================================
// 🔐 ACCOUNT STATUS MANAGEMENT
// ============================================

// Lock an account (temporary, no end date)
export const lockAccount = async (userId, adminId, reason, details = '') => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    const previousStatus = userData.accountStatus || ACCOUNT_STATUS.ACTIVE;

    await updateDoc(doc(db, 'users', userId), {
      accountStatus: ACCOUNT_STATUS.LOCKED,
      statusReason: reason,
      statusDetails: details,
      statusChangedAt: new Date().toISOString(),
      statusChangedBy: adminId,
      previousStatus
    });

    // Log the action
    await logAccountAction({
      action: 'lock',
      userId,
      adminId,
      reason,
      details,
      previousStatus,
      newStatus: ACCOUNT_STATUS.LOCKED
    });

    return { success: true, message: 'Account locked successfully' };
  } catch (error) {
    console.error('Error locking account:', error);
    return { success: false, error: error.message };
  }
};

// Suspend an account (with end date)
export const suspendAccount = async (userId, adminId, reason, suspendUntil, details = '') => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    const previousStatus = userData.accountStatus || ACCOUNT_STATUS.ACTIVE;

    // Validate suspension date
    const suspendDate = new Date(suspendUntil);
    if (suspendDate <= new Date()) {
      return { success: false, error: 'Suspension end date must be in the future' };
    }

    await updateDoc(doc(db, 'users', userId), {
      accountStatus: ACCOUNT_STATUS.SUSPENDED,
      statusReason: reason,
      statusDetails: details,
      statusChangedAt: new Date().toISOString(),
      statusChangedBy: adminId,
      suspendedUntil: suspendDate.toISOString(),
      previousStatus
    });

    // Log the action
    await logAccountAction({
      action: 'suspend',
      userId,
      adminId,
      reason,
      details,
      previousStatus,
      newStatus: ACCOUNT_STATUS.SUSPENDED,
      suspendedUntil: suspendDate.toISOString()
    });

    return { success: true, message: `Account suspended until ${suspendDate.toLocaleDateString()}` };
  } catch (error) {
    console.error('Error suspending account:', error);
    return { success: false, error: error.message };
  }
};

// Ban an account (permanent)
export const banAccount = async (userId, adminId, reason, details = '') => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    const previousStatus = userData.accountStatus || ACCOUNT_STATUS.ACTIVE;

    await updateDoc(doc(db, 'users', userId), {
      accountStatus: ACCOUNT_STATUS.BANNED,
      statusReason: reason,
      statusDetails: details,
      statusChangedAt: new Date().toISOString(),
      statusChangedBy: adminId,
      bannedAt: new Date().toISOString(),
      previousStatus
    });

    // Log the action
    await logAccountAction({
      action: 'ban',
      userId,
      adminId,
      reason,
      details,
      previousStatus,
      newStatus: ACCOUNT_STATUS.BANNED
    });

    return { success: true, message: 'Account banned permanently' };
  } catch (error) {
    console.error('Error banning account:', error);
    return { success: false, error: error.message };
  }
};

// Unlock/Restore an account
export const unlockAccount = async (userId, adminId, notes = '') => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    const previousStatus = userData.accountStatus;

    if (previousStatus === ACCOUNT_STATUS.ACTIVE) {
      return { success: false, error: 'Account is already active' };
    }

    await updateDoc(doc(db, 'users', userId), {
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      statusReason: null,
      statusDetails: null,
      statusChangedAt: new Date().toISOString(),
      statusChangedBy: adminId,
      suspendedUntil: null,
      restoredAt: new Date().toISOString(),
      restoredBy: adminId,
      restoreNotes: notes,
      previousStatus
    });

    // Log the action
    await logAccountAction({
      action: 'unlock',
      userId,
      adminId,
      notes,
      previousStatus,
      newStatus: ACCOUNT_STATUS.ACTIVE
    });

    return { success: true, message: 'Account restored successfully' };
  } catch (error) {
    console.error('Error unlocking account:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// 📊 CHECK ACCOUNT STATUS
// ============================================

// Check if user can login (returns status info for login screen)
export const checkAccountStatus = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return { canLogin: true, status: ACCOUNT_STATUS.ACTIVE };
    }

    const userData = userDoc.data();
    const status = userData.accountStatus || ACCOUNT_STATUS.ACTIVE;

    // Check if suspension has expired
    if (status === ACCOUNT_STATUS.SUSPENDED && userData.suspendedUntil) {
      const suspendDate = new Date(userData.suspendedUntil);
      if (suspendDate <= new Date()) {
        // Auto-restore expired suspension
        await updateDoc(doc(db, 'users', userId), {
          accountStatus: ACCOUNT_STATUS.ACTIVE,
          statusReason: null,
          suspendedUntil: null,
          autoRestoredAt: new Date().toISOString()
        });
        return { canLogin: true, status: ACCOUNT_STATUS.ACTIVE };
      }
    }

    switch (status) {
      case ACCOUNT_STATUS.ACTIVE:
        return { canLogin: true, status };

      case ACCOUNT_STATUS.LOCKED:
        return {
          canLogin: false,
          status,
          message: 'Your account has been temporarily locked.',
          reason: REASON_LABELS[userData.statusReason] || 'Contact support for more information.',
          canRequestUnlock: true
        };

      case ACCOUNT_STATUS.SUSPENDED:
        const suspendedUntil = new Date(userData.suspendedUntil);
        return {
          canLogin: false,
          status,
          message: 'Your account has been suspended.',
          reason: REASON_LABELS[userData.statusReason] || 'Contact support for more information.',
          suspendedUntil: userData.suspendedUntil,
          daysRemaining: Math.ceil((suspendedUntil - new Date()) / (1000 * 60 * 60 * 24)),
          canRequestReview: true
        };

      case ACCOUNT_STATUS.BANNED:
        return {
          canLogin: false,
          status,
          message: 'Your account has been permanently banned.',
          reason: REASON_LABELS[userData.statusReason] || 'Contact support for more information.',
          canAppeal: true
        };

      default:
        return { canLogin: true, status: ACCOUNT_STATUS.ACTIVE };
    }
  } catch (error) {
    console.error('Error checking account status:', error);
    // Default to allowing login on error to prevent lockouts
    return { canLogin: true, status: ACCOUNT_STATUS.ACTIVE, error: error.message };
  }
};

// Get account status details for admin view
export const getAccountStatusDetails = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();

    return {
      success: true,
      data: {
        accountStatus: userData.accountStatus || ACCOUNT_STATUS.ACTIVE,
        statusReason: userData.statusReason,
        statusDetails: userData.statusDetails,
        statusChangedAt: userData.statusChangedAt,
        statusChangedBy: userData.statusChangedBy,
        suspendedUntil: userData.suspendedUntil,
        previousStatus: userData.previousStatus,
        bannedAt: userData.bannedAt,
        restoredAt: userData.restoredAt,
        restoredBy: userData.restoredBy
      }
    };
  } catch (error) {
    console.error('Error getting account status:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// 📝 AUDIT LOGGING
// ============================================

// Log account management action
const logAccountAction = async (actionData) => {
  try {
    await addDoc(collection(db, 'accountActionLog'), {
      ...actionData,
      timestamp: new Date().toISOString(),
      browserInfo: typeof window !== 'undefined' ? {
        userAgent: navigator.userAgent,
        language: navigator.language
      } : {}
    });
  } catch (error) {
    console.error('Error logging account action:', error);
  }
};

// Get account action history
export const getAccountActionHistory = async (userId, limitCount = 50) => {
  try {
    const logQuery = query(
      collection(db, 'accountActionLog'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limitCount)
    );
    const snapshot = await getDocs(logQuery);

    const actions = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      // Get admin name for display
      if (data.adminId) {
        try {
          const adminDoc = await getDoc(doc(db, 'users', data.adminId));
          if (adminDoc.exists()) {
            data.adminName = adminDoc.data().name || adminDoc.data().username || 'Admin';
          }
        } catch (e) {
          data.adminName = 'Unknown Admin';
        }
      }
      actions.push({ id: docSnap.id, ...data });
    }

    return actions;
  } catch (error) {
    console.error('Error getting action history:', error);
    return [];
  }
};

// Get all account actions by admin (for audit)
export const getAdminActionHistory = async (adminId, limitCount = 100) => {
  try {
    const logQuery = query(
      collection(db, 'accountActionLog'),
      where('adminId', '==', adminId),
      orderBy('timestamp', 'desc'),
      firestoreLimit(limitCount)
    );
    const snapshot = await getDocs(logQuery);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting admin history:', error);
    return [];
  }
};

// ============================================
// 🔍 USER SEARCH & MANAGEMENT
// ============================================

// Search users by email or name
export const searchUsers = async (searchTerm, limitCount = 50) => {
  try {
    // Firestore doesn't support native text search, so we'll do basic prefix matching
    // For production, consider using Algolia or Elasticsearch
    const searchLower = searchTerm.toLowerCase();

    // Get all users and filter client-side (not ideal for large datasets)
    const usersQuery = query(
      collection(db, 'users'),
      firestoreLimit(500) // Limit to prevent loading too many docs
    );
    const snapshot = await getDocs(usersQuery);

    const results = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const email = (data.email || '').toLowerCase();
      const name = (data.name || '').toLowerCase();
      const username = (data.username || '').toLowerCase();

      if (
        email.includes(searchLower) ||
        name.includes(searchLower) ||
        username.includes(searchLower)
      ) {
        results.push({
          id: docSnap.id,
          name: data.name || data.username,
          email: data.email,
          accountStatus: data.accountStatus || ACCOUNT_STATUS.ACTIVE,
          statusReason: data.statusReason,
          suspendedUntil: data.suspendedUntil,
          createdAt: data.createdAt,
          lastActive: data.lastActive || data.lastActivityDate,
          organizationId: data.organizationId
        });
      }
    });

    return results.slice(0, limitCount);
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

// Get users by status
export const getUsersByStatus = async (status, limitCount = 100) => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('accountStatus', '==', status),
      firestoreLimit(limitCount)
    );
    const snapshot = await getDocs(usersQuery);

    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error('Error getting users by status:', error);
    return [];
  }
};

// Get account management summary for admin dashboard
export const getAccountManagementSummary = async () => {
  try {
    // Get counts by status
    const allUsersSnapshot = await getDocs(collection(db, 'users'));

    const summary = {
      total: 0,
      active: 0,
      locked: 0,
      suspended: 0,
      banned: 0
    };

    allUsersSnapshot.forEach(doc => {
      const data = doc.data();
      const status = data.accountStatus || ACCOUNT_STATUS.ACTIVE;
      summary.total++;
      summary[status] = (summary[status] || 0) + 1;
    });

    // Get recent actions
    const recentActionsQuery = query(
      collection(db, 'accountActionLog'),
      orderBy('timestamp', 'desc'),
      firestoreLimit(10)
    );
    const recentActionsSnapshot = await getDocs(recentActionsQuery);
    const recentActions = recentActionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      summary,
      recentActions
    };
  } catch (error) {
    console.error('Error getting management summary:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// 📧 USER APPEAL/UNLOCK REQUESTS
// ============================================

// User submits appeal for banned account
export const submitAccountAppeal = async (userId, email, message) => {
  try {
    await addDoc(collection(db, 'accountAppeals'), {
      userId,
      email,
      message,
      status: 'pending',
      submittedAt: new Date().toISOString()
    });

    return { success: true, message: 'Appeal submitted. We will review your case.' };
  } catch (error) {
    console.error('Error submitting appeal:', error);
    return { success: false, error: error.message };
  }
};

// User requests unlock for locked account
export const requestAccountUnlock = async (userId, email, reason) => {
  try {
    await addDoc(collection(db, 'accountUnlockRequests'), {
      userId,
      email,
      reason,
      status: 'pending',
      submittedAt: new Date().toISOString()
    });

    return { success: true, message: 'Unlock request submitted. We will review it shortly.' };
  } catch (error) {
    console.error('Error requesting unlock:', error);
    return { success: false, error: error.message };
  }
};

// Get pending appeals/requests for admin
export const getPendingAppeals = async () => {
  try {
    const appealsQuery = query(
      collection(db, 'accountAppeals'),
      where('status', '==', 'pending'),
      orderBy('submittedAt', 'desc')
    );
    const snapshot = await getDocs(appealsQuery);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting appeals:', error);
    return [];
  }
};

export const getPendingUnlockRequests = async () => {
  try {
    const requestsQuery = query(
      collection(db, 'accountUnlockRequests'),
      where('status', '==', 'pending'),
      orderBy('submittedAt', 'desc')
    );
    const snapshot = await getDocs(requestsQuery);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting unlock requests:', error);
    return [];
  }
};

// Process appeal/request
export const processAppeal = async (appealId, adminId, approved, notes = '') => {
  try {
    const appealDoc = await getDoc(doc(db, 'accountAppeals', appealId));
    if (!appealDoc.exists()) {
      return { success: false, error: 'Appeal not found' };
    }

    const appealData = appealDoc.data();

    await updateDoc(doc(db, 'accountAppeals', appealId), {
      status: approved ? 'approved' : 'denied',
      processedAt: new Date().toISOString(),
      processedBy: adminId,
      adminNotes: notes
    });

    if (approved) {
      await unlockAccount(appealData.userId, adminId, `Appeal approved: ${notes}`);
    }

    return { success: true, message: `Appeal ${approved ? 'approved' : 'denied'}` };
  } catch (error) {
    console.error('Error processing appeal:', error);
    return { success: false, error: error.message };
  }
};

export default {
  // Constants
  ACCOUNT_STATUS,
  STATUS_REASONS,
  REASON_LABELS,

  // Account management
  lockAccount,
  suspendAccount,
  banAccount,
  unlockAccount,

  // Status checks
  checkAccountStatus,
  getAccountStatusDetails,

  // Audit
  getAccountActionHistory,
  getAdminActionHistory,

  // Search & management
  searchUsers,
  getUsersByStatus,
  getAccountManagementSummary,

  // Appeals
  submitAccountAppeal,
  requestAccountUnlock,
  getPendingAppeals,
  getPendingUnlockRequests,
  processAppeal
};
