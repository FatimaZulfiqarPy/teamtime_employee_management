"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRightIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import welcomeImg from "../public/welcome.png";

export default function Welcome() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-indigo-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">TT</span>
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              TeamTime
            </span>
          </div>
          
          <button
            onClick={() => router.push("/login")}
            className="px-5 py-2 text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
          >
            Sign In
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                TeamTime
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Streamline your team's attendance, leave management, and reporting with our modern solution.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-10">
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                ⏱️ Time Tracking
              </span>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                📅 Leave Management
              </span>
              <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                📊 Reports
              </span>
            </div>



            {/* Role Selection Cards */}
            <div className="space-y-4 max-w-md mx-auto lg:mx-0">
            {/* Floating Stats Card - Moved here */}
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-indigo-100 mb-6 animate-slide-up">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
        <span className="text-green-600 font-bold">98%</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">Happy Teams</p>
        <p className="text-xs text-gray-500">Trusted by 500+ companies</p>
      </div>
    </div>
  </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Select your role to continue:</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Employee Card */}
                <button
                  onClick={() => router.push("/signup")}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border-2 border-transparent hover:border-indigo-500 p-6 transition-all duration-300 text-left"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Employee</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Track your attendance, apply for leaves, and view your history
                  </p>
                  <span className="text-indigo-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Continue as Employee
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </button>

                {/* Admin Card */}
                <button
                  onClick={() => router.push("/signup")}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border-2 border-transparent hover:border-purple-500 p-6 transition-all duration-300 text-left"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheckIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Admin</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Manage employees, approve leaves, and generate reports
                  </p>
                  <span className="text-purple-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Continue as Admin
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </button>
              </div>
            </div>

            {/* Existing User Link */}
            <p className="mt-8 text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push("/login")}
                className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
              >
                Sign in here
              </button>
            </p>
          </div>

          {/* Right Column - Image */}
          <div className="relative hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <Image
                src={welcomeImg}
                alt="Welcome to TeamTime"
                width={650}
                height={650}
                className="relative z-10 animate-float"
                priority
              />
            </div>
            
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/50 backdrop-blur-sm border-t border-indigo-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">
            © 2025 TeamTime. All rights reserved. | 
            <a href="#" className="text-indigo-600 hover:underline ml-2">Privacy Policy</a> | 
            <a href="#" className="text-indigo-600 hover:underline ml-2">Terms of Service</a>
          </p>
        </div>
      </footer>

      {/* Add custom CSS animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes slide-up {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}