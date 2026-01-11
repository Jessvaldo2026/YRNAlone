// FILE: src/services/PaymentEmails.js
// 📧 Email Service - Payment confirmations, Crisis alerts, and Notifications
// Uses EmailJS for sending

// EmailJS Configuration - YOUR REAL KEYS
const EMAILJS_SERVICE_ID = 'service_0i2gmim';
const EMAILJS_PUBLIC_KEY = '_aQr2ZmXVBIGcYnk5';

// Your existing templates
const TEMPLATES = {
  individualPayment: 'template_iisxmgu',
  organizationPayment: 'template_tg0oasr',
  organizationWelcome: 'template_56vzh8t',
  userInvitation: 'template_1vffppd',
  // NEW TEMPLATES - Create these in EmailJS dashboard
  crisisAlert: 'template_crisis_alert',           // Create this template
  interventionSummary: 'template_intervention',   // Create this template
  weeklyReport: 'template_weekly_report',         // Create this template
  checkinReminder: 'template_checkin'             // Create this template
};

// ============================================
// 📧 CORE EMAIL FUNCTION
// ============================================

const sendEmail = async (templateId, templateParams) => {
  try {
    // Dynamic import for EmailJS
    const emailjs = await import('@emailjs/browser');
    
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    
    console.log('Email sent:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// 💳 PAYMENT EMAILS (Existing)
// ============================================

// Individual subscription confirmation
export const sendPaymentConfirmation = async (data) => {
  const { email, name, planName, amount, nextBillingDate } = data;
  
  return sendEmail(TEMPLATES.individualPayment, {
    to_email: email,
    to_name: name,
    plan_name: planName,
    amount: amount,
    next_billing_date: nextBillingDate,
    support_email: 'support@yrnalone.com'
  });
};

// Organization payment confirmation
export const sendOrgPaymentConfirmation = async (data) => {
  const { 
    email, 
    contactName, 
    organizationName, 
    planName, 
    amount, 
    memberLimit,
    accessCode 
  } = data;
  
  return sendEmail(TEMPLATES.organizationPayment, {
    to_email: email,
    to_name: contactName,
    organization_name: organizationName,
    plan_name: planName,
    amount: amount,
    member_limit: memberLimit,
    access_code: accessCode,
    dashboard_link: 'https://yrnalone.com/admin'
  });
};

// Organization welcome email with access code
export const sendOrgWelcomeEmail = async (data) => {
  const { email, contactName, organizationName, accessCode, planName } = data;
  
  return sendEmail(TEMPLATES.organizationWelcome, {
    to_email: email,
    to_name: contactName,
    organization_name: organizationName,
    access_code: accessCode,
    plan_name: planName,
    setup_guide_link: 'https://yrnalone.com/enterprise/setup'
  });
};

// Member invitation email
export const sendMemberInvitation = async (data) => {
  const { email, inviterName, organizationName, accessCode } = data;
  
  return sendEmail(TEMPLATES.userInvitation, {
    to_email: email,
    inviter_name: inviterName,
    organization_name: organizationName,
    access_code: accessCode,
    signup_link: 'https://yrnalone.com/join'
  });
};

// ============================================
// 🚨 CRISIS ALERT EMAILS (NEW)
// ============================================

// Alert therapist about member crisis
export const sendCrisisAlertEmail = async (data) => {
  const {
    therapistEmail,
    therapistName,
    organizationName,
    alertType,
    alertSeverity,
    memberName,
    alertMessage,
    recommendation,
    dashboardLink
  } = data;

  // Map severity to urgency text
  const urgencyText = {
    critical: '🚨 CRITICAL - IMMEDIATE ACTION REQUIRED',
    high: '⚠️ HIGH PRIORITY',
    medium: '📋 Medium Priority',
    low: 'ℹ️ For Your Awareness'
  };

  return sendEmail(TEMPLATES.crisisAlert, {
    to_email: therapistEmail,
    to_name: therapistName,
    organization_name: organizationName,
    urgency_level: urgencyText[alertSeverity] || urgencyText.medium,
    alert_severity: alertSeverity.toUpperCase(),
    member_name: memberName,
    alert_type: alertType.replace(/_/g, ' ').toUpperCase(),
    alert_message: alertMessage,
    recommendation: recommendation,
    dashboard_link: dashboardLink || 'https://yrnalone.com/admin',
    timestamp: new Date().toLocaleString()
  });
};

// Send crisis alert to multiple therapists
export const broadcastCrisisAlert = async (therapists, alertData, organizationName) => {
  const results = [];
  
  for (const therapist of therapists) {
    const result = await sendCrisisAlertEmail({
      ...alertData,
      therapistEmail: therapist.email,
      therapistName: therapist.name,
      organizationName
    });
    results.push({ therapistId: therapist.id, ...result });
  }
  
  return results;
};

// ============================================
// 📊 REPORT EMAILS (NEW)
// ============================================

// Send weekly summary to admin
export const sendWeeklyReportEmail = async (data) => {
  const {
    adminEmail,
    adminName,
    organizationName,
    reportDate,
    stats,
    alerts,
    highlights
  } = data;

  return sendEmail(TEMPLATES.weeklyReport, {
    to_email: adminEmail,
    to_name: adminName,
    organization_name: organizationName,
    report_date: reportDate,
    total_members: stats.totalMembers,
    active_members: stats.activeMembers,
    avg_mood_score: stats.avgMoodScore,
    total_checkins: stats.totalCheckins,
    interventions_count: stats.interventions,
    alerts_count: alerts.length,
    critical_alerts: alerts.filter(a => a.severity === 'critical').length,
    highlights: highlights.join('\n• '),
    dashboard_link: 'https://yrnalone.com/admin'
  });
};

// Send intervention summary
export const sendInterventionSummaryEmail = async (data) => {
  const {
    therapistEmail,
    therapistName,
    memberName,
    interventionType,
    interventionDate,
    notes,
    nextSteps,
    followUpDate
  } = data;

  return sendEmail(TEMPLATES.interventionSummary, {
    to_email: therapistEmail,
    to_name: therapistName,
    member_name: memberName,
    intervention_type: interventionType.replace(/_/g, ' '),
    intervention_date: interventionDate,
    notes: notes,
    next_steps: nextSteps,
    follow_up_date: followUpDate || 'Not scheduled'
  });
};

// ============================================
// ⏰ CHECK-IN REMINDER EMAILS (NEW)
// ============================================

// Remind member about scheduled check-in
export const sendCheckinReminderEmail = async (data) => {
  const {
    memberEmail,
    memberName,
    checkinType,
    therapistName,
    message,
    appLink
  } = data;

  return sendEmail(TEMPLATES.checkinReminder, {
    to_email: memberEmail,
    to_name: memberName,
    checkin_type: checkinType,
    therapist_name: therapistName,
    message: message,
    app_link: appLink || 'https://yrnalone.com'
  });
};

// ============================================
// 📝 EMAIL TEMPLATES FOR EMAILJS
// ============================================

/*
CREATE THESE TEMPLATES IN YOUR EMAILJS DASHBOARD:

1. CRISIS ALERT TEMPLATE (template_crisis_alert):
─────────────────────────────────────────────────
Subject: {{urgency_level}} - Member Alert at {{organization_name}}

Hi {{to_name}},

{{urgency_level}}

Alert Type: {{alert_type}}
Member: {{member_name}}
Time: {{timestamp}}

Details:
{{alert_message}}

Recommended Action:
{{recommendation}}

Please review this alert in your dashboard:
{{dashboard_link}}

— YRNAlone Enterprise


2. WEEKLY REPORT TEMPLATE (template_weekly_report):
─────────────────────────────────────────────────
Subject: Weekly Wellness Report - {{organization_name}}

Hi {{to_name}},

Here's your weekly wellness summary for {{organization_name}}:

📊 OVERVIEW
• Total Members: {{total_members}}
• Active This Week: {{active_members}}
• Average Mood Score: {{avg_mood_score}}/10
• Total Check-ins: {{total_checkins}}
• Interventions: {{interventions_count}}

🚨 ALERTS
• Total Alerts: {{alerts_count}}
• Critical Alerts: {{critical_alerts}}

✨ HIGHLIGHTS
• {{highlights}}

View full report: {{dashboard_link}}

— YRNAlone Enterprise


3. INTERVENTION SUMMARY TEMPLATE (template_intervention):
─────────────────────────────────────────────────
Subject: Intervention Summary - {{member_name}}

Hi {{to_name}},

This is a summary of your recent intervention:

Member: {{member_name}}
Type: {{intervention_type}}
Date: {{intervention_date}}

Notes:
{{notes}}

Next Steps:
{{next_steps}}

Follow-up Date: {{follow_up_date}}

— YRNAlone Enterprise


4. CHECK-IN REMINDER TEMPLATE (template_checkin):
─────────────────────────────────────────────────
Subject: Time for Your {{checkin_type}} Check-in 💜

Hi {{to_name}},

{{message}}

{{therapist_name}} is thinking of you!

Open the app to complete your check-in:
{{app_link}}

You're doing great! 💜

— YRNAlone
*/

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

// Test email configuration
export const testEmailConfiguration = async (testEmail) => {
  return sendEmail(TEMPLATES.individualPayment, {
    to_email: testEmail,
    to_name: 'Test User',
    plan_name: 'Test Plan',
    amount: '$0.00',
    next_billing_date: 'N/A - Test Email',
    support_email: 'support@yrnalone.com'
  });
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Export all for easy access
export default {
  // Payment
  sendPaymentConfirmation,
  sendOrgPaymentConfirmation,
  sendOrgWelcomeEmail,
  sendMemberInvitation,
  // Crisis
  sendCrisisAlertEmail,
  broadcastCrisisAlert,
  // Reports
  sendWeeklyReportEmail,
  sendInterventionSummaryEmail,
  // Check-ins
  sendCheckinReminderEmail,
  // Utility
  testEmailConfiguration,
  formatCurrency,
  // Constants
  TEMPLATES,
  EMAILJS_SERVICE_ID
};
