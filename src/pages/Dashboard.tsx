import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Award,
  TrendingUp,
  UserCheck,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface Stats {
  teachers: number;
  grades: number;
  students: number;
  subjects: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ teachers: 0, grades: 0, students: 0, subjects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubTeachers = onSnapshot(collection(db, 'teachers'), (s) => setStats(prev => ({ ...prev, teachers: s.size })));
    const unsubGrades = onSnapshot(collection(db, 'grades'), (s) => setStats(prev => ({ ...prev, grades: s.size })));
    const unsubStudents = onSnapshot(collection(db, 'students'), (s) => setStats(prev => ({ ...prev, students: s.size })));
    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (s) => setStats(prev => ({ ...prev, subjects: s.size })));

    setLoading(false);
    return () => {
      unsubTeachers();
      unsubGrades();
      unsubStudents();
      unsubSubjects();
    };
  }, []);

  const statCards = [
    { label: 'Total Teachers', value: stats.teachers, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', path: '/teachers' },
    { label: 'Total Grades', value: stats.grades, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', path: '/grades' },
    { label: 'Enrolled Students', value: stats.students, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', path: '/students' },
    { label: 'Total Subjects', value: stats.subjects, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', path: '/grades' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Command Dashboard</h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Institutional Oversight & Real-time Analytics</p>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
           initial={{ opacity: 0, y: 5 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm group hover:border-indigo-600 transition-colors"
        >
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ">Core Faculty</p>
          <div className="flex items-end justify-between leading-none">
            <p className="text-3xl font-black text-slate-950 dark:text-white">{stats.teachers}</p>
            <div className="h-2 w-8 bg-indigo-50 dark:bg-indigo-900/40 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-600 w-[60%]"></div>
            </div>
          </div>
          <p className="mt-3 text-[8px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest">Active Academic Staff</p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 5 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm group hover:border-indigo-600 transition-colors"
        >
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Enrolled Population</p>
          <div className="flex items-end justify-between leading-none">
            <p className="text-3xl font-black text-slate-950 dark:text-white">{stats.students?.toLocaleString()}</p>
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">[{stats.grades} SECTS]</p>
          </div>
          <p className="mt-3 text-[8px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest">Global Student Registry</p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 5 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm group hover:border-indigo-600 transition-colors"
        >
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Knowledge Units</p>
          <div className="flex items-end justify-between leading-none">
            <p className="text-3xl font-black text-slate-950 dark:text-white">{stats.subjects}</p>
            <div className="flex -space-x-1">
               <div className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-gray-800"></div>
               <div className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900 border-2 border-white dark:border-gray-800"></div>
            </div>
          </div>
          <p className="mt-3 text-[8px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest">Active Curriculum Blocks</p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 5 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm group hover:border-indigo-600 transition-colors"
        >
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Evaluation Status</p>
          <div className="flex items-end justify-between leading-none">
            <p className="text-3xl font-black text-indigo-600">0%</p>
            <TrendingUp size={16} className="text-slate-200 dark:text-slate-700" />
          </div>
          <div className="mt-3 h-1 w-full bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 w-[0%]"></div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">System Event Logs</h3>
            <Link to="/results" className="text-[8px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Full History</Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-50 dark:divide-slate-700">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all group">
                   <div className="flex items-center gap-5">
                      <div className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tabular-nums">
                        {String(i).padStart(2, '0')}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">ACADEMIC_BLOCK_SYNC_COMPLETE: Grade 1{['2A', '2B', '0C', '1B'][i-1]}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Status: OK • Time: -{i * 2}HR_REL</p>
                      </div>
                   </div>
                   <ArrowRight size={12} className="text-slate-200 dark:text-slate-700 group-hover:text-indigo-600 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-950 rounded-2xl p-6 text-white overflow-hidden relative border border-slate-800 shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Award size={80} />
            </div>
            <p className="text-indigo-400 text-[8px] font-black uppercase tracking-[0.2em] mb-3">Institutional Status</p>
            <h4 className="text-lg font-black leading-tight uppercase tracking-tighter mb-4">Readiness for Global Publication</h4>
            <div className="space-y-3 mb-8">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semester 01: IN_PROGRESS</p>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance Check: PENDING</p>
               </div>
            </div>
            <Link to="/results" className="block w-full py-3 bg-white text-slate-950 rounded-lg text-center text-[10px] font-black hover:bg-slate-100 transition-all uppercase tracking-widest">
              Audit Data Block
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Sub-System Routing</h4>
            <div className="space-y-2">
              {[
                { label: 'Register Faculty', path: '/teachers' },
                { label: 'Generate Document Batch', path: '/results' },
                { label: 'Database Console', path: '/developer' }
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 hover:border-indigo-600/50 border border-transparent rounded-lg transition-all group"
                >
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{link.label}</span>
                  <ArrowRight size={12} className="text-slate-300 dark:text-slate-700 group-hover:text-indigo-600 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
