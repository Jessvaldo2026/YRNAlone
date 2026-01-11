// FILE: src/components/Gamification.jsx
// 🎮 Complete Gamification System
// Points, Levels, Rewards, Streaks, Leaderboard

import React, { useState, useEffect } from 'react';
import {
  Trophy, Star, Zap, Crown, Gift, Target, Flame, Medal,
  TrendingUp, Award, Sparkles, ChevronRight, Lock, Check,
  Heart, Users, BookOpen, Smile, Moon, Music, Brain
} from 'lucide-react';

// ============================================
// 🎯 POINTS SYSTEM CONFIG
// ============================================

export const POINT_VALUES = {
  // Daily Activities
  mood_checkin: 10,
  journal_entry: 25,
  gratitude_post: 15,
  breathing_exercise: 20,
  group_message: 10,
  help_someone: 30,
  daily_challenge: 50,
  
  // Milestones
  first_post: 100,
  first_journal: 100,
  joined_group: 50,
  week_streak: 200,
  month_streak: 1000,
  
  // Social
  received_heart: 5,
  gave_heart: 3,
  made_friend: 100
};

// ============================================
// 🏆 LEVELS SYSTEM
// ============================================

export const LEVELS = [
  { level: 1, name: 'Seedling', minPoints: 0, icon: '🌱', color: 'from-green-400 to-green-500' },
  { level: 2, name: 'Sprout', minPoints: 100, icon: '🌿', color: 'from-green-500 to-emerald-500' },
  { level: 3, name: 'Bloomer', minPoints: 300, icon: '🌸', color: 'from-pink-400 to-pink-500' },
  { level: 4, name: 'Flower', minPoints: 600, icon: '🌺', color: 'from-pink-500 to-rose-500' },
  { level: 5, name: 'Garden', minPoints: 1000, icon: '🌻', color: 'from-yellow-400 to-orange-400' },
  { level: 6, name: 'Butterfly', minPoints: 1500, icon: '🦋', color: 'from-purple-400 to-pink-400' },
  { level: 7, name: 'Rainbow', minPoints: 2500, icon: '🌈', color: 'from-red-400 via-yellow-400 to-blue-400' },
  { level: 8, name: 'Star', minPoints: 4000, icon: '⭐', color: 'from-yellow-400 to-amber-500' },
  { level: 9, name: 'Supernova', minPoints: 6000, icon: '💫', color: 'from-purple-500 to-pink-500' },
  { level: 10, name: 'Galaxy', minPoints: 10000, icon: '🌌', color: 'from-indigo-600 to-purple-600' }
];

// ============================================
// 🎁 REWARDS & UNLOCKABLES
// ============================================

export const REWARDS = [
  // Theme unlocks
  { id: 'theme_ocean', name: 'Ocean Theme', type: 'theme', requiredLevel: 2, icon: '🌊' },
  { id: 'theme_forest', name: 'Forest Theme', type: 'theme', requiredLevel: 3, icon: '🌲' },
  { id: 'theme_galaxy', name: 'Galaxy Theme', type: 'theme', requiredLevel: 5, icon: '🌌' },
  { id: 'theme_sunset', name: 'Sunset Theme', type: 'theme', requiredLevel: 7, icon: '🌅' },
  
  // Companion unlocks
  { id: 'companion_bunny', name: 'Bunny Buddy', type: 'companion', requiredLevel: 2, icon: '🐰' },
  { id: 'companion_cat', name: 'Cozy Cat', type: 'companion', requiredLevel: 4, icon: '🐱' },
  { id: 'companion_owl', name: 'Wise Owl', type: 'companion', requiredLevel: 6, icon: '🦉' },
  { id: 'companion_dragon', name: 'Gentle Dragon', type: 'companion', requiredLevel: 8, icon: '🐉' },
  
  // Feature unlocks
  { id: 'custom_mood', name: 'Custom Mood Emojis', type: 'feature', requiredLevel: 3, icon: '😊' },
  { id: 'journal_prompts', name: 'Premium Journal Prompts', type: 'feature', requiredLevel: 4, icon: '✨' },
  { id: 'mood_insights', name: 'Advanced Mood Insights', type: 'feature', requiredLevel: 5, icon: '📊' },
  { id: 'private_groups', name: 'Create Private Groups', type: 'feature', requiredLevel: 6, icon: '🔒' },
  
  // Badges
  { id: 'badge_helper', name: 'Helper Badge', type: 'badge', requiredLevel: 3, icon: '🤝' },
  { id: 'badge_warrior', name: 'Wellness Warrior', type: 'badge', requiredLevel: 5, icon: '⚔️' },
  { id: 'badge_sage', name: 'Mindfulness Sage', type: 'badge', requiredLevel: 7, icon: '🧘' },
  { id: 'badge_legend', name: 'Community Legend', type: 'badge', requiredLevel: 10, icon: '👑' }
];

