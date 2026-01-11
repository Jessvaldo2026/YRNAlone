// FILE: src/components/WellnessInsights.jsx
// 📊 Wellness Score & AI-Like Mood Insights
// Analyzes patterns and provides personalized recommendations

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Minus, Brain, Heart, Moon, Sun,
  Zap, Coffee, Smile, Frown, Meh, AlertCircle, CheckCircle,
  Calendar, Clock, Activity, Target, Sparkles, ChevronRight,
  ArrowUp, ArrowDown, BarChart3, PieChart
} from 'lucide-react';

// ============================================
// 🎯 WELLNESS SCORE CALCULATOR
// ============================================

export const calculateWellnessScore = (data) => {
  const {
    moodHistory = [],
    journalEntries = [],
    breathingCount = 0,
    sleepLog = [],
    streak = 0,
    groupsJoined = 0,
    lastWeekData = {}
  } = data;

  let score = 50; // Base score
  const factors = [];

  // Mood factor (up to +20 or -20)
  if (moodHistory.length > 0) {
    const recentMoods = moodHistory.slice(-7);
    const moodValues = {
      happy: 10, loved: 10, calm: 8, excited: 7,
      neutral: 5, tired: 3, anxious: 2, sad: 1, angry: 1
    };
    const avgMood = recentMoods.reduce((sum, m) => {
      const val = moodValues[m.mood?.toLowerCase()] || moodValues[m.label?.toLowerCase()] || 5;
      return sum + val;
    }, 0) / recentMoods.length;
    
    const moodScore = Math.round((avgMood / 10) * 20);
    score += moodScore - 10;
    factors.push({
      name: 'Mood',
      score: moodScore,
      max: 20,
      trend: avgMood > 5 ? 'up' : avgMood < 4 ? 'down' : 'stable'
    });
  }

  // Consistency factor (up to +15)
  const consistencyScore = Math.min(15, Math.round(streak / 2));
  score += consistencyScore;
  factors.push({
    name: 'Consistency',
    score: consistencyScore,
    max: 15,
    trend: streak > 3 ? 'up' : 'stable'
  });

  // Journaling factor (up to +15)
  const recentJournals = journalEntries.filter(j => {
    const date = new Date(j.timestamp || j.date);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return date > weekAgo;
  }).length;
  const journalScore = Math.min(15, recentJournals * 3);
  score += journalScore;
  factors.push({
    name: 'Self-Reflection',
    score: journalScore,
    max: 15,
    trend: recentJournals >= 3 ? 'up' : 'stable'
  });

  // Breathing/Mindfulness factor (up to +10)
  const breathingScore = Math.min(10, Math.round(breathingCount / 2));
  score += breathingScore;
  factors.push({
    name: 'Mindfulness',
    score: breathingScore,
    max: 10,
    trend: breathingCount > 5 ? 'up' : 'stable'
  });

  // Social connection factor (up to +10)
  const socialScore = Math.min(10, groupsJoined * 2);
  score += socialScore;
  factors.push({
    name: 'Connection',
    score: socialScore,
    max: 10,
    trend: groupsJoined > 2 ? 'up' : 'stable'
  });

  // Sleep factor (up to +10)
  if (sleepLog.length > 0) {
    const recentSleep = sleepLog.slice(-7);
    const avgSleep = recentSleep.reduce((sum, s) => sum + (s.hours || 7), 0) / recentSleep.length;
    const sleepScore = avgSleep >= 7 && avgSleep <= 9 ? 10 : avgSleep >= 6 ? 7 : 3;
    score += sleepScore;
    factors.push({
      name: 'Sleep',
      score: sleepScore,
      max: 10,
      trend: avgSleep >= 7 ? 'up' : 'down'
    });
  }

  // Normalize score to 0-100
  score = Math.max(0, Math.min(100, score));

  return { score, factors };
};

// ============================================
// 🌟 WELLNESS SCORE DISPLAY
// ============================================

