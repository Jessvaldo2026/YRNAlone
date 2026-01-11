// FILE: src/services/crisisService.js
// 🚨 Crisis Detection & Escalation System
// Auto-detects concerning patterns and alerts therapists

import { db } from '../firebase';
import { 
  collection, doc, setDoc, getDocs, updateDoc, 
  query, where, orderBy, limit, addDoc, Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { sendCrisisAlertEmail } from './PaymentEmails';

// 🎯 CRISIS THRESHOLDS - Configurable per organization
export const DEFAULT_CRISIS_CONFIG = {
  lowMoodThreshold: 3,        // Number of low moods to trigger alert
  lowMoodWindow: 7,           // Days to look back
  inactivityDays: 7,          // Days inactive to flag
  severeKeywords: [           // Keywords in journal that trigger immediate alert
    'suicide', 'kill myself', 'end it all', 'don\'t want to live',
    'hurt myself', 'self harm', 'cutting', 'overdose'
  ],
  lowMoods: ['sad', 'anxious', 'angry', '😢', '😰', '😡', 'depressed', 'hopeless']
};

// 🚨 ALERT SEVERITY LEVELS
export const ALERT_SEVERITY = {
  CRITICAL: 'critical',   // Immediate action needed (severe keywords)
  HIGH: 'high',           // 5+ low moods in window
  MEDIUM: 'medium',       // 3-4 low moods in window
  LOW: 'low'              // Inactivity or engagement drop
};

// ============================================
// 🔍 CRISIS DETECTION FUNCTIONS
// ============================================

// Analyze member's mood history for concerning patterns
export const analyzeMemberMoodPattern = (member, config = DEFAULT_CRISIS_CONFIG) => {
  const alerts = [];
  const now = new Date();
  const windowStart = new Date(now - config.lowMoodWindow * 24 * 60 * 60 * 1000);
  
  // Get recent moods
  const recentMoods = (member.moodHistory || []).filter(m => {
    const moodDate = new Date(m.timestamp || m.date || m.createdAt);
    return moodDate >= windowStart;
  });

  // Count low moods
  const lowMoodCount = recentMoods.filter(m => 
    config.lowMoods.includes((m.mood || m.label || m.emoji || '').toLowerCase())
  ).length;

  // Check for consecutive low moods (more concerning)
  let consecutiveLowMoods = 0;
  let maxConsecutive = 0;
  
  recentMoods.forEach(m => {
    if (config.lowMoods.includes((m.mood || m.label || '').toLowerCase())) {
      consecutiveLowMoods++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveLowMoods);
    } else {
      consecutiveLowMoods = 0;
    }
  });

  // Generate alerts based on patterns
  if (maxConsecutive >= 5 || lowMoodCount >= 6) {
    alerts.push({
      type: 'sustained_low_mood',
      severity: ALERT_SEVERITY.HIGH,
      title: 'Sustained Low Mood Pattern',
      message: `Member has logged ${lowMoodCount} low moods in the past ${config.lowMoodWindow} days, with ${maxConsecutive} consecutive.`,
      recommendation: 'Immediate therapist outreach recommended.',
      data: { lowMoodCount, maxConsecutive, recentMoods: recentMoods.slice(0, 5) }
    });
  } else if (lowMoodCount >= config.lowMoodThreshold) {
    alerts.push({
      type: 'low_mood_pattern',
      severity: ALERT_SEVERITY.MEDIUM,
      title: 'Low Mood Pattern Detected',
      message: `Member has logged ${lowMoodCount} low moods in the past ${config.lowMoodWindow} days.`,
      recommendation: 'Consider reaching out with a supportive check-in.',
      data: { lowMoodCount, recentMoods: recentMoods.slice(0, 5) }
    });
  }

  // Check for mood decline trend
  if (recentMoods.length >= 5) {
    const moodScores = {
      'happy': 9, '😊': 9, 'loved': 8, '🥰': 8, 'calm': 7, '😌': 7,
      'neutral': 5, '😐': 5, 'tired': 4, '😴': 4,
      'anxious': 3, '😰': 3, 'sad': 2, '😢': 2, 'angry': 2, '😡': 2
    };
    
    const firstHalf = recentMoods.slice(Math.floor(recentMoods.length / 2));
    const secondHalf = recentMoods.slice(0, Math.floor(recentMoods.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, m) => sum + (moodScores[m.mood] || moodScores[m.emoji] || 5), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + (moodScores[m.mood] || moodScores[m.emoji] || 5), 0) / secondHalf.length;
    
    if (secondAvg < firstAvg - 2) {
      alerts.push({
        type: 'mood_decline',
        severity: ALERT_SEVERITY.MEDIUM,
        title: 'Declining Mood Trend',
        message: `Member's average mood has declined significantly over the past week.`,
        recommendation: 'Monitor closely and consider proactive outreach.',
        data: { previousAvg: firstAvg.toFixed(1), currentAvg: secondAvg.toFixed(1) }
      });
    }
  }

  return alerts;
};

