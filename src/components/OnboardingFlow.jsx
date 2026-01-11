// FILE: src/components/Onboarding/OnboardingFlow.jsx
// ✨ Beautiful onboarding after signup

import React, { useState } from 'react';
import { useTheme, APP_THEMES } from './ThemeContext';
import { useCompanion, COMPANIONS, ACCESSORIES } from './CompanionContext';
import { db, auth } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Sparkles, Heart, Palette, ArrowRight, Check } from 'lucide-react';

const OnboardingFlow = ({ onComplete }) => {
  const { saveTheme } = useTheme();
  const { saveCompanion } = useCompanion();
  
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState('kawaii');
  const [selectedCompanion, setSelectedCompanion] = useState('bear');
  const [companionName, setCompanionName] = useState('');
  const [selectedAccessory, setSelectedAccessory] = useState('none');
  const [saving, setSaving] = useState(false);

  const totalSteps = 4;
  const previewTheme = APP_THEMES[selectedTheme];
  const previewCompanion = COMPANIONS[selectedCompanion];

  const handleComplete = async () => {
    setSaving(true);
    
    try {
      // Save theme
      await saveTheme(selectedTheme);
      
      // Save companion
      await saveCompanion(selectedCompanion, companionName || previewCompanion.name, selectedAccessory);
      
      // Mark onboarding complete
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          hasCompletedOnboarding: true
        });
      }
      
      setSaving(false);
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setSaving(false);
      onComplete(); // Still continue even if there's an error
    }
  };

  // Step 1: Welcome
  const renderStep1 = () => (
    <div className="text-center space-y-8 p-6">
      <div className="space-y-4">
        <div className="text-8xl animate-bounce">🧸</div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 
                       bg-clip-text text-transparent">
          Welcome to YRNAlone!
        </h1>
        <p className="text-gray-600 text-lg">
          You aRe Not alone 💜
        </p>
      </div>

      <div className="space-y-3 text-left bg-purple-50 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎨</div>
          <span className="text-gray-700">Customize your app's look</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-2xl">🦊</div>
          <span className="text-gray-700">Meet your companion friend</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-2xl">✨</div>
          <span className="text-gray-700">Make it uniquely yours</span>
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                   py-4 rounded-2xl font-bold text-lg hover:scale-105 transition shadow-lg
                   flex items-center justify-center gap-2"
      >
        Let's Get Started!
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  // Step 2: Theme Selection
  const renderStep2 = () => (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <Palette className="w-12 h-12 mx-auto text-purple-500 mb-3" />
        <h2 className="text-2xl font-bold text-gray-800">Choose Your Vibe</h2>
        <p className="text-gray-600">Pick a theme that matches your personality!</p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
        {Object.values(APP_THEMES).map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTheme(t.id)}
            className={`p-4 rounded-2xl border-3 transition-all hover:scale-105 
                       bg-gradient-to-br ${t.colors.background} relative ${
              selectedTheme === t.id
                ? 'border-purple-500 shadow-lg ring-2 ring-purple-300'
                : 'border-transparent'
            }`}
          >
            <div className="text-3xl mb-2">{t.emoji}</div>
            <div className={`font-bold text-sm ${t.colors.text}`}>{t.name}</div>
            {selectedTheme === t.id && (
              <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                <Check className="w-3 h-3" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold"
        >
          Back
        </button>
        <button
          onClick={() => setStep(3)}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                     py-4 rounded-2xl font-bold hover:scale-105 transition"
        >
          Next
        </button>
      </div>
    </div>
  );

  // Step 3: Companion Selection
  const renderStep3 = () => (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <div className="text-5xl mb-3 animate-bounce">{previewCompanion.emoji}</div>
        <h2 className="text-2xl font-bold text-gray-800">Choose Your Friend</h2>
        <p className="text-gray-600">This companion will support you on your journey!</p>
      </div>

      <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
        {Object.values(COMPANIONS).map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCompanion(c.id)}
            className={`p-3 rounded-xl border-2 transition-all hover:scale-110 ${
              selectedCompanion === c.id
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="text-3xl">{c.emoji}</div>
            <div className="text-xs font-medium mt-1">{c.name}</div>
          </button>
        ))}
      </div>

      {/* Name input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name your {previewCompanion.name}:
        </label>
        <input
          type="text"
          value={companionName}
          onChange={(e) => setCompanionName(e.target.value)}
          placeholder={previewCompanion.name}
          className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl 
                     focus:border-purple-500 focus:outline-none text-center text-lg"
          maxLength={15}
        />
      </div>

      {/* Accessories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add an accessory:
        </label>
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.values(ACCESSORIES).map((acc) => (
            <button
              key={acc.id}
              onClick={() => setSelectedAccessory(acc.id)}
              className={`px-3 py-2 rounded-lg border-2 transition-all ${
                selectedAccessory === acc.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200'
              }`}
            >
              <span className="text-lg">{acc.emoji || '➖'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep(2)}
          className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold"
        >
          Back
        </button>
        <button
          onClick={() => setStep(4)}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                     py-4 rounded-2xl font-bold hover:scale-105 transition"
        >
          Next
        </button>
      </div>
    </div>
  );

  // Step 4: Final Preview & Complete
  const renderStep4 = () => (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <Sparkles className="w-12 h-12 mx-auto text-yellow-500 mb-3" />
        <h2 className="text-2xl font-bold text-gray-800">You're All Set!</h2>
        <p className="text-gray-600">Here's your personalized setup:</p>
      </div>

      {/* Preview Card */}
      <div className={`rounded-3xl p-6 bg-gradient-to-br ${previewTheme.colors.background}`}>
        <div className={`${previewTheme.colors.card} rounded-2xl p-6 shadow-lg text-center`}>
          {/* Companion Preview */}
          <div className="relative inline-block mb-4">
            <div className="text-7xl animate-bounce">{previewCompanion.emoji}</div>
            {selectedAccessory !== 'none' && (
              <span className="absolute -top-2 -right-2 text-3xl">
                {ACCESSORIES[selectedAccessory].emoji}
              </span>
            )}
          </div>
          
          <div className={`font-bold text-xl ${previewTheme.colors.text}`}>
            {companionName || previewCompanion.name}
          </div>
          <div className={`text-sm ${previewTheme.colors.text} opacity-60`}>
            {previewCompanion.personality}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{previewTheme.emoji}</span>
              <span className={`font-medium ${previewTheme.colors.text}`}>
                {previewTheme.name} Theme
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep(3)}
          className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold"
        >
          Back
        </button>
        <button
          onClick={handleComplete}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                     py-4 rounded-2xl font-bold hover:scale-105 transition
                     disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? '...' : (
            <>
              <Heart className="w-5 h-5" />
              Start My Journey!
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 
                    flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Progress bar */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all ${
                  s <= step ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            Step {step} of {totalSteps}
          </div>
        </div>

        {/* Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default OnboardingFlow;
