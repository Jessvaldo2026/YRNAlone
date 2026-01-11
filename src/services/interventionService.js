// FILE: src/services/interventionService.js
// 📋 Intervention Tracking System
// Track all therapist interventions and outcomes

import { db } from '../firebase';
import { 
  collection, doc, addDoc, getDocs, updateDoc,
  query, where, orderBy, limit, Timestamp 
} from 'firebase/firestore';
import { logAuditEvent, AUDIT_ACTIONS } from './auditService';

// ============================================
// 📋 INTERVENTION TYPES
// ============================================

export const INTERVENTION_TYPES = {
  MESSAGE: 'message',              // Sent a message
  PHONE_CALL: 'phone_call',        // Called the member
  VIDEO_SESSION: 'video_session',  // Had video session
  IN_PERSON: 'in_person',          // In-person meeting
  RESOURCE_SHARED: 'resource_shared', // Shared resource
  REFERRAL: 'referral',            // Referred to specialist
  CRISIS_RESPONSE: 'crisis_response', // Crisis intervention
  CHECK_IN: 'check_in',            // Routine check-in
  CARE_PLAN_UPDATE: 'care_plan_update', // Updated care plan
  FOLLOW_UP: 'follow_up'           // Follow-up action
};

export const INTERVENTION_OUTCOMES = {
  POSITIVE: 'positive',            // Member responded well
  NEUTRAL: 'neutral',              // No significant change
  NEEDS_FOLLOW_UP: 'needs_follow_up', // Requires additional attention
  ESCALATED: 'escalated',          // Escalated to higher care
  NO_RESPONSE: 'no_response',      // Member didn't respond
  RESOLVED: 'resolved'             // Issue resolved
};

// ============================================
// 📝 CREATE INTERVENTION
// ============================================

export const createIntervention = async (organizationId, intervention) => {
  const {
    memberId,
    memberName,
    therapistId,
    therapistName,
    type,
    relatedAlertId = null,
    notes,
    outcome = null,
    followUpDate = null,
    duration = null,  // in minutes
    tags = []
  } = intervention;

  const interventionData = {
    memberId,
    memberName,
    therapistId,
    therapistName,
    type,
    relatedAlertId,
    notes,
    outcome,
    followUpDate,
    duration,
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: outcome ? 'completed' : 'pending'
  };

  const docRef = await addDoc(
    collection(db, 'organizations', organizationId, 'interventions'),
    interventionData
  );

  // Log audit event
  await logAuditEvent(organizationId, {
    action: AUDIT_ACTIONS.ADD_INTERVENTION,
    actorId: therapistId,
    actorName: therapistName,
    actorRole: 'therapist',
    targetType: 'member',
    targetId: memberId,
    targetName: memberName,
    details: { interventionType: type, hasAlert: !!relatedAlertId }
  });

  // If this intervention is related to an alert, update the alert
  if (relatedAlertId) {
    await updateAlertWithIntervention(organizationId, relatedAlertId, {
      interventionId: docRef.id,
      type,
      therapistName,
      timestamp: interventionData.createdAt
    });
  }

  return { id: docRef.id, ...interventionData };
};

// Update alert with intervention info
const updateAlertWithIntervention = async (organizationId, alertId, interventionInfo) => {
  try {
    const alertRef = doc(db, 'organizations', organizationId, 'alerts', alertId);
    const alertDoc = await getDocs(query(collection(db, 'organizations', organizationId, 'alerts'), where('__name__', '==', alertId)));
    
    if (!alertDoc.empty) {
      const currentData = alertDoc.docs[0].data();
      await updateDoc(alertRef, {
        interventions: [...(currentData.interventions || []), interventionInfo],
        status: 'in_progress',
        lastInterventionAt: interventionInfo.timestamp
      });
    }
  } catch (error) {
    console.error('Error updating alert with intervention:', error);
  }
};

// ============================================
// 📖 GET INTERVENTIONS
// ============================================