// Scan journal entries for concerning keywords
export const scanJournalForCrisis = (member, config = DEFAULT_CRISIS_CONFIG) => {
  const alerts = [];
  const recentEntries = (member.journalEntries || []).slice(0, 10);
  
  recentEntries.forEach(entry => {
    const content = (entry.content || entry.text || '').toLowerCase();
    
    const foundKeywords = config.severeKeywords.filter(keyword => 
      content.includes(keyword.toLowerCase())
    );
    
    if (foundKeywords.length > 0) {
      alerts.push({
        type: 'crisis_keywords',
        severity: ALERT_SEVERITY.CRITICAL,
        title: '⚠️ CRITICAL: Concerning Language Detected',
        message: `Journal entry contains concerning language that may indicate crisis.`,
        recommendation: 'IMMEDIATE intervention recommended. Consider crisis resources.',
        data: { 
          entryDate: entry.timestamp || entry.date,
          // Don't include actual keywords for privacy, just flag
          keywordCount: foundKeywords.length
        },
        requiresImmediate: true
      });
    }
  });

  return alerts;
};

// Check for engagement drop-off
export const checkEngagementDrop = (member, config = DEFAULT_CRISIS_CONFIG) => {
  const alerts = [];
  const now = new Date();
  const lastActive = new Date(member.lastActive || member.updatedAt || member.createdAt);
  const daysSinceActive = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
  
  // Was previously active but dropped off
  const wasEngaged = (member.stats?.daysActive || 0) > 14 || 
                     (member.moodHistory?.length || 0) > 10 ||
                     (member.journalEntries?.length || 0) > 5;
  
  if (wasEngaged && daysSinceActive >= config.inactivityDays) {
    alerts.push({
      type: 'engagement_drop',
      severity: daysSinceActive > 14 ? ALERT_SEVERITY.MEDIUM : ALERT_SEVERITY.LOW,
      title: 'Engagement Drop-Off',
      message: `Previously active member hasn't engaged in ${daysSinceActive} days.`,
      recommendation: 'Send a gentle check-in message.',
      data: { 
        daysSinceActive, 
        previousActivity: {
          daysActive: member.stats?.daysActive || 0,
          moodEntries: member.moodHistory?.length || 0,
          journalEntries: member.journalEntries?.length || 0
        }
      }
    });
  }

  return alerts;
};

// ============================================
// 🚨 FULL CRISIS SCAN FOR ORGANIZATION
// ============================================

