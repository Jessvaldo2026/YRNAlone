// FILE: src/services/EmailService.js
// Complete email notification system for YRNAlone
// Uses EmailJS (free tier: 200 emails/month)

// =====================================================
// SETUP INSTRUCTIONS:
// 1. Go to https://www.emailjs.com/ and create free account
// 2. Create an Email Service (connect your Gmail/email)
// 3. Create Email Templates (use EmailTemplates.js)
// 4. Get your Service ID from EmailJS dashboard
// 5. Update SERVICE_ID below
// =====================================================

const EMAILJS_PUBLIC_KEY = '_aQr2ZmXVBIGcYnk5'; // Already configured in main.jsx
const EMAILJS_SERVICE_ID = 'service_0i2gmim'; // Jess's real EmailJS service ID

const TEMPLATE_IDS = {
  // 🎯 JESS'S REAL EMAILJS TEMPLATE IDs - Updated 2024
  // Organization emails
  orgWelcome: 'template_56vzh8t',           // Organization Welcome
  orgMonthlyReport: 'template_org_report',  // Keep placeholder for now
  orgInvoice: 'template_tg0oasr',           // Payment/Invoice for Org
  orgUsageAlert: 'template_org_usage',      // Keep placeholder for now
  orgTrialEnding: 'template_org_trial',     // Keep placeholder for now

  // User emails
  userWelcome: 'template_user_welcome',     // Keep placeholder for now
  userCheckin: 'template_user_checkin',     // Keep placeholder for now
  userUpgrade: 'template_user_upgrade',     // Keep placeholder for now
  userAchievement: 'template_user_achievement', // Keep placeholder for now
  userMissYou: 'template_user_missyou',     // Keep placeholder for now
  userInvitation: 'template_1vffppd',       // User Invitation

  // Payment emails
  paymentIndividual: 'template_iisxmgu',    // Individual Payment
  paymentOrg: 'template_tg0oasr',           // Org Payment

  // Email verification
  emailVerification: 'template_p91koho',    // Email Verification

  // Password reset (if using custom instead of Firebase)
  passwordReset: 'template_cq7defx'         // Password Reset
};

// Check if EmailJS is ready
const isEmailReady = () => {
  return typeof window !== 'undefined' && window.emailjs;
};

// Initialize EmailJS (already done in main.jsx but can call again)
export const initEmailService = () => {
  if (isEmailReady()) {
    window.emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('💜 EmailJS ready');
    return true;
  }
  console.warn('EmailJS not loaded');
  return false;
};

// =====================================================
// 👤 USER EMAILS
// =====================================================

// 1. USER WELCOME - When user signs up
export const sendUserWelcomeEmail = async (userData) => {
  const templateParams = {
    to_email: userData.email,
    to_name: userData.name || 'Friend',
    app_name: 'YRNAlone'
  };

  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_IDS.userWelcome, templateParams);
      console.log('User welcome email sent!');
      return true;
    }
  } catch (error) {
    console.error('Error sending user welcome email:', error);
  }
  return false;
};

// 2. USER CHECK-IN - "How are you doing?" (7 days after signup)
export const sendUserCheckinEmail = async (userData) => {
  const templateParams = {
    to_email: userData.email,
    to_name: userData.name || 'Friend',
    days_since_signup: 7
  };

  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_IDS.userCheckin, templateParams);
      console.log('User check-in email sent!');
      return true;
    }
  } catch (error) {
    console.error('Error sending check-in email:', error);
  }
  return false;
};

// 3. USER UPGRADE NUDGE - When they hit free limits
export const sendUserUpgradeEmail = async (userData, limitHit) => {
  const templateParams = {
    to_email: userData.email,
    to_name: userData.name || 'Friend',
    limit_type: limitHit, // 'journal', 'mood', 'groups'
    monthly_price: '$5.99',
    yearly_price: '$59.99'
  };

  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_IDS.userUpgrade, templateParams);
      console.log('Upgrade email sent!');
      return true;
    }
  } catch (error) {
    console.error('Error sending upgrade email:', error);
  }
  return false;
};