// Get all interventions for a member
export const getMemberInterventions = async (organizationId, memberId) => {
  const interventionsQuery = query(
    collection(db, 'organizations', organizationId, 'interventions'),
    where('memberId', '==', memberId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(interventionsQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get all interventions by a therapist
export const getTherapistInterventions = async (organizationId, therapistId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const interventionsQuery = query(
    collection(db, 'organizations', organizationId, 'interventions'),
    where('therapistId', '==', therapistId),
    orderBy('createdAt', 'desc'),
    limit(200)
  );
  
  const snapshot = await getDocs(interventionsQuery);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(i => new Date(i.createdAt) >= startDate);
};

// Get interventions needing follow-up
export const getPendingFollowUps = async (organizationId, therapistId = null) => {
  let interventionsQuery = query(
    collection(db, 'organizations', organizationId, 'interventions'),
    where('status', '==', 'pending'),
    orderBy('followUpDate', 'asc')
  );

  const snapshot = await getDocs(interventionsQuery);
  let interventions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  if (therapistId) {
    interventions = interventions.filter(i => i.therapistId === therapistId);
  }

  // Only return those with follow-up dates in the past or today
  const today = new Date().toISOString().split('T')[0];
  return interventions.filter(i => i.followUpDate && i.followUpDate <= today);
};

// Get all interventions for organization
export const getOrgInterventions = async (organizationId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const interventionsQuery = query(
    collection(db, 'organizations', organizationId, 'interventions'),
    orderBy('createdAt', 'desc'),
    limit(500)
  );
  
  const snapshot = await getDocs(interventionsQuery);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(i => new Date(i.createdAt) >= startDate);
};

// ============================================
// ✏️ UPDATE INTERVENTION
// ============================================

export const updateIntervention = async (organizationId, interventionId, updates) => {
  const interventionRef = doc(db, 'organizations', organizationId, 'interventions', interventionId);
  
  await updateDoc(interventionRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
    status: updates.outcome ? 'completed' : 'pending'
  });

  return { success: true };
};

// Complete an intervention with outcome
export const completeIntervention = async (organizationId, interventionId, outcome, notes = '') => {
  return updateIntervention(organizationId, interventionId, {
    outcome,
    outcomeNotes: notes,
    completedAt: new Date().toISOString()
  });
};

// ============================================
// 📊 INTERVENTION ANALYTICS
// ============================================

export const getInterventionAnalytics = async (organizationId, days = 30) => {
  const interventions = await getOrgInterventions(organizationId, days);

  // By type
  const byType = interventions.reduce((acc, i) => {
    acc[i.type] = (acc[i.type] || 0) + 1;
    return acc;
  }, {});

  // By outcome
  const byOutcome = interventions.reduce((acc, i) => {
    if (i.outcome) {
      acc[i.outcome] = (acc[i.outcome] || 0) + 1;
    }
    return acc;
  }, {});

  // By therapist
  const byTherapist = interventions.reduce((acc, i) => {
    const name = i.therapistName || 'Unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  // Response time (time from alert to first intervention)
  const alertInterventions = interventions.filter(i => i.relatedAlertId);
  
  // Average duration
  const withDuration = interventions.filter(i => i.duration);
  const avgDuration = withDuration.length > 0
    ? withDuration.reduce((sum, i) => sum + i.duration, 0) / withDuration.length
    : 0;

  // Completion rate
  const completed = interventions.filter(i => i.status === 'completed').length;
  const completionRate = interventions.length > 0 
    ? (completed / interventions.length * 100).toFixed(1)
    : 0;

  // Daily trend
  const dailyTrend = interventions.reduce((acc, i) => {
    const date = i.createdAt.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return {
    totalInterventions: interventions.length,
    byType,
    byOutcome,
    byTherapist,
    avgDuration: avgDuration.toFixed(0),
    completionRate: parseFloat(completionRate),
    pendingFollowUps: interventions.filter(i => i.status === 'pending').length,
    crisisInterventions: interventions.filter(i => i.type === INTERVENTION_TYPES.CRISIS_RESPONSE).length,
    dailyTrend
  };
};

// ============================================
// 📄 INTERVENTION SUMMARY FOR MEMBER
// ============================================

export const getMemberInterventionSummary = async (organizationId, memberId) => {
  const interventions = await getMemberInterventions(organizationId, memberId);

  if (interventions.length === 0) {
    return {
      totalInterventions: 0,
      lastIntervention: null,
      therapistsInvolved: [],
      summary: 'No interventions recorded'
    };
  }

  const therapists = [...new Set(interventions.map(i => i.therapistName))];
  const lastIntervention = interventions[0];
  
  const outcomes = interventions.filter(i => i.outcome);
  const positiveOutcomes = outcomes.filter(i => i.outcome === INTERVENTION_OUTCOMES.POSITIVE).length;

  return {
    totalInterventions: interventions.length,
    lastIntervention: {
      date: lastIntervention.createdAt,
      type: lastIntervention.type,
      therapist: lastIntervention.therapistName,
      outcome: lastIntervention.outcome
    },
    therapistsInvolved: therapists,
    outcomeBreakdown: {
      positive: positiveOutcomes,
      total: outcomes.length,
      rate: outcomes.length > 0 ? (positiveOutcomes / outcomes.length * 100).toFixed(0) : 0
    },
    interventionTypes: interventions.reduce((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + 1;
      return acc;
    }, {}),
    timeline: interventions.slice(0, 10).map(i => ({
      date: i.createdAt,
      type: i.type,
      therapist: i.therapistName,
      outcome: i.outcome
    }))
  };
};

// ============================================
// 📅 SCHEDULED FOLLOW-UPS
// ============================================

export const scheduleFollowUp = async (organizationId, intervention) => {
  return createIntervention(organizationId, {
    ...intervention,
    type: INTERVENTION_TYPES.FOLLOW_UP,
    notes: `Scheduled follow-up: ${intervention.notes}`,
    status: 'scheduled'
  });
};

// Get today's scheduled follow-ups
export const getTodaysFollowUps = async (organizationId, therapistId = null) => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const interventionsQuery = query(
    collection(db, 'organizations', organizationId, 'interventions'),
    where('followUpDate', '>=', today),
    where('followUpDate', '<', tomorrow),
    orderBy('followUpDate', 'asc')
  );

  const snapshot = await getDocs(interventionsQuery);
  let followUps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  if (therapistId) {
    followUps = followUps.filter(f => f.therapistId === therapistId);
  }

  return followUps;
};

export default {
  INTERVENTION_TYPES,
  INTERVENTION_OUTCOMES,
  createIntervention,
  getMemberInterventions,
  getTherapistInterventions,
  getPendingFollowUps,
  getOrgInterventions,
  updateIntervention,
  completeIntervention,
  getInterventionAnalytics,
  getMemberInterventionSummary,
  scheduleFollowUp,
  getTodaysFollowUps
};
