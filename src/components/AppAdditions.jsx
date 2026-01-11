// FILE: src/components/AppAdditions.jsx
// ✨ YRNAlone Enhancement Pack
// Add these components to make your app shine!

import React, { useState, useEffect } from 'react';
import {
  HelpCircle, X, Sun, Moon, Bell, BellOff, MessageCircle,
  Calendar, Star, Sparkles, Heart, Coffee, Sunrise, Sunset,
  Cloud, CloudRain, Zap, Gift, Trophy, Target, CheckCircle,
  ChevronRight, Clock, TrendingUp, Quote, Lightbulb, Smile
} from 'lucide-react';

// ============================================
// 🌙 DARK MODE TOGGLE (Add to Settings)
// ============================================

export const DarkModeToggle = ({ isDark, setIsDark }) => {
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
        isDark ? 'bg-indigo-600' : 'bg-yellow-400'
      }`}
    >
      <div
        className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center ${
          isDark 
            ? 'left-9 bg-indigo-900' 
            : 'left-1 bg-white'
        }`}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-yellow-300" />
        ) : (
          <Sun className="w-4 h-4 text-yellow-500" />
        )}
      </div>
      <span className="sr-only">Toggle dark mode</span>
    </button>
  );
};

// ============================================
// 💬 FLOATING HELP BUTTON
// ============================================

export const FloatingHelpButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-24 right-4 w-12 h-12 bg-purple-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-600 hover:scale-110 transition-all z-40 animate-pulse"
    aria-label="Help"
  >
    <HelpCircle className="w-6 h-6" />
  </button>
);

// ============================================
// 💜 DAILY AFFIRMATION CARD (Add to Home)
// ============================================

const AFFIRMATIONS = [
  { text: "You are worthy of love and happiness.", emoji: "💜" },
  { text: "Today, you choose peace over worry.", emoji: "🕊️" },
  { text: "You are stronger than your struggles.", emoji: "💪" },
  { text: "Your feelings are valid and important.", emoji: "💖" },
  { text: "You are making progress, even when it doesn't feel like it.", emoji: "🌱" },
  { text: "You deserve kindness, especially from yourself.", emoji: "🌸" },
  { text: "It's okay to take things one moment at a time.", emoji: "⏰" },
  { text: "You are not alone in this journey.", emoji: "🤝" },
  { text: "Your best is always good enough.", emoji: "⭐" },
  { text: "You have the power to create positive change.", emoji: "✨" },
  { text: "Today is a new opportunity to grow.", emoji: "🌅" },
  { text: "You are resilient and can handle challenges.", emoji: "🦋" },
  { text: "Your presence makes the world brighter.", emoji: "☀️" },
  { text: "You are allowed to rest and recharge.", emoji: "🌙" },
  { text: "Every small step forward counts.", emoji: "👣" }
];

