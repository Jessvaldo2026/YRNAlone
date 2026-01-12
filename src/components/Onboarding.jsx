// FILE: src/components/Onboarding.jsx
// 🎯 Onboarding flow for new users

import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const Onboarding = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    displayName: user?.displayName || user?.name || '',
    goals: [],
    notifications: true,
    privacyLevel: 'private'
  });

  const totalSteps = 4;

  const goals = [
    { id: 'anxiety', label: 'Manage Anxiety', icon: '💆' },
    { id: 'depression', label: 'Cope with Depression', icon: '🌈' },
    { id: 'stress', label: 'Reduce Stress', icon: '🧘' },
    { id: 'loneliness', label: 'Feel Less Lonely', icon: '💜' },
    { id: 'sleep', label: 'Sleep Better', icon: '🌙' },
    { id: 'confidence', label: 'Build Confidence', icon: '⭐' },
  ];

  const handleComplete = async () => {
    setSaving(true);
    try {
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          displayName: preferences.displayName || user?.displayName,
          name: preferences.displayName || user?.name,
          goals: preferences.goals,
          notificationsEnabled: preferences.notifications,
          privacyLevel: preferences.privacyLevel,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString()
        });
      }
      onComplete?.();
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Still complete even if save fails
      onComplete?.();
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8">

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                s <= step ? 'bg-purple-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center">
            <div className="text-6xl mb-4">🧸</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to YRNAlone!</h1>
            <p className="text-gray-600 mb-6">You aRe Not alone. Let's set up your safe space.</p>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-purple-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-purple-600 transition"
            >
              Let's Get Started
            </button>
          </div>
        )}

        {/* Step 2: Name */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">What should we call you?</h2>
            <p className="text-gray-600 mb-6">You can use a nickname if you prefer privacy</p>
            <input
              type="text"
              value={preferences.displayName}
              onChange={(e) => setPreferences({ ...preferences, displayName: e.target.value })}
              placeholder="Your name or nickname"
              className="w-full border-2 border-purple-200 rounded-2xl px-6 py-4 text-lg mb-6 focus:border-purple-500 outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-bold hover:bg-purple-600 transition"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">What brings you here?</h2>
            <p className="text-gray-600 mb-6">Select all that apply (this helps us personalize your experience)</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {goals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => {
                    const newGoals = preferences.goals.includes(goal.id)
                      ? preferences.goals.filter(g => g !== goal.id)
                      : [...preferences.goals, goal.id];
                    setPreferences({ ...preferences, goals: newGoals });
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    preferences.goals.includes(goal.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <span className="text-2xl">{goal.icon}</span>
                  <p className="text-sm font-medium mt-1">{goal.label}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-100 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-bold hover:bg-purple-600 transition"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Ready */}
        {step === 4 && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">You're All Set!</h1>
            <p className="text-gray-600 mb-6">
              Hi {preferences.displayName || 'Friend'}! Your safe space is ready. Remember, you are NOT alone.
            </p>
            <div className="bg-purple-50 rounded-2xl p-4 mb-6 text-left">
              <p className="font-medium text-purple-800 mb-2">Here's what you can do:</p>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>📝 Track your mood daily</li>
                <li>📓 Write in your private journal</li>
                <li>👥 Join supportive communities</li>
                <li>🆘 Access crisis support anytime</li>
              </ul>
            </div>
            <button
              onClick={handleComplete}
              disabled={saving}
              className="w-full bg-purple-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-purple-600 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Enter YRNAlone'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
