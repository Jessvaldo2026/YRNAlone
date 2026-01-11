// FILE: src/services/sessionService.js
// 📝 Therapist Session Notes Service
// Save and manage session notes with patients

import { db } from '../firebase';
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc,
  getDocs, query, where, orderBy, limit, serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { logAuditEvent } from './auditService';

// ============================================
// 📋 SESSION TYPES & TEMPLATES
// ============================================

export const SESSION_TYPES = {
  INITIAL_ASSESSMENT: 'initial_assessment',
  FOLLOW_UP: 'follow_up',
  CRISIS_INTERVENTION: 'crisis_intervention',
  CHECK_IN: 'check_in',
  DISCHARGE: 'discharge',
  GROUP_SESSION: 'group_session',
  SOAP_NOTE: 'soap_note',
  PROGRESS_NOTE: 'progress_note',
  CUSTOM: 'custom'
};

export const SESSION_TEMPLATES = {
  initial_assessment: {
    name: 'Initial Assessment',
    icon: '📋',
    sections: [
      { id: 'presenting_concerns', label: 'Presenting Concerns', placeholder: 'What brings the patient in today?' },
      { id: 'history', label: 'Relevant History', placeholder: 'Mental health history, previous treatment...' },
      { id: 'current_symptoms', label: 'Current Symptoms', placeholder: 'Mood, sleep, appetite, energy levels...' },
      { id: 'risk_assessment', label: 'Risk Assessment', placeholder: 'Suicidal ideation, self-harm, safety concerns...' },
      { id: 'initial_impressions', label: 'Initial Impressions', placeholder: 'Preliminary observations and diagnosis considerations...' },
      { id: 'treatment_plan', label: 'Treatment Plan', placeholder: 'Recommended approach, frequency, goals...' }
    ]
  },
  follow_up: {
    name: 'Follow-Up Session',
    icon: '🔄',
    sections: [
      { id: 'check_in', label: 'Session Check-In', placeholder: 'How has the patient been since last session?' },
      { id: 'mood_status', label: 'Current Mood/Status', placeholder: 'Mood rating, energy, sleep quality...' },
      { id: 'progress', label: 'Progress on Goals', placeholder: 'What progress has been made?' },
      { id: 'discussion', label: 'Session Discussion', placeholder: 'Key topics discussed...' },
      { id: 'interventions', label: 'Interventions Used', placeholder: 'CBT, mindfulness, etc...' },
      { id: 'homework', label: 'Homework/Next Steps', placeholder: 'Assignments for next session...' }
    ]
  },
  crisis_intervention: {
    name: 'Crisis Intervention',
    icon: '🚨',
    sections: [
      { id: 'crisis_nature', label: 'Nature of Crisis', placeholder: 'What triggered this session?' },
      { id: 'risk_level', label: 'Risk Level Assessment', placeholder: 'Current risk: Low / Medium / High / Imminent' },
      { id: 'safety_plan', label: 'Safety Plan', placeholder: 'Steps to ensure patient safety...' },
      { id: 'interventions', label: 'Immediate Interventions', placeholder: 'Actions taken during session...' },
      { id: 'follow_up_plan', label: 'Follow-Up Plan', placeholder: 'Next contact, check-in schedule...' },
      { id: 'resources_provided', label: 'Resources Provided', placeholder: 'Hotlines, emergency contacts, materials...' }
    ]
  },
  check_in: {
    name: 'Quick Check-In',
    icon: '👋',
    sections: [
      { id: 'mood', label: 'Current Mood (1-10)', placeholder: 'Rate and describe...' },
      { id: 'since_last', label: 'Since Last Contact', placeholder: 'Any significant events or changes?' },
      { id: 'concerns', label: 'Current Concerns', placeholder: 'What\'s on their mind?' },
      { id: 'support_given', label: 'Support Provided', placeholder: 'Brief notes on support given...' }
    ]
  },
  discharge: {
    name: 'Discharge Summary',
    icon: '✅',
    sections: [
      { id: 'treatment_summary', label: 'Treatment Summary', placeholder: 'Overview of treatment provided...' },
      { id: 'progress_made', label: 'Progress Made', placeholder: 'Goals achieved, improvements noted...' },
      { id: 'discharge_reason', label: 'Reason for Discharge', placeholder: 'Completed treatment, referral, etc...' },
      { id: 'recommendations', label: 'Recommendations', placeholder: 'Ongoing self-care, follow-up if needed...' },
      { id: 'referrals', label: 'Referrals Made', placeholder: 'Other providers, resources...' }
    ]
  },
  // 📝 SOAP NOTE - Medical Standard
  soap_note: {
    name: 'SOAP Note',
    icon: '🩺',
    sections: [
      { id: 'subjective', label: 'S - Subjective', placeholder: 'Patient\'s self-report: symptoms, concerns, history...' },
      { id: 'objective', label: 'O - Objective', placeholder: 'Observable data: behavior, appearance, test results...' },
      { id: 'assessment', label: 'A - Assessment', placeholder: 'Clinical assessment: diagnosis, interpretation...' },
      { id: 'plan', label: 'P - Plan', placeholder: 'Treatment plan: interventions, medications, follow-up...' }
    ]
  },
  // 📊 PROGRESS NOTE
  progress_note: {
    name: 'Progress Note',
    icon: '📈',
    sections: [
      { id: 'date_time', label: 'Date & Duration', placeholder: 'Session date and length...' },
      { id: 'progress', label: 'Progress Since Last Session', placeholder: 'Changes, improvements, setbacks...' },
      { id: 'current_status', label: 'Current Mental Status', placeholder: 'Mood, affect, thought process...' },
      { id: 'interventions', label: 'Interventions Used', placeholder: 'Therapeutic techniques applied...' },
      { id: 'response', label: 'Patient Response', placeholder: 'How patient responded to interventions...' },
      { id: 'next_steps', label: 'Plan for Next Session', placeholder: 'Goals and focus for next meeting...' }
    ]
  }
};

