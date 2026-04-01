"use client";
import { useState } from "react";
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
  CurrencyDollarIcon,
  ShieldCheckIcon,
  EyeIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function AdminSettingsPage() {
  const [message, setMessage] = useState({ text: "", type: "" });
  const [activeTab, setActiveTab] = useState("notifications");
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    leaveApprovals: true,
    leaveReminders: true,
    weeklyReports: true,
    systemAlerts: true,
    
    // Appearance
    darkMode: false,
    compactView: false,
    reducedMotion: false,
    
    // Language & Region
    language: "english",
    timezone: "est",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    
    // Privacy & Security
    twoFactorAuth: true,
    sessionTimeout: "30",
    loginNotifications: true,
    profileVisibility: "admins",
    
    // System Settings
    autoBackup: true,
    backupFrequency: "daily",
    maintenanceMode: false,
    debugMode: false
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setMessage({ text: "✅ Setting updated!", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 2000);
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setMessage({ text: "✅ Preference saved!", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 2000);
  };

  const handleSaveAll = () => {
    setMessage({ text: "✅ All settings saved successfully!", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const tabs = [
    { id: "notifications", name: "Notifications", icon: <BellIcon className="h-5 w-5" /> },
    { id: "appearance", name: "Appearance", icon: <MoonIcon className="h-5 w-5" /> },
    { id: "language", name: "Language & Region", icon: <GlobeAltIcon className="h-5 w-5" /> },
    { id: "security", name: "Security & Privacy", icon: <ShieldCheckIcon className="h-5 w-5" /> },
    { id: "system", name: "System", icon: <LockClosedIcon className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Settings</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            Administrator
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          System Settings
        </h1>
        <p className="text-gray-600">Configure your preferences and system options</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl text-center font-medium flex items-center gap-2 justify-between ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-rose-100 text-rose-700 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5" />
            {message.text}
          </div>
          <button onClick={() => setMessage({ text: "", type: "" })}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Settings Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-indigo-100 sticky top-24">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-indigo-50'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-white' : 'text-indigo-600'}>
                    {tab.icon}
                  </span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
            
            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <SettingToggle
                    icon={<EnvelopeIcon className="h-5 w-5" />}
                    label="Email Notifications"
                    description="Receive system updates via email"
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
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Alert Types</h3>
                    
                    <SettingToggle
                      icon={<BellAlertIcon className="h-5 w-5" />}
                      label="Leave Approvals"
                      description="Get notified when leaves are requested"
                      checked={settings.leaveApprovals}
                      onChange={() => handleToggle('leaveApprovals')}
                    />
                    
                    <SettingToggle
                      icon={<BellAlertIcon className="h-5 w-5" />}
                      label="System Alerts"
                      description="Critical system notifications"
                      checked={settings.systemAlerts}
                      onChange={() => handleToggle('systemAlerts')}
                    />
                    
                    <SettingToggle
                      icon={<BellAlertIcon className="h-5 w-5" />}
                      label="Weekly Reports"
                      description="Weekly summary reports"
                      checked={settings.weeklyReports}
                      onChange={() => handleToggle('weeklyReports')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Appearance Settings</h2>
                
                <div className="space-y-4">
                  <SettingToggle
                    icon={settings.darkMode ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                    label="Dark Mode"
                    description="Switch between light and dark theme"
                    checked={settings.darkMode}
                    onChange={() => handleToggle('darkMode')}
                  />
                  
                  <SettingToggle
                    icon={<EyeIcon className="h-5 w-5" />}
                    label="Compact View"
                    description="Show more content with compact layout"
                    checked={settings.compactView}
                    onChange={() => handleToggle('compactView')}
                  />
                  
                  <SettingToggle
                    icon={<GlobeAltIcon className="h-5 w-5" />}
                    label="Reduced Motion"
                    description="Minimize animations throughout the interface"
                    checked={settings.reducedMotion}
                    onChange={() => handleToggle('reducedMotion')}
                  />
                </div>
              </div>
            )}

            {/* Language Tab */}
            {activeTab === "language" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Language & Region</h2>
                
                <div className="space-y-4">
                  <SettingSelect
                    icon={<LanguageIcon className="h-5 w-5" />}
                    label="Language"
                    value={settings.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    options={[
                      { value: 'english', label: 'English' },
                      { value: 'spanish', label: 'Spanish' },
                      { value: 'french', label: 'French' },
                      { value: 'german', label: 'German' },
                      { value: 'chinese', label: 'Chinese' }
                    ]}
                  />
                  
                  <SettingSelect
                    icon={<GlobeAltIcon className="h-5 w-5" />}
                    label="Timezone"
                    value={settings.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    options={[
                      { value: 'est', label: 'Eastern Time (EST)' },
                      { value: 'cst', label: 'Central Time (CST)' },
                      { value: 'mst', label: 'Mountain Time (MST)' },
                      { value: 'pst', label: 'Pacific Time (PST)' },
                      { value: 'utc', label: 'UTC' }
                    ]}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
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
                    
                    <SettingSelect
                      label="Time Format"
                      value={settings.timeFormat}
                      onChange={(e) => handleChange('timeFormat', e.target.value)}
                      options={[
                        { value: '12h', label: '12-hour (12:00 PM)' },
                        { value: '24h', label: '24-hour (13:00)' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Security & Privacy</h2>
                
                <div className="space-y-4">
                  <SettingToggle
                    icon={<ShieldCheckIcon className="h-5 w-5" />}
                    label="Two-Factor Authentication"
                    description="Enhanced security for your account"
                    checked={settings.twoFactorAuth}
                    onChange={() => handleToggle('twoFactorAuth')}
                  />
                  
                  <SettingToggle
                    icon={<BellIcon className="h-5 w-5" />}
                    label="Login Notifications"
                    description="Get alerts for new logins"
                    checked={settings.loginNotifications}
                    onChange={() => handleToggle('loginNotifications')}
                  />
                  
                  <SettingSelect
                    icon={<ClockIcon className="h-5 w-5" />}
                    label="Session Timeout (minutes)"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                    options={[
                      { value: '15', label: '15 minutes' },
                      { value: '30', label: '30 minutes' },
                      { value: '60', label: '1 hour' },
                      { value: '120', label: '2 hours' }
                    ]}
                  />
                  
                  <SettingSelect
                    icon={<EyeIcon className="h-5 w-5" />}
                    label="Profile Visibility"
                    value={settings.profileVisibility}
                    onChange={(e) => handleChange('profileVisibility', e.target.value)}
                    options={[
                      { value: 'everyone', label: 'Everyone' },
                      { value: 'employees', label: 'All Employees' },
                      { value: 'admins', label: 'Admins Only' }
                    ]}
                  />
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === "system" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">System Settings</h2>
                
                <div className="space-y-4">
                  <SettingToggle
                    icon={<LockClosedIcon className="h-5 w-5" />}
                    label="Auto Backup"
                    description="Automatically backup system data"
                    checked={settings.autoBackup}
                    onChange={() => handleToggle('autoBackup')}
                  />
                  
                  <SettingSelect
                    label="Backup Frequency"
                    value={settings.backupFrequency}
                    onChange={(e) => handleChange('backupFrequency', e.target.value)}
                    options={[
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'monthly', label: 'Monthly' }
                    ]}
                  />
                  
                  <SettingToggle
                    icon={<LockClosedIcon className="h-5 w-5" />}
                    label="Maintenance Mode"
                    description="Temporarily disable user access"
                    checked={settings.maintenanceMode}
                    onChange={() => handleToggle('maintenanceMode')}
                  />
                  
                  <SettingToggle
                    icon={<LockClosedIcon className="h-5 w-5" />}
                    label="Debug Mode"
                    description="Enable detailed error logging"
                    checked={settings.debugMode}
                    onChange={() => handleToggle('debugMode')}
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSaveAll}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
              >
                <CheckCircleIcon className="h-5 w-5" />
                Save All Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toggle Component
function SettingToggle({ icon, label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-indigo-50/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="text-indigo-600 mt-0.5">{icon}</div>
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
function SettingSelect({ icon, label, value, onChange, options }) {
  return (
    <div className="p-3 bg-gray-50 rounded-xl hover:bg-indigo-50/50 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        {icon && <div className="text-indigo-600">{icon}</div>}
        <label className="text-sm font-medium text-gray-700">{label}</label>
      </div>
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