// FILE: src/services/scheduledCheckinsService.js
// ⏰ Scheduled Check-ins System
// Automated check-in reminders and wellness nudges

import { db } from '../firebase';
import { 
  collection, doc, addDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, Timestamp 
} from 'firebase/firestore';

// ============================================
// 📅 CHECK-IN TYPES
// ============================================

export const CHECKIN_TYPES = {
  DAILY_MOOD: 'daily_mood',           // Daily mood check-in reminder
  WEEKLY_WELLNESS: 'weekly_wellness', // Weekly wellness check
  CUSTOM: 'custom',                   // Custom scheduled check-in
  POST_SESSION: 'post_session',       // After therapy session
  MILESTONE: 'milestone'              // Achievement/milestone check-in
};

export const CHECKIN_FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  ONCE: 'once'
};

export const DEFAULT_CHECKIN_MESSAGES = {
  daily_mood: {
    title: 'Time for your mood check-in! 💜',
    body: 'How are you feeling today? Taking a moment to check in with yourself can make a big difference.',
    cta: 'Log Your Mood'
  },
  weekly_wellness: {
    title: 'Weekly Wellness Check 🌟',
    body: 'It\'s time for your weekly reflection. How has your week been?',
    cta: 'Start Check-in'
  },
  post_session: {
    title: 'How are you feeling after our session? 💭',
    body: 'I wanted to check in and see how you\'re doing since we last talked.',
    cta: 'Share Your Thoughts'
  },
  milestone: {
    title: 'Celebrating Your Progress! 🎉',
    body: 'You\'ve reached a milestone! Let\'s reflect on how far you\'ve come.',
    cta: 'View Progress'
  }
};

// ============================================
// 📝 CREATE SCHEDULED CHECK-IN
// ============================================

export const createScheduledCheckin = async (organizationId, checkin) => {
  const {
    memberId,
    memberName,
    therapistId,
    therapistName,
    type,
    frequency,
    scheduledTime,      // Time of day (HH:MM format)
    scheduledDays = [], // Days of week for weekly [0-6, 0=Sunday]
    startDate,
    endDate = null,
    customMessage = null,
    isActive = true
  } = checkin;

  const checkinData = {
    memberId,
    memberName,
    therapistId,
    therapistName,
    organizationId,
    type,
    frequency,
    scheduledTime,
    scheduledDays,
    startDate: startDate || new Date().toISOString(),
    endDate,
    customMessage,
    isActive,
    createdAt: new Date().toISOString(),
    lastSentAt: null,
    nextScheduledAt: calculateNextScheduledTime(frequency, scheduledTime, scheduledDays)
  };

  const docRef = await addDoc(
    collection(db, 'organizations', organizationId, 'scheduledCheckins'),
    checkinData
  );

  return { id: docRef.id, ...checkinData };
};

// Calculate next scheduled time
const calculateNextScheduledTime = (frequency, time, days) => {
  const now = new Date();
  const [hours, minutes] = (time || '09:00').split(':').map(Number);
  
  let next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, start from tomorrow
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  switch (frequency) {
    case CHECKIN_FREQUENCIES.DAILY:
      // Already set to next occurrence
      break;
    case CHECKIN_FREQUENCIES.WEEKLY:
      // Find next matching day
      if (days && days.length > 0) {
        while (!days.includes(next.getDay())) {
          next.setDate(next.getDate() + 1);
        }
      }
      break;
    case CHECKIN_FREQUENCIES.BIWEEKLY:
      next.setDate(next.getDate() + 14);
      break;
    case CHECKIN_FREQUENCIES.MONTHLY:
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      break;
  }

  return next.toISOString();
};

// ============================================
// 📖 GET SCHEDULED CHECK-INS
// ============================================

// Get all check-ins for a member
export const getMemberScheduledCheckins = async (memberId) => {
  // This would need to query across organizations
  // For now, return from user's document
  const userDoc = await getDocs(doc(db, 'users', memberId));
  return userDoc.data()?.scheduledCheckins || [];
};

