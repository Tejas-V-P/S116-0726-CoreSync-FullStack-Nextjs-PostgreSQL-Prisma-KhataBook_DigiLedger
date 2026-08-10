import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { API_BASE } from '../../config/api';
import {
  User,
  Mail,
  Lock,
  Copy,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  Building2,
  Key,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility Toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI State
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setName(parsedUser.name || '');
      setEmail(parsedUser.email || '');
    } catch (e) {
      navigate('/login');
    }
  }, [navigate]);

  const showNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopyId = (idText) => {
    if (!idText) return;
    navigator.clipboard.writeText(idText);
    setCopied(true);
    showNotification('success', 'Account ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!name.trim()) {
      setErrors({ name: 'Shopkeeper / Business name cannot be empty' });
      return;
    }
    if (!email.trim()) {
      setErrors({ email: 'Email address cannot be empty' });
      return;
    }

    setSavingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update local storage and state
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }

      showNotification('success', 'Profile information updated successfully!');
    } catch (err) {
      showNotification('error', err.message || 'Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!currentPassword) {
      setErrors({ currentPassword: 'Current password is required' });
      return;
    }
    if (!newPassword) {
      setErrors({ newPassword: 'New password is required' });
      return;
    }
    if (newPassword.length < 6) {
      setErrors({ newPassword: 'New password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'New passwords do not match' });
      return;
    }

    setSavingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      showNotification('success', 'Password changed successfully!');
    } catch (err) {
      showNotification('error', err.message || 'Error changing password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  const accountId = user.shopkeeperId || user.id || 'N/A';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar user={user} />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
                : 'bg-rose-950/90 text-rose-200 border-rose-500/40'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
              <User className="w-8 h-8 text-indigo-400" />
              <span>Account & Profile Settings</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your business profile details, unique transaction ID, and security credentials.
            </p>
          </div>
        </div>

        {/* Account Overview Header Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-indigo-500/25">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name || 'Shopkeeper Account'}</h2>
                <p className="text-slate-400 text-sm flex items-center space-x-1.5 mt-0.5">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>{user.email}</span>
                </p>
                <div className="inline-flex items-center space-x-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Shopkeeper Ledger Account</span>
                </div>
              </div>
            </div>

            {/* Account / Shopkeeper / Transaction ID Card */}
            <div className="w-full md:w-auto bg-slate-900/90 border border-slate-700 rounded-xl p-4 flex flex-col space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Shopkeeper / Transaction Account ID</span>
              </span>

              <div className="flex items-center space-x-3 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 font-mono text-xs text-indigo-300">
                <span className="truncate max-w-[240px] sm:max-w-[300px] select-all">{accountId}</span>
                <button
                  onClick={() => handleCopyId(accountId)}
                  className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-all flex items-center space-x-1"
                  title="Copy Account ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">Unique identifier for audit logs & ledger synchronization.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form 1: Edit Business Details */}
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 border-b border-slate-700/60 pb-4 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Business Information</h3>
                  <p className="text-xs text-slate-400">Update your public shopkeeper name and registered email</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                {/* Shopkeeper Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Shopkeeper / Business Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter business or owner name"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border ${
                        errors.name ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'
                      } text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                    />
                  </div>
                  {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@business.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border ${
                        errors.email ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'
                      } text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
                    />
                  </div>
                  {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-60 transition-all cursor-pointer"
                  >
                    {savingProfile ? (
                      <span>Saving Changes...</span>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Business Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Form 2: Security & Password Change */}
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 border-b border-slate-700/60 pb-4 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Security & Password</h3>
                  <p className="text-xs text-slate-400">Update your account security and access credentials</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border ${
                        errors.currentPassword ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                      } text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-rose-400 text-xs mt-1">{errors.currentPassword}</p>}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border ${
                        errors.newPassword ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                      } text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-rose-400 text-xs mt-1">{errors.newPassword}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border ${
                        errors.confirmPassword ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'
                      } text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-rose-400 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60 transition-all cursor-pointer"
                  >
                    {savingPassword ? (
                      <span>Updating Password...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
