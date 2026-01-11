// FILE: src/enterprise/SessionNotes.jsx
// 📝 Professional Therapist Session Notes
// Real-time note-taking during patient sessions

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X, Save, Clock, User, FileText, Plus, Check, ChevronDown,
  ChevronRight, MessageSquare, Smile, AlertTriangle, Calendar,
  Clipboard, Send, Mic, MicOff, Trash2, Edit3, History,
  CheckCircle, XCircle, PauseCircle, PlayCircle, Timer,
  Sparkles, Brain, Heart, Zap, Moon, Coffee
} from 'lucide-react';
import {
  SESSION_TYPES,
  SESSION_TEMPLATES,
  QUICK_NOTES,
  createSession,
  updateSession,
  completeSession,
  getMemberSessions
} from '../services/sessionService';

// ============================================
// 🎯 MAIN SESSION NOTES COMPONENT
// ============================================

const SessionNotes = ({ 
  organizationId, 
  therapistId, 
  member, 
  onClose, 
  existingSessionId = null 
}) => {
  // Session state
  const [sessionId, setSessionId] = useState(existingSessionId);
  const [sessionType, setSessionType] = useState(SESSION_TYPES.FOLLOW_UP);
  const [status, setStatus] = useState('in_progress');
  const [startTime] = useState(new Date());
  
  // Notes state
  const [structuredNotes, setStructuredNotes] = useState({});
  const [freeformNotes, setFreeformNotes] = useState('');
  const [selectedQuickNotes, setSelectedQuickNotes] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [newActionItem, setNewActionItem] = useState('');
  
  // Patient state
  const [moodStart, setMoodStart] = useState(null);
  const [moodEnd, setMoodEnd] = useState(null);
  const [nextSessionDate, setNextSessionDate] = useState('');
  
  // UI state
  const [activeTab, setActiveTab] = useState('notes');
  const [expandedSections, setExpandedSections] = useState(['check_in', 'discussion']);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const autoSaveRef = useRef(null);
  const template = SESSION_TEMPLATES[sessionType];

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((new Date() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Auto-save every 30 seconds
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      if (sessionId && status === 'in_progress') {
        handleAutoSave();
      }
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [sessionId, structuredNotes, freeformNotes, selectedQuickNotes]);

  // Create session on mount if new
  useEffect(() => {
    if (!existingSessionId) {
      initializeSession();
    }
    loadSessionHistory();
  }, []);

  const initializeSession = async () => {
    const result = await createSession(organizationId, therapistId, member.id, {
      type: sessionType,
      patientMoodStart: moodStart
    });
    if (result.success) {
      setSessionId(result.sessionId);
    }
  };

  const loadSessionHistory = async () => {
    const history = await getMemberSessions(organizationId, member.id, 10);
    setSessionHistory(history);
  };

  const handleAutoSave = async () => {
    if (!sessionId) return;
    
    setIsSaving(true);
    await updateSession(organizationId, sessionId, {
      notes: structuredNotes,
      freeformNotes,
      quickNotes: selectedQuickNotes,
      actionItems,
      patientMoodStart: moodStart,
      nextSessionDate: nextSessionDate || null
    });
    setLastSaved(new Date());
    setIsSaving(false);
  };

  const handleComplete = async (summary = '') => {
    setIsSaving(true);
    const result = await completeSession(organizationId, sessionId, therapistId, {
      patientMoodEnd: moodEnd,
      summary,
      notes: structuredNotes,
      freeformNotes,
      quickNotes: selectedQuickNotes,
      actionItems,
      nextSessionDate: nextSessionDate || null
    });
    
    if (result.success) {
      setStatus('completed');
      onClose?.({ completed: true, duration: result.duration });
    }
    setIsSaving(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleQuickNote = (noteId) => {
    setSelectedQuickNotes(prev =>
      prev.includes(noteId)
        ? prev.filter(n => n !== noteId)
        : [...prev, noteId]
    );
  };

  const addActionItem = () => {
    if (newActionItem.trim()) {
      setActionItems(prev => [...prev, { 
        id: Date.now(), 
        text: newActionItem.trim(), 
        completed: false 
      }]);
      setNewActionItem('');
    }
  };

  const toggleActionItem = (id) => {
    setActionItems(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const removeActionItem = (id) => {
    setActionItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onClose?.({ completed: false })}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-800">{member.name || member.username}</h1>
                  <p className="text-sm text-gray-500">Session in Progress</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-xl">
                <Timer className="w-5 h-5 text-purple-600" />
                <span className="font-mono font-bold text-purple-700">{formatTime(elapsedTime)}</span>
              </div>

              {/* Save status */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </>
                ) : (
                  <span>Auto-save enabled</span>
                )}
              </div>

              {/* Complete button */}
              <button
                onClick={() => setShowCompleteModal(true)}
                className="px-6 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Complete Session
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Session Type Selector */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {Object.entries(SESSION_TEMPLATES).map(([type, tmpl]) => (
              <button
                key={type}
                onClick={() => setSessionType(type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition ${
                  sessionType === type
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tmpl.icon}</span>
                <span className="text-sm font-medium">{tmpl.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-6xl mx-auto h-full flex">
          {/* Left: Notes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Patient Mood Start */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Smile className="w-5 h-5 text-yellow-500" />
                Patient Mood at Start
              </h3>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 1, emoji: '😢', label: 'Very Low' },
                  { value: 2, emoji: '😔', label: 'Low' },
                  { value: 3, emoji: '😐', label: 'Neutral' },
                  { value: 4, emoji: '🙂', label: 'Good' },
                  { value: 5, emoji: '😊', label: 'Great' }
                ].map(mood => (
                  <button
                    key={mood.value}
                    onClick={() => setMoodStart(mood.value)}
                    className={`flex flex-col items-center p-3 rounded-xl transition ${
                      moodStart === mood.value
                        ? 'bg-purple-100 ring-2 ring-purple-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-xs text-gray-600 mt-1">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Structured Notes */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Clipboard className="w-5 h-5 text-purple-500" />
                  Session Notes
                </h3>
              </div>
              
              <div className="divide-y">
                {template.sections.map(section => (
                  <div key={section.id} className="border-b last:border-b-0">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-700">{section.label}</span>
                      {expandedSections.includes(section.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedSections.includes(section.id) && (
                      <div className="px-4 pb-4">
                        <textarea
                          value={structuredNotes[section.id] || ''}
                          onChange={(e) => setStructuredNotes(prev => ({
                            ...prev,
                            [section.id]: e.target.value
                          }))}
                          placeholder={section.placeholder}
                          className="w-full p-3 border rounded-xl resize-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
                          rows={4}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Freeform Notes */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-500" />
                Additional Notes
              </h3>
              <textarea
                value={freeformNotes}
                onChange={(e) => setFreeformNotes(e.target.value)}
                placeholder="Type any additional observations, thoughts, or notes here..."
                className="w-full p-4 border rounded-xl resize-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none min-h-[150px]"
              />
            </div>
          </div>

          {/* Right: Quick Actions & History */}
          <div className="w-80 border-l bg-white overflow-y-auto">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-3 text-sm font-medium transition ${
                  activeTab === 'notes'
                    ? 'text-purple-600 border-b-2 border-purple-500'
                    : 'text-gray-500'
                }`}
              >
                Quick Notes
              </button>
              <button
                onClick={() => setActiveTab('actions')}
                className={`flex-1 py-3 text-sm font-medium transition ${
                  activeTab === 'actions'
                    ? 'text-purple-600 border-b-2 border-purple-500'
                    : 'text-gray-500'
                }`}
              >
                Action Items
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-sm font-medium transition ${
                  activeTab === 'history'
                    ? 'text-purple-600 border-b-2 border-purple-500'
                    : 'text-gray-500'
                }`}
              >
                History
              </button>
            </div>

            <div className="p-4">
              {/* Quick Notes Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 mb-3">Tap to add quick notes:</p>
                  {QUICK_NOTES.map(note => (
                    <button
                      key={note.id}
                      onClick={() => toggleQuickNote(note.id)}
                      className={`w-full p-3 rounded-xl text-left text-sm transition ${
                        selectedQuickNotes.includes(note.id)
                          ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {selectedQuickNotes.includes(note.id) && (
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        )}
                        <span>{note.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Action Items Tab */}
              {activeTab === 'actions' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Homework & follow-ups:</p>
                  
                  {/* Add new */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newActionItem}
                      onChange={(e) => setNewActionItem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addActionItem()}
                      placeholder="Add action item..."
                      className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
                    />
                    <button
                      onClick={addActionItem}
                      className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Action items list */}
                  <div className="space-y-2">
                    {actionItems.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-2 p-3 rounded-xl ${
                          item.completed ? 'bg-green-50' : 'bg-gray-50'
                        }`}
                      >
                        <button
                          onClick={() => toggleActionItem(item.id)}
                          className={`mt-0.5 ${item.completed ? 'text-green-500' : 'text-gray-400'}`}
                        >
                          {item.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <div className="w-5 h-5 border-2 rounded-full" />
                          )}
                        </button>
                        <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {item.text}
                        </span>
                        <button
                          onClick={() => removeActionItem(item.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Next session */}
                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Session Date
                    </label>
                    <input
                      type="datetime-local"
                      value={nextSessionDate}
                      onChange={(e) => setNextSessionDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Previous sessions:</p>
                  
                  {sessionHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <History className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No previous sessions</p>
                    </div>
                  ) : (
                    sessionHistory.map(session => (
                      <div
                        key={session.id}
                        className="p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800">
                            {SESSION_TEMPLATES[session.type]?.icon} {SESSION_TEMPLATES[session.type]?.name || session.type}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            session.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {session.createdAt?.toDate?.().toLocaleDateString() || 'Unknown date'}
                          {session.duration && ` • ${session.duration} min`}
                        </p>
                        {session.summary && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            {session.summary}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Complete Session Modal */}
      {showCompleteModal && (
        <CompleteSessionModal
          moodEnd={moodEnd}
          setMoodEnd={setMoodEnd}
          elapsedTime={elapsedTime}
          onComplete={handleComplete}
          onCancel={() => setShowCompleteModal(false)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

// ============================================
// ✅ COMPLETE SESSION MODAL
// ============================================

const CompleteSessionModal = ({ 
  moodEnd, 
  setMoodEnd, 
  elapsedTime, 
  onComplete, 
  onCancel,
  isSaving 
}) => {
  const [summary, setSummary] = useState('');

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle className="w-6 h-6" />
            Complete Session
          </h2>
          <p className="text-white/80 mt-1">Duration: {formatDuration(elapsedTime)}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Mood End */}
          <div>
            <label className="block font-medium text-gray-700 mb-3">
              Patient Mood at End of Session
            </label>
            <div className="flex gap-2 justify-center">
              {[
                { value: 1, emoji: '😢', label: 'Very Low' },
                { value: 2, emoji: '😔', label: 'Low' },
                { value: 3, emoji: '😐', label: 'Neutral' },
                { value: 4, emoji: '🙂', label: 'Good' },
                { value: 5, emoji: '😊', label: 'Great' }
              ].map(mood => (
                <button
                  key={mood.value}
                  onClick={() => setMoodEnd(mood.value)}
                  className={`flex flex-col items-center p-3 rounded-xl transition ${
                    moodEnd === mood.value
                      ? 'bg-green-100 ring-2 ring-green-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs text-gray-600 mt-1">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Session Summary */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Session Summary (Optional)
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary of the session..."
              className="w-full p-3 border rounded-xl resize-none focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
              rows={3}
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onComplete(summary)}
            disabled={isSaving}
            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Complete & Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 🚀 START SESSION BUTTON (For TherapistDashboard)
// ============================================

export const StartSessionButton = ({ member, onClick, className = '' }) => (
  <button
    onClick={() => onClick(member)}
    className={`flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition ${className}`}
  >
    <FileText className="w-4 h-4" />
    Start Session
  </button>
);

export default SessionNotes;
