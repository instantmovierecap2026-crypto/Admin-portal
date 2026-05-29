import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import Grades from './pages/Grades';
import Students from './pages/Students';
import Results from './pages/Results';
import Developer from './pages/Developer';
import AdminLayout from './components/layout/AdminLayout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check initial preference but don't use localStorage for persistence across boots if user said so
    // Actually, persistence through Firebase only for Auth. Theme is usually UI preference.
    // I'll stick to a simple state for now.
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="grades" element={<Grades />} />
          <Route path="students" element={<Students />} />
          <Route path="results" element={<Results />} />
          <Route path="developer" element={<Developer />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
