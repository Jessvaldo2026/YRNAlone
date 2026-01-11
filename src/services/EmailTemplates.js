// =====================================================
// 💜 YRNALONE EMAIL TEMPLATES - COMPLETE
// =====================================================
// Copy these templates into EmailJS (https://emailjs.com)
// =====================================================


// =====================================================
// 👤 USER TEMPLATES
// =====================================================


// =====================================================
// USER TEMPLATE 1: WELCOME (template_user_welcome)
// =====================================================
/*
SUBJECT: Welcome to YRNAlone! 🧸💜 You're Not Alone

BODY (HTML):
-------------------------------------------

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #7C3AED, #EC4899); padding: 40px; text-align: center; border-radius: 16px 16px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .teddy { font-size: 60px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px; }
    .feature-box { background: white; padding: 15px; border-radius: 12px; margin: 10px 0; display: flex; align-items: center; gap: 15px; }
    .feature-emoji { font-size: 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #7C3AED, #EC4899); color: white; padding: 16px 32px; border-radius: 100px; text-decoration: none; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="teddy">🧸</div>
      <h1>Welcome to YRNAlone!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">You Are Not Alone 💜</p>
    </div>
    <div class="content">
      <p>Hi {{to_name}},</p>
      
      <p>Welcome to our little community of people who support each other through life's ups and downs. We're so happy you're here! 🎉</p>
      
      <h3>Here's what you can do:</h3>
      
      <div class="feature-box">
        <span class="feature-emoji">😊</span>
        <div>
          <strong>Track Your Mood</strong><br>
          <span style="color: #666;">Check in daily to understand your patterns</span>
        </div>
      </div>
      
      <div class="feature-box">
        <span class="feature-emoji">📖</span>
        <div>
          <strong>Write in Your Journal</strong><br>
          <span style="color: #666;">A safe space for your thoughts</span>
        </div>
      </div>
      
      <div class="feature-box">
        <span class="feature-emoji">👥</span>
        <div>
          <strong>Join Support Groups</strong><br>
          <span style="color: #666;">Connect with people who understand</span>
        </div>
      </div>
      
      <div class="feature-box">
        <span class="feature-emoji">🧘</span>
        <div>
          <strong>Breathing Exercises</strong><br>
          <span style="color: #666;">Calm your mind in moments of stress</span>
        </div>
      </div>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="https://yrnalone.com" class="button">Open YRNAlone 💜</a>
      </p>
      
      <p>Remember: It's okay to not be okay. We're here for you. 💜</p>
      
      <p>With love,<br>The YRNAlone Team 🧸</p>
    </div>
    <div class="footer">
      <p>YRNAlone - You Are Not Alone<br>
      <a href="https://yrnalone.com/unsubscribe" style="color: #666;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>

-------------------------------------------
*/


// =====================================================
// USER TEMPLATE 2: CHECK-IN (template_user_checkin)
// =====================================================
/*
SUBJECT: Hey {{to_name}}, how are you doing? 💜

BODY (HTML):
-------------------------------------------

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #7C3AED, #EC4899); padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px; }
    .mood-buttons { display: flex; justify-content: center; gap: 10px; margin: 20px 0; }
    .mood-btn { font-size: 40px; text-decoration: none; }
    .button { display: inline-block; background: linear-gradient(135deg, #7C3AED, #EC4899); color: white; padding: 14px 28px; border-radius: 100px; text-decoration: none; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💜 Just Checking In</h1>
    </div>
    <div class="content">
      <p>Hey {{to_name}},</p>
      
      <p>It's been a week since you joined us, and we just wanted to check in. How are you feeling today?</p>
      
      <div class="mood-buttons">
        <a href="https://yrnalone.com" class="mood-btn">😊</a>
        <a href="https://yrnalone.com" class="mood-btn">😐</a>
        <a href="https://yrnalone.com" class="mood-btn">😢</a>
        <a href="https://yrnalone.com" class="mood-btn">😰</a>
      </div>
      
      <p>Whatever you're feeling, it's valid. And remember - you don't have to go through anything alone.</p>
      
      <h3>💡 Quick tip:</h3>
      <p>Try to check in with your mood every day, even for just a moment. Over time, you'll start to see patterns that can help you understand yourself better.</p>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="https://yrnalone.com" class="button">Open App 💜</a>
      </p>
      
      <p>We're always here for you,<br>The YRNAlone Team 🧸</p>
    </div>
    <div class="footer">
      <p>YRNAlone - You Are Not Alone<br>
      <a href="https://yrnalone.com/unsubscribe" style="color: #666;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>

-------------------------------------------
*/


