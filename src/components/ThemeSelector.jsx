// FILE: src/components/Themes/ThemeSelector.jsx
// ✨ Beautiful theme picker UI

import React, { useState } from 'react';
import { useTheme, APP_THEMES } from './ThemeContext';
import { X, Check, Palette, Sparkles } from 'lucide-react';

const ThemeSelector = ({ onComplete, onClose, isOnboarding = false }) => {
  const { theme, saveTheme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme.id);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await saveTheme(selectedTheme);
    setSaving(false);
    
    if (result.success && onComplete) {
      onComplete();
    }
  };

  const previewTheme = APP_THEMES[selectedTheme];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 
                        flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <span className="font-bold">Choose Your Vibe</span>
          </div>
          {!isOnboarding && onClose && (
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Preview */}
          <div 
            className={`rounded-2xl p-6 transition-all bg-gradient-to-br ${previewTheme.colors.background}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{previewTheme.emoji}</div>
              <div className={previewTheme.colors.text}>
                <div className="font-bold text-xl">{previewTheme.name}</div>
                <div className="text-sm opacity-75">{previewTheme.description}</div>
              </div>
            </div>
            
            {/* Sample UI elements */}
            <div className={`${previewTheme.colors.card} rounded-xl p-4 shadow-lg`}>
              <div className={`font-bold mb-2 ${previewTheme.colors.text}`}>
                Sample Card Preview
              </div>
              <div className={`${previewTheme.colors.text} opacity-75 text-sm mb-3`}>
                This is how your app will look! 💜
              </div>
              <button 
                className={`w-full bg-gradient-to-r ${previewTheme.colors.accent} 
                           text-white py-2 rounded-lg font-bold text-sm`}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Beautiful Button
              </button>
            </div>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-2 gap-3">
            {Object.values(APP_THEMES).map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t.id)}
                className={`p-4 rounded-2xl border-3 transition-all hover:scale-105 
                           bg-gradient-to-br ${t.colors.background} ${
                  selectedTheme === t.id
                    ? 'border-purple-500 shadow-lg scale-105 ring-2 ring-purple-300'
                    : 'border-transparent hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{t.emoji}</div>
                  <div className="text-left">
                    <div className={`font-bold ${t.colors.text}`}>{t.name}</div>
                    <div className={`text-xs ${t.colors.text} opacity-60`}>
                      {t.description.slice(0, 20)}...
                    </div>
                  </div>
                </div>
                {selectedTheme === t.id && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                       py-4 rounded-2xl font-bold text-lg hover:scale-105 transition shadow-lg
                       disabled:opacity-50 disabled:hover:scale-100
                       flex items-center justify-center gap-2"
          >
            {saving ? (
              '...'
            ) : (
              <>
                <Check className="w-5 h-5" />
                {isOnboarding ? "Let's Go!" : "Save Theme"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
