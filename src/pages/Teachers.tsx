import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Teacher } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  X, 
  Trash2, 
  UserPlus,
  Loader2,
  MoreVertical,
  Filter,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female'>('Male');
  const [age, setAge] = useState<number>(25);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'teachers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teacherData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
      setTeachers(teacherData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const generateTeacherId = () => {
    return 'CH-T-' + Math.floor(1000 + Math.random() * 9000);
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'teachers'), {
        name,
        teacherId: generateTeacherId(),
        sex,
        age,
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setName('');
      setSex('Male');
      setAge(25);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'teachers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this teacher?')) {
      try {
        await deleteDoc(doc(db, 'teachers', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `teachers/${id}`);
      }
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.teacherId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Authorized Faculty</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Institutional Record Batch: {teachers.length} Active Profiles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
        >
          <Plus size={14} />
          Initialize Registration
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
          <input
            type="text"
            placeholder="Search Record Identifier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-lg outline-none text-xs font-bold dark:text-white transition-all uppercase tracking-wide placeholder:text-slate-300"
          />
        </div>
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-slate-100 dark:border-slate-700 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-[9px] font-black uppercase tracking-widest">
          <Filter size={12} />
          <span>Filter Sequence</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-indigo-600" size={24} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredTeachers.map((teacher) => (
              <motion.div
                key={teacher.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-600 transition-all group relative"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-tighter tabular-nums">{teacher.teacherId}</span>
                </div>
                
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{teacher.name}</h3>
                
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 rounded text-[8px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800">{teacher.sex}</span>
                  <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 rounded text-[8px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800">Age: {teacher.age}</span>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                   <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Entry: {new Date(teacher.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                   <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteTeacher(teacher.id); }}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                   >
                     <Trash2 size={12} />
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/20 backdrop-blur-[2px]">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">DATA ENTRY</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Faculty Record Initialization</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="IDENTIFIER_NAME_STRING"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white transition-all text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Sex</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as 'Male' | 'Female')}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg outline-none text-xs font-bold dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="Male">MALE_CORE</option>
                    <option value="Female">FEMALE_CORE</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Age Unit</label>
                  <input
                    type="number"
                    required
                    min={18}
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg outline-none text-xs font-bold dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                  Commit Registry
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-2.5 text-slate-300 hover:text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Abstain
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
