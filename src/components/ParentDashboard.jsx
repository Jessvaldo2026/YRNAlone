// FILE: src/components/ParentDashboard.jsx
// 👨‍👩‍👧 Parent/Guardian Dashboard
// View limited child wellness data (mood trends, app usage, achievements)
// CANNOT see: journal entries, private messages, group chat content

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Bell, Shield, TrendingUp, TrendingDown,
  Activity, Award, Clock, Eye, Settings, Link2,
  AlertTriangle, Check, X, ChevronRight, RefreshCw,
  Heart, Calendar, Users, BookOpen
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import {
  getGuardianLinks,
  getChildDataForParent,
  getParentNotifications,
  createGuardianLinkRequest,
  revokeGuardianLink,
  updateLinkPermissions,
  markNotificationRead,
  GUARDIAN_PERMISSIONS,
  LINK_STATUS
} from '../services/guardianService';

const ParentDashboard = ({ onBack }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('children');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [linkedChildren, setLinkedChildren] = useState([]);
  const [pendingLinks, setPendingLinks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childData, setChildData] = useState(null);

  // Link request modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkResult, setLinkResult] = useState(null);

  // Settings modal
  const [showSettings, setShowSettings] = useState(false);
  const [settingsChild, setSettingsChild] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [links, notifs] = await Promise.all([
        getGuardianLinks(user.uid, 'parent'),
        getParentNotifications(user.uid)
      ]);

      const active = links.filter(l => l.status === LINK_STATUS.ACTIVE);
      const pending = links.filter(l => l.status === LINK_STATUS.PENDING);

      setLinkedChildren(active);
      setPendingLinks(pending);
      setNotifications(notifs);

      // Auto-select first child if available
      if (active.length > 0 && !selectedChild) {
        setSelectedChild(active[0]);
        await loadChildData(active[0]);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
    setLoading(false);
  };

  const loadChildData = async (link) => {
    if (!link) return;

    try {
      const result = await getChildDataForParent(user.uid, link.childId, link.id);
      if (result.success) {
        setChildData(result.data);
      } else {
        console.error('Error loading child data:', result.error);
      }
    } catch (error) {
      console.error('Error loading child data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    if (selectedChild) {
      await loadChildData(selectedChild);
    }
    setRefreshing(false);
  };

  const handleLinkRequest = async () => {
    if (!linkEmail.trim()) return;

    setLinkLoading(true);
    setLinkResult(null);

    try {
      const result = await createGuardianLinkRequest(user.uid, linkEmail);
      setLinkResult(result);

      if (result.success) {
        setLinkEmail('');
        await loadDashboardData();
      }
    } catch (error) {
      setLinkResult({ success: false, error: error.message });
    }
    setLinkLoading(false);
  };

  const handleRevokeLink = async (linkId) => {
    if (!confirm('Are you sure you want to remove this link? Your child will need to approve a new link request.')) {
      return;
    }

    try {
      await revokeGuardianLink(linkId, 'parent');
      await loadDashboardData();
      if (selectedChild?.id === linkId) {
        setSelectedChild(null);
        setChildData(null);
      }
    } catch (error) {
      console.error('Error revoking link:', error);
    }
  };

  const handleNotificationRead = async (notifId) => {
    await markNotificationRead('parentNotifications', notifId);
    setNotifications(prev => prev.map(n =>
      n.id === notifId ? { ...n, read: true } : n
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const crisisAlerts = notifications.filter(n => n.type === 'crisis_alert' && !n.read);

  const tabs = [
    { id: 'children', label: 'My Children', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="p-2 rounded-full bg-white/20 hover:bg-white/30">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold">Parent Dashboard</h1>
                <p className="text-white/80 text-sm">Monitor your child's wellness journey</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Crisis Alert Banner */}
          {crisisAlerts.length > 0 && (
            <div className="bg-red-500 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold">Crisis Alert</p>
                <p className="text-sm text-white/90">
                  Your child may need support. Please check in with them.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('notifications')}
                className="px-4 py-2 bg-white text-red-600 rounded-lg font-medium"
              >
                View
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition relative ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* CHILDREN TAB */}
        {activeTab === 'children' && (
          <div className="space-y-6">
            {/* Link New Child Button */}
            <button
              onClick={() => setShowLinkModal(true)}
              className="w-full p-4 border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 font-medium hover:bg-purple-50 transition flex items-center justify-center gap-2"
            >
              <Link2 className="w-5 h-5" />
              Link a Child's Account
            </button>

            {/* Pending Links */}
            {pendingLinks.length > 0 && (
              <div className="bg-yellow-50 rounded-2xl p-4">
                <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Pending Link Requests
                </h3>
                {pendingLinks.map(link => (
                  <div key={link.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{link.childName || link.childEmail}</p>
                      <p className="text-sm text-gray-500">Waiting for approval</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Linked Children */}
            {linkedChildren.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">👨‍👩‍👧</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Linked Children</h3>
                <p className="text-gray-600 mb-4">
                  Link your child's account to view their wellness progress.
                </p>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600"
                >
                  Link a Child
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {/* Child Selection */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {linkedChildren.map(link => (
                    <button
                      key={link.id}
                      onClick={() => { setSelectedChild(link); loadChildData(link); }}
                      className={`flex-shrink-0 px-6 py-3 rounded-xl font-medium transition ${
                        selectedChild?.id === link.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-purple-50'
                      }`}
                    >
                      {link.childName || 'Child'}
                    </button>
                  ))}
                </div>

                {/* Child Data Display */}
                {selectedChild && childData && (
                  <div className="space-y-4">
                    {/* Child Header */}
                    <div className="bg-white rounded-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">{childData.name}</h2>
                          <p className="text-sm text-gray-500">
                            Last active: {childData.lastActive
                              ? new Date(childData.lastActive).toLocaleDateString()
                              : 'Not available'}
                          </p>
                        </div>
                        <button
                          onClick={() => { setSettingsChild(selectedChild); setShowSettings(true); }}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Mood Trends */}
                    {childData.moodTrends && (
                      <div className="bg-white rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Heart className="w-5 h-5 text-pink-500" />
                          Mood Trends
                        </h3>

                        {childData.moodTrends.hasData ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                              label="Weekly Average"
                              value={childData.moodTrends.weeklyAverage || '-'}
                              sublabel="out of 10"
                              trend={childData.moodTrends.trend}
                            />
                            <StatCard
                              label="Monthly Average"
                              value={childData.moodTrends.monthlyAverage || '-'}
                              sublabel="out of 10"
                            />
                            <StatCard
                              label="Check-ins (7d)"
                              value={childData.moodTrends.weeklyCheckIns}
                              sublabel="mood logs"
                            />
                            <StatCard
                              label="Check-ins (30d)"
                              value={childData.moodTrends.monthlyCheckIns}
                              sublabel="mood logs"
                            />
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">
                            No mood data available yet
                          </p>
                        )}

                        <div className="mt-4 p-3 bg-purple-50 rounded-xl text-sm text-purple-700">
                          <Shield className="w-4 h-4 inline mr-2" />
                          You can see mood averages only. Individual entries and notes are private.
                        </div>
                      </div>
                    )}

                    {/* App Usage */}
                    {childData.appUsage && (
                      <div className="bg-white rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-blue-500" />
                          App Activity
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <StatCard
                            label="Current Streak"
                            value={childData.appUsage.currentStreak}
                            sublabel="days"
                          />
                          <StatCard
                            label="Longest Streak"
                            value={childData.appUsage.longestStreak}
                            sublabel="days"
                          />
                          <StatCard
                            label="Total Active Days"
                            value={childData.appUsage.daysActive}
                            sublabel="days"
                          />
                          <StatCard
                            label="Groups Joined"
                            value={childData.appUsage.groupsJoined}
                            sublabel="support groups"
                          />
                        </div>
                      </div>
                    )}

                    {/* Achievements */}
                    {childData.achievements && (
                      <div className="bg-white rounded-2xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Award className="w-5 h-5 text-yellow-500" />
                          Achievements
                        </h3>

                        {childData.achievements.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {childData.achievements.map((badge, i) => (
                              <span
                                key={i}
                                className="px-3 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-sm font-medium"
                              >
                                🏆 {badge}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">
                            No achievements earned yet
                          </p>
                        )}
                      </div>
                    )}

                    {/* Privacy Notice */}
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 flex items-start gap-3">
                      <Eye className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Privacy Protected</p>
                        <p>
                          Your child has been notified that you viewed their data.
                          Journal entries, messages, and group chats remain private.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Notifications</h2>

            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`bg-white rounded-xl p-4 ${!notif.read ? 'border-l-4 border-purple-500' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        notif.type === 'crisis_alert' ? 'bg-red-100' :
                        notif.type === 'link_approved' ? 'bg-green-100' :
                        'bg-purple-100'
                      }`}>
                        {notif.type === 'crisis_alert' ? (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        ) : notif.type === 'link_approved' ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Bell className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{notif.title}</p>
                        <p className="text-sm text-gray-600">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notif.read && (
                        <button
                          onClick={() => handleNotificationRead(notif.id)}
                          className="text-xs text-purple-600 hover:underline"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Parent Settings</h2>

            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-medium text-gray-800">Linked Children</h3>
              </div>
              {linkedChildren.map(link => (
                <div key={link.id} className="p-4 border-b last:border-0 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{link.childName}</p>
                    <p className="text-sm text-gray-500">{link.childEmail}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSettingsChild(link); setShowSettings(true); }}
                      className="px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg text-sm"
                    >
                      Permissions
                    </button>
                    <button
                      onClick={() => handleRevokeLink(link.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-purple-50 rounded-xl p-4 text-sm text-purple-700">
              <p className="font-medium mb-2">What you can see:</p>
              <ul className="space-y-1 text-purple-600">
                <li>• Mood trends and averages</li>
                <li>• App activity and streaks</li>
                <li>• Achievements and badges</li>
                <li>• Crisis alerts (immediate notification)</li>
              </ul>
              <p className="font-medium mt-4 mb-2">What remains private:</p>
              <ul className="space-y-1 text-purple-600">
                <li>• Journal entries and notes</li>
                <li>• Private messages</li>
                <li>• Group chat conversations</li>
                <li>• Detailed mood notes</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Link Child Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Link Child's Account</h2>

            {linkResult?.success ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">📨</div>
                <h3 className="font-bold text-gray-800 mb-2">Link Request Sent!</h3>
                <p className="text-gray-600 mb-4">{linkResult.message}</p>
                {linkResult.verificationCode && (
                  <div className="bg-purple-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-purple-700 mb-2">Verification Code:</p>
                    <p className="text-2xl font-mono font-bold text-purple-800">
                      {linkResult.verificationCode}
                    </p>
                    <p className="text-xs text-purple-600 mt-2">
                      Share this code with your child
                    </p>
                  </div>
                )}
                <button
                  onClick={() => { setShowLinkModal(false); setLinkResult(null); }}
                  className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Enter your child's email address. They will receive a request to approve the link.
                </p>

                {linkResult?.error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                    {linkResult.error}
                  </div>
                )}

                <input
                  type="email"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="child@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none mb-4"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowLinkModal(false); setLinkEmail(''); setLinkResult(null); }}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLinkRequest}
                    disabled={linkLoading || !linkEmail.trim()}
                    className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-bold disabled:opacity-50"
                  >
                    {linkLoading ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Permissions Settings Modal */}
      {showSettings && settingsChild && (
        <PermissionsModal
          link={settingsChild}
          onClose={() => { setShowSettings(false); setSettingsChild(null); }}
          onSave={async (permissions) => {
            await updateLinkPermissions(settingsChild.id, user.uid, permissions);
            await loadDashboardData();
            setShowSettings(false);
            setSettingsChild(null);
          }}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, sublabel, trend }) => (
  <div className="bg-gray-50 rounded-xl p-4 text-center">
    <p className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-1">
      {value}
      {trend === 'improving' && <TrendingUp className="w-4 h-4 text-green-500" />}
      {trend === 'declining' && <TrendingDown className="w-4 h-4 text-red-500" />}
    </p>
    <p className="text-sm text-gray-600">{label}</p>
    {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
  </div>
);

// Permissions Modal Component
const PermissionsModal = ({ link, onClose, onSave }) => {
  const [permissions, setPermissions] = useState(link.permissions || []);
  const [saving, setSaving] = useState(false);

  const allPermissions = [
    { id: GUARDIAN_PERMISSIONS.VIEW_MOOD_TRENDS, label: 'View Mood Trends', desc: 'See mood averages and patterns' },
    { id: GUARDIAN_PERMISSIONS.VIEW_APP_USAGE, label: 'View App Usage', desc: 'See activity stats and streaks' },
    { id: GUARDIAN_PERMISSIONS.RECEIVE_CRISIS_ALERTS, label: 'Crisis Alerts', desc: 'Get notified during crisis events' },
    { id: GUARDIAN_PERMISSIONS.VIEW_ACHIEVEMENTS, label: 'View Achievements', desc: 'See badges and milestones' }
  ];

  const togglePermission = (id) => {
    setPermissions(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(permissions);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Permissions for {link.childName}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Select what information you can access
        </p>

        <div className="space-y-3 mb-6">
          {allPermissions.map(perm => (
            <label
              key={perm.id}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                permissions.includes(perm.id) ? 'bg-purple-50' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <input
                type="checkbox"
                checked={permissions.includes(perm.id)}
                onChange={() => togglePermission(perm.id)}
                className="w-5 h-5 rounded text-purple-500"
              />
              <div>
                <p className="font-medium text-gray-800">{perm.label}</p>
                <p className="text-xs text-gray-500">{perm.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-bold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
