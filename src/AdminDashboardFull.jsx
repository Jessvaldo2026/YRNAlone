// FILE: src/AdminDashboardFull.jsx
// 🏢 ENTERPRISE ADMIN DASHBOARD - $100M LEVEL
// Complete organization management, content moderation, analytics

import React, { useState, useEffect } from 'react';
import {
  Users, BarChart3, Shield, Flag, AlertTriangle, Settings,
  MessageCircle, TrendingUp, Calendar, Clock, CheckCircle,
  XCircle, Eye, Search, Filter, Download, RefreshCw, Bell,
  UserX, Trash2, Lock, Unlock, Mail, Phone, Building2,
  Activity, Heart, Brain, Sparkles, ChevronRight, ArrowLeft,
  PieChart, Target, Award, Zap, FileText, AlertCircle
} from 'lucide-react';

// ============================================
// 📊 ADMIN DASHBOARD MAIN
// ============================================
export const AdminDashboardFull = ({ organization, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');
  
  // Mock data - in production, this would come from Firebase
  const [stats, setStats] = useState({
    totalMembers: 156,
    activeToday: 42,
    newThisWeek: 12,
    engagementRate: 78,
    moodCheckins: 324,
    journalEntries: 189,
    groupMessages: 567,
    crisisAlerts: 3,
    pendingReports: 8,
    avgSessionTime: '12m 34s'
  });

  const [reports, setReports] = useState([
    { id: 1, type: 'harassment', reporter: 'User123', reported: 'User456', content: 'Inappropriate message in support group', status: 'pending', timestamp: '2024-01-15T10:30:00Z' },
    { id: 2, type: 'sexual', reporter: 'User789', reported: 'User012', content: 'Suspicious DM request', status: 'pending', timestamp: '2024-01-15T09:15:00Z' },
    { id: 3, type: 'spam', reporter: 'User345', reported: 'User678', content: 'Multiple promotional posts', status: 'resolved', timestamp: '2024-01-14T16:45:00Z' }
  ]);

  const [members, setMembers] = useState([
    { id: 1, name: 'Sarah M.', email: 's***@example.com', joined: '2024-01-10', status: 'active', moodTrend: 'improving', lastActive: '2 hours ago' },
    { id: 2, name: 'James K.', email: 'j***@example.com', joined: '2024-01-08', status: 'active', moodTrend: 'stable', lastActive: '5 mins ago' },
    { id: 3, name: 'Emma L.', email: 'e***@example.com', joined: '2024-01-05', status: 'inactive', moodTrend: 'declining', lastActive: '3 days ago' },
    { id: 4, name: 'Michael R.', email: 'm***@example.com', joined: '2024-01-12', status: 'flagged', moodTrend: 'crisis', lastActive: '1 hour ago' }
  ]);

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'crisis', user: 'Emma L.', message: 'Multiple posts indicating severe distress', severity: 'high', timestamp: '10 mins ago', acknowledged: false },
    { id: 2, type: 'inactivity', user: 'David P.', message: 'No activity in 7 days (previously daily user)', severity: 'medium', timestamp: '2 hours ago', acknowledged: false },
    { id: 3, type: 'mood', user: 'Lisa T.', message: 'Mood score dropped 40% over 3 days', severity: 'medium', timestamp: '5 hours ago', acknowledged: true }
  ]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'moderation', label: 'Moderation', icon: Shield },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: alerts.filter(a => !a.acknowledged).length },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-purple-500" />
                  {organization?.name || 'Admin Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">Organization Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {alerts.filter(a => !a.acknowledged).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {alerts.filter(a => !a.acknowledged).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} alerts={alerts} reports={reports} />
        )}
        {activeTab === 'members' && (
          <MembersTab members={members} setMembers={setMembers} />
        )}
        {activeTab === 'moderation' && (
          <ModerationTab reports={reports} setReports={setReports} />
        )}
        {activeTab === 'alerts' && (
          <AlertsTab alerts={alerts} setAlerts={setAlerts} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsTab stats={stats} dateRange={dateRange} />
        )}
        {activeTab === 'settings' && (
          <OrgSettingsTab organization={organization} />
        )}
      </div>
    </div>
  );
};

