// FILE: src/services/treatmentPlanService.js
// 🎯 Treatment Plan Management System
// Clinical treatment planning with goals, progress tracking, and outcomes

import { db } from '../firebase';
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, Timestamp, arrayUnion
} from 'firebase/firestore';
import { logAuditEvent, AUDIT_ACTIONS } from './auditService';

// ============================================
// 📋 TREATMENT PLAN TYPES & TEMPLATES
// ============================================

export const PLAN_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  DISCONTINUED: 'discontinued'
};

export const GOAL_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  ACHIEVED: 'achieved',
  PARTIALLY_ACHIEVED: 'partially_achieved',
  NOT_ACHIEVED: 'not_achieved',
  DISCONTINUED: 'discontinued'
};

export const GOAL_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const GOAL_CATEGORIES = [
  { id: 'symptom_reduction', label: 'Symptom Reduction', icon: '📉' },
  { id: 'coping_skills', label: 'Coping Skills', icon: '🛠️' },
  { id: 'relationship', label: 'Relationship Improvement', icon: '💜' },
  { id: 'daily_functioning', label: 'Daily Functioning', icon: '📅' },
  { id: 'self_care', label: 'Self-Care & Wellness', icon: '🧘' },
  { id: 'communication', label: 'Communication Skills', icon: '💬' },
  { id: 'emotional_regulation', label: 'Emotional Regulation', icon: '🎭' },
  { id: 'trauma_processing', label: 'Trauma Processing', icon: '🌱' },
  { id: 'substance_use', label: 'Substance Use', icon: '🚫' },
  { id: 'education_career', label: 'Education/Career', icon: '📚' },
  { id: 'other', label: 'Other', icon: '📝' }
];

export const TREATMENT_MODALITIES = [
  'Cognitive Behavioral Therapy (CBT)',
  'Dialectical Behavior Therapy (DBT)',
  'EMDR',
  'Psychodynamic Therapy',
  'Mindfulness-Based Therapy',
  'Solution-Focused Brief Therapy',
  'Motivational Interviewing',
  'Family Systems Therapy',
  'Play Therapy',
  'Art Therapy',
  'Group Therapy',
  'Medication Management',
  'Other'
];

export const PLAN_TEMPLATES = {
  anxiety: {
    name: 'Anxiety Treatment Plan',
    diagnosis: 'Generalized Anxiety Disorder',
    suggestedGoals: [
      {
        title: 'Reduce anxiety symptoms',
        category: 'symptom_reduction',
        objectives: [
          'Decrease frequency of panic attacks',
          'Reduce physical symptoms of anxiety',
          'Improve sleep quality'
        ]
      },
      {
        title: 'Develop coping strategies',
        category: 'coping_skills',
        objectives: [
          'Learn and practice deep breathing techniques',
          'Identify and challenge anxious thoughts',
          'Implement grounding techniques'
        ]
      }
    ],
    suggestedModalities: ['Cognitive Behavioral Therapy (CBT)', 'Mindfulness-Based Therapy']
  },
  depression: {
    name: 'Depression Treatment Plan',
    diagnosis: 'Major Depressive Disorder',
    suggestedGoals: [
      {
        title: 'Improve mood and reduce depressive symptoms',
        category: 'symptom_reduction',
        objectives: [
          'Increase engagement in pleasurable activities',
          'Reduce negative self-talk',
          'Improve energy levels'
        ]
      },
      {
        title: 'Establish healthy routines',
        category: 'daily_functioning',
        objectives: [
          'Maintain consistent sleep schedule',
          'Engage in regular physical activity',
          'Establish daily self-care routine'
        ]
      }
    ],
    suggestedModalities: ['Cognitive Behavioral Therapy (CBT)', 'Medication Management']
  },
  trauma: {
    name: 'Trauma Recovery Plan',
    diagnosis: 'Post-Traumatic Stress Disorder',
    suggestedGoals: [
      {
        title: 'Process traumatic experiences safely',
        category: 'trauma_processing',
        objectives: [
          'Develop safety and stabilization skills',
          'Process trauma memories with support',
          'Reduce intrusive symptoms'
        ]
      },
      {
        title: 'Rebuild sense of safety',
        category: 'emotional_regulation',
        objectives: [
          'Identify and manage triggers',
          'Develop grounding techniques',
          'Build support network'
        ]
      }
    ],
    suggestedModalities: ['EMDR', 'Psychodynamic Therapy']
  }
};

