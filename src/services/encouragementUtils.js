// 💌 FILE 26/33: src/utils/encouragementUtils.js
// Random Encouragement Messages - FIXED VERSION!

export const getRandomEncouragement = () => {
  const messages = [
    "You're doing amazing! Keep going! 💜",
    "Every step forward is progress, no matter how small 🌟",
    "You matter so much, never forget that 💕",
    "I'm proud of you for showing up today ✨",
    "Your feelings are valid, always 💙",
    "You're stronger than you think, warrior 💪",
    "It's okay to not be okay right now 🫂",
    "Tomorrow is a new day, full of possibility 🌅",
    "You deserve good things and happiness 🎁",
    "Keep being brave, you're incredible 🦋",
    "Your story matters and so do you 📖",
    "You're not alone in this journey 💜",
    "Rest is productive too, be gentle 😌",
    "Small steps are still steps forward 🐾",
    "You're worthy of love and care, always 💕",
    "This feeling will pass, I promise 🌈",
    "You've survived 100% of your bad days 🌟",
    "Your existence makes a difference 💫",
    "Be proud of how far you've come 🎉",
    "You are enough, exactly as you are 💜"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getMorningEncouragement = () => {
  const messages = [
    "Good morning, beautiful soul! Today is yours ☀️",
    "Rise and shine! You've got this 🌅",
    "New day, new possibilities 💫",
    "Your presence makes today brighter ✨",
    "Morning, lovely! Let's make today count 💜",
    "You woke up today - that's brave! 🌟",
    "Fresh start, fresh energy! ☕",
    "Good morning! Remember to be gentle with yourself 💕"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getEveningEncouragement = () => {
  const messages = [
    "You made it through today! That's huge 🌙",
    "Good evening! Time to rest, you've earned it 💫",
    "Today is done. You did your best 💜",
    "Evening, friend! Proud of you today ✨",
    "Time to unwind. You deserve peace 🌟",
    "The day is ending. You survived it 💕",
    "Good evening! Be proud of yourself 🌙",
    "Rest well tonight. Tomorrow will come 💙"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getStreakEncouragement = (days) => {
  if (days >= 100) {
    return `🔥 ${days} DAYS! You're unstoppable! Absolute legend! 👑`;
  } else if (days >= 50) {
    return `💪 ${days} days strong! You're incredible! 🌟`;
  } else if (days >= 30) {
    return `🎉 ${days} days! A whole month! You're amazing! ✨`;
  } else if (days >= 14) {
    return `⭐ ${days} days! Two weeks! Keep going! 💜`;
  } else if (days >= 7) {
    return `🔥 ${days} days! One week! You're on fire! 💪`;
  } else if (days >= 3) {
    return `💜 ${days} days! Building momentum! 🌟`;
  } else {
    return `🌱 Day ${days}! Every journey starts here! ✨`;
  }
};

export const getMoodBasedEncouragement = (mood) => {
  const messages = {
    '😢': [
      "I see you're hurting. It's okay to cry. 💙",
      "This is hard, but you're not alone. 🫂",
      "Your pain is valid. We're here with you. 💕"
    ],
    '😟': [
      "Tough day? That's okay. Tomorrow is new. 💜",
      "You're doing better than you think. 💪",
      "Be gentle with yourself right now. 🌸"
    ],
    '😐': [
      "Neutral is okay. You don't have to be happy. ✨",
      "Some days are just days. That's fine. 💜",
      "You showed up. That counts. 🌟"
    ],
    '🙂': [
      "Glad you're feeling a bit better! 💕",
      "Small wins are still wins! 🎉",
      "Your smile matters, keep going! ✨"
    ],
    '😊': [
      "Look at you shining! So proud! 🌟",
      "Your joy is beautiful! Keep it up! 💕",
      "You deserve this happiness! 🎉"
    ]
  };
  
  return messages[mood] 
    ? messages[mood][Math.floor(Math.random() * messages[mood].length)]
    : "You're doing great! Keep being you! 💜";
};

export const getCrisisEncouragement = () => {
  const messages = [
    "You matter. Your life has value. Please stay. 💕",
    "This pain is temporary. You are permanent. 🫂",
    "The world needs you in it. Please hold on. 💙",
    "You are loved, even if it doesn't feel like it. 💜",
    "Call 988 right now. They want to hear from you. 📞",
    "Your story isn't over yet. Please stay. 🌟"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getAchievementEncouragement = (achievement) => {
  const messages = {
    first_post: "You took the first step! So brave! 💪✨",
    week_streak: "7 days strong! You're building something beautiful! 🔥",
    kind_soul: "Your kindness changes lives! Keep being amazing! 💕",
    month_streak: "30 days! Look at you go, legend! 👑🎉"
  };
  return messages[achievement] || "Amazing achievement! So proud of you! 🌟";
};

export default {
  getRandomEncouragement,
  getMorningEncouragement,
  getEveningEncouragement,
  getStreakEncouragement,
  getMoodBasedEncouragement,
  getCrisisEncouragement,
  getAchievementEncouragement
};