// 4. USER ACHIEVEMENT - When they earn a badge
export const sendUserAchievementEmail = async (userData, achievement) => {
  const templateParams = {
    to_email: userData.email,
    to_name: userData.name || 'Friend',
    achievement_name: achievement.name,
    achievement_emoji: achievement.emoji,
    achievement_description: achievement.description
  };

  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_IDS.userAchievement, templateParams);
      console.log('Achievement email sent!');
      return true;
    }
  } catch (error) {
    console.error('Error sending achievement email:', error);
  }
  return false;
};

// 5. WE MISS YOU - If inactive for 7 days
export const sendUserMissYouEmail = async (userData) => {
  const templateParams = {
    to_email: userData.email,
    to_name: userData.name || 'Friend',
    days_inactive: 7
  };

  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_IDS.userMissYou, templateParams);
      console.log('Miss you email sent!');
      return true;
    }
  } catch (error) {
    console.error('Error sending miss you email:', error);
  }
  return false;
};


// =====================================================
// 🏥 ORGANIZATION EMAILS
// =====================================================

// 1. ORG WELCOME - When organization signs up
export const sendOrgWelcomeEmail = async (orgData) => {
  const templateParams = {
    to_email: orgData.contactEmail,
    to_name: orgData.contactName,
    org_name: orgData.name,
    access_code: orgData.accessCode,
    plan_name: orgData.planName,
    max_users: orgData.maxUsers,
    trial_end_date: orgData.trialEndDate
  };

  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_IDS.orgWelcome, templateParams);
      console.log('Org welcome email sent!');
      return true;
    }
  } catch (error) {
    console.error('Error sending org welcome email:', error);
  }
  return false;
};

// 2. ORG MONTHLY REPORT - Sent on 1st of each month
export const sendOrgMonthlyReportEmail = async (orgData, stats) => {
  const templateParams = {
    to_email: orgData.contactEmail,
    to_name: orgData.contactName,
    org_name: orgData.name,
    month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    total_users: stats.totalUsers,
    active_users: stats.activeUsers,
    engagement_rate: stats.engagementRate,
    mood_checkins: stats.totalMoodEntries,
    average_mood: stats.averageMood,
    new_users: stats.newUsersThisMonth || 0
  };

  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_IDS.orgMonthlyReport, templateParams);
      console.log('Monthly report email sent!');
      return true;
    }
  } catch (error) {
    console.error('Error sending monthly report:', error);
  }
  return false;
};

// 3. ORG INVOICE - Payment reminder
export const sendOrgInvoiceEmail = async (orgData, invoiceData) => {
  const templateParams = {
    to_email: orgData.contactEmail,
    to_name: orgData.contactName,
    org_name: orgData.name,
    invoice_number: invoiceData.invoiceNumber,
    amount: invoiceData.amount,
    due_date: invoiceData.dueDate,
    plan_name: orgData.planName,
    payment_link: invoiceData.paymentLink || 'https://yrnalone.com/pay'
  };

  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_IDS.orgInvoice, templateParams);
      console.log('Invoice email sent!');
      return true;
    }
  } catch (error) {
    console.error('Error sending invoice:', error);
  }
  return false;
};

// 4. ORG USAGE ALERT - When approaching user limit
export const sendOrgUsageAlertEmail = async (orgData, usageData) => {
  const templateParams = {
    to_email: orgData.contactEmail,
    to_name: orgData.contactName,
    org_name: orgData.name,
    current_users: usageData.currentUsers,
    max_users: usageData.maxUsers,
    usage_percent: usageData.usagePercent,
    upgrade_link: 'https://yrnalone.com/upgrade'
  };

  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_IDS.orgUsageAlert, templateParams);
      console.log('Usage alert email sent!');
      return true;
    }
  } catch (error) {
    console.error('Error sending usage alert:', error);
  }
  return false;
};

