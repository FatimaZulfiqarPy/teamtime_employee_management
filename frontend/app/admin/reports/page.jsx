"use client";
import { useState, useEffect, useMemo } from "react";
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ChartPieIcon,
  DocumentTextIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";

export default function ReportsPage() {
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: ""
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  
  // Real data states
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  
  // Fetch real data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        
        // Fetch employees
        const usersRes = await fetch('http://localhost:5000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        setEmployees(usersData);
        
        // Fetch attendance
        const attendanceRes = await fetch('http://localhost:5000/api/attendance/all-attendance', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData);
        
        // Fetch leaves
        const leavesRes = await fetch('http://localhost:5000/api/leaves', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const leavesData = await leavesRes.json();
        setLeaves(leavesData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage({ text: "Error loading reports data", type: "error" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);
  
  // Calculate real stats based on date range
  const calculateReportData = (reportType) => {
    let startDate = dateRange.start ? new Date(dateRange.start) : null;
    let endDate = dateRange.end ? new Date(dateRange.end) : null;
    
    switch(reportType) {
      case 'attendance': {
        let filteredAttendance = attendance;
        
        if (startDate && endDate) {
          filteredAttendance = attendance.filter(att => {
            const attDate = new Date(att.date);
            return attDate >= startDate && attDate <= endDate;
          });
        }
        
        const total = filteredAttendance.length;
        const present = filteredAttendance.filter(att => att.status === 'present' && att.timeIn).length;
        const absent = filteredAttendance.filter(att => att.status === 'absent' || !att.timeIn).length;
        
        return {
          total,
          present,
          absent,
          late: 0
        };
      }
      
      case 'leaves': {
        let filteredLeaves = leaves;
        
        if (startDate && endDate) {
          filteredLeaves = leaves.filter(leave => {
            const leaveDate = new Date(leave.createdAt);
            return leaveDate >= startDate && leaveDate <= endDate;
          });
        }
        
        const pending = filteredLeaves.filter(l => l.status === 'pending').length;
        const approved = filteredLeaves.filter(l => l.status === 'approved').length;
        const rejected = filteredLeaves.filter(l => l.status === 'rejected').length;
        const totalDays = filteredLeaves.reduce((sum, l) => sum + l.days, 0);
        
        return {
          pending,
          approved,
          rejected,
          totalDays
        };
      }
      
      case 'departments': {
        const deptMap = new Map();
        employees.forEach(emp => {
          const dept = emp.department || 'Not Assigned';
          if (!deptMap.has(dept)) {
            deptMap.set(dept, { name: dept, count: 0 });
          }
          deptMap.get(dept).count++;
        });
        
        const total = deptMap.size;
        return {
          total,
          active: total,
          avgSize: (employees.length / total).toFixed(1)
        };
      }
      
      case 'summary': {
        const totalEmployees = employees.length;
        const totalAttendance = attendance.length;
        const totalLeaves = leaves.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.days, 0);
        const avgAttendance = totalEmployees > 0 ? ((totalAttendance / (totalEmployees * 30)) * 100).toFixed(1) : 0;
        
        return {
          departments: new Set(employees.map(e => e.department || 'Not Assigned')).size,
          employees: totalEmployees,
          totalLeaves,
          avgAttendance: `${avgAttendance}%`
        };
      }
      
      default:
        return {};
    }
  };
  
  const reports = useMemo(() => [
    {
      id: 1,
      title: "Monthly Attendance Report",
      description: "Complete attendance overview with present/absent stats",
      icon: <ClockIcon className="h-8 w-8" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      type: "attendance",
      lastGenerated: new Date().toLocaleDateString(),
      format: "CSV",
      stats: calculateReportData('attendance')
    },
    {
      id: 2,
      title: "Leave Analysis Report",
      description: "Detailed leave trends, department-wise leave usage, and balance summaries",
      icon: <CalendarIcon className="h-8 w-8" />,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      type: "leaves",
      lastGenerated: new Date().toLocaleDateString(),
      format: "CSV",
      stats: calculateReportData('leaves')
    },
    {
      id: 3,
      title: "Department Overview Report",
      description: "Department-wise headcount and organization structure",
      icon: <BuildingOfficeIcon className="h-8 w-8" />,
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50",
      textColor: "text-rose-600",
      type: "departments",
      lastGenerated: new Date().toLocaleDateString(),
      format: "CSV",
      stats: calculateReportData('departments')
    },
    {
      id: 4,
      title: "Overall Summary Report",
      description: "Company-wide metrics including attendance, leaves, and department statistics",
      icon: <ChartPieIcon className="h-8 w-8" />,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      type: "summary",
      lastGenerated: new Date().toLocaleDateString(),
      format: "CSV",
      stats: calculateReportData('summary')
    }
  ], [attendance, leaves, employees, dateRange]);
  
  // Generate and download report
  const handleGenerateReport = (report) => {
    if (!dateRange.start || !dateRange.end) {
      setMessage({ text: "Please select date range first", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }
    
    setMessage({ text: `📊 Generating ${report.title}...`, type: "info" });
    
    try {
      let csvContent = "";
      const startDate = new Date(dateRange.start).toLocaleDateString();
      const endDate = new Date(dateRange.end).toLocaleDateString();
      
      switch(report.type) {
        case 'attendance':
          csvContent = `Attendance Report (${startDate} - ${endDate})\n\n`;
          csvContent += `Total Records,${report.stats.total}\n`;
          csvContent += `Present,${report.stats.present}\n`;
          csvContent += `Absent,${report.stats.absent}\n`;
          csvContent += `Attendance Rate,${report.stats.total > 0 ? ((report.stats.present/report.stats.total)*100).toFixed(1) : 0}%\n`;
          break;
          
        case 'leaves':
          csvContent = `Leave Analysis Report (${startDate} - ${endDate})\n\n`;
          csvContent += `Pending Requests,${report.stats.pending}\n`;
          csvContent += `Approved Requests,${report.stats.approved}\n`;
          csvContent += `Rejected Requests,${report.stats.rejected}\n`;
          csvContent += `Total Days,${report.stats.totalDays}\n`;
          break;
          
        case 'departments':
          csvContent = `Department Overview Report (${startDate} - ${endDate})\n\n`;
          csvContent += `Total Departments,${report.stats.total}\n`;
          csvContent += `Active Departments,${report.stats.active}\n`;
          csvContent += `Average Department Size,${report.stats.avgSize} employees\n`;
          break;
          
        case 'summary':
          csvContent = `Overall Summary Report (${startDate} - ${endDate})\n\n`;
          csvContent += `Total Departments,${report.stats.departments}\n`;
          csvContent += `Total Employees,${report.stats.employees}\n`;
          csvContent += `Total Leave Days,${report.stats.totalLeaves}\n`;
          csvContent += `Average Attendance,${report.stats.avgAttendance}\n`;
          break;
      }
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `${report.type}-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage({ text: `✅ ${report.title} generated and downloaded!`, type: "success" });
      
    } catch (error) {
      setMessage({ text: "❌ Failed to generate report", type: "error" });
    } finally {
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };
  
  const viewDetails = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Analytics</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            Reports
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Reports Dashboard
            </h1>
            <p className="text-gray-600">Generate and download detailed reports</p>
          </div>
          
          {/* Date Range Selector */}
          <div className="mt-4 md:mt-0 flex gap-3">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
            />
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 border border-indigo-100">
          <p className="text-sm text-gray-500">Total Reports</p>
          <p className="text-2xl font-bold text-indigo-600">{reports.length}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 border border-indigo-100">
          <p className="text-sm text-gray-500">Total Employees</p>
          <p className="text-2xl font-bold text-purple-600">{employees.length}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 border border-indigo-100">
          <p className="text-sm text-gray-500">Attendance Records</p>
          <p className="text-2xl font-bold text-emerald-600">{attendance.length}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 border border-indigo-100">
          <p className="text-sm text-gray-500">Leave Requests</p>
          <p className="text-2xl font-bold text-amber-600">{leaves.length}</p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-indigo-100 overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          >
            {/* Header with gradient */}
            <div className={`h-2 bg-gradient-to-r ${report.color}`}></div>
            
            <div className="p-5">
              {/* Icon and Title */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${report.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <div className={report.textColor}>
                    {report.icon}
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800">{report.title}</h2>
                  <p className="text-xs text-gray-500">{report.type}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-1 mb-3">
                {Object.entries(report.stats).slice(0, 2).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => viewDetails(report)}
                  className="flex-1 px-2 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1 text-xs"
                >
                  <EyeIcon className="h-3 w-3" />
                  View
                </button>
                <button
                  onClick={() => handleGenerateReport(report)}
                  className="flex-1 px-2 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-1 text-xs"
                >
                  <ArrowDownTrayIcon className="h-3 w-3" />
                  Export
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Details Modal */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
              <div className={`h-2 bg-gradient-to-r ${selectedReport.color} rounded-t-2xl -mt-6 -mx-6 mb-4`}></div>
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${selectedReport.bgColor} rounded-xl flex items-center justify-center`}>
                    <div className={`${selectedReport.textColor} w-6 h-6`}>
                      {selectedReport.icon}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{selectedReport.title}</h2>
                    <p className="text-xs text-gray-500">Date Range: {dateRange.start} to {dateRange.end}</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">{selectedReport.description}</p>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Report Summary</h3>
                  {Object.entries(selectedReport.stats).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 text-sm border-b border-gray-200 last:border-0">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-semibold text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    handleGenerateReport(selectedReport);
                    setIsModalOpen(false);
                  }}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Download Report (CSV)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400">
          Reports are generated based on selected date range. All data is updated in real-time from database.
        </p>
      </div>
    </div>
  );
}