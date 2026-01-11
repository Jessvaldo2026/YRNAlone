// FILE: src/components/Companion/CompanionContext.jsx
// ✨ NEW FEATURE: Customizable Companion System

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const CompanionContext = createContext(null);

// 🦊 COMPANION TYPES - Kawaii style like the image!
export const COMPANIONS = {
  fox: {
    id: 'fox',
    name: 'Fox',
    emoji: '🦊',
    personality: 'Happy & Loyal',
    color: '#FF6B35',
    description: 'A cheerful fox who loves adventures and always has your back!',
    moods: {
      happy: '🦊',
      sad: '😢',
      excited: '🤩',
      sleepy: '😴',
      love: '🥰'
    },
    messages: [
      "You're doing amazing today! 🦊",
      "I believe in you! Let's go!",
      "Every step forward counts! 💕",
      "You make me so proud! ✨"
    ]
  },
  bunny: {
    id: 'bunny',
    name: 'Bunny',
    emoji: '🐰',
    personality: 'Soft & Emotional',
    color: '#FFB6C1',
    description: 'A gentle bunny who understands your feelings deeply.',
    moods: {
      happy: '🐰',
      sad: '😢',
      excited: '🤩',
      sleepy: '😴',
      love: '🥰'
    },
    messages: [
      "It's okay to feel this way 🐰",
      "I'm here with you, always 💕",
      "Your feelings are valid ✨",
      "Take your time, I'll wait 🌸"
    ]
  },
  owl: {
    id: 'owl',
    name: 'Owl',
    emoji: '🦉',
    personality: 'Wise & Calm',
    color: '#8B4513',
    description: 'A wise owl with a magical hat who offers thoughtful advice.',
    moods: {
      happy: '🦉',
      sad: '😢',
      excited: '🤩',
      sleepy: '😴',
      love: '🥰'
    },
    messages: [
      "Remember to rest, dear friend 🦉",
      "Wisdom comes from experience ✨",
      "You're wiser than you know 🌙",
      "Take a deep breath with me 💫"
    ]
  },
  cat: {
    id: 'cat',
    name: 'Cat',
    emoji: '🐱',
    personality: 'Mysterious & Cozy',
    color: '#9B59B6',
    description: 'A cozy cat who loves quiet moments and warm cuddles.',
    moods: {
      happy: '🐱',
      sad: '😿',
      excited: '😸',
      sleepy: '😴',
      love: '😻'
    },
    messages: [
      "Let's find a cozy spot together 🐱",
      "You deserve peace and comfort 💜",
      "I'll purr you to calmness ✨",
      "Quiet moments are precious 🌙"
    ]
  },
  bear: {
    id: 'bear',
    name: 'Bear',
    emoji: '🐻',
    personality: 'Warm & Protective',
    color: '#D2691E',
    description: 'A big warm bear who gives the best hugs and protection.',
    moods: {
      happy: '🐻',
      sad: '😢',
      excited: '🤩',
      sleepy: '😴',
      love: '🥰'
    },
    messages: [
      "Come here for a big bear hug! 🐻",
      "I'll protect your heart always 💪",
      "You're stronger than you think! ✨",
      "Rest in my warmth, friend 🧸"
    ]
  },
  raccoon: {
    id: 'raccoon',
    name: 'Raccoon',
    emoji: '🦝',
    personality: 'Playful & Curious',
    color: '#708090',
    description: 'A playful raccoon who finds joy in little things!',
    moods: {
      happy: '🦝',
      sad: '😢',
      excited: '🤩',
      sleepy: '😴',
      love: '🥰'
    },
    messages: [
      "What adventure awaits today? 🦝",
      "Let's find something fun! ✨",
      "Curiosity is a superpower! 🌟",
      "Every day has hidden treasures 💎"
    ]
  },
  koala: {
    id: 'koala',
    name: 'Koala',
    emoji: '🐨',
    personality: 'Calm & Sleepy',
    color: '#A9A9A9',
    description: 'A peaceful koala who values rest and relaxation.',
    moods: {
      happy: '🐨',
      sad: '😢',
      excited: '🤩',
      sleepy: '😴',
      love: '🥰'
    },
    messages: [
      "Rest is important, friend 🐨",
      "Let's take it slow today 🌿",
      "You deserve peaceful moments 💤",
      "Breathe in... breathe out... 🍃"
    ]
  },
  butterfly: {
    id: 'butterfly',
    name: 'Butterfly',
    emoji: '🦋',
    personality: 'Free & Gentle',
    color: '#87CEEB',
    description: 'A gentle butterfly who reminds you of your beautiful transformation.',
    moods: {
      happy: '🦋',
      sad: '😢',
      excited: '🤩',
      sleepy: '😴',
      love: '🥰'
    },
    messages: [
      "You're transforming beautifully 🦋",
      "Spread your wings, dear one ✨",
      "Change is beautiful, like you 🌸",
      "Float through today with grace 💕"
    ]
  }
};

