// FILE: src/legal/PrivacyPolicy.jsx
// Privacy Policy for YRNAlone

import React from 'react';

const PrivacyPolicy = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Privacy Policy</h1>
          {onBack && (
            <button onClick={onBack} className="text-purple-600 font-medium">
              ← Back
            </button>
          )}
        </div>

        <p className="text-gray-500 mb-6">Last updated: January 2, 2026</p>

        <div className="prose prose-purple max-w-none">
          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">1. Introduction</h2>
          <p className="text-gray-600 mb-4">
            Welcome to YRNAlone ("we," "our," or "us"). We are committed to protecting your privacy 
            and personal information. This Privacy Policy explains how we collect, use, disclose, 
            and safeguard your information when you use our mental health and wellness application.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">2. Information We Collect</h2>
          <p className="text-gray-600 mb-2"><strong>Personal Information:</strong></p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Name and email address</li>
            <li>Account credentials</li>
            <li>Profile information you choose to provide</li>
          </ul>
          
          <p className="text-gray-600 mb-2"><strong>Health & Wellness Data:</strong></p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Mood check-ins and emotional data</li>
            <li>Journal entries</li>
            <li>Sleep tracking information</li>
            <li>Usage patterns within the app</li>
          </ul>

          <p className="text-gray-600 mb-2"><strong>Technical Information:</strong></p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Device information</li>
            <li>IP address</li>
            <li>Browser type</li>
            <li>App usage analytics</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">3. How We Use Your Information</h2>
          <p className="text-gray-600 mb-2">We use your information to:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Provide and personalize our mental health services</li>
            <li>Track your wellness progress and provide insights</li>
            <li>Send important notifications and updates</li>
            <li>Improve our app and develop new features</li>
            <li>Ensure the security of our platform</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">4. Data Protection & Security</h2>
          <p className="text-gray-600 mb-4">
            We implement industry-standard security measures to protect your data, including:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication systems</li>
            <li>Regular security audits</li>
            <li>Limited employee access to personal data</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">5. HIPAA Compliance</h2>
          <p className="text-gray-600 mb-4">
            For users accessing YRNAlone through healthcare organizations, we comply with the 
            Health Insurance Portability and Accountability Act (HIPAA). We maintain appropriate 
            administrative, physical, and technical safeguards to protect Protected Health 
            Information (PHI). We sign Business Associate Agreements (BAA) with covered entities.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">6. Data Sharing</h2>
          <p className="text-gray-600 mb-2">We do NOT sell your personal data. We may share data with:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li><strong>Service Providers:</strong> Who help us operate the app (hosting, analytics)</li>
            <li><strong>Healthcare Organizations:</strong> If you access YRNAlone through a hospital or clinic (only aggregated, anonymized data)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect safety</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">7. Your Rights</h2>
          <p className="text-gray-600 mb-2">You have the right to:</p>
          <ul className="list-disc pl-6 text-gray-600 mb-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and data</li>
            <li>Export your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">8. Children's Privacy</h2>
          <p className="text-gray-600 mb-4">
            YRNAlone is designed to be safe for users of all ages. For users under 13, we require 
            parental consent and collect minimal data necessary to provide our services. We comply 
            with the Children's Online Privacy Protection Act (COPPA).
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">9. Data Retention</h2>
          <p className="text-gray-600 mb-4">
            We retain your data for as long as your account is active or as needed to provide 
            services. You may request deletion of your data at any time. Some data may be retained 
            as required by law.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">10. Changes to This Policy</h2>
          <p className="text-gray-600 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any 
            significant changes via email or in-app notification.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3">11. Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have questions about this Privacy Policy or your data, contact us at:
          </p>
          <p className="text-gray-600 mb-4">
            <strong>Email:</strong> privacy@yrnalone.com<br />
            <strong>Website:</strong> www.yrnalone.com
          </p>

          <div className="mt-8 p-4 bg-purple-50 rounded-xl">
            <p className="text-purple-800 text-sm">
              💜 Your privacy matters to us. We're committed to being transparent about how 
              we handle your data and keeping it safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
