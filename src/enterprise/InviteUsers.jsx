// FILE: src/enterprise/InviteUsers.jsx
// Component for org admins to invite users via email

import React, { useState } from 'react';
import { sendUserInvitationEmail, sendBulkInvitations } from '../services/OrganizationEmails';

const InviteUsers = ({ organization, onClose }) => {
  const [mode, setMode] = useState('single'); // 'single' or 'bulk'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSingleInvite = async () => {
    if (!email) return;
    
    setLoading(true);
    setResult(null);

    const response = await sendUserInvitationEmail({
      userEmail: email,
      userName: name,
      organizationName: organization.name,
      accessCode: organization.accessCode,
      invitedBy: organization.contactName,
      customMessage: message
    });

    setLoading(false);
    
    if (response.success) {
      setResult({ type: 'success', message: `Invitation sent to ${email}!` });
      setEmail('');
      setName('');
      setMessage('');
    } else {
      setResult({ type: 'error', message: 'Failed to send invitation. Try again.' });
    }
  };

  const handleBulkInvite = async () => {
    const emails = bulkEmails
      .split(/[\n,]/)
      .map(e => e.trim())
      .filter(e => e && e.includes('@'));

    if (emails.length === 0) {
      setResult({ type: 'error', message: 'Please enter valid email addresses.' });
      return;
    }

    setLoading(true);
    setResult(null);

    const response = await sendBulkInvitations(emails, {
      organizationName: organization.name,
      accessCode: organization.accessCode,
      adminName: organization.contactName
    });

    setLoading(false);
    
    setResult({
      type: response.failed === 0 ? 'success' : 'warning',
      message: `Sent ${response.sent} invitation(s). ${response.failed > 0 ? `${response.failed} failed.` : ''}`
    });

    if (response.sent > 0) {
      setBulkEmails('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">📧 Invite Users</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            Send email invitations with your access code
          </p>
        </div>

        {/* Access Code Display */}
        <div className="mx-6 mt-6 bg-purple-50 rounded-xl p-4 text-center">
          <p className="text-sm text-purple-600 mb-1">Your Access Code</p>
          <p className="text-2xl font-bold text-purple-700 tracking-widest">
            {organization?.accessCode || 'ABC123'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex mx-6 mt-4 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setMode('single')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              mode === 'single' 
                ? 'bg-white text-purple-600 shadow' 
                : 'text-gray-600'
            }`}
          >
            Single Invite
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              mode === 'bulk' 
                ? 'bg-white text-purple-600 shadow' 
                : 'text-gray-600'
            }`}
          >
            Bulk Invite
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Result Message */}
          {result && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${
              result.type === 'success' ? 'bg-green-50 text-green-700' :
              result.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
              'bg-red-50 text-red-700'
            }`}>
              {result.type === 'success' && '✓ '}
              {result.type === 'warning' && '⚠️ '}
              {result.type === 'error' && '✕ '}
              {result.message}
            </div>
          )}

          {mode === 'single' ? (
            /* Single Invite Form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@hospital.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Their name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal note to your invitation..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                onClick={handleSingleInvite}
                disabled={!email || loading}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
              >
                {loading ? '✨ Sending...' : '📧 Send Invitation'}
              </button>
            </div>
          ) : (
            /* Bulk Invite Form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Addresses
                </label>
                <textarea
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  placeholder="Enter email addresses (one per line or comma-separated):

john@hospital.com
jane@hospital.com
mike@hospital.com"
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate emails with commas or new lines
                </p>
              </div>

              <button
                onClick={handleBulkInvite}
                disabled={!bulkEmails || loading}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
              >
                {loading ? '✨ Sending...' : `📧 Send ${bulkEmails.split(/[\n,]/).filter(e => e.trim()).length || 0} Invitations`}
              </button>
            </div>
          )}

          {/* Alternative: Copy Link */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600 text-center mb-3">
              Or share the access code directly:
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `You're invited to join ${organization?.name} on YRNAlone!\n\nAccess Code: ${organization?.accessCode}\n\nDownload at: ${window.location.origin}`
                );
                setResult({ type: 'success', message: 'Copied to clipboard!' });
              }}
              className="w-full border-2 border-purple-200 text-purple-600 py-3 rounded-xl font-medium hover:bg-purple-50 transition"
            >
              📋 Copy Invitation Text
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteUsers;