// 🎨 NOTE THEMES FOR CUSTOMIZATION
export const NOTE_THEMES = {
  professional: { name: 'Professional', bg: '#f8fafc', accent: '#3b82f6', text: '#1e293b' },
  calm: { name: 'Calm & Serene', bg: '#f0fdf4', accent: '#22c55e', text: '#166534' },
  warm: { name: 'Warm & Friendly', bg: '#fffbeb', accent: '#f59e0b', text: '#92400e' },
  soft: { name: 'Soft Pink', bg: '#fdf2f8', accent: '#ec4899', text: '#9d174d' },
  ocean: { name: 'Ocean Blue', bg: '#f0f9ff', accent: '#0ea5e9', text: '#0c4a6e' },
  lavender: { name: 'Lavender', bg: '#faf5ff', accent: '#a855f7', text: '#581c87' }
};

// Quick note templates for fast entry
export const QUICK_NOTES = [
  { id: 'mood_improved', text: 'Patient reports mood has improved since last session.' },
  { id: 'mood_stable', text: 'Mood remains stable. No significant changes reported.' },
  { id: 'mood_declined', text: 'Patient reports mood has declined. Further assessment needed.' },
  { id: 'sleep_issues', text: 'Patient reports ongoing sleep difficulties.' },
  { id: 'anxiety_high', text: 'Elevated anxiety noted during session.' },
  { id: 'coping_well', text: 'Patient demonstrating effective use of coping strategies.' },
  { id: 'medication_compliant', text: 'Patient reports medication compliance.' },
  { id: 'homework_completed', text: 'Homework assignments completed as discussed.' },
  { id: 'no_si', text: 'No suicidal ideation reported. Safety plan reviewed.' },
  { id: 'next_session', text: 'Next session scheduled. Patient agreeable to treatment plan.' }
];

// ============================================
// 🎨 CUSTOM TEMPLATE MANAGEMENT
// ============================================

/**
 * Get therapist's custom templates
 */
export const getCustomTemplates = async (organizationId, therapistId) => {
  try {
    const templatesRef = collection(db, 'organizations', organizationId, 'customTemplates');
    const q = query(templatesRef, where('therapistId', '==', therapistId));
    const snapshot = await getDocs(q);
    
    const templates = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      templates[doc.id] = { id: doc.id, ...data };
    });
    return templates;
  } catch (err) {
    console.error('Error getting custom templates:', err);
    return {};
  }
};

/**
 * Create a custom template
 */
