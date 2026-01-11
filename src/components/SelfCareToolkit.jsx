// FILE: src/components/SelfCareToolkit.jsx
// 🛁 Self-Care Toolkit
// Routines, Emergency Contacts, Goals, Progress Reports

import React, { useState, useEffect } from 'react';
import {
  Heart, Plus, X, Check, Clock, Sun, Moon, Coffee, Sparkles,
  Phone, AlertCircle, Edit2, Trash2, ChevronRight, Target,
  Calendar, Star, Award, TrendingUp, Download, Share2,
  Sunrise, Sunset, CloudMoon, Droplets, Dumbbell, Book,
  Music, Bath, Apple, Pill, Dog, Users, Camera
} from 'lucide-react';

// ============================================
// 🌸 SELF-CARE ROUTINE BUILDER
// ============================================

const ROUTINE_ACTIVITIES = [
  { id: 'water', icon: '💧', name: 'Drink water', category: 'health' },
  { id: 'stretch', icon: '🧘', name: 'Stretch', category: 'health' },
  { id: 'breakfast', icon: '🍳', name: 'Healthy breakfast', category: 'health' },
  { id: 'exercise', icon: '💪', name: 'Exercise', category: 'health' },
  { id: 'meditate', icon: '🧠', name: 'Meditate', category: 'mindfulness' },
  { id: 'journal', icon: '📝', name: 'Journal', category: 'mindfulness' },
  { id: 'gratitude', icon: '🙏', name: 'Gratitude practice', category: 'mindfulness' },
  { id: 'breathe', icon: '🌬️', name: 'Breathing exercise', category: 'mindfulness' },
  { id: 'skincare', icon: '✨', name: 'Skincare routine', category: 'selfcare' },
  { id: 'shower', icon: '🚿', name: 'Shower/bath', category: 'selfcare' },
  { id: 'brush', icon: '🦷', name: 'Brush teeth', category: 'selfcare' },
  { id: 'music', icon: '🎵', name: 'Listen to music', category: 'joy' },
  { id: 'nature', icon: '🌳', name: 'Time in nature', category: 'joy' },
  { id: 'read', icon: '📚', name: 'Read a book', category: 'joy' },
  { id: 'connect', icon: '💬', name: 'Connect with someone', category: 'social' },
  { id: 'screens_off', icon: '📵', name: 'Screen-free time', category: 'rest' },
  { id: 'sleep_prep', icon: '🌙', name: 'Sleep routine', category: 'rest' },
  { id: 'meds', icon: '💊', name: 'Take medication', category: 'health' }
];

