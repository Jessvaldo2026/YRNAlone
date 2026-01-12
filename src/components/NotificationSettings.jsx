// FILE: src/components/NotificationSettings.jsx
// 🔔 Notification Settings Component

import React, { useState, useEffect } from 'react';
import NotificationService from '../services/NotificationService';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const NotificationSettings = ({ user, onUpdate }) => {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    dailyReminder: user?.notificationSettings?.dailyReminder ?? true,
    crisisAlerts: user?.notificationSettings?.crisisAlerts ?? true,
    sessionReminders: user?.notificationSettings?.sessionReminders ?? true,
    newMessages: user?.notificationSettings?.newMessages ?? true,
    achievements: user?.notificationSettings?.achievements ?? true,
    reminderTime: user?.notificationSettings?.reminderTime || '09:00'
  });

  const handleEnableNotifications = async () => {
    const granted = await NotificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      NotificationService.sendLocalNotification('Notifications Enabled!', {
        body: 'You will now receive important updates'
      });
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          notificationSettings: settings,
          notificationsEnabled: permission === 'granted'
        });
        onUpdate?.({ notificationSettings: settings });
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
    setSaving(false);
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
      <div>
        <p className="font-medium text-gray-800">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`w-11 h-6 rounded-full transition ${checked ? 'bg-purple-500' : 'bg-gray-300'}`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
        </div>
      </div>
    </label>
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        🔔 Notification Settings
      </h3>

      {permission !== 'granted' ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
          <p className="text-yellow-800 font-medium">Notifications are disabled</p>
          <p className="text-yellow-600 text-sm mb-3">Enable notifications to receive important alerts</p>
          <button
            onClick={handleEnableNotifications}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition"
          >
            Enable Notifications
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <ToggleSwitch
            checked={settings.dailyReminder}
            onChange={(e) => setSettings({ ...settings, dailyReminder: e.target.checked })}
            label="Daily Check-in Reminder"
            description="Remind me to log my mood"
          />

          {settings.dailyReminder && (
            <div className="pl-4 pb-2">
              <label className="text-sm text-gray-600">Reminder Time:</label>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
                className="ml-2 border rounded-lg px-3 py-1 focus:border-purple-400 outline-none"
              />
            </div>
          )}

          <ToggleSwitch
            checked={settings.crisisAlerts}
            onChange={(e) => setSettings({ ...settings, crisisAlerts: e.target.checked })}
            label="Crisis Alerts"
            description="Alert when someone needs urgent help"
          />

          <ToggleSwitch
            checked={settings.sessionReminders}
            onChange={(e) => setSettings({ ...settings, sessionReminders: e.target.checked })}
            label="Session Reminders"
            description="Remind me before scheduled sessions"
          />

          <ToggleSwitch
            checked={settings.newMessages}
            onChange={(e) => setSettings({ ...settings, newMessages: e.target.checked })}
            label="New Messages"
            description="Notify me of new messages"
          />

          <ToggleSwitch
            checked={settings.achievements}
            onChange={(e) => setSettings({ ...settings, achievements: e.target.checked })}
            label="Achievements"
            description="Celebrate my accomplishments"
          />

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full mt-4 bg-purple-500 text-white py-3 rounded-xl font-bold hover:bg-purple-600 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
