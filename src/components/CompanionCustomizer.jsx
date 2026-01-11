// FILE: src/components/Companion/CompanionCustomizer.jsx
// ✨ Full customization UI for picking your companion

import React, { useState } from 'react';
import { useCompanion, COMPANIONS, ACCESSORIES } from './CompanionContext';
import { X, Check, Sparkles, Heart } from 'lucide-react';

const CompanionCustomizer = ({ onComplete, onClose, isOnboarding = false }) => {
  const { saveCompanion, companion, companionName, accessory } = useCompanion();
  
  const [selectedType, setSelectedType] = useState(companion?.id || 'bear');
  const [name, setName] = useState(companionName || '');
  const [selectedAccessory, setSelectedAccessory] = useState(accessory || 'none');
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1); // 1: Choose companion, 2: Name it, 3: Accessorize

  const selectedCompanion = COMPANIONS[selectedType];

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please give your companion a name! 💜');
      return;
    }
    
    setSaving(true);
    const result = await saveCompanion(selectedType, name.trim(), selectedAccessory);
    setSaving(false);
    
    if (result.success && onComplete) {
      onComplete();
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">✨</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Choose Your Companion
        </h2>
        <p className="text-gray-600">
          Pick a friend who will support you on your journey!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
        {Object.values(COMPANIONS).map((comp) => (
          <button
            key={comp.id}
            onClick={() => setSelectedType(comp.id)}
            className={`p-4 rounded-2xl border-3 transition-all hover:scale-105 ${
              selectedType === comp.id
                ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <div className="text-5xl mb-2 animate-bounce">{comp.emoji}</div>
            <div className="font-bold text-gray-800">{comp.name}</div>
            <div className="text-xs text-gray-500 mt-1">{comp.personality}</div>
          </button>
        ))}
      </div>

      {selectedCompanion && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-gray-700">{selectedCompanion.description}</p>
        </div>
      )}

      <button
        onClick={() => setStep(2)}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                   py-4 rounded-2xl font-bold text-lg hover:scale-105 transition shadow-lg"
      >
        Next: Name Your Friend! →
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">{selectedCompanion?.emoji}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Name Your {selectedCompanion?.name}!
        </h2>
        <p className="text-gray-600">
          What would you like to call your new friend?
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`My ${selectedCompanion?.name}'s name is...`}
          className="w-full px-6 py-4 text-xl text-center border-3 border-purple-200 
                     rounded-2xl focus:border-purple-500 focus:outline-none 
                     bg-white shadow-inner"
          maxLength={20}
          autoFocus
        />
        
        {/* Name suggestions */}
        <div className="flex flex-wrap gap-2 justify-center">
          {['Sunny', 'Luna', 'Mochi', 'Cloudy', 'Sprinkles', 'Honey', 'Star', 'Bubbles'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setName(suggestion)}
              className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm 
                         hover:bg-purple-200 transition"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {name && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center">
          <div className="text-4xl mb-2">{selectedCompanion?.emoji}</div>
          <p className="font-bold text-purple-600">
            "{name}" says hi! 👋
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-300 transition"
        >
          ← Back
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!name.trim()}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                     py-4 rounded-2xl font-bold hover:scale-105 transition shadow-lg
                     disabled:opacity-50 disabled:hover:scale-100"
        >
          Next: Accessorize! →
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-2 relative inline-block">
          {selectedCompanion?.emoji}
          {selectedAccessory !== 'none' && (
            <span className="absolute -top-2 -right-2 text-3xl">
              {ACCESSORIES[selectedAccessory]?.emoji}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Accessorize {name}!
        </h2>
        <p className="text-gray-600">
          Give your friend something special to wear!
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Object.values(ACCESSORIES).map((acc) => (
          <button
            key={acc.id}
            onClick={() => setSelectedAccessory(acc.id)}
            className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
              selectedAccessory === acc.id
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <div className="text-2xl mb-1">{acc.emoji || '➖'}</div>
            <div className="text-xs font-medium text-gray-700">{acc.name}</div>
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 text-center">
        <div className="text-7xl mb-3 relative inline-block animate-bounce">
          {selectedCompanion?.emoji}
          {selectedAccessory !== 'none' && (
            <span className="absolute -top-3 -right-3 text-4xl">
              {ACCESSORIES[selectedAccessory]?.emoji}
            </span>
          )}
        </div>
        <p className="font-bold text-xl text-purple-600 mb-1">{name}</p>
        <p className="text-sm text-purple-500">{selectedCompanion?.personality}</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep(2)}
          className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-300 transition"
        >
          ← Back
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                     py-4 rounded-2xl font-bold hover:scale-105 transition shadow-lg
                     flex items-center justify-center gap-2
                     disabled:opacity-50 disabled:hover:scale-100"
        >
          {saving ? (
            '...'
          ) : (
            <>
              <Heart className="w-5 h-5" />
              Complete!
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-t-3xl 
                        flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">Companion Setup</span>
          </div>
          {!isOnboarding && onClose && (
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-all ${
                s === step ? 'bg-purple-500 w-8' : s < step ? 'bg-purple-300' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
};

export default CompanionCustomizer;