// ============================================
// 📝 TREATMENT PLAN CRUD
// ============================================

/**
 * Create a new treatment plan
 */
export const createTreatmentPlan = async (organizationId, planData, createdBy) => {
  const {
    memberId,
    memberName,
    therapistId,
    therapistName,
    diagnosis,
    presentingProblems = [],
    goals = [],
    modalities = [],
    frequency = 'Weekly',
    startDate,
    targetEndDate,
    notes = ''
  } = planData;

  const plan = {
    // Member Info
    memberId,
    memberName,

    // Therapist Info
    therapistId,
    therapistName,

    // Clinical Info
    diagnosis,
    presentingProblems,
    goals: goals.map((goal, idx) => ({
      id: `goal_${Date.now()}_${idx}`,
      ...goal,
      status: GOAL_STATUS.NOT_STARTED,
      progress: 0,
      createdAt: new Date().toISOString(),
      progressHistory: []
    })),
    modalities,
    frequency,

    // Dates
    startDate: startDate || new Date().toISOString().split('T')[0],
    targetEndDate,
    nextReviewDate: calculateNextReviewDate(startDate || new Date()),

    // Status
    status: PLAN_STATUS.ACTIVE,

    // Notes & History
    notes,
    reviews: [],

    // Metadata
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    version: 1
  };

  const docRef = await addDoc(
    collection(db, 'organizations', organizationId, 'treatmentPlans'),
    plan
  );

  // Also save reference on user document
  await updateDoc(doc(db, 'users', memberId), {
    activeTreatmentPlanId: docRef.id,
    treatmentPlanUpdatedAt: serverTimestamp()
  });

  // Audit log
  await logAuditEvent(organizationId, {
    action: 'TREATMENT_PLAN_CREATED',
    actorId: createdBy,
    actorName: therapistName,
    actorRole: 'therapist',
    targetType: 'treatment_plan',
    targetId: docRef.id,
    targetName: memberName,
    details: { diagnosis, goalCount: goals.length }
  });

  return { success: true, id: docRef.id, plan: { id: docRef.id, ...plan } };
};

const calculateNextReviewDate = (startDate) => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + 30); // Default 30-day review
  return date.toISOString().split('T')[0];
};

/**
 * Get treatment plan by ID
 */
export const getTreatmentPlan = async (organizationId, planId) => {
  try {
    const planDoc = await getDoc(
      doc(db, 'organizations', organizationId, 'treatmentPlans', planId)
    );

    if (!planDoc.exists()) return null;

    return {
      id: planDoc.id,
      ...planDoc.data(),
      createdAt: planDoc.data().createdAt?.toDate?.() || planDoc.data().createdAt
    };
  } catch (error) {
    console.error('Error getting treatment plan:', error);
    return null;
  }
};

/**
 * Get member's active treatment plan
 */
export const getMemberTreatmentPlan = async (organizationId, memberId) => {
  try {
    const plansQuery = query(
      collection(db, 'organizations', organizationId, 'treatmentPlans'),
      where('memberId', '==', memberId),
      where('status', '==', PLAN_STATUS.ACTIVE)
    );

    const snapshot = await getDocs(plansQuery);
    if (snapshot.empty) return null;

    const planDoc = snapshot.docs[0];
    return { id: planDoc.id, ...planDoc.data() };
  } catch (error) {
    console.error('Error getting member treatment plan:', error);
    return null;
  }
};

/**
 * Get all treatment plans for a member (including past)
 */
