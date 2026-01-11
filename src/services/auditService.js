// FILE: src/services/auditService.js
// 🔐 HIPAA-Compliant Audit Logging System
// Tracks ALL access to protected health information (PHI)

import { db } from '../firebase';
import { 
  collection, addDoc, getDocs, query, where, 
  orderBy, limit, Timestamp 
} from 'firebase/firestore';

// ============================================
// 📋 AUDIT ACTION TYPES
// ============================================

export const AUDIT_ACTIONS = {
  // Data Access
  VIEW_MEMBER_PROFILE: 'view_member_profile',
  VIEW_MEMBER_MOOD: 'view_member_mood',
  VIEW_MEMBER_JOURNAL: 'view_member_journal',
  VIEW_MEMBER_LIST: 'view_member_list',
  EXPORT_MEMBER_DATA: 'export_member_data',
  
  // Reports
  GENERATE_REPORT: 'generate_report',
  DOWNLOAD_REPORT: 'download_report',
  PRINT_REPORT: 'print_report',
  
  // Messaging
  MESSAGE_SENT: 'message_sent',
  MESSAGE_READ: 'message_read',
  CRISIS_OUTREACH: 'crisis_outreach',
  
  // Crisis Management
  VIEW_ALERT: 'view_alert',
  ACKNOWLEDGE_ALERT: 'acknowledge_alert',
  RESOLVE_ALERT: 'resolve_alert',
  ADD_INTERVENTION: 'add_intervention',
  
  // Therapist Actions
  ASSIGN_THERAPIST: 'assign_therapist',
  UNASSIGN_THERAPIST: 'unassign_therapist',
  ADD_THERAPIST: 'add_therapist',
  REMOVE_THERAPIST: 'remove_therapist',
  
  // Admin Actions
  UPDATE_ORG_SETTINGS: 'update_org_settings',
  UPDATE_CRISIS_CONFIG: 'update_crisis_config',
  INVITE_ADMIN: 'invite_admin',
  REMOVE_ADMIN: 'remove_admin',
  
  // Authentication
  ADMIN_LOGIN: 'admin_login',
  ADMIN_LOGOUT: 'admin_logout',
  FAILED_LOGIN: 'failed_login',
  
  // Data Management
  DELETE_MEMBER_DATA: 'delete_member_data',
  ANONYMIZE_DATA: 'anonymize_data'
};

// ============================================
// 📝 LOG AUDIT EVENT
// ============================================