export const DailyAffirmation = ({ userName }) => {
  const [affirmation, setAffirmation] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Get affirmation based on date (same one all day)
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('affirmation_date');
    const savedIndex = localStorage.getItem('affirmation_index');
    
    if (savedDate === today && savedIndex) {
      setAffirmation(AFFIRMATIONS[parseInt(savedIndex)]);
    } else {
      const index = Math.floor(Math.random() * AFFIRMATIONS.length);
      localStorage.setItem('affirmation_date', today);
      localStorage.setItem('affirmation_index', index.toString());
      setAffirmation(AFFIRMATIONS[index]);
    }
  }, []);

  if (!affirmation || !isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 mb-4 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 text-6xl opacity-20 transform translate-x-2 -translate-y-2">
        {affirmation.emoji}
      </div>
      
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="text-3xl">{affirmation.emoji}</div>
        <div>
          <p className="text-xs text-white/70 mb-1">Today's Affirmation</p>
          <p className="font-medium text-lg leading-snug">{affirmation.text}</p>
          {userName && (
            <p className="text-sm text-white/80 mt-2">Remember this, {userName} 💜</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🌅 GREETING BASED ON TIME OF DAY
// ============================================

export const TimeGreeting = ({ userName }) => {
  const hour = new Date().getHours();
  
  let greeting, emoji, message;
  
  if (hour < 6) {
    greeting = "Good Night";
    emoji = "🌙";
    message = "Can't sleep? We're here for you.";
  } else if (hour < 12) {
    greeting = "Good Morning";
    emoji = "☀️";
    message = "A new day, a fresh start!";
  } else if (hour < 17) {
    greeting = "Good Afternoon";
    emoji = "🌤️";
    message = "How's your day going?";
  } else if (hour < 21) {
    greeting = "Good Evening";
    emoji = "🌅";
    message = "Time to wind down.";
  } else {
    greeting = "Good Night";
    emoji = "🌙";
    message = "Rest well, you deserve it.";
  }

  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        {emoji} {greeting}, {userName || 'Friend'}!
      </h1>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

// ============================================
// 📊 WEEKLY MOOD SUMMARY (Add to Home)
// ============================================

export const WeeklyMoodSummary = ({ moodHistory = [] }) => {
  // Get last 7 days of moods
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    const dayMoods = moodHistory.filter(m => 
      new Date(m.timestamp || m.date).toDateString() === dateStr
    );
    last7Days.push({
      day: date.toLocaleDateString('en', { weekday: 'short' }),
      date: date.getDate(),
      mood: dayMoods.length > 0 ? dayMoods[dayMoods.length - 1] : null
    });
  }

  const getMoodEmoji = (mood) => {
    const moodMap = {
      happy: '😊', sad: '😢', anxious: '😰', tired: '😴',
      loved: '🥰', angry: '😡', calm: '😌', excited: '🤩'
    };
    return moodMap[mood?.toLowerCase()] || '➖';
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          This Week's Moods
        </h3>
        <span className="text-xs text-gray-500">Your journey</span>
      </div>
      
      <div className="flex justify-between">
        {last7Days.map((day, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-xs text-gray-400">{day.day}</span>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mt-1 ${
              day.mood ? 'bg-purple-100' : 'bg-gray-100'
            }`}>
              {getMoodEmoji(day.mood?.mood || day.mood?.label)}
            </div>
            <span className="text-xs text-gray-500 mt-1">{day.date}</span>
          </div>
        ))}
      </div>

      {moodHistory.length === 0 && (
        <p className="text-center text-gray-400 text-sm mt-2">
          Start tracking to see your patterns! 💜
        </p>
      )}
    </div>
  );
};

// ============================================
// 🔔 MOOD REMINDER PROMPT
// ============================================

export const MoodReminderPrompt = ({ onCheckIn, lastCheckIn }) => {
  const [dismissed, setDismissed] = useState(false);
  
  // Check if we should show reminder (more than 8 hours since last check-in)
  const shouldShow = () => {
    if (!lastCheckIn) return true;
    const hoursSince = (Date.now() - new Date(lastCheckIn).getTime()) / (1000 * 60 * 60);
    return hoursSince > 8;
  };

  if (dismissed || !shouldShow()) return null;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-4 mb-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Smile className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold">How are you feeling?</h4>
            <p className="text-sm text-white/80">A quick check-in helps you grow</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDismissed(true)}
            className="p-2 hover:bg-white/20 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={onCheckIn}
            className="px-4 py-2 bg-white text-purple-600 rounded-xl font-medium hover:bg-white/90"
          >
            Check In
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🎯 DAILY CHALLENGE CARD
// ============================================

const DAILY_CHALLENGES = [
  { id: 'gratitude', title: 'Write 3 things you\'re grateful for', icon: '🙏', points: 10 },
  { id: 'breathing', title: 'Complete a breathing exercise', icon: '🌬️', points: 15 },
  { id: 'journal', title: 'Write in your journal', icon: '📝', points: 20 },
  { id: 'connect', title: 'Reply to someone in a group', icon: '💬', points: 15 },
  { id: 'kindness', title: 'Do one kind thing for yourself', icon: '💜', points: 10 },
  { id: 'outside', title: 'Spend 10 minutes outside', icon: '🌳', points: 15 },
  { id: 'water', title: 'Drink 8 glasses of water', icon: '💧', points: 10 },
  { id: 'stretch', title: 'Do a 5-minute stretch', icon: '🧘', points: 10 },
  { id: 'music', title: 'Listen to uplifting music', icon: '🎵', points: 10 },
  { id: 'laugh', title: 'Watch/read something funny', icon: '😂', points: 10 }
];

export const DailyChallenge = ({ onComplete, completedChallenges = [] }) => {
  const [challenge, setChallenge] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Get challenge based on date
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('challenge_date');
    const savedIndex = localStorage.getItem('challenge_index');
    
    if (savedDate === today && savedIndex) {
      const ch = DAILY_CHALLENGES[parseInt(savedIndex)];
      setChallenge(ch);
      setCompleted(completedChallenges.includes(ch.id));
    } else {
      const index = Math.floor(Math.random() * DAILY_CHALLENGES.length);
      localStorage.setItem('challenge_date', today);
      localStorage.setItem('challenge_index', index.toString());
      setChallenge(DAILY_CHALLENGES[index]);
    }
  }, [completedChallenges]);

  const handleComplete = () => {
    setCompleted(true);
    onComplete?.(challenge);
  };

  if (!challenge) return null;

  return (
    <div className={`rounded-2xl p-4 mb-4 ${
      completed 
        ? 'bg-green-50 border-2 border-green-200' 
        : 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
            completed ? 'bg-green-200' : 'bg-amber-200'
          }`}>
            {completed ? '✅' : challenge.icon}
          </div>
          <div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Target className="w-3 h-3" /> Daily Challenge
            </p>
            <h4 className={`font-bold ${completed ? 'text-green-700 line-through' : 'text-gray-800'}`}>
              {challenge.title}
            </h4>
            <p className="text-xs text-amber-600">+{challenge.points} points</p>
          </div>
        </div>
        
        {!completed && (
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600"
          >
            Done!
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// 🏆 STREAK CELEBRATION
// ============================================

export const StreakCelebration = ({ streak, onClose }) => {
  const milestones = [7, 14, 30, 60, 100, 365];
  const isMilestone = milestones.includes(streak);

  if (!isMilestone) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center animate-bounce-in">
        <div className="text-6xl mb-4">🔥</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {streak} Day Streak!
        </h2>
        <p className="text-gray-600 mb-4">
          You're on fire! Keep up the amazing work!
        </p>
        
        <div className="flex justify-center gap-2 mb-6">
          {[...Array(Math.min(streak, 7))].map((_, i) => (
            <span key={i} className="text-2xl animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
              ⭐
            </span>
          ))}
        </div>

        <button
          onClick={onClose}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold w-full"
        >
          Keep Going! 💪
        </button>
      </div>
    </div>
  );
};

// ============================================
// 💌 MEMBER MESSAGING BUTTON (For Enterprise)
// ============================================

export const MessagingButton = ({ hasMessages, onClick }) => (
  <button
    onClick={onClick}
    className="relative p-3 bg-purple-100 rounded-xl hover:bg-purple-200 transition"
  >
    <MessageCircle className="w-6 h-6 text-purple-600" />
    {hasMessages && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
        <span className="text-xs text-white font-bold">!</span>
      </span>
    )}
  </button>
);

// ============================================
// 📅 WEEKLY REFLECTION PROMPT
// ============================================

export const WeeklyReflection = ({ onStart, onDismiss }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show on Sundays
    const today = new Date().getDay();
    const lastShown = localStorage.getItem('weekly_reflection_shown');
    const lastShownDate = lastShown ? new Date(lastShown) : null;
    
    if (today === 0 && (!lastShownDate || 
        new Date().toDateString() !== lastShownDate.toDateString())) {
      setShow(true);
    }
  }, []);

  const handleStart = () => {
    localStorage.setItem('weekly_reflection_shown', new Date().toISOString());
    setShow(false);
    onStart?.();
  };

  const handleDismiss = () => {
    localStorage.setItem('weekly_reflection_shown', new Date().toISOString());
    setShow(false);
    onDismiss?.();
  };

  if (!show) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-5 mb-4 text-white">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
          📝
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Weekly Reflection</h3>
          <p className="text-white/80 text-sm mb-3">
            Take a moment to reflect on your week. What went well? What would you like to improve?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-white text-purple-600 rounded-xl font-medium text-sm"
            >
              Start Reflection
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-white/20 rounded-xl font-medium text-sm"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🎁 REWARD POPUP
// ============================================

export const RewardPopup = ({ reward, onClose }) => {
  if (!reward) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center">
        <div className="relative">
          <div className="text-7xl mb-4 animate-bounce">{reward.icon}</div>
          <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full text-yellow-400 animate-pulse" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {reward.title}
        </h2>
        <p className="text-gray-600 mb-4">{reward.description}</p>
        
        {reward.points && (
          <div className="bg-purple-100 rounded-xl py-2 px-4 inline-block mb-4">
            <span className="text-purple-700 font-bold">+{reward.points} points</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold w-full"
        >
          Awesome! 🎉
        </button>
      </div>
    </div>
  );
};

// ============================================
// 🌟 QUICK STATS BAR
// ============================================

export const QuickStatsBar = ({ streak, journalCount, moodCount, groupsJoined }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
    <div className="flex-shrink-0 bg-orange-100 rounded-xl px-4 py-2 flex items-center gap-2">
      <span className="text-xl">🔥</span>
      <div>
        <p className="text-xs text-orange-600">Streak</p>
        <p className="font-bold text-orange-800">{streak || 0}</p>
      </div>
    </div>
    
    <div className="flex-shrink-0 bg-blue-100 rounded-xl px-4 py-2 flex items-center gap-2">
      <span className="text-xl">📝</span>
      <div>
        <p className="text-xs text-blue-600">Journal</p>
        <p className="font-bold text-blue-800">{journalCount || 0}</p>
      </div>
    </div>
    
    <div className="flex-shrink-0 bg-purple-100 rounded-xl px-4 py-2 flex items-center gap-2">
      <span className="text-xl">😊</span>
      <div>
        <p className="text-xs text-purple-600">Check-ins</p>
        <p className="font-bold text-purple-800">{moodCount || 0}</p>
      </div>
    </div>
    
    <div className="flex-shrink-0 bg-pink-100 rounded-xl px-4 py-2 flex items-center gap-2">
      <span className="text-xl">👥</span>
      <div>
        <p className="text-xs text-pink-600">Groups</p>
        <p className="font-bold text-pink-800">{groupsJoined || 0}</p>
      </div>
    </div>
  </div>
);

// ============================================
// 💡 HELPFUL TIP BANNER
// ============================================

const HELPFUL_TIPS = [
  { tip: "Try the 4-7-8 breathing technique before bed for better sleep!", icon: "😴" },
  { tip: "Writing just 3 sentences in your journal can boost your mood.", icon: "📝" },
  { tip: "Helping others in groups actually helps YOU feel better too!", icon: "🤝" },
  { tip: "Even a 1-minute breathing exercise can reduce anxiety.", icon: "🌬️" },
  { tip: "Naming your emotions helps you process them.", icon: "💬" },
  { tip: "Your streak shows up even on hard days - showing up matters!", icon: "🔥" },
  { tip: "Try the grounding technique when feeling overwhelmed.", icon: "🌍" },
  { tip: "Celebrate small wins - they add up!", icon: "🎉" }
];

export const HelpfulTipBanner = () => {
  const [tip, setTip] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setTip(HELPFUL_TIPS[Math.floor(Math.random() * HELPFUL_TIPS.length)]);
  }, []);

  if (!tip || !visible) return null;

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 mb-4 flex items-center gap-3">
      <span className="text-2xl">{tip.icon}</span>
      <p className="flex-1 text-sm text-blue-800">{tip.tip}</p>
      <button
        onClick={() => setVisible(false)}
        className="p-1 hover:bg-blue-100 rounded-full"
      >
        <X className="w-4 h-4 text-blue-400" />
      </button>
    </div>
  );
};

// ============================================
// 🎨 USAGE INSTRUCTIONS
// ============================================

/*
HOW TO ADD THESE TO YOUR APP:

1. Import at the top of App.jsx:
   import { 
     DailyAffirmation, 
     TimeGreeting, 
     WeeklyMoodSummary,
     MoodReminderPrompt,
     DailyChallenge,
     StreakCelebration,
     FloatingHelpButton,
     QuickStatsBar,
     HelpfulTipBanner,
     WeeklyReflection,
     DarkModeToggle,
     MessagingButton,
     RewardPopup
   } from './components/AppAdditions';

2. Add to HomeView (inside the return, at the top):
   <TimeGreeting userName={user.name} />
   <DailyAffirmation userName={user.name} />
   <MoodReminderPrompt onCheckIn={() => {}} lastCheckIn={moodHistory[moodHistory.length-1]?.timestamp} />
   <DailyChallenge onComplete={(ch) => console.log('Completed:', ch)} />
   <QuickStatsBar 
     streak={user.streak} 
     journalCount={journalEntries.length} 
     moodCount={moodHistory.length}
     groupsJoined={groups.filter(g => g.joined).length}
   />
   <WeeklyMoodSummary moodHistory={moodHistory} />
   <HelpfulTipBanner />
   <WeeklyReflection onStart={() => setCurrentView('journal')} />

3. Add FloatingHelpButton to main render:
   <FloatingHelpButton onClick={() => setShowHelp(true)} />

4. Add StreakCelebration for milestones:
   {showStreakCelebration && (
     <StreakCelebration 
       streak={user.streak} 
       onClose={() => setShowStreakCelebration(false)} 
     />
   )}

5. Add DarkModeToggle to SettingsView:
   <DarkModeToggle isDark={isDarkMode} setIsDark={setIsDarkMode} />

6. Add MessagingButton to header (for enterprise users):
   {user.organizationId && (
     <MessagingButton 
       hasMessages={unreadMessages > 0}
       onClick={() => setCurrentView('messages')}
     />
   )}
*/

export default {
  DailyAffirmation,
  TimeGreeting,
  WeeklyMoodSummary,
  MoodReminderPrompt,
  DailyChallenge,
  StreakCelebration,
  FloatingHelpButton,
  QuickStatsBar,
  HelpfulTipBanner,
  WeeklyReflection,
  DarkModeToggle,
  MessagingButton,
  RewardPopup
};
