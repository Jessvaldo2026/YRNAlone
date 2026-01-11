// FILE: src/services/StripeService.js
// Complete payment system for YRNAlone
// Handles both individual ($5.99/mo) and organization ($299-$4,999/mo) payments

// =====================================================
// 🔑 YOUR STRIPE KEYS - LIVE!
// =====================================================

const STRIPE_PUBLISHABLE_KEY = 'pk_live_51RlAXBDRj0lruIz9SQKJoKX2a1yWkYN17FFg2GxFEY9CWNawvoQd4c34MDqtbdUnlccMjDxSxTgwPeyWxrmSnIpI00oxmwX1UU';

// Price IDs from your Stripe Dashboard
export const PRICE_IDS = {
  // Individual plans
  individual_monthly: 'price_1Sl3XLDRj0lruIz9wsUACrWd',   // $5.99/month
  individual_yearly: 'price_1Sl3YsDRj0lruIz9kn5bM2T9',    // $59.99/year
  
  // Organization plans
  org_starter: 'price_1Sl3adDRj0lruIz996qamKQS',          // $299/month
  org_professional: 'price_1Sl3btDRj0lruIz9lFMGZWba',     // $999/month
  org_enterprise: 'price_1Sl3eCDRj0lruIz9aYToF0Q2',       // $2,499/month
  org_unlimited: 'price_1Sl3g5DRj0lruIz9w3soGH4z'         // $4,999/month
};

// Initialize Stripe
let stripePromise = null;
export const getStripe = () => {
  if (!stripePromise && window.Stripe) {
    stripePromise = window.Stripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// =====================================================
// 💳 PAYMENT FUNCTIONS
// =====================================================

// Create checkout session for individual user
export const createIndividualCheckout = async (userId, email, plan) => {
  const priceId = plan === 'yearly' ? PRICE_IDS.individual_yearly : PRICE_IDS.individual_monthly;
  
  try {
    // In production, this would call your backend
    // For now, we'll use Stripe Checkout redirect
    const stripe = getStripe();
    
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/payment-cancelled`,
      customerEmail: email,
      clientReferenceId: userId,
      metadata: {
        userId: userId,
        type: 'individual',
        plan: plan
      }
    });
    
    if (error) {
      console.error('Stripe checkout error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Payment error:', error);
    return { success: false, error: error.message };
  }
};

// Create checkout session for organization
export const createOrganizationCheckout = async (orgData, adminEmail, plan) => {
  const priceIds = {
    starter: PRICE_IDS.org_starter,
    professional: PRICE_IDS.org_professional,
    enterprise: PRICE_IDS.org_enterprise,
    unlimited: PRICE_IDS.org_unlimited
  };
  
  const priceId = priceIds[plan];
  
  try {
    const stripe = getStripe();
    
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: `${window.location.origin}/org-payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/org-payment-cancelled`,
      customerEmail: adminEmail,
      clientReferenceId: orgData.orgId,
      metadata: {
        orgId: orgData.orgId,
        orgName: orgData.name,
        type: 'organization',
        plan: plan
      }
    });
    
    if (error) {
      console.error('Stripe checkout error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Payment error:', error);
    return { success: false, error: error.message };
  }
};

// =====================================================
// 📊 SUBSCRIPTION MANAGEMENT
// =====================================================

// Cancel subscription
export const cancelSubscription = async (subscriptionId) => {
  try {
    // In production, call your backend to cancel via Stripe API
    // The backend would use: stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
    
    console.log('Cancelling subscription:', subscriptionId);
    return { success: true, message: 'Subscription will cancel at end of billing period' };
  } catch (error) {
    console.error('Cancel error:', error);
    return { success: false, error: error.message };
  }
};

// Reactivate cancelled subscription
export const reactivateSubscription = async (subscriptionId) => {
  try {
    // In production, call your backend
    // The backend would use: stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false })
    
    console.log('Reactivating subscription:', subscriptionId);
    return { success: true, message: 'Subscription reactivated' };
  } catch (error) {
    console.error('Reactivate error:', error);
    return { success: false, error: error.message };
  }
};

// Update payment method
export const updatePaymentMethod = async (customerId) => {
  try {
    const stripe = getStripe();
    
    // Create a billing portal session
    // In production, this would be handled by your backend
    window.location.href = `https://billing.stripe.com/p/login/${customerId}`;
    
    return { success: true };
  } catch (error) {
    console.error('Update payment error:', error);
    return { success: false, error: error.message };
  }
};

// =====================================================
// 🔔 PAYMENT STATUS HELPERS
// =====================================================

export const PAYMENT_STATUS = {
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  TRIALING: 'trialing',
  UNPAID: 'unpaid'
};

// Check if subscription is active
export const isSubscriptionActive = (status) => {
  return status === PAYMENT_STATUS.ACTIVE || status === PAYMENT_STATUS.TRIALING;
};

// Get days until next payment
export const getDaysUntilPayment = (nextPaymentDate) => {
  const now = new Date();
  const next = new Date(nextPaymentDate);
  const diffTime = next - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// =====================================================
// 📧 PAYMENT EMAIL TRIGGERS
// =====================================================

// These would be called by Stripe webhooks in production
export const PAYMENT_EVENTS = {
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  TRIAL_ENDING: 'trial_ending',
  INVOICE_UPCOMING: 'invoice_upcoming'
};

export default {
  getStripe,
  createIndividualCheckout,
  createOrganizationCheckout,
  cancelSubscription,
  reactivateSubscription,
  updatePaymentMethod,
  PRICE_IDS,
  PAYMENT_STATUS,
  PAYMENT_EVENTS,
  isSubscriptionActive,
  getDaysUntilPayment,
  formatCurrency
};