export const logAuditEvent = async (organizationId, event) => {
  const {
    action,
    actorId,
    actorName,
    actorRole,        // 'admin', 'therapist', 'system'
    targetType,       // 'member', 'report', 'alert', 'conversation', etc.
    targetId,
    targetName,
    details = {},
    ipAddress = null,
    userAgent = null
  } = event;

  try {
    // Get browser info if available
    const browserInfo = typeof window !== 'undefined' ? {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform
    } : {};

    const auditEntry = {
      action,
      actorId,
      actorName,
      actorRole,
      targetType,
      targetId,
      targetName: targetName || null,
      details,
      timestamp: new Date().toISOString(),
      ipAddress,
      browserInfo,
      organizationId
    };

    await addDoc(
      collection(db, 'organizations', organizationId, 'auditLog'),
      auditEntry
    );

    // Also log critical actions to a global audit collection for compliance
    if (isCriticalAction(action)) {
      await addDoc(collection(db, 'globalAuditLog'), {
        ...auditEntry,
        isCritical: true
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Audit log error:', error);
    // Audit failures should not break the app, but should be monitored
    return { success: false, error: error.message };
  }
};

// Check if action is critical (requires extra logging)
const isCriticalAction = (action) => {
  const criticalActions = [
    AUDIT_ACTIONS.EXPORT_MEMBER_DATA,
    AUDIT_ACTIONS.DELETE_MEMBER_DATA,
    AUDIT_ACTIONS.VIEW_MEMBER_JOURNAL,
    AUDIT_ACTIONS.CRISIS_OUTREACH,
    AUDIT_ACTIONS.RESOLVE_ALERT,
    AUDIT_ACTIONS.REMOVE_ADMIN,
    AUDIT_ACTIONS.UPDATE_CRISIS_CONFIG
  ];
  return criticalActions.includes(action);
};

// ============================================
// 🔍 QUERY AUDIT LOGS
// ============================================

// Get audit logs for organization
export const getAuditLogs = async (organizationId, options = {}) => {
  const {
    startDate,
    endDate,
    action,
    actorId,
    targetType,
    targetId,
    limitCount = 100
  } = options;

  let auditQuery = query(
    collection(db, 'organizations', organizationId, 'auditLog'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  // Note: Firestore has limitations on compound queries
  // For production, consider using a dedicated logging service like LogRocket, Datadog, etc.

  const snapshot = await getDocs(auditQuery);
  let logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Client-side filtering (not ideal for large datasets)
  if (startDate) {
    logs = logs.filter(l => new Date(l.timestamp) >= new Date(startDate));
  }
  if (endDate) {
    logs = logs.filter(l => new Date(l.timestamp) <= new Date(endDate));
  }
  if (action) {
    logs = logs.filter(l => l.action === action);
  }
  if (actorId) {
    logs = logs.filter(l => l.actorId === actorId);
  }
  if (targetType) {
    logs = logs.filter(l => l.targetType === targetType);
  }
  if (targetId) {
    logs = logs.filter(l => l.targetId === targetId);
  }

  return logs;
};

// Get audit logs for specific member (who accessed their data)
export const getMemberAccessLog = async (organizationId, memberId) => {
  const logs = await getAuditLogs(organizationId, {
    targetId: memberId,
    limitCount: 200
  });
  
  return logs.filter(l => l.targetType === 'member');
};

// Get audit logs for specific actor (what did this person do)
export const getActorActivityLog = async (organizationId, actorId) => {
  return getAuditLogs(organizationId, {
    actorId,
    limitCount: 200
  });
};

// ============================================
// 📊 AUDIT ANALYTICS
// ============================================

export const getAuditAnalytics = async (organizationId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await getAuditLogs(organizationId, {
    startDate: startDate.toISOString(),
    limitCount: 1000
  });

  // Action frequency
  const actionCounts = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});

  // Most active users
  const actorCounts = logs.reduce((acc, log) => {
    const key = log.actorName || log.actorId;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Daily activity
  const dailyActivity = logs.reduce((acc, log) => {
    const date = log.timestamp.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Data access patterns
  const dataAccessLogs = logs.filter(l => 
    l.action.startsWith('view_') || l.action.startsWith('export_')
  );

  // Critical actions
  const criticalLogs = logs.filter(l => isCriticalAction(l.action));

  return {
    totalEvents: logs.length,
    actionCounts,
    topActors: Object.entries(actorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    dailyActivity,
    dataAccessCount: dataAccessLogs.length,
    criticalActionCount: criticalLogs.length,
    criticalActions: criticalLogs.slice(0, 20)
  };
};

// ============================================
// 📄 COMPLIANCE REPORTS
// ============================================

// Generate HIPAA access report for a date range
export const generateAccessReport = async (organizationId, startDate, endDate) => {
  const logs = await getAuditLogs(organizationId, {
    startDate,
    endDate,
    limitCount: 5000
  });

  // Filter to PHI access only
  const phiAccessActions = [
    AUDIT_ACTIONS.VIEW_MEMBER_PROFILE,
    AUDIT_ACTIONS.VIEW_MEMBER_MOOD,
    AUDIT_ACTIONS.VIEW_MEMBER_JOURNAL,
    AUDIT_ACTIONS.EXPORT_MEMBER_DATA,
    AUDIT_ACTIONS.MESSAGE_SENT,
    AUDIT_ACTIONS.CRISIS_OUTREACH
  ];

  const phiLogs = logs.filter(l => phiAccessActions.includes(l.action));

  return {
    reportType: 'HIPAA_ACCESS_REPORT',
    organizationId,
    dateRange: { startDate, endDate },
    generatedAt: new Date().toISOString(),
    totalPHIAccessEvents: phiLogs.length,
    uniqueAccessors: [...new Set(phiLogs.map(l => l.actorId))].length,
    uniqueMembersAccessed: [...new Set(phiLogs.map(l => l.targetId))].length,
    accessByType: phiAccessActions.reduce((acc, action) => {
      acc[action] = phiLogs.filter(l => l.action === action).length;
      return acc;
    }, {}),
    detailedLog: phiLogs.map(l => ({
      timestamp: l.timestamp,
      actor: l.actorName,
      actorRole: l.actorRole,
      action: l.action,
      target: l.targetName || l.targetId
    }))
  };
};

// Generate security incident report
export const generateSecurityReport = async (organizationId, days = 90) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await getAuditLogs(organizationId, {
    startDate: startDate.toISOString(),
    limitCount: 5000
  });

  // Potential security concerns
  const failedLogins = logs.filter(l => l.action === AUDIT_ACTIONS.FAILED_LOGIN);
  const dataExports = logs.filter(l => l.action === AUDIT_ACTIONS.EXPORT_MEMBER_DATA);
  const dataDeletions = logs.filter(l => l.action === AUDIT_ACTIONS.DELETE_MEMBER_DATA);
  const adminChanges = logs.filter(l => 
    l.action === AUDIT_ACTIONS.INVITE_ADMIN || l.action === AUDIT_ACTIONS.REMOVE_ADMIN
  );

  // Unusual activity patterns (same actor, many actions in short time)
  const actorActivity = logs.reduce((acc, log) => {
    if (!acc[log.actorId]) acc[log.actorId] = [];
    acc[log.actorId].push(log);
    return acc;
  }, {});

  const suspiciousActivity = Object.entries(actorActivity)
    .filter(([_, actions]) => {
      // More than 100 actions in the period
      if (actions.length > 100) return true;
      // Check for rapid-fire actions (more than 20 in 5 minutes)
      // This is simplified; production would need better analysis
      return false;
    })
    .map(([actorId, actions]) => ({
      actorId,
      actionCount: actions.length,
      actorName: actions[0].actorName
    }));

  return {
    reportType: 'SECURITY_REPORT',
    organizationId,
    dateRange: { 
      startDate: startDate.toISOString(), 
      endDate: new Date().toISOString() 
    },
    generatedAt: new Date().toISOString(),
    summary: {
      totalEvents: logs.length,
      failedLogins: failedLogins.length,
      dataExports: dataExports.length,
      dataDeletions: dataDeletions.length,
      adminChanges: adminChanges.length,
      suspiciousActivityFlags: suspiciousActivity.length
    },
    failedLoginDetails: failedLogins.slice(0, 50),
    dataExportDetails: dataExports,
    adminChangeDetails: adminChanges,
    suspiciousActivity
  };
};

// ============================================
// 🧹 AUDIT LOG RETENTION
// ============================================

// HIPAA requires 6 years retention
// This function would be called by a scheduled job
export const cleanupOldAuditLogs = async (organizationId, retentionDays = 2190) => {
  // 2190 days = 6 years
  // In production, this would be a Cloud Function
  console.log(`Audit cleanup would remove logs older than ${retentionDays} days`);
  console.log('This should be implemented as a scheduled Cloud Function');
  
  return { 
    success: true, 
    message: 'Audit log cleanup should be handled by Cloud Functions for production' 
  };
};

// ============================================
// 🔄 AUTO-LOGGING WRAPPER
// ============================================

// Wrapper function to automatically log actions
export const withAuditLog = (organizationId, actor) => {
  return async (action, targetType, targetId, targetName, asyncFn) => {
    const startTime = Date.now();
    let success = false;
    let error = null;

    try {
      const result = await asyncFn();
      success = true;
      return result;
    } catch (err) {
      error = err.message;
      throw err;
    } finally {
      await logAuditEvent(organizationId, {
        action,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        targetType,
        targetId,
        targetName,
        details: {
          success,
          error,
          durationMs: Date.now() - startTime
        }
      });
    }
  };
};

export default {
  AUDIT_ACTIONS,
  logAuditEvent,
  getAuditLogs,
  getMemberAccessLog,
  getActorActivityLog,
  getAuditAnalytics,
  generateAccessReport,
  generateSecurityReport,
  cleanupOldAuditLogs,
  withAuditLog
};
