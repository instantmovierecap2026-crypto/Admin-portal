import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  where,
  writeBatch,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Student, Grade, Subject, Teacher } from '../types';
import { 
  BookOpen, 
  Search, 
  Plus, 
  X, 
  Trash2, 
  UserPlus,
  Loader2,
  ListFilter,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Settings2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Students = () => {
  const [searchParams] = useSearchParams();
  const gradeId = searchParams.get('grade');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Setup Flow State
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [numStudents, setNumStudents] = useState(1);
  const [numSubjects, setNumSubjects] = useState(1);
  const [subjectInputs, setSubjectInputs] = useState<{name: string, passkey: string, teacherId: string}[]>([]);
  const [studentInputs, setStudentInputs] = useState<{name: string, sex: 'Male' | 'Female', age: number}[]>([]);
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    // Fetch all grades
    const unsubGrades = onSnapshot(collection(db, 'grades'), (s) => {
      setGrades(s.docs.map(d => ({ id: d.id, ...d.data() } as Grade)));
    });

    // Fetch all teachers
    const unsubTeachers = onSnapshot(collection(db, 'teachers'), (s) => {
      setTeachers(s.docs.map(d => ({ id: d.id, ...d.data() } as Teacher)));
    });

    // Fetch students
    const studentsRef = collection(db, 'students');
    const q = gradeId 
      ? query(studentsRef, where('gradeId', '==', gradeId))
      : query(studentsRef);
      
    const unsubStudents = onSnapshot(q, (s) => {
      setStudents(s.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
      setLoading(false);
    });

    // Fetch subjects for this grade
    if (gradeId) {
      const unsubSubjects = onSnapshot(query(collection(db, 'subjects'), where('gradeId', '==', gradeId)), (s) => {
        setSubjects(s.docs.map(d => ({ id: d.id, ...d.data() } as Subject)));
      });
      return () => {
        unsubGrades();
        unsubTeachers();
        unsubStudents();
        unsubSubjects();
      };
    }

    return () => {
      unsubGrades();
      unsubTeachers();
      unsubStudents();
    };
  }, [gradeId]);

  const currentGrade = grades.find(g => g.id === gradeId);

  const generateId = (prefix: string) => {
    return prefix + Math.floor(1000 + Math.random() * 9000);
  };

  const startSetup = () => {
    setSetupStep(1);
    setShowSetupModal(true);
  };

  const nextStep = () => {
    if (setupStep === 1) {
      setSubjectInputs(Array(numSubjects).fill(0).map(() => ({ name: '', passkey: generateId('PK'), teacherId: '' })));
      setStudentInputs(Array(numStudents).fill(0).map(() => ({ name: '', sex: 'Male', age: 15 })));
      setSetupStep(2);
    } else if (setupStep === 2) {
      setSetupStep(3);
    }
  };

  const handleSetupSubmit = async () => {
    if (!gradeId) return;
    setIsSettingUp(true);
    try {
      const batch = writeBatch(db);
      
      // 1. Create Subjects
      const subjectRefs: any[] = [];
      for (const sub of subjectInputs) {
        const subRef = doc(collection(db, 'subjects'));
        batch.set(subRef, {
          ...sub,
          gradeId,
          createdAt: serverTimestamp()
        });
        subjectRefs.push(subRef.id);
      }

      // 2. Create Students and their Result records
      for (const stu of studentInputs) {
        const stuRef = doc(collection(db, 'students'));
        const stuId = generateId('ST');
        batch.set(stuRef, {
          ...stu,
          studentId: stuId,
          gradeId,
          createdAt: serverTimestamp()
        });

        // Initialize Results for each subject
        for (const subId of subjectRefs) {
          const resRef = doc(collection(db, 'results'));
          batch.set(resRef, {
            studentId: stuId,
            subjectId: subId,
            gradeId,
            semester1: null,
            semester2: null,
            average: null,
            total: null,
            rank: null,
            status: 'Unfilled',
            updatedAt: serverTimestamp()
          });
        }
      }

      await batch.commit();
      setShowSetupModal(false);
      setSetupStep(1);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batch-setup');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleDeleteStudent = async (id: string, sId: string) => {
    if (window.confirm('Delete student and their results?')) {
      try {
        const batch = writeBatch(db);
        batch.delete(doc(db, 'students', id));
        // Find and delete matching results
        const resSnap = await getDocs(query(collection(db, 'results'), where('studentId', '==', sId)));
        resSnap.forEach(d => batch.delete(d.ref));
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase tracking-tighter">
            {currentGrade ? `Students · ${currentGrade.name}` : 'Student List'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {currentGrade 
              ? `Registered students for ${currentGrade.name}.`
              : 'Institutional list of all students.'}
          </p>
        </div>
        {gradeId && (
          <button
            onClick={startSetup}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
          >
            <Settings2 size={16} />
            Setup Class
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none text-sm dark:text-white transition-all font-medium"
          />
        </div>
        <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-[10px] font-bold uppercase tracking-widest">
          <ListFilter size={14} />
          <span>Sort</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Student</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gender / Age</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Grade</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {filteredStudents.map((student) => {
                  const grade = grades.find(g => g.id === student.gradeId);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                            {student.name?.charAt(0) || '?'}
                          </div>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-800 tracking-tighter">{student.studentId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                          {student.sex} · {student.age} Years
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{grade?.name || '---'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteStudent(student.id, student.studentId)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="text-center py-20">
               <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">No students found.</p>
            </div>
          )}
        </div>
      )}

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm overflow-y-auto pt-20 pb-20">
          <motion.div
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700"
          >
             {/* Header */}
             <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                   <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Setup Class</h2>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Step {setupStep} · {currentGrade?.name} setup</p>
                </div>
                <button onClick={() => setShowSetupModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400">
                   <X size={18} />
                </button>
             </div>

             {/* Content */}
             <div className="p-8 overflow-y-auto max-h-[60vh]">
                {setupStep === 1 && (
                   <div className="space-y-6">
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-center">
                         <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-indigo-200 dark:shadow-none">
                            <Settings2 size={24} />
                         </div>
                         <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-tight">Class Info</h3>
                         <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium max-w-xs mx-auto mt-1">Fill in the number of students and subjects.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Number of Students</label>
                            <input
                               type="number"
                               min={1}
                               max={100}
                               value={numStudents}
                               onChange={(e) => setNumStudents(parseInt(e.target.value) || 1)}
                               className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/5 text-slate-900 dark:text-white text-lg font-black tracking-tighter"
                            />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Number of Subjects</label>
                            <input
                               type="number"
                               min={1}
                               max={20}
                               value={numSubjects}
                               onChange={(e) => setNumSubjects(parseInt(e.target.value) || 1)}
                               className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/5 text-slate-900 dark:text-white text-lg font-black tracking-tighter"
                            />
                         </div>
                      </div>
                   </div>
                )}

                {setupStep === 2 && (
                   <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {subjectInputs.map((sub, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3">
                               <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Subject #{idx + 1}</span>
                               </div>
                               <div className="space-y-2">
                                  <input
                                     type="text"
                                     placeholder="Subject Name"
                                     required
                                     value={sub.name}
                                     onChange={(e) => {
                                        const newInp = [...subjectInputs];
                                        newInp[idx].name = e.target.value;
                                        setSubjectInputs(newInp);
                                     }}
                                     className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-xs dark:text-white font-bold"
                                  />
                                  <select
                                     required
                                     value={sub.teacherId}
                                     onChange={(e) => {
                                        const newInp = [...subjectInputs];
                                        newInp[idx].teacherId = e.target.value;
                                        setSubjectInputs(newInp);
                                     }}
                                     className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-xs dark:text-white font-bold"
                                  >
                                     <option value="">Select Teacher</option>
                                     {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.teacherId})</option>
                                     ))}
                                  </select>
                                  <div className="space-y-1">
                                     <label className="text-[8px] font-bold text-slate-400 uppercase">Passkey</label>
                                     <input
                                        type="text"
                                        placeholder="Passkey"
                                        required
                                        value={sub.passkey}
                                        onChange={(e) => {
                                           const newInp = [...subjectInputs];
                                           newInp[idx].passkey = e.target.value;
                                           setSubjectInputs(newInp);
                                        }}
                                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-[10px] dark:text-white font-bold"
                                     />
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {setupStep === 3 && (
                   <div className="space-y-4">
                      {studentInputs.map((stu, idx) => (
                         <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-wrap md:flex-nowrap gap-4 items-end">
                            <div className="flex-1 min-w-[200px] space-y-1.5">
                               <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Student #{idx + 1} Name</label>
                               <input
                                  type="text"
                                  placeholder="Full Name"
                                  required
                                  value={stu.name}
                                  onChange={(e) => {
                                     const newInp = [...studentInputs];
                                     newInp[idx].name = e.target.value;
                                     setStudentInputs(newInp);
                                  }}
                                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-xs dark:text-white font-bold"
                               />
                            </div>
                            <div className="w-32 space-y-1.5">
                               <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Sex</label>
                               <select
                                  value={stu.sex}
                                  onChange={(e) => {
                                     const newInp = [...studentInputs];
                                     newInp[idx].sex = e.target.value as 'Male' | 'Female';
                                     setStudentInputs(newInp);
                                  }}
                                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-xs dark:text-white font-bold"
                               >
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                               </select>
                            </div>
                            <div className="w-24 space-y-1.5">
                               <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Age</label>
                               <input
                                  type="number"
                                  required
                                  value={stu.age}
                                  onChange={(e) => {
                                     const newInp = [...studentInputs];
                                     newInp[idx].age = parseInt(e.target.value) || 0;
                                     setStudentInputs(newInp);
                                  }}
                                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-xs dark:text-white font-bold"
                               />
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>

             {/* Footer Button */}
             <div className="p-8 border-t border-slate-100 dark:border-slate-700 flex gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                {setupStep > 1 && (
                   <button
                      onClick={() => setSetupStep(setupStep - 1)}
                      className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-all"
                   >
                      <ChevronLeft size={14} />
                      Back
                   </button>
                )}
                {setupStep < 3 ? (
                   <button
                      onClick={nextStep}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md shadow-indigo-100 dark:shadow-none transition-all"
                   >
                      Next Step
                      <ChevronRight size={14} />
                   </button>
                ) : (
                   <button
                      onClick={handleSetupSubmit}
                      disabled={isSettingUp}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-900 dark:bg-indigo-950 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md transition-all disabled:opacity-70"
                   >
                      {isSettingUp ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                      {isSettingUp ? 'Saving...' : 'Finish Setup'}
                   </button>
                )}
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Students;
