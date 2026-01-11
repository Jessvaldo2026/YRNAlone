// FILE: src/services/messagingService.js
// 💬 Secure Therapist-Member Messaging System
// HIPAA-compliant messaging with audit trail

import { db } from '../firebase';
import { 
  collection, doc, setDoc, getDocs, updateDoc, addDoc,
  query, where, orderBy, limit, onSnapshot, Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { logAuditEvent, AUDIT_ACTIONS } from './auditService';

// ============================================
// 📨 MESSAGE TYPES
// ============================================

export const MESSAGE_TYPES = {
  TEXT: 'text',
  CHECK_IN: 'check_in',          // Automated check-in
  CRISIS_OUTREACH: 'crisis_outreach',  // Response to crisis alert
  APPOINTMENT: 'appointment',     // Appointment reminder/request
  RESOURCE: 'resource',           // Shared resource/article
  ENCOURAGEMENT: 'encouragement'  // Quick encouragement message
};

export const MESSAGE_TEMPLATES = {
  check_in: {
    title: 'How are you doing?',
    body: "Hi {memberName}, I wanted to check in and see how you're doing. I noticed it's been a few days since we connected. Remember, I'm here for you whenever you need support. 💜"
  },
  crisis_outreach: {
    title: 'I\'m here for you',
    body: "Hi {memberName}, I noticed you've been going through a difficult time lately. I want you to know that you're not alone, and I'm here to support you. Would you like to talk? You can reply here or we can schedule a call."
  },
  encouragement: {
    title: 'Quick note of support',
    body: "Hi {memberName}, I just wanted to send a quick message to say I'm proud of the progress you're making. Keep going! 🌟"
  },
  appointment_reminder: {
    title: 'Appointment Reminder',
    body: "Hi {memberName}, this is a reminder about your upcoming appointment on {date} at {time}. Looking forward to connecting with you!"
  }
};

// ============================================
// 📬 CONVERSATION MANAGEMENT
// ============================================

// Get or create conversation between therapist and member
export const getOrCreateConversation = async (organizationId, therapistId, memberId) => {
  // Check if conversation exists
  const convQuery = query(
    collection(db, 'organizations', organizationId, 'conversations'),
    where('therapistId', '==', therapistId),
    where('memberId', '==', memberId)
  );
  
  const existing = await getDocs(convQuery);
  
  if (!existing.empty) {
    return { id: existing.docs[0].id, ...existing.docs[0].data() };
  }

  // Create new conversation
  const convRef = await addDoc(collection(db, 'organizations', organizationId, 'conversations'), {
    therapistId,
    memberId,
    createdAt: new Date().toISOString(),
    lastMessageAt: null,
    lastMessage: null,
    unreadByMember: 0,
    unreadByTherapist: 0,
    isActive: true
  });

  return { 
    id: convRef.id, 
    therapistId, 
    memberId, 
    createdAt: new Date().toISOString(),
    messages: []
  };
};

// Get all conversations for a therapist
export const getTherapistConversations = async (organizationId, therapistId) => {
  const convQuery = query(
    collection(db, 'organizations', organizationId, 'conversations'),
    where('therapistId', '==', therapistId),
    where('isActive', '==', true),
    orderBy('lastMessageAt', 'desc')
  );
  
  const snapshot = await getDocs(convQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get all conversations for a member
export const getMemberConversations = async (organizationId, memberId) => {
  const convQuery = query(
    collection(db, 'organizations', organizationId, 'conversations'),
    where('memberId', '==', memberId),
    where('isActive', '==', true)
  );
  
  const snapshot = await getDocs(convQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ============================================
// ✉️ SEND MESSAGE
// ============================================

export const sendMessage = async (organizationId, conversationId, message) => {
  const {
    senderId,
    senderName,
    senderRole, // 'therapist' or 'member'
    content,
    type = MESSAGE_TYPES.TEXT,
    relatedAlertId = null,
    attachments = []
  } = message;

  // Create message
  const messageRef = await addDoc(
    collection(db, 'organizations', organizationId, 'conversations', conversationId, 'messages'),
    {
      senderId,
      senderName,
      senderRole,
      content,
      type,
      relatedAlertId,
      attachments,
      createdAt: new Date().toISOString(),
      readAt: null,
      isRead: false
    }
  );

  // Update conversation
  const unreadField = senderRole === 'therapist' ? 'unreadByMember' : 'unreadByTherapist';
  
  const convRef = doc(db, 'organizations', organizationId, 'conversations', conversationId);
  await updateDoc(convRef, {
    lastMessageAt: new Date().toISOString(),
    lastMessage: {
      content: content.substring(0, 100),
      senderId,
      senderRole,
      type
    },
    [unreadField]: (await getDocs(convRef)).data()?.[unreadField] + 1 || 1
  });

  // Log audit event
  await logAuditEvent(organizationId, {
    action: AUDIT_ACTIONS.MESSAGE_SENT,
    actorId: senderId,
    actorName: senderName,
    actorRole: senderRole,
    targetType: 'conversation',
    targetId: conversationId,
    details: { messageType: type, hasAttachments: attachments.length > 0 }
  });

  return { id: messageRef.id, success: true };
};

// Send message using template
export const sendTemplateMessage = async (organizationId, conversationId, templateKey, therapist, member, customData = {}) => {
  const template = MESSAGE_TEMPLATES[templateKey];
  if (!template) throw new Error('Invalid template');

  let content = template.body
    .replace('{memberName}', member.name || 'there')
    .replace('{therapistName}', therapist.name)
    .replace('{date}', customData.date || '')
    .replace('{time}', customData.time || '');

  return sendMessage(organizationId, conversationId, {
    senderId: therapist.id,
    senderName: therapist.name,
    senderRole: 'therapist',
    content,
    type: templateKey.includes('crisis') ? MESSAGE_TYPES.CRISIS_OUTREACH : MESSAGE_TYPES.CHECK_IN
  });
};

// ============================================
// 📖 READ MESSAGES
// ============================================

export const getMessages = async (organizationId, conversationId, limitCount = 50) => {
  const msgQuery = query(
    collection(db, 'organizations', organizationId, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(msgQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
};

// Mark messages as read
export const markMessagesRead = async (organizationId, conversationId, readerId, readerRole) => {
  const unreadField = readerRole === 'therapist' ? 'unreadByTherapist' : 'unreadByMember';
  
  // Update conversation unread count
  await updateDoc(
    doc(db, 'organizations', organizationId, 'conversations', conversationId),
    { [unreadField]: 0 }
  );

  // Mark individual messages as read
  const msgQuery = query(
    collection(db, 'organizations', organizationId, 'conversations', conversationId, 'messages'),
    where('isRead', '==', false),
    where('senderRole', '!=', readerRole)
  );
  
  const unreadMsgs = await getDocs(msgQuery);
  
  const updates = unreadMsgs.docs.map(msgDoc => 
    updateDoc(msgDoc.ref, { 
      isRead: true, 
      readAt: new Date().toISOString() 
    })
  );
  
  await Promise.all(updates);
};

// ============================================
// 🔔 REAL-TIME SUBSCRIPTIONS
// ============================================

// Subscribe to new messages in a conversation
export const subscribeToConversation = (organizationId, conversationId, callback) => {
  const msgQuery = query(
    collection(db, 'organizations', organizationId, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(msgQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
    callback(messages);
  });
};

// Subscribe to all conversations (for notification badges)
export const subscribeToConversationList = (organizationId, therapistId, callback) => {
  const convQuery = query(
    collection(db, 'organizations', organizationId, 'conversations'),
    where('therapistId', '==', therapistId),
    where('isActive', '==', true)
  );

  return onSnapshot(convQuery, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadByTherapist || 0), 0);
    callback({ conversations, totalUnread });
  });
};

// ============================================
// 🚨 CRISIS OUTREACH (Quick Actions)
// ============================================

// Send crisis outreach message (triggered from alert)
export const sendCrisisOutreach = async (organizationId, therapist, member, alert) => {
  // Get or create conversation
  const conversation = await getOrCreateConversation(organizationId, therapist.id, member.id);
  
  // Send crisis outreach message
  const result = await sendMessage(organizationId, conversation.id, {
    senderId: therapist.id,
    senderName: therapist.name,
    senderRole: 'therapist',
    content: MESSAGE_TEMPLATES.crisis_outreach.body.replace('{memberName}', member.name || 'there'),
    type: MESSAGE_TYPES.CRISIS_OUTREACH,
    relatedAlertId: alert.id
  });

  // Log intervention on the alert
  await logAuditEvent(organizationId, {
    action: AUDIT_ACTIONS.CRISIS_OUTREACH,
    actorId: therapist.id,
    actorName: therapist.name,
    actorRole: 'therapist',
    targetType: 'alert',
    targetId: alert.id,
    details: { 
      memberId: member.id,
      memberName: member.name,
      conversationId: conversation.id
    }
  });

  return { 
    success: true, 
    conversationId: conversation.id,
    messageId: result.id
  };
};

// ============================================
// 📊 MESSAGING ANALYTICS
// ============================================

export const getMessagingAnalytics = async (organizationId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const convQuery = query(
    collection(db, 'organizations', organizationId, 'conversations')
  );

  const conversations = await getDocs(convQuery);
  
  let totalMessages = 0;
  let therapistMessages = 0;
  let memberMessages = 0;
  let crisisOutreaches = 0;

  for (const conv of conversations.docs) {
    const msgQuery = query(
      collection(db, 'organizations', organizationId, 'conversations', conv.id, 'messages'),
      where('createdAt', '>=', startDate.toISOString())
    );
    const messages = await getDocs(msgQuery);
    
    messages.docs.forEach(msg => {
      const data = msg.data();
      totalMessages++;
      if (data.senderRole === 'therapist') therapistMessages++;
      else memberMessages++;
      if (data.type === MESSAGE_TYPES.CRISIS_OUTREACH) crisisOutreaches++;
    });
  }

  return {
    totalMessages,
    therapistMessages,
    memberMessages,
    crisisOutreaches,
    activeConversations: conversations.docs.filter(c => c.data().lastMessageAt).length,
    avgResponseTime: 'Coming soon' // Would need more tracking
  };
};

export default {
  MESSAGE_TYPES,
  MESSAGE_TEMPLATES,
  getOrCreateConversation,
  getTherapistConversations,
  getMemberConversations,
  sendMessage,
  sendTemplateMessage,
  getMessages,
  markMessagesRead,
  subscribeToConversation,
  subscribeToConversationList,
  sendCrisisOutreach,
  getMessagingAnalytics
};