// 🎀 COMPANION ACCESSORIES
export const ACCESSORIES = {
  none: { id: 'none', name: 'None', emoji: '' },
  wizardHat: { id: 'wizardHat', name: 'Wizard Hat', emoji: '🎩' },
  bow: { id: 'bow', name: 'Cute Bow', emoji: '🎀' },
  scarf: { id: 'scarf', name: 'Cozy Scarf', emoji: '🧣' },
  crown: { id: 'crown', name: 'Crown', emoji: '👑' },
  flower: { id: 'flower', name: 'Flower', emoji: '🌸' },
  heart: { id: 'heart', name: 'Heart', emoji: '💖' },
  star: { id: 'star', name: 'Star', emoji: '⭐' },
  ribbon: { id: 'ribbon', name: 'Ribbon', emoji: '🎗️' }
};

export const useCompanion = () => {
  const context = useContext(CompanionContext);
  if (!context) {
    return {
      companion: null,
      companionName: 'Friend',
      companionType: 'bear',
      accessory: 'none',
      loading: true,
      setCompanion: () => {},
      setCompanionName: () => {},
      setAccessory: () => {},
      getRandomMessage: () => "You're amazing! 💜",
      saveCompanion: async () => {}
    };
  }
  return context;
};

export const CompanionProvider = ({ children }) => {
  const [companion, setCompanion] = useState(COMPANIONS.bear);
  const [companionName, setCompanionName] = useState('Teddy');
  const [accessory, setAccessory] = useState('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCompanion(COMPANIONS.bear);
        setCompanionName('Teddy');
        setAccessory('none');
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.companion) {
            const savedCompanion = COMPANIONS[userData.companion.type] || COMPANIONS.bear;
            setCompanion(savedCompanion);
            setCompanionName(userData.companion.name || 'Friend');
            setAccessory(userData.companion.accessory || 'none');
          }
        }
      } catch (error) {
        console.error('Error loading companion:', error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveCompanion = async (type, name, acc) => {
    const user = auth.currentUser;
    if (!user) return { success: false };

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        companion: {
          type: type,
          name: name,
          accessory: acc,
          updatedAt: new Date().toISOString()
        }
      });
      
      setCompanion(COMPANIONS[type] || COMPANIONS.bear);
      setCompanionName(name);
      setAccessory(acc);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving companion:', error);
      return { success: false, error: error.message };
    }
  };

  const getRandomMessage = () => {
    if (!companion || !companion.messages) {
      return "You're doing great! 💜";
    }
    return companion.messages[Math.floor(Math.random() * companion.messages.length)];
  };

  const value = {
    companion,
    companionName,
    companionType: companion?.id || 'bear',
    accessory,
    loading,
    setCompanion: (type) => setCompanion(COMPANIONS[type] || COMPANIONS.bear),
    setCompanionName,
    setAccessory,
    getRandomMessage,
    saveCompanion,
    allCompanions: COMPANIONS,
    allAccessories: ACCESSORIES
  };

  return (
    <CompanionContext.Provider value={value}>
      {children}
    </CompanionContext.Provider>
  );
};

export default CompanionContext;
