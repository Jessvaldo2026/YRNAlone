// FILE: src/enterprise/AdminDashboard.jsx
// 🏢 Full Enterprise Admin Dashboard

import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Settings, BarChart3, CreditCard, Copy, Check,
  Building2, UserPlus, FileText, ArrowLeft, Download,
  Bell, Shield, Calendar, Activity, TrendingUp, TrendingDown,
  AlertTriangle, Printer, X, Plus, Edit, Trash2,
  RefreshCw, Search, MoreVertical
} from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useEnterprise } from './EnterpriseContext';

// ✅ Import from services folder
import { getOrgDashboardData } from '../services/analyticsService';
import { 
  getOrgTherapists, addTherapist, updateTherapist, 
  removeTherapist, SPECIALTIES 
} from '../services/therapistService';
import { 
  generateWeeklyReport, generateMonthlyReport, 
  downloadReport, printReport 
} from '../services/reportService';

const AdminDashboard = ({ organizationId, onBack }) => {
  const { organization, branding } = useEnterprise();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  
  // Real data states
  const [dashboardData, setDashboardData] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [members, setMembers] = useState([]);
  
  // Modal states
  const [showAddTherapist, setShowAddTherapist] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 🎯 Member management states
  const [selectedMemberForAssign, setSelectedMemberForAssign] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const orgId = organizationId || organization?.id;

  useEffect(() => {
    if (orgId) {
      loadDashboardData();
    }
  }, [orgId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboard, therapistList] = await Promise.all([
        getOrgDashboardData(orgId),
        getOrgTherapists(orgId)
      ]);

      if (dashboard.success) {
        setDashboardData(dashboard.data);
        setMembers(dashboard.data.members);
      }
      setTherapists(therapistList);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
    setLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const copyAccessCode = () => {
    if (organization?.accessCode) {
      navigator.clipboard.writeText(organization.accessCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleGenerateReport = async (type) => {
    setGeneratingReport(true);
    try {
      const report = type === 'weekly' 
        ? await generateWeeklyReport(orgId, organization?.name)
        : await generateMonthlyReport(orgId, organization?.name);
      
      const format = window.confirm('Download as CSV? (Cancel for JSON)') ? 'csv' : 'json';
      downloadReport(report, format);
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report');
    }
    setGeneratingReport(false);
  };

  const handlePrintReport = async () => {
    setGeneratingReport(true);
    try {
      const report = await generateMonthlyReport(orgId, organization?.name);
      printReport(report);
    } catch (err) {
      console.error('Error printing report:', err);
    }
    setGeneratingReport(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, mobileIcon: '📊' },
    { id: 'members', label: 'Members', icon: Users, mobileIcon: '👥' },
    { id: 'therapists', label: 'Therapists', icon: UserPlus, mobileIcon: '👨‍⚕️' },
    { id: 'reports', label: 'Reports', icon: FileText, mobileIcon: '📋' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: dashboardData?.alerts?.totalAlerts, mobileIcon: '🔔' },
    { id: 'billing', label: 'Billing', icon: CreditCard, mobileIcon: '💳' },
    { id: 'settings', label: 'Settings', icon: Settings, mobileIcon: '⚙️' }
  ];

  // Mobile tabs (show fewer on mobile)
  const mobileTabs = tabs.slice(0, 5); // Show first 5 tabs on mobile

  const engagement = dashboardData?.engagement || {};
  const moodAnalytics = dashboardData?.moodAnalytics || {};
  const alerts = dashboardData?.alerts || { totalAlerts: 0, alerts: [] };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 md:p-6"
        style={branding?.primaryColor ? {
          background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.primaryColor}cc)`
        } : {}}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 md:gap-4">
              {onBack && (
                <button onClick={onBack} className="p-2 rounded-full bg-white/20 hover:bg-white/30">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center gap-2 md:gap-3">
                {branding?.logo ? (
                  <img src={branding.logo} alt="" className="h-8 md:h-12 w-auto" />
                ) : (
                  <Building2 className="w-8 h-8 md:w-12 md:h-12" />
                )}
                <div>
                  <h1 className="text-lg md:text-2xl font-bold truncate max-w-[150px] md:max-w-none">{organization?.name || 'Organization'}</h1>
                  <p className="text-white/80 text-xs md:text-base hidden md:block">Enterprise Admin Dashboard</p>
                </div>
              </div>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Access Code */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">Organization Access Code</p>
              <p className="text-2xl font-mono font-bold tracking-wider">
                {organization?.accessCode || 'XXXXXXXX'}
              </p>
            </div>
            <button
              onClick={copyAccessCode}
              className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition flex items-center gap-2"
            >
              {codeCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              <span className="text-sm">{codeCopied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 md:pb-6">
        
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Members" value={engagement.totalMembers || 0} color="purple" />
              <StatCard 
                icon={Activity} 
                label="Active This Week" 
                value={engagement.activeThisWeek || 0}
                subtext={`${engagement.engagementRate || 0}% engagement`}
                color="green"
              />
              <StatCard 
                icon={moodAnalytics.weekOverWeek >= 0 ? TrendingUp : TrendingDown}
                label="Avg Mood Score" 
                value={`${moodAnalytics.avgMoodScore || 0}/10`}
                subtext={`${moodAnalytics.weekOverWeek >= 0 ? '+' : ''}${moodAnalytics.weekOverWeek || 0}% vs last week`}
                color={moodAnalytics.weekOverWeek >= 0 ? 'green' : 'red'}
              />
              <StatCard icon={FileText} label="Journal Entries" value={engagement.totalJournalEntries || 0} color="blue" />
            </div>

            {moodAnalytics.moodDistribution && Object.keys(moodAnalytics.moodDistribution).length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Mood Distribution (Last 30 Days)</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {Object.entries(moodAnalytics.moodDistribution).map(([mood, count]) => (
                    <div key={mood} className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className="text-2xl mb-1">{getMoodEmoji(mood)}</div>
                      <div className="font-bold text-gray-800">{count}</div>
                      <div className="text-xs text-gray-500 capitalize">{mood}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickAction icon={UserPlus} label="Add Therapist" color="purple" onClick={() => { setActiveTab('therapists'); setShowAddTherapist(true); }} />
                <QuickAction icon={Download} label="Export Report" color="green" onClick={() => handleGenerateReport('monthly')} loading={generatingReport} />
                <QuickAction icon={Bell} label="View Alerts" color="orange" onClick={() => setActiveTab('alerts')} badge={alerts.totalAlerts} />
                <QuickAction icon={Printer} label="Print Report" color="blue" onClick={handlePrintReport} />
              </div>
            </div>

            {engagement.atRiskCount > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                  <div>
                    <h4 className="font-bold text-orange-800">{engagement.atRiskCount} members showing disengagement</h4>
                    <p className="text-sm text-orange-700">These members haven't been active in over 7 days</p>
                  </div>
                  <button onClick={() => setActiveTab('alerts')} className="ml-auto px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600">
                    View Details
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MEMBERS */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h3 className="font-bold text-gray-800 text-lg md:text-xl">👥 Members ({members.length})</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-auto pl-10 pr-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {members.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-5xl mb-4">👥</div>
                  <h4 className="font-bold text-gray-800 mb-2">No members yet</h4>
                  <p className="text-gray-600 mb-4">Share your access code to invite members</p>
                  <div className="bg-purple-50 rounded-xl p-4 inline-block">
                    <p className="text-sm text-purple-600 mb-1">Your Access Code:</p>
                    <p className="font-mono font-bold text-2xl text-purple-800 tracking-widest">
                      {organization?.accessCode || 'Loading...'}
                    </p>
                  </div>
                </div>
              ) : (
                members
                  .filter(m => !searchQuery || (m.name || m.displayName || m.username || '').toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(member => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      therapists={therapists}
                      onAssignTherapist={(m) => {
                        setSelectedMemberForAssign(m);
                        setShowAssignModal(true);
                      }}
                      onBlockMember={async (m) => {
                        if (confirm(`Suspend ${m.name || m.displayName}? They will not be able to access the app.`)) {
                          try {
                            await updateDoc(doc(db, 'users', m.id || m.uid), { suspended: true });
                            loadDashboardData();
                          } catch (err) {
                            alert('Error: ' + err.message);
                          }
                        }
                      }}
                      onRemoveMember={async (m) => {
                        if (confirm(`Remove ${m.name || m.displayName} from your organization? This cannot be undone.`)) {
                          try {
                            await updateDoc(doc(db, 'users', m.id || m.uid), {
                              organizationId: null,
                              isOrgMember: false,
                              isOrgUser: false
                            });
                            loadDashboardData();
                          } catch (err) {
                            alert('Error: ' + err.message);
                          }
                        }
                      }}
                      onRefresh={loadDashboardData}
                    />
                  ))
              )}
            </div>
          </div>
        )}

        {/* Assign Therapist Modal */}
        {showAssignModal && selectedMemberForAssign && (
          <AssignTherapistModal
            member={selectedMemberForAssign}
            therapists={therapists}
            orgId={orgId}
            onAssign={() => {
              loadDashboardData();
              setShowAssignModal(false);
              setSelectedMemberForAssign(null);
            }}
            onClose={() => {
              setShowAssignModal(false);
              setSelectedMemberForAssign(null);
            }}
          />
        )}

        {/* THERAPISTS */}
        {activeTab === 'therapists' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Therapist Directory</h3>
              <button onClick={() => setShowAddTherapist(true)} className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add Therapist
              </button>
            </div>

            {therapists.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h4 className="font-bold text-gray-800 mb-2">No therapists yet</h4>
                <p className="text-gray-600 mb-4">Add therapists so members can connect with them.</p>
                <button onClick={() => setShowAddTherapist(true)} className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600">
                  Add Your First Therapist
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {therapists.map(therapist => (
                  <TherapistCard 
                    key={therapist.id} 
                    therapist={therapist}
                    onEdit={() => setEditingTherapist(therapist)}
                    onRemove={async () => {
                      if (confirm(`Remove ${therapist.name}?`)) {
                        await removeTherapist(orgId, therapist.id);
                        loadDashboardData();
                      }
                    }}
                  />
                ))}
              </div>
            )}

            {(showAddTherapist || editingTherapist) && (
              <TherapistModal
                therapist={editingTherapist}
                onClose={() => { setShowAddTherapist(false); setEditingTherapist(null); }}
                onSave={async (data) => {
                  if (editingTherapist) {
                    await updateTherapist(orgId, editingTherapist.id, data);
                  } else {
                    await addTherapist(orgId, data);
                  }
                  setShowAddTherapist(false);
                  setEditingTherapist(null);
                  loadDashboardData();
                }}
              />
            )}
          </div>
        )}

        {/* REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Wellness Reports</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <ReportCard title="Weekly Summary" description="7-day overview" icon={Calendar} onGenerate={() => handleGenerateReport('weekly')} onPrint={handlePrintReport} loading={generatingReport} />
              <ReportCard title="Monthly Report" description="30-day wellness analysis" icon={FileText} onGenerate={() => handleGenerateReport('monthly')} onPrint={handlePrintReport} loading={generatingReport} />
            </div>
          </div>
        )}

        {/* ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">
              Alerts {alerts.totalAlerts > 0 && <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-sm rounded-full">{alerts.totalAlerts} active</span>}
            </h3>
            {alerts.alerts.length === 0 ? (
              <div className="bg-green-50 rounded-2xl p-8 text-center">
                <Shield className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <h4 className="font-bold text-green-800 mb-2">All Clear!</h4>
                <p className="text-green-700">No active alerts.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.alerts.map((alert, i) => <AlertCard key={i} alert={alert} />)}
              </div>
            )}
          </div>
        )}

        {/* BILLING */}
        {activeTab === 'billing' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Subscription</h3>
            <div className="p-4 bg-purple-50 rounded-xl mb-4">
              <p className="text-sm text-purple-600">Current Plan</p>
              <p className="text-2xl font-bold text-purple-800">{organization?.subscription?.plan === 'trial' ? 'Free Trial' : 'Enterprise'}</p>
            </div>
            <p className="text-gray-600">Contact enterprise@yrnalone.com for custom pricing.</p>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6">Organization Settings</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input type="text" defaultValue={organization?.name} className="w-full px-4 py-3 border rounded-xl focus:border-purple-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
                <input type="color" defaultValue={branding?.primaryColor || '#7C3AED'} className="w-16 h-12 rounded-xl cursor-pointer" />
              </div>
              <button className="px-6 py-3 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-600">Save Changes</button>
            </div>
          </div>
        )}
      </div>

      {/* 📱 MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex justify-around py-2">
          {mobileTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center p-2 min-w-0 ${
                activeTab === tab.id ? 'text-purple-600' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{tab.mobileIcon}</span>
              <span className="text-xs mt-1 truncate">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Spacer for mobile nav */}
      <div className="md:hidden h-20"></div>
    </div>
  );
};

// Sub-components
const StatCard = ({ icon: Icon, label, value, subtext, color }) => {
  const colors = { purple: 'bg-purple-100 text-purple-600', green: 'bg-green-100 text-green-600', blue: 'bg-blue-100 text-blue-600', red: 'bg-red-100 text-red-600' };
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className={`p-2 rounded-xl ${colors[color]} w-fit mb-2`}><Icon className="w-5 h-5" /></div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, color, onClick, loading, badge }) => {
  const colors = { purple: 'bg-purple-50 hover:bg-purple-100', green: 'bg-green-50 hover:bg-green-100', blue: 'bg-blue-50 hover:bg-blue-100', orange: 'bg-orange-50 hover:bg-orange-100' };
  return (
    <button onClick={onClick} disabled={loading} className={`p-4 rounded-xl transition text-left relative ${colors[color]} disabled:opacity-50`}>
      <Icon className={`w-6 h-6 mb-2 text-gray-700 ${loading ? 'animate-pulse' : ''}`} />
      <p className="font-medium text-gray-800">{label}</p>
      {badge > 0 && <span className="absolute top-2 right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{badge}</span>}
    </button>
  );
};

// 🎯 Enhanced MemberRow with 3-dot menu for actions
const MemberRow = ({ member, therapists, onAssignTherapist, onBlockMember, onRemoveMember, onRefresh }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const lastActive = new Date(member.lastActive || member.createdAt);
  const isActive = (new Date() - lastActive) < 7 * 24 * 60 * 60 * 1000;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="p-4 flex items-center gap-4 hover:bg-gray-50 border-b last:border-b-0">
      {/* Member Avatar */}
      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
        {(member.name || member.displayName || member.username || '?').charAt(0).toUpperCase()}
      </div>

      {/* Member Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 truncate">{member.name || member.displayName || member.username || 'Unknown'}</p>
        <p className="text-sm text-gray-500 truncate">{member.email}</p>
        {member.assignedTherapist && (
          <p className="text-xs text-purple-600 mt-0.5 flex items-center gap-1">
            <span>👨‍⚕️</span> {member.assignedTherapist}
          </p>
        )}
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
          isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {isActive ? '🟢 Active' : '⚪ Inactive'}
        </span>

        {member.riskLevel === 'high' && (
          <span className="px-3 py-1 text-xs rounded-full font-medium bg-red-100 text-red-700">
            🚨 High Risk
          </span>
        )}

        {/* 3-Dot Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition"
          >
            <span className="text-xl leading-none">⋮</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border rounded-xl shadow-lg z-50 py-2 min-w-[180px] animate-fade-in">
              <button
                onClick={() => { onAssignTherapist?.(member); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
              >
                👨‍⚕️ Assign Therapist
              </button>
              <button
                onClick={() => { window.open(`/member/${member.id || member.uid}`, '_blank'); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
              >
                👁️ View Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                onClick={() => setShowMenu(false)}
              >
                ✏️ Edit Details
              </button>
              <hr className="my-2" />
              <button
                onClick={() => { onBlockMember?.(member); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-orange-600 flex items-center gap-2"
              >
                🔕 Suspend Member
              </button>
              <button
                onClick={() => { onRemoveMember?.(member); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                🗑️ Remove Member
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 🎯 Assign Therapist Modal
const AssignTherapistModal = ({ member, therapists, onAssign, onClose, orgId }) => {
  const [selectedTherapist, setSelectedTherapist] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAssign = async () => {
    if (!selectedTherapist) return;

    setSaving(true);
    const therapist = therapists.find(t => t.id === selectedTherapist);

    try {
      // Update member document with assigned therapist
      await updateDoc(doc(db, 'users', member.id || member.uid), {
        assignedTherapistId: selectedTherapist,
        assignedTherapist: therapist.name
      });

      // Create audit log
      await addDoc(collection(db, 'auditLog'), {
        action: 'ASSIGN_THERAPIST',
        memberId: member.id || member.uid,
        memberName: member.name || member.displayName,
        therapistId: selectedTherapist,
        therapistName: therapist.name,
        organizationId: orgId,
        timestamp: serverTimestamp()
      });

      onAssign?.();
      onClose();
    } catch (error) {
      console.error('Error assigning therapist:', error);
      alert('Failed to assign therapist: ' + error.message);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          👨‍⚕️ Assign Therapist
        </h3>
        <p className="text-gray-600 mb-4">
          Select a therapist for <span className="font-medium">{member.name || member.displayName}</span>
        </p>

        {therapists.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl mb-4">
            <p className="text-4xl mb-2">👨‍⚕️</p>
            <p className="text-gray-600 font-medium">No therapists available</p>
            <p className="text-gray-500 text-sm">Add therapists first to assign them</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
            {therapists.map(t => (
              <label
                key={t.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  selectedTherapist === t.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="therapist"
                  value={t.id}
                  checked={selectedTherapist === t.id}
                  onChange={() => setSelectedTherapist(t.id)}
                  className="sr-only"
                />
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                  👨‍⚕️
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-500">
                    {t.specialties?.slice(0, 2).join(', ') || 'General'}
                    {t.caseload !== undefined && ` • ${t.caseload}/15 patients`}
                  </p>
                </div>
                {t.caseload >= 15 && (
                  <span className="text-xs text-red-500 font-medium">Full</span>
                )}
                {selectedTherapist === t.id && (
                  <Check className="w-5 h-5 text-purple-500" />
                )}
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleAssign}
            disabled={!selectedTherapist || saving || therapists.length === 0}
            className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-bold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Assigning...' : 'Assign'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const TherapistCard = ({ therapist, onEdit, onRemove }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm">
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center"><UserPlus className="w-7 h-7 text-purple-500" /></div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-800">{therapist.name}</h4>
        <p className="text-sm text-gray-600">{therapist.title}</p>
        {therapist.specialties?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {therapist.specialties.slice(0, 3).map(s => <span key={s} className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full">{s}</span>)}
          </div>
        )}
      </div>
      <div className="flex gap-1">
        <button onClick={onEdit} className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg"><Edit className="w-4 h-4" /></button>
        <button onClick={onRemove} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  </div>
);

const TherapistModal = ({ therapist, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: therapist?.name || '',
    title: therapist?.title || 'Licensed Therapist',
    email: therapist?.email || '',
    phone: therapist?.phone || '',
    specialties: therapist?.specialties || [],
    acceptingNew: therapist?.acceptingNew !== false
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-xl font-bold">{therapist ? 'Edit Therapist' : 'Add Therapist'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Specialties</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-xl">
              {SPECIALTIES.map(s => (
                <button key={s} type="button" onClick={() => {
                  const specs = form.specialties.includes(s) ? form.specialties.filter(x => x !== s) : [...form.specialties, s];
                  setForm({...form, specialties: specs});
                }} className={`px-3 py-1 rounded-full text-sm ${form.specialties.includes(s) ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.acceptingNew} onChange={e => setForm({...form, acceptingNew: e.target.checked})} className="w-5 h-5" />
            <span>Accepting new clients</span>
          </label>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl">Cancel</button>
            <button type="submit" disabled={saving || !form.name} className="flex-1 py-3 bg-purple-500 text-white rounded-xl disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReportCard = ({ title, description, icon: Icon, onGenerate, onPrint, loading }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm">
    <div className="flex items-start gap-4 mb-4">
      <div className="p-3 bg-purple-100 rounded-xl"><Icon className="w-6 h-6 text-purple-600" /></div>
      <div>
        <h4 className="font-bold text-gray-800">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    <div className="flex gap-2">
      <button onClick={onGenerate} disabled={loading} className="flex-1 py-2 bg-purple-500 text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
        <Download className="w-4 h-4" /> Download
      </button>
      <button onClick={onPrint} disabled={loading} className="py-2 px-4 border rounded-xl">
        <Printer className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const AlertCard = ({ alert }) => {
  const colors = { high: 'bg-red-50 border-red-200', medium: 'bg-orange-50 border-orange-200', low: 'bg-yellow-50 border-yellow-200' };
  const icons = { high: '🚨', medium: '⚠️', low: 'ℹ️' };
  return (
    <div className={`p-4 rounded-xl border ${colors[alert.severity]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icons[alert.severity]}</span>
        <div className="flex-1">
          <p className="font-medium text-gray-800">{alert.message}</p>
          {alert.memberName && <p className="text-sm text-gray-600">Member: {alert.memberName}</p>}
        </div>
      </div>
    </div>
  );
};

const getMoodEmoji = (mood) => {
  const map = { happy: '😊', sad: '😢', anxious: '😰', angry: '😡', tired: '😴', loved: '🥰', calm: '😌' };
  return map[mood?.toLowerCase()] || mood || '😊';
};

export default AdminDashboard;