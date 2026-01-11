// FILE: src/components/FeatureTour.jsx
// ✨ Interactive Feature Tour with Spotlight Effect
// Professional walkthrough that highlights UI elements

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

// ============================================
// 🎯 TOUR DEFINITIONS
// ============================================

export const TOURS = {
  home: {
    id: 'home',
    name: 'Home Screen Tour',
    steps: [
      {
        target: '[data-tour="mood-button"]',
        title: 'Track Your Mood 😊',
        content: 'Tap here to log how you\'re feeling. Quick, easy, and helps you understand your patterns.',
        position: 'bottom'
      },
      {
        target: '[data-tour="journal-button"]',
        title: 'Your Private Journal 📝',
        content: 'Write your thoughts here. It\'s completely private and helps process emotions.',
        position: 'bottom'
      },
      {
        target: '[data-tour="community-button"]',
        title: 'Find Your Community 👥',
        content: 'Connect with others who understand. Join support groups and share experiences.',
        position: 'top'
      },
      {
        target: '[data-tour="companion"]',
        title: 'Your Companion 💜',
        content: 'This is your wellness buddy! They\'ll celebrate your progress and be there for you.',
        position: 'bottom'
      },
      {
        target: '[data-tour="streak"]',
        title: 'Keep Your Streak! 🔥',
        content: 'Check in daily to build your streak. Consistency leads to real change.',
        position: 'left'
      }
    ]
  },
  journal: {
    id: 'journal',
    name: 'Journal Tour',
    steps: [
      {
        target: '[data-tour="new-entry"]',
        title: 'Start Writing ✏️',
        content: 'Tap here to create a new journal entry. Write whatever is on your mind.',
        position: 'bottom'
      },
      {
        target: '[data-tour="prompts"]',
        title: 'Need Inspiration? 💡',
        content: 'Use prompts when you\'re not sure what to write about.',
        position: 'bottom'
      },
      {
        target: '[data-tour="entries"]',
        title: 'Your Entries 📚',
        content: 'All your past entries are here. Tap any to read or edit.',
        position: 'top'
      }
    ]
  },
  groups: {
    id: 'groups',
    name: 'Support Groups Tour',
    steps: [
      {
        target: '[data-tour="browse-groups"]',
        title: 'Explore Groups 🔍',
        content: 'Browse groups by topic. Find communities that match your interests.',
        position: 'bottom'
      },
      {
        target: '[data-tour="my-groups"]',
        title: 'Your Groups 🏠',
        content: 'Groups you\'ve joined appear here for quick access.',
        position: 'bottom'
      },
      {
        target: '[data-tour="create-post"]',
        title: 'Share Your Story 💬',
        content: 'When you\'re ready, share with the community. You\'re not alone!',
        position: 'top'
      }
    ]
  },
  admin: {
    id: 'admin',
    name: 'Admin Dashboard Tour',
    steps: [
      {
        target: '[data-tour="overview"]',
        title: 'Dashboard Overview 📊',
        content: 'See all your organization\'s wellness metrics at a glance.',
        position: 'bottom'
      },
      {
        target: '[data-tour="members"]',
        title: 'Member Management 👥',
        content: 'View and manage all members in your organization.',
        position: 'bottom'
      },
      {
        target: '[data-tour="alerts"]',
        title: 'Crisis Alerts 🚨',
        content: 'Get notified when members need extra support.',
        position: 'bottom'
      },
      {
        target: '[data-tour="reports"]',
        title: 'Generate Reports 📄',
        content: 'Export wellness data and analytics for stakeholders.',
        position: 'bottom'
      }
    ]
  }
};

// ============================================
// 🎬 FEATURE TOUR COMPONENT
// ============================================