export const getMemberTreatmentPlanHistory = async (organizationId, memberId) => {
  try {
    const plansQuery = query(
      collection(db, 'organizations', organizationId, 'treatmentPlans'),
      where('memberId', '==', memberId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(plansQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting treatment plan history:', error);
    return [];
  }
};

/**
 * Get therapist's caseload treatment plans
 */
export const getTherapistTreatmentPlans = async (organizationId, therapistId) => {
  try {
    const plansQuery = query(
      collection(db, 'organizations', organizationId, 'treatmentPlans'),
      where('therapistId', '==', therapistId),
      where('status', 'in', [PLAN_STATUS.ACTIVE, PLAN_STATUS.ON_HOLD]),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(plansQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting therapist treatment plans:', error);
    return [];
  }
};

/**
 * Get all organization treatment plans
 */
export const getOrgTreatmentPlans = async (organizationId, status = null) => {
  try {
    let plansQuery;

    if (status) {
      plansQuery = query(
        collection(db, 'organizations', organizationId, 'treatmentPlans'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      plansQuery = query(
        collection(db, 'organizations', organizationId, 'treatmentPlans'),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(plansQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting org treatment plans:', error);
    return [];
  }
};

/**
 * Update treatment plan
 */
export const updateTreatmentPlan = async (organizationId, planId, updates, updatedBy) => {
  try {
    const planRef = doc(db, 'organizations', organizationId, 'treatmentPlans', planId);

    await updateDoc(planRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      version: (updates.version || 1) + 1
    });

    // Audit log
    await logAuditEvent(organizationId, {
      action: 'TREATMENT_PLAN_UPDATED',
      actorId: updatedBy,
      actorRole: 'therapist',
      targetType: 'treatment_plan',
      targetId: planId,
      details: { updatedFields: Object.keys(updates) }
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating treatment plan:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// 🎯 GOAL MANAGEMENT
// ============================================

/**
 * Add a goal to treatment plan
 */
export const addGoalToPlan = async (organizationId, planId, goalData, addedBy) => {
  try {
    const planRef = doc(db, 'organizations', organizationId, 'treatmentPlans', planId);
    const planDoc = await getDoc(planRef);

    if (!planDoc.exists()) {
      return { success: false, error: 'Plan not found' };
    }

    const newGoal = {
      id: `goal_${Date.now()}`,
      title: goalData.title,
      description: goalData.description || '',
      category: goalData.category || 'other',
      priority: goalData.priority || GOAL_PRIORITY.MEDIUM,
      objectives: goalData.objectives || [],
      targetDate: goalData.targetDate || null,
      measurementCriteria: goalData.measurementCriteria || '',
      status: GOAL_STATUS.NOT_STARTED,
      progress: 0,
      progressHistory: [],
      createdAt: new Date().toISOString(),
      createdBy: addedBy
    };

    const currentGoals = planDoc.data().goals || [];

    await updateDoc(planRef, {
      goals: [...currentGoals, newGoal],
      updatedAt: serverTimestamp()
    });

    return { success: true, goal: newGoal };
  } catch (error) {
    console.error('Error adding goal:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update goal progress
 */
export const updateGoalProgress = async (organizationId, planId, goalId, progressData, updatedBy) => {
  try {
    const planRef = doc(db, 'organizations', organizationId, 'treatmentPlans', planId);
    const planDoc = await getDoc(planRef);

    if (!planDoc.exists()) {
      return { success: false, error: 'Plan not found' };
    }

    const plan = planDoc.data();
    const goalIndex = plan.goals.findIndex(g => g.id === goalId);

    if (goalIndex === -1) {
      return { success: false, error: 'Goal not found' };
    }

    const updatedGoals = [...plan.goals];
    const goal = updatedGoals[goalIndex];

    // Add progress entry to history
    const progressEntry = {
      date: new Date().toISOString(),
      progress: progressData.progress,
      notes: progressData.notes || '',
      updatedBy
    };

    updatedGoals[goalIndex] = {
      ...goal,
      progress: progressData.progress,
      status: progressData.status || goal.status,
      progressHistory: [...(goal.progressHistory || []), progressEntry],
      lastUpdated: new Date().toISOString()
    };

    // Auto-update status based on progress
    if (progressData.progress >= 100 && goal.status !== GOAL_STATUS.ACHIEVED) {
      updatedGoals[goalIndex].status = GOAL_STATUS.ACHIEVED;
      updatedGoals[goalIndex].achievedDate = new Date().toISOString();
    } else if (progressData.progress > 0 && goal.status === GOAL_STATUS.NOT_STARTED) {
      updatedGoals[goalIndex].status = GOAL_STATUS.IN_PROGRESS;
    }

    await updateDoc(planRef, {
      goals: updatedGoals,
      updatedAt: serverTimestamp()
    });

    return { success: true, goal: updatedGoals[goalIndex] };
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update goal status
 */
export const updateGoalStatus = async (organizationId, planId, goalId, status, notes, updatedBy) => {
  try {
    const planRef = doc(db, 'organizations', organizationId, 'treatmentPlans', planId);
    const planDoc = await getDoc(planRef);

    if (!planDoc.exists()) {
      return { success: false, error: 'Plan not found' };
    }

    const plan = planDoc.data();
    const goalIndex = plan.goals.findIndex(g => g.id === goalId);

    if (goalIndex === -1) {
      return { success: false, error: 'Goal not found' };
    }

    const updatedGoals = [...plan.goals];
    updatedGoals[goalIndex] = {
      ...updatedGoals[goalIndex],
      status,
      statusNotes: notes,
      statusUpdatedAt: new Date().toISOString(),
      statusUpdatedBy: updatedBy
    };

    if (status === GOAL_STATUS.ACHIEVED) {
      updatedGoals[goalIndex].progress = 100;
      updatedGoals[goalIndex].achievedDate = new Date().toISOString();
    }

    await updateDoc(planRef, {
      goals: updatedGoals,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating goal status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete goal from plan
 */
export const removeGoalFromPlan = async (organizationId, planId, goalId, removedBy) => {
  try {
    const planRef = doc(db, 'organizations', organizationId, 'treatmentPlans', planId);
    const planDoc = await getDoc(planRef);

    if (!planDoc.exists()) {
      return { success: false, error: 'Plan not found' };
    }

    const plan = planDoc.data();
    const updatedGoals = plan.goals.filter(g => g.id !== goalId);

    await updateDoc(planRef, {
      goals: updatedGoals,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing goal:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// 📊 PLAN REVIEWS
// ============================================

/**
 * Add a review to the treatment plan
 */
export const addPlanReview = async (organizationId, planId, reviewData, reviewedBy) => {
  try {
    const planRef = doc(db, 'organizations', organizationId, 'treatmentPlans', planId);
    const planDoc = await getDoc(planRef);

    if (!planDoc.exists()) {
      return { success: false, error: 'Plan not found' };
    }

    const plan = planDoc.data();

    const review = {
      id: `review_${Date.now()}`,
      date: new Date().toISOString(),
      reviewedBy,
      overallProgress: reviewData.overallProgress,
      summary: reviewData.summary,
      goalsReviewed: reviewData.goalsReviewed || [],
      recommendations: reviewData.recommendations || '',
      continueCurrentPlan: reviewData.continueCurrentPlan !== false,
      modifications: reviewData.modifications || '',
      nextReviewDate: reviewData.nextReviewDate
    };

    const currentReviews = plan.reviews || [];

    await updateDoc(planRef, {
      reviews: [...currentReviews, review],
      nextReviewDate: reviewData.nextReviewDate,
      lastReviewDate: review.date,
      updatedAt: serverTimestamp()
    });

    // Audit log
    await logAuditEvent(organizationId, {
      action: 'TREATMENT_PLAN_REVIEWED',
      actorId: reviewedBy,
      actorRole: 'therapist',
      targetType: 'treatment_plan',
      targetId: planId,
      details: { overallProgress: reviewData.overallProgress }
    });

    return { success: true, review };
  } catch (error) {
    console.error('Error adding review:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get plans needing review
 */
export const getPlansNeedingReview = async (organizationId, therapistId = null) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    let plansQuery = query(
      collection(db, 'organizations', organizationId, 'treatmentPlans'),
      where('status', '==', PLAN_STATUS.ACTIVE)
    );

    const snapshot = await getDocs(plansQuery);
    let plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by therapist if specified
    if (therapistId) {
      plans = plans.filter(p => p.therapistId === therapistId);
    }

    // Filter to plans needing review
    return plans.filter(p => p.nextReviewDate && p.nextReviewDate <= today);
  } catch (error) {
    console.error('Error getting plans needing review:', error);
    return [];
  }
};

// ============================================
// 📈 PLAN STATUS MANAGEMENT
// ============================================

/**
 * Update plan status
 */
export const updatePlanStatus = async (organizationId, planId, status, notes, updatedBy) => {
  try {
    const planRef = doc(db, 'organizations', organizationId, 'treatmentPlans', planId);

    const updates = {
      status,
      statusNotes: notes,
      statusUpdatedAt: serverTimestamp(),
      statusUpdatedBy: updatedBy,
      updatedAt: serverTimestamp()
    };

    if (status === PLAN_STATUS.COMPLETED) {
      updates.completedDate = new Date().toISOString();
    }

    await updateDoc(planRef, updates);

    // If plan completed/discontinued, clear from user's active plan
    if (status === PLAN_STATUS.COMPLETED || status === PLAN_STATUS.DISCONTINUED) {
      const plan = await getTreatmentPlan(organizationId, planId);
      if (plan) {
        await updateDoc(doc(db, 'users', plan.memberId), {
          activeTreatmentPlanId: null
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating plan status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete treatment plan
 */
export const completeTreatmentPlan = async (organizationId, planId, completionNotes, completedBy) => {
  return updatePlanStatus(
    organizationId,
    planId,
    PLAN_STATUS.COMPLETED,
    completionNotes,
    completedBy
  );
};

/**
 * Put plan on hold
 */
export const putPlanOnHold = async (organizationId, planId, reason, updatedBy) => {
  return updatePlanStatus(
    organizationId,
    planId,
    PLAN_STATUS.ON_HOLD,
    reason,
    updatedBy
  );
};

// ============================================
// 📊 ANALYTICS & REPORTING
// ============================================

/**
 * Calculate overall plan progress
 */
export const calculatePlanProgress = (plan) => {
  if (!plan.goals || plan.goals.length === 0) return 0;

  const totalProgress = plan.goals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
  return Math.round(totalProgress / plan.goals.length);
};

/**
 * Get treatment plan analytics for organization
 */
export const getTreatmentPlanAnalytics = async (organizationId) => {
  try {
    const plans = await getOrgTreatmentPlans(organizationId);

    const analytics = {
      totalPlans: plans.length,
      byStatus: {
        active: plans.filter(p => p.status === PLAN_STATUS.ACTIVE).length,
        completed: plans.filter(p => p.status === PLAN_STATUS.COMPLETED).length,
        onHold: plans.filter(p => p.status === PLAN_STATUS.ON_HOLD).length,
        discontinued: plans.filter(p => p.status === PLAN_STATUS.DISCONTINUED).length
      },
      avgProgress: 0,
      goalStats: {
        total: 0,
        achieved: 0,
        inProgress: 0,
        notStarted: 0
      },
      plansNeedingReview: 0
    };

    let totalProgress = 0;
    const today = new Date().toISOString().split('T')[0];

    plans.forEach(plan => {
      // Calculate progress
      totalProgress += calculatePlanProgress(plan);

      // Count goals
      (plan.goals || []).forEach(goal => {
        analytics.goalStats.total++;
        if (goal.status === GOAL_STATUS.ACHIEVED) analytics.goalStats.achieved++;
        else if (goal.status === GOAL_STATUS.IN_PROGRESS) analytics.goalStats.inProgress++;
        else if (goal.status === GOAL_STATUS.NOT_STARTED) analytics.goalStats.notStarted++;
      });

      // Check if needs review
      if (plan.status === PLAN_STATUS.ACTIVE && plan.nextReviewDate && plan.nextReviewDate <= today) {
        analytics.plansNeedingReview++;
      }
    });

    analytics.avgProgress = plans.length > 0 ? Math.round(totalProgress / plans.length) : 0;
    analytics.goalAchievementRate = analytics.goalStats.total > 0
      ? Math.round((analytics.goalStats.achieved / analytics.goalStats.total) * 100)
      : 0;

    return analytics;
  } catch (error) {
    console.error('Error getting treatment plan analytics:', error);
    return null;
  }
};

/**
 * Generate treatment plan summary for a member
 */
export const generatePlanSummary = (plan) => {
  if (!plan) return null;

  const progress = calculatePlanProgress(plan);
  const achievedGoals = plan.goals?.filter(g => g.status === GOAL_STATUS.ACHIEVED).length || 0;
  const totalGoals = plan.goals?.length || 0;

  return {
    planId: plan.id,
    memberName: plan.memberName,
    therapistName: plan.therapistName,
    diagnosis: plan.diagnosis,
    status: plan.status,
    startDate: plan.startDate,
    progress,
    goalSummary: `${achievedGoals} of ${totalGoals} goals achieved`,
    nextReviewDate: plan.nextReviewDate,
    lastUpdated: plan.updatedAt
  };
};

// ============================================
// 📤 EXPORT
// ============================================

export default {
  PLAN_STATUS,
  GOAL_STATUS,
  GOAL_PRIORITY,
  GOAL_CATEGORIES,
  TREATMENT_MODALITIES,
  PLAN_TEMPLATES,
  createTreatmentPlan,
  getTreatmentPlan,
  getMemberTreatmentPlan,
  getMemberTreatmentPlanHistory,
  getTherapistTreatmentPlans,
  getOrgTreatmentPlans,
  updateTreatmentPlan,
  addGoalToPlan,
  updateGoalProgress,
  updateGoalStatus,
  removeGoalFromPlan,
  addPlanReview,
  getPlansNeedingReview,
  updatePlanStatus,
  completeTreatmentPlan,
  putPlanOnHold,
  calculatePlanProgress,
  getTreatmentPlanAnalytics,
  generatePlanSummary
};