export const createCustomTemplate = async (organizationId, therapistId, templateData) => {
  try {
    const templatesRef = collection(db, 'organizations', organizationId, 'customTemplates');
    const docRef = await addDoc(templatesRef, {
      ...templateData,
      therapistId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    console.error('Error creating template:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Update a custom template
 */
export const updateCustomTemplate = async (organizationId, templateId, updates) => {
  try {
    const templateRef = doc(db, 'organizations', organizationId, 'customTemplates', templateId);
    await updateDoc(templateRef, { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (err) {
    console.error('Error updating template:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Delete a custom template
 */
export const deleteCustomTemplate = async (organizationId, templateId) => {
  try {
    await deleteDoc(doc(db, 'organizations', organizationId, 'customTemplates', templateId));
    return { success: true };
  } catch (err) {
    console.error('Error deleting template:', err);
    return { success: false, error: err.message };
  }
};

// ============================================
// 📥 EXPORT/DOWNLOAD NOTES
// ============================================

/**
 * Export session notes as formatted text
 */
export const exportSessionAsText = (session, template, patientName, therapistName) => {
  const date = session.createdAt?.toDate?.() || new Date();
  let content = `
═══════════════════════════════════════════════════════════
                    SESSION NOTES
═══════════════════════════════════════════════════════════

Patient: ${patientName}
Therapist: ${therapistName}
Date: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}
Session Type: ${template?.name || session.type}
Duration: ${session.duration || 'N/A'} minutes

───────────────────────────────────────────────────────────
                    SESSION CONTENT
───────────────────────────────────────────────────────────
`;

  // Add structured notes
  if (session.notes && template?.sections) {
    template.sections.forEach(section => {
      if (session.notes[section.id]) {
        content += `\n📝 ${section.label}\n${'-'.repeat(40)}\n${session.notes[section.id]}\n`;
      }
    });
  }

  // Add freeform notes
  if (session.freeformNotes) {
    content += `\n📝 Additional Notes\n${'-'.repeat(40)}\n${session.freeformNotes}\n`;
  }

  // Add quick notes
  if (session.quickNotes?.length > 0) {
    content += `\n✓ Quick Notes\n${'-'.repeat(40)}\n`;
    session.quickNotes.forEach(noteId => {
      const note = QUICK_NOTES.find(n => n.id === noteId);
      if (note) content += `• ${note.text}\n`;
    });
  }

  // Add action items
  if (session.actionItems?.length > 0) {
    content += `\n📋 Action Items\n${'-'.repeat(40)}\n`;
    session.actionItems.forEach(item => {
      content += `${item.completed ? '✓' : '○'} ${item.text}\n`;
    });
  }

  // Add mood tracking
  if (session.patientMoodStart || session.patientMoodEnd) {
    content += `\n😊 Mood Tracking\n${'-'.repeat(40)}\n`;
    if (session.patientMoodStart) content += `Start: ${session.patientMoodStart}/5\n`;
    if (session.patientMoodEnd) content += `End: ${session.patientMoodEnd}/5\n`;
  }

  content += `
═══════════════════════════════════════════════════════════
                    END OF SESSION NOTES
═══════════════════════════════════════════════════════════
Generated by YRNAlone • ${new Date().toLocaleDateString()}
`;

  return content;
};

/**
 * Download session notes as file
 */
export const downloadSessionNotes = (session, template, patientName, therapistName) => {
  const content = exportSessionAsText(session, template, patientName, therapistName);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `session-notes-${patientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export all patient sessions
 */
export const exportAllPatientSessions = async (organizationId, memberId, patientName, therapistName) => {
  try {
    const sessions = await getMemberSessions(organizationId, memberId, 100);
    let allContent = `
╔═══════════════════════════════════════════════════════════╗
║           COMPLETE SESSION HISTORY                        ║
║           Patient: ${patientName.padEnd(35)}║
╚═══════════════════════════════════════════════════════════╝

Total Sessions: ${sessions.length}
Export Date: ${new Date().toLocaleDateString()}

`;
    sessions.forEach((session, index) => {
      const template = SESSION_TEMPLATES[session.type];
      allContent += `\n${'═'.repeat(60)}\nSESSION ${index + 1}\n`;
      allContent += exportSessionAsText(session, template, patientName, therapistName);
    });

    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-sessions-${patientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true };
  } catch (err) {
    console.error('Error exporting sessions:', err);
    return { success: false, error: err.message };
  }
};

// ============================================
// 📝 SESSION CRUD OPERATIONS
// ============================================

/**
 * Create a new session note
 */
export const createSession = async (organizationId, therapistId, memberId, sessionData) => {
  try {
    const sessionRef = collection(db, 'organizations', organizationId, 'sessions');
    
    const session = {
      therapistId,
      memberId,
      type: sessionData.type || SESSION_TYPES.FOLLOW_UP,
      status: 'in_progress', // in_progress, completed, cancelled
      
      // Session content
      notes: sessionData.notes || {},
      quickNotes: sessionData.quickNotes || [],
      freeformNotes: sessionData.freeformNotes || '',
      
      // Metadata
      startedAt: serverTimestamp(),
      completedAt: null,
      duration: null, // in minutes
      
      // Patient mood at session
      patientMoodStart: sessionData.patientMoodStart || null,
      patientMoodEnd: sessionData.patientMoodEnd || null,
      
      // Follow-up
      nextSessionDate: sessionData.nextSessionDate || null,
      actionItems: sessionData.actionItems || [],
      
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(sessionRef, session);

    // Log for HIPAA
    await logAuditEvent({
      action: 'CREATE_SESSION',
      actorId: therapistId,
      targetType: 'session',
      targetId: docRef.id,
      details: { memberId, sessionType: session.type }
    }, organizationId);

    return { success: true, sessionId: docRef.id };
  } catch (error) {
    console.error('Error creating session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update session notes (auto-save)
 */
export const updateSession = async (organizationId, sessionId, updates) => {
  try {
    const sessionRef = doc(db, 'organizations', organizationId, 'sessions', sessionId);
    
    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Complete/finalize a session
 */
export const completeSession = async (organizationId, sessionId, therapistId, finalData = {}) => {
  try {
    const sessionRef = doc(db, 'organizations', organizationId, 'sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      return { success: false, error: 'Session not found' };
    }

    const sessionData = sessionDoc.data();
    const startTime = sessionData.startedAt?.toDate() || new Date();
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 60000); // minutes

    await updateDoc(sessionRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
      duration,
      patientMoodEnd: finalData.patientMoodEnd || null,
      summary: finalData.summary || '',
      ...finalData,
      updatedAt: serverTimestamp()
    });

    // Log for HIPAA
    await logAuditEvent({
      action: 'COMPLETE_SESSION',
      actorId: therapistId,
      targetType: 'session',
      targetId: sessionId,
      details: { duration, memberId: sessionData.memberId }
    }, organizationId);

    return { success: true, duration };
  } catch (error) {
    console.error('Error completing session:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get a single session
 */
export const getSession = async (organizationId, sessionId) => {
  try {
    const sessionRef = doc(db, 'organizations', organizationId, 'sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      return null;
    }

    return { id: sessionDoc.id, ...sessionDoc.data() };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

/**
 * Get all sessions for a member
 */
export const getMemberSessions = async (organizationId, memberId, limitCount = 20) => {
  try {
    const sessionsRef = collection(db, 'organizations', organizationId, 'sessions');
    const q = query(
      sessionsRef,
      where('memberId', '==', memberId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting member sessions:', error);
    return [];
  }
};

/**
 * Get all sessions for a therapist
 */
export const getTherapistSessions = async (organizationId, therapistId, options = {}) => {
  try {
    const sessionsRef = collection(db, 'organizations', organizationId, 'sessions');
    let q = query(
      sessionsRef,
      where('therapistId', '==', therapistId),
      orderBy('createdAt', 'desc'),
      limit(options.limit || 50)
    );

    // Filter by status if provided
    if (options.status) {
      q = query(
        sessionsRef,
        where('therapistId', '==', therapistId),
        where('status', '==', options.status),
        orderBy('createdAt', 'desc'),
        limit(options.limit || 50)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting therapist sessions:', error);
    return [];
  }
};

/**
 * Get today's sessions for a therapist
 */
export const getTodaysSessions = async (organizationId, therapistId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessionsRef = collection(db, 'organizations', organizationId, 'sessions');
    const q = query(
      sessionsRef,
      where('therapistId', '==', therapistId),
      where('createdAt', '>=', Timestamp.fromDate(today)),
      where('createdAt', '<', Timestamp.fromDate(tomorrow)),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting today\'s sessions:', error);
    return [];
  }
};

/**
 * Delete a session (soft delete - marks as cancelled)
 */
export const cancelSession = async (organizationId, sessionId, therapistId, reason = '') => {
  try {
    const sessionRef = doc(db, 'organizations', organizationId, 'sessions', sessionId);
    
    await updateDoc(sessionRef, {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancelReason: reason,
      updatedAt: serverTimestamp()
    });

    await logAuditEvent({
      action: 'CANCEL_SESSION',
      actorId: therapistId,
      targetType: 'session',
      targetId: sessionId,
      details: { reason }
    }, organizationId);

    return { success: true };
  } catch (error) {
    console.error('Error cancelling session:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// 📊 SESSION ANALYTICS
// ============================================

/**
 * Get session statistics for a therapist
 */
export const getTherapistSessionStats = async (organizationId, therapistId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessionsRef = collection(db, 'organizations', organizationId, 'sessions');
    const q = query(
      sessionsRef,
      where('therapistId', '==', therapistId),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(doc => doc.data());

    const completed = sessions.filter(s => s.status === 'completed');
    const totalDuration = completed.reduce((sum, s) => sum + (s.duration || 0), 0);

    return {
      totalSessions: sessions.length,
      completedSessions: completed.length,
      cancelledSessions: sessions.filter(s => s.status === 'cancelled').length,
      inProgressSessions: sessions.filter(s => s.status === 'in_progress').length,
      averageDuration: completed.length > 0 ? Math.round(totalDuration / completed.length) : 0,
      totalHours: Math.round(totalDuration / 60 * 10) / 10,
      byType: sessions.reduce((acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1;
        return acc;
      }, {})
    };
  } catch (error) {
    console.error('Error getting session stats:', error);
    return null;
  }
};

export default {
  SESSION_TYPES,
  SESSION_TEMPLATES,
  QUICK_NOTES,
  createSession,
  updateSession,
  completeSession,
  getSession,
  getMemberSessions,
  getTherapistSessions,
  getTodaysSessions,
  cancelSession,
  getTherapistSessionStats
};
