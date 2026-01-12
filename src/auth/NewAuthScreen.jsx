// FILE: src/auth/NewAuthScreen.jsx
// 🎯 TASK 1: Simplified 2-Button Login with Side-by-Side Forms
// Built with love by Jess & Claudia 🧸💜

import React, { useState } from 'react';
import {
  Heart, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Building2,
  UserCircle, Shield, KeyRound, CheckCircle, ChevronDown
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
  // Main view: 'main' | 'individual' | 'organization' | 'forgot'
  const [view, setView] = useState('main');

  // Organization Portal tab: 'login' | 'register' | 'join'
  const [orgTab, setOrgTab] = useState('login');

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

  // 🎯 Join with Access Code state
  const [accessCode, setAccessCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [showJoinPwd, setShowJoinPwd] = useState(false);
  const [isJoinNewUser, setIsJoinNewUser] = useState(true); // Toggle sign up vs sign in
  const [verifiedOrg, setVerifiedOrg] = useState(null); // Org found after code verification

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
        accountType: 'individual',  // 🔴 CRITICAL: User type for routing
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
  // 🎯 BUG 1 FIX: Check if user is org admin, fix missing fields, and set redirect flag
  const handleOrgSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, orgLoginEmail, orgLoginPassword);

      // 🎯 BUG 1 FIX: Verify this user is an org admin and fix any missing fields
      try {
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        const userData = userDoc.data();

        // Check if user has org admin permissions
        if (!userData?.isOrgAdmin && !userData?.organizationId) {
          setError('This account is not an organization admin. Please use individual sign in.');
          await auth.signOut();
          setLoading(false);
          return;
        }

        // 🔴 CRITICAL: If old account is missing fields, add them now
        const needsUpdate = !userData.accountType || !userData.role || userData.role !== 'admin';
        if (needsUpdate && userData.isOrgAdmin) {
          console.log('🔧 Fixing missing org admin fields for:', userData.email);
          await updateDoc(doc(db, 'users', userCredential.user.uid), {
            isOrgAdmin: true,
            accountType: 'organization',
            role: 'admin'
          });
        }

        // Set flag for redirect to admin dashboard
        sessionStorage.setItem('pendingAdminRedirect', 'true');
        console.log('🏢 Org admin logged in:', userData.email);
        console.log('   - isOrgAdmin:', userData.isOrgAdmin);
        console.log('   - accountType:', userData.accountType);
        console.log('   - role:', userData.role || '(being fixed)');
      } catch (checkErr) {
        console.log('Could not check admin status:', checkErr);
      }

      onSuccess?.();
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('No admin account found');
      else if (err.code === 'auth/wrong-password') setError('Incorrect password');
      else if (err.code === 'auth/invalid-credential') setError('Invalid email or password');
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

      // Create admin user profile with ALL CRITICAL FIELDS
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: newOrgAdminEmail,
        displayName: newOrgAdminName,
        name: newOrgAdminName,
        organizationId: orgId,
        organizationName: newOrgName,
        // 🔴 CRITICAL FIELDS FOR ORG ADMIN ROUTING:
        isOrgAdmin: true,
        accountType: 'organization',
        role: 'admin',
        // Other fields
        isPremium: true,
        createdAt: serverTimestamp(),
        language: 'en',
        onboardingCompleted: true // Org admins skip user onboarding
      });

      console.log('✅ Org admin created with fields:');
      console.log('   - isOrgAdmin: true');
      console.log('   - accountType: organization');
      console.log('   - role: admin');
      console.log('   - organizationId:', orgId);

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

  // Step 1: Verify access code and find organization
  const handleVerifyAccessCode = async () => {
    setError('');
    if (!accessCode.trim()) {
      setError('Please enter an access code');
      return;
    }

    setLoading(true);

    try {
      // Find organization by access code
      const orgsRef = collection(db, 'organizations');
      const orgQuery = query(orgsRef, where('accessCode', '==', accessCode.trim().toUpperCase()));
      const orgSnap = await getDocs(orgQuery);

      if (orgSnap.empty) {
        setError('Invalid access code. Please check with your organization.');
        setLoading(false);
        return;
      }

      const orgDoc = orgSnap.docs[0];
      const orgData = orgDoc.data();
      setVerifiedOrg({ id: orgDoc.id, ...orgData });
      setError('');
      console.log(`✅ Found organization: ${orgData.name}`);
    } catch (err) {
      setError('Error verifying code: ' + err.message);
    }
    setLoading(false);
  };

  // Step 2: Join organization (new user sign up OR existing user sign in)
  const handleJoinWithAccessCode = async (e) => {
    e.preventDefault();
    setError('');

    if (!verifiedOrg) {
      setError('Please verify your access code first');
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
    if (isJoinNewUser && !joinName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      let userCredential;
      const orgId = verifiedOrg.id;

      if (isJoinNewUser) {
        // NEW USER: Create account
        userCredential = await createUserWithEmailAndPassword(auth, joinEmail, joinPassword);
        await updateProfile(userCredential.user, { displayName: joinName });

        // Create user profile linked to organization
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: joinEmail,
          displayName: joinName,
          name: joinName,
          organizationId: orgId,
          organizationName: verifiedOrg.name,
          isOrgAdmin: false,
          isOrgUser: true, // 🎯 Flag for org user
          isOrgMember: true,
          role: 'member',
          isPremium: true, // Org members get premium access
          createdAt: serverTimestamp(),
          language: 'en',
          joinedViaCode: accessCode.toUpperCase(),
          joinedViaAccessCode: true,
          accountType: 'organization',
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
      } else {
        // EXISTING USER: Sign in and link to organization
        userCredential = await signInWithEmailAndPassword(auth, joinEmail, joinPassword);

        // Update user profile with organization link
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          organizationId: orgId,
          organizationName: verifiedOrg.name,
          isOrgAdmin: false,
          isOrgUser: true, // 🎯 Flag for org user
          isOrgMember: true,
          role: 'member',
          isPremium: true, // Org members get premium access
          joinedViaCode: accessCode.toUpperCase(),
          joinedViaAccessCode: true,
          accountType: 'organization'
        }, { merge: true });
      }

      // Update organization member count
      await updateDoc(doc(db, 'organizations', orgId), {
        memberCount: (verifiedOrg.memberCount || 1) + 1
      });

      console.log(`✅ User joined ${verifiedOrg.name} via access code`);
      onSuccess?.();
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists. Try signing in instead.');
      else if (err.code === 'auth/invalid-email') setError('Invalid email address');
      else if (err.code === 'auth/weak-password') setError('Password is too weak');
      else if (err.code === 'auth/user-not-found') setError('No account found with this email. Try creating a new account.');
      else if (err.code === 'auth/wrong-password') setError('Incorrect password');
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
  // 🏢 ORGANIZATION PORTAL - 3-Tab Layout
  // ============================================
  if (view === 'organization') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Back Button & Header */}
          <div className="text-center mb-6">
            <button
              onClick={() => { setView('main'); setError(''); setVerifiedOrg(null); }}
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

          {/* 3 Tab Buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setOrgTab('login'); setError(''); }}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                orgTab === 'login'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              Admin Login
            </button>
            <button
              onClick={() => { setOrgTab('register'); setError(''); }}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                orgTab === 'register'
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              Register Org
            </button>
            <button
              onClick={() => { setOrgTab('join'); setError(''); setVerifiedOrg(null); }}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                orgTab === 'join'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              Join with Code
            </button>
          </div>

          {/* TAB 1: Admin Login */}
          {orgTab === 'login' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-center text-gray-800 mb-6 pb-3 border-b flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" /> Admin Sign In
              </h2>

              <form onSubmit={handleOrgSignIn} className="space-y-4 max-w-md mx-auto">
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

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                    {error}
                  </div>
                )}

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
          )}

          {/* TAB 2: Register New Org */}
          {orgTab === 'register' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-center text-gray-800 mb-6 pb-3 border-b flex items-center justify-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" /> Register New Organization
              </h2>

              <form onSubmit={handleOrgRegister} className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-none"
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-none appearance-none bg-white"
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
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-none"
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
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-none"
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
                      className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-none"
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

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>🏢 Register Organization</>
                  )}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-gray-500">
                14-day free trial • No credit card required
              </p>
            </div>
          )}

          {/* TAB 3: Join with Access Code */}
          {orgTab === 'join' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-center text-gray-800 mb-2 flex items-center justify-center gap-2">
                <KeyRound className="w-5 h-5 text-green-500" /> Join Your Organization
              </h2>
              <p className="text-gray-500 text-center mb-6 text-sm">
                Enter the access code from your clinic, school, or company
              </p>

              <div className="max-w-md mx-auto">
                {/* Step 1: Enter and Verify Access Code */}
                {!verifiedOrg ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Access Code</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                          className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none text-center font-mono text-2xl tracking-widest uppercase"
                          placeholder="ABC123XY"
                          maxLength={10}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">Code from your organization admin</p>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm mb-4">
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleVerifyAccessCode}
                      disabled={loading || !accessCode.trim()}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>Verify Code</>
                      )}
                    </button>
                  </>
                ) : (
                  /* Step 2: Organization Found - Sign Up or Sign In */
                  <>
                    {/* Organization Found Banner */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="text-green-700 font-bold">Organization Found!</p>
                          <p className="text-green-600">{verifiedOrg.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Toggle New User / Existing User */}
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => { setIsJoinNewUser(true); setError(''); }}
                        className={`flex-1 py-2 rounded-lg font-medium transition ${
                          isJoinNewUser
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        New User
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsJoinNewUser(false); setError(''); }}
                        className={`flex-1 py-2 rounded-lg font-medium transition ${
                          !isJoinNewUser
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Existing User
                      </button>
                    </div>

                    <form onSubmit={handleJoinWithAccessCode} className="space-y-4">
                      {/* Name field - only for new users */}
                      {isJoinNewUser && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Your Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={joinName}
                              onChange={(e) => setJoinName(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none"
                              placeholder="Your full name"
                              required
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={joinEmail}
                            onChange={(e) => setJoinEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none"
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isJoinNewUser ? 'Create Password' : 'Password'}
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showJoinPwd ? 'text' : 'password'}
                            value={joinPassword}
                            onChange={(e) => setJoinPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none"
                            placeholder={isJoinNewUser ? 'At least 6 characters' : '••••••••'}
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
                          <>{isJoinNewUser ? '✨ Create Account & Join' : '🔑 Sign In & Join'}</>
                        )}
                      </button>
                    </form>

                    {/* Back to change code */}
                    <button
                      type="button"
                      onClick={() => { setVerifiedOrg(null); setError(''); }}
                      className="w-full mt-3 text-gray-500 text-sm hover:underline"
                    >
                      Use a different access code
                    </button>
                  </>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-gray-500">
                For employees, patients, or students with an organization access code
              </p>
            </div>
          )}
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
