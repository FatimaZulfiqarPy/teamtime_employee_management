"use client";
import { useState, useEffect } from "react";
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BellAlertIcon,
  ChartBarIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';
import Link from "next/link";

export default function AdminDashboard() {
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  // Real data states
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    pendingLeaves: 0,
    totalHours: 0,
    activeEmployees: 0,
    onLeave: 0,
    newRequests: 0,
    approvalsPending: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);

  // Live clock and greeting
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
    return () => clearInterval(timer);
  }, []);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // 1️⃣ Fetch all employees
        const usersRes = await fetch('http://localhost:5000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const employees = await usersRes.json();
        
        // 2️⃣ Fetch all leave requests
        const leavesRes = await fetch('http://localhost:5000/api/leaves', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const leaves = await leavesRes.json();
        
        // 3️⃣ Fetch all attendance records
        const attendanceRes = await fetch('http://localhost:5000/api/attendance/all-attendance', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const allAttendance = await attendanceRes.json();
        
        // Get today's date (YYYY-MM-DD format)
        const today = new Date().toISOString().split('T')[0];
        
        // Calculate real stats
        const totalEmployees = employees.length;
        const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
        
        // Active employees today (have time in record)
        const activeEmployees = allAttendance.filter(att => {
          const attDate = new Date(att.date).toISOString().split('T')[0];
          return attDate === today && att.timeIn;
        }).length;
        
        // Employees on approved leave today
        const onLeave = leaves.filter(leave => {
          const start = new Date(leave.startDate).toISOString().split('T')[0];
          const end = new Date(leave.endDate).toISOString().split('T')[0];
          return leave.status === 'approved' && today >= start && today <= end;
        }).length;
        
        // New requests today
        const newRequests = leaves.filter(leave => {
          const created = new Date(leave.createdAt).toISOString().split('T')[0];
          return created === today;
        }).length;
        
        // Total hours this month from attendance
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const realTotalHours = allAttendance.filter(att => {
          const attDate = new Date(att.date);
          return attDate.getMonth() === currentMonth && 
                 attDate.getFullYear() === currentYear;
        }).reduce((sum, att) => sum + (att.totalHours || 0), 0);
        
        // Set default working hours (8hrs/day × 20 days = 160hrs per employee)
        const defaultWorkingHoursPerEmployee = 160;
        const defaultTotalHours = totalEmployees * defaultWorkingHoursPerEmployee;
        const displayTotalHours = realTotalHours > 0 ? realTotalHours : defaultTotalHours;
        
        // Department stats from employees (including "Not Assigned")
        const deptMap = new Map();
        employees.forEach(emp => {
          const dept = emp.department || 'Not Assigned';
          if (!deptMap.has(dept)) {
            deptMap.set(dept, { 
              name: dept, 
              employees: 0, 
              present: 0, 
              leave: 0 
            });
          }
          deptMap.get(dept).employees++;
        });
        
        // Calculate present and leave per department
        for (let [deptName, dept] of deptMap.entries()) {
          const deptEmployees = employees.filter(e => (e.department || 'Not Assigned') === deptName);
          const deptEmployeeIds = deptEmployees.map(e => e._id);
          
          // Present today
          const presentCount = allAttendance.filter(att => {
            const attDate = new Date(att.date).toISOString().split('T')[0];
            return attDate === today && 
                   att.timeIn && 
                   deptEmployeeIds.includes(att.user?._id);
          }).length;
          
          // On leave today
          const leaveCount = leaves.filter(leave => {
            const start = new Date(leave.startDate).toISOString().split('T')[0];
            const end = new Date(leave.endDate).toISOString().split('T')[0];
            return leave.status === 'approved' && 
                   today >= start && 
                   today <= end &&
                   deptEmployeeIds.includes(leave.user?._id);
          }).length;
          
          dept.present = presentCount;
          dept.leave = leaveCount;
        }
        
        const departments = Array.from(deptMap.values());
        
        // Recent activities from leaves (latest 5)
        const activities = leaves
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(leave => ({
            id: leave._id,
            user: leave.user?.name || 'Unknown',
            action: `${leave.leaveType} leave - ${leave.days} days`,
            time: new Date(leave.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: leave.status
          }));
        
        // Update stats
        setStats({
          totalEmployees,
          totalDepartments: departments.length,
          pendingLeaves,
          totalHours: displayTotalHours,
          activeEmployees,
          onLeave,
          newRequests,
          approvalsPending: pendingLeaves
        });
        
        setDepartmentStats(departments);
        setRecentActivities(activities);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Status badge color
  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Dashboard</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            Admin
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {greeting}, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Admin</span>
            </h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              Here's what's happening with your organization today
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

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-indigo-100 p-5 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Employees</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalEmployees}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <UsersIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm text-emerald-600">
            <ArrowTrendingUpIcon className="h-4 w-4" />
            <span>Active workforce</span>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-indigo-100 p-5 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Departments</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalDepartments}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <span>Across organization</span>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-indigo-100 p-5 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Leaves</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pendingLeaves}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <CalendarDaysIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Needs approval</span>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-indigo-100 p-5 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Hours (Month)</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.totalHours}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <ClockIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            {stats.totalHours > 0 && stats.totalHours < 1600 ? (
              <span>From attendance records</span>
            ) : (
              <span className="text-amber-600">📊 Default: 160hrs/employee/month</span>
            )}
          </div>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 border border-indigo-100">
          <p className="text-sm text-gray-500">Active Today</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-2xl font-bold text-emerald-600">{stats.activeEmployees}</p>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
              {stats.totalEmployees ? Math.round((stats.activeEmployees/stats.totalEmployees)*100) : 0}%
            </span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 border border-indigo-100">
          <p className="text-sm text-gray-500">On Leave Today</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-2xl font-bold text-amber-600">{stats.onLeave}</p>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Absent</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 border border-indigo-100">
          <p className="text-sm text-gray-500">New Requests</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-2xl font-bold text-blue-600">{stats.newRequests}</p>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Today</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 border border-indigo-100">
          <p className="text-sm text-gray-500">Approvals Pending</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-2xl font-bold text-rose-600">{stats.approvalsPending}</p>
            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">Action needed</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Department Overview */}
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="h-4 w-4 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Department Overview</h2>
            </div>
            <Link href="/admin/departments" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>

          <div className="space-y-4">
            {departmentStats.map((dept, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                  <span className="text-xs text-gray-500">{dept.employees} employees</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${dept.employees ? (dept.present/dept.employees)*100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-emerald-600">{dept.present} present</span>
                </div>
                {dept.leave > 0 && (
                  <p className="text-xs text-amber-600 mt-1">{dept.leave} on leave</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <BellAlertIcon className="h-4 w-4 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
            </div>
            <Link href="/admin/activities" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>

          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-indigo-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.status === 'pending' ? 'bg-amber-100' :
                      activity.status === 'approved' ? 'bg-emerald-100' : 'bg-blue-100'
                    }`}>
                      <UserGroupIcon className={`h-4 w-4 ${
                        activity.status === 'pending' ? 'text-amber-600' :
                        activity.status === 'approved' ? 'text-emerald-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{activity.user}</p>
                      <p className="text-xs text-gray-500">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(activity.status)}`}>
                      {activity.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent activities
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/admin/employees" className="group bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 border border-indigo-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <UsersIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Manage Employees</p>
              <p className="text-xs text-gray-500">Add, edit, remove</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/leaverequests" className="group bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 border border-indigo-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDaysIcon className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Leave Requests</p>
              <p className="text-xs text-gray-500">{stats.pendingLeaves} pending</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/reports" className="group bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 border border-indigo-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChartBarIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Reports</p>
              <p className="text-xs text-gray-500">Download CSV</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/settings" className="group bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 border border-indigo-100 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cog6ToothIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Settings</p>
              <p className="text-xs text-gray-500">Configure system</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}