// Get all check-ins for an organization
export const getOrgScheduledCheckins = async (organizationId) => {
  const checkinsQuery = query(
    collection(db, 'organizations', organizationId, 'scheduledCheckins'),
    where('isActive', '==', true),
    orderBy('nextScheduledAt', 'asc')
  );
  
  const snapshot = await getDocs(checkinsQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get check-ins due now (for processing)
export const getDueCheckins = async (organizationId) => {
  const now = new Date().toISOString();
  
  const checkinsQuery = query(
    collection(db, 'organizations', organizationId, 'scheduledCheckins'),
    where('isActive', '==', true),
    where('nextScheduledAt', '<=', now)
  );
  
  const snapshot = await getDocs(checkinsQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get therapist's scheduled check-ins
export const getTherapistScheduledCheckins = async (organizationId, therapistId) => {
  const checkinsQuery = query(
    collection(db, 'organizations', organizationId, 'scheduledCheckins'),
    where('therapistId', '==', therapistId),
    where('isActive', '==', true)
  );
  
  const snapshot = await getDocs(checkinsQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ============================================
// ✏️ UPDATE CHECK-IN
// ============================================

export const updateScheduledCheckin = async (organizationId, checkinId, updates) => {
  const checkinRef = doc(db, 'organizations', organizationId, 'scheduledCheckins', checkinId);
  
  // Recalculate next scheduled time if frequency/time changed
  if (updates.frequency || updates.scheduledTime || updates.scheduledDays) {
    updates.nextScheduledAt = calculateNextScheduledTime(
      updates.frequency,
      updates.scheduledTime,
      updates.scheduledDays
    );
  }

  await updateDoc(checkinRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  });

  return { success: true };
};

// Pause check-in
export const pauseScheduledCheckin = async (organizationId, checkinId) => {
  return updateScheduledCheckin(organizationId, checkinId, { isActive: false });
};

// Resume check-in
export const resumeScheduledCheckin = async (organizationId, checkinId) => {
  const checkinRef = doc(db, 'organizations', organizationId, 'scheduledCheckins', checkinId);
  const checkinDoc = await getDocs(checkinRef);
  const data = checkinDoc.data();
  
  return updateScheduledCheckin(organizationId, checkinId, { 
    isActive: true,
    nextScheduledAt: calculateNextScheduledTime(data.frequency, data.scheduledTime, data.scheduledDays)
  });
};

// Delete check-in
export const deleteScheduledCheckin = async (organizationId, checkinId) => {
  await deleteDoc(doc(db, 'organizations', organizationId, 'scheduledCheckins', checkinId));
  return { success: true };
};

// ============================================
// 🚀 PROCESS CHECK-INS (Called by scheduler)
// ============================================

// This would typically be called by a Cloud Function on a schedule
export const processScheduledCheckins = async (organizationId) => {
  const dueCheckins = await getDueCheckins(organizationId);
  const results = [];

  for (const checkin of dueCheckins) {
    try {
      // Send the check-in notification
      await sendCheckinNotification(checkin);

      // Update the check-in record
      const checkinRef = doc(db, 'organizations', organizationId, 'scheduledCheckins', checkin.id);
      
      if (checkin.frequency === CHECKIN_FREQUENCIES.ONCE) {
        // One-time check-in - mark as complete
        await updateDoc(checkinRef, {
          isActive: false,
          completedAt: new Date().toISOString()
        });
      } else {
        // Recurring - calculate next time
        await updateDoc(checkinRef, {
          lastSentAt: new Date().toISOString(),
          nextScheduledAt: calculateNextScheduledTime(
            checkin.frequency,
            checkin.scheduledTime,
            checkin.scheduledDays
          )
        });
      }

      // Check if end date reached
      if (checkin.endDate && new Date(checkin.endDate) < new Date()) {
        await updateDoc(checkinRef, { isActive: false });
      }

      results.push({ id: checkin.id, success: true });
    } catch (error) {
      console.error(`Error processing check-in ${checkin.id}:`, error);
      results.push({ id: checkin.id, success: false, error: error.message });
    }
  }

  return { processed: results.length, results };
};

// Send check-in notification to member
const sendCheckinNotification = async (checkin) => {
  const message = checkin.customMessage || DEFAULT_CHECKIN_MESSAGES[checkin.type];
  
  // Create notification in member's notifications collection
  await addDoc(collection(db, 'users', checkin.memberId, 'notifications'), {
    type: 'scheduled_checkin',
    checkinType: checkin.type,
    title: message.title,
    body: message.body,
    cta: message.cta,
    fromTherapist: checkin.therapistId,
    fromTherapistName: checkin.therapistName,
    createdAt: new Date().toISOString(),
    read: false
  });

  // TODO: Also trigger push notification if enabled
  // TODO: Also send email if configured

  return { success: true };
};

// ============================================
// 📊 CHECK-IN RESPONSE TRACKING
// ============================================

// Record member's response to check-in
export const recordCheckinResponse = async (memberId, checkinId, response) => {
  const {
    mood,
    notes,
    answers = {}
  } = response;

  const responseData = {
    checkinId,
    memberId,
    mood,
    notes,
    answers,
    respondedAt: new Date().toISOString()
  };

  // Store response
  await addDoc(collection(db, 'users', memberId, 'checkinResponses'), responseData);

  // Also update mood history if mood provided
  if (mood) {
    const userRef = doc(db, 'users', memberId);
    const userDoc = await getDocs(userRef);
    const userData = userDoc.data();
    
    await updateDoc(userRef, {
      moodHistory: [...(userData.moodHistory || []), {
        mood,
        timestamp: responseData.respondedAt,
        source: 'scheduled_checkin',
        checkinId
      }]
    });
  }

  return { success: true, response: responseData };
};

// Get check-in completion rate
export const getCheckinCompletionRate = async (organizationId, memberId = null, days = 30) => {
  // This is a simplified version - production would need more complex queries
  const checkinsQuery = query(
    collection(db, 'organizations', organizationId, 'scheduledCheckins'),
    where('isActive', '==', true)
  );
  
  const checkins = await getDocs(checkinsQuery);
  
  // For now, return mock completion rate
  // Real implementation would compare sent vs responses
  return {
    totalSent: checkins.docs.length * (days / 7), // Rough estimate
    totalResponded: Math.floor(checkins.docs.length * (days / 7) * 0.7),
    completionRate: 70 // Placeholder
  };
};

// ============================================
// 🎯 QUICK SCHEDULE HELPERS
// ============================================

// Schedule daily mood check-in
export const scheduleDailyMoodCheckin = async (organizationId, memberId, memberName, therapistId, therapistName, time = '09:00') => {
  return createScheduledCheckin(organizationId, {
    memberId,
    memberName,
    therapistId,
    therapistName,
    type: CHECKIN_TYPES.DAILY_MOOD,
    frequency: CHECKIN_FREQUENCIES.DAILY,
    scheduledTime: time
  });
};

// Schedule weekly check-in
export const scheduleWeeklyCheckin = async (organizationId, memberId, memberName, therapistId, therapistName, dayOfWeek = 1, time = '10:00') => {
  return createScheduledCheckin(organizationId, {
    memberId,
    memberName,
    therapistId,
    therapistName,
    type: CHECKIN_TYPES.WEEKLY_WELLNESS,
    frequency: CHECKIN_FREQUENCIES.WEEKLY,
    scheduledTime: time,
    scheduledDays: [dayOfWeek]
  });
};

// Schedule post-session follow-up
export const schedulePostSessionCheckin = async (organizationId, memberId, memberName, therapistId, therapistName, sessionDate) => {
  const followUpDate = new Date(sessionDate);
  followUpDate.setDate(followUpDate.getDate() + 2); // 2 days after session
  
  return createScheduledCheckin(organizationId, {
    memberId,
    memberName,
    therapistId,
    therapistName,
    type: CHECKIN_TYPES.POST_SESSION,
    frequency: CHECKIN_FREQUENCIES.ONCE,
    scheduledTime: '14:00',
    startDate: followUpDate.toISOString()
  });
};

export default {
  CHECKIN_TYPES,
  CHECKIN_FREQUENCIES,
  DEFAULT_CHECKIN_MESSAGES,
  createScheduledCheckin,
  getMemberScheduledCheckins,
  getOrgScheduledCheckins,
  getDueCheckins,
  getTherapistScheduledCheckins,
  updateScheduledCheckin,
  pauseScheduledCheckin,
  resumeScheduledCheckin,
  deleteScheduledCheckin,
  processScheduledCheckins,
  recordCheckinResponse,
  getCheckinCompletionRate,
  scheduleDailyMoodCheckin,
  scheduleWeeklyCheckin,
  schedulePostSessionCheckin
};
