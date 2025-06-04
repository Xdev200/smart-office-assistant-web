
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';
import { AdminOverviewPage } from './pages/AdminOverviewPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Chatbot } from './components/Chatbot';
import { UserRole } from './types';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<EmployeeDashboardPage />} />
                {/* Add more employee-specific routes here if needed, e.g. /attendance, /parking, /booking */}
              </Route>

              <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                <Route path="/admin" element={<AdminOverviewPage />} />
                {/* Add more admin-specific routes here */}
              </Route>
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Catch-all for 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Chatbot /> {/* Chatbot is available on authenticated pages */}
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
