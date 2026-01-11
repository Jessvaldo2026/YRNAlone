// FILE: src/payments/PaymentBanners.jsx
// Notification banners for payment status

import React from 'react';

// Past Due Banner - Shows when payment failed
export const PastDueBanner = ({ onUpdatePayment }) => (
  <div className="bg-red-500 text-white px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-xl">⚠️</span>
      <span className="font-medium">Payment failed! Update your payment method to keep premium access.</span>
    </div>
    <button
      onClick={onUpdatePayment}
      className="bg-white text-red-500 px-4 py-1.5 rounded-full font-bold text-sm hover:bg-red-50 transition"
    >
      Fix Now
    </button>
  </div>
);

// Payment Due Soon Banner - Shows 3 days before billing
export const PaymentDueSoonBanner = ({ amount, date, onDismiss }) => (
  <div className="bg-yellow-500 text-yellow-900 px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-xl">📅</span>
      <span className="font-medium">Heads up! Your {amount} payment is due on {date}</span>
    </div>
    <button
      onClick={onDismiss}
      className="text-yellow-900 hover:text-yellow-800 font-bold text-xl"
    >
      ×
    </button>
  </div>
);

// Trial Ending Banner - Shows 3 days before trial ends
export const TrialEndingBanner = ({ daysLeft, onAddPayment }) => (
  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-xl">⏰</span>
      <span className="font-medium">Your free trial ends in {daysLeft} days! Add payment to keep premium.</span>
    </div>
    <button
      onClick={onAddPayment}
      className="bg-white text-purple-600 px-4 py-1.5 rounded-full font-bold text-sm hover:bg-purple-50 transition"
    >
      Add Payment
    </button>
  </div>
);

// Subscription Cancelled Banner - Shows when cancelled but still active
export const CancelledBanner = ({ endDate, onReactivate }) => (
  <div className="bg-gray-600 text-white px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-xl">💔</span>
      <span className="font-medium">Your subscription ends on {endDate}. Change your mind?</span>
    </div>
    <button
      onClick={onReactivate}
      className="bg-white text-gray-700 px-4 py-1.5 rounded-full font-bold text-sm hover:bg-gray-100 transition"
    >
      Reactivate
    </button>
  </div>
);

// Organization Past Due Banner
export const OrgPastDueBanner = ({ orgName, onUpdatePayment }) => (
  <div className="bg-red-500 text-white px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-xl">🏥⚠️</span>
      <span className="font-medium">{orgName}'s payment failed! Update to keep your team's access.</span>
    </div>
    <button
      onClick={onUpdatePayment}
      className="bg-white text-red-500 px-4 py-1.5 rounded-full font-bold text-sm hover:bg-red-50 transition"
    >
      Fix Now
    </button>
  </div>
);

// Organization Trial Ending Banner
export const OrgTrialEndingBanner = ({ orgName, daysLeft, amount, onAddPayment }) => (
  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-xl">🏥⏰</span>
      <span className="font-medium">{orgName}'s trial ends in {daysLeft} days! Add payment ({amount}/mo) to continue.</span>
    </div>
    <button
      onClick={onAddPayment}
      className="bg-white text-purple-600 px-4 py-1.5 rounded-full font-bold text-sm hover:bg-purple-50 transition"
    >
      Add Payment
    </button>
  </div>
);

// Smart Banner Component - Shows the right banner based on status
export const SmartPaymentBanner = ({ 
  subscription, 
  organization,
  onUpdatePayment, 
  onReactivate,
  onDismiss 
}) => {
  if (!subscription && !organization) return null;

  // Check organization status first (for org admins)
  if (organization) {
    if (organization.paymentStatus === 'past_due') {
      return <OrgPastDueBanner orgName={organization.name} onUpdatePayment={onUpdatePayment} />;
    }
    
    if (organization.status === 'trialing') {
      const trialEnd = new Date(organization.trialEndsAt);
      const daysLeft = Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3 && daysLeft > 0) {
        return (
          <OrgTrialEndingBanner 
            orgName={organization.name}
            daysLeft={daysLeft}
            amount={`$${organization.pricePerMonth}`}
            onAddPayment={onUpdatePayment}
          />
        );
      }
    }
  }

  // Check individual subscription status
  if (subscription) {
    if (subscription.status === 'past_due') {
      return <PastDueBanner onUpdatePayment={onUpdatePayment} />;
    }

    if (subscription.cancelAtPeriodEnd) {
      const endDate = new Date(subscription.currentPeriodEnd).toLocaleDateString();
      return <CancelledBanner endDate={endDate} onReactivate={onReactivate} />;
    }

    if (subscription.status === 'trialing') {
      const trialEnd = new Date(subscription.trialEnd);
      const daysLeft = Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3 && daysLeft > 0) {
        return <TrialEndingBanner daysLeft={daysLeft} onAddPayment={onUpdatePayment} />;
      }
    }

    // Payment due soon (within 3 days)
    if (subscription.currentPeriodEnd) {
      const nextPayment = new Date(subscription.currentPeriodEnd);
      const daysUntil = Math.ceil((nextPayment - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= 3 && daysUntil > 0) {
        return (
          <PaymentDueSoonBanner 
            amount={subscription.amount || '$5.99'}
            date={nextPayment.toLocaleDateString()}
            onDismiss={onDismiss}
          />
        );
      }
    }
  }

  return null;
};

export default SmartPaymentBanner;
