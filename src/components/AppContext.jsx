import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};


export const AppProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('home');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');

  // Translations
  const translations = {
    en: {
      home: 'Home',
      journal: 'Journal',
      progress: 'Progress',
      calm: 'Calm',
      groups: 'Groups',
      achievements: 'Achievements',
      customize: 'Customize',
      privacy: 'Privacy',
      welcomeBack: 'Welcome back!',
      howFeeling: "How are you feeling?",
      shareThoughts: "Share your thoughts...",
      postAnonymously: "Post anonymously",
      keepPrivate: "Keep private",
      sharePublicly: "Share publicly",
      saveEntry: "Save Entry",
      yourJournal: "Your Private Journal",
      moodTracker: "Mood Tracker",
      checkIn: "Daily Check-In"
    }
  };

  const t = translations[language] || translations.en;

  const value = {
    currentView,
    setCurrentView,
    loading,
    setLoading,
    language,
    setLanguage,
    t
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;