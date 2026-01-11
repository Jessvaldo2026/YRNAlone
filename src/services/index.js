// FILE: src/services/index.js
// 🚀 YRNAlone Services - Complete Export

// ============================================
// 📧 EMAIL SERVICES
// ============================================
export * from './EmailService';
export * from './PaymentEmails';
export * from './OrganizationEmails';

// ============================================
// 💳 PAYMENT SERVICES
// ============================================
export * from './StripeService';

// ============================================
// 📊 ENTERPRISE ANALYTICS
// ============================================
export * from './analyticsService';

// ============================================
// 👨‍⚕️ THERAPIST MANAGEMENT
// ============================================
export * from './therapistService';

// ============================================
// 📄 REPORT GENERATION
// ============================================
export * from './reportService';

// ============================================
// 🚨 CRISIS DETECTION & MANAGEMENT
// ============================================
export * from './crisisService';

// ============================================
// 💬 SECURE MESSAGING
// ============================================
export * from './messagingService';

// ============================================
// 🔐 HIPAA AUDIT LOGGING
// ============================================
export * from './auditService';

// ============================================
// 📋 INTERVENTION TRACKING
// ============================================
export * from './interventionService';

// ============================================
// 📊 PROGRESS SHARING
// ============================================
export * from './progressSharingService';

// ============================================
// ⏰ SCHEDULED CHECK-INS
// ============================================
export * from './scheduledCheckinsService';

// ============================================
// 📝 SESSION NOTES
// ============================================
export * from './sessionService';

// ============================================
// 📊 SURVEYS & FEEDBACK
// ============================================
export * from './surveyService';

// ============================================
// 🔒 SECURITY & COMPLIANCE
// ============================================
export * from './securityService';

// ============================================
// ✍️ CONSENT & E-SIGNATURE
// ============================================
export * from './consentService';

// ============================================
// 🎯 TREATMENT PLANS
// ============================================
export * from './treatmentPlanService';

// ============================================
// 👨‍👩‍👧 GUARDIAN PORTAL
// ============================================
export * from './guardianService';

// ============================================
// 🔒 ACCOUNT MANAGEMENT
// ============================================
export * from './accountManagementService';

// ============================================
// 🔧 SERVICE SUMMARY
// ============================================
/*
YRNAlone Enterprise Services:

PAYMENT & BILLING:
- StripeService: Individual & Organization payments
- PaymentEmails: Payment confirmations, receipts
- OrganizationEmails: Org welcome, invitations

DATA & ANALYTICS:
- analyticsService: Mood trends, engagement metrics
- reportService: PDF/CSV report generation

CRISIS MANAGEMENT:
- crisisService: Auto-detect patterns, alert therapists
- interventionService: Track therapist actions & outcomes

COMMUNICATION:
- messagingService: Secure therapist-member messaging
- scheduledCheckinsService: Automated check-in reminders

PRIVACY & COMPLIANCE:
- progressSharingService: Member consent management
- auditService: HIPAA-compliant access logging

STAFF MANAGEMENT:
- therapistService: Directory, assignments, CRUD

FEATURE SUMMARY:
✅ Crisis escalation workflow
✅ Therapist → Member messaging
✅ Intervention tracking
✅ Progress sharing with consent
✅ Scheduled check-ins
✅ HIPAA audit logging
✅ Email notifications for alerts
✅ Real-time analytics
✅ Report generation
✅ Session Notes with templates
✅ E-Signature consent forms (HIPAA, Treatment, Telehealth)
*/
