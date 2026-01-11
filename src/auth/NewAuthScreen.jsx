// FILE: src/auth/NewAuthScreen.jsx
// 🎯 TASK 1: Simplified 2-Button Login with Side-by-Side Forms
// Built with love by Jess & Claudia 🧸💜

import React, { useState } from 'react';
import {
  Heart, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Building2,
  UserCircle, Shield, KeyRound, CheckCircle, ChevronDown, Users
} from 'lucide-react';
import { auth, db } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, collection, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';

// Organization types for dropdown
const ORG_TYPES = [
  { value: 'clinic', label: 'Mental Health Clinic' },
  { value: 'hospital', label: 'Hospital / Healthcare System' },
  { value: 'school', label: 'School / University' },
  { value: 'company', label: 'Company / Workplace' },
  { value: 'nonprofit', label: 'Non-Profit Organization' }
];

const NewAuthScreen = ({ onSuccess, onOrganizationSignup }) => {
  // Main view: 'main' | 'individual' | 'organization' | 'forgot' | 'joinWithCode'
  const [view, setView] = useState('main');

  // Individual form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Organization form state
  const [orgLoginEmail, setOrgLoginEmail] = useState('');
  const [orgLoginPassword, setOrgLoginPassword] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState('clinic');
  const [newOrgAdminName, setNewOrgAdminName] = useState('');
  const [newOrgAdminEmail, setNewOrgAdminEmail] = useState('');
  const [newOrgPassword, setNewOrgPassword] = useState('');

  // 🎯 BUG 3: Join with Access Code state
  const [accessCode, setAccessCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [showJoinPwd, setShowJoinPwd] = useState(false);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // UI state
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [showSignupPwd, setShowSignupPwd] = useState(false);
  const [showOrgLoginPwd, setShowOrgLoginPwd] = useState(false);
  const [showOrgRegPwd, setShowOrgRegPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Individual Sign In
  const handleIndividualSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      onSuccess?.();
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('No account found with this email');
      else if (err.code === 'auth/wrong-password') setError('Incorrect password');
      else if (err.code === 'auth/invalid-email') setError('Invalid email address');
      else setError(err.message || 'Sign in failed');
    }
    setLoading(false);
  };

  // Handle Individual Sign Up - TASK 2: Save displayName to Firebase
  const handleIndividualSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (!signupName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const user = userCredential.user;

      // Update Firebase Auth displayName
      await updateProfile(user, { displayName: signupName });

      // Create Firestore user profile with displayName (TASK 2)
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: signupEmail,
        displayName: signupName,  // 🎯 TASK 2: Save displayName
        name: signupName,
        createdAt: serverTimestamp(),
        isPremium: false,
        isOrgAdmin: false,
        organizationId: null,
        language: 'en',
        settings: {
          notifications: true,
          highContrast: false,
          textSize: 'medium'
        },
        stats: {
          postsCreated: 0,
          journalEntries: 0,
          supportGiven: 0,
          daysActive: 0
        },
        achievements: [],
        streak: 0,
        lastActive: serverTimestamp()
      });

      onSuccess?.();
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists');
      else if (err.code === 'auth/invalid-email') setError('Invalid email address');
      else if (err.code === 'auth/weak-password') setError('Password is too weak');
      else setError(err.message || 'Sign up failed');
    }
    setLoading(false);
  };

  // Handle Organization Admin Sign In
  // 🎯 BUG 1 FIX: Check if user is org admin and set redirect flag
  const handleOrgSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, orgLoginEmail, orgLoginPassword);

      // 🎯 BUG 1 FIX: Check if user is an org admin and set redirect flag
      try {
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        const userData = userDoc.data();

        if (userData?.isOrgAdmin && userData?.organizationId) {
          // Set flag for redirect to admin dashboard
          sessionStorage.setItem('pendingAdminRedirect', 'true');
          console.log('🏢 Org admin logged in, setting redirect flag');
        }
      } catch (checkErr) {
        console.log('Could not check admin status:', checkErr);
      }

      onSuccess?.();
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('No admin account found');
      else if (err.code === 'auth/wrong-password') setError('Incorrect password');
      else setError(err.message || 'Sign in failed');
    }
    setLoading(false);
  };

  // Handle Organization Registration
  const handleOrgRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!newOrgName.trim() || !newOrgAdminName.trim() || !newOrgAdminEmail.trim() || !newOrgPassword) {
      setError('Please fill in all required fields');
      return;
    }
    if (newOrgPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Create admin user
      const userCredential = await createUserWithEmailAndPassword(auth, newOrgAdminEmail, newOrgPassword);
      const user = userCredential.user;

      await updateProfile(user, { displayName: newOrgAdminName });

      // Generate access code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let accessCode = '';
      for (let i = 0; i < 8; i++) {
        accessCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const orgId = `org_${Date.now()}`;

      // Create organization
      await setDoc(doc(db, 'organizations', orgId), {
        id: orgId,
        name: newOrgName,
        type: newOrgType,
        accessCode,
        adminId: user.uid,
        adminIds: [user.uid],
        contactName: newOrgAdminName,
        contactEmail: newOrgAdminEmail,
        createdAt: serverTimestamp(),
        memberCount: 1,
        isActive: true,
        paymentStatus: 'trial',
        primaryColor: '#7C3AED',
        subscription: {
          plan: 'starter',
          planName: 'Starter',
          price: 299,
          maxMembers: 50,
          startDate: serverTimestamp(),
          trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'trialing'
        }
      });

      // Create admin user profile
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: newOrgAdminEmail,
        displayName: newOrgAdminName,
        name: newOrgAdminName,
        organizationId: orgId,
        isOrgAdmin: true,
        isPremium: true,
        createdAt: serverTimestamp(),
        language: 'en'
      });

      // 🎯 BUG 1 FIX: Set redirect flag for new org admin
      sessionStorage.setItem('pendingAdminRedirect', 'true');
      console.log('🏢 New org admin registered, setting redirect flag');

      onSuccess?.();
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists');
      else setError(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setForgotSuccess('');

    if (!forgotEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotSuccess('Password reset email sent! Check your inbox.');
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('No account found with this email');
      else setError(err.message || 'Failed to send reset email');
    }
    setLoading(false);
  };

  // 🎯 BUG 3 FIX: Handle Join Organization with Access Code
  const handleJoinWithAccessCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!accessCode.trim()) {
      setError('Please enter an access code');
      return;
    }
    if (!joinName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!joinEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (joinPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Find organization by access code
      const orgsRef = collection(db, 'organizations');
      const orgQuery = query(orgsRef, where('accessCode', '==', accessCode.trim().toUpperCase()));
      const orgSnap = await getDocs(orgQuery);

      if (orgSnap.empty) {
        setError('Invalid access code. Please check and try again.');
        setLoading(false);
        return;
      }

      const orgDoc = orgSnap.docs[0];
      const orgData = orgDoc.data();
      const orgId = orgDoc.id;

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, joinEmail, joinPassword);
      const user = userCredential.user;

      await updateProfile(user, { displayName: joinName });

      // Create user profile linked to organization (as member, not admin)
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: joinEmail,
        displayName: joinName,
        name: joinName,
        organizationId: orgId,
        isOrgAdmin: false,
        isOrgMember: true,
        isPremium: true, // Org members get premium access
        createdAt: serverTimestamp(),
        language: 'en',
        joinedViaAccessCode: true,
        settings: {
          notifications: true,
          highContrast: false,
          textSize: 'medium'
        },
        stats: {
          postsCreated: 0,
          journalEntries: 0,
          supportGiven: 0,
          daysActive: 0
        }
      });

      // Update organization member count
      await updateDoc(doc(db, 'organizations', orgId), {
        memberCount: (orgData.memberCount || 1) + 1
      });

      console.log(`✅ User joined ${orgData.name} via access code`);
      onSuccess?.();
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists');
      else if (err.code === 'auth/invalid-email') setError('Invalid email address');
      else if (err.code === 'auth/weak-password') setError('Password is too weak');
      else setError(err.message || 'Failed to join organization');
    }
    setLoading(false);
  };

  // ============================================
  // 🏠 MAIN SCREEN - 2 Buttons Side by Side
  // ============================================
  if (view === 'main') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-10">
            <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl">
              <span className="text-6xl">🧸</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              YRNAlone
            </h1>
            <p className="text-gray-600 mt-3 text-lg">You aRe Not Alone 💜</p>
          </div>

          {/* 2 Buttons Side by Side */}
          <div className="flex gap-4">
            {/* Join as Individual */}
            <button
              onClick={() => setView('individual')}
              className="flex-1 p-6 bg-white/90 backdrop-blur-sm border-2 border-purple-200 rounded-3xl hover:border-purple-400 hover:shadow-xl hover:scale-105 transition-all duration-300 text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">👤 Join as</h3>
              <h3 className="text-lg font-bold text-gray-800">Individual</h3>
              <p className="text-gray-500 text-xs mt-2">Personal support</p>
            </button>

            {/* Organization Portal */}
            <button
              onClick={() => setView('organization')}
              className="flex-1 p-6 bg-white/90 backdrop-blur-sm border-2 border-blue-200 rounded-3xl hover:border-blue-400 hover:shadow-xl hover:scale-105 transition-all duration-300 text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">🏢 Organization</h3>
              <h3 className="text-lg font-bold text-gray-800">Portal</h3>
              <p className="text-gray-500 text-xs mt-2">Clinics & Companies</p>
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p className="flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              HIPAA Compliant • 24/7 Crisis Support
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // 👤 INDIVIDUAL - Side by Side Sign In / Sign Up
  // ============================================
  if (view === 'individual') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Back Button & Header */}
          <div className="text-center mb-6">
            <button
              onClick={() => { setView('main'); setError(''); }}
              className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 text-purple-600 font-medium hover:underline"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <UserCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">👤 Join as Individual</h1>
          </div>

          {/* Side by Side Forms */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* SIGN IN Column */}
            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-center text-gray-800 mb-6 pb-3 border-b">SIGN IN</h2>

              <form onSubmit={handleIndividualSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showLoginPwd ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPwd(!showLoginPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showLoginPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>🔑 Sign In</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setView('forgot'); setForgotEmail(loginEmail); }}
                  className="w-full text-purple-600 text-sm hover:underline"
                >
                  Forgot password?
                </button>
              </form>
            </div>

            {/* SIGN UP Column */}
            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-center text-gray-800 mb-6 pb-3 border-b">SIGN UP</h2>

              <form onSubmit={handleIndividualSignUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showSignupPwd ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPwd(!showSignupPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showSignupPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>✨ Create Account</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // 🏢 ORGANIZATION - Side by Side Admin Login / Register
  // ============================================
  if (view === 'organization') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          {/* Back Button & Header */}
          <div className="text-center mb-6">
            <button
              onClick={() => { setView('main'); setError(''); }}
              className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 text-blue-600 font-medium hover:underline"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">🏢 Organization Portal</h1>
          </div>

          {/* Side by Side Forms */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ADMIN SIGN IN Column */}
            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-center text-gray-800 mb-6 pb-3 border-b">ADMIN SIGN IN</h2>

              <form onSubmit={handleOrgSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={orgLoginEmail}
                      onChange={(e) => setOrgLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                      placeholder="admin@organization.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showOrgLoginPwd ? 'text' : 'password'}
                      value={orgLoginPassword}
                      onChange={(e) => setOrgLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOrgLoginPwd(!showOrgLoginPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showOrgLoginPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>🔑 Sign In</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setView('forgot'); setForgotEmail(orgLoginEmail); }}
                  className="w-full text-blue-600 text-sm hover:underline"
                >
                  Forgot password?
                </button>
              </form>

              {/* Enterprise Badges */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3" /> HIPAA
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  256-bit SSL
                </span>
              </div>
            </div>

            {/* REGISTER NEW ORG Column */}
            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-center text-gray-800 mb-6 pb-3 border-b">REGISTER NEW ORG</h2>

              <form onSubmit={handleOrgRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                      placeholder="Your Organization Name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type</label>
                  <div className="relative">
                    <select
                      value={newOrgType}
                      onChange={(e) => setNewOrgType(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none appearance-none bg-white"
                    >
                      {ORG_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={newOrgAdminName}
                      onChange={(e) => setNewOrgAdminName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={newOrgAdminEmail}
                      onChange={(e) => setNewOrgAdminEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                      placeholder="admin@organization.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showOrgRegPwd ? 'text' : 'password'}
                      value={newOrgPassword}
                      onChange={(e) => setNewOrgPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOrgRegPwd(!showOrgRegPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showOrgRegPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>🏢 Register Org</>
                  )}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-gray-500">
                14-day free trial • No credit card required
              </p>
            </div>
          </div>

          {/* 🎯 BUG 3 FIX: Join with Access Code Button */}
          <div className="mt-6">
            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-gray-300 flex-1"></div>
              <span className="px-4 text-gray-500 text-sm">or</span>
              <div className="border-t border-gray-300 flex-1"></div>
            </div>
            <button
              onClick={() => { setView('joinWithCode'); setError(''); }}
              className="w-full p-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition shadow-lg"
            >
              <Users className="w-5 h-5" />
              Join Organization with Access Code
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">
              For employees, patients, or students with an organization access code
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // 🎯 BUG 3 FIX: JOIN WITH ACCESS CODE
  // ============================================
  if (view === 'joinWithCode') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
          <button
            onClick={() => { setView('organization'); setError(''); }}
            className="flex items-center gap-2 text-teal-600 font-medium mb-6 hover:underline"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Organization Portal
          </button>

          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Join Your Organization</h1>
            <p className="text-gray-500 mt-2">Enter the access code provided by your organization</p>
          </div>

          <form onSubmit={handleJoinWithAccessCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none text-center font-mono text-lg tracking-widest uppercase"
                  placeholder="XXXXXXXX"
                  maxLength={8}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">8-character code from your organization admin</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={joinEmail}
                  onChange={(e) => setJoinEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showJoinPwd ? 'text' : 'password'}
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:outline-none"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowJoinPwd(!showJoinPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showJoinPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>✅ Join Organization</>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-500">
            By joining, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // 🔑 FORGOT PASSWORD
  // ============================================
  if (view === 'forgot') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
          <button
            onClick={() => { setView('individual'); setError(''); setForgotSuccess(''); }}
            className="flex items-center gap-2 text-purple-600 font-medium mb-6 hover:underline"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to sign in
          </button>

          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-10 h-10 text-purple-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
            <p className="text-gray-500 mt-2">Enter your email to receive a reset link</p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none"
                placeholder="your@email.com"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {forgotSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
};

export default NewAuthScreen;
