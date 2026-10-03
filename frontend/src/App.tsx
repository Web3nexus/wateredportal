import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { MemberLayout } from './layouts/MemberLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LoginPage } from './pages/LoginPage';
import { SecureGatePage } from './pages/SecureGatePage';
import { JoinPage } from './pages/JoinPage';
import { VerifyPage } from './pages/VerifyPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

// Member Pages
import { DashboardPage } from './pages/member/DashboardPage';
import { CardPage } from './pages/member/CardPage';
import { ProfilePage } from './pages/member/ProfilePage';
import { MessagesPage } from './pages/member/MessagesPage';
import { SettingsPage } from './pages/member/SettingsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminMembersPage } from './pages/admin/AdminMembersPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminCommunicationsPage } from './pages/admin/AdminCommunicationsPage';
import { AdminEmailTemplatesPage } from './pages/admin/AdminEmailTemplatesPage';

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium tracking-wide">
          Verifying session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium tracking-wide">
          Verifying administrative authorization...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/securegate" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/securegate" element={<SecureGatePage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/verify/:secureId" element={<VerifyPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Member Authenticated Routes with MemberLayout */}
          <Route
            element={
              <ProtectedRoute>
                <MemberLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/card" element={<CardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Admin Authenticated Routes with AdminLayout */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="applications" element={<AdminApplicationsPage />} />
            <Route path="members" element={<AdminMembersPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
            <Route path="email-system" element={<AdminSettingsPage initialTab="smtp" />} />
            <Route path="sending-accounts" element={<AdminSettingsPage initialTab="senders" />} />
            <Route path="twilio-sms" element={<AdminSettingsPage initialTab="sms" />} />
            <Route path="email-templates" element={<AdminEmailTemplatesPage />} />
            <Route path="communications" element={<AdminCommunicationsPage />} />
            <Route path="branding" element={<AdminSettingsPage initialTab="branding" />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="settings" element={<AdminSettingsPage initialTab="smtp" />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
