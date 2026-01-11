// FILE: src/services/index.js
// 🚀 YRNAlone Complete Services Index
// All Firebase services organized and ready to use

import { db, auth } from '../firebase';
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc,
  getDocs, query, where, orderBy, limit, serverTimestamp,
  Timestamp, increment, arrayUnion, arrayRemove, setDoc
} from 'firebase/firestore';

// ============================================
// 👤 USER SERVICE
// ============================================

export const UserService = {
  // Get user profile
  async getProfile(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId, data) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  },

  // Update streak
  async updateStreak(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      const lastActivity = userData?.lastActivityDate?.toDate();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let newStreak = 1;
      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        lastDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak = (userData.streak || 0) + 1;
        } else if (diffDays === 0) {
          newStreak = userData.streak || 1;
        }
      }

      await updateDoc(userRef, {
        streak: newStreak,
        longestStreak: Math.max(newStreak, userData?.longestStreak || 0),
        lastActivityDate: serverTimestamp()
      });

      return { success: true, streak: newStreak };
    } catch (error) {
      console.error('Error updating streak:', error);
      return { success: false };
    }
  }
};

// ============================================
// 😊 MOOD SERVICE
// ============================================

export const MoodService = {
  // Log a mood
  async logMood(userId, moodData) {
    try {
      const moodsRef = collection(db, 'users', userId, 'moods');
      await addDoc(moodsRef, {
        ...moodData,
        timestamp: serverTimestamp()
      });
      
      // Update streak
      await UserService.updateStreak(userId);
      
      return { success: true };
    } catch (error) {
      console.error('Error logging mood:', error);
      return { success: false, error: error.message };
    }
  },

  // Get mood history
  async getMoodHistory(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const moodsRef = collection(db, 'users', userId, 'moods');
      const q = query(
        moodsRef,
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
    } catch (error) {
      console.error('Error getting mood history:', error);
      return [];
    }
  },

  // Get mood stats
  async getMoodStats(userId, days = 30) {
    const moods = await this.getMoodHistory(userId, days);
    
    const stats = {
      total: moods.length,
      byMood: {},
      byDay: {},
      trend: 'stable'
    };

    moods.forEach(m => {
      const mood = m.mood?.toLowerCase() || m.label?.toLowerCase();
      stats.byMood[mood] = (stats.byMood[mood] || 0) + 1;
      
      const day = m.timestamp?.toLocaleDateString('en', { weekday: 'long' });
      if (day) {
        if (!stats.byDay[day]) stats.byDay[day] = [];
        stats.byDay[day].push(mood);
      }
    });

    return stats;
  }
};

// ============================================
// 📝 JOURNAL SERVICE
// ============================================

