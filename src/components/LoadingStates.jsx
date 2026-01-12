// FILE: src/components/LoadingStates.jsx
// ⏳ Reusable Loading State Components

import React from 'react';

// Full page loading
export const FullPageLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
    <div className="text-center">
      <div className="text-6xl animate-bounce mb-4">🧸</div>
      <p className="text-purple-600 font-medium">{message}</p>
    </div>
  </div>
);

// Skeleton card
export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border animate-pulse ${className}`}>
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
  </div>
);

// Skeleton list item
export const SkeletonListItem = () => (
  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border animate-pulse">
    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

// Skeleton stats grid
export const SkeletonStatsGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Skeleton table
export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={colIdx}
              className={`h-4 bg-gray-200 rounded ${colIdx === 0 ? 'w-1/4' : 'flex-1'}`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Inline spinner
export const Spinner = ({ size = 'md', color = 'purple' }) => {
  const sizeClass = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }[size];

  const colorClass = {
    purple: 'border-purple-200 border-t-purple-500',
    blue: 'border-blue-200 border-t-blue-500',
    green: 'border-green-200 border-t-green-500',
    white: 'border-white/30 border-t-white'
  }[color];

  return (
    <div className={`${sizeClass} border-2 ${colorClass} rounded-full animate-spin`}></div>
  );
};

// Button with loading state
export const LoadingButton = ({ loading, children, className = '', ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`${className} ${loading || props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {loading ? (
      <span className="flex items-center justify-center gap-2">
        <Spinner size="sm" color="white" />
        Loading...
      </span>
    ) : children}
  </button>
);

// Content placeholder with custom icon
export const ContentPlaceholder = ({
  icon = '📭',
  title = 'No content yet',
  description = 'Check back later',
  action = null
}) => (
  <div className="text-center py-12">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    {action}
  </div>
);

// Page loading overlay
export const LoadingOverlay = ({ message = 'Please wait...' }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
      <div className="text-5xl animate-bounce mb-4">🧸</div>
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

// Inline loading text
export const LoadingText = ({ text = 'Loading' }) => (
  <span className="inline-flex items-center gap-2">
    <Spinner size="xs" />
    {text}
  </span>
);

export default {
  FullPageLoader,
  SkeletonCard,
  SkeletonListItem,
  SkeletonStatsGrid,
  SkeletonTable,
  Spinner,
  LoadingButton,
  ContentPlaceholder,
  LoadingOverlay,
  LoadingText
};
