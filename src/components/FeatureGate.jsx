// FILE: src/premium/FeatureGate.jsx
import React from 'react';
import { Lock, Crown, Star, Sparkles } from 'lucide-react';
import { usePremium, FREE_LIMITS } from './PremiumContext';

const FeatureGate = ({ feature, children, showLock = true }) => {
  const { checkFeatureAccess, showUpgrade, hasPremiumAccess } = usePremium();
  
  const hasAccess = checkFeatureAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showLock) {
    return null;
  }

  return (
    <div className="relative">
      <div className="filter blur-sm pointer-events-none opacity-50">
        {children}
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Premium Feature</h3>
          <p className="text-gray-600 mb-4">Upgrade to unlock this feature</p>
          <button
            onClick={showUpgrade}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export const PremiumBadge = ({ size = 'sm', showText = false }) => {
  const sizeClasses = {
    xs: 'w-4 h-4 text-xs',
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base'
  };

  return (
    <div className={`inline-flex items-center gap-1 ${showText ? 'bg-purple-100 px-2 py-1 rounded-full' : ''}`}>
      <div className={`bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center ${sizeClasses[size]}`}>
        <Crown className="w-3/4 h-3/4 text-white" />
      </div>
      {showText && <span className="text-purple-600 font-medium">Premium</span>}
    </div>
  );
};

export const LockOverlay = ({ onUpgrade, message = "This is a premium feature" }) => {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
      <div className="text-center text-white p-6">
        <Lock className="w-12 h-12 mx-auto mb-3 opacity-80" />
        <p className="font-medium mb-4">{message}</p>
        <button
          onClick={onUpgrade}
          className="px-6 py-2 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition"
        >
          Unlock with Premium
        </button>
      </div>
    </div>
  );
};

export const UsageCounter = ({ feature, className = '' }) => {
  const { getRemainingUsage, hasPremiumAccess } = usePremium();
  
  if (hasPremiumAccess) {
    return (
      <span className={`text-green-600 flex items-center gap-1 ${className}`}>
        <Sparkles className="w-4 h-4" />
        Unlimited
      </span>
    );
  }

  const remaining = getRemainingUsage(feature);
  const isLow = typeof remaining === 'number' && remaining <= 1;

  return (
    <span className={`flex items-center gap-1 ${isLow ? 'text-orange-500' : 'text-gray-500'} ${className}`}>
      {remaining} remaining
    </span>
  );
};

export default FeatureGate;