// ============================================
// 📊 GAMIFICATION CONTEXT/HOOK
// ============================================

export const useGamification = (userId) => {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(LEVELS[0]);
  const [unlockedRewards, setUnlockedRewards] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Load from localStorage (or Firebase in production)
  useEffect(() => {
    const saved = localStorage.getItem(`gamification_${userId}`);
    if (saved) {
      const data = JSON.parse(saved);
      setPoints(data.points || 0);
      setUnlockedRewards(data.unlockedRewards || []);
      setRecentActivity(data.recentActivity || []);
    }
  }, [userId]);

  // Calculate level based on points
  useEffect(() => {
    const newLevel = [...LEVELS].reverse().find(l => points >= l.minPoints) || LEVELS[0];
    setLevel(newLevel);
    
    // Check for new unlocks
    const newUnlocks = REWARDS.filter(r => 
      r.requiredLevel <= newLevel.level && !unlockedRewards.includes(r.id)
    );
    if (newUnlocks.length > 0) {
      setUnlockedRewards(prev => [...prev, ...newUnlocks.map(r => r.id)]);
    }
  }, [points]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`gamification_${userId}`, JSON.stringify({
      points,
      unlockedRewards,
      recentActivity
    }));
  }, [points, unlockedRewards, recentActivity, userId]);

  const addPoints = (action, customPoints = null) => {
    const pointsToAdd = customPoints || POINT_VALUES[action] || 0;
    if (pointsToAdd > 0) {
      setPoints(prev => prev + pointsToAdd);
      setRecentActivity(prev => [{
        action,
        points: pointsToAdd,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 49)]);
      return pointsToAdd;
    }
    return 0;
  };

  const getProgress = () => {
    const currentLevel = level;
    const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
    if (!nextLevel) return 100;
    
    const pointsInLevel = points - currentLevel.minPoints;
    const pointsNeeded = nextLevel.minPoints - currentLevel.minPoints;
    return Math.min(100, Math.round((pointsInLevel / pointsNeeded) * 100));
  };

  return {
    points,
    level,
    unlockedRewards,
    recentActivity,
    addPoints,
    getProgress,
    nextLevel: LEVELS.find(l => l.level === level.level + 1)
  };
};

// ============================================
// 🎯 LEVEL BADGE COMPONENT
// ============================================

