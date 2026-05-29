import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Bell, Search, User } from 'lucide-react';

interface NavbarProps {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleDarkMode, isDarkMode }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center space-x-4">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Admin Portal</h2>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Academic Year 2026/27</span>
      </div>

      <div className="flex items-center space-x-6">
        <button
          onClick={toggleDarkMode}
          className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative group cursor-pointer">
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
          <Bell className="w-6 h-6 text-slate-400" />
        </div>

        <div className="flex items-center space-x-3 border-l dark:border-slate-700 pl-6">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
            {user?.email?.charAt(0) || 'AD'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">Administrator</span>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
