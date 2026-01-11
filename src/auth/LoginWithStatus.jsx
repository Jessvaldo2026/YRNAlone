// FILE: src/auth/LoginWithStatus.jsx
// 🔐 Enhanced Login with Account Status Checking
// Shows appropriate messages for locked/suspended/banned accounts

import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  checkAccountStatus,
  ACCOUNT_STATUS,
  submitAccountAppeal,
  requestAccountUnlock
} from '../services/accountManagementService';

const LoginWithStatus = ({ onSwitch, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Account status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [accountStatusInfo, setAccountStatusInfo] = useState(null);

  // Appeal/unlock request
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealMessage, setAppealMessage] = useState('');
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, try to sign in to get the user ID
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check account status
      const statusResult = await checkAccountStatus(user.uid);

      if (!statusResult.canLogin) {
        // Sign out immediately
        await auth.signOut();

        // Show status modal
        setAccountStatusInfo({
          ...statusResult,
          userId: user.uid,
          email: email
        });
        setShowStatusModal(true);
        setLoading(false);
        return;
      }

      // Account is active, proceed with login
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError('Failed to log in. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleSubmitAppeal = async () => {
    if (!appealMessage.trim()) {
      return;
    }

    setLoading(true);

    try {
      const result = accountStatusInfo.status === ACCOUNT_STATUS.BANNED
        ? await submitAccountAppeal(accountStatusInfo.userId, email, appealMessage)
        : await requestAccountUnlock(accountStatusInfo.userId, email, appealMessage);

      if (result.success) {
        setAppealSubmitted(true);
        setShowAppealForm(false);
      } else {
        setError(result.error || 'Failed to submit request');
      }
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    }
    setLoading(false);
  };

  // Account Status Modal
  const AccountStatusModal = () => {
    if (!showStatusModal || !accountStatusInfo) return null;

    const getStatusIcon = () => {
      switch (accountStatusInfo.status) {
        case ACCOUNT_STATUS.LOCKED:
          return '🔒';
        case ACCOUNT_STATUS.SUSPENDED:
          return '⏸️';
        case ACCOUNT_STATUS.BANNED:
          return '🚫';
        default:
          return '⚠️';
      }
    };

    const getStatusColor = () => {
      switch (accountStatusInfo.status) {
        case ACCOUNT_STATUS.LOCKED:
          return 'orange';
        case ACCOUNT_STATUS.SUSPENDED:
          return 'yellow';
        case ACCOUNT_STATUS.BANNED:
          return 'red';
        default:
          return 'gray';
      }
    };

    const color = getStatusColor();

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md">
          {/* Appeal Submitted Success */}
          {appealSubmitted ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📨</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Submitted</h2>
              <p className="text-gray-600 mb-6">
                We've received your request and will review it as soon as possible.
                You'll receive an email update.
              </p>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setAppealSubmitted(false);
                  setAccountStatusInfo(null);
                }}
                className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600"
              >
                Close
              </button>
            </div>
          ) : showAppealForm ? (
            /* Appeal Form */
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {accountStatusInfo.status === ACCOUNT_STATUS.BANNED ? 'Submit Appeal' : 'Request Unlock'}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Please explain why your account should be restored.
              </p>
              <textarea
                value={appealMessage}
                onChange={(e) => setAppealMessage(e.target.value)}
                placeholder="Tell us why you believe your account should be restored..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none h-32"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowAppealForm(false)}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitAppeal}
                  disabled={loading || !appealMessage.trim()}
                  className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          ) : (
            /* Status Display */
            <div className="text-center">
              <div className="text-6xl mb-4">{getStatusIcon()}</div>
              <h2 className={`text-2xl font-bold mb-2 text-${color}-600`}>
                Account {accountStatusInfo.status.charAt(0).toUpperCase() + accountStatusInfo.status.slice(1)}
              </h2>

              <p className="text-gray-700 mb-4">
                {accountStatusInfo.message}
              </p>

              {accountStatusInfo.reason && (
                <div className={`bg-${color}-50 border border-${color}-200 rounded-xl p-4 mb-4 text-left`}>
                  <p className="text-sm font-medium text-gray-700">Reason:</p>
                  <p className={`text-sm text-${color}-700`}>{accountStatusInfo.reason}</p>
                </div>
              )}

              {/* Suspension info */}
              {accountStatusInfo.status === ACCOUNT_STATUS.SUSPENDED && accountStatusInfo.suspendedUntil && (
                <div className="bg-yellow-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Suspension ends:</span>{' '}
                    {new Date(accountStatusInfo.suspendedUntil).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    ({accountStatusInfo.daysRemaining} days remaining)
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 mt-6">
                {(accountStatusInfo.canAppeal || accountStatusInfo.canRequestUnlock || accountStatusInfo.canRequestReview) && (
                  <button
                    onClick={() => setShowAppealForm(true)}
                    className={`w-full py-3 bg-${color}-500 text-white rounded-xl font-bold hover:opacity-90`}
                  >
                    {accountStatusInfo.status === ACCOUNT_STATUS.BANNED ? 'Submit Appeal' : 'Request Review'}
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setAccountStatusInfo(null);
                  }}
                  className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
                >
                  Close
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Need help? Contact support@yrnalone.com
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧸💜</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            YRNAlone
          </h1>
          <p className="text-gray-500 mt-2">You Are Not Alone</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:border-purple-400 focus:outline-none transition"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:border-purple-400 focus:outline-none transition"
              placeholder="Your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Switch to Sign Up */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitch}
              className="text-purple-600 font-bold hover:text-purple-700"
            >
              Sign Up
            </button>
          </p>
        </div>

        {/* Cute footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          You're not alone. We're here for you. 💜
        </div>
      </div>

      {/* Account Status Modal */}
      <AccountStatusModal />
    </div>
  );
};

export default LoginWithStatus;
