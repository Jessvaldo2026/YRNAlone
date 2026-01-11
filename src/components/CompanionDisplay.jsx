// FILE: src/components/Companion/CompanionDisplay.jsx
// ✨ Displays the user's companion with beautiful animations

import React, { useState, useEffect } from 'react';
import { useCompanion, ACCESSORIES } from './CompanionContext';

const CompanionDisplay = ({ showMessage = true, size = 'normal' }) => {
  const { companion, companionName, accessory, getRandomMessage } = useCompanion();
  const [message, setMessage] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });

  // Random movement
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPosition(prev => ({
        x: Math.max(5, Math.min(85, prev.x + (Math.random() - 0.5) * 15)),
        y: Math.max(5, Math.min(75, prev.y + (Math.random() - 0.5) * 15))
      }));
    }, 3000);

    return () => clearInterval(moveInterval);
  }, []);

  // Random messages
  useEffect(() => {
    if (!showMessage) return;
    
    const messageInterval = setInterval(() => {
      setMessage(getRandomMessage());
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 4000);
    }, 12000);

    // Show first message after 3 seconds
    const firstMessage = setTimeout(() => {
      setMessage(getRandomMessage());
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 4000);
    }, 3000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(firstMessage);
    };
  }, [showMessage, getRandomMessage]);

  const sizeClasses = {
    small: 'text-4xl',
    normal: 'text-6xl',
    large: 'text-8xl'
  };

  const accessoryEmoji = ACCESSORIES[accessory]?.emoji || '';

  return (
    <div 
      className="fixed z-50 cursor-pointer transition-all duration-1000 hover:scale-110"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`, 
        transform: 'translate(-50%, -50%)' 
      }}
      onClick={() => {
        setMessage(getRandomMessage());
        setShowBubble(true);
        setTimeout(() => setShowBubble(false), 4000);
      }}
    >
      <div className="relative">
        {/* Companion */}
        <div className={`${sizeClasses[size]} animate-bounce relative`}>
          {companion?.emoji || '🧸'}
          {accessoryEmoji && (
            <span className="absolute -top-2 -right-1 text-2xl">
              {accessoryEmoji}
            </span>
          )}
        </div>
        
        {/* Speech bubble */}
        {showBubble && message && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 
                          bg-white rounded-2xl p-3 shadow-lg whitespace-nowrap 
                          animate-fade-in border-2 border-purple-200 max-w-xs">
            <div className="text-sm font-semibold text-purple-600 text-center">
              {message}
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              - {companionName} 💜
            </div>
            {/* Speech bubble arrow */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 
                            w-0 h-0 border-l-8 border-r-8 border-b-8 
                            border-transparent border-b-white"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mini version for headers/cards
export const CompanionMini = ({ className = '' }) => {
  const { companion, accessory } = useCompanion();
  const accessoryEmoji = ACCESSORIES[accessory]?.emoji || '';
  
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="text-2xl">{companion?.emoji || '🧸'}</span>
      {accessoryEmoji && (
        <span className="absolute -top-1 -right-1 text-xs">{accessoryEmoji}</span>
      )}
    </div>
  );
};

// Avatar version for profile
export const CompanionAvatar = ({ size = 'md', className = '' }) => {
  const { companion, companionName, accessory } = useCompanion();
  const accessoryEmoji = ACCESSORIES[accessory]?.emoji || '';
  
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl',
    xl: 'w-32 h-32 text-6xl'
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center 
                    bg-gradient-to-br from-purple-100 to-pink-100 
                    border-4 border-white shadow-lg`}
        style={{ backgroundColor: companion?.color + '22' }}
      >
        <span>{companion?.emoji || '🧸'}</span>
        {accessoryEmoji && (
          <span className="absolute -top-1 -right-1 text-lg bg-white rounded-full p-1 shadow">
            {accessoryEmoji}
          </span>
        )}
      </div>
      <div className="text-center mt-1 text-sm font-medium text-gray-700">
        {companionName}
      </div>
    </div>
  );
};

export default CompanionDisplay;
