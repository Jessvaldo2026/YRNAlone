// FILE: src/enterprise/TreatmentPlans.jsx
// 🎯 Treatment Plan Management for Therapists
// Create, manage, and track patient treatment plans

import React, { useState, useEffect } from 'react';
import {
  Target, Plus, Edit, Trash2, ChevronRight, ChevronDown,
  Clock, CheckCircle, AlertCircle, Calendar, User,
  FileText, TrendingUp, BarChart3, RefreshCw, Search,
  X, Save, ArrowLeft, Eye, Clipboard, Award, Loader,
  Play, Pause, Check, Star, AlertTriangle
} from 'lucide-react';
import {
  PLAN_STATUS,
  GOAL_STATUS,
  GOAL_PRIORITY,
  GOAL_CATEGORIES,
  TREATMENT_MODALITIES,
  PLAN_TEMPLATES,
  createTreatmentPlan,
  getTherapistTreatmentPlans,
  getOrgTreatmentPlans,
  getMemberTreatmentPlan,
  updateGoalProgress,
  updateGoalStatus,
  addGoalToPlan,
  addPlanReview,
  completeTreatmentPlan,
  putPlanOnHold,
  updatePlanStatus,
  calculatePlanProgress,
  getTreatmentPlanAnalytics,
  getPlansNeedingReview
} from '../services/treatmentPlanService';

// ============================================
// 🎯 MAIN TREATMENT PLANS COMPONENT
// ============================================

