"use client";
import { useState, useEffect, useMemo } from "react";
import {
  CalendarDaysIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function LeavesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  // Fetch leaves and employees from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // 1️⃣ Fetch all employees (to get names)
        const usersRes = await fetch('http://localhost:5000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        setEmployees(usersData);

        // 2️⃣ Fetch all leave requests
        const leavesRes = await fetch('http://localhost:5000/api/leaves', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const leavesData = await leavesRes.json();
        
        // Sort by date (newest first)
        const sorted = leavesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLeaves(sorted);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage({ text: "Error loading leave requests", type: "error" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // In your admin leaves page (where you see "Unknown")
const getEmployeeDetails = (userData) => {
  // If user is already populated (has name property)
  if (userData && userData.name) {
    return {
      name: userData.name,
      email: userData.email,
      department: userData.department || 'Not Assigned'
    };
  }
  // If it's just an ID (should not happen with populate)
  return { 
    name: 'Unknown', 
    email: '', 
    department: 'Not Assigned' 
  };
};

  // Filter leaves based on search and status
  const filteredLeaves = useMemo(() => {
    let filtered = leaves;
    
    // Filter by search (employee name or department)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(leave => {
        const employee = getEmployeeDetails(leave.user);
        return employee.name.toLowerCase().includes(searchLower) ||
               employee.department.toLowerCase().includes(searchLower);
      });
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(leave => 
        leave.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    return filtered;
  }, [leaves, searchTerm, statusFilter, employees]);

  // Pagination
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const paginatedLeaves = filteredLeaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Handle status change (Approve/Reject)
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/leaves/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus.toLowerCase() })
      });

      if (response.ok) {
        // Update local state immediately
        setLeaves(leaves.map(leave => 
          leave._id === id ? { ...leave, status: newStatus } : leave
        ));
        
        setMessage({ 
          text: `✅ Leave request ${newStatus.toLowerCase()} successfully!`, 
          type: "success" 
        });
        
        // Close modal if open
        setIsModalOpen(false);
        setSelectedLeave(null);
      } else {
        const data = await response.json();
        setMessage({ text: data.message || "Failed to update", type: "error" });
      }
    } catch (error) {
      console.error("Error updating leave:", error);
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  // Handle export
  const handleExport = () => {
    setMessage({ text: "📊 Exporting leave reports...", type: "info" });
    
    try {
      // Create CSV content
      let csvContent = "Employee,Department,Leave Type,Start Date,End Date,Days,Reason,Status,Applied On\n";
      
      filteredLeaves.forEach(leave => {
        const employee = getEmployeeDetails(leave.user);
        const startDate = new Date(leave.startDate).toLocaleDateString();
        const endDate = new Date(leave.endDate).toLocaleDateString();
        const appliedOn = new Date(leave.createdAt).toLocaleDateString();
        
        csvContent += `"${employee.name}","${employee.department || 'Not Assigned'}","${leave.leaveType}","${startDate}","${endDate}","${leave.days}","${leave.reason}","${leave.status}","${appliedOn}"\n`;
      });
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const now = new Date();
      const fileName = `leave-requests-${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}.csv`;
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage({ text: "✅ Report exported successfully!", type: "success" });
    } catch (error) {
      setMessage({ text: "❌ Failed to export", type: "error" });
    } finally {
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  // View details
  const viewDetails = (leave) => {
    setSelectedLeave(leave);
    setIsModalOpen(true);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Stats
  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === "pending").length,
    approved: leaves.filter(l => l.status === "approved").length,
    rejected: leaves.filter(l => l.status === "rejected").length,
    totalDays: leaves.reduce((acc, l) => acc + l.days, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leave requests...</p>
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
            Admin
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Leave Requests
            </h1>
            <p className="text-gray-600">Manage and approve employee leave requests</p>
          </div>
          
          {/* Stats Cards */}
          <div className="mt-4 md:mt-0 flex gap-3">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-indigo-100">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-lg font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-indigo-100">
              <p className="text-xs text-gray-500">Approved</p>
              <p className="text-lg font-bold text-emerald-600">{stats.approved}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-indigo-100">
              <p className="text-xs text-gray-500">Total Days</p>
              <p className="text-lg font-bold text-indigo-600">{stats.totalDays}</p>
            </div>
          </div>
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

      {/* Search and Filter Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 mb-8 border border-indigo-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[150px]">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-white border border-indigo-200 text-gray-700 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-indigo-600">{paginatedLeaves.length}</span> of{" "}
          <span className="font-semibold text-indigo-600">{filteredLeaves.length}</span> requests
        </p>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-indigo-100">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Days</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Actions</th>
               </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-indigo-50">
              {paginatedLeaves.length > 0 ? (
                paginatedLeaves.map((leave) => {
                  const employee = getEmployeeDetails(leave.user);
                  return (
                    <tr key={leave._id} className="hover:bg-indigo-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                            <p className="text-xs text-gray-500">{employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                          {employee.department || 'Not Assigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {leave.leaveType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-indigo-600">{leave.days} days</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewDetails(leave)}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {leave.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(leave._id, "approved")}
                                className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(leave._id, "rejected")}
                                className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <CalendarDaysIcon className="h-8 w-8 text-indigo-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No leave requests found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
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
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === i + 1
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-indigo-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            
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

      {/* Leave Details Modal */}
      {isModalOpen && selectedLeave && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Leave Request Details</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {(() => {
                const employee = getEmployeeDetails(selectedLeave.user);
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-indigo-50 rounded-xl">
                        <p className="text-xs text-indigo-600">Employee</p>
                        <p className="text-lg font-semibold text-gray-800">{employee.name}</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-xl">
                        <p className="text-xs text-purple-600">Department</p>
                        <p className="text-lg font-semibold text-gray-800">{employee.department || 'Not Assigned'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-amber-50 rounded-xl">
                        <p className="text-xs text-amber-600">Leave Type</p>
                        <p className="text-lg font-semibold text-gray-800 capitalize">{selectedLeave.leaveType}</p>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl">
                        <p className="text-xs text-emerald-600">Duration</p>
                        <p className="text-lg font-semibold text-gray-800">{selectedLeave.days} days</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Start Date</p>
                        <p className="text-sm font-medium text-gray-800">{formatDate(selectedLeave.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">End Date</p>
                        <p className="text-sm font-medium text-gray-800">{formatDate(selectedLeave.endDate)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Reason</p>
                      <p className="text-sm text-gray-800 mt-1 p-3 bg-gray-50 rounded-xl">
                        {selectedLeave.reason}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500">Applied On</p>
                        <p className="text-sm font-medium text-gray-800">{formatDate(selectedLeave.createdAt)}</p>
                      </div>
                      <span className={`px-4 py-2 text-sm font-medium rounded-full border ${getStatusBadge(selectedLeave.status)}`}>
                        {selectedLeave.status}
                      </span>
                    </div>

                    {selectedLeave.status === "pending" && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleStatusChange(selectedLeave._id, "approved")}
                          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckIcon className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedLeave._id, "rejected")}
                          className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <XMarkIcon className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}