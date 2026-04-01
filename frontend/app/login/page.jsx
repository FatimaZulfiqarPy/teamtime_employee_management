"use client";
import { useState } from "react";
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

function LoginScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop form from refreshing page
    const { email, password } = formData; // Get email/password from form
    
    // Check if user filled all fields
    if (!email || !password) {
        setMessage({ text: "Please fill all fields", type: "error" });
        return; // Stop here if fields are empty
    }
  
    setIsLoading(true); // Show loading state on button
    setMessage({ text: "", type: "" }); // Clear any old messages
  
    try {
        // 1️⃣ Send login request to backend
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST', // We are sending data
            headers: { 'Content-Type': 'application/json' }, // Tell backend we're sending JSON
            body: JSON.stringify({ email, password }) // Convert data to JSON string
        });

        // 2️⃣ Get response from backend
        const data = await response.json();

        // 3️⃣ Check if login was successful
        if (response.ok) {
            // ✅ Save token (generated at login time, NOT signup)
            // Token is like an ID card - generated when user logs in
            localStorage.setItem('token', data.token); // 👈 SAVE TOKEN HERE
            
            // Save user info in browser storage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            setMessage({ text: "✅ Login successful! Redirecting...", type: "success" });
            
            // 4️⃣ Redirect based on user role (admin or employee)
            setTimeout(() => {
                if (data.user.role === "admin") {
                    router.push("/admin/dashboard"); // Send admin to admin panel
                } else {
                    router.push("/employee/dashboard"); // Send employee to their dashboard
                }
            }, 1500); // Wait 1.5 seconds so user sees success message
        } else {
            // Show error message from backend (like "Invalid email or password")
            setMessage({ text: data.message, type: "error" });
            
            // Show create account link for invalid credentials
            setTimeout(() => {
                setMessage({ 
                    text: "Don't have an account? Sign up here", 
                    type: "error",
                    showSignupLink: true 
                });
            }, 100);
        }
    } catch (error) {
        // Network error or server down
        setMessage({ text: "Server error. Please try again.", type: "error" });
        console.log("Login error:", error);
    } finally {
        setIsLoading(false); // Hide loading state (button back to normal)
    }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-indigo-100">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Side - Branding & Image */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mt-20 -mr-20"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -mb-16 -ml-16"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-xl">TT</span>
                </div>
                <span className="text-white font-bold text-2xl">TeamTime</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Welcome Back!
              </h1>
              
              <p className="text-indigo-100 text-lg mb-8">
                Log in to continue managing your team attendance efficiently.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                  <span>Track attendance easily</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                  <span>Manage leave requests</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                  <span>Generate reports</span>
                </div>
              </div>
            </div>
            
            <div className="relative z-10 mt-12">
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-white text-sm italic">
                  "TeamTime has transformed how we track our team's attendance. Highly recommended!"
                </p>
                <p className="text-indigo-200 text-sm mt-2 font-semibold">— Sarah Johnson, HR Manager</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-8 md:p-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-600 mb-8">Please enter your details to sign in</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/60"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/60"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 hover:text-indigo-600"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>Loading...</>
                  ) : (
                    <>
                      Sign In
                      <ArrowRightIcon className="h-5 w-5" />
                    </>
                  )}
                </button>

                {/* Signup Link */}
                <p className="text-center text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline">
                    Create Account
                  </Link>
                </p>
              </form>
              {/* Message Display */}
{message.text && (
  <div className={`p-3 rounded-xl text-center font-medium ${
    message.type === 'success' 
      ? 'bg-green-100 text-green-700 border border-green-200' 
      : 'bg-rose-100 text-rose-700 border border-rose-200'
  }`}>
    {message.text}
    {/* Show signup link if it's an error about invalid credentials */}
    {message.type === 'error' && message.text.includes("Don't have an account") && (
      <div className="mt-2">
        <Link href="/signup" className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline">
          Click here to sign up
        </Link>
      </div>
    )}
  </div>
)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;