// 5. ORG TRIAL ENDING - 3 days before trial ends
export const sendOrgTrialEndingEmail = async (orgData) => {
  const templateParams = {
    to_email: orgData.contactEmail,
    to_name: orgData.contactName,
    org_name: orgData.name,
    trial_end_date: orgData.trialEndDate,
    plan_name: orgData.planName,
    price: orgData.pricePerMonth,
    payment_link: 'https://yrnalone.com/pay'
  };

  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_IDS.orgTrialEnding, templateParams);
      console.log('Trial ending email sent!');
      return true;
    }
  } catch (error) {
    console.error('Error sending trial ending email:', error);
  }
  return false;
};


// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Check if should send usage alert to org
export const checkAndSendOrgUsageAlert = async (orgData) => {
  const usagePercent = (orgData.currentUsers / orgData.maxUsers) * 100;
  
  if (usagePercent >= 80 && !orgData.alertSent80) {
    await sendOrgUsageAlertEmail(orgData, {
      currentUsers: orgData.currentUsers,
      maxUsers: orgData.maxUsers,
      usagePercent: Math.round(usagePercent)
    });
    return { alertSent: true, level: 80 };
  }
  
  if (usagePercent >= 95 && !orgData.alertSent95) {
    await sendOrgUsageAlertEmail(orgData, {
      currentUsers: orgData.currentUsers,
      maxUsers: orgData.maxUsers,
      usagePercent: Math.round(usagePercent)
    });
    return { alertSent: true, level: 95 };
  }
  
  return { alertSent: false };
};

// Check if user is inactive and should get "miss you" email
export const checkUserInactivity = (lastActiveDate) => {
  const now = new Date();
  const lastActive = new Date(lastActiveDate);
  const daysSinceActive = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
  return daysSinceActive >= 7;
};

// =====================================================
// 📧 CORE 6 EMAIL FUNCTIONS (Jess's Template IDs)
// =====================================================

// 1. EMAIL VERIFICATION - When user signs up (template_p91koho)
export const sendEmailVerification = async (userData) => {
  const templateParams = {
    to_email: userData.email,
    to_name: userData.name || 'Friend',
    verification_link: userData.verificationLink || 'https://yrnalone.com/verify',
    app_name: 'YRNAlone'
  };

  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_IDS.emailVerification, templateParams);
      console.log('✅ Email verification sent!');
      return { success: true };
    }
  } catch (error) {
    console.error('❌ Email verification failed:', error);
    return { success: false, error };
  }
  return { success: false, error: 'EmailJS not loaded' };
};

// 2. ORGANIZATION WELCOME - When org registers (template_56vzh8t)
// Already exists as sendOrgWelcomeEmail above - using orgWelcome template

// 3. PASSWORD RESET - Custom EmailJS template (template_cq7defx)
// Use this if you want custom branded emails instead of Firebase default
export const sendPasswordResetEmailCustom = async (userData) => {
  const templateParams = {
    to_email: userData.email,
    to_name: userData.name || 'Friend',
    reset_link: userData.resetLink || `https://yrnalone.com/reset?email=${encodeURIComponent(userData.email)}`,
    app_name: 'YRNAlone'
  };

  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_IDS.passwordReset, templateParams);
      console.log('✅ Password reset email sent!');
      return { success: true };
    }
  } catch (error) {
    console.error('❌ Password reset email failed:', error);
    return { success: false, error };
  }
  return { success: false, error: 'EmailJS not loaded' };
};

// 4. PAYMENT CONFIRMATION - Individual user (template_iisxmgu)
export const sendPaymentConfirmationIndividual = async (userData) => {
  const templateParams = {
    to_email: userData.email,
    to_name: userData.name || 'Friend',
    plan_name: userData.planName || 'Premium',
    amount: userData.amount || '$5.99',
    billing_period: userData.billingPeriod || 'monthly',
    next_billing_date: userData.nextBillingDate || 'N/A',
    app_name: 'YRNAlone'
  };

  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_IDS.paymentIndividual, templateParams);
      console.log('✅ Individual payment confirmation sent!');
      return { success: true };
    }
  } catch (error) {
    console.error('❌ Individual payment confirmation failed:', error);
    return { success: false, error };
  }
  return { success: false, error: 'EmailJS not loaded' };
};

