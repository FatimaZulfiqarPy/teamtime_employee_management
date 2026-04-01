"use client";
import { useState, useEffect, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function ViewAttendance() {
  const [filters, setFilters] = useState({
    userId: "",
    startDate: "",
    endDate: ""
  });
  const [allAttendance, setAllAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState({ text: "", type: "" });
  const itemsPerPage = 10;

  // Fetch employees and attendance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        // 1️⃣ Fetch all employees
        const usersRes = await fetch('http://localhost:5000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const employeesData = await usersRes.json();
        setEmployees(employeesData);

        // 2️⃣ Fetch all attendance
        const attendanceRes = await fetch('http://localhost:5000/api/attendance/all-attendance', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const attendanceData = await attendanceRes.json();
        
        // Sort by date (newest first)
        const sorted = attendanceData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllAttendance(sorted);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage({ text: "Error loading attendance data", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter attendance based on criteria
  const filteredData = useMemo(() => {
    let filtered = allAttendance;
    
    // Filter by user (name or department)
    if (filters.userId) {
      const searchLower = filters.userId.toLowerCase();
      filtered = filtered.filter(att => {
        const user = employees.find(e => e._id === att.user?._id);
        return (user?.name?.toLowerCase().includes(searchLower) ||
                user?.department?.toLowerCase().includes(searchLower));
      });
    }
    
    // Filter by start date
    if (filters.startDate) {
      filtered = filtered.filter(att => att.date.split('T')[0] >= filters.startDate);
    }
    
    // Filter by end date
    if (filters.endDate) {
      filtered = filtered.filter(att => att.date.split('T')[0] <= filters.endDate);
    }
    
    return filtered;
  }, [allAttendance, employees, filters]);

  // Get user details for attendance record
  const getEmployeeDetails = (userId) => {
    return employees.find(e => e._id === userId) || { name: 'Unknown', department: 'Unknown' };
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString;
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleExport = async () => {
    try {
      setMessage({ text: "📊 Generating attendance report...", type: "info" });
      
      // Get current month and year for filename
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      
      // Create CSV content
      let csvContent = "Employee,Department,Date,Time In,Time Out,Hours,Status\n";
      
      filteredData.forEach(record => {
        const employee = getEmployeeDetails(record.user?._id);
        const date = formatDate(record.date);
        const hours = record.totalHours ? record.totalHours.toFixed(2) : '0';
        const status = record.status || 'present';
        
        csvContent += `"${employee.name}","${employee.department || 'Not Assigned'}","${date}","${record.timeIn || '--'}","${record.timeOut || '--'}","${hours}","${status}"\n`;
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-report-${year}-${month}.csv`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage({ text: "✅ Report downloaded successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      
    } catch (error) {
      console.error("Export error:", error);
      setMessage({ text: "❌ Failed to generate report", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const clearFilters = () => {
    setFilters({ userId: "", startDate: "", endDate: "" });
    setMessage({ text: "", type: "" });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch(status) {
      case 'present': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'absent': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'half-day': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Calculate hours display
  const getHoursDisplay = (attendance) => {
    if (attendance.totalHours > 0) {
      return `${Math.floor(attendance.totalHours)}h ${Math.round((attendance.totalHours % 1) * 60)}m`;
    }
    return '--';
  };

  if (loading && allAttendance.length === 0) {
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
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Attendance</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            Admin View
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Attendance Overview
            </h1>
            <p className="text-gray-600">View and filter employee attendance records</p>
          </div>
          
          {/* Stats Summary */}
          {filteredData.length > 0 && (
            <div className="mt-4 md:mt-0 flex gap-3">
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-indigo-100">
                <p className="text-xs text-gray-500">Total Records</p>
                <p className="text-lg font-bold text-indigo-600">{filteredData.length}</p>
              </div>
            </div>
          )}
        </div>
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
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: "", type: "" })}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Filter Form */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-indigo-100">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* User Filter */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-indigo-600" />
                Employee
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.userId}
                  onChange={(e) => setFilters({...filters, userId: e.target.value})}
                  placeholder="Name or Department"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-indigo-600" />
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* End Date */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-indigo-600" />
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-1 flex items-end gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FunnelIcon className="h-4 w-4" />
                Apply Filters
              </button>
              
              {(filters.userId || filters.startDate || filters.endDate) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Export Button */}
        {filteredData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-indigo-100 flex justify-end">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white border border-indigo-200 text-gray-700 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export Report
            </button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {filteredData.length > 0 && (
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-indigo-600">{paginatedData.length}</span> of{" "}
            <span className="font-semibold text-indigo-600">{filteredData.length}</span> records
          </p>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-indigo-100">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Time In</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Time Out</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Status</th>
               </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-indigo-50">
              {paginatedData.length > 0 ? (
                paginatedData.map((record, index) => {
                  const employee = getEmployeeDetails(record.user?._id);
                  return (
                    <tr key={record._id || index} className="hover:bg-indigo-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                          {employee.department || 'Not Assigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{formatTime(record.timeIn)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{formatTime(record.timeOut) || '--:--'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-indigo-600">{getHoursDisplay(record)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(record.status)}`}>
                          {record.status || 'present'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <ClockIcon className="h-8 w-8 text-indigo-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No attendance records found</p>
                      <p className="text-sm text-gray-400 mt-1">Use the filters above to view attendance data</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-2 border border-indigo-100">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-indigo-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-indigo-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-indigo-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}