// FILE: src/enterprise/AdminDashboard.jsx
// 🏢 Full Enterprise Admin Dashboard

import React, { useState, useEffect } from 'react';
import { 
  Users, Settings, BarChart3, CreditCard, Copy, Check,
  Building2, UserPlus, FileText, ArrowLeft, Download,
  Bell, Shield, Calendar, Activity, TrendingUp, TrendingDown,
  AlertTriangle, Printer, X, Plus, Edit, Trash2,
  RefreshCw, Search
} from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'therapists', label: 'Therapists', icon: UserPlus },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: dashboardData?.alerts?.totalAlerts },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

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
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6"
        style={branding?.primaryColor ? { 
          background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.primaryColor}cc)`
        } : {}}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="p-2 rounded-full bg-white/20 hover:bg-white/30">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center gap-3">
                {branding?.logo ? (
                  <img src={branding.logo} alt="" className="h-12 w-auto" />
                ) : (
                  <Building2 className="w-12 h-12" />
                )}
                <div>
                  <h1 className="text-2xl font-bold">{organization?.name || 'Organization'}</h1>
                  <p className="text-white/80">Enterprise Admin Dashboard</p>
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
      <div className="max-w-7xl mx-auto p-6">
        
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
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Members ({members.length})</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-xl focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {members.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No members yet. Share your access code to invite members.</p>
                </div>
              ) : (
                members
                  .filter(m => !searchQuery || (m.name || m.username || '').toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(member => <MemberRow key={member.id} member={member} therapists={therapists} />)
              )}
            </div>
          </div>
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

const MemberRow = ({ member, therapists }) => {
  const lastActive = new Date(member.lastActive || member.createdAt);
  const isActive = (new Date() - lastActive) < 7 * 24 * 60 * 60 * 1000;
  return (
    <div className="p-4 flex items-center gap-4 hover:bg-gray-50">
      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-lg">😊</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{member.name || member.username}</p>
        <p className="text-sm text-gray-500 truncate">{member.email}</p>
      </div>
      <span className={`px-2 py-1 text-xs rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
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