// 5. PAYMENT CONFIRMATION - Organization (template_tg0oasr)
export const sendPaymentConfirmationOrg = async (orgData) => {
  const templateParams = {
    to_email: orgData.adminEmail || orgData.contactEmail,
    to_name: orgData.adminName || orgData.contactName || 'Admin',
    organization_name: orgData.organizationName || orgData.name,
    plan_name: orgData.planName || 'Enterprise',
    amount: orgData.amount,
    billing_period: orgData.billingPeriod || 'monthly',
    user_count: orgData.userCount || orgData.maxUsers || 'Unlimited',
    invoice_link: orgData.invoiceLink || '#',
    app_name: 'YRNAlone'
  };

  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_IDS.paymentOrg, templateParams);
      console.log('✅ Org payment confirmation sent!');
      return { success: true };
    }
  } catch (error) {
    console.error('❌ Org payment confirmation failed:', error);
    return { success: false, error };
  }
  return { success: false, error: 'EmailJS not loaded' };
};

// 6. USER INVITATION - Invite user to org/group (template_1vffppd)
export const sendUserInvitation = async (inviteData) => {
  const templateParams = {
    to_email: inviteData.email,
    to_name: inviteData.name || 'Friend',
    inviter_name: inviteData.inviterName || 'Someone',
    organization_name: inviteData.organizationName || 'YRNAlone',
    invitation_link: inviteData.invitationLink || 'https://yrnalone.com/join',
    access_code: inviteData.accessCode || '',
    message: inviteData.message || 'You\'ve been invited to join us!',
    app_name: 'YRNAlone'
  };

  try {
    if (window.emailjs) {
      await window.emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_IDS.userInvitation, templateParams);
      console.log('✅ User invitation sent!');
      return { success: true };
    }
  } catch (error) {
    console.error('❌ User invitation failed:', error);
    return { success: false, error };
  }
  return { success: false, error: 'EmailJS not loaded' };
};

// =====================================================
// 🔧 HELPER: Send any email by template name (generic)
// =====================================================
export const sendEmail = async (templateName, data) => {
  const templateId = TEMPLATE_IDS[templateName];
  if (!templateId) {
    console.error('Unknown template:', templateName);
    return { success: false, error: 'Unknown template' };
  }

  try {
    if (window.emailjs) {
      const result = await window.emailjs.send(EMAILJS_SERVICE_ID, templateId, data);
      return { success: true, result };
    }
  } catch (error) {
    return { success: false, error };
  }
  return { success: false, error: 'EmailJS not loaded' };
};

// Export all template IDs for reference
export { TEMPLATE_IDS as EMAIL_TEMPLATES };

// Export all functions
export default {
  initEmailService,

  // ===== CORE 6 TEMPLATES =====
  sendEmailVerification,           // 1. template_p91koho
  sendOrgWelcomeEmail,             // 2. template_56vzh8t (Organization Welcome)
  sendPasswordResetEmailCustom,    // 3. template_cq7defx
  sendPaymentConfirmationIndividual, // 4. template_iisxmgu
  sendPaymentConfirmationOrg,      // 5. template_tg0oasr
  sendUserInvitation,              // 6. template_1vffppd

  // User emails (additional)
  sendUserWelcomeEmail,
  sendUserCheckinEmail,
  sendUserUpgradeEmail,
  sendUserAchievementEmail,
  sendUserMissYouEmail,

  // Org emails (additional)
  sendOrgMonthlyReportEmail,
  sendOrgInvoiceEmail,
  sendOrgUsageAlertEmail,
  sendOrgTrialEndingEmail,

  // Helpers
  sendEmail,
  checkAndSendOrgUsageAlert,
  checkUserInactivity,

  // Constants
  EMAIL_TEMPLATES: TEMPLATE_IDS,
  EMAILJS_SERVICE_ID
};
