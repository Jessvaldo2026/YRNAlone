// 💾 FILE 28/33: src/utils/storage.js
// Local Storage Helper Functions

const STORAGE_KEYS = {
  USER: 'yrnalone_user',
  THEME: 'yrnalone_theme',
  STREAK: 'yrnalone_streak',
  MOOD_HISTORY: 'yrnalone_mood_history',
  BADGES: 'yrnalone_badges',
  PET: 'yrnalone_pet',
  SETTINGS: 'yrnalone_settings',
  LAST_CHECKIN: 'yrnalone_last_checkin'
};

// Save data to localStorage
export const saveData = (key, data) => {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

// Get data from localStorage
export const getData = (key, defaultValue = null) => {
  try {
    const jsonData = localStorage.getItem(key);
    return jsonData ? JSON.parse(jsonData) : defaultValue;
  } catch (error) {
    console.error('Error getting data:', error);
    return defaultValue;
  }
};

// Remove data from localStorage
export const removeData = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing data:', error);
    return false;
  }
};

// Clear all app data
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

// User-specific functions
export const saveUser = (user) => saveData(STORAGE_KEYS.USER, user);
export const getUser = () => getData(STORAGE_KEYS.USER);
export const removeUser = () => removeData(STORAGE_KEYS.USER);

// Theme functions
export const saveTheme = (theme) => saveData(STORAGE_KEYS.THEME, theme);
export const getTheme = () => getData(STORAGE_KEYS.THEME, {
  name: 'kawaii',
  background: 'pastel-clouds',
  textSize: 'medium'
});

// Streak functions
export const saveStreak = (streak) => saveData(STORAGE_KEYS.STREAK, streak);
export const getStreak = () => getData(STORAGE_KEYS.STREAK, 0);

export const updateStreak = () => {
  const lastCheckIn = getData(STORAGE_KEYS.LAST_CHECKIN);
  const today = new Date().toDateString();
  
  if (lastCheckIn === today) {
    return getStreak(); // Already checked in today
  }
  
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let currentStreak = getStreak();
  
  if (lastCheckIn === yesterday) {
    currentStreak += 1; // Continue streak
  } else if (lastCheckIn !== today) {
    currentStreak = 1; // Reset streak
  }
  
  saveStreak(currentStreak);
  saveData(STORAGE_KEYS.LAST_CHECKIN, today);
  return currentStreak;
};

// Mood history functions
export const saveMoodHistory = (moodHistory) => saveData(STORAGE_KEYS.MOOD_HISTORY, moodHistory);
export const getMoodHistory = () => getData(STORAGE_KEYS.MOOD_HISTORY, []);

export const addMood = (mood) => {
  const history = getMoodHistory();
  const newEntry = {
    mood,
    date: new Date().toISOString(),
    timestamp: Date.now()
  };
  history.push(newEntry);
  saveMoodHistory(history);
  return history;
};

// Badge functions
export const saveBadges = (badges) => saveData(STORAGE_KEYS.BADGES, badges);
export const getBadges = () => getData(STORAGE_KEYS.BADGES, []);

export const unlockBadge = (badgeId) => {
  const badges = getBadges();
  if (!badges.find(b => b.id === badgeId)) {
    badges.push({
      id: badgeId,
      unlockedAt: new Date().toISOString()
    });
    saveBadges(badges);
  }
  return badges;
};

// Pet functions
export const savePet = (pet) => saveData(STORAGE_KEYS.PET, pet);
export const getPet = () => getData(STORAGE_KEYS.PET, {
  type: 'teddy',
  name: 'Teddy',
  happiness: 100,
  lastFed: Date.now()
});

// Settings functions
export const saveSettings = (settings) => saveData(STORAGE_KEYS.SETTINGS, settings);
export const getSettings = () => getData(STORAGE_KEYS.SETTINGS, {
  notifications: true,
  soundEffects: true,
  darkMode: false,
  language: 'en'
});

export default {
  saveData,
  getData,
  removeData,
  clearAllData,
  saveUser,
  getUser,
  removeUser,
  saveTheme,
  getTheme,
  saveStreak,
  getStreak,
  updateStreak,
  saveMoodHistory,
  getMoodHistory,
  addMood,
  saveBadges,
  getBadges,
  unlockBadge,
  savePet,
  getPet,
  saveSettings,
  getSettings
};