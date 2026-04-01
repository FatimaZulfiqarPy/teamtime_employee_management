"use client";
import { useState, useEffect, useMemo } from "react";
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ComputerDesktopIcon,
  MegaphoneIcon,
  BriefcaseIcon,
  ArrowTopRightOnSquareIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";

export default function DepartmentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [departments, setDepartments] = useState([]);

  // Department color mapping
  const getDepartmentColor = (name) => {
    const colors = {
      'IT': { color: "from-purple-500 to-purple-600", bgColor: "bg-purple-50", textColor: "text-purple-600", icon: <ComputerDesktopIcon className="h-6 w-6" /> },
      'HR': { color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", textColor: "text-blue-600", icon: <UserGroupIcon className="h-6 w-6" /> },
      'Marketing': { color: "from-pink-500 to-pink-600", bgColor: "bg-pink-50", textColor: "text-pink-600", icon: <MegaphoneIcon className="h-6 w-6" /> },
      'Finance': { color: "from-emerald-500 to-emerald-600", bgColor: "bg-emerald-50", textColor: "text-emerald-600", icon: <CurrencyDollarIcon className="h-6 w-6" /> },
      'Not Assigned': { color: "from-gray-500 to-gray-600", bgColor: "bg-gray-50", textColor: "text-gray-600", icon: <BuildingOfficeIcon className="h-6 w-6" /> }
    };
    return colors[name] || colors['Not Assigned'];
  };

  // Fetch employees and group by department
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }

        const employees = await response.json();
        
        // Group employees by department and calculate stats
        const deptMap = new Map();
        
        employees.forEach(emp => {
          const deptName = emp.department || 'Not Assigned';
          if (!deptMap.has(deptName)) {
            deptMap.set(deptName, {
              id: deptName,
              name: deptName,
              desc: getDepartmentDescription(deptName),
              employees: 0,
              head: getDepartmentHead(deptName),
              projects: getDepartmentProjects(deptName),
              location: getDepartmentLocation(deptName),
              employeesList: []
            });
          }
          const dept = deptMap.get(deptName);
          dept.employees++;
          dept.employeesList.push(emp);
        });
        
        // Convert map to array and add icons/colors
        const departmentsArray = Array.from(deptMap.values()).map(dept => {
          const colors = getDepartmentColor(dept.name);
          return {
            ...dept,
            ...colors,
            employees: dept.employees,
            employeesList: dept.employeesList
          };
        });
        
        setDepartments(departmentsArray);
      } catch (error) {
        console.error("Error fetching departments:", error);
        setMessage({ text: "Error loading departments", type: "error" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [router]);

  // Helper functions for mock department details (can be updated from backend later)
  const getDepartmentDescription = (name) => {
    const descriptions = {
      'IT': 'Manages systems, software, networks and technical support infrastructure.',
      'HR': 'Handles recruitment, employee relations and policies.',
      'Marketing': 'Promotes brand identity, manages campaigns and outreach.',
      'Finance': 'Responsible for budgeting, salary processing and accounts.',
      'Not Assigned': 'Employees not yet assigned to a department.'
    };
    return descriptions[name] || 'Department details coming soon.';
  };

  const getDepartmentHead = (name) => {
    const heads = {
      'IT': 'Ali Raza',
      'HR': 'Sarah Khan',
      'Marketing': 'Omar Farooq',
      'Finance': 'Fatima Ahmed',
      'Not Assigned': 'To be assigned'
    };
    return heads[name] || 'To be assigned';
  };

  const getDepartmentProjects = (name) => {
    const projects = {
      'IT': 8,
      'HR': 5,
      'Marketing': 7,
      'Finance': 4,
      'Not Assigned': 0
    };
    return projects[name] || 0;
  };

  const getDepartmentLocation = (name) => {
    const locations = {
      'IT': 'Tech Park',
      'HR': 'Main Office',
      'Marketing': 'Downtown',
      'Finance': 'Main Office',
      'Not Assigned': 'Various'
    };
    return locations[name] || 'Main Office';
  };

  // Filter departments based on search
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departments, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Organization</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            Departments
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Departments
            </h1>
            <p className="text-gray-600">View all departments in your organization</p>
          </div>
          
          {/* Stats Summary */}
          <div className="mt-4 md:mt-0 flex gap-3">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-indigo-100">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-indigo-600">{departments.length}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-indigo-100">
              <p className="text-xs text-gray-500">Employees</p>
              <p className="text-lg font-bold text-emerald-600">
                {departments.reduce((acc, dept) => acc + dept.employees, 0)}
              </p>
            </div>
          </div>
        </div>
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
              <ExclamationCircleIcon className="h-5 w-5" />
            )}
            {message.text}
          </div>
          <button onClick={() => setMessage({ text: "", type: "" })}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 mb-8 border border-indigo-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-indigo-600">{filteredDepartments.length}</span> departments
        </p>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((dept) => (
          <div
            key={dept.id}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-indigo-100 overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          >
            {/* Header with gradient */}
            <div className={`h-2 bg-gradient-to-r ${dept.color}`}></div>
            
            <div className="p-6">
              {/* Icon and Title */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${dept.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <div className={dept.textColor}>
                      {dept.icon}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{dept.name}</h2>
                    <p className="text-xs text-gray-500">Head: {dept.head}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {dept.desc}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Employees</p>
                  <p className="text-lg font-bold text-gray-800">{dept.employees}</p>
                </div>
                
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-semibold text-indigo-600 truncate" title={dept.location}>
                    {dept.location}
                  </p>
                </div>
              </div>

              {/* View Button */}
              <button
                onClick={() => {
                  setSelectedDept(dept);
                  setIsViewModalOpen(true);
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                View Details
                <ArrowTopRightOnSquareIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BuildingOfficeIcon className="h-10 w-10 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No departments found</h3>
          <p className="text-gray-500">Try adjusting your search</p>
        </div>
      )}

      {/* View Department Modal */}
      {isViewModalOpen && selectedDept && (
        <ViewDepartmentModal
          dept={selectedDept}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedDept(null);
          }}
        />
      )}
    </div>
  );
}

// View Department Modal Component
function ViewDepartmentModal({ dept, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
          {/* Modal Header */}
          <div className={`h-2 bg-gradient-to-r ${dept.color} rounded-t-2xl -mt-6 -mx-6 mb-4`}></div>
          
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${dept.bgColor} rounded-xl flex items-center justify-center`}>
                <div className={`${dept.textColor} w-8 h-8`}>
                  {dept.icon}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{dept.name}</h2>
                <p className="text-gray-500">Department Overview</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="space-y-6">
            <p className="text-gray-600">{dept.desc}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 rounded-xl">
                <p className="text-sm text-indigo-600 mb-1">Department Head</p>
                <p className="text-lg font-semibold text-gray-800">{dept.head}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-600 mb-1">Total Employees</p>
                <p className="text-lg font-semibold text-gray-800">{dept.employees}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="text-sm text-emerald-600 mb-1">Active Projects</p>
                <p className="text-lg font-semibold text-gray-800">{dept.projects}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-sm text-amber-600 mb-1">Location</p>
                <p className="text-lg font-semibold text-gray-800">{dept.location}</p>
              </div>
            </div>

            {/* Employee List */}
            {dept.employeesList && dept.employeesList.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Employees</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-wrap gap-2">
                    {dept.employeesList.map((emp, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200">
                        {emp.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => window.location.href = '/admin/employees'}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                View All Employees
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}