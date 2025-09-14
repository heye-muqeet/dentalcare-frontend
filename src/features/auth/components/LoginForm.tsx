import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../lib/hooks';
import { login, clearError } from '../../../lib/store/slices/authSlice';
import type { RootState } from '../../../lib/store/store';
import { ROLE_DISPLAY_NAMES } from '../../../lib/constants/roles';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('organization_admin');
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);

  // Navigate to dashboard after successful login
  useEffect(() => {
    console.log('LoginForm useEffect triggered:', { isAuthenticated, user: !!user });
    if (isAuthenticated && user) {
      console.log('Navigating to dashboard after successful login');
      // Use setTimeout to avoid potential race conditions
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    console.log('Dispatching login action...');
    const result = await dispatch(login({ email, password, role }));
    console.log('Login action result:', result);
    
    // Navigate immediately if login was successful
    if (result.type === 'auth/login/fulfilled') {
      console.log('Login successful, navigating to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  };

  const roleOptions = [
    { value: 'super_admin', label: ROLE_DISPLAY_NAMES.super_admin },
    { value: 'organization_admin', label: ROLE_DISPLAY_NAMES.organization_admin },
    { value: 'branch_admin', label: ROLE_DISPLAY_NAMES.branch_admin },
    { value: 'doctor', label: ROLE_DISPLAY_NAMES.doctor },
    { value: 'receptionist', label: ROLE_DISPLAY_NAMES.receptionist },
    { value: 'patient', label: ROLE_DISPLAY_NAMES.patient },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Left side - Branding */}
            <div className="lg:w-1/2 bg-gradient-to-br from-[#0A0F56] via-[#1a237e] to-[#3f51b5] relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-center p-12 text-white">
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h1 className="text-3xl font-bold">MI Dental</h1>
                  </div>
                  <h2 className="text-2xl font-semibold mb-4">Welcome to the Future of Dental Care</h2>
                  <p className="text-blue-100 text-lg leading-relaxed">
                    Streamline your practice with our comprehensive dental management system. 
                    Manage patients, appointments, and treatments with ease.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-start space-x-4">
                    <img 
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face" 
                      alt="Dr. Sarah Johnson" 
                      className="w-12 h-12 rounded-full border-2 border-white/30"
                    />
                    <div>
                      <p className="text-white text-sm leading-relaxed mb-3">
                        "This platform has revolutionized how we manage our dental practice. 
                        The interface is intuitive and the features are exactly what we needed."
                      </p>
                      <div>
                        <p className="text-white font-semibold text-sm">Dr. Sarah Johnson</p>
                        <p className="text-blue-200 text-xs">Chief Dental Officer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Login Form */}
            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                  <p className="text-gray-600">Enter your credentials to access your account</p>
                </div>
                
                {/* Error Message */}
                {error && (
                  <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-800 mb-1">Login Failed</h3>
                        <p className="text-red-700 text-sm leading-relaxed">{error}</p>
                      </div>
                      <button
                        onClick={() => dispatch(clearError())}
                        className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Role Selection */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A0F56] focus:border-transparent transition-all duration-200 text-gray-900"
                      required
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A0F56] focus:border-transparent transition-all duration-200 text-gray-900"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A0F56] focus:border-transparent transition-all duration-200 text-gray-900"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  
                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-[#0A0F56] focus:ring-[#0A0F56] border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <a href="#" className="text-sm font-medium text-[#0A0F56] hover:text-blue-700 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#0A0F56] to-[#3f51b5] text-white py-3 px-4 rounded-xl font-semibold hover:from-[#1a237e] hover:to-[#5c6bc0] focus:outline-none focus:ring-2 focus:ring-[#0A0F56] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                  
                  {/* Sign Up Link */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <a href="#" className="font-semibold text-[#0A0F56] hover:text-blue-700 transition-colors">
                        Contact administrator
                      </a>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 MI Dental Clinic. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
