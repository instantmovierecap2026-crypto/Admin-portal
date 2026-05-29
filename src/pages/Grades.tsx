import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Grade } from '../types';
import { 
  Plus, 
  Trash2, 
  Loader2,
  GraduationCap,
  ArrowRight,
  MoreVertical,
  Layers,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const Grades = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradeName, setGradeName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'grades'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gradeData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
      setGrades(gradeData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeName.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'grades'), {
        name: gradeName.trim(),
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setGradeName('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'grades');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGrade = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this grade? All related students, subjects and results should be manually cleaned up or handled.')) {
      try {
        await deleteDoc(doc(db, 'grades', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `grades/${id}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Academic Sections</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Managing core academic structures for current session.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
        >
          <Plus size={16} />
          Create New Section
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {grades.map((grade) => (
              <motion.div
                key={grade.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => navigate(`/students?grade=${grade.id}`)}
                className="bg-white dark:bg-gray-800 border-2 border-transparent hover:border-indigo-400 p-6 rounded-xl shadow-sm cursor-pointer transition-all flex flex-col group overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold uppercase">
                    {grade.name?.substring(0, 2) || '??'}
                  </div>
                  <button
                    onClick={(e) => handleDeleteGrade(e, grade.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">{grade.name}</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">Active Section</p>
                
                <div className="mt-8 flex items-center justify-between">
                   <div className="flex -space-x-1.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-gray-800"></div>
                      ))}
                      <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900 flex items-center justify-center text-[8px] font-bold text-indigo-600 dark:text-indigo-400 border-2 border-white dark:border-gray-800">+</div>
                   </div>
                   <ArrowRight size={14} className="text-slate-200 group-hover:text-indigo-500 transition-colors" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!loading && grades.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <GraduationCap className="mx-auto text-slate-200 dark:text-slate-700 mb-4" size={48} />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">No sections defined</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-medium">Define your first school grade or section to begin student management.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-6 px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Create First Section
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-8 overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tighter">New Section</h2>
                <p className="text-xs text-slate-400 font-medium">Add a section identifier (e.g. 9A).</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddGrade} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Section Identifier</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. 9A, 10B"
                  value={gradeName}
                  onChange={(e) => setGradeName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/5 text-sm dark:text-white transition-all uppercase"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold uppercase transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase shadow-md shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                  Add Academic Section
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Grades;
