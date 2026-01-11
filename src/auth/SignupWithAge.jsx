// FILE: src/auth/SignupWithAge.jsx
// 🎂 Enhanced Signup with Age Verification and COPPA Compliance
// Adds birthday verification and parent linking for minors

import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import {
  calculateAge,
  getAccountTypeByAge,
  requiresParentalConsent,
  ACCOUNT_TYPES
} from '../services/guardianService';

const SignupWithAge = ({ onSwitch, onSuccess, onParentSignup }) => {
  // Step management
  const [step, setStep] = useState(1); // 1: account type, 2: birthday (child), 3: details, 4: parent link

  // Account type
  const [accountType, setAccountType] = useState('child'); // 'child' or 'parent'

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Birthday
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');

  // Parent linking
  const [showParentLink, setShowParentLink] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [wantsParentLink, setWantsParentLink] = useState(false);

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ageInfo, setAgeInfo] = useState(null);

  // Validate birthday
  const validateBirthday = () => {
    if (!birthMonth || !birthDay || !birthYear) {
      setError('Please enter your complete birthday');
      return false;
    }

    const birthday = new Date(birthYear, birthMonth - 1, birthDay);
    const today = new Date();

    if (birthday > today) {
      setError('Birthday cannot be in the future');
      return false;
    }

    const age = calculateAge(birthday);

    if (age < 13 && accountType === 'child') {
      // Under 13 requires parent account
      setError('');
      setAgeInfo({
        age,
        requiresParent: true,
        message: 'Users under 13 need a parent/guardian to create their account.'
      });
      return true;
    }

    if (age < 18 && accountType === 'child') {
      setAgeInfo({
        age,
        requiresParent: false,
        canLinkParent: true,
        message: 'You can optionally link a parent/guardian account.'
      });
      return true;
    }

    if (age >= 18 && accountType === 'child') {
      setAgeInfo({
        age,
        isAdult: true,
        message: 'Welcome! You\'re signing up as an adult.'
      });
      return true;
    }

    return true;
  };

  const handleBirthdayNext = () => {
    if (validateBirthday()) {
      if (ageInfo?.requiresParent) {
        // Redirect to parent signup flow
        if (onParentSignup) {
          onParentSignup({
            childBirthday: `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`,
            childName: ''
          });
        }
        return;
      }
      setStep(3);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (name.trim().length < 2) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: name });

      // Determine account type
      const birthday = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
      const accountTypeInfo = accountType === 'parent'
        ? { type: ACCOUNT_TYPES.PARENT }
        : getAccountTypeByAge(birthday);

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
        organizationId: null,
        appTheme: 'default',
        language: 'en',

        // Age verification
        birthday: birthday,
        accountType: accountTypeInfo.type,
        age: accountTypeInfo.age,

        // Account status (for admin management)
        accountStatus: 'active',

        // Default settings
        settings: {
          notifications: true,
          highContrast: false,
          textSize: 'medium'
        },

        // Gamification
        achievements: [],
        streak: 0,
        lastActive: new Date().toISOString(),

        // Stats
        stats: {
          postsCreated: 0,
          journalEntries: 0,
          supportGiven: 0,
          daysActive: 0
        },

        // Pet/Companion
        pet: {
          type: 'teddy',
          name: 'Teddy',
          mood: 'happy',
          level: 1,
          experience: 0
        },

        // Preferences
        preferences: {
          theme: 'kawaii',
          language: 'en',
          notifications: true
        },

        // Parent linking preference
        wantsParentLink: wantsParentLink && ageInfo?.canLinkParent,
        parentEmail: wantsParentLink && parentEmail ? parentEmail : null
      });

      // Send verification email if configured
      try {
        if (window.emailjs) {
          await window.emailjs.send('service_0i2gmim', 'template_p91koho', {
            to_email: email,
            to_name: name,
            verification_link: 'https://yrnalone.com/verify',
            app_name: 'YRNAlone'
          });
          console.log('✅ Verification email sent!');
        }
      } catch (emailError) {
        console.log('Email not sent (EmailJS not configured)');
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to create account. Please try again.');
      }
    }
    setLoading(false);
  };

  // Generate year options (13-100 years ago)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🧸💜</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Join YRNAlone
          </h1>
          <p className="text-gray-500 mt-2">Create your safe space</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1: Account Type */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 text-center">I am a...</h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setAccountType('child'); setStep(2); }}
                className={`p-6 rounded-2xl border-2 transition text-center hover:border-purple-400 hover:bg-purple-50
                  ${accountType === 'child' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
              >
                <div className="text-4xl mb-2">🧒</div>
                <div className="font-bold text-gray-800">Child/Teen</div>
                <div className="text-sm text-gray-500 mt-1">Looking for support</div>
              </button>

              <button
                onClick={() => { setAccountType('parent'); setStep(3); }}
                className={`p-6 rounded-2xl border-2 transition text-center hover:border-purple-400 hover:bg-purple-50
                  ${accountType === 'parent' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
              >
                <div className="text-4xl mb-2">👨‍👩‍👧</div>
                <div className="font-bold text-gray-800">Parent/Guardian</div>
                <div className="text-sm text-gray-500 mt-1">Supporting my child</div>
              </button>
            </div>

            <p className="text-xs text-center text-gray-400">
              Parents can monitor their child's wellness (not private content)
            </p>
          </div>
        )}

        {/* STEP 2: Birthday Verification (for children) */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">When's your birthday?</h2>
              <p className="text-sm text-gray-500 mt-1">We need this to keep you safe</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-purple-100 rounded-xl focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Month</option>
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-purple-100 rounded-xl focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Day</option>
                  {days.map(d => (
                    <option key={d} value={String(d)}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-purple-100 rounded-xl focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Year</option>
                  {years.map(y => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {ageInfo && (
              <div className={`p-4 rounded-xl ${ageInfo.requiresParent ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'}`}>
                <p className={`text-sm ${ageInfo.requiresParent ? 'text-orange-700' : 'text-green-700'}`}>
                  {ageInfo.message}
                </p>
                {ageInfo.requiresParent && (
                  <p className="text-xs text-orange-600 mt-2">
                    A parent will need to create the account for you.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleBirthdayNext}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition"
              >
                Continue
              </button>
            </div>

            <p className="text-xs text-center text-gray-400">
              🔒 Your birthday is kept private
            </p>
          </div>
        )}

        {/* STEP 3: Account Details */}
        {step === 3 && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {accountType === 'parent' ? 'Your Name' : 'Your Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:border-purple-400 focus:outline-none transition"
                placeholder="What should we call you?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:border-purple-400 focus:outline-none transition"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:border-purple-400 focus:outline-none transition"
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:border-purple-400 focus:outline-none transition"
                placeholder="Type password again"
                required
              />
            </div>

            {/* Optional Parent Link for 13-17 */}
            {ageInfo?.canLinkParent && (
              <div className="bg-purple-50 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wantsParentLink}
                    onChange={(e) => setWantsParentLink(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded text-purple-500"
                  />
                  <div>
                    <span className="font-medium text-gray-800">Link a parent/guardian (optional)</span>
                    <p className="text-xs text-gray-500 mt-1">
                      They can see your mood trends and get alerts, but NOT your private journal or messages.
                    </p>
                  </div>
                </label>

                {wantsParentLink && (
                  <div className="mt-3">
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none"
                      placeholder="Parent's email address"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Parent account info */}
            {accountType === 'parent' && (
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-medium">As a parent account, you can:</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Link to your child's account</li>
                  <li>• View their mood trends (not journal content)</li>
                  <li>• Receive crisis alerts</li>
                  <li>• See their app usage</li>
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(accountType === 'parent' ? 1 : 2)}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        {/* Terms */}
        {step > 1 && (
          <p className="mt-4 text-xs text-center text-gray-400">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        )}

        {/* Switch to Login */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitch}
              className="text-purple-600 font-bold hover:text-purple-700"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupWithAge;
