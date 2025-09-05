import React, { useState } from 'react';
import { Eye, EyeOff, User, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        setError('Name is required');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const endpoint = isLogin ? 'login' : 'register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      console.log(`Making ${endpoint} request to:`, `${API_BASE_URL}/auth/${endpoint}`);
      console.log('Payload:', payload);

      const response = await axios.post(`${API_BASE_URL}/auth/${endpoint}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Full response:', response);
      const data = response.data;
      console.log('Response data:', data);

      // Store the token and user in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('Token stored:', data.token);
      } else {
        console.warn('No token in response');
      }
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('User stored:', data.user);
      } else {
        console.warn('No user in response');
      }

      // Verify storage
      console.log('Verification - Token from storage:', localStorage.getItem('token'));
      console.log('Verification - User from storage:', localStorage.getItem('user'));
      
      setSuccess(data.message || `${isLogin ? 'Login' : 'Registration'} successful!`);
      
      // Redirect after success
      setTimeout(() => {
        if (isLogin) {
          // Add email as query parameter for login redirect
          const email = encodeURIComponent(formData.email);
          window.location.href = `/dashboard`;
        } else {
          window.location.href = '/create';
        }
      }, 1500);
    } catch (err) {
      console.error('Auth error:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(`${isLogin ? 'Login' : 'Registration'} failed. Please try again.`);
        }
      } else if (err.request) {
        console.error('Network error:', err.request);
        setError('Network error. Please check your connection and try again.');
      } else {
        console.error('Unknown error:', err.message);
        setError(`${isLogin ? 'Login' : 'Registration'} failed. Please try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
  };

  // Debug function to check localStorage
  const checkStorage = () => {
    console.log('=== localStorage Debug ===');
    console.log('Token:', localStorage.getItem('token'));
    console.log('User:', localStorage.getItem('user'));
    const user = localStorage.getItem('user');
    if (user) {
      console.log('Parsed User:', JSON.parse(user));
    }
    console.log('========================');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create your new account'}
          </p>
        </div>

        {/* Debug Button (Remove in production) */}
        

        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
              isLogin 
                ? 'bg-white shadow-sm text-blue-600 border border-gray-200' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
              !isLogin 
                ? 'bg-white shadow-sm text-blue-600 border border-gray-200' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {!isLogin && (
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={isLoading}
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 transition-all duration-200"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {!isLogin && (
            <div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={isLoading}
                required
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
              disabled={isLoading}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}