// ============================================
// 📊 OVERVIEW TAB
// ============================================
const OverviewTab = ({ stats, alerts, reports }) => {
  const statCards = [
    { label: 'Total Members', value: stats.totalMembers, icon: Users, color: 'purple', trend: '+12 this week' },
    { label: 'Active Today', value: stats.activeToday, icon: Activity, color: 'green', trend: '27% of members' },
    { label: 'Engagement Rate', value: `${stats.engagementRate}%`, icon: TrendingUp, color: 'blue', trend: '+5% from last week' },
    { label: 'Avg Session', value: stats.avgSessionTime, icon: Clock, color: 'orange', trend: 'Per user' }
  ];

  const activityCards = [
    { label: 'Mood Check-ins', value: stats.moodCheckins, icon: Heart, color: 'pink' },
    { label: 'Journal Entries', value: stats.journalEntries, icon: FileText, color: 'purple' },
    { label: 'Group Messages', value: stats.groupMessages, icon: MessageCircle, color: 'blue' },
    { label: 'Tools Used', value: '1,245', icon: Sparkles, color: 'yellow' }
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
              </div>
              <span className="text-xs text-gray-500">{stat.trend}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Active Alerts
            </h3>
            <span className="text-sm text-gray-500">{alerts.filter(a => !a.acknowledged).length} unacknowledged</span>
          </div>
          <div className="space-y-3">
            {alerts.filter(a => !a.acknowledged).slice(0, 3).map(alert => (
              <div key={alert.id} className={`p-3 rounded-xl border-l-4 ${
                alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                alert.severity === 'medium' ? 'border-orange-500 bg-orange-50' :
                'border-yellow-500 bg-yellow-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{alert.user}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">{alert.timestamp}</span>
                </div>
              </div>
            ))}
            {alerts.filter(a => !a.acknowledged).length === 0 && (
              <p className="text-center text-gray-500 py-4">No active alerts 🎉</p>
            )}
          </div>
        </div>

        {/* Pending Reports */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" />
              Pending Reports
            </h3>
            <span className="text-sm text-gray-500">{reports.filter(r => r.status === 'pending').length} pending</span>
          </div>
          <div className="space-y-3">
            {reports.filter(r => r.status === 'pending').slice(0, 3).map(report => (
              <div key={report.id} className="p-3 rounded-xl bg-gray-50 border">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      report.type === 'sexual' ? 'bg-red-100 text-red-700' :
                      report.type === 'harassment' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {report.type}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{report.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {reports.filter(r => r.status === 'pending').length === 0 && (
              <p className="text-center text-gray-500 py-4">No pending reports 🎉</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Activity This Week</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activityCards.map((card, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-gray-50">
              <card.icon className={`w-8 h-8 mx-auto mb-2 text-${card.color}-500`} />
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// 👥 MEMBERS TAB
// ============================================
const MembersTab = ({ members, setMembers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getMoodIcon = (trend) => {
    switch(trend) {
      case 'improving': return { icon: '📈', color: 'text-green-500' };
      case 'stable': return { icon: '➡️', color: 'text-blue-500' };
      case 'declining': return { icon: '📉', color: 'text-orange-500' };
      case 'crisis': return { icon: '🚨', color: 'text-red-500' };
      default: return { icon: '❓', color: 'text-gray-500' };
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'flagged': return 'bg-red-100 text-red-700';
      case 'suspended': return 'bg-black text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:border-purple-400 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="flagged">Flagged</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Member</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Mood Trend</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Last Active</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredMembers.map(member => {
              const mood = getMoodIcon(member.moodTrend);
              return (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-medium">{member.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 ${mood.color}`}>
                      {mood.icon} {member.moodTrend}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {member.lastActive}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg" title="View Profile">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg" title="Send Message">
                        <Mail className="w-4 h-4 text-gray-600" />
                      </button>
                      {member.status !== 'suspended' ? (
                        <button className="p-2 hover:bg-red-100 rounded-lg" title="Suspend">
                          <UserX className="w-4 h-4 text-red-600" />
                        </button>
                      ) : (
                        <button className="p-2 hover:bg-green-100 rounded-lg" title="Unsuspend">
                          <Unlock className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// 🛡️ MODERATION TAB
// ============================================
const ModerationTab = ({ reports, setReports }) => {
  const [filter, setFilter] = useState('pending');

  const handleResolve = (reportId, action) => {
    setReports(reports.map(r => 
      r.id === reportId ? { ...r, status: 'resolved', resolution: action } : r
    ));
  };

  const filteredReports = reports.filter(r => 
    filter === 'all' ? true : r.status === filter
  );

  const getTypeBadge = (type) => {
    const badges = {
      sexual: 'bg-red-100 text-red-700 border-red-200',
      harassment: 'bg-orange-100 text-orange-700 border-orange-200',
      hate: 'bg-purple-100 text-purple-700 border-purple-200',
      violence: 'bg-red-100 text-red-700 border-red-200',
      spam: 'bg-gray-100 text-gray-700 border-gray-200',
      other: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return badges[type] || badges.other;
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-orange-600">{reports.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Resolved Today</p>
          <p className="text-2xl font-bold text-green-600">12</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Avg Resolution Time</p>
          <p className="text-2xl font-bold text-blue-600">4.2h</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Users Suspended</p>
          <p className="text-2xl font-bold text-red-600">2</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['pending', 'resolved', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f ? 'bg-purple-500 text-white' : 'bg-white text-gray-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map(report => (
          <div key={report.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getTypeBadge(report.type)}`}>
                  {report.type.toUpperCase()}
                </span>
                <p className="mt-2 font-medium text-gray-800">{report.content}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                report.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
              }`}>
                {report.status}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span>Reported by: {report.reporter}</span>
              <span>•</span>
              <span>Against: {report.reported}</span>
              <span>•</span>
              <span>{new Date(report.timestamp).toLocaleString()}</span>
            </div>

            {report.status === 'pending' && (
              <div className="flex gap-2 pt-4 border-t">
                <button 
                  onClick={() => handleResolve(report.id, 'warning')}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                >
                  <AlertCircle className="w-4 h-4" />
                  Warn User
                </button>
                <button 
                  onClick={() => handleResolve(report.id, 'remove')}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Content
                </button>
                <button 
                  onClick={() => handleResolve(report.id, 'suspend')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  <UserX className="w-4 h-4" />
                  Suspend User
                </button>
                <button 
                  onClick={() => handleResolve(report.id, 'dismiss')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <XCircle className="w-4 h-4" />
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// 🚨 ALERTS TAB
// ============================================
const AlertsTab = ({ alerts, setAlerts }) => {
  const acknowledgeAlert = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-orange-500 bg-orange-50';
      case 'low': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Alert Types Legend */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-medium text-gray-800 mb-3">Alert Types</h3>
        <div className="flex flex-wrap gap-4">
          <span className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            Crisis (Immediate attention needed)
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            Mood Decline (Monitor)
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            Inactivity (Check-in suggested)
          </span>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${getSeverityStyle(alert.severity)} ${
              alert.acknowledged ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  alert.type === 'crisis' ? 'bg-red-100' :
                  alert.type === 'mood' ? 'bg-orange-100' :
                  'bg-yellow-100'
                }`}>
                  {alert.type === 'crisis' ? <AlertTriangle className="w-5 h-5 text-red-600" /> :
                   alert.type === 'mood' ? <TrendingUp className="w-5 h-5 text-orange-600" /> :
                   <Clock className="w-5 h-5 text-yellow-600" />}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{alert.user}</p>
                  <p className="text-gray-600">{alert.message}</p>
                  <p className="text-sm text-gray-500 mt-1">{alert.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!alert.acknowledged && (
                  <>
                    <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">
                      View Profile
                    </button>
                    <button 
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                    >
                      Acknowledge
                    </button>
                  </>
                )}
                {alert.acknowledged && (
                  <span className="text-green-600 text-sm flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Acknowledged
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// 📈 ANALYTICS TAB
// ============================================
const AnalyticsTab = ({ stats, dateRange }) => {
  const moodData = [
    { label: 'Happy', value: 35, color: 'bg-green-500' },
    { label: 'Calm', value: 28, color: 'bg-blue-500' },
    { label: 'Anxious', value: 18, color: 'bg-yellow-500' },
    { label: 'Sad', value: 12, color: 'bg-purple-500' },
    { label: 'Stressed', value: 7, color: 'bg-red-500' }
  ];

  const engagementData = [
    { feature: 'Mood Check-ins', usage: 89 },
    { feature: 'Support Groups', usage: 76 },
    { feature: 'Journal', usage: 65 },
    { feature: 'Breathing Exercises', usage: 54 },
    { feature: 'Community Posts', usage: 45 }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm text-gray-500 mb-2">Member Wellbeing Score</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-green-600">7.4</span>
            <span className="text-sm text-gray-500 mb-1">/10</span>
          </div>
          <p className="text-sm text-green-600 mt-2">↑ 0.3 from last week</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm text-gray-500 mb-2">Crisis Interventions</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-purple-600">3</span>
            <span className="text-sm text-gray-500 mb-1">this month</span>
          </div>
          <p className="text-sm text-green-600 mt-2">100% resolved successfully</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm text-gray-500 mb-2">Retention Rate</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-blue-600">94%</span>
          </div>
          <p className="text-sm text-green-600 mt-2">↑ 2% from last month</p>
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Mood Distribution</h3>
        <div className="space-y-3">
          {moodData.map((mood, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="w-20 text-sm text-gray-600">{mood.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full ${mood.color} rounded-full`}
                  style={{ width: `${mood.value}%` }}
                />
              </div>
              <span className="w-12 text-sm text-gray-600 text-right">{mood.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Engagement */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Feature Engagement</h3>
        <div className="space-y-3">
          {engagementData.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="w-40 text-sm text-gray-600">{item.feature}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${item.usage}%` }}
                />
              </div>
              <span className="w-12 text-sm text-gray-600 text-right">{item.usage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Export Reports</h3>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Monthly Summary (PDF)
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Member Data (CSV)
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Engagement Metrics (Excel)
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ⚙️ SETTINGS TAB
// ============================================
const OrgSettingsTab = ({ organization }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Organization Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
            <input
              type="text"
              defaultValue={organization?.name || ''}
              className="w-full px-4 py-2 border rounded-lg focus:border-purple-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
            <textarea
              defaultValue={organization?.welcomeMessage || ''}
              className="w-full px-4 py-2 border rounded-lg focus:border-purple-400 focus:outline-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
            <input
              type="color"
              defaultValue={organization?.primaryColor || '#7C3AED'}
              className="w-16 h-10 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Access Code</h3>
        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-2xl tracking-widest">{organization?.accessCode || 'XXXXXXXX'}</p>
            <p className="text-sm text-gray-500 mt-1">Share this code with new members</p>
          </div>
          <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
            Regenerate
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Notification Settings</h3>
        <div className="space-y-3">
          {[
            { label: 'Crisis alerts', desc: 'Immediate notification for crisis situations', default: true },
            { label: 'New member joins', desc: 'When someone uses your access code', default: true },
            { label: 'Weekly report', desc: 'Summary of organization activity', default: true },
            { label: 'Content reports', desc: 'When content is reported', default: true }
          ].map((setting, i) => (
            <label key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
              <div>
                <p className="font-medium text-gray-800">{setting.label}</p>
                <p className="text-sm text-gray-500">{setting.desc}</p>
              </div>
              <input
                type="checkbox"
                defaultChecked={setting.default}
                className="w-5 h-5 rounded text-purple-500"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Subscription</h3>
        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
          <div>
            <p className="font-medium text-gray-800">{organization?.subscription?.planName || 'Professional'} Plan</p>
            <p className="text-sm text-gray-600">${organization?.subscription?.price || '999'}/month</p>
          </div>
          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
            Manage Billing
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardFull;
