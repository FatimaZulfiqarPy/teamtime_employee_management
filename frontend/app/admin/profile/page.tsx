"use client";
import { useState } from "react";
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
  BuildingOfficeIcon,
  IdentificationIcon,
  ClockIcon ,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Mock admin data
  const [adminData, setAdminData] = useState({
    name: "Admin User",
    email: "admin@teamtime.com",
    phone: "+1 (555) 123-4567",
    department: "Administration",
    role: "System Administrator",
    joinDate: "2024-01-01",
    location: "New York, USA",
    bio: "Experienced system administrator with 8+ years in HR management systems. Passionate about streamlining organizational processes.",
    employeeId: "ADM-2024-001",
    emergencyContact: "HR Department - +1 (555) 987-6543",
    accessLevel: "Full Access",
    lastLogin: "2024-03-16 09:30 AM",
    permissions: [
      "Manage Employees",
      "Approve Leaves",
      "Generate Reports",
      "System Settings",
      "Department Management"
    ]
  });

  const handleSave = () => {
    setMessage({ text: "✅ Profile updated successfully!", type: "success" });
    setIsEditing(false);
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Profile</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            Administrator
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          My Profile
        </h1>
        <p className="text-gray-600">Manage your personal information and permissions</p>
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
            ✕
          </button>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-indigo-100 overflow-hidden mb-6">
        {/* Cover Photo with Gradient */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative">
          {/* Profile Picture Overlay */}
          <div className="absolute -bottom-12 left-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-xl">
                {adminData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-indigo-200">
                <CameraIcon className="h-4 w-4 text-indigo-600" />
              </button>
            </div>
          </div>

          {/* Last Login Badge */}
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <p className="text-white text-sm flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              Last login: {adminData.lastLogin}
            </p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{adminData.name}</h2>
              <p className="text-gray-600">{adminData.role} • {adminData.department}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                  {adminData.accessLevel}
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                  Active
                </span>
              </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Personal Info */}
            <div className="lg:col-span-1 space-y-4">
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
                      value={adminData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{adminData.name}</p>
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
                        value={adminData.email}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-600">{adminData.email}</p>
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
                        value={adminData.phone}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-600">{adminData.phone}</p>
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
                        value={adminData.location}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-gray-600">{adminData.location}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Work Info */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BriefcaseIcon className="h-5 w-5 text-indigo-600" />
                Work Information
              </h3>
              
              <div className="bg-purple-50/50 rounded-xl p-4 space-y-3">
                <div>
                  <label className="text-xs text-purple-600 font-medium">Employee ID</label>
                  <p className="text-gray-800 font-mono">{adminData.employeeId}</p>
                </div>

                <div>
                  <label className="text-xs text-purple-600 font-medium">Department</label>
                  {isEditing ? (
                    <select
                      name="department"
                      value={adminData.department}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option>Administration</option>
                      <option>IT</option>
                      <option>HR</option>
                      <option>Finance</option>
                    </select>
                  ) : (
                    <p className="text-gray-600">{adminData.department}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-purple-600 font-medium">Role</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="role"
                      value={adminData.role}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="text-gray-600">{adminData.role}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-purple-600 font-medium">Join Date</label>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-600">{new Date(adminData.joinDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Permissions */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <LockClosedIcon className="h-5 w-5 text-indigo-600" />
                Access & Permissions
              </h3>
              
              <div className="bg-amber-50/50 rounded-xl p-4">
                <div className="space-y-3">
                  {adminData.permissions.map((perm, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-gray-700">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-6">
            <div className="bg-amber-50/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-amber-700 mb-2">Bio</h3>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={adminData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              ) : (
                <p className="text-gray-600">{adminData.bio}</p>
              )}
            </div>
          </div>

          {/* Save Button */}
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
    </div>
  );
}