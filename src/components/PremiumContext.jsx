// FILE: src/premium/PremiumContext.jsx
// ✅ COMPLETE FIXED VERSION - Exports what App.jsx expects

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const PremiumContext = createContext(null);

// Feature limits for free users
export const FREE_LIMITS = {
  moodChecksPerDay: 3,
  journalEntries: 10,
  groupsAllowed: 2,
  aiCompanion: false,
  breathingExercises: 1,
  soundTherapy: false,
  sleepTracker: false,
};

// Premium pricing - TASK 6: Fixed to $5.99/month
export const PRICING = {
  monthly: {
    price: 5.99,
    period: 'month',
    label: '$5.99/month'
  },
  yearly: {
    price: 59.99,
    period: 'year',
    label: '$59.99/year',
    savings: 'Save 17%',
    monthlyEquivalent: '$5.00/month'
  }
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  // Return safe defaults if no context
  if (!context) {
    return {
      isPremium: false,
      isOrganization: false,
      hasPremiumAccess: false,
      loading: true,
      checkFeatureAccess: () => false,
      showUpgrade: () => {},
      hideUpgrade: () => {},
      showUpgradeModal: false,
      usageStats: {},
      getRemainingUsage: () => 0,
      limits: FREE_LIMITS,
      pricing: PRICING
    };
  }
  return context;
};

export const PremiumProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isOrganization, setIsOrganization] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageStats, setUsageStats] = useState({
    moodChecksToday: 0,
    journalEntries: 0,
    groupsJoined: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsPremium(false);
        setIsOrganization(false);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        if (userData) {
          setIsPremium(userData.isPremium || false);
          setIsOrganization(!!userData.organizationId);
          setUsageStats({
            moodChecksToday: userData.moodChecksToday || 0,
            journalEntries: userData.journalEntries?.length || 0,
            groupsJoined: userData.groupsJoined?.length || 0
          });
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check if user has access to a feature
  const checkFeatureAccess = (feature) => {
    if (isPremium || isOrganization) return true;

    switch (feature) {
      case 'aiCompanion':
        return FREE_LIMITS.aiCompanion;
      case 'soundTherapy':
        return FREE_LIMITS.soundTherapy;
      case 'sleepTracker':
        return FREE_LIMITS.sleepTracker;
      case 'moodCheck':
        return usageStats.moodChecksToday < FREE_LIMITS.moodChecksPerDay;
      case 'journal':
        return usageStats.journalEntries < FREE_LIMITS.journalEntries;
      case 'groups':
        return usageStats.groupsJoined < FREE_LIMITS.groupsAllowed;
      default:
        return true;
    }
  };

  const showUpgrade = () => setShowUpgradeModal(true);
  const hideUpgrade = () => setShowUpgradeModal(false);

  const getRemainingUsage = (feature) => {
    if (isPremium || isOrganization) return 'Unlimited';
    
    switch (feature) {
      case 'moodCheck':
        return FREE_LIMITS.moodChecksPerDay - usageStats.moodChecksToday;
      case 'journal':
        return FREE_LIMITS.journalEntries - usageStats.journalEntries;
      case 'groups':
        return FREE_LIMITS.groupsAllowed - usageStats.groupsJoined;
      default:
        return 0;
    }
  };

  // ✅ Export what App.jsx expects!
  const value = {
    isPremium,
    isOrganization,
    hasPremiumAccess: isPremium || isOrganization,
    loading,
    checkFeatureAccess,
    showUpgrade,
    hideUpgrade,
    showUpgradeModal,
    usageStats,
    getRemainingUsage,
    limits: FREE_LIMITS,
    pricing: PRICING
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
};

export default PremiumContext;
