// FILE: src/services/OrganizationEmails.js
// Email system for organizations - welcome emails, invitations, etc.
// Uses EmailJS (free tier: 200 emails/month)

// =====================================================
// 📧 EMAILJS SETUP
// =====================================================
// 1. Go to emailjs.com and create free account
// 2. Create email service (Gmail, Outlook, etc.)
// 3. Create email templates (I'll show you what to put)
// 4. Get your Service ID, Template IDs, and Public Key
// 5. Replace the values below

const EMAILJS_SERVICE_ID = 'service_0i2gmim';
const EMAILJS_PUBLIC_KEY = '_aQr2ZmXVBIGcYnk5';

// Template IDs
const TEMPLATES = {
  orgWelcome: 'template_56vzh8t',                  // Welcome email to org admin
  userInvitation: 'template_1vffppd',              // Invitation to join org
  accessCodeReminder: 'template_56vzh8t',          // Resend access code
  orgVerification: 'template_56vzh8t'              // Verify org email
};


// =====================================================
// 📧 SEND ORGANIZATION WELCOME EMAIL
// =====================================================
// Sent when organization signs up

export const sendOrgWelcomeEmail = async (orgData) => {
  const { contactEmail, contactName, organizationName, accessCode, plan } = orgData;

  const templateParams = {
    to_email: contactEmail,
    to_name: contactName,
    org_name: organizationName,
    access_code: accessCode,
    plan_name: plan,
    dashboard_link: `${window.location.origin}/admin`,
    subject: `Welcome to YRNAlone! Your access code: ${accessCode}`
  };

  try {
    // Check if EmailJS is loaded
    if (typeof emailjs === 'undefined') {
      console.log('EmailJS not loaded. Email would be sent:', templateParams);
      return { success: true, demo: true };
    }

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATES.orgWelcome,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Org welcome email sent to:', contactEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send org welcome email:', error);
    return { success: false, error };
  }
};


// =====================================================
// 📧 SEND USER INVITATION EMAIL
// =====================================================
// Sent when org admin invites a user

export const sendUserInvitationEmail = async (inviteData) => {
  const { 
    userEmail, 
    userName, 
    organizationName, 
    accessCode, 
    invitedBy,
    customMessage 
  } = inviteData;

  const templateParams = {
    to_email: userEmail,
    to_name: userName || 'there',
    org_name: organizationName,
    access_code: accessCode,
    invited_by: invitedBy,
    custom_message: customMessage || '',
    app_link: window.location.origin,
    subject: `You're invited to join ${organizationName} on YRNAlone!`
  };

  try {
    if (typeof emailjs === 'undefined') {
      console.log('EmailJS not loaded. Invitation would be sent:', templateParams);
      return { success: true, demo: true };
    }

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATES.userInvitation,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Invitation email sent to:', userEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send invitation email:', error);
    return { success: false, error };
  }
};


// =====================================================
// 📧 SEND BULK INVITATIONS
// =====================================================
// Send invitations to multiple users at once

export const sendBulkInvitations = async (emails, orgData) => {
  const { organizationName, accessCode, adminName } = orgData;
  
  const results = {
    sent: 0,
    failed: 0,
    errors: []
  };

  for (const email of emails) {
    const result = await sendUserInvitationEmail({
      userEmail: email.trim(),
      organizationName,
      accessCode,
      invitedBy: adminName
    });

    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push({ email, error: result.error });
    }

    // Small delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results;
};


// =====================================================
// 📧 SEND ACCESS CODE REMINDER
// =====================================================
// Resend access code to org admin

export const sendAccessCodeReminder = async (orgData) => {
  const { contactEmail, contactName, organizationName, accessCode } = orgData;

  const templateParams = {
    to_email: contactEmail,
    to_name: contactName,
    org_name: organizationName,
    access_code: accessCode,
    subject: `Your YRNAlone access code: ${accessCode}`
  };

  try {
    if (typeof emailjs === 'undefined') {
      console.log('EmailJS not loaded. Reminder would be sent:', templateParams);
      return { success: true, demo: true };
    }

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATES.accessCodeReminder,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Access code reminder sent to:', contactEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send reminder:', error);
    return { success: false, error };
  }
};


// =====================================================
// 📧 SEND VERIFICATION CODE
// =====================================================
// Send 6-digit code to verify org email

