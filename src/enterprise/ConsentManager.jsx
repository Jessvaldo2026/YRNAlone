// FILE: src/enterprise/ConsentManager.jsx
// 🏢 Admin Consent Management Dashboard
// View and manage consent status across organization

import React, { useState, useEffect } from 'react';
import {
  FileText, Check, X, AlertTriangle, Download, RefreshCw,
  Search, Filter, ChevronDown, Mail, Eye, Shield,
  CheckCircle, Clock, Users, BarChart3, Printer,
  Plus, Edit, Trash2, Send, AlertCircle, Loader
} from 'lucide-react';
import {
  CONSENT_TEMPLATES,
  CONSENT_TYPES,
  getOrgConsentStatus,
  generateConsentReport,
  getOrgCustomConsents,
  createCustomConsent,
  getUserConsents,
  getConsentVerification
} from '../services/consentService';

// ============================================
// 📊 MAIN CONSENT MANAGER
// ============================================

const ConsentManager = ({ organizationId, organizationName }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [consentData, setConsentData] = useState(null);
  const [customConsents, setCustomConsents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showCreateCustom, setShowCreateCustom] = useState(false);

  useEffect(() => {
    loadConsentData();
  }, [organizationId]);

  const loadConsentData = async () => {
    setLoading(true);
    try {
      const [status, customs] = await Promise.all([
        getOrgConsentStatus(organizationId),
        getOrgCustomConsents(organizationId)
      ]);
      setConsentData(status);
      setCustomConsents(customs);
    } catch (err) {
      console.error('Error loading consent data:', err);
    }
    setLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadConsentData();
    setRefreshing(false);
  };

  const handleDownloadReport = async () => {
    try {
      const report = await generateConsentReport(organizationId);
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `consent-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating report:', err);
    }
  };

  const filteredMembers = consentData?.members?.filter(member => {
    const matchesSearch = member.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.memberEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                          (filterStatus === 'compliant' && member.allRequiredSigned) ||
                          (filterStatus === 'non-compliant' && !member.allRequiredSigned);
    return matchesSearch && matchesFilter;
  }) || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'members', label: 'Member Status', icon: Users },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'audit', label: 'Audit Trail', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading consent data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              Consent Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage and track consent forms for {organizationName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <OverviewTab data={consentData} />
        )}
        {activeTab === 'members' && (
          <MembersTab
            members={filteredMembers}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onSelectMember={setSelectedMember}
          />
        )}
        {activeTab === 'templates' && (
          <TemplatesTab
            customConsents={customConsents}
            organizationId={organizationId}
            onShowCreate={() => setShowCreateCustom(true)}
            onRefresh={loadConsentData}
          />
        )}
        {activeTab === 'audit' && (
          <AuditTab organizationId={organizationId} />
        )}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberConsentModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* Create Custom Consent Modal */}
      {showCreateCustom && (
        <CreateCustomConsentModal
          organizationId={organizationId}
          onClose={() => setShowCreateCustom(false)}
          onCreated={() => {
            setShowCreateCustom(false);
            loadConsentData();
          }}
        />
      )}
    </div>
  );
};

// ============================================
// 📊 OVERVIEW TAB
// ============================================

const OverviewTab = ({ data }) => {
  const summary = data?.summary || {};

  const stats = [
    {
      label: 'Total Members',
      value: summary.totalMembers || 0,
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Fully Compliant',
      value: summary.fullyCompliant || 0,
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Compliance Rate',
      value: `${summary.complianceRate || 0}%`,
      icon: BarChart3,
      color: 'purple'
    },
    {
      label: 'Missing HIPAA',
      value: summary.missingHIPAA || 0,
      icon: AlertTriangle,
      color: 'red'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-xl border p-5 ${colorClasses[stat.color]}`}
          >
            <div className="flex items-center justify-between">
              <stat.icon className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{stat.value}</span>
            </div>
            <p className="mt-2 text-sm font-medium opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Consent Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Consent Breakdown</h3>
        <div className="space-y-4">
          {['hipaa', 'treatment', 'telehealth'].map(type => {
            const template = CONSENT_TEMPLATES[type];
            const signed = data?.members?.filter(m => m[`has${type.charAt(0).toUpperCase() + type.slice(1)}`]).length || 0;
            const total = data?.members?.length || 0;
            const percentage = total > 0 ? ((signed / total) * 100).toFixed(0) : 0;

            return (
              <div key={type} className="flex items-center gap-4">
                <span className="text-2xl">{template?.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">{template?.title}</span>
                    <span className="text-sm text-gray-500">{signed} / {total}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        percentage >= 80 ? 'bg-green-500' :
                        percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className={`font-semibold ${
                  percentage >= 80 ? 'text-green-600' :
                  percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-Compliant Members Alert */}
      {summary.missingHIPAA > 0 || summary.missingTreatment > 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Action Required</h3>
              <p className="text-red-700 mt-1">
                {summary.missingHIPAA > 0 && `${summary.missingHIPAA} members are missing HIPAA consent. `}
                {summary.missingTreatment > 0 && `${summary.missingTreatment} members are missing Treatment consent.`}
              </p>
              <p className="text-red-600 text-sm mt-2">
                Services should not be provided without required consents.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

// ============================================
// 👥 MEMBERS TAB
// ============================================

const MembersTab = ({ members, searchQuery, setSearchQuery, filterStatus, setFilterStatus, onSelectMember }) => {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Members</option>
          <option value="compliant">Compliant</option>
          <option value="non-compliant">Non-Compliant</option>
        </select>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Member</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">HIPAA</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Treatment</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Telehealth</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map(member => (
              <tr key={member.memberId} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-800">{member.memberName}</p>
                    <p className="text-sm text-gray-500">{member.memberEmail}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <ConsentBadge signed={member.hasHIPAA} />
                </td>
                <td className="px-4 py-4 text-center">
                  <ConsentBadge signed={member.hasTreatment} />
                </td>
                <td className="px-4 py-4 text-center">
                  <ConsentBadge signed={member.hasTelehealth} optional />
                </td>
                <td className="px-4 py-4 text-center">
                  {member.allRequiredSigned ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Compliant
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Incomplete
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onSelectMember(member)}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {members.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No members found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

const ConsentBadge = ({ signed, optional = false }) => {
  if (signed) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
        <Check className="w-4 h-4" />
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
      optional ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-red-600'
    }`}>
      {optional ? <span className="text-xs">-</span> : <X className="w-4 h-4" />}
    </span>
  );
};

// ============================================
// 📄 TEMPLATES TAB
// ============================================

const TemplatesTab = ({ customConsents, organizationId, onShowCreate, onRefresh }) => {
  const standardTemplates = Object.values(CONSENT_TEMPLATES);

  return (
    <div className="space-y-6">
      {/* Standard Templates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Standard Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {standardTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{template.icon}</span>
                {template.required && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                    Required
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-gray-800">{template.title}</h4>
              <p className="text-sm text-gray-500 mt-1">{template.subtitle}</p>
              <p className="text-xs text-gray-400 mt-2">Version {template.version}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Templates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Custom Templates</h3>
          <button
            onClick={onShowCreate}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Create Custom
          </button>
        </div>

        {customConsents.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No custom consent forms yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Create custom consent forms specific to your organization
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customConsents.map(consent => (
              <div
                key={consent.id}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{consent.icon || '📄'}</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    Custom
                  </span>
                </div>
                <h4 className="font-semibold text-gray-800">{consent.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{consent.subtitle}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 🛡️ AUDIT TAB
// ============================================

const AuditTab = ({ organizationId }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-purple-600" />
        <div>
          <h3 className="font-semibold text-gray-800">Consent Audit Trail</h3>
          <p className="text-sm text-gray-500">
            All consent signatures are logged with timestamps, IP addresses, and device information
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">HIPAA Compliant Audit Logging</p>
            <p className="text-sm text-green-700 mt-1">
              Every consent form signature captures:
            </p>
            <ul className="text-sm text-green-700 mt-2 space-y-1 ml-4 list-disc">
              <li>Full legal name (typed or drawn signature)</li>
              <li>Exact timestamp (ISO 8601 format)</li>
              <li>IP address for verification</li>
              <li>Device and browser information</li>
              <li>Template version number</li>
              <li>All checkbox agreements</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Retention Policy:</strong> Consent records are retained for 6 years
          in compliance with HIPAA requirements. Records can be exported for legal
          or audit purposes.
        </p>
      </div>
    </div>
  );
};

// ============================================
// 👤 MEMBER CONSENT MODAL
// ============================================

const MemberConsentModal = ({ member, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{member.memberName}</h3>
              <p className="text-sm text-gray-500">{member.memberEmail}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h4 className="font-medium text-gray-700">Consent Status</h4>

          {member.consents.length === 0 ? (
            <p className="text-gray-500 text-sm">No consent forms signed yet</p>
          ) : (
            <div className="space-y-3">
              {member.consents.map((consent, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {CONSENT_TEMPLATES[consent.type]?.title || consent.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      Signed: {new Date(consent.signedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    consent.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {consent.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {member.missingConsents.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-medium text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Missing Required Consents
              </p>
              <ul className="mt-2 space-y-1">
                {member.missingConsents.map(type => (
                  <li key={type} className="text-sm text-yellow-700">
                    • {CONSENT_TEMPLATES[type]?.title || type}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ➕ CREATE CUSTOM CONSENT MODAL
// ============================================

const CreateCustomConsentModal = ({ organizationId, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [required, setRequired] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await createCustomConsent(organizationId, {
        title,
        subtitle,
        content,
        required,
        checkboxes: [
          { id: 'agree', label: 'I have read and agree to the above', required: true }
        ]
      }, 'admin'); // In real app, pass actual admin ID

      onCreated();
    } catch (err) {
      console.error('Error creating consent:', err);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Create Custom Consent Form</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Photo Release Consent"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g., Authorization for Photography"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the full consent document text..."
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-700">Make this consent required for all members</span>
          </label>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || !content.trim() || submitting}
            className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Create Consent Form'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentManager;
