import React, { useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  doc, 
  updateDoc, 
  serverTimestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Student, Grade, Subject, Result } from '../types';
import { 
  FileText, 
  Search, 
  Download, 
  ChevronRight, 
  Save, 
  CheckCircle2, 
  RefreshCcw,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  FileJson,
  Printer,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Results = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubGrades = onSnapshot(collection(db, 'grades'), (s) => {
      setGrades(s.docs.map(d => ({ id: d.id, ...d.data() } as Grade)));
    });
    return () => unsubGrades();
  }, []);

  useEffect(() => {
    if (!selectedGradeId) return;
    setLoading(true);
    
    const unsubStudents = onSnapshot(query(collection(db, 'students'), where('gradeId', '==', selectedGradeId)), (s) => {
      setStudents(s.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
    });

    const unsubSubjects = onSnapshot(query(collection(db, 'subjects'), where('gradeId', '==', selectedGradeId)), (s) => {
      setSubjects(s.docs.map(d => ({ id: d.id, ...d.data() } as Subject)));
    });

    const unsubResults = onSnapshot(query(collection(db, 'results'), where('gradeId', '==', selectedGradeId)), (s) => {
      setResults(s.docs.map(d => ({ id: d.id, ...d.data() } as Result)));
      setLoading(false);
    });

    return () => {
      unsubStudents();
      unsubSubjects();
      unsubResults();
    };
  }, [selectedGradeId]);

  const handleMarkChange = async (resultId: string, semester: 'semester1' | 'semester2', value: string) => {
    const mark = value === '' ? null : parseFloat(value);
    if (mark !== null && (mark < 0 || mark > 100)) return;
    
    try {
      await updateDoc(doc(db, 'results', resultId), {
        [semester]: mark,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `results/${resultId}`);
    }
  };

  const calculateResults = async () => {
    if (!selectedGradeId || students.length === 0 || subjects.length === 0) return;
    setIsCalculating(true);

    try {
       const batch = writeBatch(db);
       
       // Calculate student totals and averages
       const studentStats = students.map(student => {
          const studentResults = results.filter(r => r.studentId === student.studentId);
          
          let s1Total = 0;
          let s1Count = 0;
          let s2Total = 0;
          let s2Count = 0;

          studentResults.forEach(r => {
             if (r.semester1 !== null) { s1Total += r.semester1; s1Count++; }
             if (r.semester2 !== null) { s2Total += r.semester2; s2Count++; }
          });

          const s1Avg = s1Count > 0 ? s1Total / subjects.length : 0;
          const s2Avg = s2Count > 0 ? s2Total / subjects.length : 0;
          const finalAvg = (s1Avg + s2Avg) / 2;

          return {
             studentId: student.studentId,
             s1Total, s1Avg,
             s2Total, s2Avg,
             finalAvg,
             results: studentResults
          };
       });

       // Assign ranks based on finalAvg
       const sorted = [...studentStats].sort((a, b) => b.finalAvg - a.finalAvg);
       
       studentStats.forEach(stat => {
          const rank = sorted.findIndex(s => s.studentId === stat.studentId) + 1;
          const status = stat.finalAvg >= 50 ? 'Pass' : 'Fail';

          stat.results.forEach(res => {
             batch.update(doc(db, 'results', res.id), {
                average: stat.finalAvg,
                total: stat.s1Total + stat.s1Total, // simplistic total logic for now
                rank,
                status,
                updatedAt: serverTimestamp()
             });
          });
       });

       await batch.commit();
    } catch (error) {
       console.error(error);
    } finally {
       setIsCalculating(false);
    }
  };

  const exportToExcel = () => {
    const data = students.map(s => {
       const sRes = results.filter(r => r.studentId === s.studentId);
       const row: any = { 'Student Name': s.name, 'Student ID': s.studentId };
       subjects.forEach(sub => {
          const res = sRes.find(r => r.subjectId === sub.id);
          row[`${sub.name} (S1)`] = res?.semester1 || 'Unfilled';
          row[`${sub.name} (S2)`] = res?.semester2 || 'Unfilled';
       });
       row['Final Average'] = sRes[0]?.average?.toFixed(2) || 'Unfilled';
       row['Rank'] = sRes[0]?.rank || 'Unfilled';
       row['Status'] = sRes[0]?.status || 'Unfilled';
       return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, `Chercher_School_Results_${selectedGradeId}.xlsx`);
  };

  const exportToCSV = () => {
    const data = students.map(s => {
       const sRes = results.filter(r => r.studentId === s.studentId);
       const row: any = { 'Student Name': s.name, 'Student ID': s.studentId };
       subjects.forEach(sub => {
          const res = sRes.find(r => r.subjectId === sub.id);
          row[`${sub.name} (S1)`] = res?.semester1 || '';
          row[`${sub.name} (S2)`] = res?.semester2 || '';
       });
       row['Final Average'] = sRes[0]?.average?.toFixed(2) || '';
       return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Chercher_Results_${selectedGradeId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = (student?: Student) => {
    const doc = new jsPDF() as any;
    const grade = grades.find(g => g.id === selectedGradeId);
    
    doc.setFontSize(20);
    doc.text("CHERCHER SECONDARY SCHOOL", 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text("OFFICIAL ACADEMIC TRANSCRIPT", 105, 30, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Grade/Section: ${grade?.name || 'N/A'}`, 20, 45);
    doc.text(`Academic Year: 2026/27`, 20, 50);

    if (student) {
       doc.text(`Student Name: ${student.name}`, 20, 60);
       doc.text(`Student ID: ${student.studentId}`, 20, 65);

       const tableData = subjects.map(sub => {
          const res = results.find(r => r.studentId === student.studentId && r.subjectId === sub.id);
          return [sub.name, res?.semester1 ?? 'N/A', res?.semester2 ?? 'N/A', res?.status ?? 'Unfilled'];
       });

       doc.autoTable({
          startY: 75,
          head: [['Subject', 'Semester 1', 'Semester 2', 'Status']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillStyle: [37, 99, 235] }
       });

       const finalRes = results.find(r => r.studentId === student.studentId);
       const finalY = (doc as any).lastAutoTable.finalY + 10;
       doc.text(`Final Average: ${finalRes?.average?.toFixed(2) ?? 'N/A'}%`, 20, finalY);
       doc.text(`Rank: ${finalRes?.rank ?? 'N/A'}`, 20, finalY + 5);
       doc.text(`Status: ${finalRes?.status ?? 'Unfilled'}`, 20, finalY + 10);
       
       doc.setFontSize(8);
       doc.text("System Developed by Ramoda Technologies", 105, 280, { align: 'center' });
       doc.save(`${student.name}_Transcript.pdf`);
    } else {
       // Batch Class Report
       doc.text("Class Performance Summary", 105, 60, { align: 'center' });
       const classData = students.map(s => {
          const sRes = results.find(r => r.studentId === s.studentId);
          return [s.name, s.studentId, sRes?.average?.toFixed(2) ?? 'N/A', sRes?.rank ?? 'N/A', sRes?.status ?? 'Unfilled'];
       });
       
       doc.autoTable({
          startY: 70,
          head: [['Student Name', 'ID', 'Average (%)', 'Rank', 'Status']],
          body: classData,
          theme: 'striped'
       });
       doc.save(`Chercher_${grade?.name}_Full_Results.pdf`);
    }
  };

  const isPublishReady = results.length > 0 && results.every(r => r.semester1 !== null && r.semester2 !== null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white uppercase tracking-tighter">Academic Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium font-display uppercase tracking-widest text-[10px]">Institutional Result Computation Engine</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <select
              value={selectedGradeId || ''}
              onChange={(e) => setSelectedGradeId(e.target.value)}
              className="appearance-none pl-5 pr-10 py-2.5 bg-white dark:bg-gray-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm outline-none focus:border-indigo-500 font-bold text-xs dark:text-white transition-all uppercase tracking-widest cursor-pointer"
            >
              <option value="" disabled>Select Environment</option>
              {grades.map(g => (
                <option key={g.id} value={g.id}>Section {g.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {!selectedGradeId ? (
        <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center">
           <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 text-slate-300 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
              <FileText size={32} />
           </div>
           <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Operational Readiness</h2>
           <p className="text-[10px] text-slate-400 mt-2 max-w-xs font-bold uppercase tracking-widest">Select an academic section to initialize analysis and entry sub-systems.</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <Loader2 className="animate-spin text-indigo-600" size={32} />
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Synchronizing record blocks...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <div className="flex items-center gap-3">
                <button
                   onClick={calculateResults}
                   disabled={isCalculating || students.length === 0}
                   className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all disabled:opacity-50"
                >
                   {isCalculating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                   {isCalculating ? 'Processing...' : 'Compute Core Stats'}
                </button>
                {isPublishReady && (
                   <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">
                      <CheckCircle2 size={12} />
                      Publish Block
                   </button>
                )}
             </div>

             <div className="flex items-center gap-1.5">
                <button onClick={exportToExcel} className="p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600 rounded-lg border border-slate-100 dark:border-slate-800 transition-all" title="Excel Snapshot">
                   <FileSpreadsheet size={16} />
                </button>
                <button onClick={exportToCSV} className="p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600 rounded-lg border border-slate-100 dark:border-slate-800 transition-all" title="CSV Snapshot">
                   <AlertCircle size={16} />
                </button>
                <button onClick={() => generatePDF()} className="p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600 rounded-lg border border-slate-100 dark:border-slate-800 transition-all" title="Class PDF">
                   <Printer size={16} />
                </button>
             </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden overflow-x-auto">
             <table className="w-full text-left min-w-[800px]">
                <thead>
                   <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                      <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky left-0 bg-white dark:bg-gray-800 z-10 w-[220px]">Scholar Profile</th>
                      {subjects.map(sub => (
                         <th key={sub.id} className="px-4 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center border-l border-slate-100 dark:border-slate-700/50">
                            <div className="flex flex-col gap-0.5">
                               <span className="text-slate-700 dark:text-slate-300">{sub.name}</span>
                               <span className="text-[8px] opacity-40">S1 · S2</span>
                            </div>
                         </th>
                      ))}
                      <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center border-l border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/10">Average / Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                   {students.map(student => {
                      const studentResults = results.filter(r => r.studentId === student.studentId);
                      const summary = studentResults[0]; 

                      return (
                         <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-all group">
                            <td className="px-6 py-5 sticky left-0 bg-white dark:bg-gray-800 z-10 group-hover:bg-slate-50/80 dark:group-hover:bg-slate-800/80 transition-colors">
                               <div className="flex flex-col gap-1">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white capitalize leading-none">{student.name}</span>
                                  <div className="flex items-center gap-2">
                                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{student.studentId}</span>
                                     <button onClick={() => generatePDF(student)} className="text-[8px] text-indigo-500 font-black uppercase tracking-widest hover:underline">Transcript</button>
                                  </div>
                               </div>
                            </td>
                            {subjects.map(sub => {
                               const res = studentResults.find(r => r.subjectId === sub.id);
                               return (
                                  <td key={sub.id} className="px-3 py-5 border-l border-slate-50 dark:border-slate-700/30">
                                     <div className="flex items-center gap-1.5 justify-center">
                                        <input
                                           type="number"
                                           placeholder="S1"
                                           value={res?.semester1 ?? ''}
                                           onChange={(e) => res && handleMarkChange(res.id, 'semester1', e.target.value)}
                                           className={`w-12 px-1 py-2 text-center rounded-lg bg-slate-50 dark:bg-slate-900 border-none outline-none text-[11px] font-black transition-all ${res?.semester1 === null ? 'placeholder:text-slate-300' : 'text-slate-900 dark:text-indigo-400'}`}
                                        />
                                        <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                        <input
                                           type="number"
                                           placeholder="S2"
                                           value={res?.semester2 ?? ''}
                                           onChange={(e) => res && handleMarkChange(res.id, 'semester2', e.target.value)}
                                           className={`w-12 px-1 py-2 text-center rounded-lg bg-slate-50 dark:bg-slate-900 border-none outline-none text-[11px] font-black transition-all ${res?.semester2 === null ? 'placeholder:text-slate-300' : 'text-slate-900 dark:text-indigo-400'}`}
                                        />
                                     </div>
                                  </td>
                               );
                            })}
                            <td className="px-6 py-5 border-l border-slate-100 dark:border-slate-700/50 bg-slate-50/20 dark:bg-slate-900/5">
                               <div className="flex flex-col items-center gap-1.5">
                                  <span className="text-xs font-black text-slate-900 dark:text-white">
                                     {summary?.average ? `${summary.average.toFixed(1)}%` : '---'}
                                  </span>
                                  <div className="flex gap-1">
                                     <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${summary?.status === 'Pass' ? 'bg-indigo-50 text-indigo-700' : summary?.status === 'Fail' ? 'bg-red-50 text-red-700' : 'text-slate-300'}`}>
                                        {summary?.status || 'DATA_NULL'}
                                     </span>
                                  </div>
                               </div>
                            </td>
                         </tr>
                      );
                   })}
                </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
