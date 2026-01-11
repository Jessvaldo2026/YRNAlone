// FILE: src/components/CancelSubscription.jsx
// Cancel subscription with feedback survey for ALL users (individual + org)

import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const CancelSubscription = ({ user, subscription, onClose, onCancelled }) => {
  const [step, setStep] = useState(1); // 1: confirm, 2: survey, 3: done
  const [cancelling, setCancelling] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [otherReason, setOtherReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [wouldReturn, setWouldReturn] = useState(null);
  const [rating, setRating] = useState(0);

  const cancelReasons = [
    { id: 'expensive', emoji: '💰', label: "It's too expensive" },
    { id: 'not_using', emoji: '📱', label: "I'm not using it enough" },
    { id: 'missing_features', emoji: '🔧', label: "Missing features I need" },
    { id: 'found_alternative', emoji: '🔄', label: "Found a better alternative" },
    { id: 'temporary', emoji: '⏸️', label: "Just need a break" },
    { id: 'technical_issues', emoji: '🐛', label: "Technical issues / bugs" },
    { id: 'not_helpful', emoji: '😕', label: "Didn't help my mental health" },
    { id: 'privacy', emoji: '🔒', label: "Privacy concerns" },
    { id: 'other', emoji: '✏️', label: "Other reason" },
  ];

  const toggleReason = (id) => {
    if (selectedReasons.includes(id)) {
      setSelectedReasons(selectedReasons.filter(r => r !== id));
    } else {
      setSelectedReasons([...selectedReasons, id]);
    }
  };

  const handleContinueToSurvey = () => {
    setStep(2);
  };

  const handleSubmitSurvey = async () => {
    setCancelling(true);

    try {
      // Save feedback to database
      await addDoc(collection(db, 'cancellation_feedback'), {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'unknown',
        subscriptionType: subscription?.type || 'premium',
        reasons: selectedReasons,
        otherReason: otherReason,
        feedback: feedback,
        wouldReturn: wouldReturn,
        rating: rating,
        cancelledAt: new Date().toISOString(),
      });

      // In production: Call Stripe to cancel subscription
      // await cancelStripeSubscription(subscription.stripeId);

      setStep(3);
    } catch (error) {
      console.error('Error saving feedback:', error);
      // Still proceed with cancellation
      setStep(3);
    }

    setCancelling(false);
  };

  const handleSkipSurvey = async () => {
    setCancelling(true);
    
    // Save minimal feedback
    try {
      await addDoc(collection(db, 'cancellation_feedback'), {
        userId: user?.uid || 'anonymous',
        reasons: ['skipped_survey'],
        cancelledAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error(e);
    }

    // In production: Call Stripe to cancel
    setStep(3);
    setCancelling(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full my-8">
        
        {/* Step 1: Confirm Cancel */}
        {step === 1 && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">😢</div>
              <h2 className="text-2xl font-bold text-gray-800">We'll miss you!</h2>
              <p className="text-gray-500 mt-2">Are you sure you want to cancel your subscription?</p>
            </div>

            {/* What you'll lose */}
            <div className="bg-red-50 rounded-xl p-4 mb-6">
              <p className="text-red-700 font-medium mb-3">You'll lose access to:</p>
              <ul className="space-y-2 text-red-600 text-sm">
                <li>❌ Unlimited AI companion chats</li>
                <li>❌ Unlimited journal entries</li>
                <li>❌ All 11 support groups</li>
                <li>❌ Advanced mood insights</li>
                <li>❌ Sleep tracker</li>
                <li>❌ Priority support</li>
              </ul>
            </div>

            {/* Special offer */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 mb-6 text-white">
              <p className="font-bold mb-1">💜 Wait! Special offer just for you:</p>
              <p className="text-sm opacity-90">Get 50% off your next month if you stay!</p>
              <button className="mt-3 bg-white text-purple-600 px-4 py-2 rounded-lg font-bold text-sm w-full">
                Claim 50% Off →
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold"
              >
                Keep My Subscription 💜
              </button>
              <button
                onClick={handleContinueToSurvey}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium"
              >
                Continue Cancelling
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Survey */}
        {step === 2 && (
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">📝</div>
              <h2 className="text-xl font-bold text-gray-800">Help us improve</h2>
              <p className="text-gray-500 text-sm mt-1">Your feedback helps us make YRNAlone better for everyone</p>
            </div>

            {/* Reason Selection */}
            <div className="mb-6">
              <p className="font-medium text-gray-700 mb-3">Why are you cancelling? (select all that apply)</p>
              <div className="space-y-2">
                {cancelReasons.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => toggleReason(reason.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                      selectedReasons.includes(reason.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <span className="text-xl">{reason.emoji}</span>
                    <span className={selectedReasons.includes(reason.id) ? 'text-purple-700' : 'text-gray-700'}>
                      {reason.label}
                    </span>
                    {selectedReasons.includes(reason.id) && (
                      <span className="ml-auto text-purple-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Other reason text */}
            {selectedReasons.includes('other') && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please tell us more:
                </label>
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="What could we have done better?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Rating */}
            <div className="mb-6">
              <p className="font-medium text-gray-700 mb-3">How would you rate your experience?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-4xl transition transform hover:scale-110 ${
                      star <= rating ? 'grayscale-0' : 'grayscale opacity-30'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-400 mt-2">
                {rating === 0 && 'Tap to rate'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Great'}
                {rating === 5 && 'Excellent!'}
              </p>
            </div>

            {/* Would you return */}
            <div className="mb-6">
              <p className="font-medium text-gray-700 mb-3">Would you consider returning in the future?</p>
              <div className="flex gap-3">
                {['Yes', 'Maybe', 'No'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setWouldReturn(option)}
                    className={`flex-1 py-3 rounded-xl font-medium transition ${
                      wouldReturn === option
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option === 'Yes' && '👍 '}
                    {option === 'Maybe' && '🤔 '}
                    {option === 'No' && '👎 '}
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional feedback */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anything else you'd like to share? (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Your feedback helps us improve..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Submit buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSkipSurvey}
                disabled={cancelling}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium"
              >
                Skip & Cancel
              </button>
              <button
                onClick={handleSubmitSurvey}
                disabled={cancelling || selectedReasons.length === 0}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
              >
                {cancelling ? 'Processing...' : 'Submit & Cancel'}
              </button>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full text-purple-600 py-3 mt-3 font-medium"
            >
              ← Go Back
            </button>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">💜</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Subscription Cancelled</h2>
            <p className="text-gray-500 mb-6">
              Your premium access will remain active until<br />
              <strong className="text-gray-700">February 2, 2026</strong>
            </p>

            <div className="bg-purple-50 rounded-xl p-4 mb-6">
              <p className="text-purple-700">
                Thank you for being part of our community. You can resubscribe anytime! 🧸
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-gray-600 text-sm">
                <strong>Remember:</strong> Free features are still available:
              </p>
              <ul className="text-gray-500 text-sm mt-2 space-y-1">
                <li>✓ 3 AI chats per day</li>
                <li>✓ 5 journal entries per month</li>
                <li>✓ Basic mood tracking</li>
                <li>✓ Crisis resources</li>
              </ul>
            </div>

            <button
              onClick={() => {
                if (onCancelled) onCancelled();
                onClose();
              }}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold"
            >
              Got it 💜
            </button>

            <button
              className="w-full text-purple-600 py-3 mt-2 font-medium"
            >
              Changed my mind - Resubscribe
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancelSubscription;
