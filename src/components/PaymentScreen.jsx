// FILE: src/payments/PaymentScreen.jsx
// Handles payment for both individuals and organizations

import React, { useState } from 'react';
import { PRICE_IDS } from '../services/StripeService';

// Stripe Publishable Key - LIVE
const STRIPE_KEY = 'pk_live_51RlAXBDRj0lruIz9SQKJoKX2a1yWkYN17FFg2GxFEY9CWNawvoQd4c34MDqtbdUnlccMjDxSxTgwPeyWxrmSnIpI00oxmwX1UU';

// Individual payment screen
export const IndividualPaymentScreen = ({ user, plan, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const prices = {
    monthly: { amount: '$5.99', period: '/month', trial: '7-day free trial' },
    yearly: { amount: '$59.99', period: '/year', trial: '7-day free trial', savings: 'Save 17%!' }
  };

  const selectedPrice = prices[plan] || prices.monthly;

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if Stripe is loaded
      if (!window.Stripe) {
        alert(`💜 Add this to your index.html:\n\n<script src="https://js.stripe.com/v3/"></script>\n\nThen refresh!`);
        if (onSuccess) onSuccess();
        return;
      }

      const stripe = window.Stripe(STRIPE_KEY);
      
      // Get the right price ID
      const priceId = plan === 'yearly' 
        ? PRICE_IDS.individual_yearly 
        : PRICE_IDS.individual_monthly;
      
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}?payment=success`,
        cancelUrl: `${window.location.origin}?payment=cancelled`,
        customerEmail: user?.email
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment error. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">💳</div>
          <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
          <p className="text-gray-500">YRNAlone Premium</p>
        </div>

        {/* Price Display */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white text-center mb-6">
          <div className="text-4xl font-bold">{selectedPrice.amount}</div>
          <div className="text-purple-100">{selectedPrice.period}</div>
          {selectedPrice.savings && (
            <div className="mt-2 bg-white bg-opacity-20 rounded-full px-3 py-1 inline-block text-sm">
              {selectedPrice.savings}
            </div>
          )}
        </div>

        {/* What's Included */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-700 mb-3">What you get:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Unlimited mood check-ins</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Unlimited journal entries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>AI Companion 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>All support groups</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Sound therapy & sleep tracker</span>
            </div>
          </div>
        </div>

        {/* Trial Notice */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 text-center">
          <span className="text-green-700 text-sm font-medium">
            🎉 {selectedPrice.trial} • Cancel anytime
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Buttons */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50 mb-3"
        >
          {loading ? '✨ Processing...' : '💳 Start Free Trial'}
        </button>

        <button
          onClick={onCancel}
          className="w-full text-gray-500 py-2 font-medium hover:text-gray-700"
        >
          Maybe later
        </button>

        {/* Security Note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 Secured by Stripe. Your payment info is never stored on our servers.
        </p>
      </div>
    </div>
  );
};

// Organization payment screen
export const OrganizationPaymentScreen = ({ orgData, plan, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = {
    starter: { name: 'Starter', price: '$299', users: '100 users', priceId: PRICE_IDS.org_starter },
    professional: { name: 'Professional', price: '$999', users: '500 users', priceId: PRICE_IDS.org_professional },
    enterprise: { name: 'Enterprise', price: '$2,499', users: '2,000 users', priceId: PRICE_IDS.org_enterprise },
    unlimited: { name: 'Unlimited', price: '$4,999', users: 'Unlimited users', priceId: PRICE_IDS.org_unlimited }
  };

  const selectedPlan = plans[plan] || plans.professional;

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      if (!window.Stripe) {
        alert(`💜 Add this to your index.html:\n\n<script src="https://js.stripe.com/v3/"></script>\n\nThen refresh!`);
        if (onSuccess) onSuccess();
        return;
      }

      const stripe = window.Stripe(STRIPE_KEY);
      
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: selectedPlan.priceId, quantity: 1 }],
        mode: 'subscription',
        successUrl: `${window.location.origin}?org_payment=success`,
        cancelUrl: `${window.location.origin}?org_payment=cancelled`,
        customerEmail: orgData?.contactEmail
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment error. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏥</div>
          <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
          <p className="text-gray-500">{orgData?.name || 'Your Organization'}</p>
        </div>

        {/* Plan Display */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white text-center mb-6">
          <div className="text-lg opacity-90">{selectedPlan.name} Plan</div>
          <div className="text-4xl font-bold my-2">{selectedPlan.price}</div>
          <div className="text-blue-100">/month • {selectedPlan.users}</div>
        </div>

        {/* What's Included */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-700 mb-3">Includes:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Up to {selectedPlan.users}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Admin dashboard with analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Custom access code</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Monthly usage reports</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Priority support</span>
            </div>
          </div>
        </div>

        {/* Trial Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-center">
          <span className="text-blue-700 text-sm font-medium">
            🎉 14-day free trial • Cancel anytime
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Buttons */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50 mb-3"
        >
          {loading ? '✨ Processing...' : '💳 Start Free Trial'}
        </button>

        <button
          onClick={onCancel}
          className="w-full text-gray-500 py-2 font-medium hover:text-gray-700"
        >
          Go back
        </button>

        {/* Security Note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 Secured by Stripe. Your payment info is never stored on our servers.
        </p>
      </div>
    </div>
  );
};

export default { IndividualPaymentScreen, OrganizationPaymentScreen };
