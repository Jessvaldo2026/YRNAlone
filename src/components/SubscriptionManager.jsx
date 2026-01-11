// FILE: src/payments/SubscriptionManager.jsx
// Manages user's subscription - view, cancel, update payment

import React, { useState } from 'react';

const SubscriptionManager = ({
  subscription,
  onCancel,
  onReactivate,
  onUpdatePayment,
  onClose
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // If no subscription data provided, show empty state
  if (!subscription) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">My Subscription</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>
          <div className="text-center py-8">
            <div className="text-4xl mb-3">💜</div>
            <p className="text-gray-600 font-medium">No active subscription</p>
            <p className="text-gray-500 text-sm mt-2">Upgrade to Premium to unlock all features</p>
            <button onClick={onClose} className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold">
              View Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sub = subscription;

  const handleCancel = async () => {
    setLoading(true);
    try {
      if (onCancel) await onCancel();
      alert('Your subscription will end at the end of your billing period. You can still use premium features until then. 💜');
      setShowCancelConfirm(false);
    } catch (error) {
      alert('Error cancelling subscription. Please try again.');
    }
    setLoading(false);
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      if (onReactivate) await onReactivate();
      alert('Your subscription has been reactivated! 🎉');
    } catch (error) {
      alert('Error reactivating. Please try again.');
    }
    setLoading(false);
  };

  const handleUpdatePayment = () => {
    if (onUpdatePayment) {
      onUpdatePayment();
    } else {
      alert('Payment update will redirect to Stripe billing portal.');
    }
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    trialing: 'bg-blue-100 text-blue-700',
    past_due: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700'
  };

  const statusLabels = {
    active: '✓ Active',
    trialing: '🎉 Trial',
    past_due: '⚠️ Past Due',
    cancelled: '✗ Cancelled'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">My Subscription</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Subscription Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-5 text-white mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-lg font-bold">{sub.plan}</div>
              <div className="text-purple-100 text-sm">Since {sub.startDate}</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[sub.status] || statusColors.active}`}>
              {statusLabels[sub.status] || statusLabels.active}
            </span>
          </div>
          <div className="text-3xl font-bold">{sub.price}<span className="text-lg font-normal">/mo</span></div>
        </div>

        {/* Details */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Next billing date</span>
            <span className="font-medium">{sub.nextBillingDate}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Payment method</span>
            <span className="font-medium">•••• 4242</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleUpdatePayment}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition"
          >
            💳 Update Payment Method
          </button>

          {sub.status === 'cancelled' ? (
            <button
              onClick={handleReactivate}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : '✓ Reactivate Subscription'}
            </button>
          ) : (
            <>
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full text-red-500 hover:text-red-600 py-3 font-medium"
                >
                  Cancel Subscription
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm mb-3">
                    Are you sure? You'll lose access to premium features at the end of your billing period.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                    >
                      {loading ? '...' : 'Yes, Cancel'}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium"
                    >
                      Keep It
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Past Due Warning */}
        {sub.status === 'past_due' && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
              ⚠️ Payment Failed
            </div>
            <p className="text-red-600 text-sm mb-3">
              We couldn't process your payment. Please update your payment method to continue using premium features.
            </p>
            <button
              onClick={handleUpdatePayment}
              className="w-full bg-red-500 text-white py-2 rounded-lg font-medium"
            >
              Update Payment Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
