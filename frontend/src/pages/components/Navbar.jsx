import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, Users, Truck, LogOut, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ user }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className="bg-white/90 border-b border-slate-200 dark:bg-slate-900/90 dark:border-slate-800 sticky top-0 z-50 shadow-sm dark:shadow-lg backdrop-blur-md transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold text-slate-900 dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-indigo-200 dark:bg-clip-text dark:text-transparent">
                                KhataBook
                            </span>
                            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                Digital Ledger
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex items-center space-x-1 sm:space-x-2">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                                }`
                            }
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Dashboard</span>
                        </NavLink>

                        <NavLink
                            to="/customers"
                            className={({ isActive }) =>
                                `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                                }`
                            }
                        >
                            <Users className="w-4 h-4" />
                            <span>Customers</span>
                        </NavLink>

                        <NavLink
                            to="/suppliers"
                            className={({ isActive }) =>
                                `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                                }`
                            }
                        >
                            <Truck className="w-4 h-4" />
                            <span>Suppliers</span>
                        </NavLink>
                    </nav>

                    {/* User Info, Theme Toggle & Actions */}
                    <div className="flex items-center space-x-3">
                        <ThemeToggle />

                        {user && (
                            <div className="hidden md:flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                <User className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.name || user.email}</span>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-all"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
