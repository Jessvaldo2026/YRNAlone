// FILE: src/components/GuardianLinkManager.jsx
// 👧 Child's view for managing guardian/parent links
// Approve/deny requests, see who has access, revoke links, view access log

import React, { useState, useEffect } from 'react';
import {
  Shield, Link2, Clock, Check, X, Eye, AlertTriangle,
  Bell, ChevronRight, Lock, Unlock, UserCheck, UserX,
  History, Info
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import {
  getGuardianLinks,
  approveGuardianLink,
  denyGuardianLink,
  revokeGuardianLink,
  getChildGuardianNotifications,
  getParentAccessLog,
  markNotificationRead,
  LINK_STATUS,
  GUARDIAN_PERMISSIONS,
  PROTECTED_DATA
} from '../services/guardianService';

const GuardianLinkManager = ({ onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('links');
  const [loading, setLoading] = useState(true);

  // Data
  const [pendingLinks, setPendingLinks] = useState([]);
  const [activeLinks, setActiveLinks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [accessLog, setAccessLog] = useState([]);

  // Approval modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [links, notifs, log] = await Promise.all([
        getGuardianLinks(user.uid, 'child'),
        getChildGuardianNotifications(user.uid),
        getParentAccessLog(user.uid)
      ]);

      setPendingLinks(links.filter(l => l.status === LINK_STATUS.PENDING));
      setActiveLinks(links.filter(l => l.status === LINK_STATUS.ACTIVE));
      setNotifications(notifs);
      setAccessLog(log);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!selectedLink || !verificationCode) return;

    setActionLoading(true);
    setActionResult(null);

    try {
      const result = await approveGuardianLink(selectedLink.id, user.uid, verificationCode);
      setActionResult(result);

      if (result.success) {
        await loadData();
        setTimeout(() => {
          setShowApprovalModal(false);
          setSelectedLink(null);
          setVerificationCode('');
          setActionResult(null);
        }, 2000);
      }
    } catch (error) {
      setActionResult({ success: false, error: error.message });
    }
    setActionLoading(false);
  };

  const handleDeny = async (link, reason = '') => {
    if (!confirm('Are you sure you want to deny this request?')) return;

    try {
      await denyGuardianLink(link.id, user.uid, reason);
      await loadData();
    } catch (error) {
      console.error('Error denying link:', error);
    }
  };

  const handleRevoke = async (link) => {
    if (!confirm('Are you sure you want to remove this guardian link? They will no longer be able to see your wellness data.')) {
      return;
    }

    try {
      await revokeGuardianLink(link.id, 'child');
      await loadData();
    } catch (error) {
      console.error('Error revoking link:', error);
    }
  };

  const handleNotificationRead = async (notifId) => {
    await markNotificationRead(`users/${user.uid}/guardianNotifications`, notifId);
    setNotifications(prev => prev.map(n =>
      n.id === notifId ? { ...n, read: true } : n
    ));
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: 'links', label: 'Guardian Links', icon: Link2 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
    { id: 'access', label: 'Access Log', icon: History },
    { id: 'privacy', label: 'Privacy Info', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Guardian Settings</h2>
            <p className="text-white/80 text-sm">Manage who can view your wellness data</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 rounded-full bg-white/20 hover:bg-white/30">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 transition relative whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge > 0 && (
              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* LINKS TAB */}
        {activeTab === 'links' && (
          <div className="space-y-6">
            {/* Pending Requests */}
            {pendingLinks.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  Pending Requests ({pendingLinks.length})
                </h3>
                <div className="space-y-3">
                  {pendingLinks.map(link => (
                    <div key={link.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-800">
                            A parent/guardian wants to link to your account
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Requested: {new Date(link.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Expires: {new Date(link.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => { setSelectedLink(link); setShowApprovalModal(true); }}
                          className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleDeny(link)}
                          className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg font-medium flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" /> Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Links */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-500" />
                Active Guardian Links ({activeLinks.length})
              </h3>

              {activeLinks.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No active guardian links</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Your wellness data is completely private
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeLinks.map(link => (
                    <div key={link.id} className="bg-white border rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Parent/Guardian</p>
                            <p className="text-sm text-gray-500">
                              Linked since {new Date(link.approvedAt || link.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevoke(link)}
                          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Permissions */}
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium text-gray-500 mb-2">THEY CAN SEE:</p>
                        <div className="flex flex-wrap gap-1">
                          {link.permissions?.map(perm => (
                            <span key={perm} className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">
                              {formatPermission(perm)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`bg-white border rounded-xl p-4 ${!notif.read ? 'border-purple-300 bg-purple-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      notif.type === 'parent_viewed_data' ? 'bg-blue-100' :
                      notif.type === 'guardian_request' ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}>
                      {notif.type === 'parent_viewed_data' ? (
                        <Eye className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Bell className="w-4 h-4 text-gray-600" />
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
              ))
            )}
          </div>
        )}

        {/* ACCESS LOG TAB */}
        {activeTab === 'access' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              See when your guardian viewed your data
            </p>

            {accessLog.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No access history</p>
              </div>
            ) : (
              accessLog.map(log => (
                <div key={log.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        Your guardian viewed your dashboard
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Viewed: {log.dataViewed?.join(', ')}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PRIVACY INFO TAB */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-bold text-green-800 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                What's Always Private
              </h3>
              <p className="text-sm text-green-700 mt-2">
                These are NEVER shared with your guardian, no matter what:
              </p>
              <ul className="mt-3 space-y-2">
                <li className="flex items-center gap-2 text-sm text-green-700">
                  <Check className="w-4 h-4" /> Journal entries and notes
                </li>
                <li className="flex items-center gap-2 text-sm text-green-700">
                  <Check className="w-4 h-4" /> Private messages with buddies
                </li>
                <li className="flex items-center gap-2 text-sm text-green-700">
                  <Check className="w-4 h-4" /> Support group conversations
                </li>
                <li className="flex items-center gap-2 text-sm text-green-700">
                  <Check className="w-4 h-4" /> Detailed mood notes
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="font-bold text-purple-800 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                What Guardians Can See
              </h3>
              <p className="text-sm text-purple-700 mt-2">
                If you approve a guardian link, they can see:
              </p>
              <ul className="mt-3 space-y-2">
                <li className="flex items-center gap-2 text-sm text-purple-700">
                  <Info className="w-4 h-4" /> Mood averages (not individual entries)
                </li>
                <li className="flex items-center gap-2 text-sm text-purple-700">
                  <Info className="w-4 h-4" /> App activity (streaks, days active)
                </li>
                <li className="flex items-center gap-2 text-sm text-purple-700">
                  <Info className="w-4 h-4" /> Achievements and badges
                </li>
                <li className="flex items-center gap-2 text-sm text-purple-700">
                  <AlertTriangle className="w-4 h-4" /> Crisis alerts (they get notified)
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-bold text-blue-800 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                You're In Control
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-blue-700">
                <li>• You approve or deny all guardian requests</li>
                <li>• You can remove a guardian link anytime</li>
                <li>• You see when guardians view your data</li>
                <li>• You get notified of all guardian activity</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Approve Guardian Link</h2>

            {actionResult?.success ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">✅</div>
                <p className="font-bold text-gray-800">Link Approved!</p>
                <p className="text-sm text-gray-500 mt-2">
                  Your guardian can now see your wellness data.
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Enter the verification code from your parent/guardian to approve this link.
                </p>

                {actionResult?.error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                    {actionResult.error}
                  </div>
                )}

                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none text-center text-2xl font-mono tracking-widest mb-4"
                  maxLength={6}
                />

                <div className="bg-yellow-50 rounded-xl p-3 mb-4 text-sm text-yellow-700">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Only approve if you trust this person. They will be able to see your mood trends and app activity.
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowApprovalModal(false);
                      setSelectedLink(null);
                      setVerificationCode('');
                      setActionResult(null);
                    }}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading || verificationCode.length !== 6}
                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold disabled:opacity-50"
                  >
                    {actionLoading ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function
const formatPermission = (perm) => {
  const labels = {
    [GUARDIAN_PERMISSIONS.VIEW_MOOD_TRENDS]: 'Mood Trends',
    [GUARDIAN_PERMISSIONS.VIEW_APP_USAGE]: 'App Usage',
    [GUARDIAN_PERMISSIONS.RECEIVE_CRISIS_ALERTS]: 'Crisis Alerts',
    [GUARDIAN_PERMISSIONS.APPROVE_GROUPS]: 'Group Approvals',
    [GUARDIAN_PERMISSIONS.VIEW_ACHIEVEMENTS]: 'Achievements'
  };
  return labels[perm] || perm;
};

export default GuardianLinkManager;
