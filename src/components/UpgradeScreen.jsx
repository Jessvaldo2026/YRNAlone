// FILE: src/premium/UpgradeScreen.jsx
import React, { useState } from 'react';
import { X, Check, Star, Sparkles, Crown, Shield, Zap } from 'lucide-react';
import { PRICING, FREE_LIMITS } from './PremiumContext';

const UpgradeScreen = ({ onClose, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);

  const features = [
    { icon: '🧘', title: 'Unlimited Mood Check-ins', free: `${FREE_LIMITS.moodChecksPerDay}/day`, premium: 'Unlimited' },
    { icon: '📖', title: 'Journal Entries', free: `${FREE_LIMITS.journalEntries} entries`, premium: 'Unlimited' },
    { icon: '👥', title: 'Support Groups', free: `${FREE_LIMITS.groupsAllowed} groups`, premium: 'Unlimited' },
    { icon: '🎵', title: 'Sound Therapy', free: '❌', premium: '✅ Full Library' },
    { icon: '😴', title: 'Sleep Tracker', free: '❌', premium: '✅ Full Access' },
    { icon: '📊', title: 'Advanced Insights', free: '❌', premium: '✅ Full Analytics' },
    { icon: '🌟', title: 'Priority Support', free: '❌', premium: '✅ 24/7 Support' },
    { icon: '🎨', title: 'All Themes', free: 'Limited', premium: '✅ All Themes' }
  ];

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      if (onUpgrade) {
        await onUpgrade(selectedPlan);
      }
    } catch (err) {
      console.error('Upgrade error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Upgrade to Premium</h2>
            <p className="text-white/90">Unlock your full wellness journey 💜</p>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`p-4 rounded-2xl border-2 transition text-left ${
                selectedPlan === 'monthly'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <p className="font-medium text-gray-600 mb-1">Monthly</p>
              <p className="text-2xl font-bold text-gray-800">{PRICING.monthly.label}</p>
              <p className="text-sm text-gray-500">Billed monthly</p>
            </button>

            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`p-4 rounded-2xl border-2 transition text-left relative ${
                selectedPlan === 'yearly'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="absolute -top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {PRICING.yearly.savings}
              </div>
              <p className="font-medium text-gray-600 mb-1">Yearly</p>
              <p className="text-2xl font-bold text-gray-800">{PRICING.yearly.label}</p>
              <p className="text-sm text-green-600">{PRICING.yearly.monthlyEquivalent}</p>
            </button>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              What's Included
            </h3>
            
            <div className="space-y-2">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{feature.icon}</span>
                    <span className="font-medium text-gray-700">{feature.title}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-gray-400 w-20 text-right">{feature.free}</span>
                    <span className="text-green-600 font-medium w-24 text-right">{feature.premium}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-2xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Start Premium - {selectedPlan === 'yearly' ? PRICING.yearly.label : PRICING.monthly.label}
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>7-day money-back guarantee • Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeScreen;