export const LevelBadge = ({ level, size = 'md', showName = true }) => {
  const sizes = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl'
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center shadow-lg`}>
        <span>{level.icon}</span>
      </div>
      {showName && (
        <div>
          <p className="text-xs text-gray-500">Level {level.level}</p>
          <p className="font-bold text-gray-800">{level.name}</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// 📊 PROGRESS BAR COMPONENT
// ============================================

export const LevelProgress = ({ points, level, nextLevel }) => {
  const currentMin = level.minPoints;
  const nextMin = nextLevel?.minPoints || level.minPoints;
  const progress = nextLevel 
    ? ((points - currentMin) / (nextMin - currentMin)) * 100 
    : 100;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <LevelBadge level={level} size="md" />
        {nextLevel && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Next Level</p>
            <p className="font-medium text-gray-700">{nextLevel.name} {nextLevel.icon}</p>
          </div>
        )}
      </div>
      
      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${level.color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow">
            {points.toLocaleString()} XP
          </span>
        </div>
      </div>
      
      {nextLevel && (
        <p className="text-xs text-gray-500 text-center mt-2">
          {(nextMin - points).toLocaleString()} XP to {nextLevel.name}
        </p>
      )}
    </div>
  );
};

// ============================================
// 🎁 REWARDS GRID COMPONENT
// ============================================

export const RewardsGrid = ({ unlockedRewards, currentLevel }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', label: 'All', icon: '✨' },
    { id: 'theme', label: 'Themes', icon: '🎨' },
    { id: 'companion', label: 'Companions', icon: '🧸' },
    { id: 'feature', label: 'Features', icon: '⚡' },
    { id: 'badge', label: 'Badges', icon: '🏅' }
  ];

  const filteredRewards = selectedCategory === 'all' 
    ? REWARDS 
    : REWARDS.filter(r => r.type === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap text-sm transition ${
              selectedCategory === cat.id
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Rewards grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredRewards.map(reward => {
          const isUnlocked = unlockedRewards.includes(reward.id);
          const canUnlock = currentLevel.level >= reward.requiredLevel;
          
          return (
            <div
              key={reward.id}
              className={`relative rounded-2xl p-4 text-center transition ${
                isUnlocked 
                  ? 'bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200' 
                  : canUnlock
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-gray-100 opacity-60'
              }`}
            >
              {/* Lock overlay */}
              {!isUnlocked && !canUnlock && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 rounded-2xl">
                  <div className="bg-gray-600 rounded-full p-2">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              {/* Unlocked checkmark */}
              {isUnlocked && (
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              
              <div className="text-4xl mb-2">{reward.icon}</div>
              <h4 className="font-bold text-gray-800 text-sm">{reward.name}</h4>
              <p className="text-xs text-gray-500">Level {reward.requiredLevel}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// 🔥 STREAK TRACKER COMPONENT
// ============================================

export const StreakTracker = ({ streak, longestStreak }) => {
  const streakMilestones = [7, 14, 30, 60, 100, 365];
  const nextMilestone = streakMilestones.find(m => m > streak) || streak;
  const progress = (streak / nextMilestone) * 100;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <p className="text-white/80 text-sm">Current Streak</p>
            <p className="text-3xl font-bold">{streak} days</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-white/80 text-sm">Best</p>
          <p className="text-xl font-bold">{longestStreak} 🏆</p>
        </div>
      </div>

      {/* Progress to next milestone */}
      <div className="bg-white/20 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-white h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      <p className="text-xs text-white/80 text-center mt-2">
        {nextMilestone - streak} days to {nextMilestone}-day milestone! 🎯
      </p>
    </div>
  );
};

// ============================================
// 🏆 LEADERBOARD COMPONENT
// ============================================

export const Leaderboard = ({ users, currentUserId }) => {
  const [timeframe, setTimeframe] = useState('week');
  
  // Sort by points
  const sortedUsers = [...users].sort((a, b) => b.points - a.points);
  const currentUserRank = sortedUsers.findIndex(u => u.id === currentUserId) + 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard
          </h3>
          <div className="flex gap-1 bg-white/20 rounded-lg p-1">
            {['week', 'month', 'all'].map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                  timeframe === t ? 'bg-white text-purple-600' : 'text-white/80'
                }`}
              >
                {t === 'all' ? 'All Time' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {currentUserRank > 0 && (
          <p className="text-white/80 text-sm mt-2">
            You're ranked #{currentUserRank} 🎉
          </p>
        )}
      </div>

      {/* Top 3 */}
      <div className="flex justify-center gap-4 py-4 bg-gradient-to-b from-purple-50 to-white">
        {sortedUsers.slice(0, 3).map((user, i) => {
          const medals = ['🥇', '🥈', '🥉'];
          const sizes = ['w-16 h-16', 'w-14 h-14', 'w-14 h-14'];
          const order = [1, 0, 2]; // Silver, Gold, Bronze positioning
          
          return (
            <div 
              key={user.id}
              className={`flex flex-col items-center ${i === 0 ? 'order-2' : i === 1 ? 'order-1' : 'order-3'}`}
            >
              <div className="text-2xl mb-1">{medals[i]}</div>
              <div className={`${sizes[i]} rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                i === 0 ? 'ring-4 ring-yellow-400' : ''
              }`}>
                {user.name?.charAt(0) || '?'}
              </div>
              <p className="font-medium text-gray-800 mt-2 text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">{user.points.toLocaleString()} XP</p>
            </div>
          );
        })}
      </div>

      {/* Rest of list */}
      <div className="divide-y">
        {sortedUsers.slice(3, 10).map((user, i) => (
          <div 
            key={user.id}
            className={`flex items-center gap-3 p-3 ${
              user.id === currentUserId ? 'bg-purple-50' : ''
            }`}
          >
            <span className="w-6 text-center font-bold text-gray-400">
              {i + 4}
            </span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold">
              {user.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">Level {user.level}</p>
            </div>
            <p className="font-bold text-purple-600">{user.points.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// ⚡ POINTS POPUP (Show when earning points)
// ============================================

export const PointsPopup = ({ points, action, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!points) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-300" />
        <span className="font-bold">+{points} XP</span>
        <span className="text-white/80 text-sm">{action}</span>
      </div>
    </div>
  );
};

// ============================================
// 🎉 LEVEL UP CELEBRATION
// ============================================

export const LevelUpCelebration = ({ newLevel, onClose }) => {
  if (!newLevel) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-scale-in">
        <div className="relative">
          <div className="text-8xl mb-4 animate-bounce">{newLevel.icon}</div>
          <Sparkles className="absolute top-0 left-0 w-full h-full text-yellow-400 animate-pulse opacity-50" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Level Up!</h2>
        <p className="text-xl text-purple-600 font-bold mb-4">
          You're now a {newLevel.name}!
        </p>
        
        <p className="text-gray-600 mb-6">
          Keep going! You're making amazing progress on your wellness journey.
        </p>
        
        <div className="flex gap-2 justify-center mb-6">
          {[...Array(newLevel.level)].map((_, i) => (
            <Star 
              key={i} 
              className="w-6 h-6 text-yellow-400 animate-pulse" 
              fill="currentColor"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className={`w-full py-4 bg-gradient-to-r ${newLevel.color} text-white rounded-2xl font-bold text-lg shadow-lg`}
        >
          Amazing! 🎉
        </button>
      </div>
    </div>
  );
};

// ============================================
// 🌟 DAILY BONUS COMPONENT
// ============================================

export const DailyBonus = ({ onClaim, lastClaimed }) => {
  const [canClaim, setCanClaim] = useState(false);
  const [daysInRow, setDaysInRow] = useState(1);

  useEffect(() => {
    if (!lastClaimed) {
      setCanClaim(true);
      return;
    }
    
    const lastDate = new Date(lastClaimed).toDateString();
    const today = new Date().toDateString();
    setCanClaim(lastDate !== today);
  }, [lastClaimed]);

  const bonusPoints = [10, 15, 20, 25, 30, 40, 50]; // Day 1-7
  const todayBonus = bonusPoints[Math.min(daysInRow - 1, 6)];

  if (!canClaim) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 text-white mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl animate-bounce">
            🎁
          </div>
          <div>
            <h4 className="font-bold text-lg">Daily Bonus!</h4>
            <p className="text-white/80 text-sm">Day {daysInRow} streak bonus</p>
          </div>
        </div>
        <button
          onClick={() => onClaim(todayBonus)}
          className="px-6 py-3 bg-white text-orange-500 rounded-xl font-bold hover:bg-white/90 transition"
        >
          +{todayBonus} XP
        </button>
      </div>
    </div>
  );
};

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce-in {
    0% { transform: translate(-50%, -100%); opacity: 0; }
    50% { transform: translate(-50%, 10%); }
    100% { transform: translate(-50%, 0); opacity: 1; }
  }
  .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
  
  @keyframes scale-in {
    0% { transform: scale(0.5); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  .animate-scale-in { animation: scale-in 0.3s ease-out; }
`;
document.head.appendChild(style);

export default {
  useGamification,
  POINT_VALUES,
  LEVELS,
  REWARDS,
  LevelBadge,
  LevelProgress,
  RewardsGrid,
  StreakTracker,
  Leaderboard,
  PointsPopup,
  LevelUpCelebration,
  DailyBonus
};
