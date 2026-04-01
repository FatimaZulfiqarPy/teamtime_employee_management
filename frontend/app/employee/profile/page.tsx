"use client";
import { useState, useEffect } from "react";
import { 
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  BriefcaseIcon,
  MapPinIcon,
  PencilIcon,
  CameraIcon,
  CheckCircleIcon,
  LockClosedIcon,
  BellIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";

export default function EmployeeProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  
  // User data from localStorage + backend
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    joinDate: "",
    location: "",
    bio: "",
    employeeId: "",
    emergencyContact: ""
  });

  // Load user data on mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userFromStorage = localStorage.getItem('user');
        if (!userFromStorage) {
          router.push('/login');
          return;
        }

        const parsed = JSON.parse(userFromStorage);
        
        // Set data from localStorage first
        setUserData({
          name: parsed.name || "",
          email: parsed.email || "",
          phone: parsed.phone || "+1 (555) 000-0000", // Default if not set
          department: parsed.department || "Engineering",
          role: parsed.role === 'admin' ? 'Administrator' : 'Employee',
          joinDate: parsed.joinDate || "2024-01-15",
          location: parsed.location || "New York, USA",
          bio: parsed.bio || "No bio provided yet.",
          employeeId: parsed.employeeId || `EMP-${parsed.id?.slice(-6) || '001'}`,
          emergencyContact: parsed.emergencyContact || "Not provided"
        });

      } catch (error) {
        console.error("Error loading user:", error);
        setMessage({ text: "Error loading profile", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleSave = () => {
    // Save to localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    setMessage({ text: "✅ Profile updated successfully!", type: "success" });
    setIsEditing(false);
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = () => {
    setMessage({ text: "🔒 Password change will be available with backend integration", type: "info" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleNotifications = () => {
    setMessage({ text: "🔔 Notification preferences coming soon!", type: "info" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Profile</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            {userData.role}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          My Profile
        </h1>
        <p className="text-gray-600">View and manage your personal information</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl text-center font-medium flex items-center gap-2 justify-between ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : message.type === 'error'
            ? 'bg-rose-100 text-rose-700 border border-rose-200'
            : 'bg-blue-100 text-blue-700 border border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
            {message.type === 'error' && <XCircleIcon className="h-5 w-5" />}
            {message.type === 'info' && <BellIcon className="h-5 w-5" />}
            {message.text}
          </div>
          <button onClick={() => setMessage({ text: "", type: "" })}>
            ✕
          </button>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-100 overflow-hidden mb-6">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
          {/* Profile Picture Overlay */}
          <div className="absolute -bottom-12 left-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-xl">
                {userData.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </div>
              <button 
                onClick={() => {
                  setMessage({ text: "📸 Profile picture upload coming soon!", type: "info" });
                  setTimeout(() => setMessage({ text: "", type: "" }), 3000);
                }}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-indigo-200"
              >
                <CameraIcon className="h-4 w-4 text-indigo-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{userData.name || 'User Name'}</h2>
              <p className="text-gray-600">{userData.role} • {userData.department}</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <UserCircleIcon className="h-5 w-5 text-indigo-600" />
                Personal Information
              </h3>
              
              <div className="bg-indigo-50/50 rounded-xl p-4 space-y-3">
                <div>
                  <label className="text-xs text-indigo-600 font-medium">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={userData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{userData.name || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-indigo-600 font-medium">Email Address</label>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-600">{userData.email || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-indigo-600 font-medium">Phone Number</label>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={userData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-600">{userData.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-indigo-600 font-medium">Location</label>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={userData.location}
                        onChange={handleChange}
                        placeholder="City, Country"
                        className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-600">{userData.location}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BriefcaseIcon className="h-5 w-5 text-indigo-600" />
                Work Information
              </h3>
              
              <div className="bg-purple-50/50 rounded-xl p-4 space-y-3">
                <div>
                  <label className="text-xs text-purple-600 font-medium">Employee ID</label>
                  <p className="text-gray-800 font-mono">{userData.employeeId}</p>
                </div>

                <div>
                  <label className="text-xs text-purple-600 font-medium">Department</label>
                  {isEditing ? (
                    <select
                      name="department"
                      value={userData.department}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option>Engineering</option>
                      <option>Marketing</option>
                      <option>Sales</option>
                      <option>HR</option>
                      <option>Finance</option>
                    </select>
                  ) : (
                    <p className="text-gray-600">{userData.department}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-purple-600 font-medium">Role</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="role"
                      value={userData.role}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="text-gray-600">{userData.role}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-purple-600 font-medium">Join Date</label>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-600">
                      {new Date(userData.joinDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio & Emergency Contact */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-amber-50/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-amber-700 mb-2">Bio</h3>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={userData.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-gray-600">{userData.bio}</p>
                )}
              </div>

              <div className="bg-rose-50/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-rose-700 mb-2">Emergency Contact</h3>
                {isEditing ? (
                  <input
                    type="text"
                    name="emergencyContact"
                    value={userData.emergencyContact}
                    onChange={handleChange}
                    placeholder="Name - Phone number"
                    className="w-full px-3 py-2 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                  />
                ) : (
                  <p className="text-gray-600">{userData.emergencyContact}</p>
                )}
              </div>
            </div>
          </div>

          {/* Save Button (when editing) */}
          {isEditing && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
              >
                <CheckCircleIcon className="h-5 w-5" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-indigo-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <LockClosedIcon className="h-5 w-5 text-indigo-600" />
            Security
          </h3>
          <button
            onClick={handlePasswordChange}
            className="w-full px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-left"
          >
            Change Password
          </button>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-indigo-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BellIcon className="h-5 w-5 text-indigo-600" />
            Notifications
          </h3>
          <button
            onClick={handleNotifications}
            className="w-full px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-left"
          >
            Manage Preferences
          </button>
        </div>
      </div>
    </div>
  );
}