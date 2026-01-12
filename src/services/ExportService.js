// FILE: src/services/ExportService.js
// 📤 Data Export Service for YRNAlone

import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';

class ExportService {

  // Export user's own data (for individual users)
  static async exportUserData() {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not logged in');

    // Get user profile
    const userDocSnap = await getDoc(doc(db, 'users', userId));
    const userData = userDocSnap.exists() ? userDocSnap.data() : {};

    // Get journal entries
    let journals = [];
    try {
      const journalsQuery = query(
        collection(db, 'users', userId, 'journalEntries')
      );
      const journalsSnap = await getDocs(journalsQuery);
      journals = journalsSnap.docs.map(d => d.data());
    } catch (err) {
      console.log('No journal entries found');
    }

    // Get mood entries
    let moods = [];
    try {
      const moodsQuery = query(
        collection(db, 'users', userId, 'moodHistory')
      );
      const moodsSnap = await getDocs(moodsQuery);
      moods = moodsSnap.docs.map(d => d.data());
    } catch (err) {
      console.log('No mood entries found');
    }

    // Get posts
    let posts = [];
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId)
      );
      const postsSnap = await getDocs(postsQuery);
      posts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.log('No posts found');
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      exportedBy: 'YRNAlone Data Export',
      profile: {
        email: userData.email,
        displayName: userData.displayName || userData.name,
        createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt,
        isPremium: userData.isPremium || false,
        organizationName: userData.organizationName || null
      },
      statistics: {
        totalJournalEntries: journals.length,
        totalMoodCheckins: moods.length,
        totalPosts: posts.length
      },
      journals: journals.map(j => ({
        date: j.timestamp || j.createdAt?.toDate?.()?.toISOString(),
        content: j.content,
        mood: j.mood,
        theme: j.theme
      })),
      moodHistory: moods.map(m => ({
        date: m.timestamp || m.createdAt?.toDate?.()?.toISOString(),
        mood: m.mood,
        note: m.note
      })),
      posts: posts.map(p => ({
        date: p.timestamp || p.createdAt?.toDate?.()?.toISOString(),
        content: p.content,
        reactions: p.reactions || {}
      }))
    };

    return exportData;
  }

  // Export organization data (for admins)
  static async exportOrganizationData(organizationId) {
    if (!organizationId) throw new Error('No organization ID provided');

    // Get organization
    const orgDocSnap = await getDoc(doc(db, 'organizations', organizationId));
    const orgData = orgDocSnap.exists() ? orgDocSnap.data() : {};

    // Get all members
    const membersQuery = query(
      collection(db, 'users'),
      where('organizationId', '==', organizationId)
    );
    const membersSnap = await getDocs(membersQuery);
    const members = membersSnap.docs.map(d => ({
      id: d.id,
      email: d.data().email,
      displayName: d.data().displayName || d.data().name,
      role: d.data().role || 'member',
      joinedAt: d.data().createdAt?.toDate?.()?.toISOString() || d.data().createdAt,
      isActive: d.data().lastActive ?
        (new Date() - new Date(d.data().lastActive)) < 7 * 24 * 60 * 60 * 1000 : false
    }));

    // Get therapists
    let therapists = [];
    try {
      const therapistsSnap = await getDocs(
        collection(db, 'organizations', organizationId, 'therapists')
      );
      therapists = therapistsSnap.docs.map(d => ({
        id: d.id,
        name: d.data().name,
        email: d.data().email,
        specialties: d.data().specialties || []
      }));
    } catch (err) {
      console.log('No therapists found');
    }

    return {
      exportDate: new Date().toISOString(),
      exportedBy: 'YRNAlone Organization Export',
      organization: {
        name: orgData.name,
        type: orgData.type,
        accessCode: orgData.accessCode,
        createdAt: orgData.createdAt?.toDate?.()?.toISOString() || orgData.createdAt
      },
      statistics: {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.isActive).length,
        totalTherapists: therapists.length
      },
      members,
      therapists
    };
  }

  // Download as JSON
  static downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Download as CSV
  static downloadCSV(data, filename) {
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Data must be a non-empty array');
      return;
    }

    // Convert to CSV format
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const value = row[h];
        // Handle strings with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Download as formatted text (for journals)
  static downloadText(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export default ExportService;
