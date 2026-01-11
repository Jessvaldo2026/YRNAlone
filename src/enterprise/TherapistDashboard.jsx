// FILE: src/enterprise/TherapistDashboard.jsx
// 👨‍⚕️ PROFESSIONAL Therapist Dashboard - Complete Practice Management
// Features: Profile, Patient Management, Session Notes, Templates, Calendar, Themes

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageCircle, AlertTriangle, Calendar, FileText,
  Bell, Search, ChevronRight, Clock, Send, Plus, Check, X,
  Activity, RefreshCw, ClipboardList, User, Camera, Settings, 
  Palette, Edit3, Trash2, CalendarDays, AlarmClock, CheckCircle, 
  GraduationCap, Download, Copy, Eye, Sparkles, Heart, Star,
  Layout, Save, FolderPlus, FileDown
} from 'lucide-react';
import { db } from '../firebase';
import { 
  doc, getDoc, updateDoc, collection, query, where, 
  getDocs, addDoc, deleteDoc, orderBy, serverTimestamp
} from 'firebase/firestore';

// Import services
import { getTherapistAccessibleMembers } from '../services/progressSharingService';
import { getTherapistConversations, sendTemplateMessage } from '../services/messagingService';
import { getOrgAlerts, acknowledgeAlert } from '../services/crisisService';
import { getTherapistInterventions, createIntervention, INTERVENTION_TYPES } from '../services/interventionService';
import { getTherapistScheduledCheckins } from '../services/scheduledCheckinsService';
import { 
  getTodaysSessions, getTherapistSessionStats, SESSION_TEMPLATES, SESSION_TYPES,
  NOTE_THEMES, QUICK_NOTES, getCustomTemplates, createCustomTemplate, 
  deleteCustomTemplate, downloadSessionNotes, exportAllPatientSessions
} from '../services/sessionService';

import SessionNotes from './SessionNotes';

// ============================================
// 🎨 THERAPIST DASHBOARD THEMES (Cute like main app!)
// ============================================
const DASHBOARD_THEMES = {
  professional: { name: 'Professional', emoji: '💼', bg: 'bg-gradient-to-br from-slate-50 to-gray-100', card: 'bg-white', text: 'text-gray-800', accent: 'purple', highlight: 'bg-blue-500' },
  calm: { name: 'Calm & Serene', emoji: '🌿', bg: 'bg-gradient-to-br from-green-50 to-teal-50', card: 'bg-white/90 backdrop-blur', text: 'text-green-900', accent: 'green', highlight: 'bg-green-500' },
  modern: { name: 'Modern Dark', emoji: '🌙', bg: 'bg-gradient-to-br from-slate-900 to-gray-900', card: 'bg-slate-800/90 border border-slate-700', text: 'text-white', accent: 'purple', highlight: 'bg-purple-500' },
  warm: { name: 'Warm & Friendly', emoji: '☀️', bg: 'bg-gradient-to-br from-orange-50 to-amber-50', card: 'bg-white/90 backdrop-blur', text: 'text-orange-900', accent: 'orange', highlight: 'bg-orange-500' },
  lavender: { name: 'Lavender Dreams', emoji: '💜', bg: 'bg-gradient-to-br from-purple-50 to-pink-50', card: 'bg-white/90 backdrop-blur', text: 'text-purple-900', accent: 'purple', highlight: 'bg-purple-500' },
  ocean: { name: 'Ocean Breeze', emoji: '🌊', bg: 'bg-gradient-to-br from-cyan-50 to-blue-50', card: 'bg-white/90 backdrop-blur', text: 'text-cyan-900', accent: 'cyan', highlight: 'bg-cyan-500' },
  rose: { name: 'Rose Garden', emoji: '🌸', bg: 'bg-gradient-to-br from-rose-50 to-pink-50', card: 'bg-white/90 backdrop-blur', text: 'text-rose-900', accent: 'rose', highlight: 'bg-rose-500' }
};

