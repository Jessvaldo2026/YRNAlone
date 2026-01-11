// FILE: src/services/consentService.js
// ✍️ HIPAA-Compliant Consent & E-Signature System
// Captures legally-binding electronic signatures with full audit trail

import { db } from '../firebase';
import {
  collection, doc, addDoc, getDocs, getDoc, updateDoc,
  query, where, orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { logAuditEvent, AUDIT_ACTIONS } from './auditService';

// ============================================
// 📋 CONSENT TEMPLATES
// ============================================

export const CONSENT_TYPES = {
  HIPAA: 'hipaa',
  TREATMENT: 'treatment',
  TELEHEALTH: 'telehealth',
  MINOR: 'minor_consent',
  RESEARCH: 'research',
  PHOTO_VIDEO: 'photo_video',
  EMERGENCY_CONTACT: 'emergency_contact',
  CUSTOM: 'custom'
};

export const CONSENT_TEMPLATES = {
  hipaa: {
    id: 'hipaa',
    title: 'HIPAA Authorization',
    subtitle: 'Notice of Privacy Practices',
    icon: '🔒',
    required: true,
    version: '1.0',
    content: `
NOTICE OF PRIVACY PRACTICES

This notice describes how medical information about you may be used and disclosed and how you can get access to this information. Please review it carefully.

YOUR RIGHTS
You have the right to:
• Get a copy of your health and claims records
• Correct your health and claims records
• Request confidential communication
• Ask us to limit the information we share
• Get a list of those with whom we've shared your information
• Get a copy of this privacy notice
• Choose someone to act for you
• File a complaint if you believe your privacy rights have been violated

YOUR CHOICES
You have some choices in the way that we use and share information as we:
• Answer coverage questions from your family and friends
• Provide disaster relief
• Market our services and sell your information

OUR USES AND DISCLOSURES
We may use and share your information as we:
• Help manage the health care treatment you receive
• Run our organization
• Pay for your health services
• Administer your health plan
• Help with public health and safety issues
• Do research
• Comply with the law
• Respond to organ and tissue donation requests and work with a medical examiner or funeral director
• Address workers' compensation, law enforcement, and other government requests
• Respond to lawsuits and legal actions

By signing below, I acknowledge that I have received and reviewed this Notice of Privacy Practices.
    `.trim(),
    checkboxes: [
      { id: 'received', label: 'I acknowledge that I have received this Notice of Privacy Practices', required: true },
      { id: 'understand', label: 'I understand how my health information may be used and disclosed', required: true },
      { id: 'questions', label: 'I have had the opportunity to ask questions about this notice', required: false }
    ]
  },

  treatment: {
    id: 'treatment',
    title: 'Consent to Treatment',
    subtitle: 'Authorization for Mental Health Services',
    icon: '💜',
    required: true,
    version: '1.0',
    content: `
CONSENT TO TREATMENT

I, the undersigned, hereby voluntarily consent to receive mental health assessment, care, treatment, or services. I understand that:

NATURE OF SERVICES
• Services may include individual therapy, group therapy, assessment, crisis intervention, and wellness support
• Treatment plans will be developed collaboratively with my care team
• I may be assigned a therapist or counselor to support my care

RISKS AND BENEFITS
• Benefits may include improved coping skills, reduced symptoms, better relationships, and enhanced well-being
• Risks may include temporary discomfort when discussing difficult topics, and changes in relationships
• There is no guarantee of specific outcomes

MY RIGHTS
• I have the right to refuse or discontinue treatment at any time
• I have the right to be informed about my treatment options
• I have the right to participate in treatment planning
• I have the right to confidentiality as protected by law

EMERGENCIES
• In case of emergency, I authorize contact with emergency services
• I understand that in life-threatening situations, confidentiality may be broken to ensure safety

FEES AND PAYMENT
• I understand and accept the fee structure as explained to me
• I agree to be responsible for charges not covered by insurance

By signing below, I confirm that I have read, understand, and agree to the terms of this consent.
    `.trim(),
    checkboxes: [
      { id: 'voluntary', label: 'I am voluntarily consenting to receive mental health services', required: true },
      { id: 'informed', label: 'I have been informed of the risks, benefits, and alternatives to treatment', required: true },
      { id: 'rights', label: 'I understand my rights as outlined above', required: true },
      { id: 'emergency', label: 'I authorize emergency contact if my safety is at risk', required: true }
    ]
  },

  telehealth: {
    id: 'telehealth',
    title: 'Telehealth Consent',
    subtitle: 'Consent for Virtual/Remote Services',
    icon: '📱',
    required: false,
    version: '1.0',
    content: `
TELEHEALTH INFORMED CONSENT

I understand that telehealth involves the use of electronic communications to enable healthcare providers to deliver services remotely.

WHAT IS TELEHEALTH?
Telehealth includes consultation, treatment, transfer of medical data, emails, telephone conversations, and video conferencing for the purpose of delivering mental health services.

BENEFITS OF TELEHEALTH
• Improved access to care from any location
• Reduced travel time and associated costs
• Flexible scheduling options
• Continuity of care during travel or illness

RISKS OF TELEHEALTH
• Technology may fail or the quality may be affected by technical issues
• Security protocols may fail, potentially exposing personal health information
• Telehealth may not be appropriate for all conditions or situations
• In-person care may be more appropriate in some circumstances

MY RESPONSIBILITIES
• I will ensure I am in a private location during sessions
• I will use a secure internet connection when possible
• I will inform my provider if I experience technical difficulties
• I will have a backup plan (phone number) in case of technology failure

EMERGENCY SITUATIONS
• I understand that telehealth is not appropriate for emergencies
• In case of emergency, I will call 911 or go to the nearest emergency room
• I will provide my current location at the start of each session

RECORDING
• Sessions will not be recorded without mutual consent
• I agree not to record sessions without prior written consent

By signing below, I consent to receive services via telehealth.
    `.trim(),
    checkboxes: [
      { id: 'understand_telehealth', label: 'I understand what telehealth services involve', required: true },
      { id: 'risks_benefits', label: 'I understand the risks and benefits of telehealth', required: true },
      { id: 'private_location', label: 'I agree to participate from a private location', required: true },
      { id: 'emergency_plan', label: 'I understand telehealth is not for emergencies and will call 911 if needed', required: true },
      { id: 'no_recording', label: 'I agree not to record sessions without prior consent', required: true }
    ]
  },

  minor_consent: {
    id: 'minor_consent',
    title: 'Parental/Guardian Consent',
    subtitle: 'Consent for Minor\'s Treatment',
    icon: '👨‍👩‍👧',
    required: true,
    version: '1.0',
    content: `
PARENTAL/GUARDIAN CONSENT FOR MINOR'S TREATMENT

I am the parent or legal guardian of the minor named below and have the legal authority to consent to their mental health treatment.

CONSENT FOR TREATMENT
I hereby consent to have my child/ward receive mental health assessment and treatment services. I understand:

• The nature, risks, and benefits of treatment as explained to me
• That I may revoke this consent at any time in writing
• That certain information may be kept confidential between my child and their provider to build therapeutic trust
• That I will be informed if there are safety concerns

CONFIDENTIALITY FOR MINORS
• I understand that building trust is essential to effective therapy for adolescents
• I agree that some session content may remain confidential between my child and their therapist
• I will be informed of safety concerns, suicidal thoughts, self-harm, or abuse
• Progress updates will be provided without breaching therapeutic confidentiality

COMMUNICATION
• I consent to receive general updates about my child's progress
• I understand I may request family sessions as part of treatment
• I agree to participate in treatment planning as appropriate

EMERGENCY AUTHORIZATION
• In case of emergency, I authorize the provider to take necessary action to ensure my child's safety
• I have provided emergency contact information

By signing below, I consent to mental health services for my minor child.
    `.trim(),
    checkboxes: [
      { id: 'legal_guardian', label: 'I am the parent or legal guardian with authority to consent', required: true },
      { id: 'consent_treatment', label: 'I consent to mental health treatment for my child', required: true },
      { id: 'understand_confidentiality', label: 'I understand the confidentiality guidelines for minors', required: true },
      { id: 'emergency_auth', label: 'I authorize emergency action if my child\'s safety is at risk', required: true }
    ],
    additionalFields: [
      { id: 'minor_name', label: 'Minor\'s Full Name', type: 'text', required: true },
      { id: 'minor_dob', label: 'Minor\'s Date of Birth', type: 'date', required: true },
      { id: 'relationship', label: 'Relationship to Minor', type: 'select', options: ['Parent', 'Legal Guardian', 'Other'], required: true }
    ]
  },

  research: {
    id: 'research',
    title: 'Research Consent',
    subtitle: 'Consent for Data Use in Research',
    icon: '🔬',
    required: false,
    version: '1.0',
    content: `
CONSENT FOR RESEARCH PARTICIPATION

You are being asked to participate in a research study. This form provides important information about the study.

PURPOSE
The purpose of this research is to improve mental health services and outcomes. Your anonymized data may be used to:
• Analyze treatment effectiveness
• Identify patterns in mental health and wellness
• Develop better interventions and support tools
• Publish findings in academic journals

YOUR DATA
• All data will be de-identified before analysis
• Your name and identifying information will be removed
• Only aggregate data will be published
• Individual responses will never be shared

VOLUNTARY PARTICIPATION
• Your participation is completely voluntary
• You may withdraw at any time without penalty
• Declining will not affect your treatment or care
• You may request your data be removed from the study

RISKS AND BENEFITS
• There are no direct risks from participating
• You may not directly benefit, but your contribution helps improve care for others
• There is no compensation for participating

By signing below, you consent to have your anonymized data used for research purposes.
    `.trim(),
    checkboxes: [
      { id: 'understand_research', label: 'I understand how my data will be used for research', required: true },
      { id: 'voluntary', label: 'I understand my participation is voluntary', required: true },
      { id: 'consent_research', label: 'I consent to participate in research', required: true }
    ]
  }
};

// ============================================
// 🖊️ E-SIGNATURE FUNCTIONS
// ============================================

/**
 * Capture an e-signature for a consent form
 */
export const captureESignature = async (userId, consentType, signatureData, organizationId = null) => {
  const {
    typedName,           // Full legal name typed
    signatureImage,      // Base64 canvas signature (optional)
    agreedCheckboxes,    // Array of checkbox IDs that were checked
    additionalData = {}, // Any additional form fields
    witnessName = null,  // For minor consent
    witnessRelationship = null
  } = signatureData;

  // Get IP address (in production, this would come from server)
  let ipAddress = 'client-side';
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    ipAddress = data.ip;
  } catch (e) {
    console.log('Could not fetch IP');
  }

  // Get browser/device info
  const deviceInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  const template = CONSENT_TEMPLATES[consentType];

  const consentRecord = {
    // Consent Info
    consentType,
    consentTitle: template?.title || consentType,
    templateVersion: template?.version || '1.0',

    // Signature
    typedName,
    signatureImage: signatureImage || null,
    signatureMethod: signatureImage ? 'drawn' : 'typed',

    // What they agreed to
    agreedCheckboxes,
    additionalData,

    // Witness (for minor consent)
    witnessName,
    witnessRelationship,

    // Audit trail
    signedAt: serverTimestamp(),
    signedAtISO: new Date().toISOString(),
    ipAddress,
    deviceInfo,

    // Status
    status: 'active', // active, revoked, expired

    // Organization (if enterprise)
    organizationId: organizationId || null
  };

  // Save to user's consents subcollection
  const consentRef = await addDoc(
    collection(db, 'users', userId, 'consents'),
    consentRecord
  );

  // Log audit event if organization
  if (organizationId) {
    await logAuditEvent(organizationId, {
      action: 'CONSENT_SIGNED',
      actorId: userId,
      actorRole: 'member',
      targetType: 'consent',
      targetId: consentRef.id,
      details: {
        consentType,
        templateVersion: template?.version
      }
    });
  }

  return {
    success: true,
    id: consentRef.id,
    signedAt: consentRecord.signedAtISO
  };
};

