"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ArrowRightOnRectangleIcon,
  CalendarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function EmployeeDashboard() {
  const [attendanceState, setAttendanceState] = useState({
    timeIn: "",
    timeOut: "",
    status: "in",
    todayRecord: null
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [stats, setStats] = useState({
    todayStatus: "---",
    weeklyHours: "0h 0m",
    leavesLeft: 0,
    pendingApprovals: 0
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: "", id: "" });

  // 👇 ADD THIS CALCULATE HOURS FUNCTION 👇
  const calculateHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 0;
    
    // Parse time strings correctly
    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      // Convert to 24-hour format
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      return { hours, minutes };
    };
    
    const inTime = parseTime(timeIn);
    const outTime = parseTime(timeOut);
    
    // Calculate total minutes
    const inTotalMinutes = inTime.hours * 60 + inTime.minutes;
    const outTotalMinutes = outTime.hours * 60 + outTime.minutes;
    
    // Handle overnight shifts
    let diffMinutes = outTotalMinutes - inTotalMinutes;
    if (diffMinutes < 0) diffMinutes += 24 * 60; // Add 24 hours if crossing midnight
    
    const hours = diffMinutes / 60;
    return parseFloat(hours.toFixed(2));
  };

  // Get user from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser({
        name: parsed.name,
        id: parsed.id
      });
      
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    }
  }, []);

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !user.id) return;

        // 1️⃣ Get today's attendance status
        const todayRes = await fetch(`http://localhost:5000/api/attendance/my-attendance?userId=${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const todayData = await todayRes.json();
        
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = todayData.find(record => 
          record.date.split('T')[0] === today
        );

        if (todayRecord) {
          setAttendanceState({
            timeIn: todayRecord.timeIn,
            timeOut: todayRecord.timeOut || "",
            status: todayRecord.timeOut ? "completed" : "out",
            todayRecord
          });
        }

        // 2️⃣ Get recent attendance (last 7 days)
        const recentRes = await fetch(`http://localhost:5000/api/attendance/my-attendance?userId=${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const recentData = await recentRes.json();
        
        const sorted = recentData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentAttendance(sorted.slice(0, 7));

        // 3️⃣ Calculate weekly hours
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const weeklyRecords = recentData.filter(record => 
          new Date(record.date) >= weekAgo && record.totalHours
        );
        
        const totalWeeklyHours = weeklyRecords.reduce((sum, record) => 
          sum + (record.totalHours || 0), 0
        );
        
        const hours = Math.floor(totalWeeklyHours);
        const minutes = Math.round((totalWeeklyHours - hours) * 60);

        // 4️⃣ Get leave data
        const leaveResponse = await fetch(`http://localhost:5000/api/leaves/me?userId=${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const leaveData = await leaveResponse.json();

        const totalLeavesLeft = 
          (12 - leaveData.filter(l => l.leaveType === 'annual' && l.status === 'approved')
            .reduce((sum, l) => sum + l.days, 0)) +
          (10 - leaveData.filter(l => l.leaveType === 'sick' && l.status === 'approved')
            .reduce((sum, l) => sum + l.days, 0)) +
          (5 - leaveData.filter(l => l.leaveType === 'casual' && l.status === 'approved')
            .reduce((sum, l) => sum + l.days, 0));

        const pendingCount = leaveData.filter(l => l.status === 'pending').length;

        setStats({
          todayStatus: todayRecord ? (todayRecord.timeOut ? "Completed" : "Active") : "Not Started",
          weeklyHours: `${hours}h ${minutes}m`,
          leavesLeft: totalLeavesLeft,
          pendingApprovals: pendingCount
        });

      } catch (error) {
        console.error("Error fetching dashboard:", error);
        setMessage({ text: "Error loading dashboard data", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (user.id) {
      fetchDashboardData();
    }
  }, [user.id]);

  // Live clock
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTimeIn = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/attendance/time-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id })
      });

      const data = await response.json();

      if (response.ok) {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        setAttendanceState({
          timeIn: formattedTime,
          timeOut: "",
          status: "out",
          todayRecord: data.attendance
        });

        setStats(prev => ({
          ...prev,
          todayStatus: "Active"
        }));
        
        setMessage({ text: "✅ Time In recorded! Now you can Time Out.", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Server error. Please try again.", type: "error" });
    }
  };

  const handleTimeOut = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/attendance/time-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id })
      });

      const data = await response.json();

      if (response.ok) {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        setAttendanceState(prev => ({
          ...prev,
          timeOut: formattedTime,
          status: "completed"
        }));
        
        setMessage({ text: "✅ Time Out recorded! Have a great day.", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);

        const recentRes = await fetch(`http://localhost:5000/api/attendance/my-attendance?userId=${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const recentData = await recentRes.json();
        const sorted = recentData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentAttendance(sorted.slice(0, 7));
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Server error. Please try again.", type: "error" });
    }
  };

  const todayDate = currentTime.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    return timeString;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Dashboard</span>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                Employee
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {greeting}, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{user.name || "Employee"}</span>
            </h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-indigo-500" />
              {todayDate}
            </p>
          </div>
          
          {/* Live Clock */}
          <div className="mt-4 md:mt-0 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-indigo-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-indigo-600 font-medium">Live Time</p>
              <p className="text-xl font-bold text-gray-800 tabular-nums">
                {currentTime.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-indigo-100 p-5 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Status</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.todayStatus}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-indigo-100 p-5 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Hours (Week)</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.weeklyHours}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <BriefcaseIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-indigo-100 p-5 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Leaves Left</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.leavesLeft} days</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <CalendarIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-indigo-100 p-5 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.pendingApprovals}</p>
            </div>
            <div className="bg-rose-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <UserGroupIcon className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Time In/Out Card */}
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Today's Attendance</h2>
          </div>
          
          <div className="space-y-4">
            {attendanceState.status === "in" && (
              <button
                onClick={handleTimeIn}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 group"
              >
                <CheckCircleIcon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                Time In
              </button>
            )}

            {attendanceState.status === "out" && (
              <button
                onClick={handleTimeOut}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 group"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                Time Out
              </button>
            )}

            {attendanceState.status === "completed" && (
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 text-center border border-emerald-200">
                <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-emerald-800 font-semibold">Day Completed! 🎉</p>
                <p className="text-sm text-emerald-600 mt-1">Great job! See you tomorrow.</p>
              </div>
            )}
          </div>

          {/* Today's Records */}
          {(attendanceState.timeIn || attendanceState.timeOut) && (
            <div className="mt-6 space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Records</p>
              {attendanceState.timeIn && (
                <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-700 font-medium">Time In</p>
                    <p className="text-lg font-bold text-emerald-800">{attendanceState.timeIn}</p>
                  </div>
                  <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
              )}
              {attendanceState.timeOut && (
                <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-700 font-medium">Time Out</p>
                    <p className="text-lg font-bold text-amber-800">{attendanceState.timeOut}</p>
                  </div>
                  <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center">
                    <ArrowRightOnRectangleIcon className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
              )}
              {attendanceState.timeIn && attendanceState.timeOut && (
                <div className="bg-indigo-50/80 rounded-xl p-4 border border-indigo-200">
                  <p className="text-xs text-indigo-700 font-medium">Total Hours Today</p>
                  <p className="text-2xl font-bold text-indigo-800">
                    {Math.floor(calculateHours(attendanceState.timeIn, attendanceState.timeOut))}h {Math.round((calculateHours(attendanceState.timeIn, attendanceState.timeOut) % 1) * 60)}m
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Message */}
          {message.text && (
            <div className={`mt-4 p-3 rounded-xl text-center font-medium ${
              message.type === 'success' 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-100 text-amber-700 border border-amber-200'
            }`}>
              {message.text}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            </div>
            <Link 
              href="/employee/attendance" 
              className="group text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              View Full History
              <ArrowTrendingUpIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-indigo-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-indigo-600 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-indigo-600 uppercase tracking-wider">Time In</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-indigo-600 uppercase tracking-wider">Time Out</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-indigo-600 uppercase tracking-wider">Hours</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50">
                {recentAttendance.length > 0 ? (
                  recentAttendance.map((record, idx) => {
                    const hours = calculateHours(record.timeIn, record.timeOut);
                    return (
                      <tr key={idx} className="hover:bg-indigo-50/50 transition-colors group">
                        <td className="py-3 px-4 text-sm text-gray-700 font-medium">{formatDate(record.date)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{formatTime(record.timeIn)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{formatTime(record.timeOut)}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-semibold">
                            {hours > 0 ? `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m` : '--'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No attendance records yet. Click Time In to start!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-indigo-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link 
            href="/employee/leaves" 
            className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors font-medium flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Apply for Leave
          </Link>
          <Link 
            href="/employee/attendance" 
            className="px-5 py-2.5 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-medium flex items-center gap-2"
          >
            <ChartBarIcon className="h-4 w-4" />
            View Attendance
          </Link>
        </div>
      </div>
    </div>
  );
}