// ============================================
// 🎯 MAIN THERAPIST DASHBOARD
// ============================================
const TherapistDashboard = ({ organizationId, therapistId, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(DASHBOARD_THEMES.professional);
  const [themeName, setThemeName] = useState('professional');
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: '', title: '', email: '', phone: '', bio: '',
    credentials: '', specialties: [], yearsExperience: '', profilePicture: null
  });
  
  // Data states
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [scheduledCheckins, setScheduledCheckins] = useState([]);
  
  // Session Notes state
  const [sessionNotes, setSessionNotes] = useState([]);
  const [notesSearchQuery, setNotesSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  
  // 📋 TEMPLATE STATES
  const [customTemplates, setCustomTemplates] = useState({});
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '', icon: '📝', sections: [{ id: 'section_1', label: '', placeholder: '' }]
  });
  const [selectedNoteTheme, setSelectedNoteTheme] = useState('professional');
  
  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '', patientId: '', patientName: '', date: '', time: '',
    duration: 60, type: 'session', notes: '', reminder: true
  });
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [todaysSessions, setTodaysSessions] = useState([]);
  const [sessionStats, setSessionStats] = useState(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [showQuickAction, setShowQuickAction] = useState(null);
  const [patientAlertSettings, setPatientAlertSettings] = useState({});

  const fileInputRef = useRef(null);

  // ============================================
  // 📊 LOAD ALL DATA
  // ============================================
  useEffect(() => { loadDashboardData(); }, [organizationId, therapistId]);

  // Search notes
  useEffect(() => {
    if (notesSearchQuery.trim()) {
      const q = notesSearchQuery.toLowerCase();
      const filtered = sessionNotes.filter(note => 
        note.patientName?.toLowerCase().includes(q) ||
        note.content?.toLowerCase().includes(q) ||
        note.summary?.toLowerCase().includes(q)
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(sessionNotes);
    }
  }, [notesSearchQuery, sessionNotes]);

  // Check reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const upcoming = calendarEvents.filter(event => {
        if (!event.reminder) return false;
        const eventTime = new Date(event.date + 'T' + event.time);
        const timeDiff = eventTime - now;
        return timeDiff > 0 && timeDiff <= 30 * 60 * 1000;
      });
      setUpcomingReminders(upcoming);
    };
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [calendarEvents]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Get therapist info
      const therapistDoc = await getDoc(doc(db, 'organizations', organizationId, 'therapists', therapistId));
      const therapistData = therapistDoc.data() || {};
      setTherapist(therapistData);
      setProfileData({
        name: therapistData.name || '', title: therapistData.title || 'Licensed Therapist',
        email: therapistData.email || '', phone: therapistData.phone || '',
        bio: therapistData.bio || '', credentials: therapistData.credentials || '',
        specialties: therapistData.specialties || [], yearsExperience: therapistData.yearsExperience || '',
        profilePicture: therapistData.profilePicture || null
      });
      
      if (therapistData.patientAlertSettings) setPatientAlertSettings(therapistData.patientAlertSettings);
      if (therapistData.dashboardTheme) {
        setThemeName(therapistData.dashboardTheme);
        setCurrentTheme(DASHBOARD_THEMES[therapistData.dashboardTheme] || DASHBOARD_THEMES.professional);
      }
      if (therapistData.noteTheme) setSelectedNoteTheme(therapistData.noteTheme);

      // Get assigned members
      const members = await getTherapistAccessibleMembers(organizationId, therapistId);
      const enrichedMembers = await Promise.all(members.map(async (m) => {
        const memberDoc = await getDoc(doc(db, 'users', m.memberId));
        return { ...m, ...memberDoc.data() };
      }));
      setAssignedMembers(enrichedMembers);
      
      // Get all patients assigned to this therapist
      try {
        const patientsQuery = query(collection(db, 'users'), where('assignedTherapistId', '==', therapistId));
        const patientsSnap = await getDocs(patientsQuery);
        const patientsList = [];
        patientsSnap.forEach(doc => patientsList.push({ id: doc.id, ...doc.data() }));
        setAllPatients(patientsList);
      } catch (err) { console.log('Patients query:', err); }

      // Get alerts, conversations, interventions, checkins
      const allAlerts = await getOrgAlerts(organizationId);
      setAlerts(allAlerts.filter(a => a.assignedTherapistId === therapistId || enrichedMembers.some(m => m.memberId === a.memberId)));
      const convs = await getTherapistConversations(organizationId, therapistId);
      setConversations(convs);
      const interventionList = await getTherapistInterventions(organizationId, therapistId, 30);
      setInterventions(interventionList);
      const checkins = await getTherapistScheduledCheckins(organizationId, therapistId);
      setScheduledCheckins(checkins);

      // Get sessions
      const todaySess = await getTodaysSessions(organizationId, therapistId);
      setTodaysSessions(todaySess);
      const stats = await getTherapistSessionStats(organizationId, therapistId, 30);
      setSessionStats(stats);

      // Load session notes
      try {
        const notesQuery = query(
          collection(db, 'organizations', organizationId, 'sessionNotes'),
          where('therapistId', '==', therapistId),
          orderBy('createdAt', 'desc')
        );
        const notesSnap = await getDocs(notesQuery);
        const notesList = [];
        notesSnap.forEach(doc => {
          const data = doc.data();
          notesList.push({ id: doc.id, ...data, createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) });
        });
        setSessionNotes(notesList);
        setFilteredNotes(notesList);
      } catch (err) { console.log('Notes loading:', err); }

      // Load calendar events
      try {
        const eventsQuery = query(
          collection(db, 'organizations', organizationId, 'calendarEvents'),
          where('therapistId', '==', therapistId),
          orderBy('date', 'asc')
        );
        const eventsSnap = await getDocs(eventsQuery);
        const eventsList = [];
        eventsSnap.forEach(doc => eventsList.push({ id: doc.id, ...doc.data() }));
        setCalendarEvents(eventsList);
      } catch (err) { console.log('Calendar loading:', err); }

      // Load custom templates
      const templates = await getCustomTemplates(organizationId, therapistId);
      setCustomTemplates(templates);

    } catch (error) {
      console.error('Error loading therapist dashboard:', error);
    }
    setLoading(false);
  };

  // ============================================
  // 💾 SAVE FUNCTIONS
  // ============================================
  const saveProfile = async () => {
    try {
      await updateDoc(doc(db, 'organizations', organizationId, 'therapists', therapistId), {
        ...profileData, updatedAt: serverTimestamp()
      });
      setTherapist(prev => ({ ...prev, ...profileData }));
      alert('✅ Profile saved successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Error saving profile. Please try again.');
    }
  };

  const changeTheme = async (newThemeName) => {
    setThemeName(newThemeName);
    setCurrentTheme(DASHBOARD_THEMES[newThemeName]);
    setShowThemeSelector(false);
    try {
      await updateDoc(doc(db, 'organizations', organizationId, 'therapists', therapistId), { dashboardTheme: newThemeName });
    } catch (err) { console.log('Theme save error:', err); }
  };

  const changeNoteTheme = async (theme) => {
    setSelectedNoteTheme(theme);
    try {
      await updateDoc(doc(db, 'organizations', organizationId, 'therapists', therapistId), { noteTheme: theme });
    } catch (err) { console.log('Note theme save error:', err); }
  };

  const uploadProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setProfileData(prev => ({ ...prev, profilePicture: event.target.result }));
    reader.readAsDataURL(file);
  };

  // Calendar
  const addCalendarEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      alert('Please fill in title, date, and time');
      return;
    }
    try {
      const eventData = { ...newEvent, therapistId, createdAt: serverTimestamp() };
      const docRef = await addDoc(collection(db, 'organizations', organizationId, 'calendarEvents'), eventData);
      setCalendarEvents(prev => [...prev, { id: docRef.id, ...eventData }]);
      setShowAddEvent(false);
      setNewEvent({ title: '', patientId: '', patientName: '', date: '', time: '', duration: 60, type: 'session', notes: '', reminder: true });
      alert('✅ Session scheduled!');
    } catch (err) { console.error('Error adding event:', err); }
  };

  const deleteCalendarEvent = async (eventId) => {
    if (!window.confirm('Delete this scheduled session?')) return;
    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'calendarEvents', eventId));
      setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err) { console.error('Error deleting event:', err); }
  };

  // Alerts
  const togglePatientAlert = async (patientId, enabled) => {
    try {
      const newSettings = { ...patientAlertSettings, [patientId]: { ...patientAlertSettings[patientId], alertEnabled: enabled } };
      setPatientAlertSettings(newSettings);
      await updateDoc(doc(db, 'organizations', organizationId, 'therapists', therapistId), {
        [`patientAlertSettings.${patientId}.alertEnabled`]: enabled
      });
    } catch (err) { console.log('Error toggling alert:', err); }
  };

  const updatePatientNotes = async (patientId, notes) => {
    try {
      const newSettings = { ...patientAlertSettings, [patientId]: { ...patientAlertSettings[patientId], notes } };
      setPatientAlertSettings(newSettings);
      await updateDoc(doc(db, 'organizations', organizationId, 'therapists', therapistId), {
        [`patientAlertSettings.${patientId}.notes`]: notes
      });
    } catch (err) { console.log('Error updating notes:', err); }
  };

  // Messages & Interventions
  const handleQuickMessage = async (member, templateKey) => {
    try {
      await sendTemplateMessage(organizationId, null, templateKey, therapist, member);
      setShowQuickAction(null);
      loadDashboardData();
    } catch (error) { console.error('Error sending message:', error); }
  };

  const handleLogIntervention = async (member, type, notes) => {
    try {
      await createIntervention(organizationId, {
        memberId: member.id || member.memberId,
        memberName: member.name || member.username,
        therapistId, therapistName: therapist?.name, type, notes
      });
      setShowQuickAction(null);
      loadDashboardData();
    } catch (error) { console.error('Error logging intervention:', error); }
  };

  // ============================================
  // 📋 TEMPLATE MANAGEMENT
  // ============================================
  const saveCustomTemplate = async () => {
    if (!newTemplate.name || newTemplate.sections.length === 0) {
      alert('Please provide a template name and at least one section');
      return;
    }
    try {
      const result = await createCustomTemplate(organizationId, therapistId, newTemplate);
      if (result.success) {
        setCustomTemplates(prev => ({ ...prev, [result.id]: { id: result.id, ...newTemplate } }));
        setShowTemplateManager(false);
        setNewTemplate({ name: '', icon: '📝', sections: [{ id: 'section_1', label: '', placeholder: '' }] });
        alert('✅ Template saved!');
      }
    } catch (err) {
      console.error('Error saving template:', err);
    }
  };

  const removeCustomTemplate = async (templateId) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await deleteCustomTemplate(organizationId, templateId);
      setCustomTemplates(prev => {
        const updated = { ...prev };
        delete updated[templateId];
        return updated;
      });
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const addTemplateSection = () => {
    setNewTemplate(prev => ({
      ...prev,
      sections: [...prev.sections, { id: `section_${Date.now()}`, label: '', placeholder: '' }]
    }));
  };

  const updateTemplateSection = (index, field, value) => {
    setNewTemplate(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const removeTemplateSection = (index) => {
    if (newTemplate.sections.length <= 1) return;
    setNewTemplate(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  // ============================================
  // 📊 STATS
  // ============================================
  const stats = {
    totalPatients: assignedMembers.length + allPatients.length,
    activeAlerts: alerts.filter(a => a.status === 'new').length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length,
    unreadMessages: conversations.reduce((sum, c) => sum + (c.unreadByTherapist || 0), 0),
    totalNotes: sessionNotes.length,
    scheduledToday: calendarEvents.filter(e => e.date === new Date().toISOString().split('T')[0]).length,
    customTemplates: Object.keys(customTemplates).length
  };

  // Session handlers
  const handleStartSession = (member) => {
    setActiveSession({ id: member.id || member.memberId, name: member.name || member.username, email: member.email, ...member });
  };

  const handleSessionClose = (result) => {
    setActiveSession(null);
    if (result?.completed) loadDashboardData();
  };

  // If active session, show SessionNotes
  if (activeSession) {
    return <SessionNotes organizationId={organizationId} therapistId={therapistId} member={activeSession} onClose={handleSessionClose} />;
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${currentTheme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={currentTheme.text}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} pb-20`}>
      {/* Reminder Banner */}
      {upcomingReminders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <AlarmClock className="w-5 h-5 animate-bounce" />
            <span className="font-medium">Upcoming: {upcomingReminders[0].title} with {upcomingReminders[0].patientName} at {upcomingReminders[0].time}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`${currentTheme.card} border-b shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5 rotate-180" /></button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  {profileData.profilePicture ? (
                    <img src={profileData.profilePicture} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-purple-500" />
                  ) : (
                    <div className={`w-12 h-12 ${currentTheme.highlight} rounded-full flex items-center justify-center text-white font-bold text-lg`}>{(profileData.name || 'T')[0]}</div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${currentTheme.text}`}>Dr. {profileData.name || 'Therapist'}</h1>
                  <p className="text-sm text-gray-500">{profileData.title || 'Licensed Therapist'} • {stats.totalPatients} patients</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Theme Selector */}
              <div className="relative">
                <button onClick={() => setShowThemeSelector(!showThemeSelector)} className="p-2 hover:bg-gray-100 rounded-lg" title="Change Theme"><Palette className="w-5 h-5 text-gray-600" /></button>
                {showThemeSelector && (
                  <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border p-3 w-52 z-50">
                    <p className="text-xs text-gray-500 mb-2 font-medium">🎨 Dashboard Theme</p>
                    {Object.entries(DASHBOARD_THEMES).map(([key, theme]) => (
                      <button key={key} onClick={() => changeTheme(key)} className={`w-full flex items-center gap-2 p-2 rounded-lg text-left ${themeName === key ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}>
                        <span>{theme.emoji}</span><span className="text-sm">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={loadDashboardData} className="p-2 hover:bg-gray-100 rounded-lg" title="Refresh"><RefreshCw className="w-5 h-5 text-gray-600" /></button>
              {stats.criticalAlerts > 0 && (
                <button onClick={() => setActiveTab('alerts')} className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg animate-pulse">
                  <AlertTriangle className="w-4 h-4" />{stats.criticalAlerts} Critical
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 -mb-px overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'patients', label: 'My Patients', icon: Users, badge: stats.totalPatients },
              { id: 'calendar', label: 'Calendar', icon: CalendarDays, badge: stats.scheduledToday },
              { id: 'notes', label: 'Session Notes', icon: FileText, badge: stats.totalNotes },
              { id: 'templates', label: 'Templates', icon: Layout, badge: stats.customTemplates },
              { id: 'alerts', label: 'Alerts', icon: Bell, badge: stats.activeAlerts },
              { id: 'messages', label: 'Messages', icon: MessageCircle, badge: stats.unreadMessages },
              { id: 'profile', label: 'My Profile', icon: User }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${activeTab === tab.id ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
                {tab.badge > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab.id === 'alerts' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>{tab.badge}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} color="purple" theme={currentTheme} />
              <StatCard icon={CalendarDays} label="Today's Sessions" value={stats.scheduledToday} color="blue" theme={currentTheme} />
              <StatCard icon={FileText} label="Session Notes" value={stats.totalNotes} color="green" theme={currentTheme} />
              <StatCard icon={Layout} label="My Templates" value={stats.customTemplates + Object.keys(SESSION_TEMPLATES).length} color="orange" theme={currentTheme} />
            </div>

            {stats.criticalAlerts > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div className="flex-1">
                    <h3 className="font-bold text-red-800">{stats.criticalAlerts} Critical Alert{stats.criticalAlerts > 1 ? 's' : ''}</h3>
                    <p className="text-sm text-red-700">Patients need immediate support.</p>
                  </div>
                  <button onClick={() => setActiveTab('alerts')} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">View</button>
                </div>
              </div>
            )}

            {/* Today's Schedule */}
            <div className={`${currentTheme.card} rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold ${currentTheme.text}`}>📅 Today's Schedule</h3>
                <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="space-y-3">
                {calendarEvents.filter(e => e.date === new Date().toISOString().split('T')[0]).sort((a, b) => a.time.localeCompare(b.time)).map(event => (
                  <div key={event.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="text-center"><p className="text-lg font-bold text-purple-600">{event.time}</p><p className="text-xs text-gray-500">{event.duration} min</p></div>
                    <div className="flex-1"><p className="font-medium text-gray-800">{event.title}</p><p className="text-sm text-gray-500">with {event.patientName || 'Patient'}</p></div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.type === 'session' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{event.type}</span>
                  </div>
                ))}
                {calendarEvents.filter(e => e.date === new Date().toISOString().split('T')[0]).length === 0 && (
                  <p className="text-center text-gray-500 py-4">No sessions scheduled for today</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`${currentTheme.card} rounded-2xl p-6 shadow-sm`}>
              <h3 className={`font-bold ${currentTheme.text} mb-4`}>Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickActionButton icon={Plus} label="New Session" color="purple" onClick={() => setActiveTab('patients')} />
                <QuickActionButton icon={CalendarDays} label="Schedule" color="blue" onClick={() => setActiveTab('calendar')} />
                <QuickActionButton icon={Layout} label="Templates" color="green" onClick={() => setActiveTab('templates')} />
                <QuickActionButton icon={Download} label="Export Notes" color="orange" onClick={() => setActiveTab('notes')} />
              </div>
            </div>
          </div>
        )}

        {/* PATIENTS TAB */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search patients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 border rounded-xl focus:border-purple-400 focus:outline-none" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...assignedMembers, ...allPatients].filter(m => !searchQuery || (m.name || m.username || '').toLowerCase().includes(searchQuery.toLowerCase())).map((member, idx) => (
                <PatientCard 
                  key={member.id || member.memberId || idx} 
                  member={member} theme={currentTheme} 
                  onStartSession={() => handleStartSession(member)} 
                  onSchedule={() => { setNewEvent(prev => ({ ...prev, patientId: member.id || member.memberId, patientName: member.name || member.username })); setShowAddEvent(true); }} 
                  onMessage={() => setShowQuickAction({ type: 'message', member })}
                  alertSettings={patientAlertSettings[member.id || member.memberId]}
                  onToggleAlert={togglePatientAlert}
                  onUpdateNotes={updatePatientNotes}
                  onExportNotes={() => exportAllPatientSessions(organizationId, member.id || member.memberId, member.name || member.username, profileData.name)}
                />
              ))}
            </div>
            {assignedMembers.length === 0 && allPatients.length === 0 && (
              <div className={`text-center py-12 ${currentTheme.card} rounded-2xl`}>
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800">No patients yet</h3>
                <p className="text-gray-600">Patients will appear here when assigned to you</p>
              </div>
            )}
          </div>
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${currentTheme.text}`}>📅 Therapy Schedule</h2>
              <button onClick={() => setShowAddEvent(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90">
                <Plus className="w-5 h-5" />Schedule Session
              </button>
            </div>
            <div className={`${currentTheme.card} rounded-2xl shadow-sm overflow-hidden`}>
              <div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-gray-800">Upcoming Sessions</h3></div>
              <div className="divide-y">
                {calendarEvents.filter(e => new Date(e.date) >= new Date(new Date().toDateString())).sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time)).map(event => (
                  <div key={event.id} className="p-4 hover:bg-gray-50 flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs text-gray-500 uppercase">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                      <p className="text-2xl font-bold text-purple-600">{new Date(event.date).getDate()}</p>
                      <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{event.title}</p>
                      <p className="text-sm text-gray-500">{event.time} • {event.duration} min • {event.patientName || 'Patient'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.reminder && <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">🔔</span>}
                      <button onClick={() => deleteCalendarEvent(event.id)} className="p-2 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                {calendarEvents.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No sessions scheduled</p>
                    <button onClick={() => setShowAddEvent(true)} className="mt-3 text-purple-600 hover:underline">Schedule your first session</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${currentTheme.text}`}>📝 Session Notes</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search notes..." value={notesSearchQuery} onChange={(e) => setNotesSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 border rounded-xl text-sm focus:border-purple-400 focus:outline-none w-64" />
                </div>
              </div>
            </div>

            {/* Note Theme Selector */}
            <div className={`${currentTheme.card} rounded-2xl p-4 shadow-sm`}>
              <h4 className="text-sm font-medium text-gray-700 mb-3">🎨 Note Theme</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(NOTE_THEMES).map(([key, theme]) => (
                  <button key={key} onClick={() => changeNoteTheme(key)} className={`px-3 py-2 rounded-lg text-sm ${selectedNoteTheme === key ? 'ring-2 ring-purple-500' : ''}`} style={{ backgroundColor: theme.bg, color: theme.text }}>
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredNotes.map(note => (
                <div key={note.id} className={`${currentTheme.card} rounded-2xl p-5 shadow-sm`} style={{ backgroundColor: NOTE_THEMES[selectedNoteTheme]?.bg }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold" style={{ color: NOTE_THEMES[selectedNoteTheme]?.text }}>{note.patientName}</h4>
                      <p className="text-xs text-gray-500">📅 {note.createdAt?.toLocaleDateString?.()} at {note.createdAt?.toLocaleTimeString?.()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => downloadSessionNotes(note, SESSION_TEMPLATES[note.type], note.patientName, profileData.name)} className="p-1 hover:bg-gray-200 rounded" title="Download"><Download className="w-4 h-4 text-gray-500" /></button>
                      <span className={`px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700`}>{note.type || 'Note'}</span>
                    </div>
                  </div>
                  {note.summary && <p className="text-sm font-medium mb-2" style={{ color: NOTE_THEMES[selectedNoteTheme]?.text }}>{note.summary}</p>}
                  <p className="text-sm text-gray-600 line-clamp-3">{note.content}</p>
                </div>
              ))}
            </div>
            {filteredNotes.length === 0 && (
              <div className={`text-center py-12 ${currentTheme.card} rounded-2xl`}>
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800">{notesSearchQuery ? 'No notes match your search' : 'No session notes yet'}</h3>
                <p className="text-gray-600">Start a session to create notes</p>
              </div>
            )}
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${currentTheme.text}`}>📋 Note Templates</h2>
              <button onClick={() => setShowTemplateManager(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:opacity-90">
                <FolderPlus className="w-5 h-5" />Create Template
              </button>
            </div>

            {/* Built-in Templates */}
            <div className={`${currentTheme.card} rounded-2xl p-6 shadow-sm`}>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">📚 Built-in Templates</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(SESSION_TEMPLATES).map(([key, template]) => (
                  <div key={key} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{template.icon}</span>
                      <h4 className="font-medium text-gray-800">{template.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500">{template.sections.length} sections</p>
                    <ul className="mt-2 text-xs text-gray-600">
                      {template.sections.slice(0, 3).map(s => <li key={s.id}>• {s.label}</li>)}
                      {template.sections.length > 3 && <li>• +{template.sections.length - 3} more...</li>}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Templates */}
            <div className={`${currentTheme.card} rounded-2xl p-6 shadow-sm`}>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">✨ My Custom Templates</h3>
              {Object.keys(customTemplates).length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No custom templates yet</p>
                  <button onClick={() => setShowTemplateManager(true)} className="mt-2 text-purple-600 hover:underline text-sm">Create your first template</button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(customTemplates).map(([id, template]) => (
                    <div key={id} className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{template.icon}</span>
                          <h4 className="font-medium text-purple-800">{template.name}</h4>
                        </div>
                        <button onClick={() => removeCustomTemplate(id)} className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <p className="text-xs text-purple-600">{template.sections?.length || 0} sections</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ALERTS TAB */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className={`text-center py-12 ${currentTheme.card} rounded-2xl`}>
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800">No active alerts</h3>
                <p className="text-gray-600">You're all caught up! 🎉</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className={`rounded-2xl border p-4 ${alert.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{alert.severity === 'critical' ? '🚨' : '⚠️'}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{alert.memberName} • {new Date(alert.createdAt).toLocaleString()}</p>
                    </div>
                    {alert.status === 'new' && (
                      <button onClick={() => acknowledgeAlert(organizationId, alert.id, therapistId, therapist?.name)} className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm">Acknowledge</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className={`${currentTheme.card} rounded-2xl shadow-sm overflow-hidden`}>
            <div className="p-4 border-b"><h3 className="font-bold text-gray-800">Patient Messages</h3></div>
            <div className="divide-y">
              {conversations.map(conv => (
                <div key={conv.id} className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"><span className="text-purple-600 font-bold">{(conv.memberName || 'M')[0].toUpperCase()}</span></div>
                  <div className="flex-1"><p className="font-medium text-gray-800">{conv.memberName || 'Patient'}</p><p className="text-sm text-gray-500 truncate">{conv.lastMessage?.content || 'No messages yet'}</p></div>
                  {conv.unreadByTherapist > 0 && <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">{conv.unreadByTherapist}</span>}
                </div>
              ))}
              {conversations.length === 0 && <div className="p-8 text-center text-gray-500"><MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>No conversations yet</p></div>}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className={`${currentTheme.card} rounded-2xl p-6 shadow-sm text-center`}>
              <div className="relative inline-block mb-4">
                {profileData.profilePicture ? (
                  <img src={profileData.profilePicture} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 mx-auto" />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-5xl font-bold mx-auto">{(profileData.name || 'T')[0]}</div>
                )}
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition"><Camera className="w-5 h-5 text-purple-500" /></button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadProfilePicture} className="hidden" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Dr. {profileData.name}</h2>
              <p className="text-gray-500">{profileData.title}</p>
              {profileData.credentials && <div className="flex items-center justify-center gap-2 mt-2"><GraduationCap className="w-4 h-4 text-purple-500" /><span className="text-sm text-gray-600">{profileData.credentials}</span></div>}
            </div>

            <div className={`${currentTheme.card} rounded-2xl p-6 shadow-sm`}>
              <h3 className="font-bold text-gray-800 mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={profileData.name} onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" value={profileData.title} onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))} className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={profileData.email} onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={profileData.phone} onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Credentials</label><input type="text" value={profileData.credentials} onChange={(e) => setProfileData(prev => ({ ...prev, credentials: e.target.value }))} className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Bio</label><textarea value={profileData.bio} onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))} rows={4} className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none resize-none" /></div>
                <button onClick={saveProfile} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:opacity-90">💾 Save Profile</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD EVENT MODAL */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2"><CalendarDays className="w-6 h-6" />Schedule Session</h2>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Session Title *</label><input type="text" value={newEvent.title} onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))} className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select value={newEvent.patientId} onChange={(e) => { const patient = [...assignedMembers, ...allPatients].find(p => (p.id || p.memberId) === e.target.value); setNewEvent(prev => ({ ...prev, patientId: e.target.value, patientName: patient?.name || patient?.username || '' })); }} className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none">
                  <option value="">Select patient</option>
                  {[...assignedMembers, ...allPatients].map(p => <option key={p.id || p.memberId} value={p.id || p.memberId}>{p.name || p.username}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={newEvent.date} onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Time *</label><input type="time" value={newEvent.time} onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))} className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none" /></div>
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={newEvent.reminder} onChange={(e) => setNewEvent(prev => ({ ...prev, reminder: e.target.checked }))} className="w-4 h-4 text-purple-500" /><span className="text-sm text-gray-700">🔔 Reminder 30 min before</span></label>
            </div>
            <div className="p-4 bg-gray-50 flex gap-3">
              <button onClick={() => setShowAddEvent(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300">Cancel</button>
              <button onClick={addCalendarEvent} className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90">Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE MANAGER MODAL */}
      {showTemplateManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white sticky top-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2"><Layout className="w-6 h-6" />Create Custom Template</h2>
                <button onClick={() => setShowTemplateManager(false)} className="p-1 hover:bg-white/20 rounded"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select value={newTemplate.icon} onChange={(e) => setNewTemplate(prev => ({ ...prev, icon: e.target.value }))} className="px-3 py-2 border rounded-xl">
                    {['📝', '📋', '🩺', '📈', '💜', '🧠', '💡', '✨', '🌟', '🔔'].map(icon => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                  <input type="text" value={newTemplate.name} onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))} placeholder="My Custom Template" className="w-full px-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none" />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Sections</label>
                  <button onClick={addTemplateSection} className="text-sm text-purple-600 hover:underline flex items-center gap-1"><Plus className="w-4 h-4" />Add Section</button>
                </div>
                <div className="space-y-3">
                  {newTemplate.sections.map((section, index) => (
                    <div key={section.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <input type="text" value={section.label} onChange={(e) => updateTemplateSection(index, 'label', e.target.value)} placeholder="Section Label" className="flex-1 px-3 py-2 border rounded-lg text-sm focus:border-purple-400 focus:outline-none" />
                        {newTemplate.sections.length > 1 && (
                          <button onClick={() => removeTemplateSection(index)} className="p-1 text-red-500 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                      <input type="text" value={section.placeholder} onChange={(e) => updateTemplateSection(index, 'placeholder', e.target.value)} placeholder="Placeholder text (optional)" className="w-full px-3 py-2 border rounded-lg text-sm focus:border-purple-400 focus:outline-none" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex gap-3 sticky bottom-0">
              <button onClick={() => setShowTemplateManager(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300">Cancel</button>
              <button onClick={saveCustomTemplate} className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 flex items-center justify-center gap-2"><Save className="w-4 h-4" />Save Template</button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ACTION MODAL */}
      {showQuickAction && (
        <QuickActionModal type={showQuickAction.type} member={showQuickAction.member} therapist={therapist} onClose={() => setShowQuickAction(null)} onSendMessage={(templateKey) => handleQuickMessage(showQuickAction.member, templateKey)} onLogIntervention={(type, notes) => handleLogIntervention(showQuickAction.member, type, notes)} />
      )}
    </div>
  );
};

// ============================================
// 📦 HELPER COMPONENTS
// ============================================
const StatCard = ({ icon: Icon, label, value, color, theme, subtext }) => {
  const colors = { purple: 'bg-purple-100 text-purple-600', blue: 'bg-blue-100 text-blue-600', green: 'bg-green-100 text-green-600', orange: 'bg-orange-100 text-orange-600', red: 'bg-red-100 text-red-600' };
  return (
    <div className={`${theme.card} rounded-2xl p-4 shadow-sm`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}><Icon className="w-5 h-5" /></div>
      <p className={`text-2xl font-bold ${theme.text} mt-2`}>{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {subtext && <p className="text-xs text-red-500 mt-1">{subtext}</p>}
    </div>
  );
};

const QuickActionButton = ({ icon: Icon, label, color, onClick }) => {
  const colors = { purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200', blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200', green: 'bg-green-100 text-green-600 hover:bg-green-200', orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200' };
  return (<button onClick={onClick} className={`p-4 rounded-xl transition ${colors[color]}`}><Icon className="w-6 h-6 mx-auto mb-2" /><p className="text-sm font-medium">{label}</p></button>);
};

const PatientCard = ({ member, theme, onStartSession, onSchedule, onMessage, alertSettings, onToggleAlert, onUpdateNotes, onExportNotes }) => {
  const [showNotes, setShowNotes] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [patientNotes, setPatientNotes] = useState(alertSettings?.notes || '');
  const alertEnabled = alertSettings?.alertEnabled !== false;
  const patientName = member.name || member.username || 'Patient';
  const patientInitial = patientName[0].toUpperCase();
  
  return (
    <>
      <div className={`${theme.card} rounded-2xl shadow-sm overflow-hidden`}>
        {/* 👤 PATIENT HEADER - Full Name as Title */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">{patientInitial}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{patientName}</h3>
              <p className="text-sm opacity-90">{member.email || 'No email on file'}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-purple-50 rounded-xl p-2">
              <div className="text-purple-600 font-bold">--</div>
              <div className="text-gray-500">Sessions</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-2">
              <div className="text-blue-600 font-bold">--</div>
              <div className="text-gray-500">Last Visit</div>
            </div>
            <div className="bg-green-50 rounded-xl p-2">
              <div className="text-green-600 font-bold">Active</div>
              <div className="text-gray-500">Status</div>
            </div>
          </div>
          
          {/* Alert Toggle */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">🔔 Crisis Alerts</span>
              <button onClick={() => onToggleAlert && onToggleAlert(member.id || member.memberId, !alertEnabled)} className={`relative w-12 h-6 rounded-full transition ${alertEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${alertEnabled ? 'translate-x-7' : 'translate-x-1'}`}></span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{alertEnabled ? '✅ You will be notified' : '⚠️ Admin will be notified instead'}</p>
          </div>
          
          {/* Quick Notes Section */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button 
              onClick={() => setShowNotes(!showNotes)} 
              className="w-full p-3 bg-yellow-50 text-left flex items-center justify-between hover:bg-yellow-100 transition"
            >
              <span className="text-sm font-medium text-yellow-800">📝 Quick Notes</span>
              <span className="text-yellow-600">{showNotes ? '▼' : '▶'}</span>
            </button>
            {showNotes && (
              <div className="p-3 bg-white">
                <textarea 
                  value={patientNotes} 
                  onChange={(e) => setPatientNotes(e.target.value)} 
                  onBlur={() => onUpdateNotes && onUpdateNotes(member.id || member.memberId, patientNotes)} 
                  placeholder="Quick notes about this patient..." 
                  className="w-full p-2 text-sm border rounded-lg resize-none focus:border-purple-400 focus:outline-none" 
                  rows={3} 
                />
              </div>
            )}
          </div>
          
          {/* View All Session Notes Button */}
          <button 
            onClick={() => setShowAllNotes(true)}
            className="w-full py-2.5 bg-yellow-100 text-yellow-800 rounded-xl font-medium hover:bg-yellow-200 transition flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            View All Session Notes
          </button>
          
          {/* Main Actions */}
          <button onClick={onStartSession} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:opacity-90 flex items-center justify-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Start New Session
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onSchedule} className="py-2.5 bg-blue-100 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-200 flex items-center justify-center gap-1">
              <CalendarDays className="w-4 h-4" />Schedule
            </button>
            <button onClick={onExportNotes} className="py-2.5 bg-green-100 text-green-600 rounded-xl text-sm font-medium hover:bg-green-200 flex items-center justify-center gap-1">
              <Download className="w-4 h-4" />Export
            </button>
          </div>
        </div>
      </div>
      
      {/* 📋 ALL SESSION NOTES MODAL */}
      {showAllNotes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{patientInitial}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{patientName}</h2>
                    <p className="text-sm opacity-90">Session Notes History</p>
                  </div>
                </div>
                <button onClick={() => setShowAllNotes(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Notes List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Empty state when no notes exist */}
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No session notes yet</p>
                <p className="text-sm">Start a session to create notes for {patientName}</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button onClick={() => setShowAllNotes(false)} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300">
                Close
              </button>
              <button onClick={() => { setShowAllNotes(false); onStartSession(); }} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:opacity-90">
                + New Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const QuickActionModal = ({ type, member, therapist, onClose, onSendMessage, onLogIntervention }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('check_in');
  const [interventionType, setInterventionType] = useState('message');
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">{type === 'message' ? 'Send Message' : 'Log Intervention'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-gray-600 mb-4">To: <strong>{member.name || member.username}</strong></p>
        {type === 'message' && (
          <>
            <div className="space-y-2 mb-4">
              {[{ key: 'check_in', label: '💜 Check-in', desc: 'How are you doing?' }, { key: 'encouragement', label: '🌟 Encouragement', desc: 'Quick note of support' }, { key: 'crisis_outreach', label: '🤝 Crisis Support', desc: "I'm here for you" }].map(t => (
                <button key={t.key} onClick={() => setSelectedTemplate(t.key)} className={`w-full p-3 rounded-xl text-left transition ${selectedTemplate === t.key ? 'bg-purple-100 border-2 border-purple-400' : 'bg-gray-50 hover:bg-gray-100'}`}><p className="font-medium">{t.label}</p><p className="text-sm text-gray-500">{t.desc}</p></button>
              ))}
            </div>
            <button onClick={() => onSendMessage(selectedTemplate)} className="w-full py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600"><Send className="w-4 h-4 inline mr-2" />Send Message</button>
          </>
        )}
        {type === 'intervention' && (
          <>
            <select value={interventionType} onChange={(e) => setInterventionType(e.target.value)} className="w-full p-3 border rounded-xl mb-3">
              {Object.entries(INTERVENTION_TYPES).map(([key, value]) => <option key={key} value={value}>{value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes about this intervention..." className="w-full p-3 border rounded-xl mb-4 h-24 resize-none" />
            <button onClick={() => onLogIntervention(interventionType, notes)} className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600"><Plus className="w-4 h-4 inline mr-2" />Log Intervention</button>
          </>
        )}
      </div>
    </div>
  );
};

export default TherapistDashboard;
