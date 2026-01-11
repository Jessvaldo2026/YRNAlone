// FILE: src/enterprise/BillingManagement.jsx
// Billing page for organizations - view plan, cancel subscription, update payment

import React, { useState } from 'react';

const BillingManagement = ({ organization, onClose }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const plans = {
    starter: { name: 'Starter', price: '$299', users: '100' },
    professional: { name: 'Professional', price: '$999', users: '500' },
    enterprise: { name: 'Enterprise', price: '$2,499', users: '2,000' },
    unlimited: { name: 'Unlimited', price: '$4,999', users: 'Unlimited' }
  };

  const currentPlan = plans[organization?.plan] || plans.professional;

  const cancelReasons = [
    "Too expensive",
    "Not using it enough",
    "Switching to another service",
    "Missing features we need",
    "Budget cuts",
    "Just testing / trial",
    "Other"
  ];

  const handleCancelSubscription = async () => {
    setCancelling(true);
    
    // In production, this would call your backend to cancel in Stripe
    // await cancelStripeSubscription(organization.stripeSubscriptionId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setCancelling(false);
    setCancelled(true);
  };

  const handleUpdatePayment = () => {
    // Redirect to Stripe billing portal
    // In production: redirect to Stripe Customer Portal
    window.open('https://billing.stripe.com/p/login/test', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">💳 Billing & Subscription</h1>
            <p className="text-gray-500">Manage your organization's subscription</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ← Back to Dashboard
            </button>
          )}
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Plan</p>
              <h2 className="text-2xl font-bold text-gray-800">{currentPlan.name}</h2>
              <p className="text-gray-500">Up to {currentPlan.users} users</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-600">{currentPlan.price}</p>
              <p className="text-gray-500">/month</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition">
              ⬆️ Upgrade Plan
            </button>
            <button 
              onClick={handleUpdatePayment}
              className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              💳 Update Payment
            </button>
          </div>
        </div>

        {/* Billing Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Billing Information</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Billing Email</span>
              <span className="text-gray-800 font-medium">{organization?.contactEmail || 'admin@hospital.com'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Payment Method</span>
              <span className="text-gray-800 font-medium">•••• •••• •••• 4242</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Next Billing Date</span>
              <span className="text-gray-800 font-medium">February 2, 2026</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-500">Status</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Active ✓</span>
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🧾 Invoice History</h3>
          
          <div className="space-y-3">
            {[
              { date: 'Jan 2, 2026', amount: '$999.00', status: 'Paid' },
              { date: 'Dec 2, 2025', amount: '$999.00', status: 'Paid' },
              { date: 'Nov 2, 2025', amount: '$999.00', status: 'Paid' },
            ].map((invoice, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-gray-800 font-medium">{invoice.date}</p>
                  <p className="text-gray-500 text-sm">{currentPlan.name} Plan</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-800 font-medium">{invoice.amount}</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">{invoice.status}</span>
                  <button className="text-purple-600 text-sm font-medium">Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancel Subscription */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Cancel Subscription</h3>
          <p className="text-gray-500 mb-4">
            We're sad to see you go. Your subscription will remain active until the end of your billing period.
          </p>
          
          <button 
            onClick={() => setShowCancelModal(true)}
            className="text-red-600 font-medium hover:text-red-700 transition"
          >
            Cancel my subscription →
          </button>
        </div>

        {/* Need Help */}
        <div className="mt-6 bg-purple-50 rounded-xl p-4 text-center">
          <p className="text-purple-700">
            💜 Need help? Contact us at <strong>support@yrnalone.com</strong>
          </p>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            
            {!cancelled ? (
              <>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">😢</div>
                  <h3 className="text-xl font-bold text-gray-800">We're sorry to see you go</h3>
                  <p className="text-gray-500 mt-2">Before you cancel, please tell us why:</p>
                </div>

                <div className="space-y-2 mb-6">
                  {cancelReasons.map((reason, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason}
                        checked={cancelReason === reason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-gray-700">{reason}</span>
                    </label>
                  ))}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ <strong>Warning:</strong> Your users will lose access to premium features when your subscription ends.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={!cancelReason || cancelling}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">💜</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Subscription Cancelled</h3>
                <p className="text-gray-500 mb-6">
                  Your subscription will remain active until <strong>February 2, 2026</strong>. 
                  You can reactivate anytime before then.
                </p>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelled(false);
                  }}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium"
                >
                  Got it
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;
