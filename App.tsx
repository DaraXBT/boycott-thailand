import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/Home';
import SubmitPage from './pages/Submit';
import ReportPage from './pages/Report';
import LoginPage from './pages/Login';
import AdminPage from './pages/Admin';

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
  return (
      <MainLayout>
          <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/submit" element={<SubmitPage />} />
              <Route path="/report/:id" element={<ReportPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/admin" 
                element={
                    <ProtectedAdminRoute>
                        <AdminPage />
                    </ProtectedAdminRoute>
                } 
              />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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