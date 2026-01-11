// FILE: src/payments/BillingManager.jsx
// Billing management for both individuals and organizations

import React, { useState } from 'react';
import { PRICE_IDS } from '../services/StripeService';

// Stripe Key - LIVE
const STRIPE_KEY = 'pk_live_51RlAXBDRj0lruIz9SQKJoKX2a1yWkYN17FFg2GxFEY9CWNawvoQd4c34MDqtbdUnlccMjDxSxTgwPeyWxrmSnIpI00oxmwX1UU';

// =====================================================
// 💳 INDIVIDUAL BILLING MANAGER
// =====================================================

export const IndividualBilling = ({ 
  subscription, 
  onAddPayment, 
  onUpdatePayment,
  onCancel,
  onReactivate 
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // No subscription yet
  if (!subscription || subscription.status === 'free') {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">💳 Billing</h3>
        
        <div className="bg-gray-50 rounded-xl p-4 text-center mb-4">
          <p className="text-gray-600">You're on the free plan</p>
        </div>
        
        <button
          onClick={onAddPayment}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold"
        >
          ⭐ Upgrade to Premium
        </button>
      </div>
    );
  }

  // Has subscription
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">💳 Billing</h3>
      
      {/* Current Plan */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-purple-100 text-sm">Current Plan</p>
            <p className="font-bold text-lg">{subscription.planName || 'Premium'}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{subscription.amount || '$5.99'}</p>
            <p className="text-purple-100 text-sm">/month</p>
          </div>
        </div>
      </div>

      {/* Billing Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">Status</span>
          <span className={`font-medium ${
            subscription.status === 'active' ? 'text-green-600' :
            subscription.status === 'past_due' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {subscription.status === 'active' ? '✓ Active' :
             subscription.status === 'trialing' ? '🎉 Trial' :
             subscription.status === 'past_due' ? '⚠️ Past Due' :
             subscription.status}
          </span>
        </div>
        
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">Next billing date</span>
          <span className="font-medium">{subscription.nextBillingDate || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">Payment method</span>
          <span className="font-medium">•••• {subscription.cardLast4 || '4242'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={onUpdatePayment}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition"
        >
          💳 Update Payment Method
        </button>
        
        {subscription.cancelAtPeriodEnd ? (
          <button
            onClick={onReactivate}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium transition"
          >
            ✓ Reactivate Subscription
          </button>
        ) : (
          !showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full text-red-500 py-2 font-medium"
            >
              Cancel Subscription
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-700 text-sm mb-2">Are you sure? You'll lose premium access.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { onCancel(); setShowCancelConfirm(false); }}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium text-sm"
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium text-sm"
                >
                  Keep It
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};


// =====================================================
// 🏥 ORGANIZATION BILLING MANAGER
// =====================================================

export const OrganizationBilling = ({ 
  organization, 
  onAddPayment, 
  onUpdatePayment,
  onUpgradePlan,
  onCancel 
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Calculate trial days remaining
  const getTrialDaysLeft = () => {
    if (!organization?.trialEndsAt) return null;
    const trialEnd = new Date(organization.trialEndsAt);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const trialDaysLeft = getTrialDaysLeft();
  const isTrialing = trialDaysLeft !== null && trialDaysLeft > 0;
  const hasPaymentMethod = organization?.paymentMethodAdded || organization?.cardLast4;

  const planDetails = {
    starter: { name: 'Starter', price: '$299', users: '100' },
    professional: { name: 'Professional', price: '$999', users: '500' },
    enterprise: { name: 'Enterprise', price: '$2,499', users: '2,000' },
    unlimited: { name: 'Unlimited', price: '$4,999', users: 'Unlimited' }
  };

  const currentPlan = planDetails[organization?.plan] || planDetails.professional;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">💳 Organization Billing</h3>
      
      {/* Trial Banner */}
      {isTrialing && !hasPaymentMethod && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-white mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">⏰ Trial: {trialDaysLeft} days left</p>
              <p className="text-sm opacity-90">Add payment to continue after trial</p>
            </div>
            <button
              onClick={onAddPayment}
              className="bg-white text-orange-500 px-4 py-2 rounded-lg font-bold text-sm"
            >
              Add Card
            </button>
          </div>
        </div>
      )}

      {/* Trial with payment added */}
      {isTrialing && hasPaymentMethod && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <p className="text-green-700 font-medium">
            ✓ Payment method added! You'll be charged after your trial ends.
          </p>
          <p className="text-green-600 text-sm">Trial ends in {trialDaysLeft} days</p>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-100 text-sm">Current Plan</p>
            <p className="font-bold text-lg">{currentPlan.name}</p>
            <p className="text-blue-100 text-sm">Up to {currentPlan.users} users</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{currentPlan.price}</p>
            <p className="text-blue-100 text-sm">/month</p>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Users</span>
          <span className="font-medium">
            {organization?.currentUsers || 0} / {organization?.maxUsers || currentPlan.users}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-500 rounded-full h-2 transition-all"
            style={{ 
              width: `${Math.min(((organization?.currentUsers || 0) / (organization?.maxUsers || 100)) * 100, 100)}%` 
            }}
          />
        </div>
      </div>

      {/* Billing Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">Status</span>
          <span className={`font-medium ${
            isTrialing ? 'text-blue-600' :
            organization?.paymentStatus === 'past_due' ? 'text-red-600' :
            'text-green-600'
          }`}>
            {isTrialing ? '🎉 Trial' :
             organization?.paymentStatus === 'past_due' ? '⚠️ Past Due' :
             '✓ Active'}
          </span>
        </div>
        
        {!isTrialing && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Next billing date</span>
            <span className="font-medium">{organization?.nextBillingDate || 'N/A'}</span>
          </div>
        )}
        
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">Payment method</span>
          <span className="font-medium">
            {hasPaymentMethod ? `•••• ${organization?.cardLast4 || '4242'}` : 'Not added'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {!hasPaymentMethod ? (
          <button
            onClick={onAddPayment}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold"
          >
            💳 Add Payment Method
          </button>
        ) : (
          <button
            onClick={onUpdatePayment}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition"
          >
            💳 Update Payment Method
          </button>
        )}
        
        <button
          onClick={onUpgradePlan}
          className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 py-3 rounded-xl font-medium transition"
        >
          ⬆️ Upgrade Plan
        </button>
        
        {!showCancelConfirm ? (
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="w-full text-red-500 py-2 font-medium"
          >
            Cancel Subscription
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-700 text-sm mb-2">
              Cancel subscription? Your team will lose access at end of billing period.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { onCancel(); setShowCancelConfirm(false); }}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium text-sm"
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium text-sm"
              >
                Keep It
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// =====================================================
// 💳 ADD PAYMENT METHOD MODAL
// =====================================================

export const AddPaymentModal = ({ 
  isOpen, 
  onClose, 
  type = 'individual', // 'individual' or 'organization'
  planDetails,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddPayment = async () => {
    setLoading(true);

    try {
      // Check if Stripe is loaded
      if (!window.Stripe) {
        alert(`💜 To enable payments:\n\n1. Add Stripe script to index.html\n2. Create products in Stripe Dashboard\n3. Update keys in StripeService.js\n\nFor now, payment method "added"!`);
        if (onSuccess) onSuccess({ cardLast4: '4242' });
        onClose();
        return;
      }

      const stripe = window.Stripe(STRIPE_KEY);
      
      // Get the correct price ID
      const priceId = type === 'organization' 
        ? PRICE_IDS[`org_${planDetails?.plan || 'professional'}`]
        : PRICE_IDS.individual_monthly;
      
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}?payment_added=success`,
        cancelUrl: `${window.location.origin}?payment_added=cancelled`,
      });

      if (error) {
        console.error('Stripe error:', error);
        alert('Payment setup failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Unable to connect to payment service. Please check your internet connection and try again.');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">💳 Add Payment Method</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          {type === 'organization' ? (
            <>
              <p className="font-medium text-gray-800">
                {planDetails?.name || 'Professional'} Plan
              </p>
              <p className="text-gray-600">
                {planDetails?.price || '$999'}/month after trial
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-gray-800">Premium Plan</p>
              <p className="text-gray-600">$5.99/month after 7-day trial</p>
            </>
          )}
        </div>

        {/* What they get */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">What's included:</p>
          <div className="space-y-1 text-sm">
            {type === 'organization' ? (
              <>
                <p className="text-gray-600">✓ Up to {planDetails?.users || '500'} users</p>
                <p className="text-gray-600">✓ Admin dashboard & reports</p>
                <p className="text-gray-600">✓ Priority support</p>
                <p className="text-gray-600">✓ Custom branding</p>
              </>
            ) : (
              <>
                <p className="text-gray-600">✓ Unlimited mood tracking</p>
                <p className="text-gray-600">✓ Unlimited journaling</p>
                <p className="text-gray-600">✓ AI Companion</p>
                <p className="text-gray-600">✓ All features unlocked</p>
              </>
            )}
          </div>
        </div>

        {/* Security Note */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6">
          <p className="text-green-700 text-sm">
            🔒 Secured by Stripe. We never store your card details.
          </p>
        </div>

        {/* Buttons */}
        <button
          onClick={handleAddPayment}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50 mb-3"
        >
          {loading ? '✨ Processing...' : '💳 Add Payment Method'}
        </button>

        <button
          onClick={onClose}
          className="w-full text-gray-500 py-2 font-medium hover:text-gray-700"
        >
          Maybe later
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          You won't be charged until your trial ends. Cancel anytime.
        </p>
      </div>
    </div>
  );
};


// =====================================================
// 📊 BILLING HISTORY
// =====================================================

export const BillingHistory = ({ invoices = [] }) => {
  // Show empty state if no invoices
  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📄 Billing History</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-600 font-medium">No invoices yet</p>
          <p className="text-gray-500 text-sm mt-1">Your billing history will appear here after your first payment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">📄 Billing History</h3>

      <div className="space-y-2">
        {invoices.map(invoice => (
          <div 
            key={invoice.id}
            className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
          >
            <div>
              <p className="font-medium text-gray-800">{invoice.date}</p>
              <p className="text-sm text-gray-500">{invoice.amount}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              invoice.status === 'paid' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {invoice.status === 'paid' ? '✓ Paid' : '⚠️ Failed'}
            </span>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-purple-600 font-medium text-sm">
        View all invoices →
      </button>
    </div>
  );
};

export default { 
  IndividualBilling, 
  OrganizationBilling, 
  AddPaymentModal,
  BillingHistory 
};
