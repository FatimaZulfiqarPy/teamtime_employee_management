"use client";
import { useState, useEffect, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 25;

// Helper to format time from backend
const formatTime = (timeString) => {
  if (!timeString) return "--:--";
  return timeString;
};

// Helper to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
};

// Helper to calculate hours (FIXED)
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
  
  try {
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
  } catch {
    return 0;
  }
};

export default function AttendancePage() {
  const [searchDate, setSearchDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [user, setUser] = useState({ id: "" });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser({ id: parsed.id });
    }
  }, []);

  // Fetch attendance data from backend
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user.id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await fetch(`http://localhost:5000/api/attendance/my-attendance?userId=${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch attendance');
        }

        const data = await response.json();

        // Sort by date (newest first)
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAttendanceData(sorted);

      } catch (error) {
        console.error("Error fetching attendance:", error);
        setMessage({ text: "Error loading attendance data", type: "error" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user.id]);

  // Filter data by search date
  const filteredData = useMemo(() => {
    if (!searchDate) return attendanceData;
    return attendanceData.filter(record => {
      const recordDate = new Date(record.date).toISOString().split('T')[0];
      return recordDate === searchDate;
    });
  }, [attendanceData, searchDate]);

  // Calculate summary stats
  const totalHours = useMemo(() => {
    return filteredData.reduce((acc, record) => {
      const hours = record.totalHours || calculateHours(record.timeIn, record.timeOut);
      return acc + hours;
    }, 0);
  }, [filteredData]);

  const averageHours = filteredData.length > 0
    ? (totalHours / filteredData.length).toFixed(1)
    : 0;

  // Paginate
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchDate]);

  const handleExport = async () => {
    try {
      setMessage({ text: "📊 Generating report...", type: "info" });

      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');

      const response = await fetch(`http://localhost:5000/api/attendance/my-attendance?userId=${userData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!data.length) {
        setMessage({ text: "No data to export", type: "error" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        return;
      }

      let csvContent = "Date,Time In,Time Out,Hours,Status\n";

      data.forEach(record => {
        const date = new Date(record.date).toLocaleDateString();
        const hours = record.totalHours ? record.totalHours.toFixed(2) : '0';
        csvContent += `${date},${record.timeIn || '--'},${record.timeOut || '--'},${hours},${record.status}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-${year}-${month}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage({ text: "✅ Report downloaded successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);

    } catch (error) {
      console.error("Export error:", error);
      setMessage({ text: "❌ Failed to generate report", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  // Calendar View Component
  const CalendarView = ({ data, currentMonth, setCurrentMonth }) => {
    const getDaysInMonth = (year, month) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
      return new Date(year, month, 1).getDay();
    };

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', attendance: null });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const attendance = data.find(record =>
        new Date(record.date).toISOString().split('T')[0] === dateStr
      );
      days.push({ day: i, attendance });
    }

    const changeMonth = (increment) => {
      const newDate = new Date(currentMonth);
      newDate.setMonth(newDate.getMonth() + increment);
      setCurrentMonth(newDate);
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[month]} {year}
          </h3>
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-indigo-100 rounded-lg transition-colors">
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100">
              Today
            </button>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-indigo-100 rounded-lg transition-colors">
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-indigo-600 py-2">{day}</div>
          ))}

          {days.map((item, index) => (
            <div key={index} className={`aspect-square p-2 rounded-lg border transition-all
              ${item.day ? 'hover:shadow-md cursor-pointer' : ''}
              ${item.attendance
                ? item.attendance.status === 'present'
                  ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                : item.day ? 'bg-white border-gray-200 hover:border-indigo-200' : ''
              }`}>
              {item.day > 0 && (
                <div className="h-full flex flex-col">
                  <span className="text-sm font-medium text-gray-700">{item.day}</span>
                  {item.attendance && (
                    <div className="mt-1 text-xs">
                      {item.attendance.timeIn && (
                        <div className="text-emerald-600 font-medium">
                          {item.attendance.timeIn.split(' ')[0]}
                        </div>
                      )}
                      {item.attendance.totalHours > 0 && (
                        <div className="text-indigo-600">{item.attendance.totalHours}h</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-50 border border-emerald-200 rounded"></div><span className="text-sm text-gray-600">Present</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-50 border border-amber-200 rounded"></div><span className="text-sm text-gray-600">Half Day</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-gray-200 rounded"></div><span className="text-sm text-gray-600">No Record</span></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Attendance</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">History</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">My Attendance Records</h1>
        <p className="text-gray-600">Track and manage your daily attendance history</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl text-center font-medium ${message.type === 'success'
          ? 'bg-green-100 text-green-700 border border-green-200'
          : message.type === 'error'
            ? 'bg-rose-100 text-rose-700 border border-rose-200'
            : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-indigo-100">
          <p className="text-sm text-gray-500 mb-1">Total Records</p>
          <p className="text-2xl font-bold text-gray-800">{filteredData.length}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-indigo-100">
          <p className="text-sm text-gray-500 mb-1">Total Hours</p>
          <p className="text-2xl font-bold text-indigo-600">
            {Math.floor(totalHours)}h {Math.round((totalHours % 1) * 60)}m
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-indigo-100">
          <p className="text-sm text-gray-500 mb-1">Average/Day</p>
          <p className="text-2xl font-bold text-purple-600">{averageHours}h</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-indigo-100">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full">
            <form className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Search by Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    value={searchDate}
                    onChange={(e) => {
                      setSearchDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              {searchDate && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchDate("");
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </form>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${viewMode === "table"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${viewMode === "calendar"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
            >
              Calendar View
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {filteredData.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-indigo-600">{paginatedData.length}</span> of{" "}
            <span className="font-semibold text-indigo-600">{filteredData.length}</span> records
          </p>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-indigo-50 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4 text-indigo-600" />
            Export Report
          </button>
        </div>
      )}

      {/* Conditional Rendering: Table or Calendar */}
      {viewMode === "table" ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-indigo-100">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left"><div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-indigo-600" /><span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Date</span></div></th>
                  <th className="px-6 py-4 text-left"><span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Time In</span></th>
                  <th className="px-6 py-4 text-left"><span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Time Out</span></th>
                  <th className="px-6 py-4 text-left"><div className="flex items-center gap-2"><ChartBarIcon className="h-4 w-4 text-indigo-600" /><span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total Hours</span></div></th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-indigo-50">
                {paginatedData.length > 0 ? (
                  paginatedData.map((record, idx) => {
                    const hours = record.totalHours || calculateHours(record.timeIn, record.timeOut);
                    return (
                      <tr key={record._id || idx} className="hover:bg-indigo-50/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-900">{formatDate(record.date)}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">{record.timeIn || '--:--'}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">{record.timeOut || '--:--'}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold">{hours > 0 ? `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m` : '--'}</span></td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="4" className="px-6 py-16 text-center"><div className="flex flex-col items-center"><div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4"><CalendarIcon className="h-8 w-8 text-indigo-400" /></div><p className="text-gray-500 font-medium">No attendance records found</p><p className="text-sm text-gray-400 mt-1">{searchDate ? 'Try a different date' : 'Click Time In on dashboard to start!'}</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <CalendarView data={filteredData} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-indigo-100">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeftIcon className="h-5 w-5 text-gray-600" /></button>
            {[...Array(totalPages)].map((_, i) => (<button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-indigo-50"}`}>{i + 1}</button>))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRightIcon className="h-5 w-5 text-gray-600" /></button>
          </nav>
        </div>
      )}

      {/* Footer Note */}
      {filteredData.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-6">Showing {ITEMS_PER_PAGE} records per page • Last updated: {new Date().toLocaleDateString()}</p>
      )}
    </div>
  );
}