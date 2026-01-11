// FILE: src/auth/AuthScreen.jsx
import React, { useState } from 'react';
import { Heart, Mail, Lock, User, Eye, EyeOff, ArrowRight, Building2, UserCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from './AuthContext';

const AuthScreen = ({ onOrganizationSignup }) => {
  const { login, signup } = useAuth();
  
  // Step: 'choose' | 'personal' | 'organization'
  const [step, setStep] = useState('choose');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || 'Login failed');
        }
      } else {
        if (!username.trim()) {
          setError('Please enter a username');
          setLoading(false);
          return;
        }
        const result = await signup(email, password, username);
        if (!result.success) {
          setError(result.error || 'Signup failed');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    }

    setLoading(false);
  };

  // STEP 1: Choose Personal or Organization
  if (step === 'choose') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-5xl">🧸</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              YRNAlone
            </h1>
            <p className="text-gray-600 mt-2">You aRe Not alone 💜</p>
          </div>

          {/* Choice Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome!</h2>
            <p className="text-center text-gray-600 mb-8">How would you like to join us?</p>

            <div className="space-y-4">
              {/* Personal Option */}
              <button
                onClick={() => setStep('personal')}
                className="w-full p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl hover:border-purple-400 hover:shadow-lg transition group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <UserCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">👤 Personal</h3>
                    <p className="text-gray-600 text-sm mt-1">Join as an individual seeking support and connection</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-purple-400 group-hover:translate-x-1 transition" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Daily check-ins</span>
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">Support groups</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Journal</span>
                </div>
              </button>

              {/* Organization Option */}
              <button
                onClick={() => {
                  if (onOrganizationSignup) {
                    onOrganizationSignup();
                  } else {
                    setStep('organization');
                  }
                }}
                className="w-full p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl hover:border-blue-400 hover:shadow-lg transition group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">🏢 Organization</h3>
                    <p className="text-gray-600 text-sm mt-1">Register your company, clinic, or school</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-blue-400 group-hover:translate-x-1 transition" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Admin dashboard</span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">Analytics</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Team wellness</span>
                </div>
              </button>
            </div>

            {/* Already have account */}
            <div className="mt-6 text-center">
              <button
                onClick={() => { setStep('personal'); setIsLogin(true); }}
                className="text-purple-600 font-medium hover:underline"
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              Trusted by thousands • HIPAA Compliant • 24/7 Crisis Support
            </p>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Personal signup/login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => setStep('choose')}
          className="flex items-center gap-2 text-purple-600 font-medium mb-4 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to options
        </button>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-5xl">🧸</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            YRNAlone
          </h1>
          <p className="text-gray-600 mt-2">You aRe Not alone 💜</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
          {/* Tab Switcher */}
          <div className="flex mb-6 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                isLogin 
                  ? 'bg-white text-purple-600 shadow' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                !isLogin 
                  ? 'bg-white text-purple-600 shadow' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-400 focus:outline-none transition"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-400 focus:outline-none transition"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-purple-400 focus:outline-none transition"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Welcome Back!' : 'Join Us!'} 
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <button className="w-full mt-4 text-purple-600 text-sm hover:underline">
              Forgot password?
            </button>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            Join a supportive community
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;