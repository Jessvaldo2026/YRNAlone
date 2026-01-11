// FILE: src/enterprise/OrganizationSignup.jsx
// 🏢 Organization signup WITH payment integration

import React, { useState } from 'react';
import { Building2, ArrowLeft, CheckCircle, CreditCard, Check, Crown } from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { createOrganizationCheckout, PRICE_IDS } from '../services/StripeService';
import { sendOrgWelcomeEmail } from '../services/PaymentEmails';

// 💰 ORGANIZATION PRICING PLANS
const ORG_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 299,
    priceId: PRICE_IDS.org_starter,
    members: '1-50',
    features: [
      'Up to 50 members',
      'Admin dashboard',
      'Basic analytics',
      'Email support',
      'Access code system'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 999,
    priceId: PRICE_IDS.org_professional,
    members: '51-200',
    popular: true,
    features: [
      'Up to 200 members',
      'Advanced analytics',
      'Therapist directory',
      'Custom branding',
      'Priority support',
      'Weekly reports'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2499,
    priceId: PRICE_IDS.org_enterprise,
    members: '201-500',
    features: [
      'Up to 500 members',
      'Full analytics suite',
      'API access',
      'HIPAA compliance',
      'Dedicated support',
      'Custom integrations'
    ]
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 4999,
    priceId: PRICE_IDS.org_unlimited,
    members: 'Unlimited',
    features: [
      'Unlimited members',
      'Everything in Enterprise',
      'White-label option',
      'On-site training',
      'SLA guarantee',
      'Custom development'
    ]
  }
];