// =====================================================
// USER TEMPLATE 3: UPGRADE (template_user_upgrade)
// =====================================================
/*
SUBJECT: Unlock unlimited access to YRNAlone 💜

BODY (HTML):
-------------------------------------------

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #7C3AED, #EC4899); padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px; }
    .price-box { background: white; padding: 25px; border-radius: 16px; text-align: center; margin: 20px 0; box-shadow: 0 4px 15px rgba(124,58,237,0.1); }
    .price { font-size: 36px; font-weight: bold; color: #7C3AED; }
    .feature-list { background: white; padding: 20px; border-radius: 12px; margin: 15px 0; }
    .feature-item { padding: 8px 0; border-bottom: 1px solid #eee; }
    .feature-item:last-child { border-bottom: none; }
    .button { display: inline-block; background: linear-gradient(135deg, #7C3AED, #EC4899); color: white; padding: 16px 32px; border-radius: 100px; text-decoration: none; font-weight: bold; font-size: 16px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⭐ Go Premium</h1>
    </div>
    <div class="content">
      <p>Hey {{to_name}},</p>
      
      <p>We noticed you're really getting into YRNAlone! 💜 You've been using your {{limit_type}} feature a lot.</p>
      
      <p>Want to unlock <strong>unlimited access</strong> to everything?</p>
      
      <div class="price-box">
        <p style="color: #666; margin: 0 0 10px 0;">YRNAlone Premium</p>
        <div class="price">{{monthly_price}}<span style="font-size: 16px; font-weight: normal;">/month</span></div>
        <p style="color: #666; margin: 10px 0 0 0;">or {{yearly_price}}/year (save 29%!)</p>
      </div>
      
      <div class="feature-list">
        <div class="feature-item">✅ <strong>Unlimited</strong> mood check-ins</div>
        <div class="feature-item">✅ <strong>Unlimited</strong> journal entries</div>
        <div class="feature-item">✅ <strong>All 11</strong> support groups</div>
        <div class="feature-item">✅ <strong>AI Companion</strong> for 24/7 support</div>
        <div class="feature-item">✅ <strong>All</strong> breathing exercises</div>
        <div class="feature-item">✅ <strong>Sound therapy</strong> library</div>
        <div class="feature-item">✅ <strong>Sleep tracker</strong></div>
      </div>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="https://yrnalone.com/upgrade" class="button">Upgrade Now 💜</a>
      </p>
      
      <p style="font-size: 14px; color: #666;">Cancel anytime. No questions asked.</p>
      
      <p>Thanks for being part of our community,<br>The YRNAlone Team 🧸</p>
    </div>
    <div class="footer">
      <p>YRNAlone - You Are Not Alone<br>
      <a href="https://yrnalone.com/unsubscribe" style="color: #666;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>

-------------------------------------------
*/


// =====================================================
// USER TEMPLATE 4: ACHIEVEMENT (template_user_achievement)
// =====================================================
/*
SUBJECT: 🎉 You earned a new badge: {{achievement_name}}!

BODY (HTML):
-------------------------------------------

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #F59E0B, #EC4899); padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px; }
    .badge-box { background: white; padding: 30px; border-radius: 20px; text-align: center; margin: 20px 0; box-shadow: 0 4px 20px rgba(245,158,11,0.2); }
    .badge-emoji { font-size: 80px; }
    .badge-name { font-size: 24px; font-weight: bold; color: #333; margin: 15px 0 5px 0; }
    .badge-desc { color: #666; }
    .confetti { font-size: 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #F59E0B, #EC4899); color: white; padding: 14px 28px; border-radius: 100px; text-decoration: none; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Achievement Unlocked!</h1>
    </div>
    <div class="content">
      <p>Hey {{to_name}},</p>
      
      <p>You're doing AMAZING! 🌟</p>
      
      <div class="badge-box">
        <div class="confetti">🎊✨🎉</div>
        <div class="badge-emoji">{{achievement_emoji}}</div>
        <div class="badge-name">{{achievement_name}}</div>
        <div class="badge-desc">{{achievement_description}}</div>
      </div>
      
      <p>Every step you take on your wellness journey matters. We're so proud of you! 💜</p>
      
      <p>Keep going - there are more achievements waiting for you!</p>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="https://yrnalone.com" class="button">See All Badges 🏆</a>
      </p>
      
      <p>Cheering you on,<br>The YRNAlone Team 🧸</p>
    </div>
    <div class="footer">
      <p>YRNAlone - You Are Not Alone<br>
      <a href="https://yrnalone.com/unsubscribe" style="color: #666;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>

-------------------------------------------
*/