/**
 * Get all consents for a user
 */
export const getUserConsents = async (userId) => {
  try {
    const consentsRef = collection(db, 'users', userId, 'consents');
    const q = query(consentsRef, orderBy('signedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      signedAt: doc.data().signedAt?.toDate?.() || doc.data().signedAtISO
    }));
  } catch (error) {
    console.error('Error getting consents:', error);
    return [];
  }
};

/**
 * Check if user has signed a specific consent
 */
export const hasSignedConsent = async (userId, consentType) => {
  try {
    const consentsRef = collection(db, 'users', userId, 'consents');
    const q = query(
      consentsRef,
      where('consentType', '==', consentType),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking consent:', error);
    return false;
  }
};

/**
 * Check multiple required consents at once
 */
export const checkRequiredConsents = async (userId, requiredTypes = ['hipaa', 'treatment']) => {
  const results = {};

  for (const consentType of requiredTypes) {
    results[consentType] = await hasSignedConsent(userId, consentType);
  }

  const allSigned = Object.values(results).every(v => v === true);
  const missing = Object.entries(results)
    .filter(([_, signed]) => !signed)
    .map(([type]) => type);

  return {
    allSigned,
    results,
    missing
  };
};

/**
 * Get consent verification data (for compliance)
 */
export const getConsentVerification = async (userId, consentType) => {
  try {
    const consentsRef = collection(db, 'users', userId, 'consents');
    const q = query(
      consentsRef,
      where('consentType', '==', consentType),
      where('status', '==', 'active'),
      orderBy('signedAt', 'desc')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const consent = snapshot.docs[0].data();
    return {
      consentId: snapshot.docs[0].id,
      consentType: consent.consentType,
      signedBy: consent.typedName,
      signedAt: consent.signedAtISO,
      ipAddress: consent.ipAddress,
      templateVersion: consent.templateVersion,
      status: consent.status
    };
  } catch (error) {
    console.error('Error getting consent verification:', error);
    return null;
  }
};

/**
 * Revoke a consent
 */
export const revokeConsent = async (userId, consentId, reason = '') => {
  try {
    await updateDoc(doc(db, 'users', userId, 'consents', consentId), {
      status: 'revoked',
      revokedAt: serverTimestamp(),
      revokedAtISO: new Date().toISOString(),
      revocationReason: reason
    });
    return { success: true };
  } catch (error) {
    console.error('Error revoking consent:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// 🏢 ORGANIZATION CONSENT MANAGEMENT
// ============================================

/**
 * Get all members' consent status for an organization
 */
export const getOrgConsentStatus = async (organizationId) => {
  try {
    // Get all org members
    const membersQuery = query(
      collection(db, 'users'),
      where('organizationId', '==', organizationId)
    );
    const membersSnap = await getDocs(membersQuery);

    const consentStatus = [];

    for (const memberDoc of membersSnap.docs) {
      const member = memberDoc.data();
      const consents = await getUserConsents(memberDoc.id);

      const requiredConsents = ['hipaa', 'treatment'];
      const signedTypes = consents
        .filter(c => c.status === 'active')
        .map(c => c.consentType);

      consentStatus.push({
        memberId: memberDoc.id,
        memberName: member.name || member.username || 'Unknown',
        memberEmail: member.email,
        consents: consents.map(c => ({
          type: c.consentType,
          signedAt: c.signedAtISO,
          status: c.status
        })),
        hasHIPAA: signedTypes.includes('hipaa'),
        hasTreatment: signedTypes.includes('treatment'),
        hasTelehealth: signedTypes.includes('telehealth'),
        allRequiredSigned: requiredConsents.every(t => signedTypes.includes(t)),
        missingConsents: requiredConsents.filter(t => !signedTypes.includes(t))
      });
    }

    // Summary stats
    const total = consentStatus.length;
    const compliant = consentStatus.filter(m => m.allRequiredSigned).length;

    return {
      members: consentStatus,
      summary: {
        totalMembers: total,
        fullyCompliant: compliant,
        complianceRate: total > 0 ? ((compliant / total) * 100).toFixed(1) : 0,
        missingHIPAA: consentStatus.filter(m => !m.hasHIPAA).length,
        missingTreatment: consentStatus.filter(m => !m.hasTreatment).length
      }
    };
  } catch (error) {
    console.error('Error getting org consent status:', error);
    return { members: [], summary: {} };
  }
};

/**
 * Create custom consent form for organization
 */
export const createCustomConsent = async (organizationId, consentData, createdBy) => {
  const {
    title,
    subtitle,
    content,
    checkboxes,
    required = false,
    expiresInDays = null
  } = consentData;

  const customConsent = {
    id: `custom_${Date.now()}`,
    type: CONSENT_TYPES.CUSTOM,
    title,
    subtitle: subtitle || '',
    icon: '📄',
    content,
    checkboxes: checkboxes || [
      { id: 'agree', label: 'I have read and agree to the above', required: true }
    ],
    required,
    version: '1.0',
    organizationId,
    createdBy,
    createdAt: serverTimestamp(),
    isActive: true,
    expiresInDays
  };

  const docRef = await addDoc(
    collection(db, 'organizations', organizationId, 'customConsents'),
    customConsent
  );

  return { id: docRef.id, ...customConsent };
};

/**
 * Get organization's custom consent forms
 */
export const getOrgCustomConsents = async (organizationId) => {
  try {
    const consentsRef = collection(db, 'organizations', organizationId, 'customConsents');
    const q = query(consentsRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting custom consents:', error);
    return [];
  }
};

// ============================================
// 📊 CONSENT ANALYTICS & COMPLIANCE
// ============================================

/**
 * Generate consent compliance report
 */
export const generateConsentReport = async (organizationId) => {
  const status = await getOrgConsentStatus(organizationId);

  return {
    reportType: 'CONSENT_COMPLIANCE_REPORT',
    generatedAt: new Date().toISOString(),
    organizationId,
    summary: status.summary,
    consentBreakdown: {
      hipaa: {
        signed: status.members.filter(m => m.hasHIPAA).length,
        missing: status.members.filter(m => !m.hasHIPAA).length
      },
      treatment: {
        signed: status.members.filter(m => m.hasTreatment).length,
        missing: status.members.filter(m => !m.hasTreatment).length
      },
      telehealth: {
        signed: status.members.filter(m => m.hasTelehealth).length,
        notSigned: status.members.filter(m => !m.hasTelehealth).length
      }
    },
    nonCompliantMembers: status.members
      .filter(m => !m.allRequiredSigned)
      .map(m => ({
        name: m.memberName,
        email: m.memberEmail,
        missing: m.missingConsents
      })),
    recommendations: generateConsentRecommendations(status)
  };
};

const generateConsentRecommendations = (status) => {
  const recs = [];

  if (status.summary.missingHIPAA > 0) {
    recs.push({
      priority: 'high',
      issue: `${status.summary.missingHIPAA} members missing HIPAA consent`,
      action: 'Send reminder emails to complete required HIPAA authorization'
    });
  }

  if (status.summary.missingTreatment > 0) {
    recs.push({
      priority: 'high',
      issue: `${status.summary.missingTreatment} members missing Treatment consent`,
      action: 'Require treatment consent before allowing service access'
    });
  }

  if (parseFloat(status.summary.complianceRate) < 80) {
    recs.push({
      priority: 'medium',
      issue: `Compliance rate is ${status.summary.complianceRate}%`,
      action: 'Consider implementing mandatory consent flow in onboarding'
    });
  }

  if (recs.length === 0) {
    recs.push({
      priority: 'low',
      issue: 'All members are compliant',
      action: 'Continue monitoring and ensure new members complete consents'
    });
  }

  return recs;
};

// ============================================
// 📤 EXPORT
// ============================================

export default {
  CONSENT_TYPES,
  CONSENT_TEMPLATES,
  captureESignature,
  getUserConsents,
  hasSignedConsent,
  checkRequiredConsents,
  getConsentVerification,
  revokeConsent,
  getOrgConsentStatus,
  createCustomConsent,
  getOrgCustomConsents,
  generateConsentReport
};