export const WellnessScoreCard = ({ data }) => {
  const { score, factors } = useMemo(() => calculateWellnessScore(data), [data]);
  
  const getScoreColor = (s) => {
    if (s >= 80) return 'from-green-400 to-emerald-500';
    if (s >= 60) return 'from-blue-400 to-cyan-500';
    if (s >= 40) return 'from-yellow-400 to-orange-500';
    return 'from-orange-400 to-red-500';
  };

  const getScoreLabel = (s) => {
    if (s >= 80) return { label: 'Thriving', emoji: '🌟' };
    if (s >= 60) return { label: 'Growing', emoji: '🌱' };
    if (s >= 40) return { label: 'Building', emoji: '🔨' };
    return { label: 'Healing', emoji: '💜' };
  };

  const { label, emoji } = getScoreLabel(score);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Score header */}
      <div className={`bg-gradient-to-r ${getScoreColor(score)} p-6 text-white text-center`}>
        <p className="text-white/80 text-sm mb-1">Your Wellness Score</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-5xl font-bold">{score}</span>
          <span className="text-3xl">{emoji}</span>
        </div>
        <p className="text-lg font-medium mt-1">{label}</p>
      </div>

      {/* Factors breakdown */}
      <div className="p-4 space-y-3">
        <h4 className="font-bold text-gray-700 text-sm">Wellness Factors</h4>
        
        {factors.map((factor, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-24 text-sm text-gray-600">{factor.name}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  factor.score / factor.max >= 0.7 ? 'bg-green-500' :
                  factor.score / factor.max >= 0.4 ? 'bg-yellow-500' : 'bg-red-400'
                }`}
                style={{ width: `${(factor.score / factor.max) * 100}%` }}
              />
            </div>
            <div className="w-12 text-right">
              {factor.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-500 inline" />}
              {factor.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-500 inline" />}
              {factor.trend === 'stable' && <Minus className="w-4 h-4 text-gray-400 inline" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// 🧠 MOOD PATTERN ANALYSIS
// ============================================

export const MoodPatternAnalysis = ({ moodHistory = [] }) => {
  const analysis = useMemo(() => {
    if (moodHistory.length < 3) {
      return { hasEnoughData: false };
    }

    const patterns = {
      timeOfDay: {},
      dayOfWeek: {},
      moodCounts: {},
      trends: []
    };

    // Analyze each mood entry
    moodHistory.forEach(entry => {
      const date = new Date(entry.timestamp || entry.date);
      const hour = date.getHours();
      const day = date.toLocaleDateString('en', { weekday: 'long' });
      const mood = entry.mood?.toLowerCase() || entry.label?.toLowerCase();

      // Time of day patterns
      const timeSlot = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
      if (!patterns.timeOfDay[timeSlot]) patterns.timeOfDay[timeSlot] = [];
      patterns.timeOfDay[timeSlot].push(mood);

      // Day of week patterns
      if (!patterns.dayOfWeek[day]) patterns.dayOfWeek[day] = [];
      patterns.dayOfWeek[day].push(mood);

      // Overall mood counts
      patterns.moodCounts[mood] = (patterns.moodCounts[mood] || 0) + 1;
    });

    // Find insights
    const insights = [];

    // Most common mood
    const sortedMoods = Object.entries(patterns.moodCounts).sort((a, b) => b[1] - a[1]);
    if (sortedMoods.length > 0) {
      insights.push({
        type: 'common_mood',
        mood: sortedMoods[0][0],
        count: sortedMoods[0][1],
        message: `Your most frequent mood is ${sortedMoods[0][0]} (${sortedMoods[0][1]} times)`
      });
    }

    // Best time of day
    const getMoodScore = (moods) => {
      const scores = { happy: 5, loved: 5, calm: 4, excited: 4, neutral: 3, tired: 2, anxious: 1, sad: 1, angry: 1 };
      return moods.reduce((sum, m) => sum + (scores[m] || 3), 0) / moods.length;
    };

    const timeScores = Object.entries(patterns.timeOfDay)
      .map(([time, moods]) => ({ time, score: getMoodScore(moods) }))
      .sort((a, b) => b.score - a.score);

    if (timeScores.length > 0 && timeScores[0].score > 3) {
      insights.push({
        type: 'best_time',
        time: timeScores[0].time,
        message: `You tend to feel best in the ${timeScores[0].time.toLowerCase()}`
      });
    }

    // Day patterns
    const dayScores = Object.entries(patterns.dayOfWeek)
      .map(([day, moods]) => ({ day, score: getMoodScore(moods) }))
      .sort((a, b) => b.score - a.score);

    if (dayScores.length > 0) {
      insights.push({
        type: 'best_day',
        day: dayScores[0].day,
        message: `${dayScores[0].day}s tend to be your best days`
      });
    }

    // Recent trend
    const last7 = moodHistory.slice(-7);
    const first7 = moodHistory.slice(0, 7);
    if (last7.length >= 3 && first7.length >= 3) {
      const recentScore = getMoodScore(last7.map(m => m.mood?.toLowerCase() || m.label?.toLowerCase()));
      const oldScore = getMoodScore(first7.map(m => m.mood?.toLowerCase() || m.label?.toLowerCase()));
      
      if (recentScore > oldScore + 0.5) {
        insights.push({
          type: 'improving',
          message: "Your mood has been improving! Keep up the great work! 🌟"
        });
      } else if (recentScore < oldScore - 0.5) {
        insights.push({
          type: 'declining',
          message: "Things have been tough lately. Remember, it's okay to ask for help. 💜"
        });
      }
    }

    return { hasEnoughData: true, insights, patterns };
  }, [moodHistory]);

  if (!analysis.hasEnoughData) {
    return (
      <div className="bg-purple-50 rounded-2xl p-6 text-center">
        <Brain className="w-12 h-12 text-purple-300 mx-auto mb-3" />
        <h3 className="font-bold text-gray-800 mb-2">Building Your Insights</h3>
        <p className="text-gray-600 text-sm">
          Keep tracking your moods! We need a few more entries to show you personalized patterns.
        </p>
        <p className="text-purple-600 font-medium mt-2">
          {moodHistory.length}/5 entries
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-500" />
        Your Mood Patterns
      </h3>

      <div className="space-y-3">
        {analysis.insights.map((insight, i) => (
          <div 
            key={i}
            className={`p-3 rounded-xl ${
              insight.type === 'improving' ? 'bg-green-50 border border-green-200' :
              insight.type === 'declining' ? 'bg-orange-50 border border-orange-200' :
              'bg-purple-50 border border-purple-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                insight.type === 'improving' ? 'bg-green-200' :
                insight.type === 'declining' ? 'bg-orange-200' :
                'bg-purple-200'
              }`}>
                {insight.type === 'common_mood' && <BarChart3 className="w-4 h-4 text-purple-600" />}
                {insight.type === 'best_time' && <Clock className="w-4 h-4 text-purple-600" />}
                {insight.type === 'best_day' && <Calendar className="w-4 h-4 text-purple-600" />}
                {insight.type === 'improving' && <TrendingUp className="w-4 h-4 text-green-600" />}
                {insight.type === 'declining' && <Heart className="w-4 h-4 text-orange-600" />}
              </div>
              <p className="text-sm text-gray-700 flex-1">{insight.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// 💡 PERSONALIZED RECOMMENDATIONS
// ============================================

export const PersonalizedRecommendations = ({ data }) => {
  const recommendations = useMemo(() => {
    const recs = [];
    const { moodHistory = [], journalEntries = [], breathingCount = 0, streak = 0 } = data;

    // Check recent moods for anxiety/stress
    const recentMoods = moodHistory.slice(-5).map(m => m.mood?.toLowerCase() || m.label?.toLowerCase());
    const anxietyCount = recentMoods.filter(m => m === 'anxious' || m === 'stressed').length;
    const sadCount = recentMoods.filter(m => m === 'sad').length;

    if (anxietyCount >= 2) {
      recs.push({
        icon: '🌬️',
        title: 'Try Breathing Exercises',
        description: 'We noticed you\'ve been feeling anxious. The 4-7-8 technique can help calm your nervous system.',
        action: 'quickrelief',
        priority: 'high'
      });
    }

    if (sadCount >= 2) {
      recs.push({
        icon: '📝',
        title: 'Express Your Feelings',
        description: 'Writing about your emotions can help process them. Try journaling today.',
        action: 'journal',
        priority: 'high'
      });
    }

    // Journal recommendation
    const recentJournals = journalEntries.filter(j => {
      const date = new Date(j.timestamp || j.date);
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      return date > threeDaysAgo;
    }).length;

    if (recentJournals === 0) {
      recs.push({
        icon: '✨',
        title: 'Time for Reflection',
        description: 'You haven\'t journaled in a few days. Even a few sentences can boost your mood!',
        action: 'journal',
        priority: 'medium'
      });
    }

    // Breathing recommendation
    if (breathingCount < 3) {
      recs.push({
        icon: '🧘',
        title: 'Start a Mindfulness Practice',
        description: 'Just 2 minutes of breathing exercises daily can reduce stress significantly.',
        action: 'quickrelief',
        priority: 'medium'
      });
    }

    // Streak encouragement
    if (streak >= 3 && streak < 7) {
      recs.push({
        icon: '🔥',
        title: 'Keep Your Streak Going!',
        description: `${7 - streak} more days until your first week streak! You've got this!`,
        action: 'checkin',
        priority: 'low'
      });
    }

    // Social connection
    if (moodHistory.length > 0) {
      recs.push({
        icon: '👥',
        title: 'Connect with Others',
        description: 'Sharing experiences in a support group can make you feel less alone.',
        action: 'groups',
        priority: 'low'
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 3);
  }, [data]);

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        Recommended for You
      </h3>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl border-l-4 ${
              rec.priority === 'high' ? 'bg-red-50 border-red-400' :
              rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
              'bg-blue-50 border-blue-400'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{rec.icon}</span>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm">{rec.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// 📅 MOOD CALENDAR VIEW
// ============================================

export const MoodCalendar = ({ moodHistory = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay, year, month };
  };

  const { days, firstDay, year, month } = getDaysInMonth(currentMonth);

  const getMoodForDay = (day) => {
    const dateStr = new Date(year, month, day).toDateString();
    const entry = moodHistory.find(m => {
      const entryDate = new Date(m.timestamp || m.date);
      return entryDate.toDateString() === dateStr;
    });
    return entry;
  };

  const getMoodEmoji = (mood) => {
    const moodMap = {
      happy: '😊', sad: '😢', anxious: '😰', tired: '😴',
      loved: '🥰', angry: '😡', calm: '😌', excited: '🤩'
    };
    return moodMap[mood?.toLowerCase()] || '•';
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(year, month - 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          ‹
        </button>
        <h3 className="font-bold text-gray-800">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(year, month + 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-xs text-gray-400 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for first week */}
        {[...Array(firstDay)].map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {/* Day cells */}
        {[...Array(days)].map((_, i) => {
          const day = i + 1;
          const mood = getMoodForDay(day);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          
          return (
            <div
              key={day}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                isToday ? 'ring-2 ring-purple-400' : ''
              } ${mood ? 'bg-purple-100' : 'bg-gray-50'}`}
            >
              {mood ? (
                <span className="text-lg">{getMoodEmoji(mood.mood || mood.label)}</span>
              ) : (
                <span className="text-gray-400">{day}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default {
  calculateWellnessScore,
  WellnessScoreCard,
  MoodPatternAnalysis,
  PersonalizedRecommendations,
  MoodCalendar
};
