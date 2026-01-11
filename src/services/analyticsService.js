// FILE: src/services/analyticsService.js
// 📊 Real data aggregation for enterprise dashboards

import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Get all members for an organization
export const getOrgMembers = async (organizationId) => {
  try {
    const membersQuery = query(
      collection(db, 'users'),
      where('organizationId', '==', organizationId)
    );
    const snapshot = await getDocs(membersQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Error fetching members:', err);
    return [];
  }
};

// Calculate real mood analytics for organization
export const getOrgMoodAnalytics = async (organizationId, days = 30) => {
  const members = await getOrgMembers(organizationId);
  
  if (members.length === 0) {
    return {
      avgMoodScore: 0,
      totalCheckIns: 0,
      moodDistribution: {},
      weekOverWeek: 0
    };
  }

  const moodScores = {
    'happy': 9, '😊': 9, 'loved': 8, '🥰': 8,
    'calm': 7, '😌': 7, 'neutral': 5, '😐': 5,
    'tired': 4, '😴': 4, 'anxious': 3, '😰': 3,
    'sad': 2, '😢': 2, 'angry': 2, '😡': 2
  };

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const allMoodData = [];

  // Collect mood data from members
  members.forEach(member => {
    if (member.moodHistory && Array.isArray(member.moodHistory)) {
      member.moodHistory.forEach(mood => {
        const moodDate = new Date(mood.timestamp || mood.date || mood.createdAt);
        if (moodDate >= startDate) {
          allMoodData.push(mood);
        }
      });
    }
  });

  // Calculate scores
  const scores = allMoodData.map(m => {
    const mood = (m.mood || m.label || '').toLowerCase();
    return moodScores[mood] || moodScores[m.emoji] || 5;
  });

  const avgMoodScore = scores.length > 0 
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : 0;

  // Mood distribution
  const moodDistribution = {};
  allMoodData.forEach(m => {
    const mood = m.mood || m.label || m.emoji || 'unknown';
    moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;
  });

  // Week over week change
  const thisWeekScores = scores.slice(0, Math.min(7, scores.length));
  const lastWeekScores = scores.slice(7, Math.min(14, scores.length));
  
  const thisWeekAvg = thisWeekScores.length > 0 
    ? thisWeekScores.reduce((a, b) => a + b, 0) / thisWeekScores.length : 0;
  const lastWeekAvg = lastWeekScores.length > 0 
    ? lastWeekScores.reduce((a, b) => a + b, 0) / lastWeekScores.length : 0;
  
  const weekOverWeek = lastWeekAvg > 0 
    ? (((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100).toFixed(1)
    : 0;

  return {
    avgMoodScore: parseFloat(avgMoodScore),
    totalCheckIns: allMoodData.length,
    moodDistribution,
    weekOverWeek: parseFloat(weekOverWeek)
  };
};

// Get engagement metrics
export const getOrgEngagement = async (organizationId) => {
  const members = await getOrgMembers(organizationId);
  
  const now = new Date();
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const getLastActive = (member) => {
    return new Date(member.lastActive || member.updatedAt || member.createdAt || now);
  };

  const activeToday = members.filter(m => getLastActive(m) >= dayAgo).length;
  const activeThisWeek = members.filter(m => getLastActive(m) >= weekAgo).length;
  const activeThisMonth = members.filter(m => getLastActive(m) >= monthAgo).length;
  const inactive = members.length - activeThisMonth;

  const totalJournalEntries = members.reduce((sum, m) => {
    return sum + (m.journalEntries?.length || m.stats?.journalEntries || 0);
  }, 0);

  const totalPosts = members.reduce((sum, m) => {
    return sum + (m.posts?.length || m.stats?.postsCreated || 0);
  }, 0);

  const atRiskMembers = members.filter(m => {
    const lastActive = getLastActive(m);
    return lastActive < weekAgo;
  });

  return {
    totalMembers: members.length,
    activeToday,
    activeThisWeek,
    activeThisMonth,
    inactive,
    totalJournalEntries,
    totalPosts,
    atRiskCount: atRiskMembers.length,
    atRiskMembers: atRiskMembers.map(m => ({
      id: m.id,
      name: m.name || m.username,
      lastActive: getLastActive(m).toISOString()
    })),
    engagementRate: members.length > 0 
      ? ((activeThisWeek / members.length) * 100).toFixed(1)
      : 0
  };
};

// Get alerts for concerning patterns
export const getOrgAlerts = async (organizationId) => {
  const members = await getOrgMembers(organizationId);
  const alerts = [];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  members.forEach(member => {
    const recentMoods = member.moodHistory?.slice(-7) || [];
    const lowMoods = recentMoods.filter(m => 
      ['sad', 'anxious', 'angry', '😢', '😰', '😡'].includes(m.mood || m.emoji)
    );

    if (lowMoods.length >= 5) {
      alerts.push({
        type: 'low_mood_pattern',
        severity: 'medium',
        message: 'Member showing sustained low mood pattern',
        memberId: member.id,
        memberName: member.name || member.username,
        timestamp: new Date().toISOString()
      });
    }

    const wasActive = member.stats?.daysActive > 14;
    const lastActive = new Date(member.lastActive || member.createdAt);
    
    if (wasActive && lastActive < weekAgo) {
      alerts.push({
        type: 'engagement_drop',
        severity: 'low',
        message: 'Previously active member has disengaged',
        memberId: member.id,
        memberName: member.name || member.username,
        timestamp: new Date().toISOString()
      });
    }
  });

  return {
    totalAlerts: alerts.length,
    alerts: alerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
  };
};

// Get complete dashboard data in one call
export const getOrgDashboardData = async (organizationId) => {
  try {
    const members = await getOrgMembers(organizationId);
    
    // Calculate all metrics from members data
    const moodAnalytics = await getOrgMoodAnalytics(organizationId, 30);
    const engagement = await getOrgEngagement(organizationId);
    const alerts = await getOrgAlerts(organizationId);

    return {
      success: true,
      data: {
        members,
        moodAnalytics,
        engagement,
        alerts,
        generatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      success: false,
      error: error.message,
      data: {
        members: [],
        moodAnalytics: { avgMoodScore: 0, totalCheckIns: 0, moodDistribution: {}, weekOverWeek: 0 },
        engagement: { totalMembers: 0, activeThisWeek: 0, engagementRate: 0, totalJournalEntries: 0, atRiskCount: 0 },
        alerts: { totalAlerts: 0, alerts: [] }
      }
    };
  }
};