export const runCrisisScan = async (organizationId, config = DEFAULT_CRISIS_CONFIG) => {
  try {
    // Get all members
    const membersQuery = query(
      collection(db, 'users'),
      where('organizationId', '==', organizationId)
    );
    const snapshot = await getDocs(membersQuery);
    const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const allAlerts = [];

    for (const member of members) {
      const memberAlerts = [];
      
      // Run all detection algorithms
      memberAlerts.push(...analyzeMemberMoodPattern(member, config));
      memberAlerts.push(...scanJournalForCrisis(member, config));
      memberAlerts.push(...checkEngagementDrop(member, config));

      // Add member info to each alert
      memberAlerts.forEach(alert => {
        allAlerts.push({
          ...alert,
          memberId: member.id,
          memberName: member.name || member.username || 'Anonymous',
          memberEmail: member.email,
          assignedTherapistId: member.assignedTherapistId,
          createdAt: new Date().toISOString(),
          status: 'new', // new, acknowledged, resolved
          organizationId
        });
      });
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    allAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return {
      success: true,
      totalMembers: members.length,
      totalAlerts: allAlerts.length,
      criticalCount: allAlerts.filter(a => a.severity === 'critical').length,
      highCount: allAlerts.filter(a => a.severity === 'high').length,
      alerts: allAlerts
    };
  } catch (error) {
    console.error('Crisis scan error:', error);
    return { success: false, error: error.message, alerts: [] };
  }
};

// ============================================
// 📝 ALERT MANAGEMENT
// ============================================

// Save alert to database
export const createAlert = async (organizationId, alertData) => {
  const alertRef = await addDoc(collection(db, 'organizations', organizationId, 'alerts'), {
    ...alertData,
    createdAt: new Date().toISOString(),
    status: 'new',
    acknowledged: false,
    resolvedAt: null,
    interventions: []
  });
  return alertRef.id;
};

// Get all alerts for organization
export const getOrgAlerts = async (organizationId, includeResolved = false) => {
  let alertsQuery = query(
    collection(db, 'organizations', organizationId, 'alerts'),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  const snapshot = await getDocs(alertsQuery);
  let alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  if (!includeResolved) {
    alerts = alerts.filter(a => a.status !== 'resolved');
  }

  return alerts;
};

// Acknowledge alert (therapist has seen it)
export const acknowledgeAlert = async (organizationId, alertId, therapistId, therapistName) => {
  await updateDoc(doc(db, 'organizations', organizationId, 'alerts', alertId), {
    status: 'acknowledged',
    acknowledged: true,
    acknowledgedAt: new Date().toISOString(),
    acknowledgedBy: { id: therapistId, name: therapistName }
  });
};

// Resolve alert with intervention notes
export const resolveAlert = async (organizationId, alertId, resolution) => {
  await updateDoc(doc(db, 'organizations', organizationId, 'alerts', alertId), {
    status: 'resolved',
    resolvedAt: new Date().toISOString(),
    resolution: {
      action: resolution.action,
      notes: resolution.notes,
      resolvedBy: resolution.resolvedBy,
      outcome: resolution.outcome
    }
  });
};

// Add intervention to alert
export const addIntervention = async (organizationId, alertId, intervention) => {
  const alertRef = doc(db, 'organizations', organizationId, 'alerts', alertId);
  const alertDoc = await getDocs(alertRef);
  const currentInterventions = alertDoc.data()?.interventions || [];
  
  await updateDoc(alertRef, {
    interventions: [...currentInterventions, {
      ...intervention,
      timestamp: new Date().toISOString()
    }],
    status: 'in_progress'
  });
};

// ============================================
// 🔔 REAL-TIME ALERT NOTIFICATIONS
// ============================================

// Subscribe to new critical alerts (for real-time notifications)
export const subscribeToAlerts = (organizationId, callback) => {
  const alertsQuery = query(
    collection(db, 'organizations', organizationId, 'alerts'),
    where('status', '==', 'new'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(alertsQuery, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(alerts);
  });
};

// ============================================
// 📧 ALERT NOTIFICATION TO THERAPIST
// ============================================

export const notifyTherapistOfAlert = async (alert, therapist, organization) => {
  // Send email notification
  try {
    await sendCrisisAlertEmail({
      therapistEmail: therapist.email,
      therapistName: therapist.name,
      organizationName: organization.name,
      alertType: alert.type,
      alertSeverity: alert.severity,
      memberName: alert.memberName,
      alertMessage: alert.message,
      recommendation: alert.recommendation,
      dashboardLink: `${window.location.origin}/admin`
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to notify therapist:', error);
    return { success: false, error };
  }
};

// ============================================
// 📊 CRISIS ANALYTICS
// ============================================

export const getCrisisAnalytics = async (organizationId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const alertsQuery = query(
    collection(db, 'organizations', organizationId, 'alerts'),
    where('createdAt', '>=', startDate.toISOString())
  );

  const snapshot = await getDocs(alertsQuery);
  const alerts = snapshot.docs.map(doc => doc.data());

  return {
    totalAlerts: alerts.length,
    bySeverity: {
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length
    },
    byType: alerts.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {}),
    resolved: alerts.filter(a => a.status === 'resolved').length,
    avgResolutionTime: calculateAvgResolutionTime(alerts),
    interventionRate: alerts.filter(a => a.interventions?.length > 0).length / alerts.length * 100
  };
};

const calculateAvgResolutionTime = (alerts) => {
  const resolved = alerts.filter(a => a.resolvedAt && a.createdAt);
  if (resolved.length === 0) return 0;
  
  const totalHours = resolved.reduce((sum, a) => {
    const created = new Date(a.createdAt);
    const resolved = new Date(a.resolvedAt);
    return sum + (resolved - created) / (1000 * 60 * 60);
  }, 0);
  
  return (totalHours / resolved.length).toFixed(1);
};

export default {
  runCrisisScan,
  analyzeMemberMoodPattern,
  scanJournalForCrisis,
  checkEngagementDrop,
  createAlert,
  getOrgAlerts,
  acknowledgeAlert,
  resolveAlert,
  addIntervention,
  subscribeToAlerts,
  notifyTherapistOfAlert,
  getCrisisAnalytics,
  DEFAULT_CRISIS_CONFIG,
  ALERT_SEVERITY
};