export const sendVerificationCode = async (email, orgName) => {
  // Generate 6-digit code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const templateParams = {
    to_email: email,
    org_name: orgName,
    verification_code: verificationCode,
    subject: `Your YRNAlone verification code: ${verificationCode}`
  };

  try {
    if (typeof emailjs === 'undefined') {
      console.log('EmailJS not loaded. Code would be sent:', templateParams);
      return { success: true, code: verificationCode, demo: true };
    }

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATES.orgVerification,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('✅ Verification code sent to:', email);
    return { success: true, code: verificationCode };
  } catch (error) {
    console.error('❌ Failed to send verification code:', error);
    return { success: false, error };
  }
};


// =====================================================
// 📧 EMAIL TEMPLATES FOR EMAILJS
// =====================================================
/*
Create these templates in your EmailJS dashboard:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEMPLATE 1: Organization Welcome (template_org_welcome)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subject: {{subject}}

Body (HTML):
---
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #7C3AED, #EC4899); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🎉 Welcome to YRNAlone!</h1>
  </div>
  
  <div style="padding: 30px; background: #f9fafb;">
    <p>Hi {{to_name}},</p>
    
    <p>Thank you for signing up <strong>{{org_name}}</strong> with YRNAlone! We're excited to help your team support mental wellness.</p>
    
    <div style="background: white; border: 2px solid #7C3AED; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
      <p style="margin: 0; color: #666;">Your Access Code</p>
      <h2 style="font-size: 32px; color: #7C3AED; letter-spacing: 5px; margin: 10px 0;">{{access_code}}</h2>
      <p style="margin: 0; color: #666; font-size: 14px;">Share this code with your users to join</p>
    </div>
    
    <p><strong>What's next?</strong></p>
    <ol>
      <li>Share the access code with your team/patients</li>
      <li>Access your admin dashboard to track engagement</li>
      <li>Contact us if you need any help!</li>
    </ol>
    
    <p>Your 14-day free trial has started. Add payment anytime to continue after the trial.</p>
    
    <p>💜 The YRNAlone Team</p>
  </div>
</div>
---


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEMPLATE 2: User Invitation (template_user_invite)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subject: {{subject}}

Body (HTML):
---
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #7C3AED, #EC4899); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">💜 You're Invited!</h1>
  </div>
  
  <div style="padding: 30px; background: #f9fafb;">
    <p>Hi {{to_name}},</p>
    
    <p><strong>{{invited_by}}</strong> has invited you to join <strong>{{org_name}}</strong> on YRNAlone - a mental wellness app designed to help you feel less alone.</p>
    
    {{#if custom_message}}
    <div style="background: #f3e8ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 0; font-style: italic;">"{{custom_message}}"</p>
    </div>
    {{/if}}
    
    <div style="background: white; border: 2px solid #7C3AED; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
      <p style="margin: 0; color: #666;">Your Access Code</p>
      <h2 style="font-size: 32px; color: #7C3AED; letter-spacing: 5px; margin: 10px 0;">{{access_code}}</h2>
    </div>
    
    <p><strong>How to join:</strong></p>
    <ol>
      <li>Download YRNAlone or visit {{app_link}}</li>
      <li>Create your account</li>
      <li>Enter the access code above when prompted</li>
    </ol>
    
    <a href="{{app_link}}" style="display: block; background: #7C3AED; color: white; text-align: center; padding: 15px 30px; border-radius: 8px; text-decoration: none; margin: 20px 0;">
      Join Now →
    </a>
    
    <p>💜 The YRNAlone Team</p>
  </div>
</div>
---


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEMPLATE 3: Verification Code (template_org_verify)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subject: {{subject}}

Body (HTML):
---
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #7C3AED, #EC4899); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🔐 Verify Your Email</h1>
  </div>
  
  <div style="padding: 30px; background: #f9fafb;">
    <p>Hi there,</p>
    
    <p>Please use the code below to verify your email for <strong>{{org_name}}</strong>:</p>
    
    <div style="background: white; border: 2px solid #7C3AED; border-radius: 10px; padding: 30px; text-align: center; margin: 20px 0;">
      <h1 style="font-size: 48px; color: #7C3AED; letter-spacing: 10px; margin: 0;">{{verification_code}}</h1>
    </div>
    
    <p style="color: #666; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
    
    <p>💜 The YRNAlone Team</p>
  </div>
</div>
---

*/

export default {
  sendOrgWelcomeEmail,
  sendUserInvitationEmail,
  sendBulkInvitations,
  sendAccessCodeReminder,
  sendVerificationCode
};
