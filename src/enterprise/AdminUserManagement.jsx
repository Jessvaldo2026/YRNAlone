// FILE: src/enterprise/AdminUserManagement.jsx
// 🔒 Admin User Management Dashboard
// Lock, suspend, ban, and restore user accounts

import React, { useState, useEffect } from 'react';
import {
  Search, Lock, Unlock, Ban, Clock, Shield, AlertTriangle,
  User, Mail, Calendar, Activity, ChevronRight, X,
  RefreshCw, Filter, Download, FileText, History,
  CheckCircle, XCircle, ArrowLeft, MoreVertical
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import {
  ACCOUNT_STATUS,
  STATUS_REASONS,
  REASON_LABELS,
  searchUsers,
  getUsersByStatus,
  getAccountManagementSummary,
  lockAccount,
  suspendAccount,
  banAccount,
  unlockAccount,
  getAccountActionHistory,
  getPendingAppeals,
  getPendingUnlockRequests,
  processAppeal
} from '../services/accountManagementService';

const AdminUserManagement = ({ onBack }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [summary, setSummary] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [appeals, setAppeals] = useState([]);
  const [unlockRequests, setUnlockRequests] = useState([]);

  // Modal states
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'lock', 'suspend', 'ban', 'unlock'
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [actionDetails, setActionDetails] = useState('');
  const [suspendUntil, setSuspendUntil] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  // User detail modal
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [userHistory, setUserHistory] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryData, pendingAppeals, pendingUnlocks] = await Promise.all([
        getAccountManagementSummary(),
        getPendingAppeals(),
        getPendingUnlockRequests()
      ]);

      if (summaryData.success) {
        setSummary(summaryData.summary);
      }
      setAppeals(pendingAppeals);
      setUnlockRequests(pendingUnlocks);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
      setActiveTab('search');
    } catch (error) {
      console.error('Error searching:', error);
    }
    setLoading(false);
  };

  const handleFilterByStatus = async (status) => {
    setFilterStatus(status);
    setLoading(true);
    try {
      if (status === 'all') {
        setSearchResults([]);
      } else {
        const results = await getUsersByStatus(status);
        setSearchResults(results);
      }
      setActiveTab('search');
    } catch (error) {
      console.error('Error filtering:', error);
    }
    setLoading(false);
  };

  const openActionModal = (type, userItem) => {
    setActionType(type);
    setSelectedUser(userItem);
    setActionReason('');
    setActionDetails('');
    setSuspendUntil('');
    setActionResult(null);
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;
    if (actionType !== 'unlock' && !actionReason) return;
    if (actionType === 'suspend' && !suspendUntil) return;

    setActionLoading(true);
    setActionResult(null);

    try {
      let result;

      switch (actionType) {
        case 'lock':
          result = await lockAccount(selectedUser.id, user.uid, actionReason, actionDetails);
          break;
        case 'suspend':
          result = await suspendAccount(selectedUser.id, user.uid, actionReason, suspendUntil, actionDetails);
          break;
        case 'ban':
          result = await banAccount(selectedUser.id, user.uid, actionReason, actionDetails);
          break;
        case 'unlock':
          result = await unlockAccount(selectedUser.id, user.uid, actionDetails);
          break;
        default:
          result = { success: false, error: 'Unknown action' };
      }

      setActionResult(result);

      if (result.success) {
        await loadDashboardData();
        // Update search results if exists
        if (searchResults.length > 0) {
          setSearchResults(prev => prev.map(u =>
            u.id === selectedUser.id
              ? { ...u, accountStatus: actionType === 'unlock' ? ACCOUNT_STATUS.ACTIVE : actionType === 'ban' ? ACCOUNT_STATUS.BANNED : actionType === 'suspend' ? ACCOUNT_STATUS.SUSPENDED : ACCOUNT_STATUS.LOCKED }
              : u
          ));
        }
        setTimeout(() => {
          setShowActionModal(false);
          setActionResult(null);
        }, 2000);
      }
    } catch (error) {
      setActionResult({ success: false, error: error.message });
    }
    setActionLoading(false);
  };

  const handleViewUser = async (userItem) => {
    setSelectedUser(userItem);
    setShowUserDetail(true);
    try {
      const history = await getAccountActionHistory(userItem.id);
      setUserHistory(history);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleProcessAppeal = async (appealId, approved) => {
    const notes = prompt('Add admin notes (optional):') || '';
    try {
      await processAppeal(appealId, user.uid, approved, notes);
      await loadDashboardData();
    } catch (error) {
      console.error('Error processing appeal:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      [ACCOUNT_STATUS.ACTIVE]: 'bg-green-100 text-green-700',
      [ACCOUNT_STATUS.LOCKED]: 'bg-orange-100 text-orange-700',
      [ACCOUNT_STATUS.SUSPENDED]: 'bg-yellow-100 text-yellow-700',
      [ACCOUNT_STATUS.BANNED]: 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'search', label: 'Search Users', icon: Search },
    { id: 'appeals', label: 'Appeals', icon: FileText, badge: appeals.length + unlockRequests.length }
  ];

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="p-2 rounded-full bg-white/20 hover:bg-white/30">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  User Management
                </h1>
                <p className="text-white/70 text-sm">Manage account status and access</p>
              </div>
            </div>
            <button
              onClick={loadDashboardData}
              disabled={refreshing}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex">
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
                <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && summary && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard
                label="Total Users"
                value={summary.total}
                icon={User}
                color="purple"
              />
              <StatCard
                label="Active"
                value={summary.active}
                icon={CheckCircle}
                color="green"
                onClick={() => handleFilterByStatus(ACCOUNT_STATUS.ACTIVE)}
              />
              <StatCard
                label="Locked"
                value={summary.locked}
                icon={Lock}
                color="orange"
                onClick={() => handleFilterByStatus(ACCOUNT_STATUS.LOCKED)}
              />
              <StatCard
                label="Suspended"
                value={summary.suspended}
                icon={Clock}
                color="yellow"
                onClick={() => handleFilterByStatus(ACCOUNT_STATUS.SUSPENDED)}
              />
              <StatCard
                label="Banned"
                value={summary.banned}
                icon={Ban}
                color="red"
                onClick={() => handleFilterByStatus(ACCOUNT_STATUS.BANNED)}
              />
            </div>

            {/* Quick Search */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Quick Search</h3>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by email or name..."
                    className="w-full pl-12 pr-4 py-3 border rounded-xl focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Pending Actions */}
            {(appeals.length > 0 || unlockRequests.length > 0) && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Pending Actions ({appeals.length + unlockRequests.length})
                </h3>
                <p className="text-orange-700 mb-4">
                  There are user appeals and unlock requests waiting for review.
                </p>
                <button
                  onClick={() => setActiveTab('appeals')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl font-medium"
                >
                  Review Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* SEARCH TAB */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by email or name..."
                    className="w-full pl-12 pr-4 py-3 border rounded-xl focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600"
                >
                  Search
                </button>
              </div>

              {/* Status Filters */}
              <div className="flex gap-2 flex-wrap">
                {['all', ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.LOCKED, ACCOUNT_STATUS.SUSPENDED, ACCOUNT_STATUS.BANNED].map(status => (
                  <button
                    key={status}
                    onClick={() => handleFilterByStatus(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      filterStatus === status
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            {searchResults.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <p className="text-sm text-gray-500">{searchResults.length} users found</p>
                </div>
                <div className="divide-y">
                  {searchResults.map(userItem => (
                    <div key={userItem.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-purple-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{userItem.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{userItem.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(userItem.accountStatus)}`}>
                            {userItem.accountStatus || 'active'}
                          </span>

                          {/* Action Buttons */}
                          <div className="flex gap-1">
                            {userItem.accountStatus !== ACCOUNT_STATUS.ACTIVE && (
                              <button
                                onClick={() => openActionModal('unlock', userItem)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                title="Unlock"
                              >
                                <Unlock className="w-5 h-5" />
                              </button>
                            )}
                            {userItem.accountStatus === ACCOUNT_STATUS.ACTIVE && (
                              <>
                                <button
                                  onClick={() => openActionModal('lock', userItem)}
                                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                                  title="Lock"
                                >
                                  <Lock className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => openActionModal('suspend', userItem)}
                                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                  title="Suspend"
                                >
                                  <Clock className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => openActionModal('ban', userItem)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Ban"
                                >
                                  <Ban className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleViewUser(userItem)}
                              className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                              title="View Details"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Suspension info */}
                      {userItem.accountStatus === ACCOUNT_STATUS.SUSPENDED && userItem.suspendedUntil && (
                        <p className="text-xs text-yellow-600 mt-2 ml-16">
                          Suspended until {new Date(userItem.suspendedUntil).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : searchQuery && (
              <div className="bg-white rounded-2xl p-8 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        )}

        {/* APPEALS TAB */}
        {activeTab === 'appeals' && (
          <div className="space-y-6">
            {/* Appeals */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4">Account Appeals ({appeals.length})</h3>
              {appeals.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-gray-500">
                  No pending appeals
                </div>
              ) : (
                <div className="space-y-3">
                  {appeals.map(appeal => (
                    <div key={appeal.id} className="bg-white rounded-xl p-4 border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{appeal.email}</p>
                          <p className="text-sm text-gray-600 mt-1">{appeal.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            Submitted: {new Date(appeal.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleProcessAppeal(appeal.id, true)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleProcessAppeal(appeal.id, false)}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium text-sm"
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unlock Requests */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4">Unlock Requests ({unlockRequests.length})</h3>
              {unlockRequests.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-gray-500">
                  No pending unlock requests
                </div>
              ) : (
                <div className="space-y-3">
                  {unlockRequests.map(request => (
                    <div key={request.id} className="bg-white rounded-xl p-4 border">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{request.email}</p>
                          <p className="text-sm text-gray-600 mt-1">{request.reason}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            Submitted: {new Date(request.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser({ id: request.userId, email: request.email });
                              openActionModal('unlock', { id: request.userId, email: request.email });
                            }}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium text-sm"
                          >
                            Unlock
                          </button>
                          <button
                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium text-sm"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            {actionResult?.success ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">
                  {actionType === 'unlock' ? '🔓' : actionType === 'ban' ? '🚫' : '🔒'}
                </div>
                <p className="font-bold text-gray-800">{actionResult.message}</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  {actionType === 'lock' && <><Lock className="w-5 h-5 text-orange-500" /> Lock Account</>}
                  {actionType === 'suspend' && <><Clock className="w-5 h-5 text-yellow-500" /> Suspend Account</>}
                  {actionType === 'ban' && <><Ban className="w-5 h-5 text-red-500" /> Ban Account</>}
                  {actionType === 'unlock' && <><Unlock className="w-5 h-5 text-green-500" /> Unlock Account</>}
                </h2>

                <p className="text-gray-600 mb-4">
                  {selectedUser.name || selectedUser.email}
                </p>

                {actionResult?.error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
                    {actionResult.error}
                  </div>
                )}

                {actionType !== 'unlock' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                      <select
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl focus:border-purple-400 focus:outline-none"
                      >
                        <option value="">Select a reason...</option>
                        {Object.entries(REASON_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {actionType === 'suspend' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Suspend Until *</label>
                        <input
                          type="date"
                          value={suspendUntil}
                          onChange={(e) => setSuspendUntil(e.target.value)}
                          min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border rounded-xl focus:border-purple-400 focus:outline-none"
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes {actionType === 'unlock' ? '(optional)' : ''}
                  </label>
                  <textarea
                    value={actionDetails}
                    onChange={(e) => setActionDetails(e.target.value)}
                    placeholder="Add any additional details..."
                    className="w-full px-4 py-3 border rounded-xl focus:border-purple-400 focus:outline-none resize-none h-24"
                  />
                </div>

                {actionType === 'ban' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    This is a permanent action. The user will not be able to access their account.
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowActionModal(false);
                      setActionResult(null);
                    }}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAction}
                    disabled={actionLoading || (actionType !== 'unlock' && !actionReason) || (actionType === 'suspend' && !suspendUntil)}
                    className={`flex-1 py-3 text-white rounded-xl font-bold disabled:opacity-50 ${
                      actionType === 'unlock' ? 'bg-green-500 hover:bg-green-600' :
                      actionType === 'ban' ? 'bg-red-500 hover:bg-red-600' :
                      'bg-orange-500 hover:bg-orange-600'
                    }`}
                  >
                    {actionLoading ? 'Processing...' :
                      actionType === 'unlock' ? 'Unlock Account' :
                      actionType === 'ban' ? 'Ban Account' :
                      actionType === 'suspend' ? 'Suspend Account' :
                      'Lock Account'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">User Details</h2>
              <button onClick={() => setShowUserDetail(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-purple-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">{selectedUser.name || 'Unknown'}</p>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedUser.accountStatus)}`}>
                    {selectedUser.accountStatus || 'active'}
                  </span>
                </div>
              </div>

              {/* Status Info */}
              {selectedUser.statusReason && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700">Status Reason:</p>
                  <p className="text-gray-600">{REASON_LABELS[selectedUser.statusReason] || selectedUser.statusReason}</p>
                  {selectedUser.suspendedUntil && (
                    <p className="text-sm text-gray-500 mt-2">
                      Suspended until: {new Date(selectedUser.suspendedUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Action History */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Action History
                </h3>
                {userHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">No action history</p>
                ) : (
                  <div className="space-y-2">
                    {userHistory.map(action => (
                      <div key={action.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            action.action === 'unlock' ? 'bg-green-100 text-green-700' :
                            action.action === 'ban' ? 'bg-red-100 text-red-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {action.action}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(action.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {action.reason && (
                          <p className="text-sm text-gray-600 mt-1">
                            Reason: {REASON_LABELS[action.reason] || action.reason}
                          </p>
                        )}
                        {action.adminName && (
                          <p className="text-xs text-gray-400 mt-1">By: {action.adminName}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color, onClick }) => {
  const colors = {
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`bg-white rounded-2xl p-6 shadow-sm text-left transition ${onClick ? 'hover:shadow-md cursor-pointer' : ''}`}
    >
      <div className={`p-2 rounded-xl ${colors[color]} w-fit mb-2`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </button>
  );
};

export default AdminUserManagement;
