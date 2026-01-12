// FILE: src/services/NotificationService.js
// 🔔 Push Notification Service for YRNAlone

class NotificationService {
  static async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static async sendLocalNotification(title, options = {}) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return null;

    const notification = new Notification(title, {
      icon: '/logo192.png',
      badge: '/logo192.png',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  // Crisis alert notification
  static async sendCrisisAlert(memberName, message) {
    return this.sendLocalNotification(
      `🚨 Crisis Alert: ${memberName}`,
      {
        body: message,
        tag: 'crisis-alert',
        requireInteraction: true,
        vibrate: [200, 100, 200]
      }
    );
  }

  // Session reminder
  static async sendSessionReminder(patientName, time) {
    return this.sendLocalNotification(
      `📅 Session Reminder`,
      {
        body: `Session with ${patientName} in ${time}`,
        tag: 'session-reminder'
      }
    );
  }

  // Daily check-in reminder
  static async sendCheckInReminder() {
    return this.sendLocalNotification(
      `💜 How are you feeling today?`,
      {
        body: 'Take a moment to check in with yourself',
        tag: 'daily-checkin'
      }
    );
  }

  // Achievement notification
  static async sendAchievementNotification(achievementName) {
    return this.sendLocalNotification(
      `🏆 Achievement Unlocked!`,
      {
        body: achievementName,
        tag: 'achievement'
      }
    );
  }

  // New message notification
  static async sendNewMessageNotification(senderName, preview) {
    return this.sendLocalNotification(
      `💬 New message from ${senderName}`,
      {
        body: preview,
        tag: 'new-message'
      }
    );
  }

  // Schedule a reminder for later
  static scheduleReminder(title, body, delayMs) {
    return setTimeout(() => {
      this.sendLocalNotification(title, { body });
    }, delayMs);
  }

  // Cancel a scheduled reminder
  static cancelReminder(timerId) {
    clearTimeout(timerId);
  }
}

export default NotificationService;
