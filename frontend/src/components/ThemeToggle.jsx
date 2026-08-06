import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ compact = false }) {
  const { themeMode, effectiveTheme, setThemeMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    {
      id: 'light',
      label: 'Light',
      icon: Sun,
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
    },
    {
      id: 'system',
      label: 'System',
      icon: Monitor,
    },
  ];

  const currentOption = options.find((opt) => opt.id === themeMode) || options[2];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
          bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300
          dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-slate-200 dark:border-slate-700
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        title={`Current Theme: ${currentOption.label} mode`}
      >
        <CurrentIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
        {!compact && (
          <>
            <span className="capitalize text-xs font-semibold">{currentOption.label}</span>
            <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-36 rounded-xl shadow-xl z-50 py-1.5 border transition-all animate-in fade-in zoom-in-95
            bg-white border-slate-200 text-slate-800
            dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200"
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            Appearance
          </div>

          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = themeMode === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => {
                  setThemeMode(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-300 font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}