const TreatmentPlans = ({ organizationId, therapistId, therapistName, isAdmin = false }) => {
  const [activeView, setActiveView] = useState('list'); // list, create, detail
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [plansNeedingReview, setPlansNeedingReview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');

  useEffect(() => {
    loadData();
  }, [organizationId, therapistId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansList, stats, needsReview] = await Promise.all([
        isAdmin
          ? getOrgTreatmentPlans(organizationId)
          : getTherapistTreatmentPlans(organizationId, therapistId),
        getTreatmentPlanAnalytics(organizationId),
        getPlansNeedingReview(organizationId, isAdmin ? null : therapistId)
      ]);

      setPlans(plansList);
      setAnalytics(stats);
      setPlansNeedingReview(needsReview);
    } catch (err) {
      console.error('Error loading treatment plans:', err);
    }
    setLoading(false);
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.memberName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plan.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                          plan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handlePlanCreated = async (newPlan) => {
    await loadData();
    setActiveView('list');
  };

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setActiveView('detail');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading treatment plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeView !== 'list' && (
              <button
                onClick={() => {
                  setActiveView('list');
                  setSelectedPlan(null);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-600" />
                Treatment Plans
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {activeView === 'create' ? 'Create New Plan' :
                 activeView === 'detail' ? selectedPlan?.memberName :
                 `${plans.length} total plans`}
              </p>
            </div>
          </div>

          {activeView === 'list' && (
            <button
              onClick={() => setActiveView('create')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
              New Plan
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeView === 'list' && (
          <PlansList
            plans={filteredPlans}
            analytics={analytics}
            plansNeedingReview={plansNeedingReview}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onViewPlan={handleViewPlan}
            onRefresh={loadData}
          />
        )}

        {activeView === 'create' && (
          <CreatePlanForm
            organizationId={organizationId}
            therapistId={therapistId}
            therapistName={therapistName}
            onCancel={() => setActiveView('list')}
            onCreated={handlePlanCreated}
          />
        )}

        {activeView === 'detail' && selectedPlan && (
          <PlanDetail
            plan={selectedPlan}
            organizationId={organizationId}
            therapistId={therapistId}
            therapistName={therapistName}
            onUpdate={loadData}
            onBack={() => {
              setActiveView('list');
              setSelectedPlan(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// ============================================
// 📋 PLANS LIST VIEW
// ============================================

const PlansList = ({
  plans,
  analytics,
  plansNeedingReview,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  onViewPlan,
  onRefresh
}) => {
  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Active Plans"
            value={analytics.byStatus?.active || 0}
            icon={Play}
            color="green"
          />
          <StatCard
            label="Avg Progress"
            value={`${analytics.avgProgress || 0}%`}
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            label="Goals Achieved"
            value={analytics.goalStats?.achieved || 0}
            icon={CheckCircle}
            color="blue"
          />
          <StatCard
            label="Needs Review"
            value={plansNeedingReview.length}
            icon={AlertTriangle}
            color={plansNeedingReview.length > 0 ? 'yellow' : 'gray'}
          />
        </div>
      )}

      {/* Review Alert */}
      {plansNeedingReview.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">
                {plansNeedingReview.length} plan{plansNeedingReview.length > 1 ? 's' : ''} need review
              </p>
              <p className="text-sm text-yellow-700">
                Click on a plan to add a review and update goals
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient or diagnosis..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
        <button
          onClick={onRefresh}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onClick={() => onViewPlan(plan)}
            needsReview={plansNeedingReview.some(p => p.id === plan.id)}
          />
        ))}
      </div>

      {plans.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No treatment plans found</p>
          <p className="text-gray-400 text-sm mt-1">Create a new plan to get started</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <Icon className="w-6 h-6 opacity-80" />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="mt-2 text-sm font-medium opacity-80">{label}</p>
    </div>
  );
};

const PlanCard = ({ plan, onClick, needsReview }) => {
  const progress = calculatePlanProgress(plan);
  const achievedGoals = plan.goals?.filter(g => g.status === GOAL_STATUS.ACHIEVED).length || 0;
  const totalGoals = plan.goals?.length || 0;

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    on_hold: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
    discontinued: 'bg-gray-100 text-gray-700'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-5 cursor-pointer hover:shadow-md transition-shadow ${
        needsReview ? 'border-yellow-300 ring-2 ring-yellow-100' : 'border-gray-200'
      }`}
    >
      {needsReview && (
        <div className="flex items-center gap-2 text-yellow-600 text-xs font-medium mb-3">
          <AlertTriangle className="w-3 h-3" />
          Needs Review
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{plan.memberName}</h3>
          <p className="text-sm text-gray-500">{plan.diagnosis}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[plan.status]}`}>
          {plan.status.replace('_', ' ')}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-800">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              progress >= 80 ? 'bg-green-500' :
              progress >= 50 ? 'bg-yellow-500' : 'bg-purple-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Goals Summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 flex items-center gap-1">
          <Target className="w-4 h-4" />
          {achievedGoals}/{totalGoals} goals
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

// ============================================
// ➕ CREATE PLAN FORM
// ============================================

const CreatePlanForm = ({ organizationId, therapistId, therapistName, onCancel, onCreated }) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    memberId: '',
    memberName: '',
    diagnosis: '',
    presentingProblems: [''],
    goals: [],
    modalities: [],
    frequency: 'Weekly',
    startDate: new Date().toISOString().split('T')[0],
    targetEndDate: '',
    notes: ''
  });
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'symptom_reduction',
    priority: 'medium',
    objectives: [''],
    targetDate: ''
  });

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;

    setFormData({
      ...formData,
      goals: [...formData.goals, {
        ...newGoal,
        objectives: newGoal.objectives.filter(o => o.trim())
      }]
    });

    setNewGoal({
      title: '',
      description: '',
      category: 'symptom_reduction',
      priority: 'medium',
      objectives: [''],
      targetDate: ''
    });
  };

  const handleRemoveGoal = (index) => {
    setFormData({
      ...formData,
      goals: formData.goals.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    if (!formData.memberName || !formData.diagnosis || formData.goals.length === 0) {
      alert('Please fill in patient name, diagnosis, and at least one goal');
      return;
    }

    setSaving(true);
    try {
      const result = await createTreatmentPlan(organizationId, {
        ...formData,
        therapistId,
        therapistName,
        memberId: formData.memberId || `member_${Date.now()}` // In real app, select from patient list
      }, therapistId);

      if (result.success) {
        onCreated(result.plan);
      } else {
        alert('Failed to create plan');
      }
    } catch (err) {
      console.error('Error creating plan:', err);
      alert('Error creating plan');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
              step >= s ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {s}
            </div>
            {s < 3 && (
              <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-purple-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Step 1: Patient Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Patient Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.memberName}
                onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                placeholder="Enter patient name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                placeholder="e.g., Generalized Anxiety Disorder"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presenting Problems
              </label>
              {formData.presentingProblems.map((problem, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={problem}
                    onChange={(e) => {
                      const updated = [...formData.presentingProblems];
                      updated[idx] = e.target.value;
                      setFormData({ ...formData, presentingProblems: updated });
                    }}
                    placeholder="Describe presenting problem"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  {idx === formData.presentingProblems.length - 1 && (
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        presentingProblems: [...formData.presentingProblems, '']
                      })}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option>Weekly</option>
                  <option>Bi-weekly</option>
                  <option>Monthly</option>
                  <option>As needed</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Treatment Goals</h2>

            {/* Existing Goals */}
            {formData.goals.length > 0 && (
              <div className="space-y-3">
                {formData.goals.map((goal, idx) => {
                  const category = GOAL_CATEGORIES.find(c => c.id === goal.category);
                  return (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{category?.icon || '🎯'}</span>
                          <div>
                            <h4 className="font-medium text-gray-800">{goal.title}</h4>
                            <p className="text-sm text-gray-500">{category?.label}</p>
                            {goal.objectives.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {goal.objectives.map((obj, i) => (
                                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                    {obj}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveGoal(idx)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add New Goal */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-4">Add Goal</h3>

              <div className="space-y-4">
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Goal title (e.g., Reduce anxiety symptoms)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {GOAL_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objectives (measurable steps)
                  </label>
                  {newGoal.objectives.map((obj, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => {
                          const updated = [...newGoal.objectives];
                          updated[idx] = e.target.value;
                          setNewGoal({ ...newGoal, objectives: updated });
                        }}
                        placeholder="e.g., Practice breathing exercises 3x/week"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      />
                      {idx === newGoal.objectives.length - 1 && (
                        <button
                          onClick={() => setNewGoal({
                            ...newGoal,
                            objectives: [...newGoal.objectives, '']
                          })}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddGoal}
                  disabled={!newGoal.title.trim()}
                  className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>
            </div>

            {formData.goals.length === 0 && (
              <p className="text-center text-gray-500 text-sm">
                Add at least one treatment goal to continue
              </p>
            )}
          </div>
        )}

        {/* Step 3: Treatment Details */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Treatment Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Treatment Modalities
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TREATMENT_MODALITIES.map(modality => (
                  <label
                    key={modality}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.modalities.includes(modality)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.modalities.includes(modality)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            modalities: [...formData.modalities, modality]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            modalities: formData.modalities.filter(m => m !== modality)
                          });
                        }
                      }}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{modality}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes about the treatment plan..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Summary */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-medium text-purple-800 mb-2">Plan Summary</h3>
              <div className="text-sm text-purple-700 space-y-1">
                <p><strong>Patient:</strong> {formData.memberName}</p>
                <p><strong>Diagnosis:</strong> {formData.diagnosis}</p>
                <p><strong>Goals:</strong> {formData.goals.length}</p>
                <p><strong>Modalities:</strong> {formData.modalities.join(', ') || 'None selected'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onCancel()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && (!formData.memberName || !formData.diagnosis)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving || formData.goals.length === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Plan
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📄 PLAN DETAIL VIEW
// ============================================

const PlanDetail = ({ plan, organizationId, therapistId, therapistName, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState('goals');
  const [updatingGoal, setUpdatingGoal] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const progress = calculatePlanProgress(plan);

  const handleUpdateProgress = async (goalId, newProgress, notes) => {
    const result = await updateGoalProgress(organizationId, plan.id, goalId, {
      progress: newProgress,
      notes
    }, therapistId);

    if (result.success) {
      onUpdate();
    }
    setUpdatingGoal(null);
  };

  const handleMarkGoalAchieved = async (goalId) => {
    await updateGoalStatus(organizationId, plan.id, goalId, GOAL_STATUS.ACHIEVED, '', therapistId);
    onUpdate();
  };

  const tabs = [
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'reviews', label: 'Reviews', icon: Clipboard },
    { id: 'details', label: 'Details', icon: FileText }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Plan Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{plan.memberName}</h2>
            <p className="text-gray-600">{plan.diagnosis}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              plan.status === 'active' ? 'bg-green-100 text-green-700' :
              plan.status === 'on_hold' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {plan.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-medium text-gray-800">{progress}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                progress >= 80 ? 'bg-green-500' :
                progress >= 50 ? 'bg-yellow-500' : 'bg-purple-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Started</p>
            <p className="font-medium text-gray-800">{plan.startDate}</p>
          </div>
          <div>
            <p className="text-gray-500">Next Review</p>
            <p className="font-medium text-gray-800">{plan.nextReviewDate || 'Not set'}</p>
          </div>
          <div>
            <p className="text-gray-500">Therapist</p>
            <p className="font-medium text-gray-800">{plan.therapistName}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 border border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
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

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Treatment Goals</h3>
              <span className="text-sm text-gray-500">
                {plan.goals?.filter(g => g.status === GOAL_STATUS.ACHIEVED).length || 0} of {plan.goals?.length || 0} achieved
              </span>
            </div>

            {plan.goals?.map(goal => {
              const category = GOAL_CATEGORIES.find(c => c.id === goal.category);
              const isUpdating = updatingGoal === goal.id;

              return (
                <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{category?.icon || '🎯'}</span>
                      <div>
                        <h4 className="font-medium text-gray-800">{goal.title}</h4>
                        <p className="text-sm text-gray-500">{category?.label}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      goal.status === GOAL_STATUS.ACHIEVED ? 'bg-green-100 text-green-700' :
                      goal.status === GOAL_STATUS.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{goal.progress || 0}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${goal.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Objectives */}
                  {goal.objectives?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Objectives:</p>
                      <ul className="space-y-1">
                        {goal.objectives.map((obj, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  {goal.status !== GOAL_STATUS.ACHIEVED && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      {isUpdating ? (
                        <ProgressUpdateForm
                          currentProgress={goal.progress || 0}
                          onSave={(progress, notes) => handleUpdateProgress(goal.id, progress, notes)}
                          onCancel={() => setUpdatingGoal(null)}
                        />
                      ) : (
                        <>
                          <button
                            onClick={() => setUpdatingGoal(goal.id)}
                            className="flex-1 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                          >
                            <TrendingUp className="w-4 h-4" />
                            Update Progress
                          </button>
                          <button
                            onClick={() => handleMarkGoalAchieved(goal.id)}
                            className="flex-1 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Achieved
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Plan Reviews</h3>
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Review
              </button>
            </div>

            {plan.reviews?.length > 0 ? (
              plan.reviews.map((review, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-800">
                      Review - {new Date(review.date).toLocaleDateString()}
                    </p>
                    <span className="text-sm text-gray-500">{review.overallProgress}% progress</span>
                  </div>
                  <p className="text-gray-600 text-sm">{review.summary}</p>
                  {review.recommendations && (
                    <p className="text-sm text-purple-600 mt-2">
                      <strong>Recommendations:</strong> {review.recommendations}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No reviews yet</p>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Presenting Problems</h4>
              <ul className="list-disc list-inside text-gray-600">
                {plan.presentingProblems?.filter(p => p).map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Treatment Modalities</h4>
              <div className="flex flex-wrap gap-2">
                {plan.modalities?.map(m => (
                  <span key={m} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {plan.notes && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                <p className="text-gray-600">{plan.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewFormModal
          plan={plan}
          organizationId={organizationId}
          therapistId={therapistId}
          therapistName={therapistName}
          onClose={() => setShowReviewForm(false)}
          onSaved={() => {
            setShowReviewForm(false);
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

const ProgressUpdateForm = ({ currentProgress, onSave, onCancel }) => {
  const [progress, setProgress] = useState(currentProgress);
  const [notes, setNotes] = useState('');

  return (
    <div className="w-full space-y-3">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Progress: {progress}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes (optional)"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
      />
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(progress, notes)}
          className="flex-1 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

const ReviewFormModal = ({ plan, organizationId, therapistId, therapistName, onClose, onSaved }) => {
  const [overallProgress, setOverallProgress] = useState(calculatePlanProgress(plan));
  const [summary, setSummary] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [nextReviewDate, setNextReviewDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await addPlanReview(organizationId, plan.id, {
      overallProgress,
      summary,
      recommendations,
      nextReviewDate
    }, therapistId);

    if (result.success) {
      onSaved();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Add Plan Review</h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Overall Progress: {overallProgress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={overallProgress}
              onChange={(e) => setOverallProgress(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Summarize patient progress and current status..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recommendations
            </label>
            <textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Any recommendations or plan modifications..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Review Date
            </label>
            <input
              type="date"
              value={nextReviewDate}
              onChange={(e) => setNextReviewDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!summary.trim() || saving}
            className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TreatmentPlans;
