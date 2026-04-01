"use client";
import { useState } from "react";
import { UserIcon, EnvelopeIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";


function SignupScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
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
    e.preventDefault();
    const { name, email, password } = formData;
    
    if (!name || !email || !password) {
        setMessage({ text: "Please fill all fields", type: "error" });
        return;
    }
  
    if (password.length < 6) {
        setMessage({ text: "Password must be at least 6 characters", type: "error" });
        return;
    }
  
    setIsLoading(true);

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role: "employee" })
        });

        const data = await response.json();

        if (response.ok) {
            setMessage({ text: "✅ Account created! Redirecting...", type: "success" });
            
            // MOCK role check based on email (same as before)
            let role = "";
            if (email === "admin@ex.com") {
                role = "admin";
            } else {
                role = "employee";
            }
            
            setTimeout(() => {
                if (role === "admin") {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/employee/dashboard");
                }
            }, 1500);
        } else {
            setMessage({ text: data.message, type: "error" });
        }
    } catch (error) {
        setMessage({ text: "Server error. Please try again.", type: "error" });
    } finally {
        setIsLoading(false);
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
                Join TeamTime Today!
              </h1>
              
              <p className="text-indigo-100 text-lg mb-8">
                Start managing your team attendance efficiently with our modern solution.
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

          {/* Right Side - Signup Form */}
          <div className="p-8 md:p-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-600 mb-8">Get started with your free account today</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div key="name-field">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="off"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/60"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div key="email-field">
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
                      autoComplete="off"
                      value={formData.email}
                      onChange={handleChange
                        
                      }
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/60"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div key="password-field">
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
                      autoComplete="off"
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
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 mr-2"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{" "}
                    <a href="#" className="text-indigo-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-indigo-600 hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
                {/* Submit Button */}
<button
  type="submit"
  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
>
  Create Account
  <ArrowRightIcon className="h-5 w-5" />
</button>

{/* Divider */}
<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-300"></div>
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="px-4 bg-white text-gray-500">Or continue with</span>
  </div>
</div>

{/* Google Sign Up Button */}
<button
  type="button"
  onClick={() => {
    setMessage({ text: "🔧 Google sign-up coming soon with backend integration!", type: "info" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  }}
  className="w-full px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3"
>
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
  Continue with Google
</button>

{/* Message Display - UPDATED with info type */}
{message.text && (
  <div className={`p-3 rounded-xl text-center font-medium ${
    message.type === 'success' 
      ? 'bg-green-100 text-green-700 border border-green-200' 
      : message.type === 'error'
      ? 'bg-rose-100 text-rose-700 border border-rose-200'
      : 'bg-blue-100 text-blue-700 border border-blue-200' // 👈 ADDED for info messages
  }`}>
    {message.text}
  </div>
)}

{/* Login Link */}
<p className="text-center text-gray-600">
  Already have an account?{" "}
  <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline">
    Sign In
  </Link>
</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupScreen;