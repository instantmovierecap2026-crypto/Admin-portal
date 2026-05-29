import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface AdminLayoutProps {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ toggleDarkMode, isDarkMode }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
        <main className="flex-1 overflow-auto p-8 relative">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
        <footer className="h-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-800 px-8 flex items-center justify-between shrink-0 transition-colors">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            &copy; 2026 Chercher Secondary School Result Management System. All rights reserved.
          </p>
          <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 tracking-tight">
            System Developed by <span className="text-indigo-600 dark:text-indigo-400">Ramoda Technologies</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