const FeatureTour = ({ tourId, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);

  const tour = TOURS[tourId];
  const step = tour?.steps[currentStep];

  useEffect(() => {
    if (!step) return;

    // Wait for DOM to settle
    const timer = setTimeout(() => {
      const target = document.querySelector(step.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        setIsVisible(true);

        // Scroll into view if needed
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Element not found, skip to next
        console.warn(`Tour target not found: ${step.target}`);
        handleNext();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [currentStep, step]);

  const handleNext = () => {
    setIsVisible(false);
    if (currentStep < tour.steps.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 200);
    } else {
      // Tour complete
      localStorage.setItem(`tour_${tourId}_completed`, 'true');
      onComplete?.();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsVisible(false);
      setTimeout(() => setCurrentStep(prev => prev - 1), 200);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`tour_${tourId}_skipped`, 'true');
    onSkip?.();
  };

  if (!tour || !step) return null;

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (!targetRect) return { opacity: 0 };

    const padding = 16;
    const tooltipWidth = 280;
    const tooltipHeight = 160;

    let top, left;

    switch (step.position) {
      case 'top':
        top = targetRect.top - tooltipHeight - padding;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.right + padding;
        break;
      default:
        top = targetRect.bottom + padding;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
    }

    // Keep within viewport
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

    return { top, left, opacity: isVisible ? 1 : 0 };
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight ring */}
      {targetRect && (
        <div
          className="absolute pointer-events-none border-2 border-purple-400 rounded-xl animate-pulse"
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 4px rgba(168, 85, 247, 0.3), 0 0 20px rgba(168, 85, 247, 0.5)'
          }}
        />
      )}

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 text-white/70 hover:text-white text-sm font-medium flex items-center gap-1"
      >
        Skip Tour
        <X className="w-4 h-4" />
      </button>

      {/* Progress indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2">
        <span className="text-white text-sm font-medium">
          {currentStep + 1} / {tour.steps.length}
        </span>
        <div className="flex gap-1">
          {tour.steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentStep ? 'bg-purple-400' : 
                i < currentStep ? 'bg-white/60' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute w-[280px] transition-opacity duration-200"
        style={getTooltipStyle()}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <h3 className="text-white font-bold text-lg">{step.title}</h3>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-4">
            <p className="text-gray-600 text-sm leading-relaxed">{step.content}</p>
          </div>

          {/* Actions */}
          <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1 text-gray-500 hover:text-purple-500 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition"
            >
              <span className="text-sm font-medium">
                {currentStep === tour.steps.length - 1 ? 'Finish' : 'Next'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Arrow pointer */}
        <div
          className={`absolute w-4 h-4 bg-white transform rotate-45 ${
            step.position === 'top' ? 'bottom-[-8px] left-1/2 -translate-x-1/2' :
            step.position === 'bottom' ? 'top-[-8px] left-1/2 -translate-x-1/2' :
            step.position === 'left' ? 'right-[-8px] top-1/2 -translate-y-1/2' :
            'left-[-8px] top-1/2 -translate-y-1/2'
          }`}
          style={{ boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' }}
        />
      </div>
    </div>
  );
};

// ============================================
// 🎮 TOUR TRIGGER BUTTON
// ============================================

export const TourButton = ({ tourId, children, className = '' }) => {
  const [showTour, setShowTour] = useState(false);

  const hasCompleted = localStorage.getItem(`tour_${tourId}_completed`);

  return (
    <>
      <button
        onClick={() => setShowTour(true)}
        className={className}
      >
        {children}
      </button>

      {showTour && (
        <FeatureTour
          tourId={tourId}
          onComplete={() => setShowTour(false)}
          onSkip={() => setShowTour(false)}
        />
      )}
    </>
  );
};

// ============================================
// 🚀 AUTO-START TOUR FOR NEW USERS
// ============================================

export const AutoTour = ({ tourId, delay = 1000 }) => {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(`tour_${tourId}_completed`);
    const hasSkipped = localStorage.getItem(`tour_${tourId}_skipped`);

    if (!hasCompleted && !hasSkipped) {
      const timer = setTimeout(() => setShowTour(true), delay);
      return () => clearTimeout(timer);
    }
  }, [tourId, delay]);

  if (!showTour) return null;

  return (
    <FeatureTour
      tourId={tourId}
      onComplete={() => setShowTour(false)}
      onSkip={() => setShowTour(false)}
    />
  );
};

// ============================================
// 📍 TOUR TARGET WRAPPER
// ============================================

export const TourTarget = ({ id, children, className = '' }) => (
  <div data-tour={id} className={className}>
    {children}
  </div>
);

export default FeatureTour;