export const SelfCareRoutineBuilder = ({ userId }) => {
  const [routines, setRoutines] = useState({
    morning: [],
    evening: []
  });
  const [activeRoutine, setActiveRoutine] = useState('morning');
  const [showAddModal, setShowAddModal] = useState(false);
  const [completedToday, setCompletedToday] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`routines_${userId}`);
    if (saved) {
      setRoutines(JSON.parse(saved));
    }
    
    const today = new Date().toDateString();
    const savedCompleted = localStorage.getItem(`completed_${today}`);
    if (savedCompleted) {
      setCompletedToday(JSON.parse(savedCompleted));
    }
  }, [userId]);

  // Save routines
  useEffect(() => {
    localStorage.setItem(`routines_${userId}`, JSON.stringify(routines));
  }, [routines, userId]);

  // Save completed
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem(`completed_${today}`, JSON.stringify(completedToday));
  }, [completedToday]);

  const addToRoutine = (activity) => {
    setRoutines(prev => ({
      ...prev,
      [activeRoutine]: [...prev[activeRoutine], { ...activity, time: '' }]
    }));
    setShowAddModal(false);
  };

  const removeFromRoutine = (index) => {
    setRoutines(prev => ({
      ...prev,
      [activeRoutine]: prev[activeRoutine].filter((_, i) => i !== index)
    }));
  };

  const toggleComplete = (activityId) => {
    setCompletedToday(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const currentRoutine = routines[activeRoutine];
  const completionPercent = currentRoutine.length > 0 
    ? Math.round((currentRoutine.filter(a => completedToday.includes(a.id)).length / currentRoutine.length) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header with progress */}
      <div className={`p-4 ${activeRoutine === 'morning' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-indigo-500 to-purple-500'} text-white`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {activeRoutine === 'morning' ? <Sunrise className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            <h3 className="font-bold text-lg capitalize">{activeRoutine} Routine</h3>
          </div>
          <span className="text-2xl font-bold">{completionPercent}%</span>
        </div>
        
        {/* Progress bar */}
        <div className="bg-white/30 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Toggle buttons */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveRoutine('morning')}
          className={`flex-1 py-3 font-medium transition ${
            activeRoutine === 'morning' 
              ? 'text-orange-500 border-b-2 border-orange-500' 
              : 'text-gray-500'
          }`}
        >
          ☀️ Morning
        </button>
        <button
          onClick={() => setActiveRoutine('evening')}
          className={`flex-1 py-3 font-medium transition ${
            activeRoutine === 'evening' 
              ? 'text-purple-500 border-b-2 border-purple-500' 
              : 'text-gray-500'
          }`}
        >
          🌙 Evening
        </button>
      </div>

      {/* Routine items */}
      <div className="p-4 space-y-2">
        {currentRoutine.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Build your {activeRoutine} routine!</p>
            <p className="text-sm">Add activities that nurture you.</p>
          </div>
        ) : (
          currentRoutine.map((activity, i) => (
            <div 
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl transition ${
                completedToday.includes(activity.id) 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gray-50'
              }`}
            >
              <button
                onClick={() => toggleComplete(activity.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                  completedToday.includes(activity.id)
                    ? 'bg-green-500 text-white'
                    : 'bg-white border-2 border-gray-300'
                }`}
              >
                {completedToday.includes(activity.id) && <Check className="w-4 h-4" />}
              </button>
              
              <span className="text-2xl">{activity.icon}</span>
              
              <span className={`flex-1 ${completedToday.includes(activity.id) ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {activity.name}
              </span>
              
              <button
                onClick={() => removeFromRoutine(i)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))
        )}

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-purple-400 hover:text-purple-500 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Activity
        </button>
      </div>

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Add Activity</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              <div className="grid grid-cols-2 gap-2">
                {ROUTINE_ACTIVITIES.filter(a => !currentRoutine.some(r => r.id === a.id)).map(activity => (
                  <button
                    key={activity.id}
                    onClick={() => addToRoutine(activity)}
                    className="p-3 bg-gray-50 rounded-xl hover:bg-purple-50 hover:border-purple-200 border border-transparent transition text-left"
                  >
                    <span className="text-2xl block mb-1">{activity.icon}</span>
                    <span className="text-sm text-gray-700">{activity.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// 🆘 EMERGENCY CONTACTS MANAGER
// ============================================

export const EmergencyContacts = ({ userId }) => {
  const [contacts, setContacts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

  useEffect(() => {
    const saved = localStorage.getItem(`emergency_contacts_${userId}`);
    if (saved) {
      setContacts(JSON.parse(saved));
    } else {
      // Default crisis resources
      setContacts([
        { id: 'crisis', name: '988 Suicide & Crisis Lifeline', phone: '988', relationship: 'Crisis Line', isDefault: true },
        { id: 'text', name: 'Crisis Text Line', phone: '741741', relationship: 'Text HOME', isDefault: true }
      ]);
    }
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(`emergency_contacts_${userId}`, JSON.stringify(contacts));
  }, [contacts, userId]);

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      setContacts(prev => [...prev, { ...newContact, id: Date.now() }]);
      setNewContact({ name: '', phone: '', relationship: '' });
      setShowAddForm(false);
    }
  };

  const removeContact = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 text-white">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Emergency Contacts
        </h3>
        <p className="text-white/80 text-sm">People to reach out to when you need support</p>
      </div>

      <div className="p-4 space-y-3">
        {contacts.map(contact => (
          <div 
            key={contact.id}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              contact.isDefault ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              contact.isDefault ? 'bg-red-200' : 'bg-purple-200'
            }`}>
              <Phone className={`w-5 h-5 ${contact.isDefault ? 'text-red-600' : 'text-purple-600'}`} />
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">{contact.name}</h4>
              <p className="text-sm text-gray-500">{contact.relationship}</p>
            </div>
            
            <a
              href={`tel:${contact.phone}`}
              className={`px-4 py-2 rounded-xl font-medium ${
                contact.isDefault 
                  ? 'bg-red-500 text-white' 
                  : 'bg-purple-500 text-white'
              }`}
            >
              {contact.phone}
            </a>
            
            {!contact.isDefault && (
              <button
                onClick={() => removeContact(contact.id)}
                className="p-2 hover:bg-gray-200 rounded-full"
              >
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        ))}

        {showAddForm ? (
          <div className="p-4 bg-gray-50 rounded-xl space-y-3">
            <input
              type="text"
              placeholder="Contact name"
              value={newContact.name}
              onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-200 outline-none"
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={newContact.phone}
              onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-200 outline-none"
            />
            <input
              type="text"
              placeholder="Relationship (e.g., Mom, Therapist)"
              value={newContact.relationship}
              onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-200 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 bg-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={addContact}
                className="flex-1 py-2 bg-purple-500 text-white rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-purple-400 hover:text-purple-500 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Personal Contact
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// 🎯 GOAL SETTING SYSTEM
// ============================================

export const GoalTracker = ({ userId }) => {
  const [goals, setGoals] = useState([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', unit: 'days', deadline: '' });

  useEffect(() => {
    const saved = localStorage.getItem(`goals_${userId}`);
    if (saved) {
      setGoals(JSON.parse(saved));
    }
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(`goals_${userId}`, JSON.stringify(goals));
  }, [goals, userId]);

  const addGoal = () => {
    if (newGoal.title) {
      setGoals(prev => [...prev, {
        ...newGoal,
        id: Date.now(),
        progress: 0,
        createdAt: new Date().toISOString()
      }]);
      setNewGoal({ title: '', target: '', unit: 'days', deadline: '' });
      setShowAddGoal(false);
    }
  };

  const updateProgress = (goalId, increment) => {
    setGoals(prev => prev.map(g => 
      g.id === goalId 
        ? { ...g, progress: Math.max(0, Math.min(parseInt(g.target) || 100, g.progress + increment)) }
        : g
    ));
  };

  const deleteGoal = (goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 text-white">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Target className="w-5 h-5" />
          My Goals
        </h3>
        <p className="text-white/80 text-sm">Track your wellness goals</p>
      </div>

      <div className="p-4 space-y-4">
        {goals.map(goal => {
          const percent = goal.target ? (goal.progress / parseInt(goal.target)) * 100 : 0;
          const isComplete = percent >= 100;
          
          return (
            <div 
              key={goal.id}
              className={`p-4 rounded-xl ${isComplete ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isComplete && <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />}
                  <h4 className={`font-bold ${isComplete ? 'text-green-700' : 'text-gray-800'}`}>
                    {goal.title}
                  </h4>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-1 hover:bg-gray-200 rounded-full"
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-purple-500'}`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {goal.progress}/{goal.target} {goal.unit}
                </span>
              </div>

              {!isComplete && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateProgress(goal.id, -1)}
                    className="px-3 py-1 bg-gray-200 rounded-lg text-sm"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => updateProgress(goal.id, 1)}
                    className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => updateProgress(goal.id, 5)}
                    className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm"
                  >
                    +5
                  </button>
                </div>
              )}

              {goal.deadline && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Due: {new Date(goal.deadline).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Set your first wellness goal!</p>
          </div>
        )}

        {showAddGoal ? (
          <div className="p-4 bg-gray-50 rounded-xl space-y-3">
            <input
              type="text"
              placeholder="Goal title (e.g., Journal every day)"
              value={newGoal.title}
              onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-200 outline-none"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Target"
                value={newGoal.target}
                onChange={(e) => setNewGoal(prev => ({ ...prev, target: e.target.value }))}
                className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-200 outline-none"
              />
              <select
                value={newGoal.unit}
                onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-200 outline-none"
              >
                <option value="days">days</option>
                <option value="times">times</option>
                <option value="minutes">minutes</option>
                <option value="entries">entries</option>
              </select>
            </div>
            <input
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-200 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddGoal(false)}
                className="flex-1 py-2 bg-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={addGoal}
                className="flex-1 py-2 bg-green-500 text-white rounded-xl"
              >
                Create Goal
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddGoal(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-green-400 hover:text-green-500 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Goal
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// 📊 PROGRESS REPORT GENERATOR
// ============================================

export const ProgressReport = ({ data, userName }) => {
  const [showReport, setShowReport] = useState(false);

  const generateReport = () => {
    const { moodHistory = [], journalEntries = [], streak = 0, breathingCount = 0 } = data;
    
    // Calculate stats
    const last30Days = moodHistory.filter(m => {
      const date = new Date(m.timestamp || m.date);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return date > monthAgo;
    });

    const moodCounts = last30Days.reduce((acc, m) => {
      const mood = m.mood?.toLowerCase() || m.label?.toLowerCase();
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      period: '30 Days',
      totalCheckIns: last30Days.length,
      journalEntries: journalEntries.length,
      breathingExercises: breathingCount,
      currentStreak: streak,
      topMood: topMood ? { mood: topMood[0], count: topMood[1] } : null,
      generatedAt: new Date().toLocaleString()
    };
  };

  const report = showReport ? generateReport() : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Progress Report
        </h3>
        <p className="text-white/80 text-sm">Track your wellness journey</p>
      </div>

      <div className="p-4">
        {showReport && report ? (
          <div className="space-y-4">
            <div className="text-center py-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-1">{userName}'s Progress</h4>
              <p className="text-sm text-gray-500">Last {report.period}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{report.totalCheckIns}</p>
                <p className="text-xs text-blue-800">Mood Check-ins</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{report.journalEntries}</p>
                <p className="text-xs text-purple-800">Journal Entries</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{report.breathingExercises}</p>
                <p className="text-xs text-green-800">Breathing Exercises</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">{report.currentStreak}</p>
                <p className="text-xs text-orange-800">Day Streak 🔥</p>
              </div>
            </div>

            {report.topMood && (
              <div className="bg-yellow-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Most Common Mood</p>
                <p className="text-xl font-bold text-gray-800 capitalize">
                  {report.topMood.mood} ({report.topMood.count} times)
                </p>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center">
              Generated: {report.generatedAt}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowReport(false)}
                className="flex-1 py-2 bg-gray-200 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Could implement actual sharing
                  alert('Report would be shared/downloaded');
                }}
                className="flex-1 py-2 bg-blue-500 text-white rounded-xl flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowReport(true)}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Award className="w-5 h-5" />
            Generate My Report
          </button>
        )}
      </div>
    </div>
  );
};

export default {
  SelfCareRoutineBuilder,
  EmergencyContacts,
  GoalTracker,
  ProgressReport
};
