// FILE: src/components/Themes/ThemeContext.jsx
// ✨ App Theme System - Goth, Kawaii, Emo, and more!

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ThemeContext = createContext(null);

// 🎨 ALL APP THEMES
export const APP_THEMES = {
  kawaii: {
    id: 'kawaii',
    name: 'Kawaii',
    emoji: '🌸',
    description: 'Soft, pink, and super cute!',
    colors: {
      primary: '#FF69B4',
      secondary: '#FFB6C1',
      background: 'from-pink-50 to-purple-50',
      card: 'bg-white',
      text: 'text-gray-800',
      accent: 'from-pink-400 to-purple-400'
    },
    effects: {
      sparkles: true,
      hearts: true,
      bubbles: false
    }
  },
  goth: {
    id: 'goth',
    name: 'Goth',
    emoji: '🖤',
    description: 'Dark, mysterious, and elegant.',
    colors: {
      primary: '#8B5CF6',
      secondary: '#6B21A8',
      background: 'from-gray-900 to-purple-950',
      card: 'bg-gray-800',
      text: 'text-gray-100',
      accent: 'from-purple-500 to-pink-500'
    },
    effects: {
      sparkles: false,
      hearts: false,
      stars: true,
      mist: true
    }
  },
  emo: {
    id: 'emo',
    name: 'Emo',
    emoji: '💔',
    description: 'Deep feels and bold expression.',
    colors: {
      primary: '#DC2626',
      secondary: '#7F1D1D',
      background: 'from-gray-900 to-red-950',
      card: 'bg-gray-800',
      text: 'text-gray-100',
      accent: 'from-red-500 to-purple-500'
    },
    effects: {
      sparkles: false,
      hearts: true,
      rain: true
    }
  },
  mystical: {
    id: 'mystical',
    name: 'Mystical',
    emoji: '🔮',
    description: 'Magical, starry, and dreamy.',
    colors: {
      primary: '#7C3AED',
      secondary: '#4C1D95',
      background: 'from-indigo-900 to-purple-900',
      card: 'bg-indigo-800/50',
      text: 'text-gray-100',
      accent: 'from-purple-400 to-pink-400'
    },
    effects: {
      sparkles: true,
      stars: true,
      aurora: true
    }
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage',
    emoji: '📜',
    description: 'Warm, cozy, and nostalgic.',
    colors: {
      primary: '#D97706',
      secondary: '#92400E',
      background: 'from-amber-50 to-orange-100',
      card: 'bg-amber-50',
      text: 'text-amber-900',
      accent: 'from-amber-500 to-orange-500'
    },
    effects: {
      sparkles: false,
      dust: true,
      sepia: true
    }
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    emoji: '🌿',
    description: 'Calm, earthy, and grounding.',
    colors: {
      primary: '#059669',
      secondary: '#065F46',
      background: 'from-green-50 to-emerald-100',
      card: 'bg-white',
      text: 'text-gray-800',
      accent: 'from-green-400 to-emerald-500'
    },
    effects: {
      leaves: true,
      wind: true
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    description: 'Peaceful, blue, and flowing.',
    colors: {
      primary: '#0891B2',
      secondary: '#155E75',
      background: 'from-cyan-50 to-blue-100',
      card: 'bg-white',
      text: 'text-gray-800',
      accent: 'from-cyan-400 to-blue-500'
    },
    effects: {
      waves: true,
      bubbles: true
    }
  },
  fairy: {
    id: 'fairy',
    name: 'Fairy',
    emoji: '✨',
    description: 'Sparkly, pastel, and magical!',
    colors: {
      primary: '#EC4899',
      secondary: '#9333EA',
      background: 'from-pink-100 via-purple-100 to-blue-100',
      card: 'bg-white/80',
      text: 'text-gray-800',
      accent: 'from-pink-400 via-purple-400 to-blue-400'
    },
    effects: {
      sparkles: true,
      fairy_dust: true,
      rainbow: true
    }
  },
  witchy: {
    id: 'witchy',
    name: 'Witchy',
    emoji: '🌙',
    description: 'Dark magic and moonlight.',
    colors: {
      primary: '#A855F7',
      secondary: '#581C87',
      background: 'from-purple-950 to-indigo-950',
      card: 'bg-purple-900/50',
      text: 'text-gray-100',
      accent: 'from-purple-400 to-pink-400'
    },
    effects: {
      stars: true,
      mist: true,
      moon: true
    }
  },
  classic: {
    id: 'classic',
    name: 'Classic',
    emoji: '💜',
    description: 'Simple and clean.',
    colors: {
      primary: '#7C3AED',
      secondary: '#5B21B6',
      background: 'from-gray-50 to-gray-100',
      card: 'bg-white',
      text: 'text-gray-800',
      accent: 'from-purple-500 to-pink-500'
    },
    effects: {
      sparkles: false
    }
  }
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: APP_THEMES.kawaii,
      themeName: 'kawaii',
      isDark: false,
      loading: true,
      setTheme: () => {},
      saveTheme: async () => {},
      getThemeClasses: () => ({}),
      allThemes: APP_THEMES
    };
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(APP_THEMES.kawaii);
  const [loading, setLoading] = useState(true);

  const isDark = ['goth', 'emo', 'mystical', 'witchy'].includes(theme.id);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setThemeState(APP_THEMES.kawaii);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const savedTheme = userData.appTheme || 'kawaii';
          setThemeState(APP_THEMES[savedTheme] || APP_THEMES.kawaii);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setTheme = (themeId) => {
    const newTheme = APP_THEMES[themeId] || APP_THEMES.kawaii;
    setThemeState(newTheme);
  };

  const saveTheme = async (themeId) => {
    const user = auth.currentUser;
    if (!user) return { success: false };

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        appTheme: themeId
      });
      setTheme(themeId);
      return { success: true };
    } catch (error) {
      console.error('Error saving theme:', error);
      return { success: false, error: error.message };
    }
  };

  const getThemeClasses = () => ({
    bg: `bg-gradient-to-br ${theme.colors.background}`,
    card: theme.colors.card,
    text: theme.colors.text,
    accent: `bg-gradient-to-r ${theme.colors.accent}`,
    primary: theme.colors.primary,
    secondary: theme.colors.secondary
  });

  const value = {
    theme,
    themeName: theme.id,
    isDark,
    loading,
    setTheme,
    saveTheme,
    getThemeClasses,
    allThemes: APP_THEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
