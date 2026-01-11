// FILE: src/services/surveyService.js
// 📊 Admin Survey Service - Send custom surveys to patients
// Organizations can gather feedback and assess patient needs

import { db } from '../firebase';
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc,
  getDocs, query, where, orderBy, serverTimestamp
} from 'firebase/firestore';
import { logAuditEvent } from './auditService';

// ============================================
// 📋 SURVEY TEMPLATES
// ============================================

export const SURVEY_TEMPLATES = {
  satisfaction: {
    name: 'Patient Satisfaction',
    icon: '😊',
    description: 'Measure patient satisfaction with services',
    questions: [
      { id: 'q1', type: 'rating', question: 'How satisfied are you with our services?', scale: 5 },
      { id: 'q2', type: 'rating', question: 'How likely are you to recommend us?', scale: 10 },
      { id: 'q3', type: 'text', question: 'What could we improve?' },
      { id: 'q4', type: 'choice', question: 'Would you use our services again?', options: ['Definitely', 'Probably', 'Not sure', 'Probably not', 'Definitely not'] }
    ]
  },
  intake: {
    name: 'Patient Intake',
    icon: '📋',
    description: 'Initial patient assessment questions',
    questions: [
      { id: 'q1', type: 'text', question: 'What brings you to seek support today?' },
      { id: 'q2', type: 'choice', question: 'Have you received mental health support before?', options: ['Yes, currently', 'Yes, in the past', 'No, this is my first time'] },
      { id: 'q3', type: 'multiselect', question: 'What areas would you like support with?', options: ['Anxiety', 'Depression', 'Relationships', 'Work/School', 'Grief', 'Trauma', 'Self-esteem', 'Other'] },
      { id: 'q4', type: 'rating', question: 'How would you rate your current mental wellbeing?', scale: 10 }
    ]
  },
  wellbeing: {
    name: 'Wellbeing Check',
    icon: '💜',
    description: 'Regular wellbeing assessment',
    questions: [
      { id: 'q1', type: 'rating', question: 'How are you feeling today overall?', scale: 5 },
      { id: 'q2', type: 'rating', question: 'How well did you sleep last night?', scale: 5 },
      { id: 'q3', type: 'rating', question: 'How would you rate your energy level?', scale: 5 },
      { id: 'q4', type: 'rating', question: 'How anxious have you felt today?', scale: 5 },
      { id: 'q5', type: 'text', question: 'Anything specific on your mind?' }
    ]
  },
  phq9: {
    name: 'PHQ-9 Depression Screen',
    icon: '📊',
    description: 'Standard depression screening questionnaire',
    questions: [
      { id: 'q1', type: 'choice', question: 'Little interest or pleasure in doing things?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      { id: 'q2', type: 'choice', question: 'Feeling down, depressed, or hopeless?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      { id: 'q3', type: 'choice', question: 'Trouble falling or staying asleep, or sleeping too much?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      { id: 'q4', type: 'choice', question: 'Feeling tired or having little energy?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      { id: 'q5', type: 'choice', question: 'Poor appetite or overeating?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      { id: 'q6', type: 'choice', question: 'Feeling bad about yourself?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      { id: 'q7', type: 'choice', question: 'Trouble concentrating on things?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      { id: 'q8', type: 'choice', question: 'Moving or speaking slowly, or being fidgety/restless?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      { id: 'q9', type: 'choice', question: 'Thoughts that you would be better off dead or of hurting yourself?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
    ]
  },
  gad7: {
    name: 'GAD-7 Anxiety Screen',
    icon: '😰',
    description: 'Standard anxiety screening questionnaire',
    questions: [
      { id: 'q1', type: 'choice', question: 'Feeling nervous, anxious, or on edge?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      { id: 'q2', type: 'choice', question: 'Not being able to stop or control worrying?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      { id: 'q3', type: 'choice', question: 'Worrying too much about different things?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      { id: 'q4', type: 'choice', question: 'Trouble relaxing?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      { id: 'q5', type: 'choice', question: 'Being so restless that it\'s hard to sit still?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      { id: 'q6', type: 'choice', question: 'Becoming easily annoyed or irritable?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
      { id: 'q7', type: 'choice', question: 'Feeling afraid as if something awful might happen?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
    ]
  },
  feedback: {
    name: 'General Feedback',
    icon: '💬',
    description: 'Open feedback form',
    questions: [
      { id: 'q1', type: 'text', question: 'What do you like most about our app?' },
      { id: 'q2', type: 'text', question: 'What features would you like to see added?' },
      { id: 'q3', type: 'text', question: 'Is there anything that frustrates you about the app?' },
      { id: 'q4', type: 'rating', question: 'Overall, how would you rate your experience?', scale: 5 }
    ]
  }
};

// Question types
export const QUESTION_TYPES = {
  TEXT: 'text',
  RATING: 'rating',
  CHOICE: 'choice',
  MULTISELECT: 'multiselect',
  YESNO: 'yesno',
  DATE: 'date'
};

// ============================================
// 📝 SURVEY CRUD OPERATIONS
// ============================================

/**
 * Create a new survey
 */
export const createSurvey = async (organizationId, surveyData, createdBy) => {
  try {
    const surveyRef = collection(db, 'organizations', organizationId, 'surveys');
    
    const survey = {
      title: surveyData.title,
      description: surveyData.description || '',
      templateId: surveyData.templateId || null,
      questions: surveyData.questions || [],
      status: 'draft', // draft, active, closed
      
      // Targeting
      targetAll: surveyData.targetAll !== false,
      targetPatientIds: surveyData.targetPatientIds || [],
      
      // Settings
      anonymous: surveyData.anonymous || false,
      required: surveyData.required || false,
      expiresAt: surveyData.expiresAt || null,
      
      // Metadata
      createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      responseCount: 0
    };
    
    const docRef = await addDoc(surveyRef, survey);
    
    await logAuditEvent(organizationId, {
      action: 'SURVEY_CREATED',
      performedBy: createdBy,
      details: { surveyId: docRef.id, title: survey.title }
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating survey:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all surveys for organization
 */
export const getOrgSurveys = async (organizationId, status = null) => {
  try {
    const surveysRef = collection(db, 'organizations', organizationId, 'surveys');
    let q = query(surveysRef, orderBy('createdAt', 'desc'));
    
    if (status) {
      q = query(surveysRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    const surveys = [];
    snapshot.forEach(doc => {
      surveys.push({ id: doc.id, ...doc.data() });
    });
    return surveys;
  } catch (error) {
    console.error('Error getting surveys:', error);
    return [];
  }
};

/**
 * Get surveys for a specific patient
 */
export const getPatientSurveys = async (organizationId, patientId) => {
  try {
    const surveysRef = collection(db, 'organizations', organizationId, 'surveys');
    const q = query(surveysRef, where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    
    const surveys = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Include if targeting all or specifically this patient
      if (data.targetAll || data.targetPatientIds?.includes(patientId)) {
        surveys.push({ id: doc.id, ...data });
      }
    });
    return surveys;
  } catch (error) {
    console.error('Error getting patient surveys:', error);
    return [];
  }
};

/**
 * Activate a survey (make it available to patients)
 */
export const activateSurvey = async (organizationId, surveyId) => {
  try {
    await updateDoc(doc(db, 'organizations', organizationId, 'surveys', surveyId), {
      status: 'active',
      activatedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error activating survey:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Close a survey
 */
export const closeSurvey = async (organizationId, surveyId) => {
  try {
    await updateDoc(doc(db, 'organizations', organizationId, 'surveys', surveyId), {
      status: 'closed',
      closedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error closing survey:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a survey
 */
export const deleteSurvey = async (organizationId, surveyId) => {
  try {
    await deleteDoc(doc(db, 'organizations', organizationId, 'surveys', surveyId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting survey:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// 📊 SURVEY RESPONSES
// ============================================

/**
 * Submit a survey response
 */
export const submitSurveyResponse = async (organizationId, surveyId, patientId, responses, anonymous = false) => {
  try {
    const responsesRef = collection(db, 'organizations', organizationId, 'surveyResponses');
    
    const response = {
      surveyId,
      patientId: anonymous ? null : patientId,
      anonymous,
      responses, // { questionId: answer }
      completedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(responsesRef, response);
    
    // Increment response count
    const surveyRef = doc(db, 'organizations', organizationId, 'surveys', surveyId);
    const surveyDoc = await getDoc(surveyRef);
    if (surveyDoc.exists()) {
      await updateDoc(surveyRef, {
        responseCount: (surveyDoc.data().responseCount || 0) + 1
      });
    }
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting survey response:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get responses for a survey
 */
export const getSurveyResponses = async (organizationId, surveyId) => {
  try {
    const responsesRef = collection(db, 'organizations', organizationId, 'surveyResponses');
    const q = query(responsesRef, where('surveyId', '==', surveyId), orderBy('completedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const responses = [];
    snapshot.forEach(doc => {
      responses.push({ id: doc.id, ...doc.data() });
    });
    return responses;
  } catch (error) {
    console.error('Error getting survey responses:', error);
    return [];
  }
};

/**
 * Check if patient has completed a survey
 */
export const hasCompletedSurvey = async (organizationId, surveyId, patientId) => {
  try {
    const responsesRef = collection(db, 'organizations', organizationId, 'surveyResponses');
    const q = query(
      responsesRef, 
      where('surveyId', '==', surveyId),
      where('patientId', '==', patientId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking survey completion:', error);
    return false;
  }
};

/**
 * Get survey analytics
 */
export const getSurveyAnalytics = async (organizationId, surveyId) => {
  try {
    const surveyDoc = await getDoc(doc(db, 'organizations', organizationId, 'surveys', surveyId));
    if (!surveyDoc.exists()) return null;
    
    const survey = surveyDoc.data();
    const responses = await getSurveyResponses(organizationId, surveyId);
    
    const analytics = {
      surveyTitle: survey.title,
      totalResponses: responses.length,
      questionAnalytics: {}
    };
    
    // Analyze each question
    survey.questions.forEach(q => {
      const questionResponses = responses.map(r => r.responses?.[q.id]).filter(Boolean);
      
      if (q.type === 'rating') {
        const ratings = questionResponses.map(r => parseInt(r)).filter(n => !isNaN(n));
        analytics.questionAnalytics[q.id] = {
          question: q.question,
          type: 'rating',
          average: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0,
          count: ratings.length,
          distribution: ratings.reduce((acc, r) => { acc[r] = (acc[r] || 0) + 1; return acc; }, {})
        };
      } else if (q.type === 'choice' || q.type === 'multiselect') {
        const choices = {};
        questionResponses.forEach(r => {
          const answers = Array.isArray(r) ? r : [r];
          answers.forEach(a => { choices[a] = (choices[a] || 0) + 1; });
        });
        analytics.questionAnalytics[q.id] = {
          question: q.question,
          type: q.type,
          distribution: choices,
          count: questionResponses.length
        };
      } else if (q.type === 'text') {
        analytics.questionAnalytics[q.id] = {
          question: q.question,
          type: 'text',
          responses: questionResponses,
          count: questionResponses.length
        };
      }
    });
    
    return analytics;
  } catch (error) {
    console.error('Error getting survey analytics:', error);
    return null;
  }
};

// ============================================
// 📤 EXPORT SURVEY DATA
// ============================================

/**
 * Export survey responses as CSV
 */
export const exportSurveyToCSV = async (organizationId, surveyId) => {
  try {
    const surveyDoc = await getDoc(doc(db, 'organizations', organizationId, 'surveys', surveyId));
    if (!surveyDoc.exists()) return null;
    
    const survey = surveyDoc.data();
    const responses = await getSurveyResponses(organizationId, surveyId);
    
    // Build CSV header
    const headers = ['Response ID', 'Patient ID', 'Completed At'];
    survey.questions.forEach(q => headers.push(q.question));
    
    // Build rows
    const rows = responses.map(r => {
      const row = [
        r.id,
        r.anonymous ? 'Anonymous' : r.patientId,
        r.completedAt?.toDate?.().toISOString() || ''
      ];
      survey.questions.forEach(q => {
        const answer = r.responses?.[q.id];
        row.push(Array.isArray(answer) ? answer.join('; ') : (answer || ''));
      });
      return row;
    });
    
    // Create CSV content
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    return csvContent;
  } catch (error) {
    console.error('Error exporting survey:', error);
    return null;
  }
};

/**
 * Download survey as CSV file
 */
export const downloadSurveyCSV = async (organizationId, surveyId, surveyTitle) => {
  const csv = await exportSurveyToCSV(organizationId, surveyId);
  if (!csv) return;
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `survey-${surveyTitle.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
