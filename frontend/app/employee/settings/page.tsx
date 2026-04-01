"use client";
import { useState, useEffect } from "react";
import {
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon,
  MoonIcon,
  SunIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  BellAlertIcon,
  LanguageIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [message, setMessage] = useState({ text: "", type: "" });
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    leaveApprovals: true,
    leaveReminders: true,
    weeklyReports: false,
    
    // Appearance
    darkMode: false,
    compactView: false,
    
    // Language & Region
    language: "english",
    timezone: "est",
    dateFormat: "MM/DD/YYYY",
    
    // Privacy
    profileVisibility: "team",
    showOnlineStatus: true
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettingsToStorage = (newSettings) => {
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
    setMessage({ text: "✅ Setting updated!", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 2000);
  };

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
    setMessage({ text: "✅ Preference saved!", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 2000);
  };

  const handleSaveAll = () => {
    saveSettingsToStorage(settings);
    setMessage({ text: "✅ All settings saved!", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 2000);
  };

  // Apply dark mode to document if enabled
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Settings</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            Employee
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Account Settings
        </h1>
        <p className="text-gray-600">Manage your preferences and notifications</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl text-center font-medium flex items-center gap-2 justify-between ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-rose-100 text-rose-700 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <XCircleIcon className="h-5 w-5" />
            )}
            {message.text}
          </div>
          <button onClick={() => setMessage({ text: "", type: "" })}>
            ✕
          </button>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Notifications Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BellIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
          </div>

          <div className="space-y-4">
            <SettingToggle
              icon={<EnvelopeIcon className="h-5 w-5" />}
              label="Email Notifications"
              description="Receive updates via email"
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
            />
            
            <SettingToggle
              icon={<DevicePhoneMobileIcon className="h-5 w-5" />}
              label="Push Notifications"
              description="Browser push notifications"
              checked={settings.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
            />

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Alert Preferences</h3>
              
              <SettingToggle
                icon={<BellAlertIcon className="h-5 w-5" />}
                label="Leave Approvals"
                description="Get notified when leaves are approved"
                checked={settings.leaveApprovals}
                onChange={() => handleToggle('leaveApprovals')}
              />
              
              <SettingToggle
                icon={<BellAlertIcon className="h-5 w-5" />}
                label="Leave Reminders"
                description="Reminders for upcoming leaves"
                checked={settings.leaveReminders}
                onChange={() => handleToggle('leaveReminders')}
              />
              
              <SettingToggle
                icon={<BellAlertIcon className="h-5 w-5" />}
                label="Weekly Reports"
                description="Weekly attendance summary"
                checked={settings.weeklyReports}
                onChange={() => handleToggle('weeklyReports')}
              />
            </div>
          </div>
        </div>

        {/* Appearance Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <MoonIcon className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Appearance</h2>
          </div>

          <div className="space-y-4">
            <SettingToggle
              icon={settings.darkMode ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
              label="Dark Mode"
              description="Switch between light and dark theme"
              checked={settings.darkMode}
              onChange={() => handleToggle('darkMode')}
            />
            
            <SettingToggle
              icon={<GlobeAltIcon className="h-5 w-5" />}
              label="Compact View"
              description="Show more content with compact layout"
              checked={settings.compactView}
              onChange={() => handleToggle('compactView')}
            />
          </div>
        </div>

        {/* Language & Region Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <LanguageIcon className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Language & Region</h2>
          </div>

          <div className="space-y-4">
            <SettingSelect
              label="Language"
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              options={[
                { value: 'english', label: 'English' },
                { value: 'spanish', label: 'Spanish' },
                { value: 'french', label: 'French' },
                { value: 'german', label: 'German' }
              ]}
            />
            
            <SettingSelect
              label="Timezone"
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              options={[
                { value: 'est', label: 'Eastern Time (EST)' },
                { value: 'cst', label: 'Central Time (CST)' },
                { value: 'mst', label: 'Mountain Time (MST)' },
                { value: 'pst', label: 'Pacific Time (PST)' }
              ]}
            />
            
            <SettingSelect
              label="Date Format"
              value={settings.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              options={[
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
              ]}
            />
          </div>
        </div>

        {/* Privacy Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
              <LockClosedIcon className="h-5 w-5 text-rose-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Privacy</h2>
          </div>

          <div className="space-y-4">
            <SettingSelect
              label="Profile Visibility"
              value={settings.profileVisibility}
              onChange={(e) => handleChange('profileVisibility', e.target.value)}
              options={[
                { value: 'everyone', label: 'Everyone' },
                { value: 'team', label: 'Team Only' },
                { value: 'admins', label: 'Admins Only' }
              ]}
            />
            
            <SettingToggle
              icon={<GlobeAltIcon className="h-5 w-5" />}
              label="Show Online Status"
              description="Let others see when you're active"
              checked={settings.showOnlineStatus}
              onChange={() => handleToggle('showOnlineStatus')}
            />
          </div>
        </div>
      </div>

      {/* Save All Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSaveAll}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
        >
          Save All Changes
        </button>
      </div>

      {/* Settings Note */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          Settings are saved locally in your browser. They will persist after logout.
        </p>
      </div>
    </div>
  );
}

// Toggle Component
function SettingToggle({ icon, label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-2 hover:bg-indigo-50/50 rounded-lg transition-colors">
      <div className="flex items-start gap-3">
        <div className="text-gray-400 mt-0.5">{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-indigo-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

// Select Component
function SettingSelect({ label, value, onChange, options }) {
  return (
    <div className="p-2 hover:bg-indigo-50/50 rounded-lg transition-colors">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}