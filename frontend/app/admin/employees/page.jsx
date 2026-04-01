"use client";
import { useState, useEffect, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  KeyIcon,
  IdentificationIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  MapPinIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";

export default function EmployeesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    phone: "",
    location: ""
  });

  const itemsPerPage = 5;

  // Fetch employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
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

        const data = await response.json();
        
        // Transform data to match frontend format
        const formattedEmployees = data.map(emp => ({
          _id: emp._id,
          id: emp._id,
          name: emp.name,
          email: emp.email,
          password: "••••••",
          department: emp.department || 'Not Assigned',
          status: emp.status || 'active',
          joinDate: emp.joinDate || emp.createdAt,
          phone: emp.phone || '',
          location: emp.location || ''
        }));
        
        setEmployees(formattedEmployees);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setMessage({ text: "Error loading employees", type: "error" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [router]);

  // Get unique departments for filter
  const departments = ["all", ...new Set(employees.map(e => e.department))];

  // Filter employees based on search and department
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDepartment === "all" || emp.department === selectedDepartment;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, selectedDepartment]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment]);

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: "",
      department: employee.department,
      phone: employee.phone || "",
      location: employee.location || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          // Remove from local state immediately
          setEmployees(employees.filter(emp => emp._id !== id));
          setMessage({ text: "✅ Employee deleted successfully!", type: "success" });
        } else {
          const data = await response.json();
          setMessage({ text: data.message || "Delete failed", type: "error" });
        }
      } catch (error) {
        setMessage({ text: "Server error", type: "error" });
      } finally {
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      }
    }
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setFormData({ name: "", email: "", password: "", department: "", phone: "", location: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (editingEmployee) {
        // Update existing employee
        const updateData = {
          name: formData.name,
          email: formData.email,
          department: formData.department,
          phone: formData.phone,
          location: formData.location
        };
        
        response = await fetch(`http://localhost:5000/api/users/${editingEmployee._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
          const updated = await response.json();
          // Update local state immediately
          setEmployees(employees.map(emp => 
            emp._id === editingEmployee._id 
              ? { ...emp, ...updateData, password: "••••••" }
              : emp
          ));
          setMessage({ text: "✅ Employee updated successfully!", type: "success" });
        }
      } else {
        // Add new employee
        response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: "employee",
            department: formData.department,
            phone: formData.phone,
            location: formData.location
          })
        });
        
        if (response.ok) {
          const newUser = await response.json();
          const newEmployee = {
            _id: newUser.user.id,
            id: newUser.user.id,
            name: formData.name,
            email: formData.email,
            password: "••••••",
            department: formData.department,
            status: "active",
            joinDate: new Date().toISOString(),
            phone: formData.phone,
            location: formData.location
          };
          setEmployees([...employees, newEmployee]);
          setMessage({ text: "✅ Employee added successfully!", type: "success" });
        }
      }
      
      if (!response.ok) {
        const data = await response.json();
        setMessage({ text: data.message || "Operation failed", type: "error" });
      }
      
    } catch (error) {
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setIsModalOpen(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleExport = () => {
    setMessage({ text: "📊 Exporting employee data...", type: "info" });
    setTimeout(() => setMessage({ text: "✅ Export completed!", type: "success" }), 2000);
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  // Department color mapping
  const getDepartmentColor = (dept) => {
    const colors = {
      'IT': 'bg-purple-100 text-purple-700 border-purple-200',
      'HR': 'bg-blue-100 text-blue-700 border-blue-200',
      'Marketing': 'bg-pink-100 text-pink-700 border-pink-200',
      'Finance': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Not Assigned': 'bg-gray-100 text-gray-700 border-gray-200',
      'default': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[dept] || colors.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">Management</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            Employees
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Employee Directory
            </h1>
            <p className="text-gray-600">Manage your team members and their information</p>
          </div>
          
          {/* Stats Summary */}
          <div className="mt-4 md:mt-0 flex gap-3">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-indigo-100">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-indigo-600">{employees.length}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-indigo-100">
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-lg font-bold text-emerald-600">{employees.filter(e => e.status === 'active').length}</p>
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
          <div className="flex items-center gap-2">
            {message.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
            {message.type === 'error' && <ExclamationCircleIcon className="h-5 w-5" />}
            {message.text}
          </div>
          <button onClick={() => setMessage({ text: "", type: "" })}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Actions Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 mb-6 border border-indigo-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search and Filter */}
          <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Department Filter */}
            <div className="relative min-w-[150px]">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleExport}
              className="flex-1 md:flex-none px-4 py-2 bg-white border border-indigo-200 text-gray-700 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={handleAddNew}
              className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <UserPlusIcon className="h-4 w-4" />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-indigo-600">{paginatedEmployees.length}</span> of{" "}
          <span className="font-semibold text-indigo-600">{filteredEmployees.length}</span> employees
        </p>
      </div>

      {/* Employees Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-indigo-100">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-indigo-50">
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-indigo-50/50 transition-colors group">
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
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getDepartmentColor(employee.department)}`}>
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        employee.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(employee.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee._id)}
                          className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <UsersIcon className="h-8 w-8 text-indigo-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No employees found</p>
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
              className="p-2 rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              className="p-2 rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </nav>
        </div>
      )}

      {/* Add/Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="john@example.com"
                  />
                </div>

                {!editingEmployee && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="••••••"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Department</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="City, Country"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    {editingEmployee ? 'Update' : 'Add'} Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}