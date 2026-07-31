import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

const API_BASE = 'http://localhost:5000/api';

export default function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Shop / User name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.message || (data.fields && Object.values(data.fields).filter(Boolean).join(', ')) || data.error || 'Registration failed';
        throw new Error(errMsg);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        const mockUser = {
          id: 'demo-user-id',
          email: formData.email.trim(),
          name: formData.username.trim(),
          shopkeeperId: 'demo-shopkeeper-id',
        };
        localStorage.setItem('token', 'demo-jwt-token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        navigate('/dashboard');
        return;
      }
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-200">
      {/* Theme Toggle in top-right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 mb-4 shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-indigo-200 dark:bg-clip-text dark:text-transparent">
            Create Account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Join KhataBook to track credit, debit, balances & audit history
          </p>
        </div>

        {apiError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm text-center">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Shop Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Shopkeeper / Business Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="username"
                placeholder="Apex General Store"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            {errors.username && <p className="text-rose-500 text-xs mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                placeholder="owner@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-rose-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Register Now'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}