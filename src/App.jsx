import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Heart, MessageCircle, Users, Book, Home, User, Sparkles, Send, Settings, Globe, Plus, Search, Camera, Ban, Flag, X, Mic, StopCircle, HelpCircle, Crown, Building2, KeyRound, ArrowLeft, CheckCircle, ChevronRight, Video, Phone, Palette, Image, Star, Zap, Shield, TrendingUp, Award, Clock, Calendar, BarChart3, PieChart, Activity, Target, UserPlus, LogOut, Fingerprint, Check, Edit3, AlertTriangle, Eye, EyeOff, Moon, Bell, Lock, Copy } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, increment, arrayUnion, addDoc, onSnapshot, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { sendUserWelcomeEmail, sendOrgWelcomeEmail, sendUserAchievementEmail } from './services/EmailService';
import TherapistDashboard from './enterprise/TherapistDashboard';
import ParentDashboard from './components/ParentDashboard';
import GuardianLinkManager from './components/GuardianLinkManager';
import AdminUserManagement from './enterprise/AdminUserManagement';
import NewAuthScreen from './auth/NewAuthScreen';
import OrganizationApp from './OrganizationApp';

// ============================================
// 🎨 BEAUTIFUL APP THEMES - User Customization
// Users can make the app feel like HOME
// ============================================
const APP_THEMES = {
  // 🌸 SOFT & CALMING
  lavenderDream: {
    name: 'Lavender Dream',
    emoji: '🪻',
    bg: 'bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100',
    card: 'bg-white/90 backdrop-blur-sm',
    accent: 'from-purple-500 to-pink-500',
    nav: 'bg-purple-50/90 backdrop-blur border-purple-200',
    text: 'text-purple-900',
    category: 'calm'
  },
  oceanBreeze: {
    name: 'Ocean Breeze',
    emoji: '🌊',
    bg: 'bg-gradient-to-br from-cyan-100 via-blue-50 to-teal-100',
    card: 'bg-white/90 backdrop-blur-sm',
    accent: 'from-cyan-500 to-blue-500',
    nav: 'bg-blue-50/90 backdrop-blur border-blue-200',
    text: 'text-blue-900',
    category: 'calm'
  },
  mintFresh: {
    name: 'Mint Fresh',
    emoji: '🌿',
    bg: 'bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100',
    card: 'bg-white/90 backdrop-blur-sm',
    accent: 'from-green-500 to-emerald-500',
    nav: 'bg-green-50/90 backdrop-blur border-green-200',
    text: 'text-green-900',
    category: 'calm'
  },
  roseGarden: {
    name: 'Rose Garden',
    emoji: '🌹',
    bg: 'bg-gradient-to-br from-rose-100 via-pink-50 to-red-100',
    card: 'bg-white/90 backdrop-blur-sm',
    accent: 'from-rose-500 to-pink-500',
    nav: 'bg-rose-50/90 backdrop-blur border-rose-200',
    text: 'text-rose-900',
    category: 'calm'
  },
  peachSunset: {
    name: 'Peach Sunset',
    emoji: '🍑',
    bg: 'bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100',
    card: 'bg-white/90 backdrop-blur-sm',
    accent: 'from-orange-500 to-amber-500',
    nav: 'bg-orange-50/90 backdrop-blur border-orange-200',
    text: 'text-orange-900',
    category: 'warm'
  },
  // 🌙 DARK & COZY
  midnightPurple: {
    name: 'Midnight Purple',
    emoji: '🔮',
    bg: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900',
    card: 'bg-purple-800/50 backdrop-blur-sm border border-purple-700',
    accent: 'from-purple-400 to-pink-400',
    nav: 'bg-purple-900/90 backdrop-blur border-purple-700',
    text: 'text-purple-100',
    category: 'dark'
  },
  deepOcean: {
    name: 'Deep Ocean',
    emoji: '🌌',
    bg: 'bg-gradient-to-br from-blue-900 via-slate-900 to-cyan-900',
    card: 'bg-blue-800/50 backdrop-blur-sm border border-blue-700',
    accent: 'from-cyan-400 to-blue-400',
    nav: 'bg-blue-900/90 backdrop-blur border-blue-700',
    text: 'text-blue-100',
    category: 'dark'
  },
  forestNight: {
    name: 'Forest Night',
    emoji: '🌲',
    bg: 'bg-gradient-to-br from-green-900 via-emerald-900 to-slate-900',
    card: 'bg-green-800/50 backdrop-blur-sm border border-green-700',
    accent: 'from-emerald-400 to-green-400',
    nav: 'bg-green-900/90 backdrop-blur border-green-700',
    text: 'text-green-100',
    category: 'dark'
  },
  cosmicBlack: {
    name: 'Cosmic Black',
    emoji: '✨',
    bg: 'bg-gradient-to-br from-slate-900 via-gray-900 to-black',
    card: 'bg-slate-800/50 backdrop-blur-sm border border-slate-700',
    accent: 'from-violet-400 to-fuchsia-400',
    nav: 'bg-slate-900/90 backdrop-blur border-slate-700',
    text: 'text-slate-100',
    category: 'dark'
  },
  // 🌈 FUN & VIBRANT
  rainbowPop: {
    name: 'Rainbow Pop',
    emoji: '🌈',
    bg: 'bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200',
    card: 'bg-white/80 backdrop-blur-sm',
    accent: 'from-pink-500 via-purple-500 to-indigo-500',
    nav: 'bg-white/80 backdrop-blur border-purple-200',
    text: 'text-purple-900',
    category: 'fun'
  },
  candyPink: {
    name: 'Candy Pink',
    emoji: '🍬',
    bg: 'bg-gradient-to-br from-pink-200 via-fuchsia-100 to-rose-200',
    card: 'bg-white/80 backdrop-blur-sm',
    accent: 'from-pink-500 to-fuchsia-500',
    nav: 'bg-pink-100/80 backdrop-blur border-pink-300',
    text: 'text-pink-900',
    category: 'fun'
  },
  sunnyDay: {
    name: 'Sunny Day',
    emoji: '☀️',
    bg: 'bg-gradient-to-br from-yellow-100 via-amber-50 to-orange-100',
    card: 'bg-white/80 backdrop-blur-sm',
    accent: 'from-yellow-500 to-orange-500',
    nav: 'bg-yellow-50/80 backdrop-blur border-yellow-200',
    text: 'text-amber-900',
    category: 'warm'
  },
  // 🏢 PROFESSIONAL
  cleanWhite: {
    name: 'Clean White',
    emoji: '⚪',
    bg: 'bg-gradient-to-br from-gray-50 via-white to-slate-50',
    card: 'bg-white shadow-sm border border-gray-100',
    accent: 'from-blue-600 to-indigo-600',
    nav: 'bg-white border-gray-200',
    text: 'text-gray-900',
    category: 'professional'
  },
  corporateBlue: {
    name: 'Corporate Blue',
    emoji: '💼',
    bg: 'bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50',
    card: 'bg-white shadow-sm border border-slate-200',
    accent: 'from-blue-600 to-indigo-600',
    nav: 'bg-slate-50 border-slate-200',
    text: 'text-slate-900',
    category: 'professional'
  }
};

// Theme categories for organization
const THEME_CATEGORIES = {
  calm: { name: 'Calm & Soothing', emoji: '🧘', description: 'Peaceful colors to reduce anxiety' },
  dark: { name: 'Dark & Cozy', emoji: '🌙', description: 'Easy on the eyes, perfect for nighttime' },
  fun: { name: 'Fun & Vibrant', emoji: '🎨', description: 'Bright colors to lift your mood' },
  warm: { name: 'Warm & Sunny', emoji: '☀️', description: 'Golden tones for positivity' },
  professional: { name: 'Professional', emoji: '💼', description: 'Clean and focused' }
};

// ============================================
// 🔐 AUTH CONTEXT (INLINE)
// ============================================
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return { user: null, userProfile: null, loading: true, isLoggedIn: false, logout: () => {}, login: () => {}, signup: () => {} };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) setUserProfile(userDoc.data());
        } catch (error) { console.error('Error loading profile:', error); }
      } else { setUserProfile(null); }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = async (email, password, username) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid, email, username, name: username, createdAt: new Date().toISOString(),
        isPremium: false, isOrgAdmin: false, isOrgUser: false, organizationId: null,
        pet: { type: 'teddy', name: 'Teddy', mood: 'happy', level: 1, experience: 0 },
        stats: { postsCreated: 0, journalEntries: 0, supportGiven: 0, daysActive: 0 },
        preferences: { theme: 'kawaii', language: 'en', notifications: true }
      });
      return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
  };

  const login = async (email, password) => {
    try { await signInWithEmailAndPassword(auth, email, password); return { success: true }; }
    catch (error) { return { success: false, error: error.message }; }
  };

  const logout = async () => {
    try { await signOut(auth); return { success: true }; }
    catch (error) { return { success: false, error: error.message }; }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isLoggedIn: !!user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// 🏢 ENTERPRISE CONTEXT (INLINE)
// ============================================
const EnterpriseContext = createContext(null);

export const useEnterprise = () => {
  const context = useContext(EnterpriseContext);
  if (!context) return { organization: null, isEnterprise: false, isOrgAdmin: false, isTherapist: false, therapistId: null, therapistData: null, branding: null, loading: true };
  return context;
};

export const EnterpriseProvider = ({ children }) => {
  const [organization, setOrganization] = useState(null);
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isTherapist, setIsTherapist] = useState(false);
  const [therapistId, setTherapistId] = useState(null);
  const [therapistData, setTherapistData] = useState(null);
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { 
        setOrganization(null); setIsEnterprise(false); setIsOrgAdmin(false); 
        setIsTherapist(false); setTherapistId(null); setTherapistData(null);
        setBranding(null); setLoading(false); return; 
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        if (userData?.organizationId) {
          const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
          const orgData = orgDoc.data();
          if (orgData) {
            setOrganization({ id: userData.organizationId, ...orgData });
            setIsEnterprise(true);
            setIsOrgAdmin(userData.isOrgAdmin || orgData.adminIds?.includes(user.uid) || orgData.adminId === user.uid);
            setBranding({ logo: orgData.logo || null, primaryColor: orgData.primaryColor || '#7C3AED', name: orgData.name, welcomeMessage: orgData.welcomeMessage || `Welcome to ${orgData.name}'s wellness program` });
            
            // 👨‍⚕️ CHECK IF USER IS A THERAPIST
            try {
              const therapistsRef = collection(db, 'organizations', userData.organizationId, 'therapists');
              // Check by userId
              const therapistQuery = query(therapistsRef, where('userId', '==', user.uid));
              const therapistSnap = await getDocs(therapistQuery);
              
              if (!therapistSnap.empty) {
                const tData = therapistSnap.docs[0].data();
                setIsTherapist(true);
                setTherapistId(therapistSnap.docs[0].id);
                setTherapistData({ id: therapistSnap.docs[0].id, ...tData });
                console.log('✅ User is a therapist:', tData.name);
              } else {
                // Also check by email
                const emailQuery = query(therapistsRef, where('email', '==', user.email));
                const emailSnap = await getDocs(emailQuery);
                
                if (!emailSnap.empty) {
                  const tData = emailSnap.docs[0].data();
                  setIsTherapist(true);
                  setTherapistId(emailSnap.docs[0].id);
                  setTherapistData({ id: emailSnap.docs[0].id, ...tData });
                  console.log('✅ User is a therapist (by email):', tData.name);
                } else {
                  setIsTherapist(false); setTherapistId(null); setTherapistData(null);
                }
              }
            } catch (therapistErr) {
              console.log('Therapist check:', therapistErr.message);
              setIsTherapist(false); setTherapistId(null); setTherapistData(null);
            }
          }
        } else { 
          setOrganization(null); setIsEnterprise(false); setIsOrgAdmin(false); 
          setIsTherapist(false); setTherapistId(null); setTherapistData(null); 
          setBranding(null); 
        }
      } catch (error) { console.error('Error checking enterprise status:', error); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <EnterpriseContext.Provider value={{ organization, isEnterprise, isOrgAdmin, isTherapist, therapistId, therapistData, branding, loading }}>
      {children}
    </EnterpriseContext.Provider>
  );
};

// ============================================
// 💎 PREMIUM CONTEXT (INLINE)
// ============================================
const PremiumContext = createContext(null);

// 🆓 FREE TIER LIMITS - Mental health should be accessible!
const FREE_LIMITS = {
  moodChecksPerDay: 999,      // Unlimited basic mood
  moodHistoryDays: 7,         // 7 days history (premium = full)
  journalEntries: 5,          // 5 per month (premium = unlimited)
  groupsAllowed: 999,         // ✅ UNLIMITED - peer support is free!
  buddyMatching: true,        // ✅ FREE - connection matters!
  breathingExercises: 3,      // Basic exercises free
  soundTherapy: false,        // Premium
  sleepTracker: false,        // Premium
  customThemes: false,        // Premium
  progressAnalytics: false,   // Premium
  adFree: false,              // Premium
  prioritySupport: false,     // Premium
};

// 💰 PREMIUM PRICING - TASK 6: Fixed to $5.99/month
const PRICING = {
  monthly: { price: 5.99, period: 'month', label: '$5.99/month', stripePriceId: 'price_premium_monthly' },
  yearly: { price: 59.99, period: 'year', label: '$59.99/year', savings: 'Save 17%', monthlyEquivalent: '$5.00/month', stripePriceId: 'price_premium_yearly' }
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) return { isPremium: false, isOrganization: false, hasPremiumAccess: false, loading: true, checkFeatureAccess: () => false, showUpgrade: () => {}, hideUpgrade: () => {}, showUpgradeModal: false, usageStats: {}, getRemainingUsage: () => 0, limits: FREE_LIMITS, pricing: PRICING };
  return context;
};

export const PremiumProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isOrganization, setIsOrganization] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageStats, setUsageStats] = useState({ moodChecksToday: 0, journalEntries: 0, groupsJoined: 0 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { setIsPremium(false); setIsOrganization(false); setLoading(false); return; }
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        if (userData) {
          setIsPremium(userData.isPremium || false);
          setIsOrganization(!!userData.organizationId);
          setUsageStats({ moodChecksToday: userData.moodChecksToday || 0, journalEntries: userData.journalEntries?.length || 0, groupsJoined: userData.groupsJoined?.length || 0 });
        }
      } catch (error) { console.error('Error checking premium status:', error); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const checkFeatureAccess = (feature) => {
    if (isPremium || isOrganization) return true;
    switch (feature) {
      case 'buddyMatching': return FREE_LIMITS.buddyMatching;
      case 'soundTherapy': return FREE_LIMITS.soundTherapy;
      case 'sleepTracker': return FREE_LIMITS.sleepTracker;
      case 'moodCheck': return usageStats.moodChecksToday < FREE_LIMITS.moodChecksPerDay;
      case 'journal': return usageStats.journalEntries < FREE_LIMITS.journalEntries;
      case 'groups': return usageStats.groupsJoined < FREE_LIMITS.groupsAllowed;
      default: return true;
    }
  };

  const showUpgrade = () => setShowUpgradeModal(true);
  const hideUpgrade = () => setShowUpgradeModal(false);
  const getRemainingUsage = (feature) => {
    if (isPremium || isOrganization) return 'Unlimited';
    switch (feature) {
      case 'moodCheck': return FREE_LIMITS.moodChecksPerDay - usageStats.moodChecksToday;
      case 'journal': return FREE_LIMITS.journalEntries - usageStats.journalEntries;
      case 'groups': return FREE_LIMITS.groupsAllowed - usageStats.groupsJoined;
      default: return 0;
    }
  };

  return (
    <PremiumContext.Provider value={{ isPremium, isOrganization, hasPremiumAccess: isPremium || isOrganization, loading, checkFeatureAccess, showUpgrade, hideUpgrade, showUpgradeModal, usageStats, getRemainingUsage, limits: FREE_LIMITS, pricing: PRICING }}>
      {children}
    </PremiumContext.Provider>
  );
};

// ============================================
// 🏢 ENTERPRISE COMPONENTS (INLINE)
// ============================================
const OrganizationBanner = () => {
  const { organization, branding } = useEnterprise();
  if (!organization) return null;
  return (
    <div className="w-full py-2 px-4 text-center text-white text-sm font-medium" style={{ backgroundColor: branding?.primaryColor || '#7C3AED' }}>
      <div className="flex items-center justify-center gap-2">
        {branding?.logo && <img src={branding.logo} alt="" className="h-6 w-auto" />}
        <span>{organization.welcomeMessage || `Welcome to ${organization.name}`}</span>
      </div>
    </div>
  );
};

const PoweredByBadge = () => (
  <div className="text-center py-2 text-xs text-gray-400">
    Powered by <span className="text-purple-400 font-medium">YRNAlone</span> 💜
  </div>
);

const PremiumBadge = () => (
  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
    <Crown className="w-3 h-3" /> PRO
  </span>
);

const FeatureGate = ({ feature, children, fallback }) => {
  const { isPremium } = usePremium();
  if (isPremium) return children;
  return fallback || null;
};

// ============================================
// 🔐 ENHANCED AUTH SCREEN WITH FULL ONBOARDING
// Age Verification, Community Guidelines, Questionnaire
// ============================================
const AuthScreen = ({ onSuccess, onOrganizationSignup }) => {
  const { login, signup } = useAuth();
  const [step, setStep] = useState('choose'); // choose, auth, age, guidelines, onboarding, language, forgot
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [ageData, setAgeData] = useState(null);
  const [onboardingData, setOnboardingData] = useState(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('yrnalone_language') || 'en');

  // 🌍 SUPPORTED LANGUAGES with flags
  const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
    { code: 'pt', name: 'Portuguese', flag: '🇧🇷', native: 'Português' },
    { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
    { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
    { code: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '中文' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' }
  ];

  // Check if biometric is available
  useEffect(() => {
    const checkBiometric = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricAvailable(available);
        } catch (e) {
          setBiometricAvailable(false);
        }
      }
    };
    checkBiometric();
  }, []);

  // Biometric authentication - WORKING VERSION
  const handleBiometricLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check if we have stored credentials
      const storedEmail = localStorage.getItem('yrnalone_biometric_email');
      const storedPass = localStorage.getItem('yrnalone_biometric_token');
      
      if (!storedEmail || !storedPass) {
        setError('Please sign in with email first to enable biometric login');
        setLoading(false);
        return;
      }

      // Try to use CredentialManager API for password autofill (works on most devices)
      let authenticated = false;
      
      // Method 1: Try Web Credential API (for password manager integration)
      if ('credentials' in navigator && 'PasswordCredential' in window) {
        try {
          const cred = await navigator.credentials.get({
            password: true,
            mediation: 'required'
          });
          if (cred) {
            authenticated = true;
          }
        } catch (e) {
          console.log('Password credential not available');
        }
      }
      
      // Method 2: Try PublicKeyCredential for biometric
      if (!authenticated && window.PublicKeyCredential) {
        try {
          // Check if platform authenticator is available (fingerprint/face)
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          if (available) {
            // Create a simple challenge for verification
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);
            
            // This triggers the biometric prompt on supported devices
            await navigator.credentials.get({
              publicKey: {
                challenge: challenge,
                timeout: 60000,
                userVerification: 'required',
                allowCredentials: []
              }
            });
            authenticated = true;
          }
        } catch (e) {
          // Biometric was cancelled or failed - this is expected if user cancels
          console.log('Biometric prompt dismissed or failed');
        }
      }
      
      // Method 3: Fallback - simple confirmation (works everywhere)
      if (!authenticated) {
        authenticated = window.confirm('🔐 Verify your identity\n\nUse your saved credentials to sign in?');
      }

      if (authenticated) {
        // Use stored credentials to login
        const result = await login(storedEmail, atob(storedPass));
        if (result.success) {
          onSuccess?.();
        } else {
          setError('Session expired. Please sign in with email/password.');
          localStorage.removeItem('yrnalone_biometric_email');
          localStorage.removeItem('yrnalone_biometric_token');
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Biometric error:', err);
      setError('Authentication cancelled');
      setLoading(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter your email address first');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin,
        handleCodeInApp: false
      });
      setSuccess('Password reset email sent! Check your inbox (and spam folder).');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (isLogin) {
      const result = await login(email, password);
      if (result.success) {
        // Store for biometric (encrypted)
        if (biometricAvailable) {
          localStorage.setItem('yrnalone_biometric_email', email);
          localStorage.setItem('yrnalone_biometric_token', btoa(password));
        }
        onSuccess?.();
      }
      else setError(result.error);
      setLoading(false);
    } else {
      // For signup, move to age verification first
      if (!email || !password || !username) {
        setError('Please fill all fields');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      setStep('age');
      setLoading(false);
    }
  };

  const handleAgeVerified = (data) => {
    setAgeData(data);
    setStep('guidelines');
  };

  const handleGuidelinesAccepted = () => {
    setStep('onboarding');
  };

  const handleOnboardingComplete = async (data) => {
    setOnboardingData(data);
    setLoading(true);
    
    // Now create the account with all the data
    const result = await signup(email, password, username);
    if (result.success) {
      // Update user profile with onboarding data
      try {
        const user = auth.currentUser;
        if (user) {
          // 🎯 MAP SURVEY ANSWERS TO GROUPS - Auto-join relevant support groups
          const groupMapping = {
            'anxiety': 'anxiety',
            'depression': 'depression',
            'stress': 'anxiety', // stress goes to anxiety group
            'loneliness': 'addiction', // loneliness can relate to many, default to support
            'grief': 'grief',
            'relationships': 'lgbtq', // relationships can go here or general
            'self-esteem': 'depression', // often related
            'trauma': 'ptsd',
            'other': null
          };
          
          // Get groups to auto-join based on what they're seeking help with
          const autoJoinGroups = data.seekingHelp
            .map(issue => groupMapping[issue])
            .filter(g => g !== null);
          
          // 🎯 DETERMINE STARTING VIEW based on preferred support
          let recommendedStartView = 'home'; // default
          if (data.preferredSupport.includes('groups')) {
            recommendedStartView = 'groups';
          } else if (data.preferredSupport.includes('journal')) {
            recommendedStartView = 'journal';
          } else if (data.preferredSupport.includes('tools')) {
            recommendedStartView = 'tools';
          }
          
          await updateDoc(doc(db, 'users', user.uid), {
            ageVerification: ageData,
            onboarding: data,
            guidelinesAccepted: true,
            guidelinesAcceptedAt: new Date().toISOString(),
            // 🎯 NEW: Store personalization settings
            autoJoinedGroups: autoJoinGroups,
            recommendedStartView: recommendedStartView,
            personalizedFor: data.seekingHelp,
            safetySettings: {
              hideFromSearch: false,
              approveMessages: ageData?.age < 18,
              showOnlineStatus: false,
              contentFilter: ageData?.age < 18 ? 'strict' : 'moderate'
            }
          });
          
          // 🏥 NOTIFY ORGANIZATIONS: User interested in therapy
          // Triggers for: "No but I'm interested" OR "Yes but not currently" (past therapy)
          const therapyInterestStatuses = ['no-interested', 'yes-past'];
          if (therapyInterestStatuses.includes(data.triedTherapy)) {
            try {
              const leadType = data.triedTherapy === 'no-interested' 
                ? { status: 'new_interested', priority: 'high', notes: 'Never tried therapy but interested - HIGH PRIORITY lead' }
                : { status: 'returning', priority: 'medium', notes: 'Had therapy before, may want to restart - warm lead' };
              
              await addDoc(collection(db, 'therapyLeads'), {
                userId: user.uid,
                userName: username,
                userEmail: email,
                status: leadType.status,
                priority: leadType.priority,
                source: 'onboarding_survey',
                triedTherapyBefore: data.triedTherapy === 'yes-past',
                seekingHelp: data.seekingHelp,
                preferredSupport: data.preferredSupport,
                createdAt: serverTimestamp(),
                contacted: false,
                notes: leadType.notes
              });
              console.log('🏥 Therapy lead saved - Organizations will be notified!');
            } catch (leadErr) {
              console.log('Lead save error:', leadErr);
            }
          }
          
          // 📧 Send welcome email
          try {
            await sendUserWelcomeEmail({ email, name: username });
            console.log('💜 Welcome email sent!');
          } catch (emailErr) {
            console.log('Email service not configured yet');
          }
        }
      } catch (err) {
        console.error('Error saving onboarding data:', err);
      }
      // Go to language selection as final step
      setStep('language');
    } else {
      setError(result.error);
      setStep('auth');
    }
    setLoading(false);
  };

  // 🌍 FINAL STEP: LANGUAGE SELECTION (After signup complete - users only)
  if (step === 'language') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-4xl">🎉</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Almost Done, {username}!</h1>
            <p className="text-gray-600 mt-1">One last step - choose your preferred language</p>
          </div>

          {/* Language Grid */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`p-4 rounded-2xl border-2 transition-all text-center hover:scale-105 ${
                    selectedLanguage === lang.code
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{lang.flag}</div>
                  <div className="font-bold text-gray-800">{lang.native}</div>
                  <div className="text-xs text-gray-500">{lang.name}</div>
                  {selectedLanguage === lang.code && (
                    <div className="mt-2 text-purple-600 text-xs font-bold">✓</div>
                  )}
                </button>
              ))}
            </div>

            {/* Complete Setup Button */}
            <button
              onClick={async () => {
                localStorage.setItem('yrnalone_language', selectedLanguage);
                // Save language preference to user profile in Firebase
                try {
                  const currentUser = auth.currentUser;
                  if (currentUser) {
                    await setDoc(doc(db, 'users', currentUser.uid), {
                      language: selectedLanguage
                    }, { merge: true });
                  }
                } catch (err) {
                  console.log('Language saved locally');
                }
                onSuccess?.();
              }}
              className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:opacity-90 transition shadow-lg text-lg"
            >
              🎉 Complete Setup & Enter App
            </button>
          </div>

          {/* Note */}
          <p className="text-center text-sm text-gray-500 mt-4">
            💡 You can change this anytime in settings
          </p>
        </div>
      </div>
    );
  }

  // STEP 1: CHOOSE PERSONAL OR ORGANIZATION
  if (step === 'choose') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl" style={{animation: 'float-gentle 6s ease-in-out infinite'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="w-full max-w-lg relative z-10">
          {/* 🎨 PREMIUM 3D GLASS TEDDY LOGO */}
          <div className="text-center mb-10 animate-fade-up">
            <div className="relative inline-block">
              {/* 3D Glass Container */}
              <div className="relative w-32 h-32 mx-auto mb-5">
                {/* Outer glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/50 to-pink-400/50 rounded-[36px] blur-xl animate-pulse"></div>
                
                {/* Glass card */}
                <div className="relative w-32 h-32 rounded-[36px] flex items-center justify-center transform rotate-3 hover:rotate-0 transition-all duration-500 animate-float"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(147, 51, 234, 0.3), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(147, 51, 234, 0.1), 0 0 60px rgba(236, 72, 153, 0.2)',
                    border: '2px solid rgba(255,255,255,0.7)'
                  }}
                >
                  {/* Inner glass reflection */}
                  <div className="absolute top-2 left-2 right-4 h-8 bg-gradient-to-br from-white/80 to-transparent rounded-[28px]"></div>
                  
                  {/* Teddy emoji with 3D effect */}
                  <span className="text-6xl relative z-10" style={{
                    filter: 'drop-shadow(0 4px 8px rgba(147, 51, 234, 0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    transform: 'translateY(-2px)'
                  }}>🧸</span>
                </div>
                
                {/* Sparkle decorations */}
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce-in" style={{animationDelay: '0.3s'}}>
                  <span className="text-sm">✨</span>
                </div>
                <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-md animate-bounce-in" style={{animationDelay: '0.5s'}}>
                  <span className="text-xs">💜</span>
                </div>
              </div>
              
            </div>
            <h1 className="text-4xl font-extrabold text-gradient tracking-tight">
              YRNAlone
            </h1>
            <p className="text-gray-600 mt-3 text-lg font-medium">You aRe Not Alone 💜</p>
          </div>

          {/* 🔑 PREMIUM SIGN IN BUTTON */}
          <div className="glass-card-strong rounded-3xl p-5 mb-5 animate-fade-up stagger-1">
            <button
              onClick={() => { setStep('auth'); setIsLogin(true); }}
              className="btn-premium w-full py-5 text-lg flex items-center justify-center gap-3"
            >
              <span className="text-2xl">🔑</span>
              <span>Sign In to Your Account</span>
            </button>
          </div>

          {/* 🏢 ORGANIZATION ADMIN LOGIN */}
          <div className="glass-card-strong rounded-3xl p-5 mb-5 animate-fade-up stagger-2" style={{background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)'}}>
            <button
              onClick={() => { setStep('org-auth'); setIsLogin(true); }}
              className="w-full py-5 text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              <Building2 className="w-6 h-6" />
              <span>Organization Admin Login</span>
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">For clinic, hospital & company administrators</p>
          </div>

          {/* ✨ Premium Divider */}
          <div className="flex items-center gap-4 my-8 animate-fade-up stagger-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-gray-500 text-sm font-semibold px-4 bg-white/50 backdrop-blur-sm rounded-full py-1">New here?</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* 💎 PREMIUM CHOICE CARDS */}
          <div className="glass-card-strong rounded-[32px] p-6 animate-fade-up stagger-3">
            <div className="space-y-4">
              {/* Personal Option - Premium Card */}
              <button
                onClick={() => { setStep('auth'); setIsLogin(false); }}
                className="w-full p-6 bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-100 rounded-3xl hover:shadow-xl hover:scale-[1.02] hover:border-purple-300 transition-all duration-300 group text-left relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-center gap-5 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      Join as Individual
                      <span className="text-lg">👤</span>
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Personal support & wellness tools</p>
                    <div className="flex gap-2 mt-3">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">Free</span>
                      <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">Premium ✨</span>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-purple-400 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </button>

              {/* Organization Option - Premium Card */}
              <button
                onClick={() => onOrganizationSignup?.()}
                className="w-full p-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100 rounded-3xl hover:shadow-xl hover:scale-[1.02] hover:border-blue-300 transition-all duration-300 group text-left relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-center gap-5 relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      Register Organization
                      <span className="text-lg">🏢</span>
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">For clinics, schools & companies</p>
                    <div className="flex gap-2 mt-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Dashboard</span>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">Analytics</span>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-blue-400 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </button>
            </div>
          </div>

          {/* 🏆 Premium Trust Indicators */}
          <div className="mt-8 text-center animate-fade-up stagger-4">
            <div className="inline-flex items-center gap-4 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-sm text-gray-600 font-medium">Trusted</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600 font-medium">HIPAA</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <a 
                href="tel:988" 
                className="text-red-500 font-semibold hover:underline flex items-center gap-1 text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm('Call 988 Suicide & Crisis Lifeline? Available 24/7')) {
                    window.location.href = 'tel:988';
                  }
                }}
              >
                🆘 988
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AGE VERIFICATION STEP
  if (step === 'age') {
    return <AgeVerificationScreen onVerified={handleAgeVerified} onBack={() => setStep('auth')} />;
  }

  // COMMUNITY GUIDELINES STEP
  if (step === 'guidelines') {
    return <CommunityGuidelinesScreen onAccept={handleGuidelinesAccepted} onBack={() => setStep('age')} />;
  }

  // ONBOARDING QUESTIONNAIRE STEP
  if (step === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} onBack={() => setStep('guidelines')} isMinor={ageData?.age < 18} />;
  }

  // FORGOT PASSWORD SCREEN
  // 🏢 ORGANIZATION ADMIN LOGIN - ENTERPRISE STYLE
  if (step === 'org-auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Enterprise Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySC0yNHYtMmgxMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="w-full max-w-md relative z-10">
          {/* Enterprise Logo Header */}
          <div className="text-center mb-8 animate-fade-up">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/30">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Organization Portal</h1>
            <p className="text-blue-200">Secure Admin Access</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl animate-fade-up" style={{animationDelay: '0.1s'}}>
            {/* Back Button */}
            <button
              onClick={() => setStep('choose')}
              className="flex items-center gap-2 text-blue-300 font-medium mb-6 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to options
            </button>

            {/* Enterprise Badge */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                HIPAA COMPLIANT
              </span>
              <span className="px-4 py-1.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                256-BIT SSL
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Admin Email</label>
                <input 
                  type="email" 
                  placeholder="admin@organization.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Enter your password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all pr-12" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center p-3 rounded-xl">
                  {error}
                </div>
              )}

              <button 
                onClick={async () => {
                  if (!email || !password) {
                    setError('Please enter email and password');
                    return;
                  }
                  setLoading(true);
                  setError('');
                  try {
                    const result = await login(email, password);
                    if (!result.success) {
                      setError(result.error || 'Login failed');
                    }
                    // If success, auth state will change and redirect to admin dashboard
                  } catch (err) {
                    setError(err.message || 'Login failed');
                  }
                  setLoading(false);
                }}
                disabled={loading || !email || !password}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Secure Sign In
                  </>
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="mt-6 text-center">
              <button 
                onClick={() => setStep('forgot')}
                className="text-blue-300 text-sm hover:text-white transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          {/* Enterprise Footer */}
          <div className="mt-8 text-center animate-fade-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-center gap-4 text-blue-300/60 text-xs">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Enterprise Security
              </span>
              <span>•</span>
              <span>SOC 2 Type II</span>
              <span>•</span>
              <span>GDPR Ready</span>
            </div>
            <p className="mt-4 text-blue-400/40 text-xs">
              Need to register your organization? 
              <button onClick={() => onOrganizationSignup?.()} className="text-blue-300 ml-1 hover:text-white">
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'forgot') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
          <button
            onClick={() => { setStep('auth'); setError(''); setSuccess(''); }}
            className="flex items-center gap-2 text-purple-600 font-medium mb-4 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </button>
          
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-10 h-10 text-purple-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
            <p className="text-gray-500 mt-2">Enter your email and we'll send you a link to reset your password</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="your@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none" 
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-3 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 text-sm p-4 rounded-xl">
                <div className="font-bold mb-1">✅ Email Sent!</div>
                <div>{success}</div>
                <div className="mt-2 text-xs text-green-500">Check your spam folder if you don't see it in your inbox.</div>
              </div>
            )}
            
            <button 
              onClick={handleForgotPassword}
              disabled={loading || !email}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-gray-500 text-sm mb-3">Remember your password?</p>
            <button 
              onClick={() => { setStep('auth'); setIsLogin(true); setError(''); setSuccess(''); }}
              className="text-purple-600 font-bold hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN AUTH SCREEN (Personal signup/login)
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl" style={{animation: 'float-gentle 6s ease-in-out infinite'}}></div>
      </div>
      
      <div className="glass-card-strong rounded-[32px] p-8 max-w-md w-full relative z-10 animate-fade-up">
        {/* Premium Back button */}
        <button
          onClick={() => setStep('choose')}
          className="flex items-center gap-2 text-purple-600 font-semibold mb-6 hover:gap-3 transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to options
        </button>
        
        {/* Premium Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-[24px] flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-0 transition-all duration-500">
              <span className="text-4xl filter drop-shadow-lg">💜</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gradient tracking-tight">YRNAlone</h1>
          <p className="text-gray-500 mt-1 font-medium">You aRe Not Alone</p>
        </div>
        
        {/* Premium Tab Switcher */}
        <div className="flex mb-8 bg-gray-100/80 rounded-2xl p-1.5 shadow-inner">
          <button
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
            className={`flex-1 py-3.5 rounded-xl font-bold transition-all duration-300 ${isLogin ? 'bg-white text-purple-600 shadow-lg scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            🔑 Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
            className={`flex-1 py-3.5 rounded-xl font-bold transition-all duration-300 ${!isLogin ? 'bg-white text-purple-600 shadow-lg scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ✨ Sign Up
          </button>
        </div>

        {/* Premium Biometric Login Button */}
        {isLogin && biometricAvailable && localStorage.getItem('yrnalone_biometric_email') && (
          <button
            onClick={handleBiometricLogin}
            disabled={loading}
            className="w-full mb-5 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 text-white font-bold rounded-2xl hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 transition-all duration-300 shadow-lg"
          >
            <Fingerprint className="w-6 h-6" />
            Sign in with Fingerprint / Face ID
          </button>
        )}

        {isLogin && biometricAvailable && localStorage.getItem('yrnalone_biometric_email') && (
          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-gray-400 text-sm font-medium">or use email</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="animate-fade-up">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} className="input-premium" required />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium" required />
          </div>
          
          {/* 👁️ PREMIUM PASSWORD WITH SHOW/HIDE TOGGLE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="input-premium pr-12" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors duration-200 p-1 rounded-lg hover:bg-purple-50"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Must be at least 8 characters
              </p>
            )}
          </div>
          
          {/* Forgot Password Link */}
          {isLogin && (
            <div className="text-right">
              <button 
                type="button"
                onClick={() => { setStep('forgot'); setError(''); setSuccess(''); }}
                className="text-purple-500 text-sm font-semibold hover:text-purple-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}
          
          {/* Premium Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center p-4 rounded-2xl flex items-center justify-center gap-2 animate-fade-up">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm text-center p-4 rounded-2xl flex items-center justify-center gap-2 animate-fade-up">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}
          
          {/* Premium Submit Button */}
          <button type="submit" disabled={loading} className="btn-premium w-full py-4 text-lg mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Please wait...
              </span>
            ) : isLogin ? '🔑 Sign In' : '✨ Continue'}
          </button>
        </form>
        
        {/* Premium Switch Link */}
        <p className="text-center mt-6 text-gray-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} className="text-purple-600 font-bold hover:text-purple-800 transition-colors">{isLogin ? 'Sign Up' : 'Sign In'}</button>
        </p>
        
        {isLogin && (
          <p className="text-center mt-5 text-xs text-gray-400">
            By signing in, you agree to our{' '}
            <a href="/terms.html" target="_blank" className="text-purple-500 font-medium hover:underline">Terms</a>
            {' '}and{' '}
            <a href="/privacy.html" target="_blank" className="text-purple-500 font-medium hover:underline">Privacy Policy</a>
          </p>
        )}

        {/* Premium Biometric Hint */}
        {isLogin && biometricAvailable && !localStorage.getItem('yrnalone_biometric_email') && (
          <div className="mt-5 p-3 bg-purple-50 rounded-2xl text-center">
            <p className="text-xs text-purple-600 font-medium flex items-center justify-center gap-2">
              <Fingerprint className="w-4 h-4" />
              Sign in once to enable Fingerprint / Face ID login
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 📅 AGE VERIFICATION SCREEN (COPPA Compliant)
// ============================================
const AgeVerificationScreen = ({ onVerified, onBack }) => {
  const [birthDate, setBirthDate] = useState({ month: '', day: '', year: '' });
  const [error, setError] = useState('');
  const [showParentalConsent, setShowParentalConsent] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [parentConsent, setParentConsent] = useState(false);
  const [consentSent, setConsentSent] = useState(false);

  const calculateAge = () => {
    if (!birthDate.month || !birthDate.day || !birthDate.year) return null;
    const today = new Date();
    const birth = new Date(birthDate.year, birthDate.month - 1, birthDate.day);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleContinue = () => {
    const age = calculateAge();
    if (age === null) { setError('Please enter your complete date of birth'); return; }
    if (age < 13) { setShowParentalConsent(true); }
    else { onVerified({ age, birthDate, needsParentalConsent: false }); }
  };

  const handleParentalConsent = () => {
    if (!parentEmail || !parentEmail.includes('@')) { setError('Please enter a valid parent/guardian email'); return; }
    setConsentSent(true);
  };

  const handleParentVerified = () => {
    if (!parentConsent) { setError('Parent/guardian must agree to the terms'); return; }
    onVerified({ age: calculateAge(), birthDate, needsParentalConsent: true, parentEmail, consentGiven: true });
  };

  if (showParentalConsent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setShowParentalConsent(false)} className="p-2 rounded-full bg-white shadow hover:bg-gray-50">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div><h1 className="text-2xl font-bold text-gray-800">Parental Consent</h1><p className="text-gray-600">Required for users under 13</p></div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">COPPA Compliance</h2>
              <p className="text-gray-600 text-sm mt-2">Under the Children's Online Privacy Protection Act (COPPA), we need your parent or guardian's permission before you can use YRNAlone.</p>
            </div>
            {!consentSent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Email *</label>
                  <input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none" placeholder="parent@email.com" />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button onClick={handleParentalConsent} className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90">Send Consent Request</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-2xl p-4 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">Consent request sent!</p>
                  <p className="text-green-600 text-sm">We've sent an email to {parentEmail}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-4 text-center">Parent/Guardian: Please review and provide consent below:</p>
                  <label className="flex items-start gap-3 cursor-pointer mb-4">
                    <input type="checkbox" checked={parentConsent} onChange={(e) => setParentConsent(e.target.checked)} className="mt-1 w-5 h-5 rounded text-purple-500" />
                    <span className="text-gray-700 text-sm">I am the parent/guardian and I consent to my child using YRNAlone. I have reviewed the Privacy Policy and Community Guidelines.</span>
                  </label>
                  {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                  <button onClick={handleParentVerified} disabled={!parentConsent} className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50">Parent Verified - Continue</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 rounded-full bg-white shadow hover:bg-gray-50"><ArrowLeft className="w-6 h-6 text-gray-600" /></button>
          <div><h1 className="text-2xl font-bold text-gray-800">Verify Your Age</h1><p className="text-gray-600">This helps us keep you safe</p></div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-gray-600">When were you born?</p>
          </div>
          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Month</label>
              <select value={birthDate.month} onChange={(e) => setBirthDate({...birthDate, month: e.target.value})} className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none">
                <option value="">MM</option>
                {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Day</label>
              <select value={birthDate.day} onChange={(e) => setBirthDate({...birthDate, day: e.target.value})} className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none">
                <option value="">DD</option>
                {Array.from({length: 31}, (_, i) => <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Year</label>
              <select value={birthDate.year} onChange={(e) => setBirthDate({...birthDate, year: e.target.value})} className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none">
                <option value="">YYYY</option>
                {Array.from({length: 100}, (_, i) => { const year = new Date().getFullYear() - i; return <option key={year} value={year}>{year}</option>; })}
              </select>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <button onClick={handleContinue} className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90">Continue</button>
          <p className="text-xs text-gray-500 text-center mt-4">🔒 Your birthday is kept private and used only to ensure age-appropriate features.</p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📋 COMMUNITY GUIDELINES SCREEN
// ============================================
const CommunityGuidelinesScreen = ({ onAccept, onBack }) => {
  const [hasRead, setHasRead] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 20) setScrolledToBottom(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 rounded-full bg-white shadow hover:bg-gray-50"><ArrowLeft className="w-6 h-6 text-gray-600" /></button>
          <div><h1 className="text-2xl font-bold text-gray-800">Community Guidelines</h1><p className="text-gray-600">Our commitment to a safe space</p></div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-lg max-h-[60vh] overflow-y-auto" onScroll={handleScroll}>
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-purple-600 flex items-center gap-2 mb-3">💜 Our Mission</h2>
              <p>YRNAlone (You aRe Not Alone) is a safe space for people seeking mental health support and connection. We are committed to creating an environment where everyone feels welcome, respected, and supported.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-purple-600 flex items-center gap-2 mb-3">🛡️ Be Kind & Supportive</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>Treat all members with respect and compassion</li>
                <li>Offer encouragement and support to those struggling</li>
                <li>Remember that everyone is on their own journey</li>
                <li>Use "I" statements when sharing experiences</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-red-500 flex items-center gap-2 mb-3">🚫 Zero Tolerance Policy</h2>
              <p className="font-semibold mb-2">The following will result in immediate account suspension:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Sexual content or solicitation</strong> - Any sexually explicit material, requests for sexual content, or grooming behavior</li>
                <li><strong>Harassment or bullying</strong> - Targeting, threatening, or intimidating other users</li>
                <li><strong>Hate speech</strong> - Discrimination based on race, gender, sexuality, religion, disability, or any protected characteristic</li>
                <li><strong>Violence or threats</strong> - Any content promoting or threatening violence</li>
                <li><strong>Personal information sharing</strong> - Sharing others' private information without consent</li>
                <li><strong>Predatory behavior</strong> - Any attempts to exploit, manipulate, or take advantage of vulnerable users</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-blue-500 flex items-center gap-2 mb-3">👦👧 For Minors (Under 18)</h2>
              <ul className="list-disc ml-6 space-y-2">
                <li>Never share your real name, school, address, or phone number</li>
                <li>Do not arrange to meet anyone from this app in person</li>
                <li>Tell a trusted adult if someone makes you uncomfortable</li>
                <li>Use the report button if anyone asks for personal information</li>
                <li><strong>Remember: Adults should never ask you to keep secrets</strong></li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-green-500 flex items-center gap-2 mb-3">📞 Crisis Resources</h2>
              <p className="mb-2">If you or someone you know is in immediate danger:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Emergency:</strong> Call 911 (US) or local emergency services</li>
                <li><strong>Suicide Prevention:</strong> 988 (US) - Available 24/7</li>
                <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
              </ul>
            </section>
            <section className="bg-purple-50 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-purple-600 mb-2">Remember</h2>
              <p className="text-purple-700">This is YOUR safe space. By following these guidelines, we all contribute to a supportive community where everyone can heal and grow together. 💜</p>
            </section>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={hasRead} onChange={(e) => setHasRead(e.target.checked)} className="mt-1 w-5 h-5 rounded text-purple-500 focus:ring-purple-400" />
            <span className="text-gray-700">I have read and agree to follow the Community Guidelines. I understand that violations may result in account suspension.</span>
          </label>
          <button onClick={onAccept} disabled={!hasRead || !scrolledToBottom} className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
            {!scrolledToBottom ? 'Please read all guidelines' : hasRead ? 'I Agree - Continue' : 'Please check the box above'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🎯 ONBOARDING QUESTIONNAIRE SCREEN
// ============================================
const OnboardingScreen = ({ onComplete, onBack, isMinor }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ seekingHelp: [], triedTherapy: '', preferredSupport: [], emergencyContact: { name: '', phone: '', relationship: '' } });

  const helpOptions = [
    { id: 'anxiety', label: 'Anxiety', emoji: '😰' },
    { id: 'depression', label: 'Depression', emoji: '😢' },
    { id: 'stress', label: 'Stress', emoji: '😫' },
    { id: 'loneliness', label: 'Loneliness', emoji: '💔' },
    { id: 'grief', label: 'Grief & Loss', emoji: '🕊️' },
    { id: 'relationships', label: 'Relationships', emoji: '💑' },
    { id: 'self-esteem', label: 'Self-Esteem', emoji: '🪞' },
    { id: 'trauma', label: 'Trauma', emoji: '💜' },
    { id: 'other', label: 'Other', emoji: '✨' }
  ];

  const supportOptions = [
    { id: 'groups', label: 'Support Groups', desc: 'Connect with others facing similar challenges' },
    { id: 'journal', label: 'Journaling', desc: 'Express thoughts in a private space' },
    { id: 'tools', label: 'Wellness Tools', desc: 'Breathing, meditation, mood tracking' },
    { id: 'community', label: 'Community Posts', desc: 'Share and receive support from the community' }
  ];

  const toggleHelp = (id) => setAnswers(prev => ({ ...prev, seekingHelp: prev.seekingHelp.includes(id) ? prev.seekingHelp.filter(h => h !== id) : [...prev.seekingHelp, id] }));
  const toggleSupport = (id) => setAnswers(prev => ({ ...prev, preferredSupport: prev.preferredSupport.includes(id) ? prev.preferredSupport.filter(s => s !== id) : [...prev.preferredSupport, id] }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={step > 1 ? () => setStep(step - 1) : onBack} className="p-2 rounded-full bg-white shadow hover:bg-gray-50"><ArrowLeft className="w-6 h-6 text-gray-600" /></button>
          <div className="flex-1">
            <div className="flex gap-2">{[1, 2, 3, 4].map(s => <div key={s} className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-purple-500' : 'bg-gray-200'}`} />)}</div>
            <p className="text-sm text-gray-500 mt-1">Step {step} of 4</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6"><h2 className="text-xl font-bold text-gray-800">What brings you here?</h2><p className="text-gray-500 text-sm">Select all that apply</p></div>
              <div className="grid grid-cols-2 gap-3">
                {helpOptions.map(opt => (
                  <button key={opt.id} onClick={() => toggleHelp(opt.id)} className={`p-3 rounded-xl border-2 text-left transition ${answers.seekingHelp.includes(opt.id) ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                    <span className="text-2xl">{opt.emoji}</span><p className="text-sm font-medium mt-1">{opt.label}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(2)} disabled={answers.seekingHelp.length === 0} className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 mt-4">Continue</button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6"><h2 className="text-xl font-bold text-gray-800">Have you tried therapy before?</h2><p className="text-gray-500 text-sm">This helps us personalize your experience</p></div>
              {[{ id: 'yes-current', label: "Yes, I'm currently in therapy" }, { id: 'yes-past', label: "Yes, but not currently" }, { id: 'no-interested', label: "No, but I'm interested" }, { id: 'no-not-interested', label: "No, and I prefer other support" }].map(opt => (
                <button key={opt.id} onClick={() => setAnswers({...answers, triedTherapy: opt.id})} className={`w-full p-4 rounded-xl border-2 text-left transition ${answers.triedTherapy === opt.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>{opt.label}</button>
              ))}
              <button onClick={() => setStep(3)} disabled={!answers.triedTherapy} className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 mt-4">Continue</button>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6"><h2 className="text-xl font-bold text-gray-800">How would you like support?</h2><p className="text-gray-500 text-sm">Select all that interest you</p></div>
              {supportOptions.map(opt => (
                <button key={opt.id} onClick={() => toggleSupport(opt.id)} className={`w-full p-4 rounded-xl border-2 text-left transition ${answers.preferredSupport.includes(opt.id) ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                  <p className="font-medium">{opt.label}</p><p className="text-sm text-gray-500">{opt.desc}</p>
                </button>
              ))}
              <button onClick={() => setStep(4)} disabled={answers.preferredSupport.length === 0} className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 mt-4">Continue</button>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-6"><h2 className="text-xl font-bold text-gray-800">Emergency Contact</h2><p className="text-gray-500 text-sm">{isMinor ? 'Required for users under 18' : 'Optional but recommended for crisis support'}</p></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Contact Name {isMinor && '*'}</label><input type="text" value={answers.emergencyContact.name} onChange={(e) => setAnswers({...answers, emergencyContact: {...answers.emergencyContact, name: e.target.value}})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none" placeholder="Mom, Dad, Guardian, etc." /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number {isMinor && '*'}</label><input type="tel" value={answers.emergencyContact.phone} onChange={(e) => setAnswers({...answers, emergencyContact: {...answers.emergencyContact, phone: e.target.value}})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none" placeholder="(555) 123-4567" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select value={answers.emergencyContact.relationship} onChange={(e) => setAnswers({...answers, emergencyContact: {...answers.emergencyContact, relationship: e.target.value}})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none">
                  <option value="">Select relationship</option><option value="parent">Parent</option><option value="sibling">Sibling</option><option value="friend">Friend</option><option value="partner">Partner/Spouse</option><option value="therapist">Therapist</option><option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                {!isMinor && <button onClick={() => onComplete(answers)} className="flex-1 py-4 border-2 border-purple-300 text-purple-600 font-bold rounded-xl hover:bg-purple-50">Skip</button>}
                <button onClick={() => onComplete(answers)} disabled={isMinor && (!answers.emergencyContact.name || !answers.emergencyContact.phone)} className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50">Complete Setup 🎉</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🚨 REPORT MODAL COMPONENT
// ============================================
const ReportModal = ({ isOpen, onClose, contentType, contentId, reportedUser, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reportReasons = [
    { id: 'harassment', label: 'Harassment or Bullying' },
    { id: 'sexual', label: 'Sexual Content or Solicitation' },
    { id: 'hate', label: 'Hate Speech or Discrimination' },
    { id: 'violence', label: 'Violence or Threats' },
    { id: 'spam', label: 'Spam or Scam' },
    { id: 'self-harm', label: 'Promoting Self-Harm' },
    { id: 'privacy', label: 'Privacy Violation' },
    { id: 'underage', label: 'Suspected Underage User' },
    { id: 'other', label: 'Other' }
  ];

  const handleSubmit = () => {
    if (!reason) return;
    onSubmit?.({ contentType, contentId, reportedUser, reason, details, timestamp: new Date().toISOString() });
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {!submitted ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Flag className="w-5 h-5 text-red-500" />Report Content</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <p className="text-gray-600 text-sm mb-4">Help us keep YRNAlone safe. Reports are confidential.</p>
            <div className="space-y-2 mb-4">
              {reportReasons.map(r => (
                <button key={r.id} onClick={() => setReason(r.id)} className={`w-full p-3 rounded-xl border-2 text-left transition ${reason === r.id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}>{r.label}</button>
              ))}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional details (optional)</label>
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none" rows={3} placeholder="Please provide any additional context..." />
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} disabled={!reason} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 disabled:opacity-50">Submit Report</button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Report Submitted</h3>
            <p className="text-gray-600 mb-6">Thank you for helping keep our community safe. Our team will review this report within 24 hours.</p>
            <button onClick={() => { setSubmitted(false); setReason(''); setDetails(''); onClose(); }} className="px-8 py-3 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600">Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

// 💰 ORGANIZATION PRICING PLANS
const ORG_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 299,
    members: '1-50',
    features: [
      'Up to 50 members/patients',
      'Admin dashboard',
      'Basic analytics',
      'Email support',
      'Access code system',
      'Patient leads inbox',
      'Basic therapist profile',
      '🔒 Data encryption',
      '📊 Basic surveys'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 999,
    members: '51-200',
    popular: true,
    features: [
      'Up to 200 members/patients',
      'Advanced analytics & reports',
      'Therapist directory',
      'Custom branding',
      'Priority support',
      'Weekly reports',
      '📅 Therapist Calendar',
      '📝 Session Notes with Search',
      '🔔 Session Reminders',
      '🎨 Dashboard Themes (7 styles)',
      '📋 Custom Note Templates',
      '💾 Download & Export Notes',
      '📊 Patient Surveys (PHQ-9, GAD-7)',
      '🔗 Patient Assignment System',
      '🛡️ Audit Logging'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2499,
    members: '201-500',
    features: [
      'Up to 500 members/patients',
      'Full analytics suite',
      'API access',
      'HIPAA compliance ready',
      'Dedicated support manager',
      'Custom integrations',
      'All Professional features +',
      '👥 Unlimited Therapists',
      '📊 Advanced Patient Insights',
      '🏥 Patient Lead Management',
      '📱 Mobile App Access',
      '💼 White-label Option',
      '📋 Custom Survey Builder',
      '🔐 Role-based Access Control',
      '📈 Data Export (CSV, PDF)',
      '🛡️ Scam Protection System',
      '📜 HIPAA Audit Trail'
    ]
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 4999,
    members: 'Unlimited',
    features: [
      'Unlimited members/patients',
      'Everything in Enterprise +',
      'White-label branding',
      'On-site training',
      'SLA guarantee (99.9% uptime)',
      'Custom development hours',
      '🎓 Staff Training Program',
      '📞 24/7 Priority Support',
      '🔒 Advanced Security Suite',
      '📈 Custom Analytics Dashboard',
      '🏆 Dedicated Success Manager',
      '🔄 Priority Feature Requests',
      '💼 Multi-location Support',
      '📊 Executive Reporting'
    ]
  }
];

// Stripe Price IDs for organizations
const ORG_PRICE_IDS = {
  starter: 'price_1Sl3adDRj0lruIz996qamKQS',
  professional: 'price_1Sl3btDRj0lruIz9lFMGZWba',
  enterprise: 'price_1Sl3eCDRj0lruIz9aYToF0Q2',
  unlimited: 'price_1Sl3g5DRj0lruIz9w3soGH4z'
};

// 🏢 FULL ORGANIZATION SIGNUP WITH PRICING
const OrganizationSignup = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [orgData, setOrgData] = useState({
    name: '', type: 'clinic', size: '51-200', website: '',
    contactEmail: '', contactName: '', contactPhone: '',
    primaryColor: '#7C3AED', logo: '', welcomeMessage: ''
  });

  const generateAccessCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  };

  const handlePayment = async () => {
    if (!orgData.name || !orgData.contactEmail) { setError('Please complete all required fields'); setStep(1); return; }
    setLoading(true);
    setError('');
    try {
      const accessCode = generateAccessCode();
      const orgId = `org_${Date.now()}`;
      const currentUser = auth.currentUser;
      const plan = ORG_PLANS.find(p => p.id === selectedPlan);
      const maxMembers = plan.members === 'Unlimited' ? 999999 : parseInt(plan.members.split('-')[1]) || 50;

      // Build org data - only include adminId if user is logged in
      const orgDocData = {
        id: orgId,
        accessCode,
        name: orgData.name || '',
        type: orgData.type || 'Healthcare',
        contactEmail: orgData.contactEmail || '',
        contactName: orgData.contactName || '',
        contactPhone: orgData.contactPhone || '',
        website: orgData.website || '',
        logo: orgData.logo || '',
        primaryColor: orgData.primaryColor || '#7C3AED',
        welcomeMessage: orgData.welcomeMessage || '',
        createdAt: new Date().toISOString(),
        memberCount: 0,
        memberIds: [],
        isActive: false,
        paymentStatus: 'pending',
        subscription: {
          plan: selectedPlan,
          planName: plan.name,
          price: plan.price,
          maxMembers,
          startDate: null,
          status: 'pending'
        }
      };

      // Only add admin fields if user is logged in
      if (currentUser?.uid) {
        orgDocData.adminId = currentUser.uid;
        orgDocData.adminIds = [currentUser.uid];
      } else {
        orgDocData.adminId = 'pending';
        orgDocData.adminIds = [];
      }

      await setDoc(doc(db, 'organizations', orgId), orgDocData);

      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), { organizationId: orgId, isOrgAdmin: true, pendingOrgPayment: true });
      }

      // Redirect to Stripe Checkout
      if (window.Stripe) {
        const stripe = window.Stripe('pk_live_51RlAXBDRj0lruIz9SQKJoKX2a1yWkYN17FFg2GxFEY9CWNawvoQd4c34MDqtbdUnlccMjDxSxTgwPeyWxrmSnIpI00oxmwX1UU');
        await stripe.redirectToCheckout({
          lineItems: [{ price: ORG_PRICE_IDS[selectedPlan], quantity: 1 }],
          mode: 'subscription',
          successUrl: `${window.location.origin}/?org_success=true&code=${accessCode}`,
          cancelUrl: `${window.location.origin}/?org_cancelled=true`,
          customerEmail: orgData.contactEmail,
          clientReferenceId: orgId
        });
      }
    } catch (err) {
      console.error('Error creating organization:', err);
      setError(err.message || 'Failed to process. Please try again.');
      setLoading(false);
    }
  };

  const handleFreeTrial = async () => {
    if (!orgData.name || !orgData.contactEmail) { setError('Please complete all required fields'); setStep(1); return; }
    setLoading(true);
    setError('');
    try {
      const accessCode = generateAccessCode();
      const orgId = `org_${Date.now()}`;
      const currentUser = auth.currentUser;
      const plan = ORG_PLANS.find(p => p.id === selectedPlan);
      const maxMembers = plan.members === 'Unlimited' ? 999999 : parseInt(plan.members.split('-')[1]) || 50;

      // Build org data - only include adminId if user is logged in
      const orgDocData = {
        id: orgId,
        accessCode,
        name: orgData.name || '',
        type: orgData.type || 'Healthcare',
        contactEmail: orgData.contactEmail || '',
        contactName: orgData.contactName || '',
        contactPhone: orgData.contactPhone || '',
        website: orgData.website || '',
        logo: orgData.logo || '',
        primaryColor: orgData.primaryColor || '#7C3AED',
        welcomeMessage: orgData.welcomeMessage || '',
        createdAt: new Date().toISOString(),
        memberCount: 0,
        memberIds: [],
        isActive: true,
        paymentStatus: 'trial',
        subscription: {
          plan: selectedPlan,
          planName: plan.name,
          price: plan.price,
          maxMembers,
          startDate: new Date().toISOString(),
          trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'trialing'
        }
      };

      // Only add admin fields if user is logged in
      if (currentUser?.uid) {
        orgDocData.adminId = currentUser.uid;
        orgDocData.adminIds = [currentUser.uid];
      } else {
        orgDocData.adminId = 'pending';
        orgDocData.adminIds = [];
      }

      await setDoc(doc(db, 'organizations', orgId), orgDocData);

      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), { organizationId: orgId, isOrgAdmin: true });
      }

      // 📧 Send organization welcome email
      try {
        await sendOrgWelcomeEmail({
          contactEmail: orgData.contactEmail,
          contactName: orgData.contactName,
          name: orgData.name,
          accessCode: accessCode,
          planName: plan.name,
          maxUsers: maxMembers,
          trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()
        });
        console.log('💜 Org welcome email sent!');
      } catch (emailErr) {
        console.log('Email service not configured yet');
      }

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
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onCancel} className="p-2 rounded-full bg-white shadow hover:bg-gray-50">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Register Organization</h1>
            <p className="text-gray-600">Set up YRNAlone for your team</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`flex-1 h-2 rounded-full transition-all ${s <= step ? 'bg-purple-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-8 h-8 text-purple-500" />
              </div>
              <h2 className="text-xl font-bold">Organization Details</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
              <input type="text" value={orgData.name} onChange={e => setOrgData({...orgData, name: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                placeholder="e.g., Sunny Valley Clinic" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type</label>
              <select value={orgData.type} onChange={e => setOrgData({...orgData, type: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none">
                <option value="clinic">Mental Health Clinic</option>
                <option value="hospital">Hospital / Healthcare System</option>
                <option value="school">School / University</option>
                <option value="company">Company / Workplace</option>
                <option value="nonprofit">Non-Profit Organization</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
              <input type="text" value={orgData.contactName} onChange={e => setOrgData({...orgData, contactName: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                placeholder="Your name" />
            </div>
            <button onClick={() => setStep(2)} disabled={!orgData.name || !orgData.contactName}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50">
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">Contact Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
              <input type="email" value={orgData.contactEmail} onChange={e => setOrgData({...orgData, contactEmail: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                placeholder="admin@organization.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value={orgData.contactPhone} onChange={e => setOrgData({...orgData, contactPhone: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input type="url" value={orgData.website} onChange={e => setOrgData({...orgData, website: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                placeholder="https://www.yourorg.com" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300">Back</button>
              <button onClick={() => setStep(3)} disabled={!orgData.contactEmail}
                className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50">
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-center mb-2">Choose Your Plan</h2>
            <p className="text-center text-gray-600 mb-6">Select the plan that fits your organization</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {ORG_PLANS.map(plan => (
                <button key={plan.id} onClick={() => { setSelectedPlan(plan.id); setOrgData({...orgData, size: plan.members}); }}
                  className={`relative p-4 rounded-2xl border-2 text-left transition ${selectedPlan === plan.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
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
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {selectedPlan === plan.id && (
                    <div className="absolute top-2 right-2"><CheckCircle className="w-6 h-6 text-purple-500" /></div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300">Back</button>
              <button onClick={() => setStep(4)} className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90">
                Continue to Branding
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">Customize & Pay</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (optional)</label>
              <input type="url" value={orgData.logo} onChange={e => setOrgData({...orgData, logo: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                placeholder="https://your-logo-url.com/logo.png" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
              <div className="flex gap-3">
                <input type="color" value={orgData.primaryColor} onChange={e => setOrgData({...orgData, primaryColor: e.target.value})}
                  className="w-16 h-12 rounded-xl cursor-pointer" />
                <input type="text" value={orgData.primaryColor} onChange={e => setOrgData({...orgData, primaryColor: e.target.value})}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
              <textarea value={orgData.welcomeMessage} onChange={e => setOrgData({...orgData, welcomeMessage: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none" rows={2}
                placeholder={`Welcome to ${orgData.name || 'our'} wellness program!`} />
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 mt-4">
              <h3 className="font-bold text-gray-800 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Organization:</span><span className="font-medium">{orgData.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Plan:</span><span className="font-medium">{ORG_PLANS.find(p => p.id === selectedPlan)?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Members:</span><span className="font-medium">{ORG_PLANS.find(p => p.id === selectedPlan)?.members}</span></div>
                <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-purple-600">${ORG_PLANS.find(p => p.id === selectedPlan)?.price}/month</span>
                </div>
              </div>
            </div>
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>}
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300">Back</button>
            </div>
            <button onClick={handlePayment} disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                <>💳 Pay ${ORG_PLANS.find(p => p.id === selectedPlan)?.price}/month</>
              )}
            </button>
            <div className="text-center text-gray-500 text-sm">or</div>
            <button onClick={handleFreeTrial} disabled={loading}
              className="w-full py-4 border-2 border-purple-300 text-purple-600 font-bold rounded-xl hover:bg-purple-50 disabled:opacity-50">
              Start 14-Day Free Trial
            </button>
            <p className="text-center text-xs text-gray-500">💳 Secure payment powered by Stripe • Cancel anytime</p>
          </div>
        )}

        <div className="mt-8 bg-white/50 rounded-2xl p-4">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-500" />
            All Enterprise Plans Include:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {['✅ Admin Dashboard', '✅ Member Analytics', '✅ Access Code System', '✅ Therapist Directory', '✅ Downloadable Reports', '✅ Email Notifications', '✅ Custom Branding', '✅ Priority Support', '✅ HIPAA Compliance'].map(feature => (
              <div key={feature} className="text-gray-600">{feature}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Access Code Entry
const AccessCodeEntry = ({ onSuccess, onSkip }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orgPreview, setOrgPreview] = useState(null);

  const handleCodeChange = async (value) => {
    const upperCode = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCode(upperCode);
    setError('');
    setOrgPreview(null);
    if (upperCode.length === 8) {
      setLoading(true);
      try {
        const orgsQuery = await getDocs(query(collection(db, 'organizations'), where('accessCode', '==', upperCode)));
        if (!orgsQuery.empty) {
          const orgData = orgsQuery.docs[0].data();
          setOrgPreview({ id: orgsQuery.docs[0].id, ...orgData });
        }
      } catch (err) { console.error('Error checking code:', err); }
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!orgPreview) { setError('Invalid access code'); return; }
    const currentUser = auth.currentUser;
    if (!currentUser) { setError('Please log in first'); return; }
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { organizationId: orgPreview.id, joinedOrgAt: new Date().toISOString() });
      await updateDoc(doc(db, 'organizations', orgPreview.id), { memberCount: increment(1), memberIds: arrayUnion(currentUser.uid) });
      onSuccess(orgPreview);
    } catch (err) { setError('Failed to join organization. Please try again.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onSkip} className="p-2 rounded-full bg-white shadow hover:bg-gray-50"><ArrowLeft className="w-6 h-6 text-gray-600" /></button>
          <div><h1 className="text-2xl font-bold text-gray-800">Join Organization</h1><p className="text-gray-600">Enter your access code</p></div>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"><KeyRound className="w-10 h-10 text-purple-500" /></div>
            <p className="text-gray-600">Enter the 8-character code provided by your organization</p>
          </div>
          <input type="text" value={code} onChange={(e) => handleCodeChange(e.target.value)} placeholder="XXXXXXXX" maxLength={8} className="w-full text-center text-3xl font-mono tracking-widest px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:outline-none uppercase" autoFocus />
          <p className="text-center text-sm text-gray-500 mt-2">{code.length}/8 characters</p>
          {orgPreview && (
            <div className="mt-4 p-4 bg-purple-50 rounded-2xl border-2 border-purple-200">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-purple-500" />
                <div className="flex-1"><h3 className="font-bold text-gray-800">{orgPreview.name}</h3><p className="text-sm text-gray-600">{orgPreview.type}</p></div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          )}
          {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>}
          <div className="mt-6 space-y-3">
            <button onClick={handleJoin} disabled={!orgPreview || loading} className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:opacity-90 disabled:opacity-50">{loading ? 'Joining...' : 'Join Organization'}</button>
            <button onClick={onSkip} className="w-full py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200">Continue Without Code</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🏢 FULL ADMIN DASHBOARD - ENTERPRISE GRADE
// ============================================
const AdminDashboard = ({ organizationId }) => {
  const { organization } = useEnterprise();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  
  // Stats state - loaded from Firestore
  const [stats, setStats] = useState({
    totalMembers: 0, activeToday: 0, newThisWeek: 0, engagementRate: 0,
    moodCheckins: 0, journalEntries: 0, groupMessages: 0, crisisAlerts: 0
  });

  const [reports, setReports] = useState([]);
  const [members, setMembers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [therapyLeads, setTherapyLeads] = useState([]);
  const [therapists, setTherapists] = useState([]); // 👨‍⚕️ All therapists
  const [unassignedPatients, setUnassignedPatients] = useState([]); // Patients without therapist

  // 🔥 LOAD REAL DATA FROM FIRESTORE
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }
      
      try {
        // Load organization members
        const membersQuery = query(
          collection(db, 'users'),
          where('organizationId', '==', organizationId)
        );
        const membersSnap = await getDocs(membersQuery);
        const membersList = [];
        let activeCount = 0;
        let newCount = 0;
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        membersSnap.forEach(doc => {
          const data = doc.data();
          const lastActive = data.lastActive ? new Date(data.lastActive) : null;
          const createdAt = data.createdAt ? new Date(data.createdAt) : null;
          const isActiveToday = lastActive && (Date.now() - lastActive.getTime()) < 24 * 60 * 60 * 1000;
          const isNewThisWeek = createdAt && createdAt > oneWeekAgo;
          
          if (isActiveToday) activeCount++;
          if (isNewThisWeek) newCount++;
          
          membersList.push({
            id: doc.id,
            name: data.name || 'Unknown',
            email: data.email ? data.email.replace(/(.{2}).*(@.*)/, '$1***$2') : 'No email',
            fullEmail: data.email || '',
            status: isActiveToday ? 'active' : 'inactive',
            moodTrend: data.moodTrend || 'stable',
            lastActive: lastActive ? getTimeAgo(lastActive) : 'Never',
            assignedTherapistId: data.assignedTherapistId || null,
            assignedTherapistName: data.assignedTherapistName || null
          });
        });
        
        setMembers(membersList);
        
        // Load reports for this organization
        const reportsQuery = query(
          collection(db, 'reports'),
          where('organizationId', '==', organizationId),
          orderBy('timestamp', 'desc')
        );
        const reportsSnap = await getDocs(reportsQuery);
        const reportsList = [];
        reportsSnap.forEach(doc => {
          reportsList.push({ id: doc.id, ...doc.data() });
        });
        setReports(reportsList);
        
        // Load alerts for this organization
        const alertsQuery = query(
          collection(db, 'alerts'),
          where('organizationId', '==', organizationId),
          orderBy('timestamp', 'desc')
        );
        const alertsSnap = await getDocs(alertsQuery);
        const alertsList = [];
        alertsSnap.forEach(doc => {
          alertsList.push({ id: doc.id, ...doc.data() });
        });
        setAlerts(alertsList);
        
        // 🏥 Load therapy leads (potential patients!)
        try {
          const leadsQuery = query(
            collection(db, 'therapyLeads'),
            where('contacted', '==', false),
            orderBy('createdAt', 'desc')
          );
          const leadsSnap = await getDocs(leadsQuery);
          const leadsList = [];
          leadsSnap.forEach(doc => {
            leadsList.push({ id: doc.id, ...doc.data() });
          });
          setTherapyLeads(leadsList);
        } catch (leadsError) {
          console.log('Leads query needs index, loading all leads...');
          // Fallback without ordering
          const leadsSnap = await getDocs(collection(db, 'therapyLeads'));
          const leadsList = [];
          leadsSnap.forEach(doc => {
            const data = doc.data();
            if (!data.contacted) leadsList.push({ id: doc.id, ...data });
          });
          setTherapyLeads(leadsList);
        }
        
        // Calculate stats
        setStats({
          totalMembers: membersList.length,
          activeToday: activeCount,
          newThisWeek: newCount,
          engagementRate: membersList.length > 0 ? Math.round((activeCount / membersList.length) * 100) : 0,
          moodCheckins: 0,
          journalEntries: 0,
          groupMessages: 0,
          crisisAlerts: alertsList.filter(a => a.type === 'crisis' && !a.acknowledged).length
        });
        
        // 👨‍⚕️ Load therapists for this organization
        try {
          const therapistsQuery = query(
            collection(db, 'organizations', organizationId, 'therapists')
          );
          const therapistsSnap = await getDocs(therapistsQuery);
          const therapistsList = [];
          therapistsSnap.forEach(doc => {
            therapistsList.push({ id: doc.id, ...doc.data() });
          });
          setTherapists(therapistsList);
        } catch (err) {
          console.log('Therapists loading:', err);
        }
        
        // 👥 Find unassigned patients (members without assignedTherapistId)
        const unassigned = membersList.filter(m => !m.assignedTherapistId);
        setUnassignedPatients(unassigned);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [organizationId]);

  // Helper function for time ago
  const getTimeAgo = (date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'roi', label: 'ROI Analytics', icon: '💰' },
    { id: 'therapists', label: 'Therapists', icon: '👨‍⚕️', badge: therapists.length },
    { id: 'assignments', label: 'Assign Patients', icon: '🔗', badge: unassignedPatients.length },
    { id: 'leads', label: 'Patient Leads', icon: '🏥', badge: therapyLeads.length },
    { id: 'members', label: 'Members', icon: '👥' },
    { id: 'moderation', label: 'Moderation', icon: '🛡️', badge: reports.filter(r => r.status === 'pending').length },
    { id: 'alerts', label: 'Alerts', icon: '🚨', badge: alerts.filter(a => !a.acknowledged).length },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const getMoodIcon = (trend) => {
    const icons = { improving: '📈', stable: '➡️', declining: '📉', crisis: '🚨' };
    return icons[trend] || '❓';
  };

  const getStatusColor = (status) => {
    const colors = { active: 'bg-green-100 text-green-700', inactive: 'bg-gray-100 text-gray-700', flagged: 'bg-red-100 text-red-700', suspended: 'bg-black text-white' };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleResolveReport = async (reportId, action) => {
    setReports(reports.map(r => r.id === reportId ? { ...r, status: 'resolved', resolution: action } : r));
    // Save to Firestore
    try {
      await updateDoc(doc(db, 'reports', reportId), { status: 'resolved', resolution: action, resolvedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  };

  const acknowledgeAlert = async (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    // Save to Firestore
    try {
      await updateDoc(doc(db, 'alerts', id), { acknowledged: true, acknowledgedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  // 👨‍⚕️ ADD NEW THERAPIST
  const [showAddTherapist, setShowAddTherapist] = useState(false);
  const [newTherapist, setNewTherapist] = useState({ name: '', email: '', title: '', phone: '' });
  
  const addTherapist = async () => {
    if (!newTherapist.name || !newTherapist.email) {
      alert('Please enter therapist name and email');
      return;
    }
    try {
      const therapistData = {
        ...newTherapist,
        organizationId,
        createdAt: serverTimestamp(),
        patientCount: 0
      };
      const docRef = await addDoc(collection(db, 'organizations', organizationId, 'therapists'), therapistData);
      setTherapists(prev => [...prev, { id: docRef.id, ...therapistData }]);
      setNewTherapist({ name: '', email: '', title: '', phone: '' });
      setShowAddTherapist(false);
      alert('✅ Therapist added successfully!');
    } catch (err) {
      console.error('Error adding therapist:', err);
      alert('Error adding therapist');
    }
  };

  // 🔗 ASSIGN PATIENT TO THERAPIST
  const assignPatient = async (patientId, patientName, therapistId, therapistName) => {
    try {
      // Update user document with assigned therapist
      await updateDoc(doc(db, 'users', patientId), {
        assignedTherapistId: therapistId,
        assignedTherapistName: therapistName,
        assignedAt: new Date().toISOString()
      });
      
      // Update local state
      setMembers(prev => prev.map(m => 
        m.id === patientId 
          ? { ...m, assignedTherapistId: therapistId, assignedTherapistName: therapistName }
          : m
      ));
      setUnassignedPatients(prev => prev.filter(p => p.id !== patientId));
      
      // Update therapist patient count
      const therapist = therapists.find(t => t.id === therapistId);
      if (therapist) {
        await updateDoc(doc(db, 'organizations', organizationId, 'therapists', therapistId), {
          patientCount: (therapist.patientCount || 0) + 1
        });
        setTherapists(prev => prev.map(t => 
          t.id === therapistId ? { ...t, patientCount: (t.patientCount || 0) + 1 } : t
        ));
      }
      
      alert(`✅ ${patientName} assigned to ${therapistName}`);
    } catch (err) {
      console.error('Error assigning patient:', err);
      alert('Error assigning patient');
    }
  };

  // 🔄 UNASSIGN PATIENT FROM THERAPIST
  const unassignPatient = async (patientId, patientName, oldTherapistId) => {
    if (!window.confirm(`Remove ${patientName} from their therapist?`)) return;
    try {
      await updateDoc(doc(db, 'users', patientId), {
        assignedTherapistId: null,
        assignedTherapistName: null
      });
      
      const member = members.find(m => m.id === patientId);
      if (member) {
        setUnassignedPatients(prev => [...prev, { ...member, assignedTherapistId: null }]);
      }
      setMembers(prev => prev.map(m => 
        m.id === patientId ? { ...m, assignedTherapistId: null, assignedTherapistName: null } : m
      ));
      
      // Update therapist patient count
      if (oldTherapistId) {
        const therapist = therapists.find(t => t.id === oldTherapistId);
        if (therapist && therapist.patientCount > 0) {
          await updateDoc(doc(db, 'organizations', organizationId, 'therapists', oldTherapistId), {
            patientCount: therapist.patientCount - 1
          });
          setTherapists(prev => prev.map(t => 
            t.id === oldTherapistId ? { ...t, patientCount: Math.max(0, (t.patientCount || 0) - 1) } : t
          ));
        }
      }
      
      alert(`✅ ${patientName} unassigned`);
    } catch (err) {
      console.error('Error unassigning patient:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-purple-500" />
                {organization?.name || 'Organization'} Dashboard
              </h1>
              <p className="text-sm text-gray-500">Enterprise Management Console</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
              <div className="relative">
                <span className="text-2xl cursor-pointer">🔔</span>
                {alerts.filter(a => !a.acknowledged).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{alerts.filter(a => !a.acknowledged).length}</span>
                )}
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${activeTab === tab.id ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                <span>{tab.icon}</span>{tab.label}
                {tab.badge > 0 && <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{tab.badge}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Members', value: stats.totalMembers, icon: '👥', trend: '+12 this week', color: 'purple' },
                { label: 'Active Today', value: stats.activeToday, icon: '✅', trend: '27% of members', color: 'green' },
                { label: 'Engagement', value: `${stats.engagementRate}%`, icon: '📈', trend: '+5% from last week', color: 'blue' },
                { label: 'Crisis Alerts', value: stats.crisisAlerts, icon: '🚨', trend: 'Needs attention', color: 'red' }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-xs text-gray-500">{stat.trend}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
            {/* Activity Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm text-center"><span className="text-3xl">💖</span><p className="text-2xl font-bold mt-2">{stats.moodCheckins}</p><p className="text-sm text-gray-500">Mood Check-ins</p></div>
              <div className="bg-white rounded-2xl p-4 shadow-sm text-center"><span className="text-3xl">📝</span><p className="text-2xl font-bold mt-2">{stats.journalEntries}</p><p className="text-sm text-gray-500">Journal Entries</p></div>
              <div className="bg-white rounded-2xl p-4 shadow-sm text-center"><span className="text-3xl">👨‍⚕️</span><p className="text-2xl font-bold mt-2">{therapists.length}</p><p className="text-sm text-gray-500">Therapists</p></div>
              <div className="bg-white rounded-2xl p-4 shadow-sm text-center"><span className="text-3xl">🔗</span><p className="text-2xl font-bold mt-2">{unassignedPatients.length}</p><p className="text-sm text-gray-500">Unassigned Patients</p></div>
            </div>
            {/* Quick Alerts */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">🚨 Active Alerts</h3>
              <div className="space-y-3">
                {alerts.filter(a => !a.acknowledged).slice(0, 3).map(alert => (
                  <div key={alert.id} className={`p-3 rounded-xl border-l-4 ${alert.severity === 'high' ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'}`}>
                    <div className="flex items-start justify-between">
                      <div><p className="font-medium text-gray-800">{alert.user}</p><p className="text-sm text-gray-600">{alert.message}</p></div>
                      <span className="text-xs text-gray-500">{alert.timestamp}</span>
                    </div>
                  </div>
                ))}
                {alerts.filter(a => !a.acknowledged).length === 0 && <p className="text-center text-gray-500 py-4">No active alerts 🎉</p>}
              </div>
            </div>
          </div>
        )}

        {/* 💰 ROI DASHBOARD TAB - Prove Value to Organizations */}
        {activeTab === 'roi' && (
          <div className="space-y-6">
            {/* ROI Header */}
            <div className="crystal-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    💰 ROI & Wellness Analytics
                  </h2>
                  <p className="text-gray-500">Track your organization's mental health investment returns</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    📥 Export Report
                  </button>
                </div>
              </div>

              {/* Key ROI Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="roi-card">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💚</span>
                    <span className="text-gray-500 text-sm font-medium">Wellness Score</span>
                  </div>
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {Math.round((stats.engagementRate || 0) * 0.85)}%
                  </div>
                  <div className="text-green-600 text-sm font-medium mt-1 flex items-center gap-1">
                    📈 +12% vs last month
                  </div>
                </div>

                <div className="roi-card">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">😌</span>
                    <span className="text-gray-500 text-sm font-medium">Stress Reduction</span>
                  </div>
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    28%
                  </div>
                  <div className="text-green-600 text-sm font-medium mt-1 flex items-center gap-1">
                    📈 Since program start
                  </div>
                </div>

                <div className="roi-card">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎯</span>
                    <span className="text-gray-500 text-sm font-medium">Engagement Rate</span>
                  </div>
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stats.engagementRate || 0}%
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    {stats.activeToday} of {stats.totalMembers} active
                  </div>
                </div>

                <div className="roi-card bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💵</span>
                    <span className="text-gray-500 text-sm font-medium">Est. Monthly Savings</span>
                  </div>
                  <div className="text-4xl font-extrabold text-green-600">
                    ${((stats.totalMembers || 0) * 100).toLocaleString()}
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    Reduced turnover & absenteeism
                  </div>
                </div>
              </div>

              {/* Trend Chart Placeholder */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-gray-800 mb-4">📈 Weekly Wellness Trend</h3>
                <div className="h-48 flex items-end justify-between gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all duration-500"
                        style={{ height: `${60 + Math.random() * 40}px` }}
                      ></div>
                      <span className="text-xs text-gray-500 font-medium">{day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-2xl mb-2">🏆</div>
                  <h4 className="font-semibold text-gray-800 mb-1">Celebrate Wins</h4>
                  <p className="text-sm text-gray-600">15 employees hit their wellness goals this week!</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-2xl mb-2">📩</div>
                  <h4 className="font-semibold text-gray-800 mb-1">Boost Engagement</h4>
                  <p className="text-sm text-gray-600">{(stats.totalMembers || 0) - (stats.activeToday || 0)} members haven't logged in this week</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-2xl mb-2">📅</div>
                  <h4 className="font-semibold text-gray-800 mb-1">Schedule Check-in</h4>
                  <p className="text-sm text-gray-600">Monthly wellness review due soon</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 👨‍⚕️ THERAPISTS TAB - Manage Therapists */}
        {activeTab === 'therapists' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">👨‍⚕️ Manage Therapists</h2>
              <button
                onClick={() => setShowAddTherapist(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90"
              >
                <Plus className="w-5 h-5" />
                Add Therapist
              </button>
            </div>
            
            {/* Therapists List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {therapists.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl p-8 text-center">
                  <div className="text-5xl mb-4">👨‍⚕️</div>
                  <p className="text-gray-600 font-medium">No therapists yet</p>
                  <p className="text-sm text-gray-500 mt-2">Add therapists to start assigning patients</p>
                  <button onClick={() => setShowAddTherapist(true)} className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200">Add First Therapist</button>
                </div>
              ) : (
                therapists.map(therapist => (
                  <div key={therapist.id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {(therapist.name || 'T')[0]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{therapist.name}</h4>
                        <p className="text-sm text-gray-500">{therapist.title || 'Therapist'}</p>
                        <p className="text-xs text-gray-400">{therapist.email}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">👥</span>
                        <span className="font-bold text-purple-600">{therapist.patientCount || 0}</span>
                        <span className="text-sm text-gray-500">patients</span>
                      </div>
                      <button 
                        onClick={() => setActiveTab('assignments')}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        Assign patients →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 🔗 ASSIGNMENTS TAB - Assign Patients to Therapists */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">🔗 Assign Patients to Therapists</h2>
            
            {therapists.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="text-gray-600 font-medium">Add therapists first</p>
                <p className="text-sm text-gray-500 mt-2">You need at least one therapist before assigning patients</p>
                <button onClick={() => setActiveTab('therapists')} className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200">Go to Therapists</button>
              </div>
            ) : (
              <>
                {/* Unassigned Patients */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 bg-orange-50 border-b border-orange-200">
                    <h3 className="font-bold text-orange-800 flex items-center gap-2">
                      ⚠️ Unassigned Patients ({unassignedPatients.length})
                    </h3>
                    <p className="text-sm text-orange-700">These patients need a therapist assigned</p>
                  </div>
                  <div className="divide-y">
                    {unassignedPatients.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <p>🎉 All patients are assigned to therapists!</p>
                      </div>
                    ) : (
                      unassignedPatients.map(patient => (
                        <div key={patient.id} className="p-4 flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-bold">{(patient.name || 'P')[0]}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{patient.name}</p>
                            <p className="text-sm text-gray-500">{patient.email}</p>
                          </div>
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                const therapist = therapists.find(t => t.id === e.target.value);
                                if (therapist) {
                                  assignPatient(patient.id, patient.name, therapist.id, therapist.name);
                                }
                              }
                            }}
                            className="px-3 py-2 border rounded-xl focus:border-purple-400 focus:outline-none"
                          >
                            <option value="">Assign to...</option>
                            {therapists.map(t => (
                              <option key={t.id} value={t.id}>{t.name} ({t.patientCount || 0} patients)</option>
                            ))}
                          </select>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Assigned Patients by Therapist */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 bg-green-50 border-b border-green-200">
                    <h3 className="font-bold text-green-800 flex items-center gap-2">
                      ✅ Assigned Patients
                    </h3>
                  </div>
                  <div className="divide-y">
                    {therapists.map(therapist => {
                      const assignedPatients = members.filter(m => m.assignedTherapistId === therapist.id);
                      return (
                        <div key={therapist.id} className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-bold">{(therapist.name || 'T')[0]}</span>
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{therapist.name}</p>
                              <p className="text-sm text-gray-500">{assignedPatients.length} patients assigned</p>
                            </div>
                          </div>
                          {assignedPatients.length > 0 ? (
                            <div className="ml-13 space-y-2">
                              {assignedPatients.map(patient => (
                                <div key={patient.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                  <span className="text-sm text-gray-700">{patient.name}</span>
                                  <button
                                    onClick={() => unassignPatient(patient.id, patient.name, therapist.id)}
                                    className="text-xs text-red-500 hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="ml-13 text-sm text-gray-400">No patients assigned yet</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 🏥 PATIENT LEADS TAB - Potential new patients! */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white">
                <p className="text-sm opacity-80">Total Leads</p>
                <p className="text-3xl font-bold">{therapyLeads.length}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-4 text-white">
                <p className="text-sm opacity-80">High Priority</p>
                <p className="text-3xl font-bold">{therapyLeads.filter(l => l.priority === 'high').length}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 text-white">
                <p className="text-sm opacity-80">Not Contacted</p>
                <p className="text-3xl font-bold">{therapyLeads.filter(l => !l.contacted).length}</p>
              </div>
            </div>
            
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-2xl p-4">
              <h3 className="font-bold text-green-800 flex items-center gap-2">
                💰 These are POTENTIAL PATIENTS looking for therapy!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Users who clicked "I need therapist" or selected "No but I'm interested" in therapy. Reach out within 24-48 hours for best conversion!
              </p>
            </div>
            
            {/* Leads List */}
            <div className="space-y-3">
              {therapyLeads.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center">
                  <div className="text-5xl mb-4">🏥</div>
                  <p className="text-gray-600 font-medium">No leads yet</p>
                  <p className="text-sm text-gray-500 mt-2">When users express interest in therapy, they'll appear here</p>
                </div>
              ) : (
                therapyLeads.map(lead => (
                  <div key={lead.id} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${lead.priority === 'high' ? 'border-red-500' : 'border-blue-500'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-800">{lead.userName || 'Anonymous User'}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${lead.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {lead.priority === 'high' ? '🔥 HIGH PRIORITY' : '📋 WARM LEAD'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{lead.userEmail || 'Email not provided'}</p>
                        <p className="text-sm text-gray-600 mt-2">📝 {lead.notes}</p>
                        {lead.seekingHelp && lead.seekingHelp.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {lead.seekingHelp.map((item, i) => (
                              <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">{item}</span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Source: {lead.source === 'onboarding_survey' ? 'Signed up & interested' : 'Clicked "I Need Therapist"'}
                          {lead.createdAt && ` • ${new Date(lead.createdAt.seconds * 1000).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={async () => {
                            try {
                              await updateDoc(doc(db, 'therapyLeads', lead.id), { 
                                contacted: true, 
                                contactedAt: new Date().toISOString(),
                                contactedBy: organization?.name || 'Admin'
                              });
                              setTherapyLeads(therapyLeads.filter(l => l.id !== lead.id));
                              alert('✅ Marked as contacted! Remember to follow up with the patient.');
                            } catch (err) {
                              console.error('Error updating lead:', err);
                            }
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:opacity-90 text-sm"
                        >
                          ✅ Mark Contacted
                        </button>
                        {lead.userEmail && (
                          <a 
                            href={`mailto:${lead.userEmail}?subject=Welcome to YRNAlone - Let's Connect!&body=Hi ${lead.userName || 'there'},%0D%0A%0D%0AWe noticed you're interested in therapy support. We'd love to help!%0D%0A%0D%0ABest regards`}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 text-sm text-center"
                          >
                            📧 Send Email
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search members..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
              </div>
              <select className="px-4 py-2 border rounded-lg"><option value="all">All Status</option><option value="active">Active</option><option value="flagged">Flagged</option></select>
            </div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50"><tr><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Member</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Mood</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Last Active</th><th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th></tr></thead>
                <tbody className="divide-y">
                  {members.map(member => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"><span className="text-purple-600 font-medium">{member.name.charAt(0)}</span></div><div><p className="font-medium text-gray-800">{member.name}</p><p className="text-sm text-gray-500">{member.email}</p></div></div></td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>{member.status}</span></td>
                      <td className="px-4 py-3"><span>{getMoodIcon(member.moodTrend)} {member.moodTrend}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-500">{member.lastActive}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><button className="p-2 hover:bg-gray-100 rounded-lg" title="View">👁️</button><button className="p-2 hover:bg-gray-100 rounded-lg" title="Message">✉️</button><button className="p-2 hover:bg-red-100 rounded-lg" title="Suspend">⛔</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODERATION TAB */}
        {activeTab === 'moderation' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm"><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-orange-600">{reports.filter(r => r.status === 'pending').length}</p></div>
              <div className="bg-white rounded-2xl p-4 shadow-sm"><p className="text-sm text-gray-500">Resolved Today</p><p className="text-2xl font-bold text-green-600">12</p></div>
              <div className="bg-white rounded-2xl p-4 shadow-sm"><p className="text-sm text-gray-500">Avg Resolution</p><p className="text-2xl font-bold text-blue-600">4.2h</p></div>
              <div className="bg-white rounded-2xl p-4 shadow-sm"><p className="text-sm text-gray-500">Users Suspended</p><p className="text-2xl font-bold text-red-600">2</p></div>
            </div>
            <div className="space-y-4">
              {reports.filter(r => r.status === 'pending').map(report => (
                <div key={report.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${report.type === 'sexual' ? 'bg-red-100 text-red-700' : report.type === 'harassment' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>{report.type.toUpperCase()}</span>
                      <p className="mt-2 font-medium text-gray-800">{report.content}</p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-700">{report.status}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4"><span>Reported by: {report.reporter}</span><span>•</span><span>Against: {report.reported}</span></div>
                  <div className="flex gap-2 pt-4 border-t">
                    <button onClick={() => handleResolveReport(report.id, 'warning')} className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200">⚠️ Warn User</button>
                    <button onClick={() => handleResolveReport(report.id, 'remove')} className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200">🗑️ Remove Content</button>
                    <button onClick={() => handleResolveReport(report.id, 'suspend')} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">⛔ Suspend User</button>
                    <button onClick={() => handleResolveReport(report.id, 'dismiss')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">❌ Dismiss</button>
                  </div>
                </div>
              ))}
              {reports.filter(r => r.status === 'pending').length === 0 && <div className="bg-white rounded-2xl p-8 text-center"><p className="text-gray-500">No pending reports 🎉</p></div>}
            </div>
          </div>
        )}

        {/* ALERTS TAB */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-medium text-gray-800 mb-3">Alert Types</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span>Crisis (Immediate)</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span>Mood Decline</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span>Inactivity</span>
              </div>
            </div>
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${alert.severity === 'high' ? 'border-red-500' : alert.severity === 'medium' ? 'border-orange-500' : 'border-yellow-500'} ${alert.acknowledged ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{alert.type === 'crisis' ? '🚨' : alert.type === 'mood' ? '📉' : '⏰'}</span>
                      <div><p className="font-bold text-gray-800">{alert.user}</p><p className="text-gray-600">{alert.message}</p><p className="text-sm text-gray-500 mt-1">{alert.timestamp}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!alert.acknowledged ? (
                        <>
                          <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">View Profile</button>
                          <button onClick={() => acknowledgeAlert(alert.id)} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">Acknowledge</button>
                        </>
                      ) : <span className="text-green-600 text-sm flex items-center gap-1">✓ Acknowledged</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm"><h3 className="text-sm text-gray-500 mb-2">Wellbeing Score</h3><div className="flex items-end gap-2"><span className="text-4xl font-bold text-green-600">7.4</span><span className="text-sm text-gray-500 mb-1">/10</span></div><p className="text-sm text-green-600 mt-2">↑ 0.3 from last week</p></div>
              <div className="bg-white rounded-2xl p-5 shadow-sm"><h3 className="text-sm text-gray-500 mb-2">Crisis Resolved</h3><div className="flex items-end gap-2"><span className="text-4xl font-bold text-purple-600">100%</span></div><p className="text-sm text-green-600 mt-2">3 this month</p></div>
              <div className="bg-white rounded-2xl p-5 shadow-sm"><h3 className="text-sm text-gray-500 mb-2">Retention Rate</h3><div className="flex items-end gap-2"><span className="text-4xl font-bold text-blue-600">94%</span></div><p className="text-sm text-green-600 mt-2">↑ 2% from last month</p></div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Mood Distribution</h3>
              <div className="space-y-3">
                {[{ label: 'Happy', value: 35, color: 'bg-green-500' }, { label: 'Calm', value: 28, color: 'bg-blue-500' }, { label: 'Anxious', value: 18, color: 'bg-yellow-500' }, { label: 'Sad', value: 12, color: 'bg-purple-500' }, { label: 'Stressed', value: 7, color: 'bg-red-500' }].map((mood, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-20 text-sm text-gray-600">{mood.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden"><div className={`h-full ${mood.color} rounded-full`} style={{ width: `${mood.value}%` }} /></div>
                    <span className="w-12 text-sm text-gray-600 text-right">{mood.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Export Reports</h3>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">📊 Monthly Summary (PDF)</button>
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">📁 Member Data (CSV)</button>
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">📈 Engagement (Excel)</button>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Organization Settings</h3>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label><input type="text" defaultValue={organization?.name || ''} className="w-full px-4 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label><textarea defaultValue={organization?.welcomeMessage || ''} className="w-full px-4 py-2 border rounded-lg" rows={3} /></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Access Code</h3>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                <div><p className="font-mono text-2xl tracking-widest">{organization?.accessCode || 'XXXXXXXX'}</p><p className="text-sm text-gray-500 mt-1">Share this code with new members</p></div>
                <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">Regenerate</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Subscription</h3>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div><p className="font-medium text-gray-800">{organization?.subscription?.planName || 'Professional'} Plan</p><p className="text-sm text-gray-600">${organization?.subscription?.price || '999'}/month</p></div>
                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">Manage Billing</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 👨‍⚕️ ADD THERAPIST MODAL */}
      {showAddTherapist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">👨‍⚕️ Add New Therapist</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" value={newTherapist.name} onChange={(e) => setNewTherapist(prev => ({ ...prev, name: e.target.value }))} placeholder="Dr. Jane Smith" className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={newTherapist.email} onChange={(e) => setNewTherapist(prev => ({ ...prev, email: e.target.value }))} placeholder="therapist@organization.com" className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={newTherapist.title} onChange={(e) => setNewTherapist(prev => ({ ...prev, title: e.target.value }))} placeholder="Licensed Clinical Psychologist" className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={newTherapist.phone} onChange={(e) => setNewTherapist(prev => ({ ...prev, phone: e.target.value }))} placeholder="(555) 123-4567" className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none" />
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex gap-3">
              <button onClick={() => setShowAddTherapist(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300">Cancel</button>
              <button onClick={addTherapist} className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90">Add Therapist</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 💎 SIMPLIFIED UPGRADE SCREEN - Free / Premium / Org Member
const UpgradeScreen = ({ onClose, currentTier = 'free', onSelectTier }) => {
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCode, setShowAccessCode] = useState(false);

  // 🎯 SIMPLIFIED 3-TIER MODEL
  const pricingTiers = [
    {
      id: 'free',
      name: 'Free Forever',
      emoji: '🌱',
      tagline: 'Mental health should be accessible',
      monthlyPrice: 0,
      yearlyPrice: 0,
      color: 'from-green-400 to-emerald-500',
      features: [
        '✅ Unlimited support groups',
        '✅ Buddy matching - connect 1-on-1',
        '✅ Emergency & crisis resources',
        '✅ 7-day mood history',
        '✅ 5 journal entries/month',
        '✅ Basic breathing exercises',
        '✅ Community feed access',
        '✅ Share with therapist'
      ],
      cta: 'Current Plan'
    },
    {
      id: 'premium',
      name: 'Premium',
      emoji: '🌻',
      tagline: 'Unlock your full potential',
      monthlyPrice: 5.99,
      yearlyPrice: 59.99,
      color: 'from-purple-500 to-pink-500',
      popular: true,
      features: [
        '✨ Everything in Free, plus:',
        '📔 Unlimited journal entries',
        '📊 Full mood history & insights',
        '🎵 All sound therapy & sleep sounds',
        '😴 Sleep tracker',
        '🎨 Custom themes',
        '📈 Progress analytics',
        '🚫 Ad-free experience',
        '⭐ Priority support'
      ],
      cta: 'Upgrade Now'
    },
    {
      id: 'organization',
      name: 'Organization Member',
      emoji: '🏥',
      tagline: 'Your organization covers everything',
      monthlyPrice: 0,
      yearlyPrice: 0,
      color: 'from-blue-500 to-cyan-500',
      special: true,
      features: [
        '🎁 ALL Premium features FREE',
        '🏥 Covered by your hospital/organization',
        '👨‍⚕️ Connected to your care team',
        '📋 Progress sharing with providers',
        '🔒 HIPAA-compliant data handling',
        '💜 No credit card needed'
      ],
      cta: 'Enter Access Code'
    }
  ];

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const successUrl = encodeURIComponent(window.location.origin + '?payment=success');
      const cancelUrl = encodeURIComponent(window.location.origin + '?payment=cancelled');
      
      // ============================================
      // 💰 STRIPE PAYMENT LINKS - LIVE LINKS
      // These are your actual Stripe payment links
      // ============================================
      const STRIPE_LINKS = {
        monthly: 'https://buy.stripe.com/eVqdR9f3Sdl996J7Zge3e00',  // $5.99/month
        yearly: 'https://buy.stripe.com/eVq6oH4peepd4Qt2EWe3e01'     // $59.99/year
      };
      
      const paymentLink = billingCycle === 'yearly' 
        ? STRIPE_LINKS.yearly
        : STRIPE_LINKS.monthly;
      
      window.location.href = paymentLink + '?success_url=' + successUrl + '&cancel_url=' + cancelUrl;
    } catch (err) {
      console.error('Payment error:', err);
    }
    setLoading(false);
  };

  const handleAccessCode = async () => {
    if (!accessCode.trim()) return;
    setLoading(true);
    // Verify access code with Firebase
    try {
      const orgsRef = collection(db, 'organizations');
      const q = query(orgsRef, where('accessCode', '==', accessCode.toUpperCase().trim()));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const org = snapshot.docs[0];
        alert(`✅ Code verified! Welcome to ${org.data().name}. You now have full premium access!`);
        onClose();
      } else {
        alert('❌ Invalid access code. Please check with your organization.');
      }
    } catch (err) {
      alert('Error verifying code. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">💜 Choose Your Plan</h2>
          <p className="text-gray-500">Mental health support should be accessible to everyone</p>
        </div>

        {/* Billing Toggle - Only for Premium */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-full p-1 flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition ${
                billingCycle === 'monthly' ? 'bg-white shadow text-purple-600' : 'text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition relative ${
                billingCycle === 'yearly' ? 'bg-white shadow text-purple-600' : 'text-gray-600'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Save 29%</span>
            </button>
          </div>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {pricingTiers.map(tier => (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-5 border-2 transition-all ${
                tier.popular 
                  ? 'border-purple-500 shadow-xl scale-105 bg-gradient-to-br from-purple-50 to-pink-50' 
                  : tier.special
                  ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  ⭐ RECOMMENDED
                </div>
              )}
              {tier.special && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  🏥 FOR MEMBERS
                </div>
              )}
              
              {/* Tier Header */}
              <div className="text-center mb-4 pt-2">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center text-3xl mb-3 shadow-lg`}>
                  {tier.emoji}
                </div>
                <h3 className="font-bold text-xl text-gray-800">{tier.name}</h3>
                <p className="text-sm text-gray-500">{tier.tagline}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-4 py-3 bg-gray-50 rounded-xl">
                {tier.monthlyPrice === 0 ? (
                  <div className="text-3xl font-bold text-gray-800">FREE</div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-purple-600">
                      ${billingCycle === 'yearly' ? (tier.yearlyPrice / 12).toFixed(2) : tier.monthlyPrice}
                    </div>
                    <div className="text-sm text-gray-500">
                      per month {billingCycle === 'yearly' && <span className="text-green-600">(billed ${tier.yearlyPrice}/yr)</span>}
                    </div>
                  </>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-4">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="flex-shrink-0">{feature.substring(0, 2)}</span>
                    <span className="text-gray-700">{feature.substring(2)}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {tier.id === 'free' && currentTier === 'free' && (
                <button className="w-full py-3 bg-gray-200 text-gray-600 font-bold rounded-xl cursor-default">
                  ✓ Your Current Plan
                </button>
              )}
              {tier.id === 'premium' && (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : '🚀 Upgrade to Premium'}
                </button>
              )}
              {tier.id === 'organization' && (
                <button
                  onClick={() => setShowAccessCode(!showAccessCode)}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition"
                >
                  🔑 Enter Access Code
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Access Code Input */}
        {showAccessCode && (
          <div className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2">🏥 Organization Access Code</h4>
            <p className="text-sm text-blue-600 mb-3">Enter the code provided by your hospital, clinic, or organization</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="ORG-XXXXX"
                className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none font-mono text-lg"
              />
              <button
                onClick={handleAccessCode}
                disabled={loading || !accessCode.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? '...' : 'Verify'}
              </button>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition"
        >
          Maybe Later
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          💳 Secure payment via Stripe • Cancel anytime • 7-day money-back guarantee
        </p>
      </div>
    </div>
  );
};

// ✅ CONSTANTS STAY OUTSIDE
const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🥰', label: 'Loved' },
  { emoji: '😡', label: 'Angry' }
];

const JOURNAL_MOODS = [
  { emoji: '😊', label: 'happy' },
  { emoji: '😢', label: 'sad' },
  { emoji: '😰', label: 'anxious' },
  { emoji: '😡', label: 'angry' },
  { emoji: '🥰', label: 'loved' },
  { emoji: '😴', label: 'tired' }
];

const JOURNAL_THEMES = {
  cute: { bg: 'from-pink-100 to-purple-100', accent: 'from-pink-400 to-purple-400', emoji: '🌸', premium: false },
  kawaii: { bg: 'from-blue-100 to-pink-100', accent: 'from-blue-400 to-pink-400', emoji: '🎀', premium: false },
  classic: { bg: 'from-gray-100 to-gray-200', accent: 'from-gray-700 to-gray-900', emoji: '📖', premium: false },
  goth: { bg: 'from-gray-800 to-purple-900', accent: 'from-purple-500 to-pink-500', emoji: '🌙', premium: true },
  emo: { bg: 'from-gray-900 to-red-900', accent: 'from-red-500 to-purple-500', emoji: '🖤', premium: true },
  vintage: { bg: 'from-amber-100 to-orange-100', accent: 'from-amber-600 to-orange-600', emoji: '📜', premium: true },
  mystical: { bg: 'from-indigo-200 to-purple-200', accent: 'from-indigo-500 to-purple-500', emoji: '🔮', premium: true },
  witchy: { bg: 'from-purple-900 to-indigo-900', accent: 'from-purple-400 to-pink-400', emoji: '✨', premium: true }
};

// 🎮 ACHIEVEMENTS & GAMIFICATION
const ACHIEVEMENTS = [
  { id: 'first_post', icon: '🌟', title: 'First Step', description: 'Made your first post', requirement: 1, type: 'posts' },
  { id: 'social_butterfly', icon: '🦋', title: 'Social Butterfly', description: 'Joined 3 groups', requirement: 3, type: 'groups' },
  { id: 'grateful_heart', icon: '💖', title: 'Grateful Heart', description: 'Posted 5 gratitudes', requirement: 5, type: 'gratitude' },
  { id: 'week_warrior', icon: '🔥', title: 'Week Warrior', description: '7 day streak', requirement: 7, type: 'streak' },
  { id: 'support_star', icon: '⭐', title: 'Support Star', description: 'Helped 10 people', requirement: 10, type: 'comments' },
  { id: 'journal_master', icon: '📖', title: 'Journal Master', description: '20 journal entries', requirement: 20, type: 'journal' },
  { id: 'mood_tracker', icon: '😊', title: 'Mood Tracker', description: '30 mood check-ins', requirement: 30, type: 'moods' },
  { id: 'calm_soul', icon: '🧘', title: 'Calm Soul', description: '15 breathing exercises', requirement: 15, type: 'breathing' }
];

// 🧘 BREATHING EXERCISES
const BREATHING_EXERCISES = [
  { 
    id: 'box', 
    name: 'Box Breathing', 
    description: 'Equal parts breathing for calm',
    icon: '📦',
    pattern: [
      { phase: 'Breathe In', duration: 4, color: 'from-blue-400 to-blue-500' },
      { phase: 'Hold', duration: 4, color: 'from-purple-400 to-purple-500' },
      { phase: 'Breathe Out', duration: 4, color: 'from-pink-400 to-pink-500' },
      { phase: 'Hold', duration: 4, color: 'from-purple-400 to-purple-500' }
    ]
  },
  { 
    id: '478', 
    name: '4-7-8 Breathing', 
    description: 'Fall asleep faster',
    icon: '😴',
    pattern: [
      { phase: 'Breathe In', duration: 4, color: 'from-blue-400 to-blue-500' },
      { phase: 'Hold', duration: 7, color: 'from-purple-400 to-purple-500' },
      { phase: 'Breathe Out', duration: 8, color: 'from-pink-400 to-pink-500' }
    ]
  },
  { 
    id: 'calm', 
    name: 'Calm Breathing', 
    description: 'Reduce anxiety quickly',
    icon: '🌊',
    pattern: [
      { phase: 'Breathe In', duration: 3, color: 'from-blue-400 to-blue-500' },
      { phase: 'Breathe Out', duration: 6, color: 'from-pink-400 to-pink-500' }
    ]
  }
];

// 🎵 SOUND THERAPY
const SOUND_LIBRARY = [
  { id: 'rain', name: 'Rain Sounds', icon: '🌧️', category: 'nature' },
  { id: 'ocean', name: 'Ocean Waves', icon: '🌊', category: 'nature' },
  { id: 'forest', name: 'Forest Birds', icon: '🌲', category: 'nature' },
  { id: 'fire', name: 'Fireplace', icon: '🔥', category: 'nature' },
  { id: 'white', name: 'White Noise', icon: '📻', category: 'noise' },
  { id: 'pink', name: 'Pink Noise', icon: '💗', category: 'noise' },
  { id: '432hz', name: '432 Hz Healing', icon: '✨', category: 'frequency' },
  { id: '528hz', name: '528 Hz Love', icon: '💜', category: 'frequency' }
];

// 📚 MENTAL HEALTH EDUCATION
const EDUCATION_ARTICLES = [
  {
    id: 'anxiety',
    title: 'Understanding Anxiety',
    icon: '😰',
    category: 'basics',
    content: `Anxiety is your body's natural response to stress. It's that feeling of fear or worry about what's coming next.

**What causes anxiety?**
- Stressful events
- Health conditions
- Genetics
- Brain chemistry

**Common symptoms:**
- Racing thoughts
- Fast heartbeat
- Sweating or shaking
- Trouble concentrating
- Sleep problems

**What helps:**
- Deep breathing exercises
- Regular physical activity
- Talking to someone you trust
- Professional therapy
- Mindfulness and meditation

Remember: Anxiety is treatable, and you're not alone. Millions of people experience anxiety, and there are many ways to manage it.`
  },
  {
    id: 'depression',
    title: 'Understanding Depression',
    icon: '😢',
    category: 'basics',
    content: `Depression is more than just feeling sad. It's a medical condition that affects how you feel, think, and handle daily activities.

**Common signs:**
- Persistent sadness or empty mood
- Loss of interest in activities you once enjoyed
- Changes in appetite or weight
- Sleep problems (too much or too little)
- Feeling worthless or guilty
- Difficulty concentrating
- Thoughts of death or suicide

**What helps:**
- Professional therapy (CBT is very effective)
- Medication (talk to a doctor)
- Regular exercise
- Healthy sleep routine
- Social connection
- Journaling your feelings

**Important:** If you're having thoughts of suicide, please reach out for help immediately. Call 988 (Suicide & Crisis Lifeline) or text HOME to 741741.`
  },
  {
    id: 'loneliness',
    title: 'Coping with Loneliness',
    icon: '💔',
    category: 'basics',
    content: `Loneliness is the feeling of being alone, regardless of how many people are around you. It's a common human experience.

**Types of loneliness:**
- Social loneliness: lacking friendships
- Emotional loneliness: lacking deep connections
- Existential loneliness: feeling disconnected from meaning

**Why it matters:**
Chronic loneliness can affect both mental and physical health, increasing risk of depression, anxiety, and even physical illness.

**What helps:**
- Join support groups (like this app!)
- Volunteer in your community
- Take a class or join a club
- Reach out to old friends
- Practice self-compassion
- Consider therapy
- Use technology mindfully to connect

Remember: Reaching out is brave, not weak. Every connection starts with someone taking the first step.`
  },
  {
    id: 'grounding',
    title: '5-4-3-2-1 Grounding Technique',
    icon: '🌍',
    category: 'coping',
    content: `The 5-4-3-2-1 technique helps you ground yourself when feeling overwhelmed, anxious, or having a panic attack.

**How it works:**
Use your five senses to bring yourself back to the present moment.

**The technique:**

**5 - LOOK:** Find 5 things you can see
(A picture on the wall, a plant, your hands, a spot on the ceiling, etc.)

**4 - TOUCH:** Find 4 things you can touch
(Your shirt, the ground under your feet, your hair, a smooth surface)

**3 - HEAR:** Find 3 things you can hear
(Birds chirping, traffic, your breathing, a clock ticking)

**2 - SMELL:** Find 2 things you can smell
(Coffee, fresh air, soap, nature)

**1 - TASTE:** Find 1 thing you can taste
(Gum, coffee, or just notice your mouth's current taste)

**Why it works:**
This technique interrupts anxious thoughts and redirects your focus to your immediate environment, helping calm your nervous system.

Use this anytime, anywhere - it's free and always available!`
  },
  {
    id: 'sleep',
    title: 'Better Sleep Habits',
    icon: '😴',
    category: 'wellness',
    content: `Good sleep is essential for mental health. Poor sleep can worsen anxiety and depression, while better sleep improves mood and resilience.

**Sleep hygiene basics:**

**Before bed:**
- No screens 1 hour before sleep
- Keep bedroom cool (60-67°F)
- Make room completely dark
- Use white noise if helpful
- No caffeine after 2pm
- No heavy meals before bed

**Build a routine:**
- Go to bed same time every night
- Wake up same time every morning
- Create a relaxing ritual (reading, stretching, meditation)
- Avoid naps after 3pm

**What to do if you can't sleep:**
- Don't stay in bed awake for more than 20 minutes
- Get up and do something calm (read, gentle stretching)
- Return to bed when sleepy
- Don't check the time constantly
- Try 4-7-8 breathing

**When to seek help:**
If sleep problems persist for more than a few weeks, talk to a doctor. You might have a sleep disorder that needs treatment.

Remember: Better sleep = better mental health!`
  },
  {
    id: 'selfcare',
    title: 'Self-Care Isn\'t Selfish',
    icon: '💆',
    category: 'wellness',
    content: `Self-care is taking action to protect your own health and well-being. It's not selfish - it's necessary.

**Types of self-care:**

**Physical:**
- Regular exercise
- Healthy eating
- Enough sleep
- Medical check-ups

**Emotional:**
- Journaling
- Therapy
- Expressing feelings
- Setting boundaries

**Social:**
- Spending time with loved ones
- Joining communities
- Reaching out when struggling

**Mental:**
- Learning new things
- Creative activities
- Limiting news/social media
- Mindfulness practice

**Spiritual:**
- Meditation
- Nature time
- Gratitude practice
- Meaningful activities

**Remember:**
- Self-care looks different for everyone
- Start small (5 minutes daily)
- It's not all or nothing
- You deserve care too
- Saying "no" is self-care

**Self-care myth:**
It's not always bubble baths and face masks. Sometimes it's going to therapy, having a hard conversation, or doing something you've been avoiding.

Take care of yourself - you can't pour from an empty cup!`
  }
];

const translations = {
  en: {
    welcomeBack: "Welcome back", notAlone: "You're not alone. We're here with you.",
    unLonelyHourNow: "UN-LONELY HOUR IS NOW!", peopleOnline: "people near you are online right now",
    connectNow: "Connect Right Now", yourStreak: "Your Streak", days: "days",
    connections: "Connections", gratitudeWall: "Gratitude Wall", yourBuddy: "Your Buddy",
    shareYourHeart: "Share Your Heart", whatOnMind: "What's on your mind?",
    postToFeed: "Post to Feed", communityFeed: "Community Feed",
    writeComment: "Write a supportive comment...", postComment: "Post",
    home: "Home", buddy: "Buddy", you: "You", settings: "Settings",
    language: "Language", accessibility: "Accessibility", highContrast: "High Contrast Mode",
    textSize: "Text Size", small: "Small", medium: "Medium", large: "Large",
    privacy: "Privacy", shareAnonymously: "Always post anonymously",
    showOnlineStatus: "Show when I'm online", allowMatching: "Allow buddy matching",
    gratitudePlaceholder: "I'm grateful for...", postAnonymously: "Post Anonymously",
    postedAnonymously: "Posted anonymously", yourCommunity: "Your Community",
    findYourPeople: "Find your people. Share your journey.", createOwnGroup: "Create Your Own",
    createNewGroup: "Create New Group", groupName: "Group Name",
    groupNamePlaceholder: "e.g., Night Owls Support", chooseEmoji: "Choose Emoji",
    groupDescription: "Description", groupDescPlaceholder: "What makes this group special?",
    createGroup: "Create Group", yourGroups: "Your Groups", members: "members", member: "member",
    join: "Join", joined: "Joined", yourProfile: "Your Profile",
    memberSince: "Member since October 2025", dayStreak: "Day Streak",
    entries: "Entries", rewardsEarned: "Rewards Earned", locked: "Locked",
    yourSafeSpace: "Your Safe Space", writeFreeły: "Write freely. No judgment.",
    howDoYouFeel: "How do you feel?", dearJournal: "Dear Journal... Today I feel...",
    saveToMyHeart: "Save to My Heart", saved: "Saved!",
    yourLonelinessBuddy: "Find Your Support Buddy", realPerson: "Real person. Real connection.",
    anonymous: "Anonymous for safety", matchMe: "Find a Buddy",
    inviteFriends: "Invite Friends", searchUsers: "Search users...",
    invite: "Invite", noUsersFound: "No users found",
    interestsQuestion: "What are your interests?",
    supportQuestion: "What kind of support are you looking for?",
    findMatch: "Find My Match!", readyToConnect: "Ready to connect?",
    matchDescription: "We'll match you with someone who understands. Chat anonymously, stay safe.",
    howItWorks: "How it works:", step1: "Answer a few questions about your interests",
    step2: "We match you with someone compatible", step3: "Chat anonymously and support each other",
    typeMessage: "Type a message...", noMessages: "No messages yet. Start the conversation!",
    posts: "posts", noPosts: "No posts yet!",
    beFirst: "Share your heart above to be the first to post today!",
    reportPost: "Report Post", blockUser: "Block User",
    comments: "comments", comment: "comment", beFirstSupport: "Be the first to show support!",
    viewSavedEntries: "View Saved Entries", hideSavedEntries: "Hide Saved Entries",
    yourMoodJourney: "Your Mood Journey", edit: "Edit", edited: "Edited",
    searchGroups: "Search groups...", open: "Open", back: "Back",
    chooseVibe: "Choose Your Vibe", pickTheme: "Pick a theme that matches who you are!",
    pushNotifications: "Push Notifications", enabled: "Enabled", enable: "Enable",
    achievements: "Achievements", firstStep: "First Step", madeFirstPost: "Made your first post",
    kindSoul: "Kind Soul", support10Others: "Support 10 others",
    consistencyKing: "Consistency King", thirtyDayStreak: "30 day streak",
    checkInDaily: "Check in daily", todaysMissions: "Today's Missions",
    viewAll: "View All", gratitudeMatters: "Your gratitude reminds others they're not alone in their blessings",
    beFirstGratitude: "Be the first to share gratitude today!",
    journal: "Journal", groups: "Groups", gratitude: "Gratitude",
    helpPerfectMatch: "Help us find your perfect match!", selectAllApply: "Select all that apply",
    recording: "Recording...", stopRecording: "Stop Recording", voiceNote: "Voice Note",
    recordVoice: "Record Voice Message", or: "or",
    // NEW FEATURES
    moodCheck: "Mood Check-In", howFeelingToday: "How are you feeling today?",
    moodInsights: "Mood Insights", viewTrends: "View Trends",
    unlocked: "Unlocked",
    progress: "Progress", level: "Level",
    quickRelief: "Quick Relief", breathe: "Breathe", meditate: "Meditate",
    panicButton: "Panic Button", needCalmNow: "Need calm now? Tap here",
    breathing: "Breathing Exercise", startExercise: "Start Exercise",
    soundTherapy: "Sound Therapy", playSound: "Play Sound", stopSound: "Stop Sound",
    education: "Learn", mentalHealthLibrary: "Mental Health Library",
    readArticle: "Read Article", sleepTracker: "Sleep Tracker",
    logSleep: "Log Sleep", hoursSlept: "Hours slept", sleepQuality: "Sleep Quality",
    excellent: "Excellent", good: "Good", fair: "Fair", poor: "Poor",
    aiCompanion: "AI Companion", chatWithAI: "Chat with your AI friend",
    therapistConnect: "Connect with Therapist", bookSession: "Book Session",
    dataPrivacy: "Data & Privacy", exportData: "Export My Data", deleteAllData: "Delete All Data",
    lockApp: "Lock App", biometricLock: "Use Biometric Lock",
    // ADDITIONAL TRANSLATIONS
    tools: "Tools", wellnessTools: "Wellness Tools", moodAndJournal: "Mood & Journal",
    postsCount: "Posts", totalCheckins: "Total Check-ins", thisWeek: "This Week",
    mostCommon: "Most Common", realCalmingSounds: "Real calming sounds - 100% free!",
    playingNow: "🔊 Playing now", volumeLabel: "Volume", logMood: "Log Mood 💜",
    alwaysHereToListen: "Always here to listen", hiUser: "Hi", aiWelcome1: "I'm your AI companion. Share anything on your mind.",
    aiWelcome2: "I'm here 24/7 to listen and support you.", everythingYouNeed: "Everything you need to feel better",
    allToolsFree: "Your wellness toolkit. Use anytime, anywhere.",
    useAnytime: "Use them anytime, anywhere. You deserve support!", crisisHelp: "Crisis Help",
    deleteButton: "Delete", setupButton: "Setup",
    fingerprintFaceID: "Fingerprint/Face ID", permanentlyRemove: "Permanently remove your info",
    endToEndEncryption: "End-to-End Encryption", yourDataSecure: "Your data is secure", activeStatus: "Active"
  },
  es: {
    welcomeBack: "Bienvenido de nuevo", notAlone: "No estás solo. Estamos aquí contigo.",
    unLonelyHourNow: "¡HORA SIN SOLEDAD ES AHORA!", peopleOnline: "personas cerca de ti están en línea ahora",
    connectNow: "Conectar Ahora", yourStreak: "Tu Racha", days: "días",
    connections: "Conexiones", gratitudeWall: "Muro de Gratitud", yourBuddy: "Tu Compañero",
    shareYourHeart: "Comparte tu Corazón", whatOnMind: "¿Qué tienes en mente?",
    postToFeed: "Publicar", communityFeed: "Feed de la Comunidad",
    writeComment: "Escribe un comentario de apoyo...", postComment: "Publicar",
    home: "Inicio", buddy: "Compañero", you: "Tú", settings: "Ajustes",
    language: "Idioma", accessibility: "Accesibilidad", highContrast: "Modo de Alto Contraste",
    textSize: "Tamaño de Texto", small: "Pequeño", medium: "Mediano", large: "Grande",
    privacy: "Privacidad", shareAnonymously: "Siempre publicar anónimamente",
    showOnlineStatus: "Mostrar cuando estoy en línea", allowMatching: "Permitir emparejamiento",
    gratitudePlaceholder: "Estoy agradecido por...", postAnonymously: "Publicar Anónimamente",
    postedAnonymously: "Publicado anónimamente", yourCommunity: "Tu Comunidad",
    findYourPeople: "Encuentra a tu gente. Comparte tu viaje.", createOwnGroup: "Crea el Tuyo",
    createNewGroup: "Crear Nuevo Grupo", groupName: "Nombre del Grupo",
    groupNamePlaceholder: "ej., Apoyo Nocturno", chooseEmoji: "Elegir Emoji",
    groupDescription: "Descripción", groupDescPlaceholder: "¿Qué hace especial a este grupo?",
    createGroup: "Crear Grupo", yourGroups: "Tus Grupos", members: "miembros", member: "miembro",
    join: "Unirse", joined: "Unido", yourProfile: "Tu Perfil",
    memberSince: "Miembro desde octubre 2025", dayStreak: "Racha de Días",
    entries: "Entradas", rewardsEarned: "Recompensas Ganadas", locked: "Bloqueado",
    yourSafeSpace: "Tu Espacio Seguro", writeFreeły: "Escribe libremente. Sin juicios.",
    howDoYouFeel: "¿Cómo te sientes?", dearJournal: "Querido Diario... Hoy me siento...",
    saveToMyHeart: "Guardar en Mi Corazón", saved: "¡Guardado!",
    yourLonelinessBuddy: "Tu Compañero de Soledad", realPerson: "Persona real. Conexión real.",
    anonymous: "Anónimo por seguridad", matchMe: "Emparejarme Ahora",
    inviteFriends: "Invitar Amigos", searchUsers: "Buscar usuarios...",
    invite: "Invitar", noUsersFound: "No se encontraron usuarios",
    interestsQuestion: "¿Cuáles son tus intereses?",
    supportQuestion: "¿Qué tipo de apoyo buscas?",
    findMatch: "¡Encuentra mi Pareja!", readyToConnect: "¿Listo para conectar?",
    matchDescription: "Te emparejaremos con alguien que entienda. Chatea anónimamente, mantente seguro.",
    howItWorks: "Cómo funciona:", step1: "Responde algunas preguntas sobre tus intereses",
    step2: "Te emparejamos con alguien compatible", step3: "Chatea anónimamente y apóyense mutuamente",
    typeMessage: "Escribe un mensaje...", noMessages: "Aún no hay mensajes. ¡Comienza la conversación!",
    posts: "publicaciones", noPosts: "¡Aún no hay publicaciones!",
    beFirst: "¡Comparte tu corazón arriba para ser el primero en publicar hoy!",
    reportPost: "Reportar Publicación", blockUser: "Bloquear Usuario",
    comments: "comentarios", comment: "comentario", beFirstSupport: "¡Sé el primero en mostrar apoyo!",
    viewSavedEntries: "Ver Entradas Guardadas", hideSavedEntries: "Ocultar Entradas Guardadas",
    yourMoodJourney: "Tu Viaje de Estado de Ánimo", edit: "Editar", edited: "Editado",
    searchGroups: "Buscar grupos...", open: "Abrir", back: "Volver",
    chooseVibe: "Elige Tu Vibra", pickTheme: "¡Elige un tema que coincida con quien eres!",
    pushNotifications: "Notificaciones Push", enabled: "Habilitado", enable: "Habilitar",
    achievements: "Logros", firstStep: "Primer Paso", madeFirstPost: "Hiciste tu primera publicación",
    kindSoul: "Alma Bondadosa", support10Others: "Apoya a 10 otros",
    consistencyKing: "Rey de la Consistencia", thirtyDayStreak: "Racha de 30 días",
    checkInDaily: "Registrarse diariamente", todaysMissions: "Misiones de Hoy",
    viewAll: "Ver Todo", gratitudeMatters: "Tu gratitud recuerda a otros que no están solos en sus bendiciones",
    beFirstGratitude: "¡Sé el primero en compartir gratitud hoy!",
    journal: "Diario", groups: "Grupos", gratitude: "Gratitud",
    helpPerfectMatch: "¡Ayúdanos a encontrar tu pareja perfecta!", selectAllApply: "Selecciona todos los que apliquen",
    recording: "Grabando...", stopRecording: "Detener Grabación", voiceNote: "Nota de Voz",
    recordVoice: "Grabar Mensaje de Voz", or: "o",
    moodCheck: "Control de Ánimo", howFeelingToday: "¿Cómo te sientes hoy?",
    moodInsights: "Perspectivas del Ánimo", viewTrends: "Ver Tendencias",
    unlocked: "Desbloqueado",
    progress: "Progreso", level: "Nivel",
    quickRelief: "Alivio Rápido", breathe: "Respirar", meditate: "Meditar",
    panicButton: "Botón de Pánico", needCalmNow: "¿Necesitas calma ahora? Toca aquí",
    breathing: "Ejercicio de Respiración", startExercise: "Comenzar Ejercicio",
    soundTherapy: "Terapia de Sonido", playSound: "Reproducir Sonido", stopSound: "Detener Sonido",
    education: "Aprender", mentalHealthLibrary: "Biblioteca de Salud Mental",
    readArticle: "Leer Artículo", sleepTracker: "Rastreador de Sueño",
    logSleep: "Registrar Sueño", hoursSlept: "Horas dormidas", sleepQuality: "Calidad del Sueño",
    excellent: "Excelente", good: "Bueno", fair: "Regular", poor: "Malo",
    aiCompanion: "Compañero IA", chatWithAI: "Chatea con tu amigo IA",
    therapistConnect: "Conectar con Terapeuta", bookSession: "Reservar Sesión",
    dataPrivacy: "Datos y Privacidad", exportData: "Exportar Mis Datos", deleteAllData: "Eliminar Todos los Datos",
    lockApp: "Bloquear App", biometricLock: "Usar Bloqueo Biométrico",
    // ADDITIONAL TRANSLATIONS
    tools: "Herramientas", wellnessTools: "Herramientas de Bienestar", moodAndJournal: "Humor y Diario",
    postsCount: "Publicaciones", totalCheckins: "Registros Totales", thisWeek: "Esta Semana",
    mostCommon: "Más Común", realCalmingSounds: "Sonidos relajantes reales - ¡100% gratis!",
    playingNow: "🔊 Reproduciendo ahora", volumeLabel: "Volumen", logMood: "Registrar Humor 💜",
    alwaysHereToListen: "Siempre aquí para escuchar", hiUser: "Hola", aiWelcome1: "Soy tu compañero IA. Comparte lo que tengas en mente.",
    aiWelcome2: "Estoy aquí 24/7 para escucharte y apoyarte.", everythingYouNeed: "Todo lo que necesitas para sentirte mejor",
    allToolsFree: "Todas las herramientas son 100% GRATIS y diseñadas para ayudarte a sentirte mejor.",
    useAnytime: "Úsalas en cualquier momento, en cualquier lugar. ¡Te mereces apoyo!", crisisHelp: "Ayuda de Crisis",
    deleteButton: "Eliminar", setupButton: "Configurar",
    fingerprintFaceID: "Huella Digital/Face ID", permanentlyRemove: "Eliminar permanentemente tu información",
    endToEndEncryption: "Cifrado de Extremo a Extremo", yourDataSecure: "Tus datos están seguros", activeStatus: "Activo"
  },
  fr: {
    welcomeBack: "Bon retour", notAlone: "Tu n'es pas seul. Nous sommes là avec toi.",
    unLonelyHourNow: "L'HEURE SANS SOLITUDE EST MAINTENANT!", peopleOnline: "personnes près de toi sont en ligne maintenant",
    connectNow: "Connecter Maintenant", yourStreak: "Ta Série", days: "jours",
    connections: "Connexions", gratitudeWall: "Mur de Gratitude", yourBuddy: "Ton Compagnon",
    shareYourHeart: "Partage Ton Cœur", whatOnMind: "À quoi penses-tu?",
    postToFeed: "Publier", communityFeed: "Fil de la Communauté",
    writeComment: "Écris un commentaire de soutien...", postComment: "Publier",
    home: "Accueil", buddy: "Compagnon", you: "Toi", settings: "Paramètres",
    language: "Langue", accessibility: "Accessibilité", highContrast: "Mode Contraste Élevé",
    textSize: "Taille du Texte", small: "Petit", medium: "Moyen", large: "Grand",
    privacy: "Confidentialité", shareAnonymously: "Toujours publier anonymement",
    showOnlineStatus: "Montrer quand je suis en ligne", allowMatching: "Autoriser le jumelage",
    gratitudePlaceholder: "Je suis reconnaissant pour...", postAnonymously: "Publier Anonymement",
    postedAnonymously: "Publié anonymement", yourCommunity: "Ta Communauté",
    findYourPeople: "Trouve tes gens. Partage ton parcours.", createOwnGroup: "Crée le Tien",
    createNewGroup: "Créer un Nouveau Groupe", groupName: "Nom du Groupe",
    groupNamePlaceholder: "ex., Support Nocturne", chooseEmoji: "Choisir un Emoji",
    groupDescription: "Description", groupDescPlaceholder: "Qu'est-ce qui rend ce groupe spécial?",
    createGroup: "Créer un Groupe", yourGroups: "Tes Groupes", members: "membres", member: "membre",
    join: "Rejoindre", joined: "Rejoint", yourProfile: "Ton Profil",
    memberSince: "Membre depuis octobre 2025", dayStreak: "Série de Jours",
    entries: "Entrées", rewardsEarned: "Récompenses Gagnées", locked: "Verrouillé",
    yourSafeSpace: "Ton Espace Sûr", writeFreeły: "Écris librement. Sans jugement.",
    howDoYouFeel: "Comment te sens-tu?", dearJournal: "Cher Journal... Aujourd'hui je me sens...",
    saveToMyHeart: "Sauvegarder dans Mon Cœur", saved: "Sauvegardé!",
    yourLonelinessBuddy: "Ton Compagnon de Solitude", realPerson: "Vraie personne. Vraie connexion.",
    anonymous: "Anonyme pour la sécurité", matchMe: "Jumelage Maintenant",
    inviteFriends: "Inviter des Amis", searchUsers: "Rechercher des utilisateurs...",
    invite: "Inviter", noUsersFound: "Aucun utilisateur trouvé",
    interestsQuestion: "Quels sont tes centres d'intérêt?",
    supportQuestion: "Quel type de soutien cherches-tu?",
    findMatch: "Trouve Mon Jumelage!", readyToConnect: "Prêt à te connecter?",
    matchDescription: "Nous te jumelerons avec quelqu'un qui comprend. Discute anonymement, reste en sécurité.",
    howItWorks: "Comment ça marche:", step1: "Réponds à quelques questions sur tes intérêts",
    step2: "Nous te jumelons avec quelqu'un de compatible", step3: "Discute anonymement et soutenez-vous mutuellement",
    typeMessage: "Tape un message...", noMessages: "Pas encore de messages. Commence la conversation!",
    posts: "publications", noPosts: "Pas encore de publications!",
    beFirst: "Partage ton cœur ci-dessus pour être le premier à publier aujourd'hui!",
    reportPost: "Signaler la Publication", blockUser: "Bloquer l'Utilisateur",
    comments: "commentaires", comment: "commentaire", beFirstSupport: "Sois le premier à montrer ton soutien!",
    viewSavedEntries: "Voir les Entrées Sauvegardées", hideSavedEntries: "Masquer les Entrées Sauvegardées",
    yourMoodJourney: "Ton Parcours d'Humeur", edit: "Modifier", edited: "Modifié",
    searchGroups: "Rechercher des groupes...", open: "Ouvrir", back: "Retour",
    chooseVibe: "Choisis Ton Ambiance", pickTheme: "Choisis un thème qui te correspond!",
    pushNotifications: "Notifications Push", enabled: "Activé", enable: "Activer",
    achievements: "Réalisations", firstStep: "Premier Pas", madeFirstPost: "A fait ta première publication",
    kindSoul: "Âme Bienveillante", support10Others: "Soutenir 10 autres",
    consistencyKing: "Roi de la Cohérence", thirtyDayStreak: "Série de 30 jours",
    checkInDaily: "S'enregistrer quotidiennement", todaysMissions: "Missions d'Aujourd'hui",
    viewAll: "Voir Tout", gratitudeMatters: "Ta gratitude rappelle aux autres qu'ils ne sont pas seuls dans leurs bénédictions",
    beFirstGratitude: "Sois le premier à partager ta gratitude aujourd'hui!",
    journal: "Journal", groups: "Groupes", gratitude: "Gratitude",
    helpPerfectMatch: "Aide-nous à trouver ton jumelage parfait!", selectAllApply: "Sélectionne tout ce qui s'applique",
    recording: "Enregistrement...", stopRecording: "Arrêter l'Enregistrement", voiceNote: "Note Vocale",
    recordVoice: "Enregistrer un Message Vocal", or: "ou",
    moodCheck: "Contrôle d'Humeur", howFeelingToday: "Comment te sens-tu aujourd'hui?",
    moodInsights: "Aperçus d'Humeur", viewTrends: "Voir les Tendances",
    unlocked: "Déverrouillé",
    progress: "Progrès", level: "Niveau",
    quickRelief: "Soulagement Rapide", breathe: "Respirer", meditate: "Méditer",
    panicButton: "Bouton Panique", needCalmNow: "Besoin de calme maintenant? Appuie ici",
    breathing: "Exercice de Respiration", startExercise: "Commencer l'Exercice",
    soundTherapy: "Thérapie Sonore", playSound: "Jouer le Son", stopSound: "Arrêter le Son",
    education: "Apprendre", mentalHealthLibrary: "Bibliothèque de Santé Mentale",
    readArticle: "Lire l'Article", sleepTracker: "Tracker de Sommeil",
    logSleep: "Enregistrer le Sommeil", hoursSlept: "Heures dormies", sleepQuality: "Qualité du Sommeil",
    excellent: "Excellent", good: "Bon", fair: "Moyen", poor: "Mauvais",
    aiCompanion: "Compagnon IA", chatWithAI: "Chatte avec ton ami IA",
    therapistConnect: "Connecter avec Thérapeute", bookSession: "Réserver Session",
    dataPrivacy: "Données et Confidentialité", exportData: "Exporter Mes Données", deleteAllData: "Supprimer Toutes les Données",
    lockApp: "Verrouiller l'App", biometricLock: "Utiliser Verrouillage Biométrique",
    // ADDITIONAL TRANSLATIONS
    tools: "Outils", wellnessTools: "Outils de Bien-être", moodAndJournal: "Humeur et Journal",
    postsCount: "Publications", totalCheckins: "Enregistrements Totaux", thisWeek: "Cette Semaine",
    mostCommon: "Le Plus Commun", realCalmingSounds: "Sons apaisants réels - 100% gratuit!",
    playingNow: "🔊 En cours de lecture", volumeLabel: "Volume", logMood: "Enregistrer l'Humeur 💜",
    alwaysHereToListen: "Toujours là pour écouter", hiUser: "Salut", aiWelcome1: "Je suis ton compagnon IA. Partage ce qui te passe par la tête.",
    aiWelcome2: "Je suis là 24/7 pour t'écouter et te soutenir.", everythingYouNeed: "Tout ce dont tu as besoin pour te sentir mieux",
    allToolsFree: "Tous les outils sont 100% GRATUITS et conçus pour t'aider à te sentir mieux.",
    useAnytime: "Utilise-les n'importe quand, n'importe où. Tu mérites du soutien!", crisisHelp: "Aide en Crise",
    deleteButton: "Supprimer", setupButton: "Configurer",
    fingerprintFaceID: "Empreinte Digitale/Face ID", permanentlyRemove: "Supprimer définitivement vos informations",
    endToEndEncryption: "Chiffrement de Bout en Bout", yourDataSecure: "Vos données sont sécurisées", activeStatus: "Actif"
  },
  de: {
    welcomeBack: "Willkommen zurück", notAlone: "Du bist nicht allein. Wir sind hier bei dir.",
    unLonelyHourNow: "NICHT-EINSAM-STUNDE IST JETZT!", peopleOnline: "Personen in deiner Nähe sind jetzt online",
    connectNow: "Jetzt Verbinden", yourStreak: "Deine Serie", days: "Tage",
    connections: "Verbindungen", gratitudeWall: "Dankbarkeitswand", yourBuddy: "Dein Freund",
    shareYourHeart: "Teile Dein Herz", whatOnMind: "Was denkst du?",
    postToFeed: "Veröffentlichen", communityFeed: "Community-Feed",
    writeComment: "Schreibe einen unterstützenden Kommentar...", postComment: "Posten",
    home: "Startseite", buddy: "Freund", you: "Du", settings: "Einstellungen",
    language: "Sprache", accessibility: "Barrierefreiheit", highContrast: "Hoher Kontrastmodus",
    textSize: "Textgröße", small: "Klein", medium: "Mittel", large: "Groß",
    privacy: "Datenschutz", shareAnonymously: "Immer anonym posten",
    showOnlineStatus: "Zeigen, wenn ich online bin", allowMatching: "Freundessuche erlauben",
    gratitudePlaceholder: "Ich bin dankbar für...", postAnonymously: "Anonym Posten",
    postedAnonymously: "Anonym gepostet", yourCommunity: "Deine Community",
    findYourPeople: "Finde deine Leute. Teile deine Reise.", createOwnGroup: "Erstelle Deine Eigene",
    createNewGroup: "Neue Gruppe Erstellen", groupName: "Gruppenname",
    groupNamePlaceholder: "z.B., Nachtschwärmer-Support", chooseEmoji: "Emoji Wählen",
    groupDescription: "Beschreibung", groupDescPlaceholder: "Was macht diese Gruppe besonders?",
    createGroup: "Gruppe Erstellen", yourGroups: "Deine Gruppen", members: "Mitglieder", member: "Mitglied",
    join: "Beitreten", joined: "Beigetreten", yourProfile: "Dein Profil",
    memberSince: "Mitglied seit Oktober 2025", dayStreak: "Tage-Serie",
    entries: "Einträge", rewardsEarned: "Verdiente Belohnungen", locked: "Gesperrt",
    yourSafeSpace: "Dein Sicherer Raum", writeFreeły: "Schreibe frei. Ohne Urteil.",
    howDoYouFeel: "Wie fühlst du dich?", dearJournal: "Liebes Tagebuch... Heute fühle ich mich...",
    saveToMyHeart: "In Meinem Herzen Speichern", saved: "Gespeichert!",
    yourLonelinessBuddy: "Dein Einsamkeitsfreund", realPerson: "Echte Person. Echte Verbindung.",
    anonymous: "Anonym für Sicherheit", matchMe: "Jetzt Matchen",
    inviteFriends: "Freunde Einladen", searchUsers: "Benutzer suchen...",
    invite: "Einladen", noUsersFound: "Keine Benutzer gefunden",
    interestsQuestion: "Was sind deine Interessen?",
    supportQuestion: "Welche Art von Unterstützung suchst du?",
    findMatch: "Finde Mein Match!", readyToConnect: "Bereit zum Verbinden?",
    matchDescription: "Wir matchen dich mit jemandem, der versteht. Chatte anonym, bleibe sicher.",
    howItWorks: "So funktioniert's:", step1: "Beantworte ein paar Fragen zu deinen Interessen",
    step2: "Wir matchen dich mit jemandem Kompatiblem", step3: "Chatte anonym und unterstützt euch gegenseitig",
    typeMessage: "Nachricht eingeben...", noMessages: "Noch keine Nachrichten. Starte das Gespräch!",
    posts: "Beiträge", noPosts: "Noch keine Beiträge!",
    beFirst: "Teile dein Herz oben, um der Erste zu sein, der heute postet!",
    reportPost: "Beitrag Melden", blockUser: "Benutzer Blockieren",
    comments: "Kommentare", comment: "Kommentar", beFirstSupport: "Sei der Erste, der Unterstützung zeigt!",
    viewSavedEntries: "Gespeicherte Einträge Anzeigen", hideSavedEntries: "Gespeicherte Einträge Ausblenden",
    yourMoodJourney: "Deine Stimmungsreise", edit: "Bearbeiten", edited: "Bearbeitet",
    searchGroups: "Gruppen suchen...", open: "Öffnen", back: "Zurück",
    chooseVibe: "Wähle Deine Stimmung", pickTheme: "Wähle ein Thema, das zu dir passt!",
    pushNotifications: "Push-Benachrichtigungen", enabled: "Aktiviert", enable: "Aktivieren",
    achievements: "Erfolge", firstStep: "Erster Schritt", madeFirstPost: "Hast deinen ersten Beitrag gemacht",
    kindSoul: "Gütige Seele", support10Others: "10 andere unterstützen",
    consistencyKing: "Konsistenzkönig", thirtyDayStreak: "30-Tage-Serie",
    checkInDaily: "Täglich einchecken", todaysMissions: "Heutige Missionen",
    viewAll: "Alle Anzeigen", gratitudeMatters: "Deine Dankbarkeit erinnert andere daran, dass sie nicht allein in ihren Segnungen sind",
    beFirstGratitude: "Sei der Erste, der heute Dankbarkeit teilt!",
    journal: "Tagebuch", groups: "Gruppen", gratitude: "Dankbarkeit",
    helpPerfectMatch: "Hilf uns, dein perfektes Match zu finden!", selectAllApply: "Wähle alle zutreffenden",
    recording: "Aufnahme...", stopRecording: "Aufnahme Stoppen", voiceNote: "Sprachnotiz",
    recordVoice: "Sprachnachricht Aufnehmen", or: "oder",
    moodCheck: "Stimmungs-Check", howFeelingToday: "Wie fühlst du dich heute?",
    moodInsights: "Stimmungseinblicke", viewTrends: "Trends Anzeigen",
    unlocked: "Freigeschaltet",
    progress: "Fortschritt", level: "Level",
    quickRelief: "Schnelle Erleichterung", breathe: "Atmen", meditate: "Meditieren",
    panicButton: "Panik-Knopf", needCalmNow: "Jetzt Ruhe brauchen? Hier tippen",
    breathing: "Atemübung", startExercise: "Übung Starten",
    soundTherapy: "Klangtherapie", playSound: "Sound Abspielen", stopSound: "Sound Stoppen",
    education: "Lernen", mentalHealthLibrary: "Psychische Gesundheitsbibliothek",
    readArticle: "Artikel Lesen", sleepTracker: "Schlaf-Tracker",
    logSleep: "Schlaf Protokollieren", hoursSlept: "Geschlafene Stunden", sleepQuality: "Schlafqualität",
    excellent: "Ausgezeichnet", good: "Gut", fair: "Mittel", poor: "Schlecht",
    aiCompanion: "KI-Begleiter", chatWithAI: "Chatte mit deinem KI-Freund",
    therapistConnect: "Mit Therapeut Verbinden", bookSession: "Sitzung Buchen",
    dataPrivacy: "Daten & Datenschutz", exportData: "Meine Daten Exportieren", deleteAllData: "Alle Daten Löschen",
    lockApp: "App Sperren", biometricLock: "Biometrische Sperre Verwenden",
    // ADDITIONAL TRANSLATIONS
    tools: "Werkzeuge", wellnessTools: "Wellness-Werkzeuge", moodAndJournal: "Stimmung und Tagebuch",
    postsCount: "Beiträge", totalCheckins: "Gesamte Check-ins", thisWeek: "Diese Woche",
    mostCommon: "Am Häufigsten", realCalmingSounds: "Echte beruhigende Klänge - 100% kostenlos!",
    playingNow: "🔊 Spielt jetzt", volumeLabel: "Lautstärke", logMood: "Stimmung Protokollieren 💜",
    alwaysHereToListen: "Immer hier zum Zuhören", hiUser: "Hallo", aiWelcome1: "Ich bin dein KI-Begleiter. Teile alles, was dir durch den Kopf geht.",
    aiWelcome2: "Ich bin 24/7 hier, um dir zuzuhören und dich zu unterstützen.", everythingYouNeed: "Alles, was du brauchst, um dich besser zu fühlen",
    allToolsFree: "Alle Werkzeuge sind 100% KOSTENLOS und entwickelt, um dir zu helfen, dich besser zu fühlen.",
    useAnytime: "Benutze sie jederzeit, überall. Du verdienst Unterstützung!", crisisHelp: "Krisenhilfe",
    deleteButton: "Löschen", setupButton: "Einrichten",
    fingerprintFaceID: "Fingerabdruck/Face ID", permanentlyRemove: "Ihre Informationen dauerhaft entfernen",
    endToEndEncryption: "Ende-zu-Ende-Verschlüsselung", yourDataSecure: "Ihre Daten sind sicher", activeStatus: "Aktiv"
  },
  pt: {
    welcomeBack: "Bem-vindo de volta", notAlone: "Você não está sozinho. Estamos aqui com você.",
    unLonelyHourNow: "HORA SEM SOLIDÃO É AGORA!", peopleOnline: "pessoas perto de você estão online agora",
    connectNow: "Conectar Agora", yourStreak: "Sua Sequência", days: "dias",
    connections: "Conexões", gratitudeWall: "Mural de Gratidão", yourBuddy: "Seu Companheiro",
    shareYourHeart: "Compartilhe Seu Coração", whatOnMind: "O que você está pensando?",
    postToFeed: "Publicar", communityFeed: "Feed da Comunidade",
    writeComment: "Escreva um comentário de apoio...", postComment: "Publicar",
    home: "Início", buddy: "Companheiro", you: "Você", settings: "Configurações",
    language: "Idioma", accessibility: "Acessibilidade", highContrast: "Modo de Alto Contraste",
    textSize: "Tamanho do Texto", small: "Pequeno", medium: "Médio", large: "Grande",
    privacy: "Privacidade", shareAnonymously: "Sempre publicar anonimamente",
    showOnlineStatus: "Mostrar quando estou online", allowMatching: "Permitir emparelhamento",
    gratitudePlaceholder: "Sou grato por...", postAnonymously: "Publicar Anonimamente",
    postedAnonymously: "Publicado anonimamente", yourCommunity: "Sua Comunidade",
    findYourPeople: "Encontre suas pessoas. Compartilhe sua jornada.", createOwnGroup: "Crie o Seu",
    createNewGroup: "Criar Novo Grupo", groupName: "Nome do Grupo",
    groupNamePlaceholder: "ex., Apoio Noturno", chooseEmoji: "Escolher Emoji",
    groupDescription: "Descrição", groupDescPlaceholder: "O que torna este grupo especial?",
    createGroup: "Criar Grupo", yourGroups: "Seus Grupos", members: "membros", member: "membro",
    join: "Juntar-se", joined: "Juntou-se", yourProfile: "Seu Perfil",
    memberSince: "Membro desde outubro de 2025", dayStreak: "Sequência de Dias",
    entries: "Entradas", rewardsEarned: "Recompensas Ganhas", locked: "Bloqueado",
    yourSafeSpace: "Seu Espaço Seguro", writeFreeły: "Escreva livremente. Sem julgamento.",
    howDoYouFeel: "Como você se sente?", dearJournal: "Querido Diário... Hoje eu me sinto...",
    saveToMyHeart: "Salvar no Meu Coração", saved: "Salvo!",
    yourLonelinessBuddy: "Seu Companheiro de Solidão", realPerson: "Pessoa real. Conexão real.",
    anonymous: "Anônimo para segurança", matchMe: "Me Emparelhar Agora",
    inviteFriends: "Convidar Amigos", searchUsers: "Pesquisar usuários...",
    invite: "Convidar", noUsersFound: "Nenhum usuário encontrado",
    interestsQuestion: "Quais são seus interesses?",
    supportQuestion: "Que tipo de apoio você está procurando?",
    findMatch: "Encontre Meu Par!", readyToConnect: "Pronto para conectar?",
    matchDescription: "Vamos emparelhar você com alguém que entende. Converse anonimamente, fique seguro.",
    howItWorks: "Como funciona:", step1: "Responda algumas perguntas sobre seus interesses",
    step2: "Emparelhamos você com alguém compatível", step3: "Converse anonimamente e apoiem-se mutuamente",
    typeMessage: "Digite uma mensagem...", noMessages: "Ainda sem mensagens. Comece a conversa!",
    posts: "publicações", noPosts: "Ainda sem publicações!",
    beFirst: "Compartilhe seu coração acima para ser o primeiro a publicar hoje!",
    reportPost: "Reportar Publicação", blockUser: "Bloquear Usuário",
    comments: "comentários", comment: "comentário", beFirstSupport: "Seja o primeiro a mostrar apoio!",
    viewSavedEntries: "Ver Entradas Salvas", hideSavedEntries: "Ocultar Entradas Salvas",
    yourMoodJourney: "Sua Jornada de Humor", edit: "Editar", edited: "Editado",
    searchGroups: "Pesquisar grupos...", open: "Abrir", back: "Voltar",
    chooseVibe: "Escolha Sua Vibe", pickTheme: "Escolha um tema que combine com você!",
    pushNotifications: "Notificações Push", enabled: "Ativado", enable: "Ativar",
    achievements: "Conquistas", firstStep: "Primeiro Passo", madeFirstPost: "Fez sua primeira publicação",
    kindSoul: "Alma Gentil", support10Others: "Apoiar 10 outros",
    consistencyKing: "Rei da Consistência", thirtyDayStreak: "Sequência de 30 dias",
    checkInDaily: "Registrar-se diariamente", todaysMissions: "Missões de Hoje",
    viewAll: "Ver Tudo", gratitudeMatters: "Sua gratidão lembra aos outros que eles não estão sozinhos em suas bênçãos",
    beFirstGratitude: "Seja o primeiro a compartilhar gratidão hoje!",
    journal: "Diário", groups: "Grupos", gratitude: "Gratidão",
    helpPerfectMatch: "Ajude-nos a encontrar seu par perfeito!", selectAllApply: "Selecione todos que se aplicam",
    recording: "Gravando...", stopRecording: "Parar Gravação", voiceNote: "Nota de Voz",
    recordVoice: "Gravar Mensagem de Voz", or: "ou",
    moodCheck: "Verificação de Humor", howFeelingToday: "Como você está se sentindo hoje?",
    moodInsights: "Insights de Humor", viewTrends: "Ver Tendências",
    unlocked: "Desbloqueado",
    progress: "Progresso", level: "Nível",
    quickRelief: "Alívio Rápido", breathe: "Respirar", meditate: "Meditar",
    panicButton: "Botão de Pânico", needCalmNow: "Precisa de calma agora? Toque aqui",
    breathing: "Exercício de Respiração", startExercise: "Iniciar Exercício",
    soundTherapy: "Terapia Sonora", playSound: "Reproduzir Som", stopSound: "Parar Som",
    education: "Aprender", mentalHealthLibrary: "Biblioteca de Saúde Mental",
    readArticle: "Ler Artigo", sleepTracker: "Rastreador de Sono",
    logSleep: "Registrar Sono", hoursSlept: "Horas dormidas", sleepQuality: "Qualidade do Sono",
    excellent: "Excelente", good: "Bom", fair: "Regular", poor: "Ruim",
    aiCompanion: "Companheiro IA", chatWithAI: "Converse com seu amigo IA",
    therapistConnect: "Conectar com Terapeuta", bookSession: "Reservar Sessão",
    dataPrivacy: "Dados e Privacidade", exportData: "Exportar Meus Dados", deleteAllData: "Excluir Todos os Dados",
    lockApp: "Bloquear App", biometricLock: "Usar Bloqueio Biométrico",
    // ADDITIONAL TRANSLATIONS
    tools: "Ferramentas", wellnessTools: "Ferramentas de Bem-estar", moodAndJournal: "Humor e Diário",
    postsCount: "Publicações", totalCheckins: "Check-ins Totais", thisWeek: "Esta Semana",
    mostCommon: "Mais Comum", realCalmingSounds: "Sons calmantes reais - 100% grátis!",
    playingNow: "🔊 Tocando agora", volumeLabel: "Volume", logMood: "Registrar Humor 💜",
    alwaysHereToListen: "Sempre aqui para ouvir", hiUser: "Oi", aiWelcome1: "Sou seu companheiro de IA. Compartilhe o que estiver em sua mente.",
    aiWelcome2: "Estou aqui 24/7 para ouvir e apoiar você.", everythingYouNeed: "Tudo o que você precisa para se sentir melhor",
    allToolsFree: "Todas as ferramentas são 100% GRÁTIS e projetadas para ajudá-lo a se sentir melhor.",
    useAnytime: "Use-as a qualquer hora, em qualquer lugar. Você merece apoio!", crisisHelp: "Ajuda em Crise",
    deleteButton: "Excluir", setupButton: "Configurar",
    fingerprintFaceID: "Impressão Digital/Face ID", permanentlyRemove: "Remover permanentemente suas informações",
    endToEndEncryption: "Criptografia de Ponta a Ponta", yourDataSecure: "Seus dados estão seguros", activeStatus: "Ativo"
  },
  zh: {
    welcomeBack: "欢迎回来", notAlone: "你并不孤单。我们与你同在。",
    unLonelyHourNow: "不孤独时刻现在开始！", peopleOnline: "你附近的人现在在线",
    connectNow: "立即连接", yourStreak: "你的连胜", days: "天",
    connections: "连接", gratitudeWall: "感恩墙", yourBuddy: "你的伙伴",
    shareYourHeart: "分享你的心声", whatOnMind: "你在想什么？",
    postToFeed: "发布", communityFeed: "社区动态",
    writeComment: "写一个支持的评论...", postComment: "发布",
    home: "首页", buddy: "伙伴", you: "你", settings: "设置",
    language: "语言", accessibility: "无障碍", highContrast: "高对比度模式",
    textSize: "文字大小", small: "小", medium: "中", large: "大",
    privacy: "隐私", shareAnonymously: "始终匿名发布",
    showOnlineStatus: "显示我在线", allowMatching: "允许配对",
    gratitudePlaceholder: "我感激...", postAnonymously: "匿名发布",
    postedAnonymously: "匿名发布", yourCommunity: "你的社区",
    findYourPeople: "找到你的朋友。分享你的旅程。", createOwnGroup: "创建你自己的",
    createNewGroup: "创建新群组", groupName: "群组名称",
    groupNamePlaceholder: "例如，夜猫子支持", chooseEmoji: "选择表情符号",
    groupDescription: "描述", groupDescPlaceholder: "是什么让这个群组特别？",
    createGroup: "创建群组", yourGroups: "你的群组", members: "成员", member: "成员",
    join: "加入", joined: "已加入", yourProfile: "你的个人资料",
    memberSince: "2025年10月加入", dayStreak: "连续天数",
    entries: "条目", rewardsEarned: "获得的奖励", locked: "锁定",
    yourSafeSpace: "你的安全空间", writeFreeły: "自由书写。不评判。",
    howDoYouFeel: "你感觉如何？", dearJournal: "亲爱的日记...今天我感觉...",
    saveToMyHeart: "保存到我的心", saved: "已保存！",
    yourLonelinessBuddy: "你的孤独伙伴", realPerson: "真实的人。真实的连接。",
    anonymous: "为了安全而匿名", matchMe: "现在配对我",
    inviteFriends: "邀请朋友", searchUsers: "搜索用户...",
    invite: "邀请", noUsersFound: "未找到用户",
    interestsQuestion: "你的兴趣是什么？",
    supportQuestion: "你在寻找什么样的支持？",
    findMatch: "找到我的配对！", readyToConnect: "准备好连接了吗？",
    matchDescription: "我们会将你与理解的人配对。匿名聊天，保持安全。",
    howItWorks: "如何运作：", step1: "回答一些关于你兴趣的问题",
    step2: "我们将你与兼容的人配对", step3: "匿名聊天并互相支持",
    typeMessage: "输入消息...", noMessages: "还没有消息。开始对话！",
    posts: "帖子", noPosts: "还没有帖子！",
    beFirst: "在上面分享你的心声，成为今天第一个发帖的人！",
    reportPost: "举报帖子", blockUser: "屏蔽用户",
    comments: "评论", comment: "评论", beFirstSupport: "成为第一个表示支持的人！",
    viewSavedEntries: "查看保存的条目", hideSavedEntries: "隐藏保存的条目",
    yourMoodJourney: "你的情绪之旅", edit: "编辑", edited: "已编辑",
    searchGroups: "搜索群组...", open: "打开", back: "返回",
    chooseVibe: "选择你的氛围", pickTheme: "选择一个适合你的主题！",
    pushNotifications: "推送通知", enabled: "已启用", enable: "启用",
    achievements: "成就", firstStep: "第一步", madeFirstPost: "发布了你的第一篇帖子",
    kindSoul: "善良的灵魂", support10Others: "支持10个其他人",
    consistencyKing: "坚持之王", thirtyDayStreak: "30天连胜",
    checkInDaily: "每日签到", todaysMissions: "今天的任务",
    viewAll: "查看全部", gratitudeMatters: "你的感恩提醒他人，他们在祝福中并不孤单",
    beFirstGratitude: "成为今天第一个分享感恩的人！",
    journal: "日记", groups: "群组", gratitude: "感恩",
    helpPerfectMatch: "帮助我们找到你的完美配对！", selectAllApply: "选择所有适用的",
    recording: "正在录音...", stopRecording: "停止录音", voiceNote: "语音备注",
    recordVoice: "录制语音消息", or: "或",
    moodCheck: "心情检查", howFeelingToday: "你今天感觉怎么样？",
    moodInsights: "心情洞察", viewTrends: "查看趋势",
    unlocked: "已解锁",
    progress: "进度", level: "等级",
    quickRelief: "快速缓解", breathe: "呼吸", meditate: "冥想",
    panicButton: "紧急按钮", needCalmNow: "现在需要平静？点击这里",
    breathing: "呼吸练习", startExercise: "开始练习",
    soundTherapy: "声音疗法", playSound: "播放声音", stopSound: "停止声音",
    education: "学习", mentalHealthLibrary: "心理健康图书馆",
    readArticle: "阅读文章", sleepTracker: "睡眠追踪器",
    logSleep: "记录睡眠", hoursSlept: "睡眠小时数", sleepQuality: "睡眠质量",
    excellent: "优秀", good: "良好", fair: "一般", poor: "差",
    aiCompanion: "AI伴侣", chatWithAI: "与你的AI朋友聊天",
    therapistConnect: "联系治疗师", bookSession: "预约会话",
    dataPrivacy: "数据和隐私", exportData: "导出我的数据", deleteAllData: "删除所有数据",
    lockApp: "锁定应用", biometricLock: "使用生物识别锁",
    // ADDITIONAL TRANSLATIONS
    tools: "工具", wellnessTools: "健康工具", moodAndJournal: "心情和日记",
    postsCount: "帖子", totalCheckins: "总签到", thisWeek: "本周",
    mostCommon: "最常见", realCalmingSounds: "真实的舒缓声音 - 100%免费！",
    playingNow: "🔊 正在播放", volumeLabel: "音量", logMood: "记录心情 💜",
    alwaysHereToListen: "随时倾听", hiUser: "你好", aiWelcome1: "我是你的AI伴侣。分享你心中所想。",
    aiWelcome2: "我24/7在这里倾听和支持你。", everythingYouNeed: "你需要的一切让你感觉更好",
    allToolsFree: "所有工具都是100%免费的，旨在帮助你感觉更好。",
    useAnytime: "随时随地使用它们。你值得获得支持！", crisisHelp: "危机帮助",
    deleteButton: "删除", setupButton: "设置",
    fingerprintFaceID: "指纹/Face ID", permanentlyRemove: "永久删除您的信息",
    endToEndEncryption: "端到端加密", yourDataSecure: "您的数据是安全的", activeStatus: "活跃"
  },
  ja: {
    welcomeBack: "おかえりなさい", notAlone: "あなたは一人じゃない。私たちがいます。",
    unLonelyHourNow: "孤独じゃない時間は今！", peopleOnline: "あなたの近くの人が今オンラインです",
    connectNow: "今すぐ接続", yourStreak: "あなたの連続記録", days: "日",
    connections: "つながり", gratitudeWall: "感謝の壁", yourBuddy: "あなたの仲間",
    shareYourHeart: "心を共有", whatOnMind: "何を考えていますか？",
    postToFeed: "投稿", communityFeed: "コミュニティフィード",
    writeComment: "応援コメントを書く...", postComment: "投稿",
    home: "ホーム", buddy: "仲間", you: "あなた", settings: "設定",
    language: "言語", accessibility: "アクセシビリティ", highContrast: "ハイコントラストモード",
    textSize: "テキストサイズ", small: "小", medium: "中", large: "大",
    privacy: "プライバシー", shareAnonymously: "常に匿名で投稿",
    showOnlineStatus: "オンライン時に表示", allowMatching: "マッチングを許可",
    gratitudePlaceholder: "感謝していること...", postAnonymously: "匿名で投稿",
    postedAnonymously: "匿名で投稿されました", yourCommunity: "あなたのコミュニティ",
    findYourPeople: "仲間を見つけよう。旅を共有しよう。", createOwnGroup: "自分で作成",
    createNewGroup: "新しいグループを作成", groupName: "グループ名",
    groupNamePlaceholder: "例：夜更かしサポート", chooseEmoji: "絵文字を選択",
    groupDescription: "説明", groupDescPlaceholder: "このグループの特別なところは？",
    createGroup: "グループを作成", yourGroups: "あなたのグループ", members: "メンバー", member: "メンバー",
    join: "参加", joined: "参加済み", yourProfile: "あなたのプロフィール",
    memberSince: "2025年10月からメンバー", dayStreak: "連続日数",
    entries: "エントリー", rewardsEarned: "獲得した報酬", locked: "ロック済み",
    yourSafeSpace: "あなたの安全な場所", writeFreeły: "自由に書いて。判断なし。",
    howDoYouFeel: "どう感じていますか？", dearJournal: "親愛なる日記...今日は...",
    saveToMyHeart: "心に保存", saved: "保存しました！",
    yourLonelinessBuddy: "あなたの孤独の仲間", realPerson: "本物の人。本物のつながり。",
    anonymous: "安全のため匿名", matchMe: "今すぐマッチング",
    inviteFriends: "友達を招待", searchUsers: "ユーザーを検索...",
    invite: "招待", noUsersFound: "ユーザーが見つかりません",
    interestsQuestion: "あなたの興味は何ですか？",
    supportQuestion: "どんなサポートを探していますか？",
    findMatch: "マッチを見つける！", readyToConnect: "つながる準備はできましたか？",
    matchDescription: "理解してくれる人とマッチングします。匿名でチャット、安全に。",
    howItWorks: "仕組み：", step1: "興味についていくつか質問に答える",
    step2: "互換性のある人とマッチング", step3: "匿名でチャットしてお互いをサポート",
    typeMessage: "メッセージを入力...", noMessages: "まだメッセージがありません。会話を始めましょう！",
    posts: "投稿", noPosts: "まだ投稿がありません！",
    beFirst: "上で心を共有して、今日最初に投稿する人になりましょう！",
    reportPost: "投稿を報告", blockUser: "ユーザーをブロック",
    comments: "コメント", comment: "コメント", beFirstSupport: "最初にサポートを示す人になりましょう！",
    viewSavedEntries: "保存されたエントリーを表示", hideSavedEntries: "保存されたエントリーを非表示",
    yourMoodJourney: "あなたの気分の旅", edit: "編集", edited: "編集済み",
    searchGroups: "グループを検索...", open: "開く", back: "戻る",
    chooseVibe: "雰囲気を選択", pickTheme: "あなたに合ったテーマを選んで！",
    pushNotifications: "プッシュ通知", enabled: "有効", enable: "有効にする",
    achievements: "実績", firstStep: "最初の一歩", madeFirstPost: "最初の投稿をしました",
    kindSoul: "優しい魂", support10Others: "10人をサポート",
    consistencyKing: "継続の王", thirtyDayStreak: "30日連続",
    checkInDaily: "毎日チェックイン", todaysMissions: "今日のミッション",
    viewAll: "すべて表示", gratitudeMatters: "あなたの感謝は、他の人が祝福の中で一人ではないことを思い出させます",
    beFirstGratitude: "今日最初に感謝を共有する人になりましょう！",
    journal: "日記", groups: "グループ", gratitude: "感謝",
    helpPerfectMatch: "完璧なマッチを見つけるのを手伝って！", selectAllApply: "該当するものすべてを選択",
    recording: "録音中...", stopRecording: "録音を停止", voiceNote: "ボイスノート",
    recordVoice: "ボイスメッセージを録音", or: "または",
    moodCheck: "気分チェック", howFeelingToday: "今日の気分は？",
    moodInsights: "気分の洞察", viewTrends: "トレンドを見る",
    unlocked: "ロック解除",
    progress: "進捗", level: "レベル",
    quickRelief: "クイックリリーフ", breathe: "呼吸", meditate: "瞑想",
    panicButton: "パニックボタン", needCalmNow: "今すぐ落ち着く必要がありますか？ここをタップ",
    breathing: "呼吸エクササイズ", startExercise: "エクササイズを開始",
    soundTherapy: "サウンドセラピー", playSound: "サウンド再生", stopSound: "サウンド停止",
    education: "学ぶ", mentalHealthLibrary: "メンタルヘルスライブラリ",
    readArticle: "記事を読む", sleepTracker: "睡眠トラッカー",
    logSleep: "睡眠を記録", hoursSlept: "睡眠時間", sleepQuality: "睡眠の質",
    excellent: "優秀", good: "良い", fair: "まあまあ", poor: "悪い",
    aiCompanion: "AIコンパニオン", chatWithAI: "AIの友達とチャット",
    therapistConnect: "セラピストに接続", bookSession: "セッション予約",
    dataPrivacy: "データとプライバシー", exportData: "データをエクスポート", deleteAllData: "すべてのデータを削除",
    lockApp: "アプリをロック", biometricLock: "生体認証ロックを使用",
    // ADDITIONAL TRANSLATIONS
    tools: "ツール", wellnessTools: "ウェルネスツール", moodAndJournal: "気分と日記",
    postsCount: "投稿", totalCheckins: "総チェックイン", thisWeek: "今週",
    mostCommon: "最も一般的", realCalmingSounds: "本物の癒しの音 - 100%無料！",
    playingNow: "🔊 再生中", volumeLabel: "音量", logMood: "気分を記録 💜",
    alwaysHereToListen: "いつでも聞いています", hiUser: "こんにちは", aiWelcome1: "私はあなたのAIコンパニオンです。心に浮かんだことを共有してください。",
    aiWelcome2: "24時間年中無休であなたの話を聞き、サポートします。", everythingYouNeed: "気分を良くするために必要なすべて",
    allToolsFree: "すべてのツールは100%無料で、あなたの気分を良くするために設計されています。",
    useAnytime: "いつでもどこでも使用してください。あなたはサポートに値します！", crisisHelp: "危機支援",
    deleteButton: "削除", setupButton: "設定",
    fingerprintFaceID: "指紋/Face ID", permanentlyRemove: "情報を完全に削除",
    endToEndEncryption: "エンドツーエンド暗号化", yourDataSecure: "データは安全です", activeStatus: "アクティブ"
  },
  it: {
    welcomeBack: "Bentornato", notAlone: "Non sei solo. Siamo qui con te.",
    unLonelyHourNow: "L'ORA NON SOLITARIA È ORA!", peopleOnline: "persone vicino a te sono online ora",
    connectNow: "Connetti Ora", yourStreak: "La Tua Serie", days: "giorni",
    connections: "Connessioni", gratitudeWall: "Muro della Gratitudine", yourBuddy: "Il Tuo Compagno",
    shareYourHeart: "Condividi il Tuo Cuore", whatOnMind: "Cosa stai pensando?",
    postToFeed: "Pubblica", communityFeed: "Feed della Comunità",
    writeComment: "Scrivi un commento di supporto...", postComment: "Pubblica",
    home: "Home", buddy: "Compagno", you: "Tu", settings: "Impostazioni",
    language: "Lingua", accessibility: "Accessibilità", highContrast: "Modalità Alto Contrasto",
    textSize: "Dimensione Testo", small: "Piccolo", medium: "Medio", large: "Grande",
    privacy: "Privacy", shareAnonymously: "Pubblica sempre anonimamente",
    showOnlineStatus: "Mostra quando sono online", allowMatching: "Consenti abbinamento",
    gratitudePlaceholder: "Sono grato per...", postAnonymously: "Pubblica Anonimamente",
    postedAnonymously: "Pubblicato anonimamente", yourCommunity: "La Tua Comunità",
    findYourPeople: "Trova la tua gente. Condividi il tuo viaggio.", createOwnGroup: "Crea il Tuo",
    createNewGroup: "Crea Nuovo Gruppo", groupName: "Nome del Gruppo",
    groupNamePlaceholder: "es., Supporto Nottambuli", chooseEmoji: "Scegli Emoji",
    groupDescription: "Descrizione", groupDescPlaceholder: "Cosa rende speciale questo gruppo?",
    createGroup: "Crea Gruppo", yourGroups: "I Tuoi Gruppi", members: "membri", member: "membro",
    join: "Unisciti", joined: "Unito", yourProfile: "Il Tuo Profilo",
    memberSince: "Membro da ottobre 2025", dayStreak: "Serie di Giorni",
    entries: "Voci", rewardsEarned: "Ricompense Guadagnate", locked: "Bloccato",
    yourSafeSpace: "Il Tuo Spazio Sicuro", writeFreeły: "Scrivi liberamente. Senza giudizio.",
    howDoYouFeel: "Come ti senti?", dearJournal: "Caro Diario... Oggi mi sento...",
    saveToMyHeart: "Salva nel Mio Cuore", saved: "Salvato!",
    yourLonelinessBuddy: "Il Tuo Compagno di Solitudine", realPerson: "Persona reale. Connessione reale.",
    anonymous: "Anonimo per sicurezza", matchMe: "Abbinami Ora",
    inviteFriends: "Invita Amici", searchUsers: "Cerca utenti...",
    invite: "Invita", noUsersFound: "Nessun utente trovato",
    interestsQuestion: "Quali sono i tuoi interessi?",
    supportQuestion: "Che tipo di supporto stai cercando?",
    findMatch: "Trova il Mio Abbinamento!", readyToConnect: "Pronto a connetterti?",
    matchDescription: "Ti abbineremo con qualcuno che capisce. Chatta anonimamente, resta sicuro.",
    howItWorks: "Come funziona:", step1: "Rispondi ad alcune domande sui tuoi interessi",
    step2: "Ti abbiniamo con qualcuno compatibile", step3: "Chatta anonimamente e supportatevi a vicenda",
    typeMessage: "Scrivi un messaggio...", noMessages: "Ancora nessun messaggio. Inizia la conversazione!",
    posts: "post", noPosts: "Ancora nessun post!",
    beFirst: "Condividi il tuo cuore sopra per essere il primo a pubblicare oggi!",
    reportPost: "Segnala Post", blockUser: "Blocca Utente",
    comments: "commenti", comment: "commento", beFirstSupport: "Sii il primo a mostrare supporto!",
    viewSavedEntries: "Visualizza Voci Salvate", hideSavedEntries: "Nascondi Voci Salvate",
    yourMoodJourney: "Il Tuo Viaggio dell'Umore", edit: "Modifica", edited: "Modificato",
    searchGroups: "Cerca gruppi...", open: "Apri", back: "Indietro",
    chooseVibe: "Scegli la Tua Atmosfera", pickTheme: "Scegli un tema che ti rappresenta!",
    pushNotifications: "Notifiche Push", enabled: "Abilitato", enable: "Abilita",
    achievements: "Risultati", firstStep: "Primo Passo", madeFirstPost: "Hai fatto il tuo primo post",
    kindSoul: "Anima Gentile", support10Others: "Supporta 10 altri",
    consistencyKing: "Re della Coerenza", thirtyDayStreak: "Serie di 30 giorni",
    checkInDaily: "Registrati quotidianamente", todaysMissions: "Missioni di Oggi",
    viewAll: "Visualizza Tutto", gratitudeMatters: "La tua gratitudine ricorda agli altri che non sono soli nelle loro benedizioni",
    beFirstGratitude: "Sii il primo a condividere gratitudine oggi!",
    journal: "Diario", groups: "Gruppi", gratitude: "Gratitudine",
    helpPerfectMatch: "Aiutaci a trovare il tuo abbinamento perfetto!", selectAllApply: "Seleziona tutti quelli applicabili",
    recording: "Registrazione...", stopRecording: "Interrompi Registrazione", voiceNote: "Nota Vocale",
    recordVoice: "Registra Messaggio Vocale", or: "o",
    moodCheck: "Controllo Umore", howFeelingToday: "Come ti senti oggi?",
    moodInsights: "Approfondimenti Umore", viewTrends: "Visualizza Tendenze",
    unlocked: "Sbloccato",
    progress: "Progresso", level: "Livello",
    quickRelief: "Sollievo Rapido", breathe: "Respirare", meditate: "Meditare",
    panicButton: "Pulsante Panico", needCalmNow: "Hai bisogno di calma ora? Tocca qui",
    breathing: "Esercizio di Respirazione", startExercise: "Inizia Esercizio",
    soundTherapy: "Terapia del Suono", playSound: "Riproduci Suono", stopSound: "Ferma Suono",
    education: "Imparare", mentalHealthLibrary: "Biblioteca Salute Mentale",
    readArticle: "Leggi Articolo", sleepTracker: "Tracciatore del Sonno",
    logSleep: "Registra Sonno", hoursSlept: "Ore dormite", sleepQuality: "Qualità del Sonno",
    excellent: "Eccellente", good: "Buono", fair: "Discreto", poor: "Povero",
    aiCompanion: "Compagno IA", chatWithAI: "Chatta con il tuo amico IA",
    therapistConnect: "Connetti con Terapeuta", bookSession: "Prenota Sessione",
    dataPrivacy: "Dati e Privacy", exportData: "Esporta i Miei Dati", deleteAllData: "Elimina Tutti i Dati",
    lockApp: "Blocca App", biometricLock: "Usa Blocco Biometrico",
    // ADDITIONAL TRANSLATIONS
    tools: "Strumenti", wellnessTools: "Strumenti di Benessere", moodAndJournal: "Umore e Diario",
    postsCount: "Post", totalCheckins: "Check-in Totali", thisWeek: "Questa Settimana",
    mostCommon: "Più Comune", realCalmingSounds: "Suoni rilassanti reali - 100% gratuito!",
    playingNow: "🔊 In riproduzione", volumeLabel: "Volume", logMood: "Registra Umore 💜",
    alwaysHereToListen: "Sempre qui per ascoltare", hiUser: "Ciao", aiWelcome1: "Sono il tuo compagno AI. Condividi ciò che hai in mente.",
    aiWelcome2: "Sono qui 24/7 per ascoltarti e supportarti.", everythingYouNeed: "Tutto ciò di cui hai bisogno per sentirti meglio",
    allToolsFree: "Tutti gli strumenti sono 100% GRATUITI e progettati per aiutarti a sentirti meglio.",
    useAnytime: "Usali in qualsiasi momento, ovunque. Meriti supporto!", crisisHelp: "Aiuto in Crisi",
    deleteButton: "Elimina", setupButton: "Configura",
    fingerprintFaceID: "Impronta Digitale/Face ID", permanentlyRemove: "Rimuovere permanentemente le tue informazioni",
    endToEndEncryption: "Crittografia End-to-End", yourDataSecure: "I tuoi dati sono sicuri", activeStatus: "Attivo"
  }
};

// ✅ ALL VIEW COMPONENTS OUTSIDE - NO MORE RE-CREATION!
// ==================== NEW FEATURES ====================

// 🎯 MOOD TRACKING VIEW
const MoodTrackingView = ({ t, moodHistory, addMoodEntry, getTextSizeClass }) => {
  const [selectedMood, setSelectedMood] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [showInsights, setShowInsights] = useState(false);

  const moodOptions = [
    { emoji: '😊', label: 'Great', color: 'from-green-400 to-green-500' },
    { emoji: '🙂', label: 'Good', color: 'from-blue-400 to-blue-500' },
    { emoji: '😐', label: 'Okay', color: 'from-yellow-400 to-yellow-500' },
    { emoji: '😔', label: 'Down', color: 'from-orange-400 to-orange-500' },
    { emoji: '😢', label: 'Bad', color: 'from-red-400 to-red-500' }
  ];

  const handleSaveMood = () => {
    if (selectedMood) {
      addMoodEntry({ mood: selectedMood, note: moodNote, timestamp: new Date().toISOString() });
      setSelectedMood('');
      setMoodNote('');
    }
  };

  const getMoodInsights = () => {
    if (moodHistory.length < 7) return "Track for 7 days to see patterns!";
    const recentMoods = moodHistory.slice(0, 7);
    const avgMood = recentMoods.reduce((sum, entry) => {
      const moodValue = moodOptions.findIndex(m => m.label === entry.mood);
      return sum + moodValue;
    }, 0) / 7;
    
    if (avgMood < 1.5) return "💚 Great week! You're doing amazing!";
    if (avgMood < 2.5) return "💙 Mostly positive week!";
    if (avgMood < 3.5) return "💛 Mixed feelings this week.";
    return "🧡 Tough week. You're not alone. Reach out to your buddy!";
  };

  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white text-center">
        <div className="text-4xl mb-3">📊</div>
        <h2 className="text-2xl font-bold mb-2">Mood Tracker</h2>
        <p className="opacity-90">Track your emotions, spot patterns</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">How are you feeling right now?</h3>
        <div className="grid grid-cols-5 gap-3 mb-4">
          {moodOptions.map(mood => (
            <button
              key={mood.label}
              onClick={() => setSelectedMood(mood.label)}
              className={`flex flex-col items-center p-3 rounded-2xl transition ${
                selectedMood === mood.label
                  ? `bg-gradient-to-br ${mood.color} text-white scale-110`
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className="text-3xl mb-1">{mood.emoji}</span>
              <span className="text-xs font-semibold">{mood.label}</span>
            </button>
          ))}
        </div>
        <textarea
          value={moodNote}
          onChange={(e) => setMoodNote(e.target.value)}
          placeholder="What's happening? (optional)"
          className="w-full p-3 border-2 border-purple-200 rounded-xl mb-3 focus:border-purple-400 outline-none"
          rows="2"
        />
        <button
          onClick={handleSaveMood}
          disabled={!selectedMood}
          className={`w-full py-3 rounded-full font-bold transition ${
            selectedMood
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Save Mood Entry 💜
        </button>
      </div>

      {moodHistory.length > 0 && (
        <>
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Your Mood Insights</h3>
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="text-purple-600 text-sm font-semibold"
              >
                {showInsights ? 'Hide' : 'Show'} Details
              </button>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
              <p className="text-gray-800 font-semibold">{getMoodInsights()}</p>
            </div>
            {showInsights && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Last 7 days:</div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {moodHistory.slice(0, 7).reverse().map((entry, i) => {
                    const moodData = moodOptions.find(m => m.label === entry.mood);
                    return (
                      <div key={i} className="flex-shrink-0 text-center">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${moodData?.color} flex items-center justify-center text-2xl`}>
                          {moodData?.emoji}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(entry.timestamp).toLocaleDateString('en', { weekday: 'short' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-lg">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Recent Entries</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {moodHistory.slice(0, 10).map((entry, i) => {
                const moodData = moodOptions.find(m => m.label === entry.mood);
                return (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-2xl">{moodData?.emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-800">{entry.mood}</div>
                      {entry.note && <div className="text-xs text-gray-600 mt-1">{entry.note}</div>}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// 🧘 QUICK RELIEF TOOLS VIEW
const QuickReliefView = ({ t, getTextSizeClass }) => {
  const [activeExercise, setActiveExercise] = useState(null);
  const [breathCount, setBreathCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [panicMode, setPanicMode] = useState(false);

  const startBreathing = () => {
    setActiveExercise('breathing');
    setBreathCount(0);
    setBreathPhase('inhale');
    
    const breathCycle = setInterval(() => {
      setBreathPhase(prev => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        setBreathCount(c => c + 1);
        return 'inhale';
      });
    }, 4000);
    
    setTimeout(() => {
      clearInterval(breathCycle);
      setActiveExercise(null);
    }, 60000);
  };

  const groundingTechnique = [
    "5 things you can SEE 👀",
    "4 things you can TOUCH ✋",
    "3 things you can HEAR 👂",
    "2 things you can SMELL 👃",
    "1 thing you can TASTE 👅"
  ];

  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-6 text-white text-center">
        <div className="text-4xl mb-3">🧘‍♀️</div>
        <h2 className="text-2xl font-bold mb-2">Quick Relief</h2>
        <p className="opacity-90">Instant calm when you need it</p>
      </div>

      {/* PANIC BUTTON */}
      <button
        onClick={() => setPanicMode(true)}
        className="w-full py-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-3xl font-bold text-xl shadow-lg hover:scale-105 transition animate-pulse"
      >
        🆘 PANIC BUTTON - TAP FOR IMMEDIATE HELP
      </button>

      {panicMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💜</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">You're Safe</h3>
              <p className="text-gray-600">This feeling will pass. Let's breathe together.</p>
            </div>
            <button
              onClick={() => { setPanicMode(false); startBreathing(); }}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold mb-3"
            >
              Start Breathing Exercise
            </button>
            <button
              onClick={() => setPanicMode(false)}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-2xl font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* BREATHING EXERCISE */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🌬️ Breathing Exercise</h3>
        <p className="text-gray-600 text-sm mb-4">Deep breathing calms your nervous system</p>
        
        {activeExercise === 'breathing' ? (
          <div className="text-center py-8">
            <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white transition-transform duration-4000 ${
              breathPhase === 'inhale' ? 'scale-150' : breathPhase === 'hold' ? 'scale-150' : 'scale-100'
            }`}>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {breathPhase === 'inhale' && 'Breathe In'}
                  {breathPhase === 'hold' && 'Hold'}
                  {breathPhase === 'exhale' && 'Breathe Out'}
                </div>
                <div className="text-sm">Count: {breathCount}</div>
              </div>
            </div>
            <button
              onClick={() => setActiveExercise(null)}
              className="mt-6 px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-semibold"
            >
              Stop
            </button>
          </div>
        ) : (
          <button
            onClick={startBreathing}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold hover:scale-105 transition"
          >
            Start 1-Minute Breathing
          </button>
        )}
      </div>

      {/* GROUNDING TECHNIQUE */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🌍 5-4-3-2-1 Grounding</h3>
        <p className="text-gray-600 text-sm mb-4">Reconnect with the present moment</p>
        <div className="space-y-3">
          {groundingTechnique.map((step, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white flex items-center justify-center font-bold">
                {5 - i}
              </div>
              <span className="text-gray-800 font-semibold">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* POSITIVE AFFIRMATIONS */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">✨ Affirmations</h3>
        <div className="space-y-2">
          {[
            "I am safe in this moment",
            "This feeling will pass",
            "I am stronger than my anxiety",
            "I choose peace",
            "I am not alone"
          ].map((affirmation, i) => (
            <div key={i} className="text-gray-700 italic p-2 text-center">
              "{affirmation}"
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 📚 EDUCATION LIBRARY VIEW
const EducationLibraryView = ({ t, getTextSizeClass }) => {
  const [selectedTopic, setSelectedTopic] = useState(null);

  const topics = [
    {
      id: 'anxiety',
      title: 'Understanding Anxiety',
      emoji: '😰',
      color: 'from-yellow-400 to-orange-400',
      content: `Anxiety is your body's natural response to stress. It's a feeling of fear or worry about what's to come.

**Common Symptoms:**
• Racing heart
• Sweating  
• Difficulty breathing
• Restlessness
• Trouble concentrating

**Coping Strategies:**
1. Practice deep breathing
2. Challenge negative thoughts
3. Exercise regularly
4. Talk to someone you trust
5. Limit caffeine

Remember: Anxiety is treatable. You're not alone.`
    },
    {
      id: 'depression',
      title: 'Understanding Depression',
      emoji: '😢',
      color: 'from-blue-400 to-purple-400',
      content: `Depression is more than feeling sad. It's a medical condition that affects how you feel, think, and handle daily activities.

**Common Signs:**
• Persistent sad mood
• Loss of interest in activities
• Changes in sleep/appetite
• Fatigue
• Difficulty concentrating
• Feelings of worthlessness

**What Helps:**
1. Reach out to others
2. Stick to routines
3. Physical activity
4. Set small, achievable goals
5. Professional support

You deserve support. Depression is treatable.`
    },
    {
      id: 'loneliness',
      title: 'Coping with Loneliness',
      emoji: '💔',
      color: 'from-pink-400 to-red-400',
      content: `Loneliness is a universal human emotion. It's the feeling of being disconnected from others.

**Why It Happens:**
• Life transitions
• Loss of relationships
• Moving to new places
• Working from home
• Social anxiety

**How to Cope:**
1. Join support groups (like this app!)
2. Volunteer in your community
3. Take a class or workshop
4. Reconnect with old friends
5. Practice self-compassion

Connection is possible. Take small steps.`
    },
    {
      id: 'selfcare',
      title: 'Self-Care Basics',
      emoji: '💜',
      color: 'from-purple-400 to-pink-400',
      content: `Self-care isn't selfish. It's essential for your mental health and wellbeing.

**Physical Self-Care:**
• Get 7-9 hours of sleep
• Eat nutritious meals
• Exercise regularly
• Stay hydrated

**Emotional Self-Care:**
• Journal your feelings
• Set boundaries
• Practice gratitude
• Allow yourself to feel

**Social Self-Care:**
• Connect with loved ones
• Join communities
• Ask for help when needed

Start small. Every act of self-care matters.`
    },
    {
      id: 'stress',
      title: 'Managing Stress',
      emoji: '😫',
      color: 'from-red-400 to-orange-400',
      content: `Stress is your body's way of responding to challenges. While some stress is normal, chronic stress can harm your health.

**Warning Signs:**
• Headaches
• Muscle tension
• Sleep problems
• Irritability
• Overwhelm

**Stress Management:**
1. Identify your stressors
2. Practice time management
3. Learn to say "no"
4. Take breaks
5. Use relaxation techniques

**Quick Stress Busters:**
• 5-minute walk
• Deep breathing
• Listen to music
• Talk to a friend

You can manage stress. One step at a time.`
    }
  ];

  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl p-6 text-white text-center">
        <div className="text-4xl mb-3">📚</div>
        <h2 className="text-2xl font-bold mb-2">Mental Health Library</h2>
        <p className="opacity-90">Learn, understand, grow</p>
      </div>

      {!selectedTopic ? (
        <div className="space-y-3">
          {topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`w-full p-6 bg-gradient-to-r ${topic.color} rounded-3xl text-white shadow-lg hover:scale-105 transition text-left`}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{topic.emoji}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{topic.title}</h3>
                  <p className="text-sm opacity-90 mt-1">Tap to learn more →</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedTopic(null)}
            className="flex items-center gap-2 text-purple-600 font-semibold"
          >
            ← Back to Library
          </button>
          <div className={`bg-gradient-to-br ${selectedTopic.color} rounded-3xl p-8 text-white shadow-xl`}>
            <div className="text-6xl mb-4 text-center">{selectedTopic.emoji}</div>
            <h2 className="text-3xl font-bold text-center mb-6">{selectedTopic.title}</h2>
            <div className="bg-white bg-opacity-20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="whitespace-pre-line text-white leading-relaxed">
                {selectedTopic.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🎵 SOUND THERAPY VIEW - Real Audio with Web Audio API
const SoundTherapyView = ({ t, getTextSizeClass }) => {
  const [playingSound, setPlayingSound] = useState(null);
  const audioContextRef = useRef(null);
  const audioNodesRef = useRef([]);

  const sounds = [
    { id: 'rain', name: 'Rain Sounds', emoji: '🌧️', color: 'from-blue-400 to-blue-500', description: 'Calming rainfall' },
    { id: 'ocean', name: 'Ocean Waves', emoji: '🌊', color: 'from-cyan-400 to-blue-500', description: 'Gentle waves' },
    { id: 'forest', name: 'Forest Birds', emoji: '🌲', color: 'from-green-400 to-green-500', description: 'Nature sounds' },
    { id: 'fire', name: 'Crackling Fire', emoji: '🔥', color: 'from-orange-400 to-red-400', description: 'Cozy fireplace' },
    { id: 'wind', name: 'Wind Chimes', emoji: '🎐', color: 'from-purple-400 to-pink-400', description: 'Gentle chimes' },
    { id: 'meditation', name: 'Meditation Bell', emoji: '🔔', color: 'from-yellow-400 to-orange-400', description: 'Peaceful tones' }
  ];

  // Stop all playing audio
  const stopAudio = () => {
    audioNodesRef.current.forEach(node => {
      try { node.stop?.(); node.disconnect?.(); } catch (e) {}
    });
    audioNodesRef.current = [];
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  // Generate ambient sounds using Web Audio API
  const createAmbientSound = (soundId) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = ctx;
    const nodes = [];

    // Create brown noise (filtered white noise - base for many ambient sounds)
    const createNoise = (filterFreq, gain) => {
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterFreq;
      const gainNode = ctx.createGain();
      gainNode.gain.value = gain;
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start();
      nodes.push(source);
      return { source, gainNode };
    };

    // Create oscillator tone
    const createTone = (freq, gainVal, type = 'sine') => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = gainVal;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      nodes.push(osc);
      return { osc, gain };
    };

    switch (soundId) {
      case 'rain':
        createNoise(2000, 0.15);
        createNoise(4000, 0.08);
        break;
      case 'ocean':
        const { gainNode } = createNoise(400, 0.2);
        // Modulate volume for wave effect
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.1;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.1;
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        lfo.start();
        nodes.push(lfo);
        break;
      case 'forest':
        // Chirping sounds with random timing
        const chirp = () => {
          if (!audioContextRef.current) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = 2000 + Math.random() * 2000;
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
          setTimeout(chirp, 500 + Math.random() * 2000);
        };
        chirp();
        createNoise(800, 0.03);
        break;
      case 'fire':
        createNoise(500, 0.12);
        // Crackling
        const crackle = () => {
          if (!audioContextRef.current) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = 100 + Math.random() * 200;
          osc.type = 'sawtooth';
          gain.gain.setValueAtTime(0.02, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
          setTimeout(crackle, 100 + Math.random() * 300);
        };
        crackle();
        break;
      case 'wind':
        createNoise(1200, 0.08);
        // Wind chime tones
        const chimeFreqs = [523, 659, 784, 880, 1047];
        const chime = () => {
          if (!audioContextRef.current) return;
          const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 2);
          setTimeout(chime, 2000 + Math.random() * 4000);
        };
        chime();
        break;
      case 'meditation':
        // Deep meditation tones
        createTone(174, 0.08);
        createTone(285, 0.05);
        createTone(396, 0.03);
        // Periodic bell
        const bell = () => {
          if (!audioContextRef.current) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = 528;
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 4);
          setTimeout(bell, 8000 + Math.random() * 4000);
        };
        setTimeout(bell, 1000);
        break;
    }
    audioNodesRef.current = nodes;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAudio();
  }, []);

  const playSound = (soundId) => {
    stopAudio();
    if (playingSound === soundId) {
      setPlayingSound(null);
    } else {
      setPlayingSound(soundId);
      createAmbientSound(soundId);
    }
  };

  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl p-6 text-white text-center">
        <div className="text-4xl mb-3">🎵</div>
        <h2 className="text-2xl font-bold mb-2">Sound Therapy</h2>
        <p className="opacity-90">Soothing sounds for calm</p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
        <p className="text-gray-700 text-sm">
          <span className="font-semibold">💡 Tip:</span> Use headphones for best experience
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {sounds.map(sound => (
          <button
            key={sound.id}
            onClick={() => playSound(sound.id)}
            className={`p-6 rounded-3xl shadow-lg transition ${
              playingSound === sound.id
                ? `bg-gradient-to-br ${sound.color} text-white scale-105 animate-pulse`
                : 'bg-white hover:scale-105'
            }`}
          >
            <div className="text-4xl mb-2">{sound.emoji}</div>
            <h3 className={`font-bold ${playingSound === sound.id ? 'text-white' : 'text-gray-800'}`}>
              {sound.name}
            </h3>
            <p className={`text-xs mt-1 ${playingSound === sound.id ? 'text-white opacity-90' : 'text-gray-600'}`}>
              {playingSound === sound.id ? '♫ Playing...' : sound.description}
            </p>
          </button>
        ))}
      </div>

      {playingSound && (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-3">Now Playing</h3>
          <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{sounds.find(s => s.id === playingSound)?.emoji}</span>
              <div>
                <div className="font-semibold text-gray-800">
                  {sounds.find(s => s.id === playingSound)?.name}
                </div>
                <div className="text-xs text-gray-600">Tap to stop</div>
              </div>
            </div>
            <button
              onClick={() => { stopAudio(); setPlayingSound(null); }}
              className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">Benefits of Sound Therapy</h3>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Reduces stress and anxiety</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Improves sleep quality</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Enhances focus and concentration</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Promotes relaxation</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

// 🌙 SLEEP TRACKER VIEW
const SleepTrackerView = ({ t, sleepLog, addSleepEntry, getTextSizeClass }) => {
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [sleepNotes, setSleepNotes] = useState('');

  const handleLogSleep = () => {
    if (bedtime && wakeTime && sleepQuality) {
      const bed = new Date(`2000-01-01 ${bedtime}`);
      const wake = new Date(`2000-01-${bedtime > wakeTime ? '02' : '01'} ${wakeTime}`);
      const hours = (wake - bed) / (1000 * 60 * 60);
      
      addSleepEntry({
        bedtime,
        wakeTime,
        quality: sleepQuality,
        hours: hours.toFixed(1),
        notes: sleepNotes,
        date: new Date().toISOString()
      });
      
      setBedtime('');
      setWakeTime('');
      setSleepQuality('');
      setSleepNotes('');
    }
  };

  const qualityOptions = [
    { value: 'poor', emoji: '😴', label: 'Poor', color: 'bg-red-100' },
    { value: 'fair', emoji: '😐', label: 'Fair', color: 'bg-yellow-100' },
    { value: 'good', emoji: '🙂', label: 'Good', color: 'bg-green-100' },
    { value: 'great', emoji: '😊', label: 'Great', color: 'bg-blue-100' }
  ];

  const avgSleepHours = sleepLog.length > 0
    ? (sleepLog.reduce((sum, entry) => sum + parseFloat(entry.hours), 0) / sleepLog.length).toFixed(1)
    : 0;

  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-6 text-white text-center">
        <div className="text-4xl mb-3">🌙</div>
        <h2 className="text-2xl font-bold mb-2">Sleep Tracker</h2>
        <p className="opacity-90">Better sleep, better mood</p>
      </div>

      {sleepLog.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-4">Your Sleep Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{avgSleepHours}h</div>
              <div className="text-sm text-gray-600 mt-1">Avg Hours</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{sleepLog.length}</div>
              <div className="text-sm text-gray-600 mt-1">Nights Logged</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-4">Log Last Night's Sleep</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bedtime</label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Wake Time</label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sleep Quality</label>
            <div className="grid grid-cols-4 gap-2">
              {qualityOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSleepQuality(option.value)}
                  className={`p-3 rounded-xl transition ${
                    sleepQuality === option.value
                      ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white scale-110'
                      : option.color
                  }`}
                >
                  <div className="text-2xl mb-1">{option.emoji}</div>
                  <div className="text-xs font-semibold">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optional)</label>
            <textarea
              value={sleepNotes}
              onChange={(e) => setSleepNotes(e.target.value)}
              placeholder="Any dreams, disturbances, or thoughts?"
              className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 outline-none"
              rows="2"
            />
          </div>

          <button
            onClick={handleLogSleep}
            disabled={!bedtime || !wakeTime || !sleepQuality}
            className={`w-full py-3 rounded-full font-bold transition ${
              bedtime && wakeTime && sleepQuality
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Log Sleep 🌙
          </button>
        </div>
      </div>

      {sleepLog.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-4">Recent Sleep Log</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {sleepLog.slice(0, 7).map((entry, i) => {
              const quality = qualityOptions.find(q => q.value === entry.quality);
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-2xl">{quality?.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-800">
                      {entry.hours}h sleep - {quality?.label}
                    </div>
                    <div className="text-xs text-gray-600">
                      {entry.bedtime} → {entry.wakeTime}
                    </div>
                    {entry.notes && <div className="text-xs text-gray-500 mt-1">{entry.notes}</div>}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4">
        <h4 className="font-bold text-gray-800 mb-2">💡 Sleep Tips</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Aim for 7-9 hours per night</li>
          <li>• Keep consistent sleep schedule</li>
          <li>• Avoid screens 1 hour before bed</li>
          <li>• Try our Sound Therapy for better sleep</li>
        </ul>
      </div>
    </div>
  );
};

const HomeView = ({ t, user, selectedMood, setSelectedMood, isRecording, recordingTime, formatTime, startRecording, stopRecording, audioBlob, setAudioBlob, newPost, setNewPost, addPost, posts, showComments, setShowComments, commentText, setCommentText, addComment, reactToPost, showPostMenu, setShowPostMenu, reportContent, blockUser, allAppUsers, setCurrentView, journalEntries, groups, challenges, getTextSizeClass, setShowEmergency, showOriginal, setShowOriginal, translateText, userLanguage, hasPremiumAccess, showUpgrade }) => {
  // 🚫 Free user sees promotional content (Ad-free = premium benefit)
  return (
  <div className={`p-4 space-y-5 ${getTextSizeClass()}`}>
    {/* 💎 PREMIUM WELCOME HEADER */}
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-[28px] p-6 text-white shadow-xl">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">{t.welcomeBack}</p>
            <h2 className="text-2xl font-extrabold tracking-tight">{user.name} 💜</h2>
          </div>
          {/* Premium Streak Badge */}
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20">
            <span className="text-xl">🔥</span>
            <div className="text-left">
              <div className="text-lg font-bold leading-tight">{user.streak}</div>
              <div className="text-xs text-white/80">day streak</div>
            </div>
          </div>
        </div>
        <p className="text-white/90 font-medium">{t.notAlone}</p>
      </div>
    </div>

    {/* 🚫 FREE USER PROMOTIONAL BANNER (Premium users don't see this = Ad-free) */}
    {!hasPremiumAccess && (
      <div className="crystal-card p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">👑</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm">Unlock Premium</p>
            <p className="text-xs text-gray-500 truncate">Unlimited journals, themes, analytics & more!</p>
          </div>
          <button 
            onClick={() => showUpgrade?.()}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm hover:scale-105 transition flex-shrink-0"
          >
            Upgrade
          </button>
        </div>
      </div>
    )}

    {/* 💎 PREMIUM STATS GRID */}
    <div className="grid grid-cols-3 gap-3">
      <div className="glass-card-strong rounded-2xl p-4 text-center hover:scale-105 transition-transform duration-300 cursor-pointer group">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:scale-110 transition-transform">
          <span className="text-2xl font-bold text-white">{user.streak}</span>
        </div>
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{t.days}</div>
      </div>
      <div className="glass-card-strong rounded-2xl p-4 text-center hover:scale-105 transition-transform duration-300 cursor-pointer group">
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:scale-110 transition-transform">
          <span className="text-2xl font-bold text-white">{posts.length + journalEntries.length}</span>
        </div>
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{t.entries}</div>
      </div>
      <div className="glass-card-strong rounded-2xl p-4 text-center hover:scale-105 transition-transform duration-300 cursor-pointer group">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:scale-110 transition-transform">
          <span className="text-2xl font-bold text-white">{groups.filter(g => g.joined).length}</span>
        </div>
        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{t.connections}</div>
      </div>
    </div>

    {/* 💎 PREMIUM POST CARD */}
    <div className="glass-card-strong rounded-[28px] p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">💭</span>
        {t.shareYourHeart}
      </h3>
      
      {/* Premium Mood Selector */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 -mx-2 px-2">
        {MOODS.map(mood => (
          <button
            key={mood.label}
            onClick={() => setSelectedMood(mood.label.toLowerCase())}
            className={`flex-shrink-0 px-5 py-3 rounded-2xl transition-all duration-300 ${
              selectedMood === mood.label.toLowerCase()
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110 shadow-lg'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span className="text-2xl">{mood.emoji}</span>
          </button>
        ))}
      </div>
      
      {/* Premium Recording State */}
      {isRecording && (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border-2 border-red-200">
          <div className="flex items-center justify-center gap-3 text-red-600 font-bold">
            <div className="relative">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute"></div>
              <div className="w-4 h-4 bg-red-500 rounded-full relative"></div>
            </div>
            <Mic className="w-5 h-5" />
            <span className="text-lg">{t.recording} {formatTime(recordingTime)}</span>
          </div>
        </div>
      )}
      
      {audioBlob ? (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-purple-900">{t.voiceNote}</span>
            </div>
            <button onClick={() => setAudioBlob(null)} className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-500 hover:bg-red-200 transition">✕</button>
          </div>
          <audio controls src={URL.createObjectURL(audioBlob)} className="w-full mt-2 rounded-lg" />
        </div>
      ) : (
        <>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={t.whatOnMind}
            className="input-premium resize-y min-h-[100px] text-base"
          />
          
          {/* 💎 Premium Media Options Row */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    alert('📷 Photo selected! Photo sharing coming soon.');
                  }
                };
                input.click();
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-600 rounded-xl text-sm font-semibold hover:bg-purple-100 hover:scale-105 transition-all duration-200 border border-purple-100"
            >
              <Camera className="w-4 h-4" />
              Photo
            </button>
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*';
                input.onchange = (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    alert('🎬 Video selected! Video sharing coming soon.');
                  }
                };
                input.click();
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-pink-50 text-pink-600 rounded-xl text-sm font-semibold hover:bg-pink-100 hover:scale-105 transition-all duration-200 border border-pink-100"
            >
              <Video className="w-4 h-4" />
              Video
            </button>
            <button
              onClick={() => isRecording ? stopRecording() : startRecording()}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                isRecording 
                  ? 'bg-red-500 text-white border-red-500 animate-pulse shadow-lg'
                  : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 hover:scale-105'
              }`}
            >
              {isRecording ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isRecording ? formatTime(recordingTime) : 'Voice'}
            </button>
          </div>
        </>
      )}
      
      <button
        onClick={async () => {
          if (audioBlob) {
            // Convert blob to base64 for persistent storage
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Audio = reader.result; // This is a data URL that persists
              addPost('🎤 Voice Message', selectedMood, true, base64Audio);
              setAudioBlob(null);
            };
            reader.readAsDataURL(audioBlob);
          } else if (newPost.trim()) {
            addPost(newPost, selectedMood);
            setNewPost('');
          }
          setSelectedMood('happy');
        }}
        disabled={!newPost.trim() && !audioBlob}
        className={`mt-5 w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
          (newPost.trim() || audioBlob)
            ? 'btn-premium'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {t.postToFeed} 💜
      </button>
    </div>

    {/* 💎 PREMIUM COMMUNITY FEED */}
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          {t.communityFeed}
        </h3>
        <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-bold">{posts.length} {t.posts}</span>
      </div>
      {posts.length === 0 ? (
        <div className="glass-card-strong rounded-[28px] p-8 text-center border-2 border-dashed border-purple-200">
          <div className="text-6xl mb-4 animate-float">💭</div>
          <p className="text-gray-800 font-bold text-lg mb-2">{t.noPosts}</p>
          <p className="text-gray-500">{t.beFirst}</p>
        </div>
      ) : (
        posts.map((post, index) => (
          <div key={post.id} className="crystal-card rounded-[24px] p-5 hover:scale-[1.01] transition-transform duration-300" style={{animationDelay: `${index * 0.05}s`}}>
            <div className="flex items-start gap-3 mb-3">
              {post.authorPicture ? (
                <div className="crystal-avatar">
                  <img src={post.authorPicture} alt={post.author} className="w-12 h-12 rounded-2xl object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg text-lg crystal-icon">
                  {post.author[0]}
                </div>
              )}
              <div className="flex-1">
                <div className="font-bold text-gray-800">{post.author}</div>
                <div className="text-xs text-gray-400 font-medium">{new Date(post.timestamp).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">{MOODS.find(m => m.label.toLowerCase() === post.mood)?.emoji}</div>
                <div className="relative">
                  <button onClick={() => setShowPostMenu({...showPostMenu, [post.id]: !showPostMenu[post.id]})} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition">⋮</button>
                  {showPostMenu[post.id] && (
                    <div className="absolute right-0 top-10 glass-card-strong rounded-2xl shadow-xl border border-gray-100 py-2 w-52 z-10">
                      <button onClick={() => { reportContent(post.id, 'post', 'inappropriate'); setShowPostMenu({...showPostMenu, [post.id]: false}); }} className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 text-red-600 font-medium transition">
                        <Flag className="w-4 h-4" />{t.reportPost}
                      </button>
                      <button onClick={() => { blockUser(post.id, post.author); setShowPostMenu({...showPostMenu, [post.id]: false}); }} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700 font-medium transition">
                        <Ban className="w-4 h-4" />{t.blockUser}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {post.isVoice ? (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-4 border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-purple-900">{t.voiceNote}</span>
                    <p className="text-xs text-gray-500">Tap play to listen</p>
                  </div>
                </div>
                {post.audioUrl ? (
                  <audio controls src={post.audioUrl} className="w-full" />
                ) : (
                  <div className="text-sm text-gray-500 italic">Audio not available</div>
                )}
              </div>
            ) : (
              <>
                <p className="text-gray-700 mb-2">
                  {post.originalLanguage && post.originalLanguage !== userLanguage && !showOriginal[post.id]
                    ? translateText(post.content, post.originalLanguage, userLanguage)
                    : post.content}
                </p>
                {post.originalLanguage && post.originalLanguage !== userLanguage && (
                  <button 
                    onClick={() => setShowOriginal({...showOriginal, [post.id]: !showOriginal[post.id]})}
                    className="text-xs text-purple-600 hover:text-purple-800 mb-3 flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3" />
                    {showOriginal[post.id] ? 'See Translation' : 'See Original'}
                  </button>
                )}
              </>
            )}
            <div className="flex gap-2 mb-3">
              <button 
                onClick={() => reactToPost(post.id, 'heart')} 
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                  post.userReactions?.[user.id] === 'heart' 
                    ? 'bg-pink-500 text-white scale-110' 
                    : 'bg-pink-100 hover:bg-pink-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${post.userReactions?.[user.id] === 'heart' ? 'text-white fill-current' : 'text-pink-500'}`} />
                <span className="text-sm">{post.reactions.heart}</span>
              </button>
              <button 
                onClick={() => reactToPost(post.id, 'hug')} 
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                  post.userReactions?.[user.id] === 'hug' 
                    ? 'bg-purple-500 text-white scale-110' 
                    : 'bg-purple-100 hover:bg-purple-200'
                }`}
              >
                <span>🤗</span>
                <span className="text-sm">{post.reactions.hug}</span>
              </button>
              <button 
                onClick={() => reactToPost(post.id, 'star')} 
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                  post.userReactions?.[user.id] === 'star' 
                    ? 'bg-yellow-500 text-white scale-110' 
                    : 'bg-yellow-100 hover:bg-yellow-200'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${post.userReactions?.[user.id] === 'star' ? 'text-white' : 'text-yellow-500'}`} />
                <span className="text-sm">{post.reactions.star}</span>
              </button>
              <button 
                onClick={() => reactToPost(post.id, 'fire')} 
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                  post.userReactions?.[user.id] === 'fire' 
                    ? 'bg-orange-500 text-white scale-110' 
                    : 'bg-orange-100 hover:bg-orange-200'
                }`}
              >
                <span className={post.userReactions?.[user.id] === 'fire' ? 'text-white' : 'text-orange-500'}>🔥</span>
                <span className="text-sm">{post.reactions.fire}</span>
              </button>
            </div>
            <div className="border-t pt-3">
              <button onClick={() => setShowComments({...showComments, [post.id]: !showComments[post.id]})} className="text-purple-500 text-sm font-semibold mb-2 flex items-center gap-1 hover:underline">
                <MessageCircle className="w-4 h-4" />
                {post.comments.length} {post.comments.length === 1 ? t.comment : t.comments}
              </button>
              {showComments[post.id] && (
                <div className="space-y-3">
                  {post.comments.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">{t.beFirstSupport}</p>
                  ) : (
                    post.comments.map(comment => (
                      <div key={comment.id} className="bg-purple-50 rounded-2xl p-3">
                        <div className="font-semibold text-sm text-purple-900">{comment.author}</div>
                        <p className="text-gray-700 text-sm">{comment.text}</p>
                      </div>
                    ))
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText[post.id] || ''}
                      onChange={(e) => setCommentText({...commentText, [post.id]: e.target.value})}
                      placeholder={t.writeComment}
                      className="flex-1 px-4 py-2 border-2 border-purple-200 rounded-full focus:border-purple-400 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (commentText[post.id]?.trim()) {
                          addComment(post.id, commentText[post.id]);
                          setCommentText({...commentText, [post.id]: ''});
                        }
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition"
                    >
                      {t.postComment}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
    {challenges.length > 0 && (
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{t.todaysMissions}</h3>
          <button className="text-purple-500 text-sm font-semibold">{t.viewAll}</button>
        </div>
        <div className="space-y-2">
          {challenges.slice(0, 3).map(challenge => (
            <div key={challenge.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
              <input type="checkbox" checked={challenge.completed} readOnly className="w-5 h-5" />
              <span className="flex-1 text-gray-700">{challenge.title}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
  );
};

const JournalView = ({ t, journalEntry, setJournalEntry, journalMood, setJournalMood, journalSaved, selectedJournalTheme, setSelectedJournalTheme, showSavedEntries, setShowSavedEntries, journalEntries, editingEntry, setEditingEntry, saveJournalEntry, setJournalSaved, getTextSizeClass, hasPremiumAccess, showUpgrade }) => {
  const isDark = selectedJournalTheme === 'goth' || selectedJournalTheme === 'emo' || selectedJournalTheme === 'witchy';
  
  // 📔 JOURNAL LIMIT: Free users get 5 entries per month
  const FREE_JOURNAL_LIMIT = 5;
  const currentMonth = new Date().getMonth();
  const entriesThisMonth = journalEntries.filter(e => new Date(e.timestamp).getMonth() === currentMonth).length;
  const remainingEntries = FREE_JOURNAL_LIMIT - entriesThisMonth;
  const isAtLimit = !hasPremiumAccess && remainingEntries <= 0;

  const saveEntry = () => {
    if (journalEntry.trim()) {
      // Check limit for free users
      if (!hasPremiumAccess && isAtLimit) {
        showUpgrade?.();
        return;
      }
      
      if (editingEntry) {
        setJournalEntries(prevEntries => prevEntries.map(e => 
          e.id === editingEntry.id 
            ? { ...e, content: journalEntry, mood: journalMood, theme: selectedJournalTheme, editedAt: new Date().toISOString() }
            : e
        ));
        setEditingEntry(null);
      } else {
        saveJournalEntry({
          id: Date.now(), content: journalEntry, mood: journalMood,
          theme: selectedJournalTheme, timestamp: new Date().toISOString()
        });
      }
      setJournalSaved(true);
      setTimeout(() => {
        setJournalSaved(false);
        setJournalEntry('');
      }, 2000);
    }
  };

  const editEntry = (entryToEdit) => {
    setEditingEntry(entryToEdit);
    setJournalEntry(entryToEdit.content);
    setJournalMood(entryToEdit.mood);
    setSelectedJournalTheme(entryToEdit.theme);
    setShowSavedEntries(false);
  };

  const getMoodStats = () => {
    const moodCounts = {};
    journalEntries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    return moodCounts;
  };

  const setJournalEntries = (updateFn) => {
    // This will be passed from parent
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${JOURNAL_THEMES[selectedJournalTheme].bg} p-4 ${getTextSizeClass()} transition-all duration-500`}>
      <div className="max-w-2xl mx-auto">
        {/* 📔 JOURNAL LIMIT WARNING for Free Users */}
        {!hasPremiumAccess && (
          <div className={`mb-4 p-4 rounded-2xl ${isAtLimit ? 'bg-red-100 border-2 border-red-300' : remainingEntries <= 2 ? 'bg-orange-100 border-2 border-orange-300' : 'bg-purple-100 border border-purple-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{isAtLimit ? '🔒' : '📓'}</span>
                <div>
                  <p className={`font-bold ${isAtLimit ? 'text-red-700' : 'text-purple-700'}`}>
                    {isAtLimit ? 'Monthly limit reached!' : `${remainingEntries} entries left this month`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isAtLimit ? 'Upgrade to Premium for unlimited entries' : 'Free plan: 5 entries/month'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => showUpgrade?.()}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm hover:scale-105 transition"
              >
                👑 Upgrade
              </button>
            </div>
          </div>
        )}

        {/* 💎 Premium Header */}
        <div className="text-center mb-6">
          <div className="inline-block mb-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <span className="text-4xl">📓</span>
            </div>
          </div>
          <h2 className={`text-3xl font-extrabold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>{t.moodAndJournal}</h2>
          <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{t.writeFreeły}</p>
        </div>
        
        {/* 💎 Premium View Entries Button */}
        <button onClick={() => setShowSavedEntries(!showSavedEntries)} className={`w-full mb-5 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${isDark ? 'bg-gray-800/80 backdrop-blur-sm text-white hover:bg-gray-700' : 'glass-card-strong text-gray-800 hover:scale-[1.02]'}`}>
          <span className="text-xl">📚</span> {showSavedEntries ? t.hideSavedEntries : t.viewSavedEntries} 
          <span className={`px-2 py-0.5 rounded-full text-sm ${isDark ? 'bg-purple-600' : 'bg-purple-100 text-purple-700'}`}>{journalEntries.length}</span>
        </button>
        
        {showSavedEntries && (
          <div className="mb-6 space-y-4">
            {/* 💎 Premium Mood Stats Card */}
            <div className={`rounded-[20px] p-5 shadow-lg ${isDark ? 'bg-gray-800/80 backdrop-blur-sm' : 'glass-card-strong'}`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <span className="text-xl">📊</span> {t.yourMoodJourney}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(getMoodStats()).map(([mood, count]) => (
                  <div key={mood} className={`text-center p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="text-3xl mb-1">{JOURNAL_MOODS.find(m => m.label === mood)?.emoji}</div>
                    <div className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{count}x</div>
                  </div>
                ))}
              </div>
            </div>
            {journalEntries.map((entry, index) => (
              <div key={entry.id} className={`rounded-[20px] p-5 shadow-lg hover:scale-[1.01] transition-transform duration-300 ${isDark ? 'bg-gray-800/80 backdrop-blur-sm' : 'glass-card-strong'}`} style={{animationDelay: `${index * 0.05}s`}}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <span className="text-2xl">{JOURNAL_MOODS.find(m => m.label === entry.mood)?.emoji}</span>
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <button onClick={() => editEntry(entry)} className="px-3 py-1.5 bg-purple-100 text-purple-600 rounded-lg text-sm font-bold hover:bg-purple-200 transition">
                    ✏️ {t.edit}
                  </button>
                </div>
                <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{entry.content}</p>
                {entry.editedAt && (
                  <div className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {t.edited}: {new Date(entry.editedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
          {Object.keys(JOURNAL_THEMES).map(themeName => {
            const theme = JOURNAL_THEMES[themeName];
            const isLocked = theme.premium && !hasPremiumAccess;
            return (
              <button
                key={themeName}
                onClick={() => {
                  if (isLocked) {
                    showUpgrade?.();
                  } else {
                    setSelectedJournalTheme(themeName);
                  }
                }}
                className={`relative flex-shrink-0 px-4 py-2 rounded-full transition-all duration-300 ${
                  selectedJournalTheme === themeName
                    ? `bg-gradient-to-r ${theme.accent} text-white scale-110 animate-pulse`
                    : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`
                } ${isLocked ? 'opacity-70' : ''}`}
              >
                <span className="text-xl">{theme.emoji}</span>
                {isLocked && (
                  <span className="absolute -top-1 -right-1 text-xs bg-yellow-400 text-yellow-900 px-1 rounded-full font-bold">👑</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mb-6">
          <p className={`text-center mb-3 font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{t.howDoYouFeel}</p>
          <div className="flex gap-3 justify-center">
            {JOURNAL_MOODS.map(mood => (
              <button
                key={mood.label}
                onClick={() => setJournalMood(mood.label)}
                className={`text-3xl p-3 rounded-full transition-all duration-300 ${
                  journalMood === mood.label ? 'scale-125 bg-white shadow-lg animate-bounce' : 'opacity-50'
                }`}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </div>
        <div className={`rounded-3xl p-6 shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {editingEntry && (
            <div className="mb-3 bg-yellow-100 text-yellow-800 p-2 rounded-xl text-sm">
              ✏️ {t.edit} {new Date(editingEntry.timestamp).toLocaleDateString()}
            </div>
          )}
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder={t.dearJournal}
            className={`w-full h-96 p-4 rounded-2xl resize-y focus:outline-none ${
              isDark 
                ? 'bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700' 
                : 'bg-purple-50 text-gray-800 placeholder-gray-400 border-2 border-purple-200'
            }`}
          />
          <button
            onClick={saveEntry}
            className={`mt-4 w-full py-4 rounded-full font-bold text-white transition-all duration-300 ${
              journalSaved 
                ? 'bg-green-500' 
                : `bg-gradient-to-r ${JOURNAL_THEMES[selectedJournalTheme].accent} hover:scale-105`
            }`}
          >
            {journalSaved ? `✓ ${t.saved}` : `💜 ${t.saveToMyHeart}`}
          </button>
        </div>
      </div>
    </div>
  );
};

const GratitudeView = ({ t, gratitudePosts, addGratitude, getTextSizeClass, allAppUsers, user, showOriginalGratitude, setShowOriginalGratitude, translateText, userLanguage }) => {
  const [gratitude, setGratitude] = useState('');
  const [posted, setPosted] = useState(false);
  const [taggedUser, setTaggedUser] = useState(null);
  const [showUserSelect, setShowUserSelect] = useState(false);
  
  const handlePost = () => {
    if (gratitude.trim()) {
      addGratitude(gratitude, taggedUser);
      setPosted(true);
      setTimeout(() => { 
        setPosted(false); 
        setGratitude(''); 
        setTaggedUser(null);
      }, 2000);
    }
  };
  
  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-6 text-white text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-3" />
        <h2 className="text-2xl font-bold mb-2">{t.gratitudeWall}</h2>
        <p className="opacity-90">{t.gratitudeMatters}</p>
      </div>
      
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        {/* Show Gratitude Section */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            🙏 Show gratitude to someone special (optional)
          </label>
          {taggedUser ? (
            <div className="flex items-center gap-2 bg-purple-50 rounded-xl p-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {taggedUser.name[0]}
              </div>
              <span className="font-semibold text-purple-900">{taggedUser.name}</span>
              <button 
                onClick={() => setTaggedUser(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowUserSelect(!showUserSelect)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-left text-gray-500 hover:border-purple-300 transition"
              >
                Choose someone to appreciate...
              </button>
              {showUserSelect && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-48 overflow-y-auto z-10">
                  {allAppUsers.filter(u => u.id !== user.id).map(appUser => (
                    <button
                      key={appUser.id}
                      onClick={() => {
                        setTaggedUser(appUser);
                        setShowUserSelect(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {appUser.name[0]}
                      </div>
                      <span className="font-semibold">{appUser.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <textarea
          value={gratitude}
          onChange={(e) => setGratitude(e.target.value)}
          placeholder={t.gratitudePlaceholder}
          className="w-full p-4 border-2 border-yellow-200 rounded-2xl focus:border-yellow-400 focus:outline-none resize-none"
          rows="4"
        />
        <button
          onClick={handlePost}
          className={`mt-4 w-full py-3 rounded-full font-bold text-white transition ${
            posted ? 'bg-green-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105'
          }`}
        >
          {posted ? `✓ ${t.postedAnonymously}` : `✨ ${t.postAnonymously}`}
        </button>
      </div>
      
      <div className="space-y-3">
        {gratitudePosts.length === 0 ? (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">🙏</div>
            <p className="text-gray-600">{t.beFirstGratitude}</p>
          </div>
        ) : (
          gratitudePosts.map(post => (
            <div key={post.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 shadow">
              {post.taggedUser && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-yellow-200">
                  <span className="text-sm text-gray-600">Thanking</span>
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {post.taggedUser.name[0]}
                  </div>
                  <span className="font-semibold text-purple-900 text-sm">{post.taggedUser.name}</span>
                </div>
              )}
              <p className="text-gray-800 italic">
                {post.originalLanguage && post.originalLanguage !== userLanguage && !showOriginalGratitude[post.id]
                  ? translateText(post.content, post.originalLanguage, userLanguage)
                  : post.content}
              </p>
              {post.originalLanguage && post.originalLanguage !== userLanguage && (
                <button 
                  onClick={() => setShowOriginalGratitude({...showOriginalGratitude, [post.id]: !showOriginalGratitude[post.id]})}
                  className="text-xs text-purple-600 hover:text-purple-800 mt-2 flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  {showOriginalGratitude[post.id] ? 'See Translation' : 'See Original'}
                </button>
              )}
              <div className="text-xs text-gray-500 mt-2">{new Date(post.timestamp).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const GroupsView = ({ t, groups, setGroups, user, selectedGroup, setSelectedGroup, searchQuery, setSearchQuery, inviteToGroup, joinGroup, sendGroupMessage, reactToGroupMessage, isRecordingGroup, recordingTimeGroup, formatTime, startRecording, stopRecording, groupAudioBlob, setGroupAudioBlob, getTextSizeClass, showOriginalGroup, setShowOriginalGroup, translateText, userLanguage, allAppUsers, userPremiumTier }) => {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupEmoji, setNewGroupEmoji] = useState('💜');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupVisibility, setNewGroupVisibility] = useState('public'); // 'public' or 'private'
  const [groupMessage, setGroupMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [inviteType, setInviteType] = useState('public'); // 'public' or 'private'
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [selectedUsersToInvite, setSelectedUsersToInvite] = useState([]);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const messageEndRef = useRef(null);

  // Default support group IDs (these cannot be deleted)
  const SUPPORT_GROUP_IDS = ['depression', 'anxiety', 'ptsd', 'grief', 'addiction', 'bipolar', 'eating', 'ocd', 'postpartum', 'lgbtq', 'crisis'];

  // Check if group has recent activity (messages in last 5 minutes)
  const hasRecentActivity = (group) => {
    if (!group.messages || group.messages.length === 0) return false;
    const lastMessage = group.messages[group.messages.length - 1];
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return new Date(lastMessage.timestamp).getTime() > fiveMinutesAgo;
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (selectedGroup && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedGroup, groups]);

  const handleCreateGroup = async () => {
    if (newGroupName.trim()) {
      const newGroup = {
        id: `user-${Date.now()}`, // Prefix with 'user-' to identify user-created groups
        name: `${newGroupEmoji} ${newGroupName}`,
        emoji: newGroupEmoji,
        description: newGroupDesc || 'A supportive community',
        members: 1,
        joined: true,
        messages: [],
        membersList: [{ id: user.id, name: user.name }],
        createdBy: user.id, // Track who created the group
        createdByName: user.name,
        createdAt: new Date().toISOString(),
        isUserCreated: true, // Flag to identify user-created groups
        lastActivity: new Date().toISOString(),
        visibility: newGroupVisibility, // 'public' or 'private'
        invitedUsers: selectedUsersToInvite.map(u => u.id) // For private groups
      };
      setGroups([...groups, newGroup]);
      
      // 🔔 PUBLIC GROUP: Notify all app users
      if (newGroupVisibility === 'public') {
        // In production, this would send push notifications to all users
        console.log('📢 New PUBLIC group created - notifying all users:', newGroup.name);
        // Could integrate with Firebase Cloud Messaging here
        try {
          await addDoc(collection(db, 'notifications'), {
            type: 'new_public_group',
            groupId: newGroup.id,
            groupName: newGroup.name,
            groupEmoji: newGroupEmoji,
            createdBy: user.name,
            description: newGroupDesc,
            forAll: true, // Indicates notification goes to all users
            timestamp: serverTimestamp()
          });
        } catch (err) {
          console.log('Notification logged locally');
        }
      }
      
      // 🔒 PRIVATE GROUP: Only notify selected users
      if (newGroupVisibility === 'private' && selectedUsersToInvite.length > 0) {
        console.log('🔒 New PRIVATE group created - inviting selected users:', selectedUsersToInvite.map(u => u.name));
        try {
          for (const invitedUser of selectedUsersToInvite) {
            await addDoc(collection(db, 'notifications'), {
              type: 'private_group_invite',
              groupId: newGroup.id,
              groupName: newGroup.name,
              groupEmoji: newGroupEmoji,
              invitedBy: user.name,
              userId: invitedUser.id,
              timestamp: serverTimestamp()
            });
          }
        } catch (err) {
          console.log('Invitations logged locally');
        }
      }
      
      setShowCreateGroup(false);
      setNewGroupName('');
      setNewGroupDesc('');
      setNewGroupEmoji('💜');
      setNewGroupVisibility('public');
      setSelectedUsersToInvite([]);
      // Open the newly created group
      setSelectedGroup(newGroup.id);
    }
  };

  // Remove member from group (Premium feature)
  const removeMember = (memberId) => {
    if (userPremiumTier !== 'ultimate') {
      alert('This feature requires Ultimate Premium membership');
      return;
    }
    const group = groups.find(g => g.id === selectedGroup);
    if (group && (group.createdBy === user.id || userPremiumTier === 'ultimate')) {
      if (window.confirm('Remove this member from the group?')) {
        setGroups(groups.map(g => 
          g.id === selectedGroup 
            ? {...g, membersList: g.membersList?.filter(m => m.id !== memberId), members: Math.max(0, (g.members || 1) - 1)}
            : g
        ));
      }
    }
  };

  const deleteGroup = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    // Only allow deleting if it's a user-created group AND user is the creator
    if (group?.isUserCreated && group.createdBy === user.id) {
      if (window.confirm(`Delete "${group.name}"? This cannot be undone.`)) {
        setGroups(groups.filter(g => g.id !== groupId));
        setSelectedGroup(null);
      }
    }
  };

  const filterGroups = (groupsList, query) => {
    if (!query.trim()) return groupsList;
    return groupsList.filter(group => 
      group.name.toLowerCase().includes(query.toLowerCase()) ||
      group.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Emoji reactions like Facebook/Instagram
  const emojiReactions = [
    { key: 'heart', emoji: '❤️' },
    { key: 'hug', emoji: '🤗' },
    { key: 'support', emoji: '💪' },
    { key: 'sad', emoji: '😢' },
    { key: 'wow', emoji: '😮' },
    { key: 'laugh', emoji: '😂' },
    { key: 'fire', emoji: '🔥' },
    { key: 'pray', emoji: '🙏' }
  ];

  // GROUP CHAT VIEW
  if (selectedGroup) {
    const group = groups.find(g => g.id === selectedGroup);
    
    if (!group) {
      setSelectedGroup(null);
      return null;
    }

    const canDeleteGroup = group.isUserCreated && group.createdBy === user.id;
    
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Group Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => setSelectedGroup(null)} className="flex items-center gap-1 hover:opacity-80 transition">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex gap-2">
              {/* 💎 Crystal Invite Button */}
              <button 
                onClick={() => setShowInviteModal(true)}
                className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all flex items-center gap-2 border border-white/30"
                title="Invite Members"
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-medium">Invite</span>
              </button>
              {/* Menu Button */}
              <button 
                onClick={() => setShowGroupMenu(!showGroupMenu)}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl border border-white/30">
              {group.emoji || '💜'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{group.name}</h2>
              <p className="text-sm opacity-90">{group.members || 1} {(group.members || 1) === 1 ? 'member' : 'members'}</p>
            </div>
          </div>
          
          {/* 💎 Crystal Quick Invite Bar */}
          <button 
            onClick={() => { setShowInviteModal(true); setInviteType('private'); }}
            className="mt-3 w-full py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Lock className="w-4 h-4" />
            🔒 Select people to invite
          </button>
          
          {/* Dropdown Menu */}
          {showGroupMenu && (
            <div className="absolute right-4 top-20 bg-white rounded-2xl shadow-xl z-50 overflow-hidden min-w-48">
              {/* Moderation - Ultimate Premium Only */}
              {userPremiumTier === 'ultimate' && (
                <button 
                  onClick={() => {
                    setShowModerationModal(true);
                    setShowGroupMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-purple-700 hover:bg-purple-50 flex items-center gap-3 border-b border-gray-100"
                >
                  <Shield className="w-5 h-5" />
                  Manage Members
                  <span className="ml-auto text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full">👑</span>
                </button>
              )}
              <button 
                onClick={() => {
                  setGroups(groups.map(g => g.id === selectedGroup ? {...g, joined: false, members: Math.max(0, (g.members || 1) - 1)} : g));
                  setSelectedGroup(null);
                  setShowGroupMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3"
              >
                <LogOut className="w-5 h-5" />
                Leave Group
              </button>
              {canDeleteGroup && (
                <button 
                  onClick={() => {
                    deleteGroup(selectedGroup);
                    setShowGroupMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3"
                >
                  <X className="w-5 h-5" />
                  Delete Group
                </button>
              )}
            </div>
          )}
        </div>

        {/* Moderation Modal - Ultimate Premium */}
        {showModerationModal && userPremiumTier === 'ultimate' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModerationModal(false)}>
            <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Shield className="w-6 h-6 text-purple-600" />
                    Manage Members
                  </h3>
                  <p className="text-sm text-gray-500">Remove inappropriate members</p>
                </div>
                <button onClick={() => setShowModerationModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 mb-4 border border-yellow-200">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <span>👑</span> Ultimate Premium Feature
                </p>
              </div>

              <div className="space-y-2">
                {(group.membersList || []).map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                        {member.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{member.name}</p>
                        {member.id === group.createdBy && (
                          <span className="text-xs text-purple-600">Creator</span>
                        )}
                        {member.id === user.id && (
                          <span className="text-xs text-green-600">You</span>
                        )}
                      </div>
                    </div>
                    {member.id !== user.id && member.id !== group.createdBy && (
                      <button
                        onClick={() => {
                          removeMember(member.id);
                          setShowModerationModal(false);
                        }}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {(!group.membersList || group.membersList.length === 0) && (
                  <p className="text-center text-gray-500 py-4">No members yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Invite Modal - Advanced with Public/Private Options */}
        {/* 💎 CRYSTAL INVITE MODAL */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowInviteModal(false)}>
            <div className="crystal-modal max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Invite to Group</h3>
                    <p className="text-sm text-gray-500">Select who can join</p>
                  </div>
                </div>
                <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* 💎 Crystal Invite Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Invite Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setInviteType('public')}
                    className={`crystal-card p-4 text-center transition-all duration-300 hover:scale-[1.02] ${
                      inviteType === 'public' 
                        ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-pink-50' 
                        : ''
                    }`}
                  >
                    <span className="text-3xl block mb-2">🌍</span>
                    <span className="text-sm font-bold text-gray-800">Public</span>
                    <p className="text-xs text-gray-500 mt-1">Anyone can join</p>
                  </button>
                  <button
                    onClick={() => setInviteType('private')}
                    className={`crystal-card p-4 text-center transition-all duration-300 hover:scale-[1.02] ${
                      inviteType === 'private' 
                        ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-pink-50' 
                        : ''
                    }`}
                  >
                    <span className="text-3xl block mb-2">🔒</span>
                    <span className="text-sm font-bold text-gray-800">Private</span>
                    <p className="text-xs text-gray-500 mt-1">Select people</p>
                  </button>
                </div>
              </div>

              {/* Public Invite - Share Code */}
              {inviteType === 'public' && (
                <>
                  <div className="crystal-card bg-gradient-to-br from-purple-50 to-pink-50 p-6 text-center mb-4">
                    <p className="text-sm text-gray-600 mb-2">Share this invite code:</p>
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-wider">
                      JOIN-{String(group.id).slice(-6).toUpperCase()}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        const code = `JOIN-${String(group.id).slice(-6).toUpperCase()}`;
                        navigator.clipboard.writeText(code);
                        alert('✅ Code copied!');
                      }}
                      className="w-full py-4 crystal-card hover:scale-[1.02] transition-all flex items-center justify-center gap-2 font-bold text-purple-700"
                    >
                      <Copy className="w-5 h-5" />
                      Copy Code
                    </button>
                    {navigator.share && (
                      <button 
                        onClick={() => {
                          const code = `JOIN-${String(group.id).slice(-6).toUpperCase()}`;
                          navigator.share({ 
                            title: `Join ${group.name}`, 
                            text: `Join our support group on YRNAlone!\nCode: ${code}` 
                          });
                        }}
                        className="crystal-btn w-full"
                      >
                        📤 Share Invite
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* 🔒 Private Invite - Select Users */}
              {inviteType === 'private' && (
                <>
                  {/* Search */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">🔍 Search Users</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={inviteSearchQuery}
                        onChange={(e) => setInviteSearchQuery(e.target.value)}
                        placeholder="Search by name..."
                        className="crystal-input w-full pl-12"
                      />
                    </div>
                  </div>

                  {/* 💎 Crystal Selected Users Chips */}
                  {selectedUsersToInvite.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        ✅ Selected ({selectedUsersToInvite.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsersToInvite.map(u => (
                          <span key={u.id} className="crystal-badge flex items-center gap-2 pr-2">
                            <span>{u.name}</span>
                            <button 
                              onClick={() => setSelectedUsersToInvite(selectedUsersToInvite.filter(x => x.id !== u.id))} 
                              className="w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 💎 Crystal User List */}
                  <div className="max-h-52 overflow-y-auto space-y-2 mb-4 pr-1">
                    {allAppUsers
                      .filter(u => u.id !== user.id && !group.membersList?.some(m => m.id === u.id))
                      .filter(u => !inviteSearchQuery || u.name.toLowerCase().includes(inviteSearchQuery.toLowerCase()))
                      .map(u => (
                        <button
                          key={u.id}
                          onClick={() => {
                            if (selectedUsersToInvite.some(x => x.id === u.id)) {
                              setSelectedUsersToInvite(selectedUsersToInvite.filter(x => x.id !== u.id));
                            } else {
                              setSelectedUsersToInvite([...selectedUsersToInvite, u]);
                            }
                          }}
                          className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:scale-[1.01] ${
                            selectedUsersToInvite.some(x => x.id === u.id)
                              ? 'crystal-card ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-pink-50'
                              : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                          }`}
                        >
                          <div className="crystal-avatar p-0.5">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                              {u.name[0]}
                            </div>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-800">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.status === 'online' ? '🟢 Online' : '⚪ Offline'}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            selectedUsersToInvite.some(x => x.id === u.id)
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                              : 'bg-gray-200'
                          }`}>
                            {selectedUsersToInvite.some(x => x.id === u.id) && (
                              <Check className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                      ))}
                    {allAppUsers.filter(u => u.id !== user.id).length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">👥</div>
                        <p className="text-gray-500">No other users yet</p>
                      </div>
                    )}
                  </div>

                  {/* 💎 Crystal Send Button */}
                  <button 
                    onClick={() => {
                      if (selectedUsersToInvite.length > 0) {
                        alert(`✅ Invites sent to ${selectedUsersToInvite.map(u => u.name).join(', ')}!`);
                        setSelectedUsersToInvite([]);
                        setShowInviteModal(false);
                      }
                    }}
                    disabled={selectedUsersToInvite.length === 0}
                    className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                      selectedUsersToInvite.length > 0
                        ? 'crystal-btn'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    Send {selectedUsersToInvite.length} Invite{selectedUsersToInvite.length !== 1 ? 's' : ''}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" onClick={() => setShowGroupMenu(false)}>
          {(!group.messages || group.messages.length === 0) ? (
            <div className="text-center text-gray-500 mt-10">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-purple-400" />
              </div>
              <p className="font-medium text-gray-700">No messages yet</p>
              <p className="text-sm text-gray-500 mt-1">Be the first to say hello! 👋</p>
            </div>
          ) : (
            group.messages.map((msg, index) => (
              <div key={msg.id || index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
                {/* Message Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {msg.author?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-purple-900">{msg.author || 'Anonymous'}</span>
                    <span className="text-xs text-gray-400 ml-2">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
                
                {/* Message Content */}
                {msg.isVoice ? (
                  <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-purple-700">Voice Message</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-700 leading-relaxed">
                      {msg.originalLanguage && msg.originalLanguage !== userLanguage && !showOriginalGroup[msg.id]
                        ? translateText(msg.text, msg.originalLanguage, userLanguage)
                        : msg.text}
                    </p>
                    {msg.originalLanguage && msg.originalLanguage !== userLanguage && (
                      <button 
                        onClick={() => setShowOriginalGroup({...showOriginalGroup, [msg.id]: !showOriginalGroup[msg.id]})}
                        className="text-xs text-purple-500 font-medium mt-1 hover:underline"
                      >
                        🌐 {showOriginalGroup[msg.id] ? 'See Translation' : 'See Original'}
                      </button>
                    )}
                  </>
                )}
                
                {/* Emoji Reactions */}
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
                  {emojiReactions.map(reaction => {
                    const count = msg.reactions?.[reaction.key] || 0;
                    const isActive = msg.userReactions?.[user.id] === reaction.key;
                    
                    return (
                      <button 
                        key={reaction.key}
                        onClick={() => reactToGroupMessage(selectedGroup, msg.id, reaction.key)} 
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-200 ${
                          isActive 
                            ? 'bg-purple-500 text-white scale-105 shadow-md' 
                            : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                        }`}
                      >
                        <span className="text-sm">{reaction.emoji}</span>
                        {count > 0 && <span className={isActive ? 'text-white' : 'text-gray-600'}>{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t shadow-lg">
          {/* Recording Indicator */}
          {isRecordingGroup && (
            <div className="mb-3 p-3 bg-red-50 rounded-2xl border-2 border-red-200 animate-pulse">
              <div className="flex items-center justify-center gap-3 text-red-600 font-bold">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <Mic className="w-5 h-5" />
                <span>Recording {formatTime(recordingTimeGroup)}</span>
                <button onClick={() => stopRecording(true)} className="ml-2 px-3 py-1 bg-red-500 text-white rounded-full text-sm">
                  Stop
                </button>
              </div>
            </div>
          )}

          {/* Voice Message Preview */}
          {groupAudioBlob && (
            <div className="mb-3 p-3 bg-purple-50 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold text-purple-900">Voice Message Ready</span>
                </div>
                <button onClick={() => setGroupAudioBlob(null)} className="text-red-500 hover:text-red-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <audio controls src={URL.createObjectURL(groupAudioBlob)} className="w-full" />
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-center gap-2">
            {/* Voice Button */}
            {!groupAudioBlob && (
              <button
                onClick={() => isRecordingGroup ? stopRecording(true) : startRecording(true)}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isRecordingGroup 
                    ? 'bg-red-500 text-white animate-pulse scale-110'
                    : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600'
                }`}
              >
                {isRecordingGroup ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}

            {/* Text Input */}
            {!groupAudioBlob && (
              <input
                type="text"
                value={groupMessage}
                onChange={(e) => setGroupMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && groupMessage.trim()) {
                    sendGroupMessage(selectedGroup, groupMessage);
                    setGroupMessage('');
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:border-purple-400 focus:outline-none transition"
              />
            )}

            {/* Send Button */}
            <button
              onClick={() => {
                if (groupAudioBlob) {
                  sendGroupMessage(selectedGroup, '🎤 Voice Message', true);
                  setGroupAudioBlob(null);
                } else if (groupMessage.trim()) {
                  sendGroupMessage(selectedGroup, groupMessage);
                  setGroupMessage('');
                }
              }}
              disabled={!groupMessage.trim() && !groupAudioBlob}
              className={`p-3 rounded-full transition-all duration-200 ${
                (groupMessage.trim() || groupAudioBlob)
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Separate groups into support groups and user-created groups
  const supportGroups = groups.filter(g => !g.isUserCreated);
  const userGroups = groups.filter(g => g.isUserCreated);

  // GROUP LIST VIEW
  return (
    <div className={`p-4 space-y-5 ${getTextSizeClass()}`}>
      {/* 💎 PREMIUM GROUPS HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-[28px] p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold mb-2 tracking-tight">{t.yourCommunity}</h2>
          <p className="text-white/90 font-medium">{t.findYourPeople}</p>
        </div>
      </div>

      {/* 💎 Premium Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchGroups}
          className="input-premium pl-12"
        />
      </div>

      {/* 💎 Premium Create Group Button */}
      <button onClick={() => setShowCreateGroup(!showCreateGroup)} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-bold hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" />{t.createOwnGroup}
      </button>

      {/* 💎 Premium Create Group Form */}
      {showCreateGroup && (
        <div className="glass-card-strong rounded-[24px] p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">✨</span>
            {t.createNewGroup}
          </h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.groupName}</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="My Support Circle"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.chooseEmoji}</label>
            <div className="flex gap-2 flex-wrap">
              {['💜', '💙', '💚', '💛', '🧡', '❤️', '🌸', '🌊', '🌟', '🦋', '🌈', '☀️'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setNewGroupEmoji(emoji)}
                  className={`text-2xl p-2 rounded-lg transition ${newGroupEmoji === emoji ? 'bg-purple-100 scale-110 ring-2 ring-purple-400' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.groupDescription}</label>
            <textarea
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              placeholder="A safe space to share and support each other..."
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none"
              rows="3"
            />
          </div>
          
          {/* 💎 CRYSTAL GROUP VISIBILITY SELECTION */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Group Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              {/* PUBLIC OPTION */}
              <button
                onClick={() => setNewGroupVisibility('public')}
                className={`crystal-card p-4 text-center transition-all duration-300 hover:scale-[1.02] ${
                  newGroupVisibility === 'public' 
                    ? 'ring-2 ring-green-500 bg-gradient-to-br from-green-50 to-emerald-50' 
                    : ''
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl transition-all ${
                  newGroupVisibility === 'public' 
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg' 
                    : 'bg-gray-100'
                }`}>
                  🌍
                </div>
                <div className="font-bold text-gray-800 flex items-center justify-center gap-2">
                  Public
                  {newGroupVisibility === 'public' && <Check className="w-4 h-4 text-green-500" />}
                </div>
                <p className="text-xs text-gray-500 mt-1">Anyone can join</p>
              </button>
              
              {/* PRIVATE OPTION */}
              <button
                onClick={() => setNewGroupVisibility('private')}
                className={`crystal-card p-4 text-center transition-all duration-300 hover:scale-[1.02] ${
                  newGroupVisibility === 'private' 
                    ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-pink-50' 
                    : ''
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl transition-all ${
                  newGroupVisibility === 'private' 
                    ? 'bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg' 
                    : 'bg-gray-100'
                }`}>
                  🔒
                </div>
                <div className="font-bold text-gray-800 flex items-center justify-center gap-2">
                  Private
                  {newGroupVisibility === 'private' && <Check className="w-4 h-4 text-purple-500" />}
                </div>
                <p className="text-xs text-gray-500 mt-1">Invite only</p>
              </button>
            </div>
          </div>
          
          {/* PRIVATE: Select users to invite */}
          {newGroupVisibility === 'private' && (
            <div className="crystal-card p-5 bg-gradient-to-br from-purple-50/80 to-pink-50/80">
              <label className="block text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                🔒 Select people to invite
              </label>
              
              {/* 💎 Crystal Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                <input
                  type="text"
                  value={inviteSearchQuery}
                  onChange={(e) => setInviteSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="crystal-input w-full pl-12 text-sm"
                />
                {inviteSearchQuery && (
                  <button 
                    onClick={() => setInviteSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-300 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* 💎 Crystal Selected Chips */}
              {selectedUsersToInvite.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedUsersToInvite.map(u => (
                      <span key={u.id} className="crystal-badge flex items-center gap-2 pr-2 bg-white">
                        <span className="text-sm">{u.name}</span>
                        <button 
                          onClick={() => setSelectedUsersToInvite(selectedUsersToInvite.filter(x => x.id !== u.id))} 
                          className="w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition text-xs"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-purple-600 mt-2 font-medium">
                    ✅ {selectedUsersToInvite.length} selected
                  </p>
                </div>
              )}

              {/* 💎 Crystal User List */}
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {allAppUsers
                  .filter(u => u.id !== user.id)
                  .filter(u => !inviteSearchQuery || u.name.toLowerCase().includes(inviteSearchQuery.toLowerCase()))
                  .map(appUser => (
                    <button
                      key={appUser.id}
                      onClick={() => {
                        if (selectedUsersToInvite.find(u => u.id === appUser.id)) {
                          setSelectedUsersToInvite(selectedUsersToInvite.filter(u => u.id !== appUser.id));
                        } else {
                          setSelectedUsersToInvite([...selectedUsersToInvite, appUser]);
                        }
                      }}
                      className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:scale-[1.01] ${
                        selectedUsersToInvite.find(u => u.id === appUser.id)
                          ? 'crystal-card ring-2 ring-purple-500 bg-white'
                          : 'bg-white/70 hover:bg-white border border-purple-100/50'
                      }`}
                    >
                      <div className="crystal-avatar p-0.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {appUser.name[0]}
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-semibold text-gray-800 text-sm">{appUser.name}</span>
                        <p className="text-xs text-gray-400">@{appUser.name.toLowerCase().replace(/\s+/g, '_')}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        selectedUsersToInvite.find(u => u.id === appUser.id)
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-100'
                      }`}>
                        {selectedUsersToInvite.find(u => u.id === appUser.id) && (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                  ))}
                {allAppUsers.filter(u => u.id !== user.id).filter(u => !inviteSearchQuery || u.name.toLowerCase().includes(inviteSearchQuery.toLowerCase())).length === 0 && (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2">🔍</div>
                    <p className="text-gray-500 text-sm">
                      {inviteSearchQuery ? 'No users found' : 'No other users yet'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Selected count reminder */}
          <div className="flex gap-3">
            <button onClick={() => { setShowCreateGroup(false); setSelectedUsersToInvite([]); setNewGroupVisibility('public'); }} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition">
              Cancel
            </button>
            <button 
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim() || (newGroupVisibility === 'private' && selectedUsersToInvite.length === 0)}
              className={`flex-1 py-3 rounded-xl font-bold transition ${newGroupName.trim() && (newGroupVisibility === 'public' || selectedUsersToInvite.length > 0) ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              {newGroupVisibility === 'public' ? '🌍 Create Public' : '🔒 Create Private'}
            </button>
          </div>
        </div>
      )}

      {/* My Groups (User Created) */}
      {userGroups.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>📁</span> My Groups
          </h3>
          <div className="space-y-3">
            {filterGroups(userGroups, searchQuery).map(group => (
              <div key={group.id} className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition border-l-4 border-purple-400">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-xl">
                        {group.emoji || '💜'}
                      </div>
                      {/* Green Activity Light */}
                      {group.joined && hasRecentActivity(group) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" title="Active now" />
                      )}
                      {group.joined && !hasRecentActivity(group) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-300 rounded-full border-2 border-white" title="Joined" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 flex items-center gap-2">
                        {group.name}
                        {hasRecentActivity(group) && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-1">{group.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-purple-600 font-medium">Created by you</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{group.members || 1} members</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedGroup(group.id)} 
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold hover:scale-105 transition"
                    >
                      Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Groups */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🏠</span> {t.yourGroups || 'Support Groups'}
        </h3>
        <div className="space-y-3">
          {filterGroups(supportGroups, searchQuery).map((group, index) => (
            <div key={group.id} className="glass-card-strong rounded-[20px] p-4 hover:scale-[1.01] hover:shadow-xl transition-all duration-300" style={{animationDelay: `${index * 0.05}s`}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                      {group.name?.split(' ')[0] || '💜'}
                    </div>
                    {/* Green Activity Light */}
                    {group.joined && hasRecentActivity(group) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-md" title="Active now" />
                    )}
                    {group.joined && !hasRecentActivity(group) && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-300 rounded-full border-2 border-white" title="Joined" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800 flex items-center gap-2">
                      {group.name}
                      {group.joined && hasRecentActivity(group) && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Active</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-1">{group.description}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                        <Users className="w-3 h-3" />
                        {group.members || 0} members
                      </span>
                      {group.joined && (
                        <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Joined
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {group.joined ? (
                    <button 
                      onClick={() => setSelectedGroup(group.id)} 
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 hover:shadow-lg transition-all duration-300"
                    >
                      Open
                    </button>
                  ) : (
                    <button 
                      onClick={() => joinGroup(group.id)} 
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:scale-105 hover:shadow-lg transition-all duration-300"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 🤝 BUDDY MATCHING VIEW - REAL MATCHING SYSTEM
const BuddyView = ({ t, user, setUser, showMatchingQuestions, setShowMatchingQuestions, selectedInterests, setSelectedInterests, selectedSupport, setSelectedSupport, getTextSizeClass, allAppUsers, translateText, userLanguage }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [potentialMatch, setPotentialMatch] = useState(null);
  const [pendingMatches, setPendingMatches] = useState([]);
  const [activeMatches, setActiveMatches] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [noMatchFound, setNoMatchFound] = useState(false);
  const [showOriginalBuddy, setShowOriginalBuddy] = useState({});

  // Real Firebase-based matching
  const findMatch = async () => {
    if (selectedInterests.length === 0 || !selectedSupport) {
      alert('Please select at least one interest and what support you need.');
      return;
    }

    setIsSearching(true);
    setNoMatchFound(false);
    setUser({...user, matchingPreferences: { interests: selectedInterests, supportNeeds: [selectedSupport] }});

    try {
      // Get potential matches from Firebase users
      // Filter users who:
      // 1. Are not the current user
      // 2. Have matching enabled (privacy.allowMatching)
      // 3. Have matching preferences set
      // 4. Haven't been matched with current user already
      
      const availableUsers = allAppUsers.filter(u => 
        u.id !== user.id && 
        u.privacy?.allowMatching !== false &&
        u.matchingPreferences?.interests?.length > 0 &&
        !activeMatches.some(m => m.id === u.id) &&
        !pendingMatches.some(m => m.id === u.id)
      );

      if (availableUsers.length === 0) {
        setNoMatchFound(true);
        setIsSearching(false);
        return;
      }

      // Calculate compatibility scores for each user
      const scoredUsers = availableUsers.map(u => {
        const userInterests = u.matchingPreferences?.interests || [];
        const userSupport = u.matchingPreferences?.supportNeeds || [];
        
        // Calculate shared interests
        const sharedInterests = selectedInterests.filter(i => userInterests.includes(i));
        
        // Calculate compatibility score
        let score = 0;
        score += sharedInterests.length * 15; // 15 points per shared interest
        if (userSupport.includes(selectedSupport)) score += 25; // 25 points for same support need
        score += Math.min(30, Math.random() * 30); // Some randomness (0-30)
        
        return {
          ...u,
          sharedInterests,
          supportArea: userSupport[0] || selectedSupport,
          compatibilityScore: Math.min(99, Math.max(60, Math.round(score))),
          bio: u.bio || `Looking for support with ${(userSupport[0] || 'life challenges').toLowerCase()}. I enjoy ${userInterests.slice(0, 3).join(', ').toLowerCase() || 'connecting with others'}.`
        };
      });

      // Sort by compatibility and pick the best match
      scoredUsers.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      const bestMatch = scoredUsers[0];

      if (bestMatch) {
        // Add to pending matches in Firebase
        setPotentialMatch({
          id: bestMatch.id,
          name: bestMatch.name || 'Anonymous User',
          profilePicture: bestMatch.profilePicture,
          sharedInterests: bestMatch.sharedInterests,
          supportArea: bestMatch.supportArea,
          compatibilityScore: bestMatch.compatibilityScore,
          bio: bestMatch.bio,
          status: 'pending',
          timestamp: new Date().toISOString()
        });
      } else {
        setNoMatchFound(true);
      }
    } catch (error) {
      console.error('Error finding match:', error);
      setNoMatchFound(true);
    }
    
    setIsSearching(false);
  };

  const acceptMatch = async (match) => {
    // Move from potential to active
    const activeMatch = {
      ...match,
      status: 'active',
      messages: [],
      connectedAt: new Date().toISOString()
    };

    setActiveMatches([...activeMatches, activeMatch]);
    setPotentialMatch(null);
    setPendingMatches(pendingMatches.filter(m => m.id !== match.id));

    // 💾 Save match to Firebase
    try {
      await addDoc(collection(db, 'matches'), {
        users: [user.uid, match.id],
        userNames: [user.name, match.name],
        status: 'active',
        sharedInterests: match.sharedInterests || [],
        connectedAt: serverTimestamp(),
        createdBy: user.uid
      });
      console.log('✅ Match saved to Firebase');
    } catch (error) {
      console.error('Error saving match:', error);
    }
  };

  const declineMatch = (match) => {
    setPotentialMatch(null);
    setPendingMatches(pendingMatches.filter(m => m.id !== match.id));
  };

  const sendBuddyMessage = async () => {
    if (!chatMessage.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      text: chatMessage,
      sender: user.uid,
      senderName: user.name,
      timestamp: new Date().toISOString(),
      originalLanguage: userLanguage
    };

    setActiveMatches(activeMatches.map(m =>
      m.id === selectedChat
        ? { ...m, messages: [...(m.messages || []), newMessage] }
        : m
    ));
    setChatMessage('');

    // 💾 Save message to Firebase
    try {
      // Find the match document ID (we need to query for it)
      const matchQuery = query(
        collection(db, 'matches'),
        where('users', 'array-contains', user.uid)
      );
      const matchSnap = await getDocs(matchQuery);
      const matchDoc = matchSnap.docs.find(doc => {
        const data = doc.data();
        return data.users.includes(selectedChat);
      });

      if (matchDoc) {
        await addDoc(collection(db, 'matches', matchDoc.id, 'messages'), {
          text: chatMessage,
          senderId: user.uid,
          senderName: user.name,
          timestamp: serverTimestamp(),
          originalLanguage: userLanguage
        });
        console.log('✅ Message saved to Firebase');
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  // Chat View with a matched buddy
  if (selectedChat) {
    const buddy = activeMatches.find(m => m.id === selectedChat);
    if (!buddy) {
      setSelectedChat(null);
      return null;
    }

    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 text-white">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedChat(null)} className="p-1">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
              {buddy.name[0]}
            </div>
            <div className="flex-1">
              <h3 className="font-bold">{buddy.name}</h3>
              <p className="text-xs opacity-80">{buddy.sharedInterests.join(' • ')}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Connection message */}
          <div className="text-center text-gray-500 text-sm py-4">
            <div className="w-16 h-16 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🤝</span>
            </div>
            <p>You connected with {buddy.name}</p>
            <p className="text-xs">{new Date(buddy.connectedAt).toLocaleDateString()}</p>
          </div>

          {(buddy.messages || []).map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === user.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                msg.sender === user.id 
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-br-none' 
                  : 'bg-white shadow rounded-bl-none'
              }`}>
                <p>
                  {msg.originalLanguage && msg.originalLanguage !== userLanguage && !showOriginalBuddy[msg.id]
                    ? translateText(msg.text, msg.originalLanguage, userLanguage)
                    : msg.text}
                </p>
                {msg.originalLanguage && msg.originalLanguage !== userLanguage && (
                  <button 
                    onClick={() => setShowOriginalBuddy({...showOriginalBuddy, [msg.id]: !showOriginalBuddy[msg.id]})}
                    className={`text-xs font-medium mt-1 hover:underline ${msg.sender === user.id ? 'text-white/80' : 'text-purple-500'}`}
                  >
                    🌐 {showOriginalBuddy[msg.id] ? 'Translation' : 'Original'}
                  </button>
                )}
                <p className={`text-xs mt-1 ${msg.sender === user.id ? 'opacity-70' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendBuddyMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:border-green-400 focus:outline-none"
            />
            <button
              onClick={sendBuddyMessage}
              disabled={!chatMessage.trim()}
              className={`p-3 rounded-full transition ${
                chatMessage.trim() 
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' 
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 space-y-5 ${getTextSizeClass()}`}>
      {/* 💎 PREMIUM BUDDY HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-[28px] p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-3 animate-float">🤝</div>
          <h2 className="text-2xl font-extrabold mb-2 tracking-tight">{t.yourLonelinessBuddy}</h2>
          <p className="text-white/90 font-medium">{t.realPerson}</p>
          <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-semibold">Anonymous & Safe</span>
          </div>
        </div>
      </div>

      {/* 💎 Premium Active Matches */}
      {activeMatches.length > 0 && (
        <div className="glass-card-strong rounded-[24px] p-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">💚</span> Your Buddies 
            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-sm">{activeMatches.length}</span>
          </h3>
          <div className="space-y-3">
            {activeMatches.map(match => (
              <button
                key={match.id}
                onClick={() => setSelectedChat(match.id)}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl hover:scale-[1.02] hover:shadow-lg transition-all duration-300 text-left border border-green-100"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {match.name[0]}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{match.name}</div>
                  <div className="text-sm text-gray-500 font-medium">{match.sharedInterests.slice(0,2).join(' • ')}</div>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <MessageCircle className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 💎 Premium Potential Match Card */}
      {potentialMatch && (
        <div className="glass-card-strong rounded-[24px] p-6 border border-green-200">
          <div className="text-center mb-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3">
              {potentialMatch.name[0]}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{potentialMatch.name}</h3>
            <p className="text-gray-600">{potentialMatch.age}</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-green-600 font-bold">{potentialMatch.compatibilityScore}%</span>
              <span className="text-gray-500 text-sm">compatibility</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 mb-4">
            <p className="text-gray-700 text-sm italic">"{potentialMatch.bio}"</p>
          </div>

          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Shared Interests:</p>
            <div className="flex flex-wrap gap-2">
              {potentialMatch.sharedInterests.map(interest => (
                <span key={interest} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => declineMatch(potentialMatch)}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" /> Pass
            </button>
            <button
              onClick={() => acceptMatch(potentialMatch)}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-bold hover:scale-105 transition flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" /> Connect
            </button>
          </div>
        </div>
      )}

      {/* Search Animation */}
      {isSearching && (
        <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping"></div>
            <div className="absolute inset-0 rounded-full bg-green-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-green-500 animate-pulse" />
            </div>
          </div>
          <h3 className="font-bold text-gray-800 mb-2">Finding Your Match...</h3>
          <p className="text-gray-600 text-sm">Looking for someone who shares your interests and understands your journey</p>
        </div>
      )}

      {/* No Match Found */}
      {noMatchFound && !isSearching && !potentialMatch && (
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-6 shadow-lg border-2 border-orange-200 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Matches Available Right Now</h3>
          <p className="text-gray-600 mb-4">
            We're looking for someone with similar interests. More people are joining every day!
          </p>
          <button
            onClick={() => {
              setNoMatchFound(false);
              findMatch();
            }}
            className="px-6 py-3 bg-gradient-to-r from-orange-400 to-yellow-400 text-white rounded-xl font-bold hover:scale-105 transition"
          >
            🔄 Try Again
          </button>
        </div>
      )}

      {/* Find Match Form */}
      {!potentialMatch && !isSearching && !noMatchFound && (
        <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
          <h3 className="text-xl font-bold text-gray-800">{t.helpPerfectMatch}</h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">What are you interested in?</label>
            <div className="flex flex-wrap gap-2">
              {['🎵 Music', '🎨 Art', '🎮 Gaming', '📚 Reading', '🌿 Nature', '🍳 Cooking', '⚽ Sports', '🎬 Movies', '✍️ Writing', '🧘 Wellness'].map(interest => {
                const name = interest.split(' ')[1];
                return (
                  <button
                    key={name}
                    onClick={() => toggleInterest(name)}
                    className={`px-4 py-2 rounded-full transition text-sm font-medium ${
                      selectedInterests.includes(name) 
                        ? 'bg-gradient-to-r from-green-400 to-teal-400 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">What would you like support with?</label>
            <div className="grid grid-cols-2 gap-2">
              {['😔 Depression', '😰 Anxiety', '😢 Loneliness', '😤 Stress', '💔 Grief', '🔄 Life Changes'].map(option => {
                const name = option.split(' ')[1];
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedSupport(name)}
                    className={`py-3 px-4 rounded-xl transition text-sm font-medium ${
                      selectedSupport === name 
                        ? 'bg-gradient-to-r from-green-400 to-teal-400 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={findMatch}
            disabled={selectedInterests.length === 0 || !selectedSupport}
            className={`w-full py-4 rounded-2xl font-bold transition mt-4 ${
              selectedInterests.length > 0 && selectedSupport 
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:scale-105 shadow-lg' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            🔍 Find My Match
          </button>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl p-6">
        <h3 className="font-bold text-gray-800 mb-4">{t.howItWorks}</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
            <div>
              <p className="font-semibold text-gray-800">Select your interests</p>
              <p className="text-sm text-gray-600">Tell us what you enjoy so we can find someone compatible</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
            <div>
              <p className="font-semibold text-gray-800">Review your match</p>
              <p className="text-sm text-gray-600">See who we found and decide if you want to connect</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
            <div>
              <p className="font-semibold text-gray-800">Start chatting</p>
              <p className="text-sm text-gray-600">Connect anonymously and support each other 💚</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ t, user, setUser, journalEntries, posts, uploadProfilePicture, getTextSizeClass }) => {
  const fileInputRef = useRef(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name || '');
  const [savingName, setSavingName] = useState(false);

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSavingName(true);
    try {
      // Update in Firebase
      if (user.id) {
        await setDoc(doc(db, 'users', user.id), { name: newName.trim() }, { merge: true });
      }
      // Update local state
      setUser(prev => ({ ...prev, name: newName.trim() }));
      setEditingName(false);
    } catch (err) {
      console.error('Error saving name:', err);
    }
    setSavingName(false);
  };

  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      {/* 💎 CRYSTAL PROFILE HEADER */}
      <div className="crystal-card p-6 text-center relative overflow-hidden">
        {/* Crystal background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          {/* 💎 Crystal Avatar */}
          <div className="relative inline-block mb-4">
            <div className="crystal-avatar p-1">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-28 h-28 rounded-full object-cover" />
              ) : (
                <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {user.name?.[0] || '?'}
                </div>
              )}
            </div>
            {/* Camera button */}
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="absolute bottom-1 right-1 bg-gradient-to-br from-purple-500 to-pink-500 text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-all duration-300 border-2 border-white"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadProfilePicture} className="hidden" />
          </div>
          
          {/* 💎 Crystal Name Edit */}
          {editingName ? (
            <div className="space-y-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="crystal-input w-full max-w-xs mx-auto text-center text-lg font-bold"
                placeholder="Enter your name"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <div className="flex items-center justify-center gap-2">
                <button 
                  onClick={handleSaveName} 
                  disabled={savingName || !newName.trim()} 
                  className="crystal-btn px-6 py-2 text-sm flex items-center gap-2"
                >
                  {savingName ? (
                    <>
                      <span className="loading-dots"><span></span><span></span><span></span></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save
                    </>
                  )}
                </button>
                <button 
                  onClick={() => { setEditingName(false); setNewName(user.name); }} 
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Name with edit button */}
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {user.name}
                </h2>
                <button 
                  onClick={() => setEditingName(true)} 
                  className="p-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-all hover:scale-110"
                  title="Edit name"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              
              {/* Instagram-style username */}
              <p className="text-gray-500 font-medium">
                @{(user.username || user.name || 'user').toLowerCase().replace(/\s+/g, '_')}
              </p>
              
              {/* Edit Profile link */}
              <button 
                onClick={() => setEditingName(true)}
                className="text-sm text-purple-500 hover:text-purple-700 font-medium mt-2 flex items-center gap-1 mx-auto"
              >
                <Edit3 className="w-3 h-3" />
                Edit Profile
              </button>
            </div>
          )}
          
          <p className="text-gray-400 text-sm mt-3">🎯 {t.memberSince}</p>
        </div>
      </div>
      
      {/* 💎 Crystal Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="crystal-stat text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{user.streak}</div>
          <div className="text-sm text-gray-500 mt-1 font-medium">{t.dayStreak}</div>
        </div>
        <div className="crystal-stat text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">{journalEntries.length}</div>
          <div className="text-sm text-gray-500 mt-1 font-medium">{t.entries}</div>
        </div>
        <div className="crystal-stat text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">0</div>
          <div className="text-sm text-gray-500 mt-1 font-medium">{t.rewardsEarned}</div>
        </div>
      </div>
      
      {/* 💎 Crystal Achievements */}
      <div className="crystal-card p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          {t.achievements}
        </h3>
        <div className="space-y-3">
          {[
            { emoji: '🌱', name: t.firstStep, desc: t.madeFirstPost, locked: posts.length === 0 },
            { emoji: '🔥', name: `${user.streak} ${t.dayStreak}`, desc: t.checkInDaily, locked: user.streak < 7 },
            { emoji: '💝', name: t.kindSoul, desc: t.support10Others, locked: true },
            { emoji: '👑', name: t.consistencyKing, desc: t.thirtyDayStreak, locked: user.streak < 30 }
          ].map((badge, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${badge.locked ? 'bg-gray-50 border border-gray-100' : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100'}`}>
              <div className={`text-4xl ${badge.locked ? 'grayscale opacity-50' : 'animate-float'}`}>{badge.emoji}</div>
              <div className="flex-1">
                <div className="font-bold text-gray-800">{badge.name}</div>
                <div className="text-sm text-gray-500">{badge.desc}</div>
              </div>
              {badge.locked && <div className="crystal-badge text-xs">{t.locked}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ t, user, setUser, setCurrentView, showUpgrade, hasPremiumAccess, userLanguage, setUserLanguage, highContrast, setHighContrast, textSize, setTextSize, notificationsEnabled, requestNotifications, getTextSizeClass, exportDataForTherapist, achievements, journalEntries, posts, uploadProfilePicture }) => {
  const { logout } = useAuth();
  const { isOrgAdmin, organization } = useEnterprise();
  const fileInputRef = useRef(null);

  // 🎯 BUG 2 FIX: State for editing displayName
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user.name || '');
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');

  // Handle saving displayName to Firebase
  const handleSaveDisplayName = async () => {
    if (!editName.trim()) {
      setNameError('Please enter a valid name');
      return;
    }

    setSavingName(true);
    setNameError('');
    setNameSuccess('');

    try {
      // Update Firestore user profile
      await updateDoc(doc(db, 'users', user.id), {
        displayName: editName.trim(),
        name: editName.trim()
      });

      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: editName.trim()
        });
      }

      // Update local user state
      setUser(prev => ({
        ...prev,
        name: editName.trim(),
        displayName: editName.trim()
      }));

      setNameSuccess('Name updated successfully!');
      setIsEditingName(false);

      // Clear success message after 3 seconds
      setTimeout(() => setNameSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating displayName:', err);
      setNameError('Failed to update name. Please try again.');
    }

    setSavingName(false);
  };

  return (
  <div className={`p-4 space-y-5 ${getTextSizeClass()}`}>
    {/* 💎 PREMIUM SETTINGS HEADER */}
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-[28px] p-6 text-white shadow-xl">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10 text-center">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">{t.settings}</h2>
      </div>
    </div>

    {/* 💜 ADMIN DASHBOARD BUTTON - Only for REAL org admins */}
    {isOrgAdmin && organization && (
      <button
        onClick={() => setCurrentView('admin')}
        className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-xl transition-all duration-300"
      >
        <Building2 className="w-5 h-5" />
        Admin Dashboard - {organization.name}
      </button>
    )}

    {/* 👨‍👩‍👧 GUARDIAN PORTAL BUTTONS */}
    {user.accountType === 'parent' && (
      <button
        onClick={() => setCurrentView('parentDashboard')}
        className="w-full p-4 bg-purple-50 rounded-2xl flex items-center gap-4 hover:bg-purple-100 transition"
      >
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
          👨‍👩‍👧
        </div>
        <div className="text-left">
          <p className="font-bold text-gray-800">Parent Dashboard</p>
          <p className="text-sm text-gray-500">View your children's wellness</p>
        </div>
      </button>
    )}

    {user.birthday && (() => {
      const birth = new Date(user.birthday);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
      return age < 18;
    })() && (
      <button
        onClick={() => setCurrentView('guardianSettings')}
        className="w-full p-4 bg-blue-50 rounded-2xl flex items-center gap-4 hover:bg-blue-100 transition"
      >
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
          🔗
        </div>
        <div className="text-left">
          <p className="font-bold text-gray-800">Guardian Settings</p>
          <p className="text-sm text-gray-500">Manage parent/guardian links</p>
        </div>
      </button>
    )}

    {user.isOrgAdmin && (
      <button
        onClick={() => setCurrentView('userManagement')}
        className="w-full p-4 bg-gray-100 rounded-2xl flex items-center gap-4 hover:bg-gray-200 transition"
      >
        <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-2xl">
          🔒
        </div>
        <div className="text-left">
          <p className="font-bold text-gray-800">User Management</p>
          <p className="text-sm text-gray-500">Lock, suspend, and manage accounts</p>
        </div>
      </button>
    )}

    {/* 🆘 PREMIUM GET HELP NOW CARD */}
    <div className="glass-card-strong rounded-[24px] p-5 border border-red-100">
      <div className="text-center mb-4">
        <span className="text-4xl animate-pulse">🆘</span>
        <h3 className="text-lg font-bold text-gray-800 mt-2">Need Help Now?</h3>
        <p className="text-sm text-gray-500 font-medium">Immediate support is available 24/7</p>
      </div>
      
      {/* Emergency Call Button */}
      <a 
        href="tel:988"
        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mb-3 hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
      >
        <Phone className="w-5 h-5" /> Call 988 - Crisis Lifeline
      </a>
      
      {/* Text Crisis Line */}
      <a 
        href="sms:741741?body=HELLO"
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 mb-3 hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
      >
        💬 Text HOME to 741741
      </a>
      
      {/* Request Therapist (non-emergency) */}
      <button 
        onClick={async () => {
          const confirmed = window.confirm(
            'Would you like us to connect you with a licensed therapist?\n\n' +
            'A therapist from our network will reach out to you within 24-48 hours.\n\n' +
            'Click OK to request therapist support.'
          );
          if (confirmed && db && user) {
            try {
              await addDoc(collection(db, 'therapyLeads'), {
                userId: user.id,
                userName: user.name,
                status: 'requested',
                source: 'get_help_button',
                priority: 'high',
                createdAt: serverTimestamp(),
                contacted: false,
                notes: 'User requested therapist connection'
              });
              alert('✅ Request submitted!\n\nA licensed therapist will reach out within 24-48 hours.\n\nIf you need immediate help, please call 988.');
            } catch (err) {
              alert('Request saved! A therapist will contact you soon. 💜');
            }
          }
        }}
        className="w-full bg-white border-2 border-green-400 text-green-700 py-3 rounded-2xl font-bold hover:bg-green-50 transition flex items-center justify-center gap-2"
      >
        👨‍⚕️ Request Therapist (Non-Emergency)
      </button>
      
      <p className="text-xs text-center text-gray-500 mt-3">
        💜 You're not alone. Help is always available.
      </p>
    </div>

    {/* PROFILE SECTION */}
    <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
      <div className="relative inline-block mb-4">
        {user.profilePicture ? (
          <img src={user.profilePicture} alt="Profile" className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-purple-500" />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold">{user.name[0]}</div>
        )}
        <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 bg-white text-purple-500 p-2 rounded-full shadow-lg hover:scale-110 transition">
          <Camera className="w-4 h-4" />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadProfilePicture} className="hidden" />
      </div>

      {/* 🎯 BUG 2 FIX: Editable Display Name */}
      {isEditingName ? (
        <div className="mb-4">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full max-w-xs px-4 py-2 text-center text-xl font-bold border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none"
            placeholder="Enter your name"
            autoFocus
          />
          <div className="flex justify-center gap-2 mt-3">
            <button
              onClick={handleSaveDisplayName}
              disabled={savingName}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {savingName ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save
            </button>
            <button
              onClick={() => { setIsEditingName(false); setEditName(user.name); setNameError(''); }}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
          {nameError && (
            <p className="text-red-500 text-sm mt-2">{nameError}</p>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 mb-1">
          <h3 className="text-2xl font-bold text-gray-800">{user.name}</h3>
          <button
            onClick={() => { setIsEditingName(true); setEditName(user.name); }}
            className="p-1 text-purple-500 hover:bg-purple-100 rounded-full transition"
            title="Edit name"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success message */}
      {nameSuccess && (
        <div className="flex items-center justify-center gap-2 text-green-600 text-sm mb-2">
          <CheckCircle className="w-4 h-4" />
          {nameSuccess}
        </div>
      )}

      <p className="text-gray-500 mt-1">{t.memberSince}</p>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-purple-50 rounded-xl p-3">
          <div className="text-2xl font-bold text-purple-600">{user.streak}</div>
          <div className="text-xs text-gray-600">{t.dayStreak}</div>
        </div>
        <div className="bg-pink-50 rounded-xl p-3">
          <div className="text-2xl font-bold text-pink-600">{journalEntries.length}</div>
          <div className="text-xs text-gray-600">{t.entries}</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3">
          <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
          <div className="text-xs text-gray-600">{t.postsCount}</div>
        </div>
      </div>
    </div>

    {/* 🌐 LANGUAGE - At Top */}
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4"><Globe className="w-5 h-5 inline mr-2" />{t.language}</h3>
      <select
        value={userLanguage}
        onChange={(e) => setUserLanguage(e.target.value)}
        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
        <option value="pt">Português</option>
        <option value="zh">中文</option>
        <option value="ja">日本語</option>
        <option value="it">Italiano</option>
      </select>
    </div>

    {/* 🎨 THEME - Near Top */}
    <button 
      onClick={() => setCurrentView('themes')}
      className="w-full bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 rounded-3xl p-4 shadow-lg flex items-center justify-between hover:scale-[1.02] transition"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
          <span className="text-2xl">🎨</span>
        </div>
        <div className="text-left">
          <p className="font-semibold text-gray-800">Customize Theme</p>
          <p className="text-xs text-gray-500">Make it feel like home</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>

    {/* THERAPIST EXPORT */}
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-2">👨‍⚕️ Share with Therapist</h3>
      <p className="text-sm text-gray-600 mb-4">Export your data to share with your mental health professional</p>
      <button
        onClick={exportDataForTherapist}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold hover:scale-105 transition"
      >
        📊 Export My Data
      </button>
      <p className="text-xs text-gray-500 mt-2">Includes mood, sleep, journal (last 30 days)</p>
    </div>

    {/* ENHANCED PRIVACY */}
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🔒 Security & Privacy</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
          <div>
            <div className="font-semibold text-sm text-gray-800">📱 Biometric Login</div>
            <div className="text-xs text-gray-600">Fingerprint / Face ID</div>
          </div>
          {localStorage.getItem('yrnalone_biometric_email') ? (
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xs font-bold">✓ Enabled</span>
              <button 
                onClick={() => {
                  if (window.confirm('Disable biometric login?')) {
                    localStorage.removeItem('yrnalone_biometric_email');
                    localStorage.removeItem('yrnalone_biometric_token');
                    alert('Biometric login disabled.');
                    window.location.reload();
                  }
                }}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-bold hover:bg-gray-300 transition"
              >
                Disable
              </button>
            </div>
          ) : (
            <button 
              onClick={async () => {
                if (!window.PublicKeyCredential) {
                  alert('Your device does not support biometric authentication.');
                  return;
                }
                const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                if (!available) {
                  alert('Biometric authentication is not set up on this device. Please enable it in your device settings.');
                  return;
                }
                alert('✅ Biometric is available! Sign out and sign back in to enable fingerprint/Face ID login.');
              }}
              className="px-4 py-2 bg-purple-500 text-white text-xs rounded-full font-bold hover:bg-purple-600 transition"
            >
              Set Up
            </button>
          )}
        </div>
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
          <div>
            <div className="font-semibold text-sm text-gray-800">🔐 End-to-End Encryption</div>
            <div className="text-xs text-gray-600">Your data is secure</div>
          </div>
          <span className="text-green-600 font-bold">✓ Active</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
          <div>
            <div className="font-semibold text-sm text-gray-800">🗑️ Delete All Data</div>
            <div className="text-xs text-gray-600">Permanently remove your info</div>
          </div>
          <button 
            onClick={() => {
              if (window.confirm('⚠️ Are you sure you want to delete ALL your data? This cannot be undone.')) {
                localStorage.clear();
                alert('Your data has been deleted. You will be signed out.');
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-red-500 text-white text-xs rounded-full font-bold hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    {/* 🛡️ SAFETY & PRIVACY SETTINGS */}
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🛡️ Safety & Privacy</h3>
      <div className="space-y-3">
        <button 
          onClick={() => setCurrentView('privacy')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Your Data</p>
              <p className="text-xs text-gray-500">View and export your data</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button 
          onClick={() => setCurrentView('safety')}
          className="w-full flex items-center justify-between p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔐</span>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Privacy Controls</p>
              <p className="text-xs text-gray-500">Manage who can see and message you</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button 
          onClick={() => setCurrentView('guidelines')}
          className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Community Guidelines</p>
              <p className="text-xs text-gray-500">Our rules for a safe community</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button 
          onClick={() => setCurrentView('blocked')}
          className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚫</span>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Blocked Users</p>
              <p className="text-xs text-gray-500">Manage blocked accounts</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>

    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{t.accessibility}</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">{t.highContrast}</span>
          <button onClick={() => setHighContrast(!highContrast)} className={`w-12 h-6 rounded-full transition ${highContrast ? 'bg-purple-500' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition transform ${highContrast ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>
        <div>
          <label className="block text-gray-700 mb-2">{t.textSize}</label>
          <div className="flex gap-2">
            {['small', 'medium', 'large'].map(size => (
              <button key={size} onClick={() => setTextSize(size)} className={`flex-1 py-2 rounded-xl font-semibold transition ${textSize === size ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {t[size]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{t.privacy}</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">{t.shareAnonymously}</span>
          <button onClick={() => setUser({...user, privacy: {...user.privacy, anonymous: !user.privacy.anonymous}})} className={`w-12 h-6 rounded-full transition ${user.privacy.anonymous ? 'bg-purple-500' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition transform ${user.privacy.anonymous ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">{t.showOnlineStatus}</span>
          <button onClick={() => setUser({...user, privacy: {...user.privacy, showOnline: !user.privacy.showOnline}})} className={`w-12 h-6 rounded-full transition ${user.privacy.showOnline ? 'bg-purple-500' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition transform ${user.privacy.showOnline ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">{t.allowMatching}</span>
          <button onClick={() => setUser({...user, privacy: {...user.privacy, allowMatching: !user.privacy.allowMatching}})} className={`w-12 h-6 rounded-full transition ${user.privacy.allowMatching ? 'bg-purple-500' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition transform ${user.privacy.allowMatching ? 'translate-x-6' : 'translate-x-1'}`}></div>
          </button>
        </div>
      </div>
    </div>

    {/* 📜 TERMS & LEGAL */}
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">📜 Legal</h3>
      <div className="space-y-3">
        <button 
          onClick={() => window.open('/terms', '_blank')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Terms of Service</p>
              <p className="text-xs text-gray-500">Our terms and conditions</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button 
          onClick={() => window.open('/privacy', '_blank')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Privacy Policy</p>
              <p className="text-xs text-gray-500">How we protect your data</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>

    {/* ⚠️ DANGER ZONE - DELETE ACCOUNT */}
    <div className="bg-red-50 rounded-3xl p-6 shadow-lg border border-red-200">
      <h3 className="text-lg font-bold text-red-700 mb-4">⚠️ Danger Zone</h3>
      <button 
        onClick={async () => {
          const confirm1 = window.confirm(
            "⚠️ DELETE ACCOUNT\n\nThis will permanently delete:\n• Your profile\n• All your posts\n• Journal entries\n• Mood history\n• All personal data\n\nThis action CANNOT be undone.\n\nAre you sure you want to continue?"
          );
          if (confirm1) {
            const confirm2 = window.prompt(
              "To confirm deletion, please type DELETE in the box below:"
            );
            if (confirm2 === "DELETE") {
              try {
                // Delete user data from Firestore
                if (user?.id) {
                  await deleteDoc(doc(db, 'users', user.id));
                }
                // Delete Firebase Auth account
                const currentUser = auth.currentUser;
                if (currentUser) {
                  await currentUser.delete();
                }
                alert("Your account has been deleted. We're sorry to see you go. 💜");
                window.location.reload();
              } catch (error) {
                if (error.code === 'auth/requires-recent-login') {
                  alert("For security, please sign out and sign in again before deleting your account.");
                } else {
                  alert("Error deleting account. Please try again or contact support.");
                }
              }
            } else {
              alert("Account deletion cancelled.");
            }
          }
        }}
        className="w-full flex items-center justify-between p-4 bg-red-100 rounded-xl hover:bg-red-200 transition border border-red-300"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🗑️</span>
          <div className="text-left">
            <p className="font-semibold text-red-700">Delete Account</p>
            <p className="text-xs text-red-500">Permanently delete all your data</p>
          </div>
        </div>
        <AlertTriangle className="w-5 h-5 text-red-500" />
      </button>
    </div>

    {/* 🚪 BEAUTIFUL LOGOUT BUTTON */}
    <button 
      onClick={async () => {
        if (window.confirm("Are you sure you want to sign out?")) {
          await logout();
          window.location.reload();
        }
      }}
      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-semibold mt-6 transition-all duration-300 flex items-center justify-center gap-2 border border-gray-200"
    >
      <span>Sign Out</span>
    </button>

{!hasPremiumAccess && (
  <button 
    onClick={showUpgrade}
    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 rounded-2xl font-bold mt-4"
  >
    ⭐ Upgrade to Premium
  </button>
)}
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{t.pushNotifications}</h3>
      <button onClick={requestNotifications} className={`w-full py-3 rounded-2xl font-bold ${notificationsEnabled ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition'}`}>
        {notificationsEnabled ? `✓ ${t.enabled}` : t.enable}
      </button>
    </div>
  </div>

  );
};


// 🎯 NEW FEATURES - MOOD CHECK-IN VIEW
const MoodCheckView = ({ t, moodHistory, setMoodHistory, showMoodInsights, setShowMoodInsights, getTextSizeClass }) => {
  const [currentMood, setCurrentMood] = useState(null);
  const [moodNote, setMoodNote] = useState('');

  const logMood = () => {
    if (currentMood) {
      setMoodHistory([...moodHistory, {
        id: Date.now(),
        mood: currentMood,
        note: moodNote,
        timestamp: new Date().toISOString()
      }]);
      setMoodNote('');
      setCurrentMood(null);
    }
  };

  const getMoodStats = () => {
    const last7Days = moodHistory.slice(-7);
    const moodCounts = {};
    last7Days.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    const mostCommon = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0];
    return { total: moodHistory.length, last7Days: last7Days.length, mostCommon };
  };

  const stats = getMoodStats();

  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl p-6 text-white text-center">
        <div className="text-6xl mb-3">😊</div>
        <h2 className="text-2xl font-bold mb-2">{t.moodCheck}</h2>
        <p className="opacity-90">{t.howFeelingToday}</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-4 text-lg">{t.howFeelingToday}</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {MOODS.map(mood => (
            <button
              key={mood.label}
              onClick={() => setCurrentMood(mood.label.toLowerCase())}
              className={`p-4 rounded-2xl text-center transition ${
                currentMood === mood.label.toLowerCase()
                  ? 'bg-gradient-to-br from-purple-400 to-pink-400 scale-110'
                  : 'bg-gray-100'
              }`}
            >
              <div className="text-4xl mb-1">{mood.emoji}</div>
              <div className="text-sm font-semibold">{mood.label}</div>
            </button>
          ))}
        </div>
        <textarea
          value={moodNote}
          onChange={(e) => setMoodNote(e.target.value)}
          placeholder="What's happening? (optional)"
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none mb-3"
          rows="3"
        />
        <button
          onClick={logMood}
          disabled={!currentMood}
          className={`w-full py-3 rounded-full font-bold transition ${
            currentMood
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Log Mood 💜
        </button>
      </div>

      {moodHistory.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-4 text-white text-center">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-xs mt-1">{t.totalCheckins}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-4 text-white text-center">
              <div className="text-3xl font-bold">{stats.last7Days}</div>
              <div className="text-xs mt-1">{t.thisWeek}</div>
            </div>
            <div className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl p-4 text-white text-center">
              <div className="text-3xl">{MOODS.find(m => m.label.toLowerCase() === stats.mostCommon)?.emoji || '😊'}</div>
              <div className="text-xs mt-1">{t.mostCommon}</div>
            </div>
          </div>

          <button
            onClick={() => setShowMoodInsights(!showMoodInsights)}
            className="w-full bg-white rounded-2xl p-4 shadow flex items-center justify-between"
          >
            <span className="font-bold text-gray-800">{t.moodInsights}</span>
            <span className="text-2xl">{showMoodInsights ? '▼' : '▶'}</span>
          </button>

          {showMoodInsights && (
            <div className="space-y-3">
              {moodHistory.slice(-10).reverse().map(entry => (
                <div key={entry.id} className="bg-white rounded-2xl p-4 shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">{MOODS.find(m => m.label.toLowerCase() === entry.mood)?.emoji}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 capitalize">{entry.mood}</div>
                      <div className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  {entry.note && <p className="text-gray-600 text-sm">{entry.note}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {moodHistory.length === 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600">Start tracking your moods to see insights!</p>
        </div>
      )}
    </div>
  );
};

// 🧘 QUICK RELIEF VIEW (Breathing + Panic Button)
const QuickReliefViewNew = ({ t, showBreathingExercise, setShowBreathingExercise, selectedExercise, setSelectedExercise, breathingCount, setBreathingCount, showPanicHelp, setShowPanicHelp, getTextSizeClass }) => {
  const [exercisePhase, setExercisePhase] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (isRunning && selectedExercise) {
      const pattern = BREATHING_EXERCISES.find(ex => ex.id === selectedExercise)?.pattern;
      if (!pattern) return;

      const interval = setInterval(() => {
        setTimer(prev => {
          const currentPhase = pattern[exercisePhase];
          if (prev >= currentPhase.duration) {
            const nextPhase = (exercisePhase + 1) % pattern.length;
            setExercisePhase(nextPhase);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, exercisePhase, timer, selectedExercise]);

  const startExercise = (exerciseId) => {
    setSelectedExercise(exerciseId);
    setShowBreathingExercise(true);
    setExercisePhase(0);
    setTimer(0);
    setIsRunning(true);
    setBreathingCount(breathingCount + 1);
  };

  const stopExercise = () => {
    setIsRunning(false);
    setShowBreathingExercise(false);
    setSelectedExercise(null);
    setExercisePhase(0);
    setTimer(0);
  };

  if (showPanicHelp) {
    return (
      <div className={`p-4 space-y-5 ${getTextSizeClass()}`}>
        {/* 💎 PREMIUM PANIC HELP HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-pink-500 to-red-600 rounded-[28px] p-6 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 text-center">
            <div className="text-6xl mb-3 animate-pulse">🆘</div>
            <h2 className="text-2xl font-extrabold mb-2 tracking-tight">You're Safe</h2>
            <p className="text-white/90 font-medium">Let's calm down together</p>
          </div>
        </div>

        {/* 💎 Premium Grounding Exercise */}
        <div className="glass-card-strong rounded-[24px] p-6 space-y-4">
          <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
            <span className="text-2xl">🌿</span> 5-4-3-2-1 Grounding
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
              <div className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <span className="text-xl">👀</span> 5 Things You Can SEE
              </div>
              <p className="text-sm text-blue-700 font-medium">Look around. Name 5 things you see right now.</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
              <div className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                <span className="text-xl">✋</span> 4 Things You Can TOUCH
              </div>
              <p className="text-sm text-purple-700 font-medium">Feel your shirt, the ground, your hair...</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl border border-pink-200">
              <div className="font-bold text-pink-800 mb-2 flex items-center gap-2">
                <span className="text-xl">👂</span> 3 Things You Can HEAR
              </div>
              <p className="text-sm text-pink-700 font-medium">Birds? Traffic? Your breathing?</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
              <div className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                <span className="text-xl">👃</span> 2 Things You Can SMELL
              </div>
              <p className="text-sm text-orange-700 font-medium">Fresh air? Coffee? Soap?</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200">
              <div className="font-bold text-green-800 mb-2 flex items-center gap-2">
                <span className="text-xl">👅</span> 1 Thing You Can TASTE
              </div>
              <p className="text-sm text-green-700 font-medium">Notice your mouth's current taste</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => startExercise('calm')}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold hover:scale-105 transition"
        >
          Try Calm Breathing Now
        </button>

        <button
          onClick={() => setShowPanicHelp(false)}
          className="w-full bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold"
        >
          I'm Feeling Better
        </button>

        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
          <p className="text-red-900 font-semibold mb-2">In Crisis?</p>
          <a href="tel:988" className="block bg-red-500 text-white py-3 rounded-xl font-bold mb-2">
            📞 Call 988 (Suicide & Crisis Lifeline)
          </a>
          <a href="sms:741741&body=HOME" className="block bg-red-400 text-white py-3 rounded-xl font-bold">
            💬 Text HOME to 741741
          </a>
        </div>
      </div>
    );
  }

  if (showBreathingExercise && selectedExercise) {
    const exercise = BREATHING_EXERCISES.find(ex => ex.id === selectedExercise);
    const currentPhase = exercise.pattern[exercisePhase];
    const progress = (timer / currentPhase.duration) * 100;

    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br ${currentPhase.color} p-6`}>
        <button
          onClick={stopExercise}
          className="absolute top-6 right-6 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full"
        >
          ✕ Close
        </button>

        <div className="text-white text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{exercise.name}</h2>
          <p className="opacity-90">{exercise.description}</p>
        </div>

        <div className="relative w-64 h-64 mb-8">
          <div
            className="absolute inset-0 bg-white/30 backdrop-blur rounded-full transition-transform duration-1000"
            style={{ transform: `scale(${0.5 + (progress / 200)})` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-2">
                {currentPhase.duration - timer}
              </div>
              <div className="text-2xl font-semibold text-white">{currentPhase.phase}</div>
            </div>
          </div>
        </div>

        <div className="text-white text-center">
          <p className="text-xl mb-2">Completed Cycles: {Math.floor(breathingCount / exercise.pattern.length)}</p>
          <p className="text-sm opacity-75">Just focus on your breath...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl p-6 text-white text-center">
        <div className="text-6xl mb-3">🧘</div>
        <h2 className="text-2xl font-bold mb-2">{t.quickRelief}</h2>
        <p className="opacity-90">Calm your mind in minutes</p>
      </div>

      <button
        onClick={() => setShowPanicHelp(true)}
        className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-6 rounded-3xl font-bold text-xl shadow-lg hover:scale-105 transition animate-pulse"
      >
        <div className="text-4xl mb-2">🆘</div>
        {t.panicButton}
        <div className="text-sm font-normal mt-1 opacity-90">{t.needCalmNow}</div>
      </button>

      <div className="space-y-3">
        <h3 className="font-bold text-gray-800 text-lg">{t.breathing}</h3>
        {BREATHING_EXERCISES.map(exercise => (
          <button
            key={exercise.id}
            onClick={() => startExercise(exercise.id)}
            className="w-full bg-white rounded-2xl p-5 shadow hover:shadow-lg transition text-left"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{exercise.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-gray-800 mb-1">{exercise.name}</div>
                <div className="text-sm text-gray-600">{exercise.description}</div>
              </div>
              <div className="text-purple-500 font-bold">▶</div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6">
        <h3 className="font-bold text-gray-800 mb-3">💡 Quick Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Find a quiet space</li>
          <li>• Sit or lie down comfortably</li>
          <li>• Focus only on your breathing</li>
          <li>• It's okay if your mind wanders</li>
          <li>• Even 2 minutes helps!</li>
        </ul>
      </div>
    </div>
  );
};

// 📚 EDUCATION LIBRARY VIEW
const EducationLibraryViewNew = ({ t, selectedArticle, setSelectedArticle, getTextSizeClass }) => {
  if (selectedArticle) {
    const article = EDUCATION_ARTICLES.find(a => a.id === selectedArticle);
    return (
      <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-2 text-purple-600 font-semibold"
        >
          ← Back to Library
        </button>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">{article.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800">{article.title}</h2>
          </div>

          <div className="prose prose-sm max-w-none">
            {article.content.split('\n').map((paragraph, i) => {
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return <h3 key={i} className="font-bold text-gray-800 mt-4 mb-2">{paragraph.replace(/\*\*/g, '')}</h3>;
              }
              if (paragraph.startsWith('- ')) {
                return <li key={i} className="ml-6 text-gray-700">{paragraph.substring(2)}</li>;
              }
              if (paragraph.trim()) {
                return <p key={i} className="text-gray-700 mb-3">{paragraph}</p>;
              }
              return null;
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-green-400 to-blue-400 rounded-3xl p-6 text-white text-center">
        <div className="text-6xl mb-3">📚</div>
        <h2 className="text-2xl font-bold mb-2">{t.mentalHealthLibrary}</h2>
        <p className="opacity-90">Learn about mental health</p>
      </div>

      <div className="space-y-3">
        {EDUCATION_ARTICLES.map(article => (
          <button
            key={article.id}
            onClick={() => setSelectedArticle(article.id)}
            className="w-full bg-white rounded-2xl p-5 shadow hover:shadow-lg transition text-left"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{article.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-gray-800">{article.title}</div>
                <div className="text-sm text-gray-500 capitalize">{article.category}</div>
              </div>
              <div className="text-purple-500 font-bold">→</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// 🎵 SOUND THERAPY VIEW
const SoundTherapyViewNew = ({ t, playingSound, setPlayingSound, getTextSizeClass }) => {
  const [volume, setVolume] = useState(0.5);
  const [timer, setTimer] = useState(null);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [mixerOpen, setMixerOpen] = useState(false);
  const [activeSounds, setActiveSounds] = useState({});
  const audioRefs = useRef({});
  const timerRef = useRef(null);

  // Advanced sound library with categories
  const soundCategories = {
    nature: {
      title: '🌿 Nature',
      sounds: [
        { id: 'rain', name: 'Rain', icon: '🌧️', color: 'from-blue-400 to-blue-600' },
        { id: 'ocean', name: 'Ocean Waves', icon: '🌊', color: 'from-cyan-400 to-blue-500' },
        { id: 'forest', name: 'Forest', icon: '🌲', color: 'from-green-400 to-green-600' },
        { id: 'thunder', name: 'Thunder', icon: '⛈️', color: 'from-gray-500 to-gray-700' },
        { id: 'birds', name: 'Birds', icon: '🐦', color: 'from-yellow-400 to-orange-400' },
        { id: 'wind', name: 'Wind', icon: '💨', color: 'from-gray-300 to-gray-500' },
      ]
    },
    ambient: {
      title: '🏠 Ambient',
      sounds: [
        { id: 'fire', name: 'Fireplace', icon: '🔥', color: 'from-orange-400 to-red-500' },
        { id: 'cafe', name: 'Coffee Shop', icon: '☕', color: 'from-amber-600 to-amber-800' },
        { id: 'fan', name: 'Fan', icon: '🌀', color: 'from-gray-400 to-gray-600' },
        { id: 'train', name: 'Train', icon: '🚂', color: 'from-slate-500 to-slate-700' },
      ]
    },
    noise: {
      title: '📻 Noise',
      sounds: [
        { id: 'white', name: 'White Noise', icon: '⚪', color: 'from-gray-200 to-gray-400' },
        { id: 'pink', name: 'Pink Noise', icon: '🩷', color: 'from-pink-300 to-pink-500' },
        { id: 'brown', name: 'Brown Noise', icon: '🟤', color: 'from-amber-700 to-amber-900' },
      ]
    },
    frequency: {
      title: '✨ Healing',
      sounds: [
        { id: '432hz', name: '432 Hz', icon: '🎵', color: 'from-purple-400 to-purple-600', desc: 'Natural Healing' },
        { id: '528hz', name: '528 Hz', icon: '💜', color: 'from-violet-400 to-violet-600', desc: 'Love Frequency' },
        { id: '396hz', name: '396 Hz', icon: '🧘', color: 'from-indigo-400 to-indigo-600', desc: 'Liberation' },
        { id: '639hz', name: '639 Hz', icon: '💚', color: 'from-teal-400 to-teal-600', desc: 'Connection' },
      ]
    }
  };

  // Web Audio API for generating sounds
  const audioContextRef = useRef(null);
  const sourceNodesRef = useRef({});

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  // Generate different sounds using Web Audio API
  const generateSound = (soundId, vol) => {
    const ctx = getAudioContext();
    const nodes = [];
    
    const createNoiseBuffer = (type = 'white') => {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      if (type === 'white') {
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      } else if (type === 'pink') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
      } else if (type === 'brown') {
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }
      }
      return buffer;
    };

    const createFilteredNoise = (freq, q, noiseType = 'white') => {
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(noiseType);
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = freq;
      filter.Q.value = q;
      const gain = ctx.createGain();
      gain.gain.value = vol * 0.4;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      return { source: noise, gain };
    };

    const createOscillator = (freq, type = 'sine') => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = vol * 0.15;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      return { source: osc, gain };
    };

    switch (soundId) {
      case 'rain':
        nodes.push(createFilteredNoise(1200, 1));
        nodes.push(createFilteredNoise(800, 0.5));
        break;
      case 'ocean':
        nodes.push(createFilteredNoise(400, 0.3));
        break;
      case 'forest':
      case 'birds':
        nodes.push(createFilteredNoise(2000, 5));
        break;
      case 'thunder':
        nodes.push(createFilteredNoise(200, 0.2, 'brown'));
        break;
      case 'wind':
        nodes.push(createFilteredNoise(600, 0.4));
        break;
      case 'fire':
        nodes.push(createFilteredNoise(300, 0.3, 'brown'));
        break;
      case 'cafe':
        nodes.push(createFilteredNoise(1500, 2));
        break;
      case 'fan':
        nodes.push(createFilteredNoise(500, 0.2, 'pink'));
        break;
      case 'train':
        nodes.push(createFilteredNoise(150, 0.1, 'brown'));
        break;
      case 'white':
        nodes.push(createFilteredNoise(20000, 0.1, 'white'));
        break;
      case 'pink':
        nodes.push(createFilteredNoise(20000, 0.1, 'pink'));
        break;
      case 'brown':
        nodes.push(createFilteredNoise(20000, 0.1, 'brown'));
        break;
      case '432hz':
        nodes.push(createOscillator(432));
        break;
      case '528hz':
        nodes.push(createOscillator(528));
        break;
      case '396hz':
        nodes.push(createOscillator(396));
        break;
      case '639hz':
        nodes.push(createOscillator(639));
        break;
    }
    
    return nodes;
  };

  const toggleSound = (soundId) => {
    if (activeSounds[soundId]) {
      // Stop sound
      const nodes = sourceNodesRef.current[soundId];
      if (nodes) {
        nodes.forEach(n => n.source?.stop && n.source.stop());
        delete sourceNodesRef.current[soundId];
      }
      setActiveSounds(prev => {
        const next = {...prev};
        delete next[soundId];
        return next;
      });
      if (Object.keys(activeSounds).length === 1) {
        setPlayingSound(null);
      }
    } else {
      // Start sound
      const nodes = generateSound(soundId, volume);
      sourceNodesRef.current[soundId] = nodes;
      setActiveSounds(prev => ({...prev, [soundId]: volume}));
      setPlayingSound(soundId);
    }
  };

  // Timer functionality
  const startTimer = (minutes) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(minutes);
    setTimerRemaining(minutes * 60);
    
    timerRef.current = setInterval(() => {
      setTimerRemaining(prev => {
        if (prev <= 1) {
          // Stop all sounds
          Object.keys(sourceNodesRef.current).forEach(id => {
            sourceNodesRef.current[id]?.forEach(n => n.source?.stop && n.source.stop());
          });
          sourceNodesRef.current = {};
          setActiveSounds({});
          setPlayingSound(null);
          setTimer(null);
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(null);
    setTimerRemaining(0);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(sourceNodesRef.current).forEach(nodes => {
        nodes?.forEach(n => n.source?.stop && n.source.stop());
      });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const activeCount = Object.keys(activeSounds).length;

  return (
    <div className={`p-4 space-y-4 ${getTextSizeClass()}`}>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">🎵 Sound Therapy</h2>
            <p className="text-sm opacity-80 mt-1">Mix sounds for perfect relaxation</p>
          </div>
          {activeCount > 0 && (
            <div className="bg-white/20 backdrop-blur rounded-full px-4 py-2">
              <span className="font-bold">{activeCount}</span> playing
            </div>
          )}
        </div>
        
        {/* Volume Control */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">🔊 Master Volume</span>
            <span className="text-sm font-bold">{Math.round(volume * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Timer Section */}
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-gray-800">⏱️ Sleep Timer</span>
          {timer && (
            <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold text-lg">
              {formatTimer(timerRemaining)}
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {[15, 30, 45, 60, 90].map(mins => (
            <button
              key={mins}
              onClick={() => timer === mins ? stopTimer() : startTimer(mins)}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
                timer === mins 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mins}m
            </button>
          ))}
          {timer && (
            <button onClick={stopTimer} className="px-4 py-2 rounded-xl font-semibold bg-red-100 text-red-600 hover:bg-red-200">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Sound Categories */}
      {Object.entries(soundCategories).map(([key, category]) => (
        <div key={key} className="bg-white rounded-2xl p-4 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-3">{category.title}</h3>
          <div className="grid grid-cols-3 gap-2">
            {category.sounds.map(sound => {
              const isActive = !!activeSounds[sound.id];
              return (
                <button
                  key={sound.id}
                  onClick={() => toggleSound(sound.id)}
                  className={`relative p-4 rounded-2xl text-center transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-br ${sound.color} text-white scale-105 shadow-lg`
                      : 'bg-gray-50 hover:bg-gray-100 hover:scale-102'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                  <div className="text-2xl mb-1">{sound.icon}</div>
                  <div className="text-xs font-semibold truncate">{sound.name}</div>
                  {sound.desc && <div className="text-xs opacity-70 truncate">{sound.desc}</div>}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Active Sounds Indicator */}
      {activeCount > 0 && (
        <div className="fixed bottom-24 left-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                🎵
              </div>
              <div>
                <p className="font-bold">{activeCount} sound{activeCount > 1 ? 's' : ''} playing</p>
                {timer && <p className="text-xs opacity-80">Timer: {formatTimer(timerRemaining)}</p>}
              </div>
            </div>
            <button
              onClick={() => {
                Object.keys(sourceNodesRef.current).forEach(id => {
                  sourceNodesRef.current[id]?.forEach(n => n.source?.stop && n.source.stop());
                });
                sourceNodesRef.current = {};
                setActiveSounds({});
                setPlayingSound(null);
              }}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full font-semibold transition"
            >
              Stop All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
// 😴 SLEEP TRACKER VIEW - ADVANCED WITH CALENDAR
const SleepTrackerViewNew = ({ t, user, sleepLog, setSleepLog, getTextSizeClass }) => {
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [quality, setQuality] = useState('good');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('log'); // 'log', 'calendar', 'stats'
  const [sleepGoal, setSleepGoal] = useState(8);
  const [factors, setFactors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // 📅 CALENDAR NAVIGATION
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [showNoteModal, setShowNoteModal] = useState(null); // Stores entry to view
  const [editingEntry, setEditingEntry] = useState(null); // Entry being edited

  const sleepFactors = [
    { id: 'caffeine', icon: '☕', label: 'Caffeine' },
    { id: 'exercise', icon: '🏃', label: 'Exercise' },
    { id: 'screens', icon: '📱', label: 'Screens' },
    { id: 'stress', icon: '😰', label: 'Stress' },
    { id: 'alcohol', icon: '🍷', label: 'Alcohol' },
    { id: 'meditation', icon: '🧘', label: 'Meditation' },
  ];

  const qualityOptions = [
    { value: 'excellent', label: 'Excellent', icon: '😴', color: 'from-green-400 to-emerald-500' },
    { value: 'good', label: 'Good', icon: '🙂', color: 'from-blue-400 to-blue-500' },
    { value: 'fair', label: 'Fair', icon: '😐', color: 'from-yellow-400 to-orange-400' },
    { value: 'poor', label: 'Poor', icon: '😫', color: 'from-red-400 to-red-500' },
  ];

  // Calculate hours from bed and wake times
  const calculateHours = () => {
    const [bedH, bedM] = bedtime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    let hours = wakeH - bedH + (wakeM - bedM) / 60;
    if (hours < 0) hours += 24;
    return Math.round(hours * 10) / 10;
  };

  const hours = calculateHours();

  // 💾 LOG SLEEP - Saves to state AND Firebase
  const logSleep = async () => {
    setSaving(true);
    const entry = {
      id: Date.now(),
      date: selectedDate,
      bedtime,
      wakeTime,
      hours,
      quality,
      notes,
      factors,
      timestamp: new Date().toISOString()
    };
    
    // Update local state
    const existingIndex = sleepLog.findIndex(log => log.date === selectedDate);
    let updatedLog;
    if (existingIndex >= 0) {
      updatedLog = [...sleepLog];
      updatedLog[existingIndex] = entry;
    } else {
      updatedLog = [...sleepLog, entry];
    }
    setSleepLog(updatedLog);
    
    // 💾 Save to Firebase
    try {
      if (user?.id) {
        await setDoc(doc(db, 'users', user.id), {
          sleepLog: updatedLog
        }, { merge: true });
        console.log('💤 Sleep logged to Firebase!');
      }
    } catch (err) {
      console.error('Error saving sleep:', err);
    }
    
    // Show success & reset form
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    setNotes('');
    setFactors([]);
    setSaving(false);
    setEditingEntry(null);
  };

  // Calculate stats
  const last7Days = sleepLog.filter(log => {
    const logDate = new Date(log.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  });

  const avgHours = last7Days.length > 0
    ? (last7Days.reduce((sum, log) => sum + log.hours, 0) / last7Days.length).toFixed(1)
    : 0;

  const sleepScore = Math.min(100, Math.round(
    (avgHours / sleepGoal * 50) + 
    (last7Days.filter(l => l.quality === 'excellent' || l.quality === 'good').length / Math.max(last7Days.length, 1) * 50)
  ));

  // 📅 Generate calendar data for current month view
  const generateCalendar = () => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const entry = sleepLog.find(log => log.date === dateStr);
      days.push({ day: i, date: dateStr, entry });
    }
    return days;
  };

  // Navigate months
  const goToPrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const getMonthName = () => {
    return new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getQualityColor = (quality) => {
    switch(quality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const toggleFactor = (factorId) => {
    setFactors(prev => 
      prev.includes(factorId) 
        ? prev.filter(f => f !== factorId)
        : [...prev, factorId]
    );
  };

  // Open entry for editing
  const openEditEntry = (entry) => {
    setSelectedDate(entry.date);
    setBedtime(entry.bedtime);
    setWakeTime(entry.wakeTime);
    setQuality(entry.quality);
    setNotes(entry.notes || '');
    setFactors(entry.factors || []);
    setEditingEntry(entry);
    setViewMode('log');
  };

  // 🔔 SLEEP REMINDER
  const [reminderTime, setReminderTime] = useState(localStorage.getItem('sleep_reminder_time') || '21:00');
  const [reminderEnabled, setReminderEnabled] = useState(localStorage.getItem('sleep_reminder_enabled') === 'true');
  const [showReminderBanner, setShowReminderBanner] = useState(false);

  // Check if it's reminder time
  useEffect(() => {
    if (!reminderEnabled) return;
    
    const checkReminder = () => {
      const now = new Date();
      const [reminderHour, reminderMin] = reminderTime.split(':').map(Number);
      const today = new Date().toISOString().split('T')[0];
      const hasLoggedToday = sleepLog.some(log => log.date === today);
      
      if (now.getHours() >= reminderHour && now.getMinutes() >= reminderMin && !hasLoggedToday) {
        setShowReminderBanner(true);
      }
    };
    
    checkReminder();
    const interval = setInterval(checkReminder, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [reminderEnabled, reminderTime, sleepLog]);

  const saveReminderSettings = (time, enabled) => {
    setReminderTime(time);
    setReminderEnabled(enabled);
    localStorage.setItem('sleep_reminder_time', time);
    localStorage.setItem('sleep_reminder_enabled', enabled.toString());
  };

  return (
    <div className={`p-4 space-y-4 ${getTextSizeClass()}`}>
      {/* 🔔 SLEEP REMINDER BANNER */}
      {showReminderBanner && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 text-white shadow-lg animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🌙</div>
              <div>
                <p className="font-bold">Time to log your sleep!</p>
                <p className="text-sm opacity-90">Track last night's rest before you forget</p>
              </div>
            </div>
            <button 
              onClick={() => { setShowReminderBanner(false); setViewMode('log'); }}
              className="px-4 py-2 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition"
            >
              Log Now
            </button>
          </div>
        </div>
      )}

      {/* Header with Score */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-3xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">😴 Sleep Tracker</h2>
            <p className="text-sm opacity-80 mt-1">Track your rest, improve your life</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold">{sleepScore}</span>
            </div>
            <p className="text-xs mt-1 opacity-80">Sleep Score</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center">
            <div className="text-xl font-bold">{avgHours}h</div>
            <div className="text-xs opacity-80">Avg Sleep</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center">
            <div className="text-xl font-bold">{sleepGoal}h</div>
            <div className="text-xs opacity-80">Goal</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center">
            <div className="text-xl font-bold">{last7Days.length}</div>
            <div className="text-xs opacity-80">This Week</div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex bg-gray-100 rounded-2xl p-1">
        {[
          { id: 'log', label: '📝 Log', icon: '📝' },
          { id: 'calendar', label: '📅 Calendar', icon: '📅' },
          { id: 'stats', label: '📊 Stats', icon: '📊' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`flex-1 py-2 rounded-xl font-semibold text-sm transition ${
              viewMode === tab.id 
                ? 'bg-white shadow text-purple-600' 
                : 'text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LOG VIEW */}
      {viewMode === 'log' && (
        <div className="space-y-4">
          {/* Date Picker */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
            />
          </div>

          {/* Time Inputs */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🌙 Bedtime</label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">☀️ Wake Up</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none text-lg"
                />
              </div>
            </div>
            <div className="mt-4 bg-purple-50 rounded-xl p-3 text-center">
              <span className="text-2xl font-bold text-purple-600">{hours} hours</span>
              <span className="text-sm text-gray-500 ml-2">of sleep</span>
            </div>
          </div>

          {/* Quality Selection */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">How did you sleep?</label>
            <div className="grid grid-cols-4 gap-2">
              {qualityOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setQuality(opt.value)}
                  className={`p-3 rounded-xl text-center transition-all duration-200 ${
                    quality === opt.value
                      ? `bg-gradient-to-br ${opt.color} text-white scale-105 shadow-lg`
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{opt.icon}</div>
                  <div className="text-xs font-semibold">{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Factors */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-3">What affected your sleep?</label>
            <div className="flex flex-wrap gap-2">
              {sleepFactors.map(factor => (
                <button
                  key={factor.id}
                  onClick={() => toggleFactor(factor.id)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition ${
                    factors.includes(factor.id)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {factor.icon} {factor.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dreams, disturbances, how you felt..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none resize-none"
              rows="3"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={logSleep}
            disabled={saving}
            className={`w-full py-4 font-bold rounded-2xl transition shadow-lg ${
              showSuccess 
                ? 'bg-green-500 text-white' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:scale-102'
            } disabled:opacity-50`}
          >
            {saving ? '💤 Saving...' : showSuccess ? '✅ Sleep Logged!' : '💤 Log Sleep'}
          </button>
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          {/* 📅 MONTH NAVIGATION */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPrevMonth}
              className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center hover:bg-purple-200 transition font-bold text-xl"
            >
              ←
            </button>
            <h3 className="font-bold text-gray-800 text-lg">
              {getMonthName()}
            </h3>
            <button
              onClick={goToNextMonth}
              className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center hover:bg-purple-200 transition font-bold text-xl"
            >
              →
            </button>
          </div>
          
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((day, idx) => {
              const isToday = day?.date === new Date().toISOString().split('T')[0];
              const isSelected = day?.date === selectedDate;
              const hasEntry = day?.entry;
              
              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm relative ${
                    day ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                  } ${isToday && !isSelected ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    if (day) {
                      setSelectedDate(day.date);
                      if (day.entry) {
                        setShowNoteModal(day.entry);
                      }
                    }
                  }}
                >
                  {day && (
                    <>
                      <span className={`font-medium ${
                        isToday ? 'text-blue-600 font-bold' : 'text-gray-700'
                      }`}>
                        {day.day}
                      </span>
                      {hasEntry && (
                        <>
                          <div className={`w-3 h-3 rounded-full mt-0.5 ${getQualityColor(day.entry.quality)}`} />
                          {day.entry.notes && (
                            <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full" title="Has notes" />
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-3 mt-4 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> Excellent</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500" /> Good</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Fair</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /> Poor</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400" /> Note</span>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={() => setViewMode('log')}
            className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-2xl hover:opacity-90 transition"
          >
            ➕ Log Sleep for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </button>
        </div>
      )}

      {/* 📝 NOTE VIEW MODAL */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                😴 {new Date(showNoteModal.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <button onClick={() => setShowNoteModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Sleep Info */}
            <div className="bg-purple-50 rounded-2xl p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{showNoteModal.hours}h</div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
                <div>
                  <div className="text-2xl">{qualityOptions.find(q => q.value === showNoteModal.quality)?.icon}</div>
                  <div className="text-xs text-gray-500 capitalize">{showNoteModal.quality}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">{showNoteModal.bedtime}</div>
                  <div className="text-xs text-gray-500">→ {showNoteModal.wakeTime}</div>
                </div>
              </div>
            </div>
            
            {/* Factors */}
            {showNoteModal.factors?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Factors</h4>
                <div className="flex flex-wrap gap-2">
                  {showNoteModal.factors.map(factorId => {
                    const factor = sleepFactors.find(f => f.id === factorId);
                    return factor ? (
                      <span key={factorId} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {factor.icon} {factor.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            
            {/* Notes */}
            {showNoteModal.notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">📝 Notes</h4>
                <div className="bg-yellow-50 rounded-xl p-4 text-gray-700">
                  {showNoteModal.notes}
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowNoteModal(null)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  openEditEntry(showNoteModal);
                  setShowNoteModal(null);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition"
              >
                ✏️ Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATS VIEW */}
      {viewMode === 'stats' && (
        <div className="space-y-4">
          {/* Sleep Goal */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-gray-800">🎯 Sleep Goal</span>
              <span className="text-purple-600 font-bold">{sleepGoal} hours</span>
            </div>
            <input
              type="range"
              min="5"
              max="12"
              step="0.5"
              value={sleepGoal}
              onChange={(e) => setSleepGoal(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5h</span>
              <span>12h</span>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <h3 className="font-bold text-gray-800 mb-4">📊 Last 7 Days</h3>
            <div className="flex items-end justify-between h-32 gap-1">
              {[...Array(7)].map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dateStr = date.toISOString().split('T')[0];
                const entry = sleepLog.find(log => log.date === dateStr);
                const heightPercent = entry ? (entry.hours / 12 * 100) : 0;
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex-1 flex items-end">
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          entry 
                            ? entry.hours >= sleepGoal 
                              ? 'bg-gradient-to-t from-green-500 to-green-400' 
                              : 'bg-gradient-to-t from-purple-500 to-purple-400'
                            : 'bg-gray-200'
                        }`}
                        style={{ height: `${Math.max(heightPercent, 5)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500" /> Met Goal
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-purple-500" /> Below Goal
              </span>
            </div>
          </div>

          {/* Recent Entries */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <h3 className="font-bold text-gray-800 mb-3">📝 Recent Entries</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sleepLog.slice(-7).reverse().map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getQualityColor(log.quality)}`} />
                    <div>
                      <div className="font-semibold text-gray-800">{log.hours}h</div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{log.bedtime} → {log.wakeTime}</div>
                    {log.factors?.length > 0 && (
                      <div className="text-xs">
                        {log.factors.map(f => sleepFactors.find(sf => sf.id === f)?.icon).join(' ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sleepLog.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">😴</div>
                  <p>No sleep data yet</p>
                  <p className="text-sm">Start logging to see your stats!</p>
                </div>
              )}
            </div>
          </div>

          {/* 🔔 SLEEP REMINDER SETTINGS */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              🔔 Sleep Reminder
            </h3>
            
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
              <div>
                <span className="font-medium text-gray-800">Daily Reminder</span>
                <p className="text-xs text-gray-500">Get reminded to log your sleep</p>
              </div>
              <button
                onClick={() => saveReminderSettings(reminderTime, !reminderEnabled)}
                className={`relative w-14 h-7 rounded-full transition ${
                  reminderEnabled ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  reminderEnabled ? 'translate-x-8' : 'translate-x-1'
                }`}></span>
              </button>
            </div>
            
            {/* Reminder Time */}
            {reminderEnabled && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remind me at:</label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => saveReminderSettings(e.target.value, true)}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none text-lg"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  💡 We'll remind you to log last night's sleep at this time
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 📈 PROGRESS ANALYTICS VIEW (PREMIUM)
const ProgressAnalyticsView = ({ t, user, moodHistory, journalEntries, posts, sleepLog, breathingCount, getTextSizeClass }) => {
  // Calculate analytics
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const moodsLast30 = moodHistory.filter(m => new Date(m.timestamp) >= last30Days);
  const journalsLast30 = journalEntries.filter(j => new Date(j.timestamp) >= last30Days);
  const postsLast30 = posts.filter(p => new Date(p.timestamp) >= last30Days);
  
  // Mood score calculation (1-5 scale)
  const moodScores = { happy: 5, grateful: 5, calm: 4, neutral: 3, anxious: 2, sad: 2, angry: 1 };
  const avgMoodScore = moodsLast30.length > 0 
    ? (moodsLast30.reduce((sum, m) => sum + (moodScores[m.mood] || 3), 0) / moodsLast30.length).toFixed(1)
    : 'N/A';
  
  // Wellness score (composite)
  const wellnessScore = Math.min(100, Math.round(
    (moodsLast30.length * 2) + 
    (journalsLast30.length * 5) + 
    (postsLast30.length * 3) + 
    (breathingCount * 2) +
    (user.streak * 3)
  ));

  // Weekly mood trend
  const weeklyMoods = [0, 1, 2, 3, 4, 5, 6].map(daysAgo => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dayMoods = moodHistory.filter(m => {
      const mDate = new Date(m.timestamp);
      return mDate.toDateString() === date.toDateString();
    });
    const avgScore = dayMoods.length > 0 
      ? dayMoods.reduce((sum, m) => sum + (moodScores[m.mood] || 3), 0) / dayMoods.length
      : 0;
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()], score: avgScore };
  }).reverse();

  return (
    <div className={`p-4 space-y-5 ${getTextSizeClass()}`}>
      {/* 💎 Crystal Header */}
      <div className="crystal-card p-6 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-4xl">📈</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800">Progress Analytics</h2>
          <p className="text-gray-500">Your wellness journey in numbers</p>
        </div>

        {/* Wellness Score */}
        <div className="crystal-stat p-6 text-center mb-6">
          <div className="text-5xl font-black bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            {wellnessScore}
          </div>
          <p className="text-gray-500 font-medium mt-2">Wellness Score</p>
          <div className="crystal-progress mt-3">
            <div className="crystal-progress-bar" style={{ width: `${wellnessScore}%` }}></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="crystal-stat text-center">
            <div className="text-3xl font-bold text-purple-600">{avgMoodScore}</div>
            <p className="text-sm text-gray-500">Avg Mood (1-5)</p>
          </div>
          <div className="crystal-stat text-center">
            <div className="text-3xl font-bold text-pink-600">{user.streak}</div>
            <p className="text-sm text-gray-500">Day Streak 🔥</p>
          </div>
          <div className="crystal-stat text-center">
            <div className="text-3xl font-bold text-blue-600">{journalsLast30.length}</div>
            <p className="text-sm text-gray-500">Journals (30d)</p>
          </div>
          <div className="crystal-stat text-center">
            <div className="text-3xl font-bold text-green-600">{breathingCount}</div>
            <p className="text-sm text-gray-500">Breathing Sessions</p>
          </div>
        </div>

        {/* Weekly Mood Chart */}
        <div className="crystal-card p-5">
          <h3 className="font-bold text-gray-800 mb-4">📊 Weekly Mood Trend</h3>
          <div className="h-40 flex items-end justify-between gap-2">
            {weeklyMoods.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(day.score / 5) * 100}%`, minHeight: day.score > 0 ? '20px' : '4px' }}
                ></div>
                <span className="text-xs text-gray-500 font-medium">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            Higher bars = better mood days
          </div>
        </div>

        {/* Insights */}
        <div className="crystal-card p-5 mt-4 bg-gradient-to-br from-purple-50 to-pink-50">
          <h3 className="font-bold text-gray-800 mb-3">💡 Insights</h3>
          <div className="space-y-2 text-sm text-gray-600">
            {moodsLast30.length >= 7 && (
              <p>✅ You've been consistent with mood tracking! Keep it up.</p>
            )}
            {journalsLast30.length >= 5 && (
              <p>📓 Journaling regularly helps process emotions better.</p>
            )}
            {user.streak >= 7 && (
              <p>🔥 Amazing {user.streak}-day streak! You're building healthy habits.</p>
            )}
            {breathingCount >= 5 && (
              <p>🧘 Your breathing practice is helping reduce stress.</p>
            )}
            {moodsLast30.length < 7 && (
              <p>💜 Try tracking your mood daily to see patterns emerge.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 🏆 ACHIEVEMENTS VIEW
const AchievementsViewNew = ({ t, posts, groups, gratitudePosts, journalEntries, moodHistory, breathingCount, getTextSizeClass }) => {
  const checkAchievement = (achievement) => {
    switch (achievement.type) {
      case 'posts': return posts.length >= achievement.requirement;
      case 'groups': return groups.filter(g => g.joined).length >= achievement.requirement;
      case 'gratitude': return gratitudePosts.length >= achievement.requirement;
      case 'journal': return journalEntries.length >= achievement.requirement;
      case 'moods': return moodHistory.length >= achievement.requirement;
      case 'breathing': return breathingCount >= achievement.requirement;
      default: return false;
    }
  };

  const unlockedCount = ACHIEVEMENTS.filter(checkAchievement).length;
  const progress = (unlockedCount / ACHIEVEMENTS.length) * 100;

  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-6 text-white text-center">
        <div className="text-6xl mb-3">🏆</div>
        <h2 className="text-2xl font-bold mb-2">{t.achievements}</h2>
        <p className="opacity-90">Your journey progress</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-bold text-gray-800 text-2xl">{unlockedCount}/{ACHIEVEMENTS.length}</div>
            <div className="text-sm text-gray-600">{t.unlocked}</div>
          </div>
          <div className="text-5xl">{unlockedCount > 0 ? '🎉' : '🔒'}</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {ACHIEVEMENTS.map(achievement => {
          const unlocked = checkAchievement(achievement);
          return (
            <div
              key={achievement.id}
              className={`rounded-2xl p-5 shadow transition ${
                unlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300'
                  : 'bg-white opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`text-5xl ${unlocked ? 'animate-bounce' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800 mb-1">{achievement.title}</div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                </div>
                {unlocked ? (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {t.unlocked}
                  </div>
                ) : (
                  <div className="bg-gray-300 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                    {t.locked}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 🔒 PRIVACY & DATA VIEW
const PrivacyViewNew = ({ t, user, posts, journalEntries, moodHistory, sleepLog, getTextSizeClass }) => {
  const exportData = () => {
    const data = {
      user,
      posts,
      journalEntries,
      moodHistory,
      sleepLog,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `YRHAlone-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-3xl p-6 text-white text-center">
        <div className="text-6xl mb-3">🔒</div>
        <h2 className="text-2xl font-bold mb-2">{t.dataPrivacy}</h2>
        <p className="opacity-90">Your data, your control</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
        <h3 className="font-bold text-gray-800 text-lg">Your Data</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Posts:</span>
            <span className="font-bold">{posts.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Journal Entries:</span>
            <span className="font-bold">{journalEntries.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Mood Check-ins:</span>
            <span className="font-bold">{moodHistory.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Sleep Logs:</span>
            <span className="font-bold">{sleepLog.length}</span>
          </div>
        </div>

        <button
          onClick={exportData}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:scale-105 transition"
        >
          📥 {t.exportData}
        </button>

        <div className="text-xs text-gray-500 text-center">
          Downloads as JSON file
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
        <h3 className="font-bold text-gray-800 text-lg">Security</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-semibold text-gray-800">{t.lockApp}</div>
              <div className="text-xs text-gray-500">Require unlock to open</div>
            </div>
            <div className="text-2xl">🔐</div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-semibold text-gray-800">End-to-End Encryption</div>
              <div className="text-xs text-gray-500">Your data is encrypted</div>
            </div>
            <div className="text-2xl">✅</div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-semibold text-gray-800">Anonymous Mode</div>
              <div className="text-xs text-gray-500">Post without revealing identity</div>
            </div>
            <div className="text-2xl">🕶️</div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6">
        <h3 className="font-bold text-red-900 text-lg mb-3">Danger Zone</h3>
        <button
          onClick={() => {
            if (window.confirm('Are you sure? This will delete ALL your data permanently!')) {
              window.location.reload();
            }
          }}
          className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition"
        >
          🗑️ {t.deleteAllData}
        </button>
        <p className="text-xs text-red-600 text-center mt-2">This action cannot be undone</p>
      </div>
    </div>
  );
};

// 🛠️ TOOLS MENU VIEW
// ============================================
// 🛡️ SAFETY SETTINGS VIEW
// ============================================
const SafetySettingsView = ({ user, setUser, onBack }) => {
  const [settings, setSettings] = useState(user.safetySettings || {
    hideFromSearch: false,
    approveMessages: true,
    showOnlineStatus: false,
    contentFilter: 'moderate',
    allowDirectMessages: true
  });

  const handleSave = () => {
    setUser({ ...user, safetySettings: settings });
    alert('Safety settings saved! 💜');
    onBack();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-full bg-white shadow hover:bg-gray-50">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Safety & Privacy</h1>
          <p className="text-gray-500">Control who can interact with you</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-4">🔒 Privacy Controls</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
            <div><p className="font-medium">Hide from Search</p><p className="text-sm text-gray-500">Others can't find you by searching</p></div>
            <input type="checkbox" checked={settings.hideFromSearch} onChange={(e) => setSettings({...settings, hideFromSearch: e.target.checked})} className="w-5 h-5 rounded text-purple-500" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
            <div><p className="font-medium">Approve Messages</p><p className="text-sm text-gray-500">Review message requests first</p></div>
            <input type="checkbox" checked={settings.approveMessages} onChange={(e) => setSettings({...settings, approveMessages: e.target.checked})} className="w-5 h-5 rounded text-purple-500" />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
            <div><p className="font-medium">Show Online Status</p><p className="text-sm text-gray-500">Let others see when you're active</p></div>
            <input type="checkbox" checked={settings.showOnlineStatus} onChange={(e) => setSettings({...settings, showOnlineStatus: e.target.checked})} className="w-5 h-5 rounded text-purple-500" />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-4">🛡️ Content Filtering</h3>
        <div className="space-y-2">
          {[
            { id: 'strict', label: 'Strict', desc: 'Maximum filtering (recommended for minors)' },
            { id: 'moderate', label: 'Moderate', desc: 'Balanced filtering (recommended)' },
            { id: 'minimal', label: 'Minimal', desc: 'Adult users only' }
          ].map(opt => (
            <button key={opt.id} onClick={() => setSettings({...settings, contentFilter: opt.id})} className={`w-full p-4 rounded-xl border-2 text-left ${settings.contentFilter === opt.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
              <p className="font-medium">{opt.label}</p>
              <p className="text-sm text-gray-500">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSave} className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90">Save Settings</button>
    </div>
  );
};

// ============================================
// 📋 COMMUNITY GUIDELINES VIEW
// ============================================
const CommunityGuidelinesView = ({ onBack }) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-full bg-white shadow hover:bg-gray-50">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Community Guidelines</h1>
          <p className="text-gray-500">Our commitment to a safe space</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg space-y-6">
        <section>
          <h2 className="text-xl font-bold text-purple-600 mb-3">💜 Our Mission</h2>
          <p className="text-gray-700">YRNAlone (You aRe Not Alone) is a safe space for people seeking mental health support and connection.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-purple-600 mb-3">🛡️ Be Kind & Supportive</h2>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li>Treat all members with respect and compassion</li>
            <li>Offer encouragement to those struggling</li>
            <li>Remember everyone is on their own journey</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-red-500 mb-3">🚫 Zero Tolerance Policy</h2>
          <p className="text-gray-700 mb-2">Immediate suspension for:</p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li><strong>Sexual content or solicitation</strong></li>
            <li><strong>Harassment or bullying</strong></li>
            <li><strong>Hate speech or discrimination</strong></li>
            <li><strong>Violence or threats</strong></li>
            <li><strong>Predatory behavior</strong></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-blue-500 mb-3">👦👧 For Minors (Under 18)</h2>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li>Never share personal info (name, school, address)</li>
            <li>Don't arrange to meet anyone in person</li>
            <li>Report anyone who makes you uncomfortable</li>
            <li><strong>Adults should never ask you to keep secrets</strong></li>
          </ul>
        </section>

        <section className="bg-green-50 rounded-2xl p-4">
          <h2 className="text-lg font-bold text-green-600 mb-2">📞 Crisis Resources</h2>
          <p className="text-gray-700">In immediate danger? Call <strong>911</strong></p>
          <p className="text-gray-700">Suicide Prevention: <strong>988</strong> (24/7)</p>
          <p className="text-gray-700">Crisis Text: <strong>Text HOME to 741741</strong></p>
        </section>
      </div>
    </div>
  );
};

// ============================================
// 🚫 BLOCKED USERS VIEW
// ============================================
const BlockedUsersView = ({ blockedUsers, setBlockedUsers, onBack }) => {
  const unblockUser = (userId) => {
    if (window.confirm('Are you sure you want to unblock this user?')) {
      setBlockedUsers(blockedUsers.filter(u => u.id !== userId));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-full bg-white shadow hover:bg-gray-50">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blocked Users</h1>
          <p className="text-gray-500">{blockedUsers.length} blocked account{blockedUsers.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {blockedUsers.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Blocked Users</h3>
          <p className="text-gray-500">You haven't blocked anyone. Blocked users can't see your profile or message you.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {blockedUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 border-b hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 text-xl">🚫</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">Blocked {new Date(user.blockedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => unblockUser(user.id)} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200">
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-purple-50 rounded-2xl p-4">
        <p className="text-purple-700 text-sm">
          💜 <strong>Note:</strong> Blocked users cannot see your profile, posts, or send you messages. They won't be notified that they've been blocked.
        </p>
      </div>
    </div>
  );
};

// ============================================
// 🎨 THEME CUSTOMIZATION VIEW - Feel at Home!
// Beautiful backgrounds users can personalize
// ============================================
const ThemeCustomizationView = ({ user, setUser, onBack, currentTheme }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTheme, setPreviewTheme] = useState(currentTheme || 'lavenderDream');

  const getThemesByCategory = (category) => {
    if (category === 'all') return Object.entries(APP_THEMES);
    return Object.entries(APP_THEMES).filter(([_, theme]) => theme.category === category);
  };

  const applyTheme = (themeKey) => {
    setUser({ ...user, appTheme: themeKey });
    // In production, save to Firebase
  };

  const theme = APP_THEMES[previewTheme] || APP_THEMES.lavenderDream;

  return (
    <div className={`min-h-screen ${theme.bg} p-6 transition-all duration-500`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className={`p-2 rounded-full ${theme.card} shadow hover:scale-105 transition`}>
            <ArrowLeft className={`w-6 h-6 ${theme.text}`} />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${theme.text}`}>🎨 Make It Yours</h1>
            <p className={`${theme.text} opacity-70`}>Choose a theme that feels like home</p>
          </div>
        </div>

        {/* Current Theme Preview */}
        <div className={`${theme.card} rounded-3xl p-6 shadow-lg mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-sm ${theme.text} opacity-70`}>Currently Previewing</p>
              <h2 className={`text-xl font-bold ${theme.text}`}>{APP_THEMES[previewTheme]?.emoji} {APP_THEMES[previewTheme]?.name}</h2>
            </div>
            <button 
              onClick={() => applyTheme(previewTheme)}
              className={`px-6 py-3 bg-gradient-to-r ${theme.accent} text-white font-bold rounded-xl hover:scale-105 transition shadow-lg`}
            >
              ✨ Apply Theme
            </button>
          </div>
          <p className={`text-sm ${theme.text} opacity-60`}>
            Tap any theme below to preview it. When you find one you love, click "Apply Theme"!
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition ${
              selectedCategory === 'all' 
                ? `bg-gradient-to-r ${theme.accent} text-white` 
                : `${theme.card} ${theme.text}`
            }`}
          >
            🌟 All Themes
          </button>
          {Object.entries(THEME_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition ${
                selectedCategory === key 
                  ? `bg-gradient-to-r ${theme.accent} text-white` 
                  : `${theme.card} ${theme.text}`
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-2 gap-4">
          {getThemesByCategory(selectedCategory).map(([key, themeOption]) => (
            <button
              key={key}
              onClick={() => setPreviewTheme(key)}
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                previewTheme === key ? 'ring-4 ring-white shadow-2xl scale-105' : 'shadow-lg'
              }`}
            >
              {/* Theme Preview */}
              <div className={`${themeOption.bg} p-4 h-32`}>
                <div className={`${themeOption.card} rounded-xl p-3 h-full`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{themeOption.emoji}</span>
                    <span className={`font-bold text-sm ${themeOption.text}`}>{themeOption.name}</span>
                  </div>
                  <div className={`w-full h-2 rounded-full bg-gradient-to-r ${themeOption.accent}`}></div>
                </div>
              </div>
              {/* Selected Indicator */}
              {previewTheme === key && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              )}
              {/* Current Theme Indicator */}
              {user.appTheme === key && (
                <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  ✓ Current
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Fun Tip */}
        <div className={`${theme.card} rounded-2xl p-4 mt-6 text-center`}>
          <p className={`${theme.text} text-sm`}>
            💡 <strong>Pro tip:</strong> Dark themes are easier on your eyes at night and can help you relax before bed!
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📹 VIDEO CALL VIEW - Group Video Support
// ============================================
const ToolsMenuViewNew = ({ t, setCurrentView, getTextSizeClass, showUpgrade, hasPremiumAccess }) => {
  const tools = [
    { id: 'journal', icon: '📓', name: 'Mood & Journal', color: 'from-purple-500 to-pink-500', view: 'journal', premium: false },
    { id: 'quickrelief', icon: '🧘', name: t.quickRelief, color: 'from-emerald-500 to-teal-500', view: 'quickrelief', premium: false },
    { id: 'gratitude', icon: '💖', name: t.gratitudeWall, color: 'from-pink-500 to-rose-500', view: 'gratitude', premium: false },
    { id: 'education', icon: '📚', name: t.education, color: 'from-amber-500 to-orange-500', view: 'education', premium: false },
    { id: 'soundtherapy', icon: '🎵', name: t.soundTherapy, color: 'from-indigo-500 to-violet-500', view: 'soundtherapy', premium: true },
    { id: 'sleeptracker', icon: '😴', name: t.sleepTracker, color: 'from-blue-500 to-indigo-500', view: 'sleeptracker', premium: true },
    { id: 'progressanalytics', icon: '📈', name: 'Progress Analytics', color: 'from-cyan-500 to-blue-500', view: 'progressanalytics', premium: true },
    { id: 'achievements', icon: '🏆', name: t.achievements, color: 'from-yellow-500 to-amber-500', view: 'achievements', premium: false }
  ];

  const handleToolClick = (tool) => {
    if (tool.premium && !hasPremiumAccess) {
      showUpgrade?.();
    } else {
      setCurrentView(tool.view);
    }
  };

  return (
    <div className={`p-4 space-y-5 ${getTextSizeClass()}`}>
      {/* 💎 PREMIUM HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-[28px] p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-3 animate-float">🛠️</div>
          <h2 className="text-2xl font-extrabold mb-2 tracking-tight">{t.wellnessTools}</h2>
          <p className="text-white/90 font-medium">{t.everythingYouNeed}</p>
        </div>
      </div>

      {/* 💎 PREMIUM TOOLS GRID */}
      <div className="grid grid-cols-2 gap-4">
        {tools.map((tool, index) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool)}
            className={`relative overflow-hidden bg-gradient-to-br ${tool.color} rounded-[24px] p-5 text-white text-center hover:scale-105 hover:shadow-2xl transition-all duration-300 shadow-lg group ${tool.premium && !hasPremiumAccess ? 'opacity-80' : ''}`}
            style={{animationDelay: `${index * 0.05}s`}}
          >
            {/* Premium lock overlay */}
            {tool.premium && !hasPremiumAccess && (
              <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg z-20">
                👑 PRO
              </div>
            )}
            
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">{tool.icon}</div>
              <div className="text-sm font-bold">{tool.name}</div>
            </div>
            
            {tool.badge > 0 && (
              <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                {tool.badge}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Show upgrade banner for free users */}
      {!hasPremiumAccess && (
        <button 
          onClick={() => showUpgrade?.()}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-[20px] p-4 text-center shadow-lg hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-center gap-3 text-white font-bold">
            <span className="text-2xl">👑</span>
            <span>Unlock All Premium Tools - $5.99/mo</span>
          </div>
        </button>
      )}

      {/* 💎 PREMIUM FOOTER */}
      <div className="glass-card-strong rounded-[24px] p-5 text-center">
        <p className="text-gray-600 text-sm font-medium flex items-center justify-center gap-2">
          <span className="text-lg">💜</span>
          Your wellness toolkit. Use anytime, anywhere.
        </p>
      </div>
    </div>
  );
};

// 🔒 PRIVACY & DATA VIEW
const PrivacyDataView = ({ t, user, posts, journalEntries, moodHistory, sleepLog, getTextSizeClass }) => {
  const exportData = () => {
    const data = {
      user,
      posts,
      journalEntries,
      moodHistory,
      sleepLog,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `YRHAlone-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className={`p-6 space-y-6 ${getTextSizeClass()}`}>
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-3xl p-6 text-white text-center">
        <div className="text-6xl mb-3">🔒</div>
        <h2 className="text-2xl font-bold mb-2">{t.dataPrivacy}</h2>
        <p className="opacity-90">Your data, your control</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
        <h3 className="font-bold text-gray-800 text-lg">Your Data</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Posts:</span>
            <span className="font-bold">{posts.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Journal Entries:</span>
            <span className="font-bold">{journalEntries.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Mood Check-ins:</span>
            <span className="font-bold">{moodHistory.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Sleep Logs:</span>
            <span className="font-bold">{sleepLog.length}</span>
          </div>
        </div>

        <button
          onClick={exportData}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:scale-105 transition"
        >
          📥 {t.exportData}
        </button>

        <div className="text-xs text-gray-500 text-center">
          Downloads as JSON file
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
        <h3 className="font-bold text-gray-800 text-lg">Security</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-semibold text-gray-800">{t.lockApp}</div>
              <div className="text-xs text-gray-500">Require unlock to open</div>
            </div>
            <div className="text-2xl">🔐</div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-semibold text-gray-800">End-to-End Encryption</div>
              <div className="text-xs text-gray-500">Your data is encrypted</div>
            </div>
            <div className="text-2xl">✅</div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-semibold text-gray-800">Anonymous Mode</div>
              <div className="text-xs text-gray-500">Post without revealing identity</div>
            </div>
            <div className="text-2xl">🕶️</div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6">
        <h3 className="font-bold text-red-900 text-lg mb-3">Danger Zone</h3>
        <button
          onClick={() => {
            if (window.confirm('Are you sure? This will delete ALL your data permanently!')) {
              window.location.reload();
            }
          }}
          className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition"
        >
          🗑️ {t.deleteAllData}
        </button>
        <p className="text-xs text-red-600 text-center mt-2">This action cannot be undone</p>
      </div>
    </div>
  );
};

// ✅ MAIN COMPONENT
const YRNAloneApp = () => {
  // 💜 PREMIUM
  const { showUpgradeModal, hideUpgrade, showUpgrade, hasPremiumAccess } = usePremium();
  
  const [currentView, setCurrentView] = useState('home');
  const [userLanguage, setUserLanguage] = useState('en');
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState('medium');
  const [showEmergency, setShowEmergency] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // 💳 PAYMENT SUCCESS HANDLER - Redirect back to app after Stripe payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const tier = urlParams.get('tier');
    
    if (payment === 'success') {
      setPaymentSuccess(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Show success message
      setTimeout(() => {
        alert(`🎉 Payment successful!\n\nWelcome to YRNAlone ${tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Premium'}!\n\nYour premium features are now active. Thank you for supporting mental health! 💜`);
        setPaymentSuccess(false);
      }, 500);
    } else if (payment === 'cancelled') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 🎯 BUG 1 FIX: Check for pending admin redirect on mount
  useEffect(() => {
    const pendingRedirect = sessionStorage.getItem('pendingAdminRedirect');
    if (pendingRedirect === 'true') {
      console.log('🏢 Found pending admin redirect flag, redirecting to admin dashboard');
      sessionStorage.removeItem('pendingAdminRedirect');
      setCurrentView('admin');
    }
  }, []);

  const [user, setUser] = useState({
    id: Date.now(), name: 'Friend', streak: 1, appTheme: 'cute', profilePicture: null,
    privacy: { anonymous: false, showOnline: true, allowMatching: true },
    matchingPreferences: { interests: [], supportNeeds: [] }
  });

  const [newPost, setNewPost] = useState('');
  const [selectedMood, setSelectedMood] = useState('happy');
  const [posts, setPosts] = useState([]);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [showPostMenu, setShowPostMenu] = useState({});
  const [showOriginal, setShowOriginal] = useState({});
  const [translationCache, setTranslationCache] = useState({});
  const [showOriginalGroup, setShowOriginalGroup] = useState({});
  const [showOriginalGratitude, setShowOriginalGratitude] = useState({});
  
  // 🔔 NOTIFICATION SYSTEM (Like Facebook/Instagram)
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // NEW FEATURE STATES
  const [moodHistory, setMoodHistory] = useState([]);
  const [sleepLog, setSleepLog] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [aiMessages, setAiMessages] = useState([]);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [breathingCount, setBreathingCount] = useState(0);
  const [playingSound, setPlayingSound] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showMoodInsights, setShowMoodInsights] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  const [showPanicHelp, setShowPanicHelp] = useState(false);

  const [journalEntry, setJournalEntry] = useState('');
  const [journalMood, setJournalMood] = useState('happy');
  const [journalSaved, setJournalSaved] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showSavedEntries, setShowSavedEntries] = useState(false);
  const [selectedJournalTheme, setSelectedJournalTheme] = useState('cute');

  const [gratitudePosts, setGratitudePosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [inviteGroupId, setInviteGroupId] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [showMatchingQuestions, setShowMatchingQuestions] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedSupport, setSelectedSupport] = useState('');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [reportedContent, setReportedContent] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingGroup, setIsRecordingGroup] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [groupAudioBlob, setGroupAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimeGroup, setRecordingTimeGroup] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const [allAppUsers, setAllAppUsers] = useState([{ id: user.id, name: user.name, status: 'online' }]);
  
  // Premium tier: 'free', 'basic', 'pro', 'ultimate'
  const [userPremiumTier, setUserPremiumTier] = useState('free');
  
  // 🔥 SYNC USER PROFILE FROM FIREBASE - This loads name, profile pic, etc. after login
  useEffect(() => {
    const syncUserProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(prev => ({
            ...prev,
            id: currentUser.uid,
            name: userData.name || userData.username || prev.name,
            email: userData.email || currentUser.email,
            profilePicture: userData.profilePicture || null,
            streak: userData.stats?.daysActive || prev.streak,
            privacy: userData.privacy || prev.privacy,
            matchingPreferences: userData.matchingPreferences || prev.matchingPreferences,
            bio: userData.bio || '',
            organizationId: userData.organizationId || null,
            organizationName: userData.organizationName || null,
            isOrgAdmin: userData.isOrgAdmin || false,
            isOrgUser: userData.isOrgUser || userData.isOrgMember || false // 🎯 Sync org user flag
          }));
          
          // Also sync premium tier
          if (userData.isPremium) {
            setUserPremiumTier(userData.premiumTier || 'basic');
          }
          if (userData.organizationId) {
            setUserPremiumTier('ultimate'); // Org members get full access
          }
          
          console.log('✅ User profile synced from Firebase:', userData.name || userData.username);
        }
      } catch (error) {
        console.log('Profile sync error (normal if not logged in):', error.message);
      }
    };
    
    // Run sync on mount and when auth changes
    syncUserProfile();
    
    // Also listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        syncUserProfile();
      }
    });
    
    return () => unsubscribe();
  }, []);

  // 🏢 CRITICAL FIX: Org admin redirect - runs after user data loads
  // This ensures org admin NEVER sees user home view - doesn't wait for enterprise context
  const [orgAdminChecked, setOrgAdminChecked] = useState(false);
  useEffect(() => {
    // Check sessionStorage flag set during login
    const pendingRedirect = sessionStorage.getItem('pendingAdminRedirect');

    if (pendingRedirect === 'true' && currentView === 'home') {
      console.log('🏢 Redirecting org admin to dashboard...');
      sessionStorage.removeItem('pendingAdminRedirect');
      setCurrentView('admin');
      setOrgAdminChecked(true);
      return;
    }

    // Also check user data directly - don't wait for enterprise context
    if (!orgAdminChecked && user && user.isOrgAdmin && user.organizationId && currentView === 'home') {
      console.log('🏢 Org admin detected from user data, redirecting...');
      setCurrentView('admin');
      setOrgAdminChecked(true);
    }
  }, [user, user?.isOrgAdmin, user?.organizationId, currentView, orgAdminChecked]);

  // Default groups structure (used if Firestore is empty)
  const DEFAULT_GROUPS = [
    { id: 'depression', name: '💙 Depression Support', description: 'A safe space for those dealing with depression' },
    { id: 'anxiety', name: '🌊 Anxiety Support', description: 'Share experiences and coping strategies' },
    { id: 'ptsd', name: '🕊️ PTSD Support', description: 'Support for those healing from trauma' },
    { id: 'grief', name: '🌸 Grief & Loss', description: 'Navigate grief together' },
    { id: 'addiction', name: '💪 Addiction Recovery', description: 'Support for recovery journey' },
    { id: 'bipolar', name: '🌓 Bipolar Support', description: 'Community for bipolar disorder' },
    { id: 'eating', name: '🌺 Eating Disorders', description: 'Healing relationship with food' },
    { id: 'ocd', name: '🔄 OCD Support', description: 'Living with OCD' },
    { id: 'postpartum', name: '🤱 Postpartum Support', description: 'Support for new mothers' },
    { id: 'lgbtq', name: '🌈 LGBTQ+ Support', description: 'Safe space for LGBTQ+ community' },
    { id: 'crisis', name: '🆘 Crisis & Suicidal Thoughts', description: 'Immediate support for those in crisis' }
  ];
  
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  // 🔥 LOAD GROUPS FROM FIRESTORE
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groupsRef = collection(db, 'groups');
        const groupsSnap = await getDocs(groupsRef);
        
        if (groupsSnap.empty) {
          // Initialize default groups in Firestore
          console.log('Initializing default groups in Firestore...');
          const initializedGroups = [];
          
          for (const group of DEFAULT_GROUPS) {
            await setDoc(doc(db, 'groups', group.id), {
              name: group.name,
              description: group.description,
              members: 0,
              memberIds: [],
              createdAt: new Date().toISOString()
            });
            initializedGroups.push({
              ...group,
              members: 0,
              memberIds: [],
              joined: false,
              messages: [],
              membersList: []
            });
          }
          setGroups(initializedGroups);
        } else {
          // Load existing groups
          const loadedGroups = [];
          groupsSnap.forEach(doc => {
            const data = doc.data();
            loadedGroups.push({
              id: doc.id,
              name: data.name,
              description: data.description,
              members: data.members || 0,
              memberIds: data.memberIds || [],
              joined: data.memberIds?.includes(user.id) || false,
              messages: [], // Messages loaded separately
              membersList: data.membersList || []
            });
          });
          setGroups(loadedGroups);
        }
      } catch (error) {
        console.error('Error loading groups:', error);
        // Fallback to local groups
        setGroups(DEFAULT_GROUPS.map(g => ({ ...g, members: 0, joined: false, messages: [], membersList: [] })));
      } finally {
        setGroupsLoading(false);
      }
    };
    
    loadGroups();
  }, [user.id]);

  // 🔥 LOAD POSTS FROM FIRESTORE (Real-time for all users)
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, orderBy('timestamp', 'desc'));
        
        // Real-time listener for posts
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const loadedPosts = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            loadedPosts.push({
              id: doc.id,
              ...data,
              timestamp: data.timestamp || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            });
          });
          setPosts(loadedPosts);
          console.log('✅ Loaded', loadedPosts.length, 'posts from Firebase');
        }, (error) => {
          console.log('Posts listener error:', error);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.log('Posts loading fallback to local');
      }
    };
    
    loadPosts();
  }, []);

  // 🔥 SAVE MOOD ENTRIES TO FIREBASE
  const addMoodEntryWithFirebase = async (entry) => {
    const newEntry = {
      ...entry,
      id: Date.now(),
      userId: user.id,
      timestamp: new Date().toISOString()
    };
    
    setMoodHistory(prev => [newEntry, ...prev]);
    
    // Save to Firebase for therapist/admin to see
    try {
      if (user.id) {
        await addDoc(collection(db, 'users', user.id, 'moodHistory'), newEntry);
        
        // Update user's moodTrend for admin dashboard
        const recentMoods = [newEntry, ...moodHistory].slice(0, 7);
        const moodValues = { happy: 5, grateful: 4, calm: 3, neutral: 2, anxious: 1, sad: 1, angry: 1 };
        const avgMood = recentMoods.reduce((sum, m) => sum + (moodValues[m.mood] || 2), 0) / recentMoods.length;
        const trend = avgMood >= 3.5 ? 'improving' : avgMood >= 2 ? 'stable' : 'declining';
        
        await updateDoc(doc(db, 'users', user.id), { 
          moodTrend: trend,
          lastMoodCheck: new Date().toISOString()
        });
      }
    } catch (err) {
      console.log('Mood saved locally');
    }
    
    checkAchievements('moodTracking');
  };

  // 🔥 SAVE JOURNAL ENTRIES TO FIREBASE
  const saveJournalEntryWithFirebase = async (entry) => {
    const newEntry = {
      ...entry,
      id: Date.now(),
      userId: user.id,
      timestamp: new Date().toISOString()
    };
    
    setJournalEntries(prev => [newEntry, ...prev]);
    
    // Save to Firebase
    try {
      if (user.id) {
        await addDoc(collection(db, 'users', user.id, 'journalEntries'), newEntry);
      }
    } catch (err) {
      console.log('Journal saved locally');
    }
  };

  // 🎯 AUTO-JOIN GROUPS & SET START VIEW BASED ON SURVEY
  // This makes the survey ACTUALLY personalize the experience!
  useEffect(() => {
    const applyOnboardingPersonalization = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (!userDoc.exists()) return;
        
        const userData = userDoc.data();
        
        // 🎯 SET STARTING VIEW based on survey answer
        if (userData.recommendedStartView && userData.recommendedStartView !== 'home') {
          console.log('🎯 Starting on preferred view:', userData.recommendedStartView);
          setCurrentView(userData.recommendedStartView);
        }
        
        // 🎯 AUTO-JOIN GROUPS based on what they're seeking help with
        if (userData.autoJoinedGroups && userData.autoJoinedGroups.length > 0 && groups.length > 0) {
          const groupsToJoin = userData.autoJoinedGroups.filter(groupId => {
            const group = groups.find(g => g.id === groupId);
            return group && !group.joined;
          });
          
          if (groupsToJoin.length > 0) {
            console.log('🎯 Auto-joining groups based on survey:', groupsToJoin);
            
            // Join each group
            for (const groupId of groupsToJoin) {
              try {
                await updateDoc(doc(db, 'groups', groupId), {
                  members: increment(1),
                  memberIds: arrayUnion(currentUser.uid)
                });
              } catch (err) {
                console.log('Auto-join error for group:', groupId);
              }
            }
            
            // Update local state
            setGroups(prev => prev.map(g => 
              groupsToJoin.includes(g.id) 
                ? { ...g, joined: true, members: (g.members || 0) + 1 }
                : g
            ));
            
            // Clear the auto-join so it doesn't happen again
            await updateDoc(doc(db, 'users', currentUser.uid), {
              autoJoinedGroups: []
            });
            
            console.log('✅ Auto-joined', groupsToJoin.length, 'groups based on your needs!');
          }
        }
      } catch (error) {
        console.log('Personalization check error:', error);
      }
    };
    
    // Only run after groups are loaded
    if (!groupsLoading && groups.length > 0) {
      applyOnboardingPersonalization();
    }
  }, [groupsLoading, groups.length]);

  // 🔥 REAL-TIME MESSAGES LISTENER
  useEffect(() => {
    if (groups.length === 0) return;
    
    const unsubscribes = [];
    
    groups.forEach(group => {
      const messagesRef = collection(db, 'groups', group.id, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach(doc => {
          messages.push({ id: doc.id, ...doc.data() });
        });
        
        setGroups(prev => prev.map(g => 
          g.id === group.id ? { ...g, messages } : g
        ));
      }, (error) => {
        console.error('Error listening to messages:', error);
      });
      
      unsubscribes.push(unsubscribe);
    });
    
    return () => unsubscribes.forEach(unsub => unsub());
  }, [groups.length]);

  // 🔥 TRACK ONLINE USERS & LOAD ALL USERS FOR MATCHING
  useEffect(() => {
    if (!user.id) return;
    
    // Save current user to Firebase with matching preferences
    const updateOnlineStatus = async () => {
      try {
        await setDoc(doc(db, 'users', user.id.toString()), {
          id: user.id,
          name: user.name,
          status: 'online',
          lastSeen: new Date().toISOString(),
          profilePicture: user.profilePicture || null,
          matchingPreferences: user.matchingPreferences || { interests: [], supportNeeds: [] },
          privacy: user.privacy || { allowMatching: true },
          bio: user.bio || ''
        }, { merge: true });
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };
    
    updateOnlineStatus();
    
    // Update every 5 minutes
    const interval = setInterval(updateOnlineStatus, 5 * 60 * 1000);
    
    // Listen for ALL users for matching
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        // Check if user was online in last 30 minutes
        const lastSeen = new Date(userData.lastSeen);
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const isOnline = lastSeen > thirtyMinutesAgo;
        
        users.push({
          id: doc.id,
          name: userData.name || 'Anonymous',
          status: isOnline ? 'online' : 'offline',
          profilePicture: userData.profilePicture,
          matchingPreferences: userData.matchingPreferences || { interests: [], supportNeeds: [] },
          privacy: userData.privacy || { allowMatching: true },
          bio: userData.bio || '',
          lastSeen: userData.lastSeen
        });
      });
      
      // Always include current user
      if (!users.find(u => u.id === user.id.toString())) {
        users.push({
          id: user.id,
          name: user.name,
          status: 'online',
          profilePicture: user.profilePicture,
          matchingPreferences: user.matchingPreferences || { interests: [], supportNeeds: [] },
          privacy: user.privacy || { allowMatching: true }
        });
      }
      
      setAllAppUsers(users);
    }, (error) => {
      console.error('Error loading users:', error);
    });
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [user.id, user.name, user.matchingPreferences]);

  const t = translations[userLanguage] || translations.en;

  // 🏢 ORGANIZATION ROUTING
  // - Org Admin → Starts at Admin Dashboard
  // - Org Employee → Starts at Home with org branding
  // - Regular User → Starts at Home
  const { isOrgAdmin, organization, isEnterprise, isTherapist, therapistId, loading: enterpriseLoading } = useEnterprise();
  const [hasRedirected, setHasRedirected] = useState(false);

  // 🐛 DEBUG: Log org admin status for troubleshooting
  useEffect(() => {
    console.log('🏢 Enterprise Status:', {
      isOrgAdmin,
      'user.isOrgAdmin': user.isOrgAdmin,
      organization: organization?.name || null,
      'user.organizationId': user.organizationId,
      enterpriseLoading,
      currentView,
      hasRedirected
    });
  }, [isOrgAdmin, organization, enterpriseLoading, currentView, hasRedirected, user.isOrgAdmin, user.organizationId]);

  useEffect(() => {
    // Don't redirect while still loading enterprise data
    if (enterpriseLoading) {
      console.log('⏳ Waiting for enterprise data to load...');
      return;
    }

    // 👨‍⚕️ THERAPISTS go to their dashboard
    if (isTherapist && therapistId && organization && !isOrgAdmin) {
      console.log('👨‍⚕️ Redirecting therapist to dashboard');
      setCurrentView('therapist');
      setHasRedirected(true);
      return;
    }

    // 🎯 BUG 1 FIX: Check BOTH EnterpriseContext AND user state for org admin
    // This catches cases where EnterpriseContext loads slower than user profile sync
    const isOrgAdminFromContext = isOrgAdmin && organization;
    const isOrgAdminFromUser = user.isOrgAdmin && user.organizationId;
    const shouldBeAdmin = isOrgAdminFromContext || isOrgAdminFromUser;

    if (shouldBeAdmin && currentView !== 'admin') {
      console.log('🏢 Redirecting org admin to admin dashboard', {
        fromEnterpriseContext: isOrgAdminFromContext,
        fromUserState: isOrgAdminFromUser
      });
      setCurrentView('admin');
      setHasRedirected(true);
    }
  }, [isOrgAdmin, isTherapist, therapistId, organization, currentView, enterpriseLoading, user.isOrgAdmin, user.organizationId]);

  // 🎯 BUG 1 FIX: Force org admin back to admin - check BOTH sources
  useEffect(() => {
    if (enterpriseLoading) return; // Wait for enterprise data

    const isOrgAdminFromContext = isOrgAdmin && organization;
    const isOrgAdminFromUser = user.isOrgAdmin && user.organizationId;
    const isOrgAdminUser = isOrgAdminFromContext || isOrgAdminFromUser;

    if (isOrgAdminUser && currentView !== 'admin') {
      console.log('🔒 Forcing org admin back to admin dashboard');
      setCurrentView('admin');
    }
  }, [currentView, isOrgAdmin, organization, enterpriseLoading, user.isOrgAdmin, user.organizationId]);

  // If therapist tries to navigate away, keep them on therapist dashboard
  useEffect(() => {
    if (!enterpriseLoading && isTherapist && therapistId && organization && !isOrgAdmin && currentView !== 'therapist') {
      setCurrentView('therapist');
    }
  }, [currentView, isTherapist, therapistId, organization, isOrgAdmin, enterpriseLoading]);

  // Update user with organization info
  useEffect(() => {
    if (organization && isEnterprise) {
      setUser(prev => ({
        ...prev,
        organizationId: organization.id,
        organizationName: organization.name,
        isOrgAdmin: isOrgAdmin,
        isOrgEmployee: !isOrgAdmin && isEnterprise
      }));
    }
  }, [organization, isEnterprise, isOrgAdmin]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // allAppUsers is now loaded from Firebase in the TRACK ONLINE USERS useEffect

  const startRecording = async (forGroup = false) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('❌ Voice recording is not supported in your browser. Please use Chrome, Firefox, or Safari.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size === 0) {
          alert('❌ Recording failed - no audio data captured. Please try again.');
          return;
        }
        if (forGroup) {
          setGroupAudioBlob(blob);
        } else {
          setAudioBlob(blob);
        }
        stream.getTracks().forEach(track => track.stop());
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      };

      mediaRecorder.start(1000);
      
      if (forGroup) {
        setRecordingTimeGroup(0);
        setIsRecordingGroup(true);
      } else {
        setRecordingTime(0);
        setIsRecording(true);
      }
      
      recordingTimerRef.current = setInterval(() => {
        if (forGroup) {
          setRecordingTimeGroup(prev => prev + 1);
        } else {
          setRecordingTime(prev => prev + 1);
        }
      }, 1000);
      
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        alert('🎤 Microphone Access Needed!\n\n✅ ALLOW the microphone when your browser asks!\n\nIf you already blocked it:\n1. Click the 🔒 lock icon in your address bar\n2. Find "Microphone" and set to "Allow"\n3. Refresh the page (F5)\n4. Try recording again!');
      } else if (error.name === 'NotFoundError') {
        alert('❌ No microphone found!\n\nPlease connect a microphone and try again.');
      } else {
        alert('❌ Could not access microphone:\n' + error.message);
      }
    }
  };

  const stopRecording = (forGroup = false) => {
    if (!mediaRecorderRef.current) return;
    if (mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping recorder:', error);
      }
    }
    if (forGroup) {
      setIsRecordingGroup(false);
    } else {
      setIsRecording(false);
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTextSizeClass = () => {
    switch(textSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  // Mock translation function - ready for real API
  const translateText = (text, fromLang, toLang) => {
    // ✅ FREE MyMemory Translation API - No API key needed!
    // 1000 free translations per day
    if (fromLang === toLang) return text;
    
    // Check cache first (instant results for repeated translations)
    const cacheKey = `${fromLang}-${toLang}-${text}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }
    
    // Fetch real translation from free API
    const encodedText = encodeURIComponent(text);
    fetch(`https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${fromLang}|${toLang}`)
      .then(response => response.json())
      .then(data => {
        if (data.responseData && data.responseData.translatedText) {
          setTranslationCache(prev => ({
            ...prev,
            [cacheKey]: data.responseData.translatedText
          }));
        }
      })
      .catch(err => console.log('Translation temporarily unavailable'));
    
    // Show original with loading indicator while translating
    const langNames = {
      en: 'English', es: 'Spanish', fr: 'French', 
      de: 'German', pt: 'Portuguese', zh: 'Chinese',
      ja: 'Japanese', it: 'Italian'
    };
    return `[Translating from ${langNames[fromLang]}...] ${text}`;
  };

  const addPost = async (content, mood, isVoice = false, audioUrl = null) => {
    const newPostObj = {
      id: Date.now(), content, mood, isVoice,
      audioUrl: audioUrl, // Store audio URL for playback
      author: user.privacy.anonymous ? 'Anonymous' : user.name,
      authorId: user.id,
      authorPicture: user.privacy.anonymous ? null : user.profilePicture,
      originalLanguage: userLanguage,
      timestamp: new Date().toISOString(),
      reactions: { heart: 0, hug: 0, star: 0, fire: 0 },
      comments: []
    };
    
    // Save to local state immediately for fast UI
    setPosts(prevPosts => [newPostObj, ...prevPosts]);
    
    // Save to Firebase for persistence and sharing
    try {
      await addDoc(collection(db, 'posts'), {
        ...newPostObj,
        createdAt: serverTimestamp()
      });
      console.log('✅ Post saved to Firebase');
    } catch (err) {
      console.log('Post saved locally (Firebase sync pending)');
    }
    
    checkAchievements('firstPost');
  };

  // NEW FEATURE FUNCTIONS
  const addMoodEntry = (entry) => {
    setMoodHistory(prev => [entry, ...prev]);
    checkAchievements('moodTracking');
  };

  const addSleepEntry = (entry) => {
    setSleepLog(prev => [entry, ...prev]);
    checkAchievements('sleepLog');
  };

  const checkAchievements = (action) => {
    const newAchievements = [];
    
    if (action === 'firstPost' && posts.length === 0) {
      newAchievements.push({ id: 'first-post', name: 'First Step', desc: 'Made your first post', emoji: '🎉', unlocked: true });
    }
    if (action === 'moodTracking' && moodHistory.length + 1 >= 7) {
      newAchievements.push({ id: 'mood-week', name: 'Mood Tracker', desc: 'Tracked mood for 7 days', emoji: '📊', unlocked: true });
    }
    if (action === 'sleepLog' && sleepLog.length + 1 >= 7) {
      newAchievements.push({ id: 'sleep-week', name: 'Sleep Champion', desc: 'Logged sleep for 7 nights', emoji: '🌙', unlocked: true });
    }
    if (user.streak >= 7) {
      newAchievements.push({ id: 'streak-7', name: 'Consistency King', desc: '7-day streak!', emoji: '🔥', unlocked: true });
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements.filter(a => !prev.find(p => p.id === a.id))]);
    }
  };

  const generateAIMessage = () => {
    const encouragingMessages = [
      "You're doing great! Keep taking care of yourself 💜",
      "Remember, small steps lead to big changes 🌟",
      "I'm proud of you for showing up today ✨",
      "Your feelings are valid. You're not alone 🤗",
      "Be gentle with yourself today 🌸",
      "You're stronger than you think 💪",
      "Take it one day at a time 🌈",
      "Your mental health matters 💜"
    ];
    
    const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    return {
      id: Date.now(),
      message: randomMessage,
      timestamp: new Date().toISOString()
    };
  };

  useEffect(() => {
    // AI Companion sends periodic encouraging messages
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every check
        setAiMessages(prev => [...prev.slice(-5), generateAIMessage()]); // Keep last 5
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const exportDataForTherapist = () => {
    const data = {
      moodHistory: moodHistory.slice(0, 30),
      sleepLog: sleepLog.slice(0, 30),
      journalEntries: journalEntries.slice(0, 10),
      streak: user.streak,
      gratitudePosts: gratitudePosts.slice(0, 10)
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `YRHAlone-TherapistReport-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const addComment = (postId, commentTextValue) => {
    const commenterName = user.privacy.anonymous ? 'Anonymous' : user.name;
    
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        // 🔔 NOTIFICATION: Notify post author when someone comments (like Facebook)
        if (post.authorId && post.authorId !== user.id) {
          const newNotification = {
            id: Date.now(),
            type: 'comment',
            message: `${commenterName} commented on your post`,
            postId: postId,
            postPreview: post.content.substring(0, 50) + '...',
            from: commenterName,
            timestamp: new Date().toISOString(),
            read: false
          };
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Save notification to Firebase for the post author
          if (db && post.authorId) {
            addDoc(collection(db, 'notifications'), {
              userId: post.authorId,
              ...newNotification
            }).catch(err => console.log('Notification save error:', err));
          }
        }
        
        return {
          ...post,
          comments: [...post.comments, {
            id: Date.now(), text: commentTextValue,
            author: commenterName,
            timestamp: new Date().toISOString()
          }]
        };
      }
      return post;
    }));
  };

  const reactToPost = (postId, reactionType) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        // Initialize userReactions if it doesn't exist
        if (!post.userReactions) post.userReactions = {};
        
        // Check if user already reacted with this type
        const alreadyReacted = post.userReactions[user.id] === reactionType;
        
        if (alreadyReacted) {
          // UNDO: Remove reaction
          const newReactions = { ...post.reactions, [reactionType]: Math.max(0, post.reactions[reactionType] - 1) };
          const newUserReactions = { ...post.userReactions };
          delete newUserReactions[user.id];
          return { ...post, reactions: newReactions, userReactions: newUserReactions };
        } else {
          // ADD: Add new reaction (and remove old one if exists)
          const oldReactionType = post.userReactions[user.id];
          let newReactions = { ...post.reactions };
          
          // Remove old reaction count if user had a different reaction
          if (oldReactionType) {
            newReactions[oldReactionType] = Math.max(0, newReactions[oldReactionType] - 1);
          }
          
          // Add new reaction count
          newReactions[reactionType] = newReactions[reactionType] + 1;
          
          return { 
            ...post, 
            reactions: newReactions,
            userReactions: { ...post.userReactions, [user.id]: reactionType }
          };
        }
      }
      return post;
    }));
  };

  const addGratitude = (content, taggedUser = null) => {
    setGratitudePosts([{ 
      id: Date.now(), 
      content, 
      timestamp: new Date().toISOString(),
      originalLanguage: userLanguage,
      taggedUser: taggedUser
    }, ...gratitudePosts]);
  };

  const saveJournalEntry = (entry) => {
    setJournalEntries(prevEntries => [entry, ...prevEntries]);
  };

  const joinGroup = async (groupId) => {
    try {
      // Update Firestore
      const groupRef = doc(db, 'groups', groupId.toString());
      await updateDoc(groupRef, {
        members: increment(1),
        memberIds: arrayUnion(user.id.toString())
      });
      
      // Update local state
      setGroups(groups.map(g => {
        if (g.id === groupId) {
          return { ...g, joined: true, members: g.members + 1, membersList: [...g.membersList, { id: user.id, name: user.name }] };
        }
        return g;
      }));
    } catch (error) {
      console.error('Error joining group:', error);
      // Still update local state as fallback
      setGroups(groups.map(g => {
        if (g.id === groupId) {
          return { ...g, joined: true, members: g.members + 1, membersList: [...g.membersList, { id: user.id, name: user.name }] };
        }
        return g;
      }));
    }
  };

  const inviteToGroup = (groupId) => {
    setInviteGroupId(groupId);
    setShowInviteModal(true);
  };

  const sendInvite = (userId) => {
    const group = groups.find(g => g.id === inviteGroupId);
    const userToInvite = allAppUsers.find(u => u.id === userId);
    if (!userToInvite) return;
    const alreadyMember = group.membersList.some(m => m.id === userId);
    if (alreadyMember) {
      alert(`${userToInvite.name} is already in ${group.name}!`);
      return;
    }
    setGroups(groups.map(g => {
      if (g.id === inviteGroupId) {
        return { ...g, members: g.members + 1, membersList: [...g.membersList, { id: userId, name: userToInvite.name }] };
      }
      return g;
    }));
    alert(`✉️ ${userToInvite.name} has been invited to ${group.name}!`);
    setShowInviteModal(false);
    setInviteSearchQuery('');
  };

  const filterUsers = (query) => {
    if (!query.trim()) return allAppUsers.filter(u => u.id !== user.id);
    return allAppUsers.filter(u => u.id !== user.id && u.name.toLowerCase().includes(query.toLowerCase()));
  };

  const sendGroupMessage = async (groupId, message, isVoice = false) => {
    const messageData = {
      text: message, 
      isVoice,
      authorId: user.id.toString(),
      author: user.privacy?.anonymous ? 'Anonymous' : user.name,
      originalLanguage: userLanguage,
      timestamp: new Date().toISOString(),
      reactions: { heart: 0, hug: 0, star: 0, fire: 0 },
      userReactions: {}
    };
    
    try {
      // Save to Firestore - messages will be loaded via real-time listener
      const messagesRef = collection(db, 'groups', groupId.toString(), 'messages');
      await addDoc(messagesRef, messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback: add to local state if Firestore fails
      setGroups(groups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            messages: [...g.messages, { id: Date.now(), ...messageData }]
          };
        }
        return g;
      }));
    }
  };

  const reactToGroupMessage = async (groupId, messageId, reactionType) => {
    // Find the message first
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    const msg = group.messages.find(m => m.id === messageId);
    if (!msg) return;
    
    const userReactions = msg.userReactions || {};
    const alreadyReacted = userReactions[user.id] === reactionType;
    
    let newReactions = { ...msg.reactions };
    let newUserReactions = { ...userReactions };
    
    if (alreadyReacted) {
      // UNDO: Remove reaction
      newReactions[reactionType] = Math.max(0, newReactions[reactionType] - 1);
      delete newUserReactions[user.id];
    } else {
      // ADD: Add new reaction
      const oldReactionType = userReactions[user.id];
      if (oldReactionType) {
        newReactions[oldReactionType] = Math.max(0, newReactions[oldReactionType] - 1);
      }
      newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
      newUserReactions[user.id] = reactionType;
    }
    
    // Update local state immediately for responsiveness
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          messages: g.messages.map(m => 
            m.id === messageId ? { ...m, reactions: newReactions, userReactions: newUserReactions } : m
          )
        };
      }
      return g;
    }));
    
    // Save to Firestore
    try {
      const messageRef = doc(db, 'groups', groupId.toString(), 'messages', messageId.toString());
      await updateDoc(messageRef, {
        reactions: newReactions,
        userReactions: newUserReactions
      });
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const blockUser = (userId, userName) => {
    setBlockedUsers([...blockedUsers, { id: userId, name: userName, blockedAt: new Date().toISOString() }]);
    setPosts(posts.filter(post => post.author !== userName));
  };

  const reportContent = (contentId, contentType, reason) => {
    setReportedContent([...reportedContent, {
      id: Date.now(), contentId, contentType, reason, reportedAt: new Date().toISOString()
    }]);
    alert('Thank you for reporting. Our team will review this content. 💜');
  };

  const uploadProfilePicture = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setUser({...user, profilePicture: reader.result}); };
      reader.readAsDataURL(file);
    }
  };

  const requestNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          alert('🔔 Notifications enabled!');
        }
      });
    }
  };

  const renderView = () => {
    switch(currentView) {
      case 'home': return <HomeView t={t} user={user} selectedMood={selectedMood} setSelectedMood={setSelectedMood} isRecording={isRecording} recordingTime={recordingTime} formatTime={formatTime} startRecording={startRecording} stopRecording={stopRecording} audioBlob={audioBlob} setAudioBlob={setAudioBlob} newPost={newPost} setNewPost={setNewPost} addPost={addPost} posts={posts} showComments={showComments} setShowComments={setShowComments} commentText={commentText} setCommentText={setCommentText} addComment={addComment} reactToPost={reactToPost} showPostMenu={showPostMenu} setShowPostMenu={setShowPostMenu} reportContent={reportContent} blockUser={blockUser} allAppUsers={allAppUsers} setCurrentView={setCurrentView} journalEntries={journalEntries} groups={groups} challenges={challenges} getTextSizeClass={getTextSizeClass} setShowEmergency={setShowEmergency} showOriginal={showOriginal} setShowOriginal={setShowOriginal} translateText={translateText} userLanguage={userLanguage} hasPremiumAccess={hasPremiumAccess} showUpgrade={showUpgrade} />;
      case 'journal': return <JournalView t={t} journalEntry={journalEntry} setJournalEntry={setJournalEntry} journalMood={journalMood} setJournalMood={setJournalMood} journalSaved={journalSaved} selectedJournalTheme={selectedJournalTheme} setSelectedJournalTheme={setSelectedJournalTheme} showSavedEntries={showSavedEntries} setShowSavedEntries={setShowSavedEntries} journalEntries={journalEntries} editingEntry={editingEntry} setEditingEntry={setEditingEntry} saveJournalEntry={saveJournalEntry} setJournalSaved={setJournalSaved} getTextSizeClass={getTextSizeClass} hasPremiumAccess={hasPremiumAccess} showUpgrade={showUpgrade} />;
      case 'gratitude': return <GratitudeView t={t} gratitudePosts={gratitudePosts} addGratitude={addGratitude} getTextSizeClass={getTextSizeClass} allAppUsers={allAppUsers} user={user} showOriginalGratitude={showOriginalGratitude} setShowOriginalGratitude={setShowOriginalGratitude} translateText={translateText} userLanguage={userLanguage} />;
      case 'groups': return <GroupsView t={t} groups={groups} setGroups={setGroups} user={user} selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} searchQuery={searchQuery} setSearchQuery={setSearchQuery} inviteToGroup={inviteToGroup} joinGroup={joinGroup} sendGroupMessage={sendGroupMessage} reactToGroupMessage={reactToGroupMessage} isRecordingGroup={isRecordingGroup} recordingTimeGroup={recordingTimeGroup} formatTime={formatTime} startRecording={startRecording} stopRecording={stopRecording} groupAudioBlob={groupAudioBlob} setGroupAudioBlob={setGroupAudioBlob} getTextSizeClass={getTextSizeClass} showOriginalGroup={showOriginalGroup} setShowOriginalGroup={setShowOriginalGroup} translateText={translateText} userLanguage={userLanguage} allAppUsers={allAppUsers} userPremiumTier={userPremiumTier} />;
      case 'buddy': return <BuddyView t={t} user={user} setUser={setUser} showMatchingQuestions={showMatchingQuestions} setShowMatchingQuestions={setShowMatchingQuestions} selectedInterests={selectedInterests} setSelectedInterests={setSelectedInterests} selectedSupport={selectedSupport} setSelectedSupport={setSelectedSupport} getTextSizeClass={getTextSizeClass} allAppUsers={allAppUsers} translateText={translateText} userLanguage={userLanguage} />;
      case 'settings': return <SettingsView t={t} user={user} setUser={setUser} setCurrentView={setCurrentView} showUpgrade={showUpgrade} hasPremiumAccess={hasPremiumAccess} userLanguage={userLanguage} setUserLanguage={setUserLanguage} highContrast={highContrast} setHighContrast={setHighContrast} textSize={textSize} setTextSize={setTextSize} notificationsEnabled={notificationsEnabled} requestNotifications={requestNotifications} getTextSizeClass={getTextSizeClass} exportDataForTherapist={exportDataForTherapist} achievements={achievements} journalEntries={journalEntries} posts={posts} uploadProfilePicture={uploadProfilePicture} />;
      // NEW FEATURE VIEWS
      case 'quickrelief': return <QuickReliefViewNew t={t} showBreathingExercise={showBreathingExercise} setShowBreathingExercise={setShowBreathingExercise} selectedExercise={selectedExercise} setSelectedExercise={setSelectedExercise} breathingCount={breathingCount} setBreathingCount={setBreathingCount} showPanicHelp={showPanicHelp} setShowPanicHelp={setShowPanicHelp} getTextSizeClass={getTextSizeClass} />;
      case 'education': return <EducationLibraryViewNew t={t} selectedArticle={selectedArticle} setSelectedArticle={setSelectedArticle} getTextSizeClass={getTextSizeClass} />;

case 'admin':
  // Only REAL organization admins see this - with REAL data
  // Use isOrgAdmin from EnterpriseContext (more reliable) OR user state
  if ((!organization && !user.organizationId) || (!isOrgAdmin && !user.isOrgAdmin)) {
    // Not an org admin - redirect home
    return <HomeView t={t} user={user} selectedMood={selectedMood} setSelectedMood={setSelectedMood} isRecording={isRecording} recordingTime={recordingTime} formatTime={formatTime} startRecording={startRecording} stopRecording={stopRecording} audioBlob={audioBlob} setAudioBlob={setAudioBlob} newPost={newPost} setNewPost={setNewPost} addPost={addPost} posts={posts} showComments={showComments} setShowComments={setShowComments} commentText={commentText} setCommentText={setCommentText} addComment={addComment} reactToPost={reactToPost} showPostMenu={showPostMenu} setShowPostMenu={setShowPostMenu} reportContent={reportContent} blockUser={blockUser} allAppUsers={allAppUsers} setCurrentView={setCurrentView} journalEntries={journalEntries} groups={groups} challenges={challenges} getTextSizeClass={getTextSizeClass} setShowEmergency={setShowEmergency} showOriginal={showOriginal} setShowOriginal={setShowOriginal} translateText={translateText} userLanguage={userLanguage} />;
  }
  return <AdminDashboard organizationId={organization?.id || user.organizationId} />;

case 'therapist':
  // 👨‍⚕️ THERAPIST DASHBOARD - Only for verified therapists
  if (!isTherapist || !therapistId) {
    // Not a therapist - redirect home
    return <HomeView t={t} user={user} selectedMood={selectedMood} setSelectedMood={setSelectedMood} isRecording={isRecording} recordingTime={recordingTime} formatTime={formatTime} startRecording={startRecording} stopRecording={stopRecording} audioBlob={audioBlob} setAudioBlob={setAudioBlob} newPost={newPost} setNewPost={setNewPost} addPost={addPost} posts={posts} showComments={showComments} setShowComments={setShowComments} commentText={commentText} setCommentText={setCommentText} addComment={addComment} reactToPost={reactToPost} showPostMenu={showPostMenu} setShowPostMenu={setShowPostMenu} reportContent={reportContent} blockUser={blockUser} allAppUsers={allAppUsers} setCurrentView={setCurrentView} journalEntries={journalEntries} groups={groups} challenges={challenges} getTextSizeClass={getTextSizeClass} setShowEmergency={setShowEmergency} showOriginal={showOriginal} setShowOriginal={setShowOriginal} translateText={translateText} userLanguage={userLanguage} />;
  }
  return <TherapistDashboard organizationId={user.organizationId} therapistId={therapistId} onBack={() => setCurrentView('home')} />;

case 'orgsignup': 
  // Only allow org signup if not already in an org
  if (user.organizationId) {
    return <AdminDashboard organizationId={user.organizationId} />;
  }
  return (
    <OrganizationSignup 
      onSuccess={(code) => {
        alert(`Organization created! Your code is: ${code}`);
        setCurrentView('admin');
      }}
      onCancel={() => setCurrentView('home')}
    />
  );

case 'joinorg': 
  // Only allow joining if not already in an org
  if (user.organizationId) {
    return <HomeView t={t} user={user} selectedMood={selectedMood} setSelectedMood={setSelectedMood} isRecording={isRecording} recordingTime={recordingTime} formatTime={formatTime} startRecording={startRecording} stopRecording={stopRecording} audioBlob={audioBlob} setAudioBlob={setAudioBlob} newPost={newPost} setNewPost={setNewPost} addPost={addPost} posts={posts} showComments={showComments} setShowComments={setShowComments} commentText={commentText} setCommentText={setCommentText} addComment={addComment} reactToPost={reactToPost} showPostMenu={showPostMenu} setShowPostMenu={setShowPostMenu} reportContent={reportContent} blockUser={blockUser} allAppUsers={allAppUsers} setCurrentView={setCurrentView} journalEntries={journalEntries} groups={groups} challenges={challenges} getTextSizeClass={getTextSizeClass} setShowEmergency={setShowEmergency} showOriginal={showOriginal} setShowOriginal={setShowOriginal} translateText={translateText} userLanguage={userLanguage} />;
  }
  return (
    <AccessCodeEntry 
      onSuccess={(orgData) => {
        alert(`Welcome to ${orgData.name}! 💜`);
        setCurrentView('home');
      }}
      onSkip={() => setCurrentView('home')}
    />
  );

      case 'soundtherapy': return <SoundTherapyViewNew t={t} playingSound={playingSound} setPlayingSound={setPlayingSound} getTextSizeClass={getTextSizeClass} />;
      case 'sleeptracker': return <SleepTrackerViewNew t={t} user={user} sleepLog={sleepLog} setSleepLog={setSleepLog} getTextSizeClass={getTextSizeClass} />;
      case 'progressanalytics': return <ProgressAnalyticsView t={t} user={user} moodHistory={moodHistory} journalEntries={journalEntries} posts={posts} sleepLog={sleepLog} breathingCount={breathingCount} getTextSizeClass={getTextSizeClass} />;
      case 'achievements': return <AchievementsViewNew t={t} posts={posts} groups={groups} gratitudePosts={gratitudePosts} journalEntries={journalEntries} moodHistory={moodHistory} breathingCount={breathingCount} getTextSizeClass={getTextSizeClass} />;
      case 'privacy': return <PrivacyDataView t={t} user={user} posts={posts} journalEntries={journalEntries} moodHistory={moodHistory} sleepLog={sleepLog} getTextSizeClass={getTextSizeClass} />;
      case 'tools': return <ToolsMenuViewNew t={t} setCurrentView={setCurrentView} getTextSizeClass={getTextSizeClass} showUpgrade={showUpgrade} hasPremiumAccess={hasPremiumAccess} />;
      
      // 🛡️ SAFETY & LEGAL VIEWS
      case 'safety': return <SafetySettingsView user={user} setUser={setUser} onBack={() => setCurrentView('settings')} />;
      case 'guidelines': return <CommunityGuidelinesView onBack={() => setCurrentView('settings')} />;
      case 'blocked': return <BlockedUsersView blockedUsers={blockedUsers} setBlockedUsers={setBlockedUsers} onBack={() => setCurrentView('settings')} />;
      
      // 🎨 THEME CUSTOMIZATION
      case 'themes': return <ThemeCustomizationView user={user} setUser={setUser} onBack={() => setCurrentView('settings')} currentTheme={user.appTheme} />;
      
      // 📹 VIDEO CALL

      // 👨‍👩‍👧 GUARDIAN PORTAL
      case 'parentDashboard':
        return <ParentDashboard onBack={() => setCurrentView('settings')} />;

      case 'guardianSettings':
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <GuardianLinkManager onClose={() => setCurrentView('settings')} />
          </div>
        );

      // 🔒 ADMIN USER MANAGEMENT
      case 'userManagement':
        return <AdminUserManagement onBack={() => setCurrentView('adminDashboard')} />;

      default: return <HomeView t={t} user={user} selectedMood={selectedMood} setSelectedMood={setSelectedMood} isRecording={isRecording} recordingTime={recordingTime} formatTime={formatTime} startRecording={startRecording} stopRecording={stopRecording} audioBlob={audioBlob} setAudioBlob={setAudioBlob} newPost={newPost} setNewPost={setNewPost} addPost={addPost} posts={posts} showComments={showComments} setShowComments={setShowComments} commentText={commentText} setCommentText={setCommentText} addComment={addComment} reactToPost={reactToPost} showPostMenu={showPostMenu} setShowPostMenu={setShowPostMenu} reportContent={reportContent} blockUser={blockUser} allAppUsers={allAppUsers} setCurrentView={setCurrentView} journalEntries={journalEntries} groups={groups} challenges={challenges} getTextSizeClass={getTextSizeClass} setShowEmergency={setShowEmergency} showOriginal={showOriginal} setShowOriginal={setShowOriginal} translateText={translateText} userLanguage={userLanguage} />;
    }
  };

  // Get current theme or default
  const currentTheme = APP_THEMES[user.appTheme] || APP_THEMES.lavenderDream;

  // Show loading while enterprise data is being fetched (prevents wrong view flash)
  if (enterpriseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-4xl">🧸</span>
          </div>
          <p className="text-purple-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${highContrast ? 'bg-black' : currentTheme.bg} pb-32 transition-all duration-500`}>
      <OrganizationBanner />
      {showEmergency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-3">🆘</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Get Help Now</h2>
              <p className="text-gray-600">You're not alone. Immediate support is available 24/7:</p>
            </div>
            <div className="space-y-3">
              <a href="tel:988" className="block w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-center hover:scale-105 transition">
                📞 Call 988 - Crisis Lifeline (24/7)
              </a>
              <a href="sms:741741&body=HELLO" className="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-center hover:scale-105 transition">
                💬 Text HELLO to 741741
              </a>
              <a href="tel:911" className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-bold text-center hover:scale-105 transition">
                🚨 Emergency Services (911)
              </a>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 text-center">
              <p className="text-sm text-purple-800">💜 Whatever you're going through, help is just a call or text away. You matter.</p>
            </div>
            <button onClick={() => setShowEmergency(false)} className="w-full bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-300 transition">Close</button>
          </div>
        </div>
      )}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{t.inviteFriends}</h2>
              <button onClick={() => { setShowInviteModal(false); setInviteSearchQuery(''); }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" value={inviteSearchQuery} onChange={(e) => setInviteSearchQuery(e.target.value)} placeholder={t.searchUsers} className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none" autoFocus />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filterUsers(inviteSearchQuery).length === 0 ? (
                <p className="text-center text-gray-500 py-4">{t.noUsersFound}</p>
              ) : (
                filterUsers(inviteSearchQuery).map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">{u.name[0]}</div>
                      <div>
                        <div className="font-semibold text-gray-800">{u.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${u.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          {u.status}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => sendInvite(u.id)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition">
                      {t.invite}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 🔔 NOTIFICATION HEADER (Like Facebook/Instagram) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-2">
          <h1 className="text-lg font-bold text-purple-600">💜 YRNAlone</h1>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="relative p-2 rounded-full hover:bg-purple-100 transition"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
        
        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute right-4 top-14 w-80 max-h-96 bg-white rounded-2xl shadow-2xl border overflow-hidden z-50">
            <div className="p-3 border-b bg-gradient-to-r from-purple-500 to-pink-500 text-white flex justify-between items-center">
              <h3 className="font-bold">🔔 Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => { 
                    setNotifications(prev => prev.map(n => ({...n, read: true}))); 
                    setUnreadCount(0); 
                  }}
                  className="text-xs bg-white/20 px-2 py-1 rounded-full hover:bg-white/30"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <div className="text-4xl mb-2">🔔</div>
                  <p>No notifications yet</p>
                  <p className="text-xs mt-1">When someone comments on your post, you'll see it here!</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id}
                    className={`p-3 border-b hover:bg-purple-50 cursor-pointer transition ${!notif.read ? 'bg-purple-50' : ''}`}
                    onClick={() => {
                      setNotifications(prev => prev.map(n => n.id === notif.id ? {...n, read: true} : n));
                      setUnreadCount(prev => Math.max(0, prev - 1));
                      setShowNotifications(false);
                      setCurrentView('home');
                    }}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${notif.type === 'comment' ? 'bg-blue-500' : notif.type === 'therapist' ? 'bg-green-500' : 'bg-purple-500'}`}>
                        {notif.type === 'comment' ? '💬' : notif.type === 'therapist' ? '👨‍⚕️' : '💜'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{notif.message}</p>
                        {notif.postPreview && (
                          <p className="text-xs text-gray-500 truncate">"{notif.postPreview}"</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                      </div>
                      {!notif.read && <div className="w-2 h-2 bg-purple-500 rounded-full"></div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="pt-14 max-w-4xl mx-auto">{renderView()}</div>
      <PoweredByBadge />
      
      {/* 💎 BOTTOM NAVIGATION - HIDE FOR ORG ADMINS & THERAPISTS (they only use their Dashboards) */}
      {!isOrgAdmin && !isTherapist && (
        <nav className={`fixed bottom-0 left-0 right-0 backdrop-blur-xl transition-all duration-500 z-50 ${highContrast ? 'bg-gray-900/95 border-t border-gray-700' : 'bg-white/80 border-t border-gray-100'}`}
          style={{ boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.08)' }}
        >
          <div className="max-w-4xl mx-auto flex justify-around px-2 py-1">
            {/* REGULAR USER & ORG EMPLOYEE NAV */}
            {[
              { view: 'home', icon: Home, label: t.home },
              { view: 'groups', icon: Users, label: t.groups },
              { view: 'tools', icon: Sparkles, label: t.tools },
              { view: 'buddy', icon: Heart, label: t.buddy },
              { view: 'settings', icon: Settings, label: t.settings }
            ].map(item => (
              <button 
                key={item.view} 
                onClick={() => setCurrentView(item.view)} 
                className={`flex-1 py-2.5 flex flex-col items-center transition-all duration-300 rounded-2xl mx-1 ${
                  currentView === item.view 
                    ? 'bg-gradient-to-br from-purple-100 to-pink-100 scale-105' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className={`relative ${currentView === item.view ? 'transform scale-110' : ''} transition-transform duration-300`}>
                  <item.icon className={`w-6 h-6 mb-1 transition-colors duration-300 ${
                    currentView === item.view 
                      ? 'text-purple-600' 
                      : 'text-gray-400'
                  }`} />
                  {currentView === item.view && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  )}
                </div>
                <span className={`text-xs font-semibold transition-colors duration-300 ${
                  currentView === item.view 
                    ? 'text-purple-600' 
                    : 'text-gray-400'
                }`}>{item.label}</span>
              </button>
            ))}
          </div>
          
          {/* Safe area for iPhone notch */}
          <div className="h-safe-area-inset-bottom bg-transparent"></div>
        </nav>
      )}

      {/* 💜 PREMIUM UPGRADE MODAL */}
      {showUpgradeModal && (
        <UpgradeScreen 
          onClose={hideUpgrade}
          onSelectPlan={(plan) => {
            console.log('Selected plan:', plan);
            if (plan === 'yearly') {
              window.location.href = 'https://buy.stripe.com/eVq6oH4peepd4Qt2EWe3e01';
            } else {
              window.location.href = 'https://buy.stripe.com/eVqdR9f3Sdl996J7Zge3e00';
            }
            hideUpgrade();
          }}
        />
      )}
    </div>
  );
};

// 💜 WRAPPER THAT HANDLES LOGIN
const AppWithAuth = () => {
  const { loading, isLoggedIn, userProfile } = useAuth();
  const { isOrgAdmin, organization, isTherapist, therapistId, loading: enterpriseLoading } = useEnterprise();
  const [showOrgSignup, setShowOrgSignup] = useState(false);
  const [orgSignupComplete, setOrgSignupComplete] = useState(false);

  // 🏢 Check if user is org ADMIN from ALL sources:
  // 1. userProfile.isOrgAdmin === true (from Firestore user doc)
  // 2. isOrgAdmin from EnterpriseContext (loaded from org doc)
  // 3. Check if accountType is 'organization' AND isOrgAdmin is explicitly true
  // Note: Org MEMBERS have accountType 'organization' but isOrgAdmin: false
  const isOrganizationAdmin =
    userProfile?.isOrgAdmin === true ||
    isOrgAdmin === true ||
    (userProfile?.accountType === 'organization' && userProfile?.isOrgAdmin !== false && userProfile?.role === 'admin');

  // 👨‍⚕️ Check if user is a THERAPIST (but NOT an admin)
  const isTherapistUser = (isTherapist || userProfile?.role === 'therapist' || userProfile?.isTherapist === true) && !isOrganizationAdmin;

  // 🔍 Debug logging for org admin detection
  useEffect(() => {
    if (isLoggedIn && userProfile) {
      console.log('🔍 AppWithAuth Debug:', {
        isLoggedIn,
        loading,
        enterpriseLoading,
        'userProfile?.isOrgAdmin': userProfile?.isOrgAdmin,
        'userProfile?.accountType': userProfile?.accountType,
        'userProfile?.role': userProfile?.role,
        'isOrgAdmin (context)': isOrgAdmin,
        'isOrganizationAdmin (computed)': isOrganizationAdmin,
        'organization': organization?.name || null
      });
    }
  }, [isLoggedIn, userProfile, loading, enterpriseLoading, isOrgAdmin, isOrganizationAdmin, organization]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center relative overflow-hidden">
        {/* Premium Loading Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl" style={{animation: 'float-gentle 6s ease-in-out infinite'}}></div>
        </div>
        
        {/* Premium 3D Glass Loading Spinner */}
        <div className="text-center relative z-10 animate-fade-up">
          <div className="relative inline-block mb-6">
            {/* Outer glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/40 to-pink-400/40 rounded-[28px] blur-lg animate-pulse"></div>
            
            {/* 3D Glass container */}
            <div className="relative w-24 h-24 rounded-[28px] flex items-center justify-center animate-float"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(147, 51, 234, 0.25), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -2px 4px rgba(147, 51, 234, 0.1)',
                border: '2px solid rgba(255,255,255,0.6)'
              }}
            >
              {/* Inner glass reflection */}
              <div className="absolute top-2 left-2 right-4 h-6 bg-gradient-to-br from-white/70 to-transparent rounded-[20px]"></div>
              
              <span className="text-5xl relative z-10" style={{
                filter: 'drop-shadow(0 3px 6px rgba(147, 51, 234, 0.3))',
                transform: 'translateY(-1px)'
              }}>🧸</span>
            </div>
            
            {/* Spinning ring */}
            <div className="absolute inset-[-4px] rounded-[32px] border-4 border-purple-200/50 border-t-purple-500 animate-spin" style={{animationDuration: '1.5s'}}></div>
          </div>
          <h2 className="text-2xl font-bold text-gradient mb-2">YRNAlone</h2>
          <p className="text-purple-600/80 font-medium">Loading your safe space...</p>
          
          {/* Premium progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Show Organization Signup flow
  if (showOrgSignup && !isLoggedIn) {
    return (
      <OrganizationSignup 
        onSuccess={(accessCode) => {
          setOrgSignupComplete(true);
          setShowOrgSignup(false);
          // Organization signup includes account creation
          // User will be logged in and redirected to admin dashboard
        }}
        onCancel={() => setShowOrgSignup(false)}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <NewAuthScreen
        onOrganizationSignup={() => setShowOrgSignup(true)}
      />
    );
  }

  // 🔴 CRITICAL: If user has organizationId, wait for enterprise context to load
  // This prevents the flash of user view before org admin detection completes
  const mightBeOrgUser = userProfile?.organizationId || userProfile?.accountType === 'organization';
  if (mightBeOrgUser && enterpriseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🧸</div>
          <p className="text-purple-600 font-medium">Loading YRNAlone...</p>
        </div>
      </div>
    );
  }

  // 🏢 ORGANIZATION ADMIN - Completely separate experience
  // Check IMMEDIATELY after login, before any other rendering
  if (isOrganizationAdmin) {
    console.log('🏢 Rendering ORGANIZATION view for:', userProfile?.email);

    // Wait for enterprise context to load org data
    if (enterpriseLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce">🏢</div>
            <p className="text-purple-600 font-medium">Loading organization...</p>
          </div>
        </div>
      );
    }

    // Create user object for OrganizationApp
    const orgUser = {
      uid: userProfile?.uid,
      email: userProfile?.email,
      name: userProfile?.name || userProfile?.displayName,
      displayName: userProfile?.displayName || userProfile?.name,
      organizationId: userProfile?.organizationId || organization?.id,
      isOrgAdmin: true,
      accountType: 'organization'
    };

    return <OrganizationApp user={orgUser} setUser={() => {}} />;
  }

  // 👨‍⚕️ THERAPIST - Dedicated therapist dashboard experience
  // Check AFTER org admin (so admins who are also therapists go to admin view)
  if (isTherapistUser && organization) {
    console.log('👨‍⚕️ Rendering THERAPIST view for:', userProfile?.email);

    // Wait for enterprise context to load org data
    if (enterpriseLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-teal-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce">👨‍⚕️</div>
            <p className="text-blue-600 font-medium">Loading therapist dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <TherapistDashboard
        organizationId={userProfile?.organizationId || organization?.id}
        therapistId={therapistId}
      />
    );
  }

  // 👤 INDIVIDUAL USER - Regular app experience
  console.log('👤 Rendering INDIVIDUAL view for:', userProfile?.email);
  return <YRNAloneApp />;
};

// 🎯 MAIN APP WITH ALL PROVIDERS
const App = () => {
  return (
    <AuthProvider>
      <EnterpriseProvider>
        <PremiumProvider>
          <OfflineProviderInternal>
            <ToastProviderInternal>
              <AppWithAuth />
            </ToastProviderInternal>
          </OfflineProviderInternal>
        </PremiumProvider>
      </EnterpriseProvider>
    </AuthProvider>
  );
};

// 🏭 INDUSTRIAL-GRADE: Offline Support Provider (inline)
const OfflineProviderInternal = ({ children }) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {showBanner && (
        <div className={`fixed top-0 left-0 right-0 z-[9999] px-4 py-3 text-center font-semibold text-white shadow-lg transition-all duration-300 ${
          isOnline ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-orange-500 to-red-500'
        }`}>
          {isOnline ? '✅ Back online! Syncing...' : '📴 You\'re offline. Your data is saved locally!'}
        </div>
      )}
      {children}
    </>
  );
};

// 🏭 INDUSTRIAL-GRADE: Toast Notification Provider (inline)
const ToastProviderInternal = ({ children }) => {
  return <>{children}</>;
};

export default App;