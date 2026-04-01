"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  FileText,
  BarChart3,
  Menu,
  LogOut,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }) {
    const [isOpen, setIsOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [pendingLeaves, setPendingLeaves] = useState(0);
    const [admin, setAdmin] = useState({
        name: "",
        email: "",
        initials: "",
        role: "Administrator"
    });
    const router = useRouter();
    const pathname = usePathname();

    // Load admin data from localStorage
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setAdmin({
                name: parsed.name || "Admin User",
                email: parsed.email || "admin@teamtime.com",
                initials: (parsed.name || "Admin User").split(' ').map(n => n[0]).join('').toUpperCase(),
                role: "Administrator"
            });
        } else {
            router.push('/login');
        }
    }, []);

    // Fetch pending leaves count for notification
    useEffect(() => {
        const fetchPendingLeaves = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await fetch('http://localhost:5000/api/leaves', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const leaves = await response.json();
                    const pending = leaves.filter(l => l.status === 'pending').length;
                    setPendingLeaves(pending);
                }
            } catch (error) {
                console.error("Error fetching pending leaves:", error);
            }
        };

        fetchPendingLeaves();
        // Refresh every 2 minutes
        const interval = setInterval(fetchPendingLeaves, 120000);
        return () => clearInterval(interval);
    }, []);

    // Check for mobile view
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setIsOpen(false);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const menuItems = [
        { 
            name: "Dashboard", 
            icon: <LayoutDashboard size={22} />, 
            path: "/admin/dashboard",
            description: "Overview & stats"
        },
        { 
            name: "Employees", 
            icon: <Users size={22} />, 
            path: "/admin/employees",
            description: "Manage team members"
        },
        { 
            name: "Departments", 
            icon: <Building2 size={22} />, 
            path: "/admin/departments",
            description: "Organization structure"
        },
        { 
            name: "Attendance", 
            icon: <Clock size={22} />, 
            path: "/admin/attendance",
            description: "Track attendance"
        },
        { 
            name: "Leave Requests", 
            icon: <FileText size={22} />, 
            path: "/admin/leaverequests",
            description: "Manage time off",
            badge: pendingLeaves
        },
        { 
            name: "Reports", 
            icon: <BarChart3 size={22} />, 
            path: "/admin/reports",
            description: "Analytics & reports"
        },
    ];

    const handleLogout = () => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userSettings');
        // Redirect to home
        router.push("/");
    };

    // Get current page info
    const currentPage = menuItems.find(item => item.path === pathname) || { 
        name: "Dashboard", 
        description: "Welcome back, Admin" 
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Sidebar */}
            <div
                className={`relative h-screen flex flex-col bg-white/90 backdrop-blur-xl border-r border-indigo-100 shadow-2xl transition-all duration-300 ${
                    isOpen ? "w-72" : "w-24"
                } ${isMobile && !isOpen ? 'absolute z-50' : ''}`}
            >
                {/* Logo & Toggle Section */}
                <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} p-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50`}>
                    {isOpen ? (
                        <Link href="/admin/dashboard" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <span className="text-white font-bold text-lg">TT</span>
                            </div>
                            <div>
                                <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    TeamTime
                                </span>
                                <span className="block text-xs text-gray-500">Admin Panel</span>
                            </div>
                        </Link>
                    ) : (
                        <Link href="/admin/dashboard" className="group">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <span className="text-white font-bold text-lg">TT</span>
                            </div>
                        </Link>
                    )}

                    {/* Toggle Button */}
                    {!isMobile && (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-8 h-8 bg-white hover:bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 transition-all hover:scale-110 shadow-sm"
                        >
                            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                        </button>
                    )}
                </div>

                {/* Admin Profile Summary - Real Data */}
                {isOpen && admin.name && (
                    <div className="mx-3 mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                                    {admin.initials || 'A'}
                                </div>
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{admin.name}</p>
                                <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                                <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                    {admin.role}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-6 px-3">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.path}
                                        className={`flex items-center ${isOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl transition-all duration-200 group relative no-underline ${
                                            isActive 
                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200/50' 
                                                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                                        }`}
                                    >
                                        <span className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-indigo-600'} transition-colors`}>
                                            {item.icon}
                                        </span>
                                        
                                        {isOpen && (
                                            <div className="flex-1 flex items-center justify-between">
                                                <div>
                                                    <span className="font-medium text-[0.95rem] block">{item.name}</span>
                                                    <span className="text-xs opacity-80 block leading-tight">
                                                        {item.description}
                                                    </span>
                                                </div>
                                                {item.badge > 0 && (
                                                    <span className="px-2 py-1 bg-rose-500 text-white text-xs rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Active Indicator */}
                                        {isActive && !isOpen && (
                                            <span className="absolute left-0 w-1 h-8 bg-white rounded-r-full"></span>
                                        )}
                                        
                                        {/* Tooltip for collapsed state */}
                                        {!isOpen && (
                                            <span className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                                                {item.name}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Sidebar Footer - Settings */}
                {isOpen && (
                    <div className="border-t border-indigo-100 p-4">
                        <button
                            onClick={() => router.push('/admin/settings')}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                            <Settings size={18} className="text-gray-400" />
                            <span className="text-sm">Settings</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto">
                {/* Top Header Bar */}
                <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 px-6 py-3 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        {/* Mobile Menu Toggle */}
                        {isMobile && (
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="mr-4 p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                            >
                                <Menu size={20} className="text-gray-600" />
                            </button>
                        )}

                        {/* Page Title */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                                    {currentPage.name}
                                </h1>
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                    Admin
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {currentPage.description}
                            </p>
                        </div>
                        
                        {/* Right side actions */}
                        <div className="flex items-center gap-3">
                            {/* Notification Bell with Real Count */}
                            <button className="relative p-2 hover:bg-indigo-100 rounded-lg transition-colors group">
                                <Bell size={20} className="text-gray-600 group-hover:text-indigo-600" />
                                {pendingLeaves > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {pendingLeaves}
                                    </span>
                                )}
                            </button>
                            
                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold hover:shadow-lg hover:scale-105 transition-all border-2 border-white shadow-md"
                                >
                                    {admin.initials || 'A'}
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <>
                                        {/* Backdrop */}
                                        <div 
                                            className="fixed inset-0 z-30"
                                            onClick={() => setIsProfileOpen(false)}
                                        />
                                        
                                        {/* Dropdown */}
                                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden z-40">
                                            {/* Header */}
                                            <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-white">
                                                        {admin.initials || 'A'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-lg">{admin.name || 'Admin User'}</p>
                                                        <p className="text-sm text-indigo-100 break-all">{admin.email || 'admin@teamtime.com'}</p>
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                                                            {admin.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Menu Items */}
                                            <div className="p-2">
                                                <button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        router.push('/admin/profile');
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 rounded-xl transition-colors"
                                                >
                                                    <UserCircle size={18} className="text-indigo-600" />
                                                    <span className="font-medium">My Profile</span>
                                                </button>
                                                
                                                <button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        router.push('/admin/settings');
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 rounded-xl transition-colors"
                                                >
                                                    <Settings size={18} className="text-indigo-600" />
                                                    <span className="font-medium">Settings</span>
                                                </button>
                                                
                                                <div className="border-t border-gray-100 my-2"></div>
                                                
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors group"
                                                >
                                                    <LogOut size={18} className="group-hover:text-rose-600" />
                                                    <span className="font-medium">Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}