const OrganizationSignup = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('professional');
  
  const [orgData, setOrgData] = useState({
    name: '',
    type: 'clinic',
    size: '51-200',
    website: '',
    contactEmail: '',
    contactName: '',
    contactPhone: '',
    primaryColor: '#7C3AED',
    logo: '',
    welcomeMessage: ''
  });

  const generateAccessCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Step 4: Process payment
  const handlePayment = async () => {
    if (!orgData.name || !orgData.contactEmail) {
      setError('Please complete all required fields');
      setStep(1);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const accessCode = generateAccessCode();
      const orgId = `org_${Date.now()}`;
      const currentUser = auth.currentUser;
      const plan = ORG_PLANS.find(p => p.id === selectedPlan);

      // 1. Create organization in Firebase (pending payment)
      await setDoc(doc(db, 'organizations', orgId), {
        ...orgData,
        id: orgId,
        accessCode,
        adminId: currentUser?.uid,
        adminIds: currentUser ? [currentUser.uid] : [],
        createdAt: new Date().toISOString(),
        memberCount: 0,
        isActive: false, // Activated after payment
        paymentStatus: 'pending',
        subscription: {
          plan: selectedPlan,
          planName: plan.name,
          price: plan.price,
          maxMembers: plan.members,
          startDate: null, // Set after payment
          status: 'pending'
        }
      });

      // 2. Update current user as org admin
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          organizationId: orgId,
          isOrgAdmin: true,
          pendingOrgPayment: true
        });
      }

      // 3. Send welcome email with access code
      await sendOrgWelcomeEmail({
        email: orgData.contactEmail,
        contactName: orgData.contactName || orgData.name,
        organizationName: orgData.name,
        accessCode: accessCode,
        planName: plan.name
      });

      // 4. Redirect to Stripe Checkout
      const result = await createOrganizationCheckout(
        { orgId, name: orgData.name },
        orgData.contactEmail,
        selectedPlan
      );

      if (!result.success) {
        throw new Error(result.error || 'Payment failed');
      }

      // Stripe will redirect to success/cancel URL
      // On success, webhook will activate the organization

    } catch (err) {
      console.error('Error creating organization:', err);
      setError(err.message || 'Failed to process. Please try again.');
      setLoading(false);
    }
  };

  // Start free trial instead
  const handleFreeTrial = async () => {
    if (!orgData.name || !orgData.contactEmail) {
      setError('Please complete all required fields');
      setStep(1);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const accessCode = generateAccessCode();
      const orgId = `org_${Date.now()}`;
      const currentUser = auth.currentUser;
      const plan = ORG_PLANS.find(p => p.id === selectedPlan);

      // Create organization with 14-day trial
      await setDoc(doc(db, 'organizations', orgId), {
        ...orgData,
        id: orgId,
        accessCode,
        adminId: currentUser?.uid,
        adminIds: currentUser ? [currentUser.uid] : [],
        createdAt: new Date().toISOString(),
        memberCount: 0,
        isActive: true,
        paymentStatus: 'trial',
        subscription: {
          plan: selectedPlan,
          planName: plan.name,
          price: plan.price,
          maxMembers: plan.members === 'Unlimited' ? 999999 : parseInt(plan.members.split('-')[1]) || 50,
          startDate: new Date().toISOString(),
          trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'trialing'
        }
      });

      // Update user
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          organizationId: orgId,
          isOrgAdmin: true
        });
      }

      // Send welcome email
      await sendOrgWelcomeEmail({
        email: orgData.contactEmail,
        contactName: orgData.contactName || orgData.name,
        organizationName: orgData.name,
        accessCode: accessCode,
        planName: `${plan.name} (14-day Trial)`
      });

      onSuccess(accessCode);
    } catch (err) {
      console.error('Error creating organization:', err);
      setError('Failed to create organization. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onCancel}
            className="p-2 rounded-full bg-white shadow hover:bg-gray-50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Register Organization</h1>
            <p className="text-gray-600">Set up YRNAlone for your team</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div 
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${s <= step ? 'bg-purple-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-8 h-8 text-purple-500" />
              </div>
              <h2 className="text-xl font-bold">Organization Details</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name *
              </label>
              <input
                type="text"
                value={orgData.name}
                onChange={e => setOrgData({...orgData, name: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                placeholder="e.g., Sunny Valley Clinic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Type
              </label>
              <select
                value={orgData.type}
                onChange={e => setOrgData({...orgData, type: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
              >
                <option value="clinic">Mental Health Clinic</option>
                <option value="hospital">Hospital / Healthcare System</option>
                <option value="school">School / University</option>
                <option value="company">Company / Workplace</option>
                <option value="nonprofit">Non-Profit Organization</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                value={orgData.contactName}
                onChange={e => setOrgData({...orgData, contactName: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                placeholder="Your name"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!orgData.name || !orgData.contactName}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">Contact Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                value={orgData.contactEmail}
                onChange={e => setOrgData({...orgData, contactEmail: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                placeholder="admin@organization.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={orgData.contactPhone}
                onChange={e => setOrgData({...orgData, contactPhone: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                value={orgData.website}
                onChange={e => setOrgData({...orgData, website: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                placeholder="https://www.yourorg.com"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!orgData.contactEmail}
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Choose Plan */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-center mb-2">Choose Your Plan</h2>
            <p className="text-center text-gray-600 mb-6">Select the plan that fits your organization</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {ORG_PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    setOrgData({...orgData, size: plan.members});
                  }}
                  className={`relative p-4 rounded-2xl border-2 text-left transition ${
                    selectedPlan === plan.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <h3 className="font-bold text-lg text-gray-800">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-purple-600">${plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{plan.members} members</p>
                  
                  <ul className="mt-4 space-y-2">
                    {plan.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {selectedPlan === plan.id && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-6 h-6 text-purple-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90"
              >
                Continue to Branding
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Branding & Payment */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">Customize & Pay</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL (optional)
              </label>
              <input
                type="url"
                value={orgData.logo}
                onChange={e => setOrgData({...orgData, logo: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                placeholder="https://your-logo-url.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Color
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={orgData.primaryColor}
                  onChange={e => setOrgData({...orgData, primaryColor: e.target.value})}
                  className="w-16 h-12 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={orgData.primaryColor}
                  onChange={e => setOrgData({...orgData, primaryColor: e.target.value})}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Welcome Message
              </label>
              <textarea
                value={orgData.welcomeMessage}
                onChange={e => setOrgData({...orgData, welcomeMessage: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none"
                rows={2}
                placeholder={`Welcome to ${orgData.name || 'our'} wellness program!`}
              />
            </div>

            {/* Order Summary */}
            <div className="bg-purple-50 rounded-2xl p-4 mt-4">
              <h3 className="font-bold text-gray-800 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Organization:</span>
                  <span className="font-medium">{orgData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">{ORG_PLANS.find(p => p.id === selectedPlan)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Members:</span>
                  <span className="font-medium">{ORG_PLANS.find(p => p.id === selectedPlan)?.members}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-purple-600">
                    ${ORG_PLANS.find(p => p.id === selectedPlan)?.price}/month
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300"
              >
                Back
              </button>
            </div>

            {/* Payment Buttons */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay ${ORG_PLANS.find(p => p.id === selectedPlan)?.price}/month
                </>
              )}
            </button>

            <div className="text-center text-gray-500 text-sm">or</div>

            <button
              onClick={handleFreeTrial}
              disabled={loading}
              className="w-full py-4 border-2 border-purple-300 text-purple-600 font-bold rounded-xl hover:bg-purple-50 disabled:opacity-50"
            >
              Start 14-Day Free Trial
            </button>

            <p className="text-center text-xs text-gray-500">
              💳 Secure payment powered by Stripe • Cancel anytime
            </p>
          </div>
        )}

        {/* Features Preview */}
        <div className="mt-8 bg-white/50 rounded-2xl p-4">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-500" />
            All Enterprise Plans Include:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {[
              '✅ Admin Dashboard',
              '✅ Member Analytics',
              '✅ Access Code System',
              '✅ Therapist Directory',
              '✅ Downloadable Reports',
              '✅ Email Notifications',
              '✅ Custom Branding',
              '✅ Priority Support',
              '✅ HIPAA Compliance'
            ].map(feature => (
              <div key={feature} className="text-gray-600">{feature}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSignup;