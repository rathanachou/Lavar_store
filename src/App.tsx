import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import DashboardLaysOut from './layouts/DashboardLaysOut';
import Product          from './page/Products';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster }      from 'sonner';
import Reports          from './page/Reports';
import PosPage          from './page/PosPage';
import Category         from './page/Category';
import Dashboard        from './page/Dashboard';
import FormLoginPage    from './page/FormLoginPage';
import VerifyEmail      from './page/VerifyEmail';
import ForgotPassword   from './page/ForgotPassword';
import ResetPassword    from './page/ResetPassword';
import MainLayout       from './layouts/MainLayout';
import User             from './service/user';
import { AuthProvider, useAuth } from './hooks/AuthContext';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/admin/pos" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  const { role } = useAuth();

  return (
    <Routes>

      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/login"        element={<FormLoginPage />} />
        <Route path="/signup"       element={<FormLoginPage />} />
        <Route path="/verify-email"    element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLaysOut />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/pos" element={<PosPage />} />

        <Route path="/admin/dashboard" element={
          <AdminRoute><Dashboard /></AdminRoute>
        } />
        <Route path="/admin/products" element={
          <AdminRoute><Product /></AdminRoute>
        } />
        <Route path="/admin/categories" element={
          <AdminRoute><Category /></AdminRoute>
        } />
        <Route path="/admin/reports" element={
          <AdminRoute><Reports /></AdminRoute>
        } />
        <Route path="/admin/reports/daily" element={
          <AdminRoute><Reports /></AdminRoute>
        } />
        <Route path="/admin/reports/monthly" element={
          <AdminRoute><Reports /></AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute><User /></AdminRoute>
        } />

        <Route
          path="*"
          element={
            role === 'admin'
              ? <Navigate to="/admin/dashboard" replace />
              : <Navigate to="/admin/pos" replace />
          }
        />
      </Route>

      {/* Root redirect */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>                      
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-center" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;