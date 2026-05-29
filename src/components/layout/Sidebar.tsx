import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileCheck, 
  Code2, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/teachers', icon: Users, label: 'Teachers' },
    { path: '/grades', icon: GraduationCap, label: 'Grades' },
    { path: '/students', icon: BookOpen, label: 'Students' },
    { path: '/results', icon: FileCheck, label: 'Results' },
    { path: '/developer', icon: Code2, label: 'Developer' },
  ];

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 250 }}
      className="h-screen sticky top-0 bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-colors z-30"
    >
      <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between overflow-hidden">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              CHERCHER HIGH
            </span>
            <span className="text-sm font-black leading-none mt-1 text-slate-800 dark:text-white uppercase tracking-tighter">
              Admin Portal
            </span>
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-indigo-600"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all text-xs font-bold uppercase tracking-widest ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <item.icon size={16} />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-slate-50 dark:border-slate-700">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <img src="https://i.postimg.cc/Y0yKdbbg/IMG-20260517-213404-358.jpg" className="w-8 h-8 rounded-lg border border-slate-100 dark:border-indigo-800 object-cover shadow-sm" alt="Founder" />
            <div>
              <p className="text-[8px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest">Dev Core</p>
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Ramoda Technologies</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      )}

      {collapsed && (
        <div className="p-4 border-t border-slate-50 dark:border-slate-700 flex justify-center">
          <button
            onClick={handleLogout}
            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