export const JournalService = {
  // Save journal entry
  async saveEntry(userId, entry) {
    try {
      const journalRef = collection(db, 'users', userId, 'journal');
      
      if (entry.id) {
        // Update existing
        await updateDoc(doc(journalRef, entry.id), {
          ...entry,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new
        await addDoc(journalRef, {
          ...entry,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // Update streak
      await UserService.updateStreak(userId);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving journal entry:', error);
      return { success: false, error: error.message };
    }
  },

  // Get journal entries
  async getEntries(userId, limitCount = 50) {
    try {
      const journalRef = collection(db, 'users', userId, 'journal');
      const q = query(journalRef, orderBy('createdAt', 'desc'), limit(limitCount));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));
    } catch (error) {
      console.error('Error getting journal entries:', error);
      return [];
    }
  },

  // Delete entry
  async deleteEntry(userId, entryId) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'journal', entryId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting entry:', error);
      return { success: false };
    }
  }
};

// ============================================
// 👥 GROUPS SERVICE
// ============================================

export const GroupsService = {
  // Get all groups
  async getGroups() {
    try {
      const groupsRef = collection(db, 'groups');
      const snapshot = await getDocs(groupsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting groups:', error);
      return [];
    }
  },

  // Join group
  async joinGroup(userId, groupId, userData) {
    try {
      const memberRef = doc(db, 'groups', groupId, 'members', userId);
      await setDoc(memberRef, {
        ...userData,
        joinedAt: serverTimestamp()
      });
      
      await updateDoc(doc(db, 'groups', groupId), {
        memberCount: increment(1)
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error joining group:', error);
      return { success: false };
    }
  },

  // Leave group
  async leaveGroup(userId, groupId) {
    try {
      await deleteDoc(doc(db, 'groups', groupId, 'members', userId));
      await updateDoc(doc(db, 'groups', groupId), {
        memberCount: increment(-1)
      });
      return { success: true };
    } catch (error) {
      console.error('Error leaving group:', error);
      return { success: false };
    }
  },

  // Send message to group
  async sendMessage(groupId, message) {
    try {
      const messagesRef = collection(db, 'groups', groupId, 'messages');
      await addDoc(messagesRef, {
        ...message,
        timestamp: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false };
    }
  },

  // Get group messages
  async getMessages(groupId, limitCount = 50) {
    try {
      const messagesRef = collection(db, 'groups', groupId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(limitCount));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })).reverse();
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }
};

// ============================================
// 🎮 GAMIFICATION SERVICE
// ============================================

export const GamificationService = {
  // Add points
  async addPoints(userId, action, points) {
    try {
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        points: increment(points),
        [`pointsLog.${Date.now()}`]: { action, points }
      });
      
      // Check for level up
      const userDoc = await getDoc(userRef);
      const totalPoints = userDoc.data()?.points || 0;
      
      return { success: true, totalPoints };
    } catch (error) {
      console.error('Error adding points:', error);
      return { success: false };
    }
  },

  // Get leaderboard
  async getLeaderboard(limitCount = 10) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('points', 'desc'), limit(limitCount));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc, i) => ({
        rank: i + 1,
        id: doc.id,
        name: doc.data().name || doc.data().username,
        points: doc.data().points || 0,
        level: doc.data().level || 1
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  },

  // Unlock achievement
  async unlockAchievement(userId, achievementId) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        achievements: arrayUnion(achievementId),
        [`achievementDates.${achievementId}`]: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return { success: false };
    }
  }
};

// ============================================
// 🆘 CRISIS SERVICE
// ============================================

export const CrisisService = {
  // Log crisis keywords detected
  async logCrisisDetection(userId, content, keywords) {
    try {
      await addDoc(collection(db, 'crisisLogs'), {
        userId,
        content: content.substring(0, 200), // Limit content length
        keywords,
        timestamp: serverTimestamp(),
        status: 'detected'
      });
      return { success: true };
    } catch (error) {
      console.error('Error logging crisis:', error);
      return { success: false };
    }
  },

  // Get crisis resources
  getCrisisResources() {
    return [
      { name: '988 Suicide & Crisis Lifeline', phone: '988', type: 'call' },
      { name: 'Crisis Text Line', phone: '741741', type: 'text', message: 'HOME' },
      { name: 'National Domestic Violence Hotline', phone: '1-800-799-7233', type: 'call' },
      { name: 'SAMHSA Helpline', phone: '1-800-662-4357', type: 'call' },
      { name: 'Trevor Project (LGBTQ+)', phone: '1-866-488-7386', type: 'call' }
    ];
  }
};

// ============================================
// 📊 ANALYTICS SERVICE
// ============================================

export const AnalyticsService = {
  // Track event
  async trackEvent(userId, eventName, eventData = {}) {
    try {
      await addDoc(collection(db, 'analytics'), {
        userId,
        event: eventName,
        data: eventData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  },

  // Get user activity summary
  async getActivitySummary(userId, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const analyticsRef = collection(db, 'analytics');
      const q = query(
        analyticsRef,
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(startDate))
      );
      
      const snapshot = await getDocs(q);
      const events = snapshot.docs.map(doc => doc.data());
      
      return {
        totalEvents: events.length,
        byType: events.reduce((acc, e) => {
          acc[e.event] = (acc[e.event] || 0) + 1;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Error getting activity summary:', error);
      return { totalEvents: 0, byType: {} };
    }
  }
};

// ============================================
// 🔧 EXPORT ALL
// ============================================

export default {
  UserService,
  MoodService,
  JournalService,
  GroupsService,
  GamificationService,
  CrisisService,
  AnalyticsService
};
