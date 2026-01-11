// FILE: src/legal/TermsOfService.jsx
// Terms of Service for YRNAlone

import React from 'react';

const TermsOfService = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Terms of Service</h1>
          {onBack && (
            <button onClick={onBack} className="text-purple-600 font-medium">
              ← Back
            </button>
          )}
        </div>

        <p className="text-gray-500 mb-6">Last updated: January 2, 2026</p>

        <div className="prose prose-purple max-w-none">
          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">1. Agreement to Terms</h2>
          <p className="text-gray-600 mb-4">
            By accessing or using YRNAlone ("the App"), you agree to be bound by these Terms of 
            Service. If you do not agree to these terms, please do not use the App.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">2. Description of Service</h2>
          <p className="text-gray-600 mb-4">
            YRNAlone is a mental health and wellness application that provides mood tracking, 
            journaling, support groups, and wellness tools. The App is designed to support 
            emotional wellbeing but is NOT a substitute for professional medical advice, 
            diagnosis, or treatment.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-700 font-medium">
              ⚠️ IMPORTANT: If you are experiencing a mental health emergency, please contact 
              emergency services (911) or the National Suicide Prevention Lifeline at 988.
            </p>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">3. Eligibility</h2>
          <p className="text-gray-600 mb-4">
            You must be at least 13 years old to use YRNAlone. Users under 18 should have 
            parental or guardian consent. By using the App, you represent that you meet these 
            requirements.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">4. User Accounts</h2>
          <p className="text-gray-600 mb-2">When creating an account, you agree to:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your password</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Be responsible for all activities under your account</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">5. Acceptable Use</h2>
          <p className="text-gray-600 mb-2">You agree NOT to:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Use the App for any illegal purpose</li>
            <li>Harass, bully, or harm other users</li>
            <li>Share inappropriate, sexual, or harmful content</li>
            <li>Attempt to access other users' accounts</li>
            <li>Use the App to exploit or harm minors</li>
            <li>Share personal contact information in public areas</li>
            <li>Impersonate others or misrepresent your identity</li>
            <li>Attempt to hack, disrupt, or damage the App</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">6. Content Moderation</h2>
          <p className="text-gray-600 mb-4">
            We use automated systems and human review to moderate content and ensure user safety. 
            We reserve the right to remove content and suspend accounts that violate these terms. 
            Users can report inappropriate content or behavior through the App.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">7. Subscription & Payments</h2>
          <p className="text-gray-600 mb-2"><strong>Free Features:</strong> Basic mood tracking, limited journal entries, and crisis resources are free.</p>
          <p className="text-gray-600 mb-2"><strong>Premium Subscription:</strong></p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Monthly: $5.99/month</li>
            <li>Yearly: $59.99/year</li>
            <li>Includes 7-day free trial</li>
            <li>Cancel anytime</li>
          </ul>
          <p className="text-gray-600 mb-4">
            Subscriptions automatically renew unless cancelled 24 hours before the renewal date. 
            Refunds are handled according to Apple App Store and Google Play Store policies.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">8. Organization Accounts</h2>
          <p className="text-gray-600 mb-4">
            Healthcare organizations, schools, and businesses may purchase organization plans. 
            Organization administrators receive access to anonymized, aggregated usage data only. 
            Individual user data remains private and is never shared with organization administrators.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">9. Intellectual Property</h2>
          <p className="text-gray-600 mb-4">
            The App, including its design, features, content, and code, is owned by YRNAlone and 
            protected by copyright and trademark laws. You may not copy, modify, distribute, or 
            create derivative works without our written permission.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">10. Disclaimer of Warranties</h2>
          <p className="text-gray-600 mb-4">
            THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee that 
            the App will be uninterrupted, error-free, or completely secure. We are not responsible 
            for any decisions you make based on information in the App.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">11. Limitation of Liability</h2>
          <p className="text-gray-600 mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, YRNALONE SHALL NOT BE LIABLE FOR ANY INDIRECT, 
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP. 
            Our total liability shall not exceed the amount you paid us in the past 12 months.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">12. Indemnification</h2>
          <p className="text-gray-600 mb-4">
            You agree to indemnify and hold harmless YRNAlone, its officers, employees, and partners 
            from any claims, damages, or expenses arising from your use of the App or violation of 
            these terms.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">13. Termination</h2>
          <p className="text-gray-600 mb-4">
            We may suspend or terminate your account at any time for violation of these terms. 
            You may delete your account at any time through the App settings. Upon termination, 
            your right to use the App ceases immediately.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">14. Governing Law</h2>
          <p className="text-gray-600 mb-4">
            These terms are governed by the laws of the State of Massachusetts, United States. 
            Any disputes shall be resolved in the courts of Massachusetts.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">15. Changes to Terms</h2>
          <p className="text-gray-600 mb-4">
            We may update these Terms of Service from time to time. We will notify you of 
            significant changes via email or in-app notification. Continued use of the App 
            after changes constitutes acceptance of the new terms.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">16. Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have questions about these Terms of Service, contact us at:
          </p>
          <p className="text-gray-600 mb-4">
            <strong>Email:</strong> legal@yrnalone.com<br />
            <strong>Website:</strong> www.yrnalone.com
          </p>

          <div className="mt-8 p-4 bg-purple-50 rounded-xl">
            <p className="text-purple-800 text-sm">
              💜 By using YRNAlone, you acknowledge that you have read, understood, and agree 
              to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
