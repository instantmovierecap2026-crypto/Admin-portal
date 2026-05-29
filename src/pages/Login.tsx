import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (!authLoading && user && isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state listener in AuthContext will handle navigation check
    } catch (err: any) {
      console.error(err);
      let message = 'An error occurred during authentication.';
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'The credentials provided are incorrect. Please verify and try again.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to multiple failed login attempts. Please try again later.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Network connectivity issue detected. Please check your internet connection.';
      } else if (err.message) {
        message = err.message;
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 selection:bg-indigo-100 selection:text-indigo-900">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-10 relative border border-slate-200 dark:border-slate-700"
      >
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-md">
            <LogIn size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">AUTHENTICATE</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CHERCHER SECONDARY SCHOOL SYSTEM</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase"
          >
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Authorized Identifier</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ADMIN_ACCESS_EMAIL"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/5 transition-all outline-none text-xs font-bold dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Secure Passkey</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-600/5 transition-all outline-none text-xs font-bold dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-md shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 mt-10"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <LogIn size={14} />}
            {loading ? 'Initializing Session...' : 'Establish Connection'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-700 text-center">
           <p className="text-[9px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest leading-loose">
             Proprietary Institutional System<br/>
             Authorized Personnel Only
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
