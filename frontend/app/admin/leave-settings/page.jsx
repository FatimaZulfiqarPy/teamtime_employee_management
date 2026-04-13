"use client";
import { useState, useEffect } from "react";
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function LeaveSettingsPage() {
  const [settings, setSettings] = useState({
    annual: 12,
    sick: 10,
    casual: 5
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/leave-settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSettings({
            annual: data.annual,
            sick: data.sick,
            casual: data.casual
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/leave-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        setMessage({ text: "✅ Leave settings updated successfully!", type: "success" });
      } else {
        setMessage({ text: "❌ Failed to update settings", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Settings</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            Leave Management
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Leave Settings
        </h1>
        <p className="text-gray-600">Configure annual, sick, and casual leave limits for employees</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl text-center font-medium flex items-center gap-2 justify-between ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-rose-100 text-rose-700 border border-rose-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: "", type: "" })}>✕</button>
        </div>
      )}

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Annual Leave */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Annual Leave</h2>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">Days per year</span>
          </div>
          <input
            type="number"
            value={settings.annual}
            onChange={(e) => setSettings({...settings, annual: parseInt(e.target.value) || 0})}
            min="0"
            max="100"
            className="w-full text-4xl font-bold text-gray-800 border border-gray-300 rounded-xl p-4 text-center focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-sm text-gray-500 mt-3 text-center">Default: 12 days</p>
        </div>

        {/* Sick Leave */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Sick Leave</h2>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">Days per year</span>
          </div>
          <input
            type="number"
            value={settings.sick}
            onChange={(e) => setSettings({...settings, sick: parseInt(e.target.value) || 0})}
            min="0"
            max="100"
            className="w-full text-4xl font-bold text-gray-800 border border-gray-300 rounded-xl p-4 text-center focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-sm text-gray-500 mt-3 text-center">Default: 10 days</p>
        </div>

        {/* Casual Leave */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Casual Leave</h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">Days per year</span>
          </div>
          <input
            type="number"
            value={settings.casual}
            onChange={(e) => setSettings({...settings, casual: parseInt(e.target.value) || 0})}
            min="0"
            max="100"
            className="w-full text-4xl font-bold text-gray-800 border border-gray-300 rounded-xl p-4 text-center focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-sm text-gray-500 mt-3 text-center">Default: 5 days</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
        >
          <CheckCircleIcon className="h-5 w-5" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-700">
          💡 Note: Changes will affect leave balances for all employees. Leaves are reset on January 1st each year.
        </p>
      </div>
    </div>
  );
}