// =====================================================
// USER TEMPLATE 5: WE MISS YOU (template_user_missyou)
// =====================================================
/*
SUBJECT: We miss you, {{to_name}} 💜🧸

BODY (HTML):
-------------------------------------------

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #7C3AED, #EC4899); padding: 40px; text-align: center; border-radius: 16px 16px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .teddy { font-size: 60px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px; }
    .button { display: inline-block; background: linear-gradient(135deg, #7C3AED, #EC4899); color: white; padding: 16px 32px; border-radius: 100px; text-decoration: none; font-weight: bold; }
    .quote-box { background: white; padding: 20px; border-radius: 12px; border-left: 4px solid #7C3AED; margin: 20px 0; font-style: italic; color: #555; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="teddy">🧸</div>
      <h1>We Miss You!</h1>
    </div>
    <div class="content">
      <p>Hey {{to_name}},</p>
      
      <p>It's been about a week since we last saw you, and we just wanted to reach out. 💜</p>
      
      <p>Life gets busy, we know. But we're still here whenever you need us - whether that's to vent, track your mood, or just take a breath.</p>
      
      <div class="quote-box">
        "It's okay to take breaks. It's okay to come back. Your journey is your own, and we're here whenever you're ready." 💜
      </div>
      
      <p>No pressure at all - just know that your teddy bears miss you! 🧸</p>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="https://yrnalone.com" class="button">Come Back Anytime 💜</a>
      </p>
      
      <p>Sending you love,<br>The YRNAlone Team 🧸</p>
      
      <p style="font-size: 12px; color: #999;">P.S. If you're going through a tough time, we're here. You don't have to face it alone. 💜</p>
    </div>
    <div class="footer">
      <p>YRNAlone - You Are Not Alone<br>
      <a href="https://yrnalone.com/unsubscribe" style="color: #666;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>

-------------------------------------------
*/


// =====================================================
// 🏥 ORGANIZATION TEMPLATES
// =====================================================


// =====================================================
// ORG TEMPLATE 1: WELCOME (template_org_welcome)
// =====================================================
/*
SUBJECT: Welcome to YRNAlone! 🎉 Your Access Code Inside

BODY (HTML):
-------------------------------------------

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #7C3AED, #EC4899); padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 16px 16px; }
    .code-box { background: linear-gradient(135deg, #7C3AED, #EC4899); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; }
    .code { font-size: 36px; font-weight: bold; letter-spacing: 4px; }
    .button { display: inline-block; background: #7C3AED; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧸 Welcome to YRNAlone!</h1>
    </div>
    <div class="content">
      <p>Hi {{to_name}},</p>
      
      <p>Thank you for choosing YRNAlone for <strong>{{org_name}}</strong>!</p>
      
      <div class="code-box">
        <p style="margin: 0 0 10px 0; opacity: 0.9;">Your Access Code</p>
        <div class="code">{{access_code}}</div>
        <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 14px;">Share this with your users</p>
      </div>
      
      <h3>📋 Quick Start:</h3>
      <ol>
        <li>Share the access code with your patients/staff</li>
        <li>They enter the code in YRNAlone</li>
        <li>Track usage in your Admin Dashboard</li>
      </ol>
      
      <h3>📊 Your Plan:</h3>
      <ul>
        <li><strong>Plan:</strong> {{plan_name}}</li>
        <li><strong>Max Users:</strong> {{max_users}}</li>
        <li><strong>Trial Ends:</strong> {{trial_end_date}}</li>
      </ul>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="https://yrnalone.com/dashboard" class="button">Go to Dashboard →</a>
      </p>
      
      <p>With love,<br>The YRNAlone Team 💜</p>
    </div>
  </div>
</body>
</html>

-------------------------------------------
*/


// =====================================================
// ORG TEMPLATE 2: MONTHLY REPORT (template_org_report)
// =====================================================
/*
SUBJECT: 📊 {{org_name}} - Monthly Report for {{month}}

(Use similar structure as org welcome but with stats grid)
*/


// =====================================================
// ORG TEMPLATE 3: INVOICE (template_org_invoice)
// =====================================================
/*
SUBJECT: 💳 YRNAlone Invoice #{{invoice_number}}

(Standard invoice layout with amount, due date, pay button)
*/


// =====================================================
// ORG TEMPLATE 4: USAGE ALERT (template_org_usage)
// =====================================================
/*
SUBJECT: ⚠️ {{org_name}} is at {{usage_percent}}% capacity

(Alert showing current users vs max, upgrade button)
*/


// =====================================================
// ORG TEMPLATE 5: TRIAL ENDING (template_org_trial)
// =====================================================
/*
SUBJECT: ⏰ Your YRNAlone trial ends in 3 days

(Countdown, plan details, payment button)
*/


// =====================================================
// HOW TO SET UP EMAILJS:
// =====================================================
/*

1. GO TO: https://www.emailjs.com/
2. CREATE FREE ACCOUNT (200 emails/month free)
3. CREATE EMAIL SERVICE (connect Gmail)
4. CREATE TEMPLATES (copy HTML from above)
5. GET YOUR KEYS (Account → General)
6. UPDATE EmailService.js with your keys
7. ADD TO index.html:
   <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>

DONE! 🎉

*/
