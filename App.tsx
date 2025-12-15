
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/Home';
import SubmitPage from './pages/Submit';
import ReportPage from './pages/Report';
import LoginPage from './pages/Login';
import AdminPage from './pages/Admin';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';

// Protected Route Component
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading } = useAuth();
    
    if (isLoading) return null; // Or a spinner
    
    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
      <MainLayout>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
                <Route path="/submit" element={<PageTransition><SubmitPage /></PageTransition>} />
                <Route path="/report/:id" element={<PageTransition><ReportPage /></PageTransition>} />
                <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
                <Route path="/signup" element={<PageTransition><LoginPage /></PageTransition>} />
                <Route 
                  path="/admin" 
                  element={
                      <ProtectedAdminRoute>
                          <PageTransition><AdminPage /></PageTransition>
                      </ProtectedAdminRoute>
                  } 
                />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
      </MainLayout>
  );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <LanguageProvider>
                    <AppContent />
                </LanguageProvider>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;
