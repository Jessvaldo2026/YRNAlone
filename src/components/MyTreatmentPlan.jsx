// FILE: src/components/MyTreatmentPlan.jsx
// 🎯 Patient Treatment Plan View
// Shows patients their treatment goals and progress

import React, { useState, useEffect } from 'react';
import {
  Target, CheckCircle, Clock, TrendingUp, Star,
  ChevronRight, Award, Calendar, User, Heart,
  Sparkles, ArrowLeft, Loader
} from 'lucide-react';
import {
  GOAL_STATUS,
  GOAL_CATEGORIES,
  getMemberTreatmentPlan,
  calculatePlanProgress
} from '../services/treatmentPlanService';

// ============================================
// 🎯 MAIN COMPONENT
// ============================================

const MyTreatmentPlan = ({ userId, organizationId, onBack }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    loadPlan();
  }, [userId, organizationId]);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const memberPlan = await getMemberTreatmentPlan(organizationId, userId);
      setPlan(memberPlan);
    } catch (err) {
      console.error('Error loading treatment plan:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your treatment plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        )}

        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Treatment Plan Yet</h2>
          <p className="text-gray-600">
            Your therapist will create a personalized treatment plan for you. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  const progress = calculatePlanProgress(plan);
  const achievedGoals = plan.goals?.filter(g => g.status === GOAL_STATUS.ACHIEVED).length || 0;
  const totalGoals = plan.goals?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-6">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">My Treatment Plan</h1>
            <p className="text-purple-200 text-sm">Your journey to wellness</p>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="white"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 2.2} 220`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{progress}%</span>
              </div>
            </div>
            <div>
              <p className="font-semibold">Overall Progress</p>
              <p className="text-purple-200 text-sm">
                {achievedGoals} of {totalGoals} goals achieved
              </p>
              <p className="text-purple-200 text-xs mt-1">
                With {plan.therapistName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4">
        {/* Encouragement Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">
                {progress >= 75 ? "Amazing progress! You're almost there!" :
                 progress >= 50 ? "You're doing great! Keep it up!" :
                 progress >= 25 ? "Good start! Every step counts!" :
                 "Your healing journey begins now!"}
              </p>
              <p className="text-sm text-gray-500">
                Started {new Date(plan.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            My Goals
          </h2>

          <div className="space-y-3">
            {plan.goals?.map((goal, idx) => {
              const category = GOAL_CATEGORIES.find(c => c.id === goal.category);
              const isAchieved = goal.status === GOAL_STATUS.ACHIEVED;

              return (
                <div
                  key={goal.id || idx}
                  onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
                  className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                    isAchieved
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isAchieved ? 'bg-green-200' : 'bg-purple-100'
                    }`}>
                      {isAchieved ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <span className="text-lg">{category?.icon || '🎯'}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${isAchieved ? 'text-green-800' : 'text-gray-800'}`}>
                          {goal.title}
                        </h3>
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                          selectedGoal === goal.id ? 'rotate-90' : ''
                        }`} />
                      </div>
                      <p className="text-sm text-gray-500">{category?.label}</p>

                      {/* Progress Bar */}
                      {!isAchieved && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium text-gray-700">{goal.progress || 0}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full transition-all"
                              style={{ width: `${goal.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {isAchieved && (
                        <div className="mt-2 flex items-center gap-2 text-green-600">
                          <Award className="w-4 h-4" />
                          <span className="text-sm font-medium">Goal Achieved!</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {selectedGoal === goal.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {goal.description && (
                        <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                      )}

                      {goal.objectives?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Steps to achieve:</p>
                          <ul className="space-y-2">
                            {goal.objectives.map((obj, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  isAchieved ? 'bg-green-200' : 'bg-purple-100'
                                }`}>
                                  {isAchieved ? (
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <span className="text-xs text-purple-600">{i + 1}</span>
                                  )}
                                </div>
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {goal.progressHistory?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 mb-2">Recent updates:</p>
                          {goal.progressHistory.slice(-3).reverse().map((entry, i) => (
                            <div key={i} className="text-xs text-gray-500 mb-1">
                              {new Date(entry.date).toLocaleDateString()} - {entry.progress}%
                              {entry.notes && `: ${entry.notes}`}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Treatment Info */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            My Treatment
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Therapist</p>
                <p className="font-medium text-gray-800">{plan.therapistName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Sessions</p>
                <p className="font-medium text-gray-800">{plan.frequency}</p>
              </div>
            </div>

            {plan.modalities?.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Approach</p>
                <div className="flex flex-wrap gap-2">
                  {plan.modalities.map(m => (
                    <span key={m} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Review */}
        {plan.nextReviewDate && (
          <div className="bg-purple-100 rounded-2xl p-4 text-center">
            <p className="text-purple-800 text-sm">
              <strong>Next Review:</strong> {new Date(plan.nextReviewDate).toLocaleDateString()}
            </p>
            <p className="text-purple-600 text-xs mt-1">
              Your therapist will review your progress and update goals
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 📊 TREATMENT PLAN MINI CARD (For Dashboard)
// ============================================

export const TreatmentPlanMiniCard = ({ userId, organizationId, onClick }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMemberTreatmentPlan(organizationId, userId)
      .then(setPlan)
      .finally(() => setLoading(false));
  }, [userId, organizationId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!plan) return null;

  const progress = calculatePlanProgress(plan);
  const achievedGoals = plan.goals?.filter(g => g.status === GOAL_STATUS.ACHIEVED).length || 0;
  const totalGoals = plan.goals?.length || 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-600" />
          Treatment Plan
        </h3>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#e5e7eb"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#7c3aed"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${progress * 1.26} 126`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-800">{progress}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            {achievedGoals} of {totalGoals} goals achieved
          </p>
          <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTreatmentPlan;
