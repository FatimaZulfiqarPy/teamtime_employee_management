"use client";
import { useState, useEffect } from "react";
import { 
  CalendarIcon, 
  PencilIcon, 
  PaperAirplaneIcon, 
  ClockIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";

export default function LeavesPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    start: "",
    end: "",
    reason: "",
    leaveType: "annual",
    halfDay: false
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState({
    annual: { total: 0, used: 0, remaining: 0 },
    sick: { total: 0, used: 0, remaining: 0 },
    casual: { total: 0, used: 0, remaining: 0 },
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [user, setUser] = useState({ id: "", name: "" });

  // Get user from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser({
        id: parsed.id,
        name: parsed.name
      });
    } else {
      router.push('/login');
    }
  }, []);

  // Fetch leave data from backend
  useEffect(() => {
    const fetchLeaveData = async () => {
      if (!user.id) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // 1️⃣ Get user's leave requests
        const response = await fetch(`http://localhost:5000/api/leaves/me?userId=${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaves');
        }
        
        const leaves = await response.json();
        
        // Sort by date (newest first) and take recent 3
        const sorted = leaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentRequests(sorted.slice(0, 3));
        
        // 2️⃣ Calculate used leaves by type
        const usedAnnual = leaves.filter(l => l.leaveType === 'annual' && l.status === 'approved')
          .reduce((sum, l) => sum + l.days, 0);
        const usedSick = leaves.filter(l => l.leaveType === 'sick' && l.status === 'approved')
          .reduce((sum, l) => sum + l.days, 0);
        const usedCasual = leaves.filter(l => l.leaveType === 'casual' && l.status === 'approved')
          .reduce((sum, l) => sum + l.days, 0);
        
        // 3️⃣ Fetch leave settings from backend
        const settingsRes = await fetch('http://localhost:5000/api/leave-settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          
          setLeaveBalance({
            annual: { total: settings.annual, used: usedAnnual, remaining: settings.annual - usedAnnual },
            sick: { total: settings.sick, used: usedSick, remaining: settings.sick - usedSick },
            casual: { total: settings.casual, used: usedCasual, remaining: settings.casual - usedCasual }
          });
        } else {
          // Fallback to defaults
          setLeaveBalance({
            annual: { total: 12, used: usedAnnual, remaining: 12 - usedAnnual },
            sick: { total: 10, used: usedSick, remaining: 10 - usedSick },
            casual: { total: 5, used: usedCasual, remaining: 5 - usedCasual }
          });
        }
        
      } catch (error) {
        console.error("Error fetching leaves:", error);
        setMessage({ text: "Error loading leave data", type: "error" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, [user.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const calculateDays = () => {
    if (!formData.start || !formData.end) return 0;
    
    let start = new Date(formData.start);
    const end = new Date(formData.end);
    let count = 0;
    
    while (start <= end) {
      const dayOfWeek = start.getDay(); // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sat & Sun
        count++;
      }
      start.setDate(start.getDate() + 1);
    }
    
    return formData.halfDay ? count - 0.5 : count;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { start, end, reason, leaveType, halfDay } = formData;
    
    // Validation
    if (!start || !end || !reason) {
      setMessage({ text: "Please fill all required fields", type: "error" });
      return;
    }
    
    if (new Date(start) > new Date(end)) {
      setMessage({ text: "End date must be after start date", type: "error" });
      return;
    }

    const daysRequested = calculateDays();
    const currentBalance = leaveBalance[leaveType].remaining;
    
    if (daysRequested > currentBalance) {
      setMessage({ 
        text: `Insufficient ${leaveType} leave balance! You have ${currentBalance} days left.`, 
        type: "error" 
      });
      return;
    }

    // Check for overlapping leave
  const overlappingLeave = recentRequests.some(request => {
    const existingStart = new Date(request.startDate);
    const existingEnd = new Date(request.endDate);
    const newStart = new Date(start);
    const newEnd = new Date(end);
    
    return (request.status === 'pending' || request.status === 'approved') && (
      (newStart >= existingStart && newStart <= existingEnd) ||
      (newEnd >= existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );
  });
  
  if (overlappingLeave) {
    setMessage({ text: " You already have a leave request for these dates!", type: "error" });
    return;
  }

  if (daysRequested === 0) {
    setMessage({ text: " No working days selected. Please select working days (Monday to Friday)", type: "error" });
    return;
  }


    // Submit to backend
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          startDate: start,
          endDate: end,
          reason,
          leaveType,
          halfDay
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "✅ Leave request submitted for approval!", type: "success" });
        
        // Add to recent requests
        setRecentRequests([data.leave, ...recentRequests.slice(0, 2)]);
        
        // Update leave balance (decrease remaining)
        setLeaveBalance(prev => ({
          ...prev,
          [leaveType]: {
            ...prev[leaveType],
            remaining: prev[leaveType].remaining - daysRequested
          }
        }));
        
        // Reset form
        setFormData({ start: "", end: "", reason: "", leaveType: "annual", halfDay: false });
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (error) {
      console.error("Submit error:", error);
      setMessage({ text: "Server error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    }
  };

  const daysRequested = calculateDays();
  const selectedBalance = leaveBalance[formData.leaveType] || leaveBalance.annual;

  // Get status badge color
  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading && recentRequests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your leave data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Leave Management</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            Employee
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Request Time Off
        </h1>
        <p className="text-gray-600">Submit and track your leave requests</p>
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

      {/* Stats Cards - Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-indigo-100">
          <p className="text-sm text-gray-500 mb-1">Annual Leave</p>
          <p className="text-2xl font-bold text-indigo-600">{leaveBalance.annual.remaining} <span className="text-sm text-gray-500">/ {leaveBalance.annual.total}</span></p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-indigo-100">
          <p className="text-sm text-gray-500 mb-1">Sick Leave</p>
          <p className="text-2xl font-bold text-emerald-600">{leaveBalance.sick.remaining} <span className="text-sm text-gray-500">/ {leaveBalance.sick.total}</span></p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-indigo-100">
          <p className="text-sm text-gray-500 mb-1">Casual Leave</p>
          <p className="text-2xl font-bold text-amber-600">{leaveBalance.casual.remaining} <span className="text-sm text-gray-500">/ {leaveBalance.casual.total}</span></p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-indigo-100">
          <p className="text-sm text-gray-500 mb-1">Pending Requests</p>
          <p className="text-2xl font-bold text-purple-600">{recentRequests.filter(r => r.status === 'pending').length}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leave Balance Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Balance Details */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-indigo-600" />
              Leave Balance Details
            </h2>
            
            <div className="space-y-4">
              {/* Annual Leave */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Annual Leave</span>
                  <span className="font-semibold text-indigo-600">{leaveBalance.annual.used} / {leaveBalance.annual.total} used</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 rounded-full h-2" style={{ width: `${(leaveBalance.annual.used / leaveBalance.annual.total) * 100}%` }}></div>
                </div>
              </div>

              {/* Sick Leave */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Sick Leave</span>
                  <span className="font-semibold text-emerald-600">{leaveBalance.sick.used} / {leaveBalance.sick.total} used</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-emerald-600 rounded-full h-2" style={{ width: `${(leaveBalance.sick.used / leaveBalance.sick.total) * 100}%` }}></div>
                </div>
              </div>

              {/* Casual Leave */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Casual Leave</span>
                  <span className="font-semibold text-amber-600">{leaveBalance.casual.used} / {leaveBalance.casual.total} used</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-600 rounded-full h-2" style={{ width: `${(leaveBalance.casual.used / leaveBalance.casual.total) * 100}%` }}></div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
              <div className="flex gap-2">
                <InformationCircleIcon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                <p className="text-xs text-indigo-700">
                  Leaves reset on January 1st each year. Unused leaves don't carry forward.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Requests - Real Data */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
              Recent Requests
            </h2>
            
            <div className="space-y-3">
              {recentRequests.length > 0 ? (
                recentRequests.slice(0, 3).map((request) => (
                  <div key={request._id} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-800 capitalize">{request.leaveType}</span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusBadge(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </p>
                    <p className="text-xs font-medium text-indigo-600 mt-1">{request.days} days</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No leave requests yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-indigo-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">New Leave Request</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Leave Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['annual', 'sick', 'casual'].map((type) => (
                    <label
                      key={type}
                      className={`relative flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.leaveType === type
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-indigo-200 text-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="leaveType"
                        value={type}
                        checked={formData.leaveType === type}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
      <CalendarIcon className="h-4 w-4 text-indigo-600" />
      Start Date
    </label>
    <input
      type="date"
      name="start"
      value={formData.start}
      onChange={handleChange}
      min={(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toLocaleDateString('en-CA');
      })()}
      className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
      <CalendarIcon className="h-4 w-4 text-indigo-600" />
      End Date
    </label>
    <input
      type="date"
      name="end"
      value={formData.end}
      onChange={handleChange}
      min={formData.start || (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toLocaleDateString('en-CA');
      })()}
      className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
    />
  </div>
</div>

              {/* Half Day Option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="halfDay"
                  id="halfDay"
                  checked={formData.halfDay}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="halfDay" className="text-sm text-gray-700">
                  Half day (0.5 day deduction)
                </label>
              </div>

              {/* Days Summary */}
              {formData.start && formData.end && (
                <div className={`rounded-xl p-4 border ${
                  daysRequested > selectedBalance.remaining
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-indigo-50 border-indigo-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Leave Duration</p>
                      <p className="text-lg font-bold text-gray-800">
                        {daysRequested} day{daysRequested > 1 ? 's' : ''} requested
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Available</p>
                      <p className="text-lg font-bold text-indigo-600">{selectedBalance.remaining} days</p>
                    </div>
                  </div>
                  {daysRequested > selectedBalance.remaining && (
                    <p className="text-sm text-rose-600 mt-2 flex items-center gap-1">
                      <XCircleIcon className="h-4 w-4" />
                      Exceeds balance by {daysRequested - selectedBalance.remaining} days
                    </p>
                  )}
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <PencilIcon className="h-4 w-4 text-indigo-600" />
                  Reason for Leave
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Please provide a detailed reason for your leave request..."
                  className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {formData.reason.length}/500 characters
                  </p>
                  {formData.reason.length > 400 && (
                    <p className="text-xs text-amber-600">Approaching limit</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || daysRequested > selectedBalance.remaining}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5" />
                    Submit Leave Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Leave Policy Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400">
          By submitting this request, you agree to the company's leave policy. 
          All requests are subject to manager approval.
        </p>
      </div>
    </div>
  );
}