import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../lib/hooks';
import { login, clearError } from '../../../lib/store/slices/authSlice';
import type { RootState } from '../../../lib/store/store';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4">
      <div className="absolute top-6 left-6">
        <div 
          className="text-3xl font-bold text-[#0A0F56] cursor-pointer" 
          onClick={() => navigate('/login')}
        >
      
        </div>
      </div>
      
      <div className="flex w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl">
        {/* Left side - Image */}
        <div className="hidden md:block md:w-1/2 bg-[#0A0F56] relative p-12">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1000&auto=format&fit=crop" 
              alt="Dental clinic" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="text-white">
              <h2 className="text-4xl font-bold">MI Dental</h2>
              <p className="mt-4 text-blue-200">Sign in to access your dental clinic dashboard and manage patient appointments.</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-white text-sm">"The best dental practice management platform I've ever used."</div>
                <div className="flex items-center mt-3">
                  <img 
                    src="https://randomuser.me/api/portraits/women/44.jpg" 
                    alt="Testimonial" 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <div className="text-white text-xs font-medium">Dr. Jane Roberts</div>
                    <div className="text-blue-200 text-xs">Orthodontist</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#0A0F56] mb-2">Sign In</h2>
            <p className="text-gray-500">Access your MI dental clinic dashboard</p>
          </div>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                {/* <a href="#" className="text-sm font-medium text-[#0A0F56] hover:text-blue-700">
                  Forgot password?
                </a> */}
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            
            {/* <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#0A0F56] focus:ring-[#0A0F56] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div> */}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#0A0F56] hover:bg-[#232a7c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A0F56] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Sign in'
              )}
            </button>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="#" className="font-medium text-[#0A0F56] hover:text-blue-700">
                  Contact administrator
                </a>
              </p>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-xs text-gray-500">© 2023 MI dental Clinic</div>
              <div className="text-xs text-gray-500">•</div>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700">Privacy Policy</a>
              <div className="text-xs text-gray-500">•</div>
              <a href="#" className="text-xs text-gray-500 hover:text-gray-700">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 