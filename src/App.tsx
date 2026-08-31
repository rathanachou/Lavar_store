import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import DashboardLaysOut from './layouts/DashboardLaysOut';
import Product          from './page/Products';
import ProductBatches   from './page/ProductBatches';
import Orders           from './page/Orders';
import Inventory        from './page/Inventory';
import StockMovements   from './page/StockMovements';
import NearExpiry       from './page/NearExpiry';
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

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
  </div>
);

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, role, loading } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/admin/pos" replace />;
  return <>{children}</>;
};

// ─── StaffRoute ───────────────────────────────────────────────
// Allows admin and cashier roles (used for Orders and Reports).
const StaffRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'admin' && role !== 'cashier') return <Navigate to="/admin/pos" replace />;
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
        <Route path="/admin/products/:id/batches" element={
          <AdminRoute><ProductBatches /></AdminRoute>
        } />
        <Route path="/admin/products/near-expiry" element={
          <AdminRoute><NearExpiry /></AdminRoute>
        } />
        <Route path="/admin/inventory" element={
          <AdminRoute><Inventory /></AdminRoute>
        } />
        <Route path="/admin/stock-movements" element={
          <AdminRoute><StockMovements /></AdminRoute>
        } />
        <Route path="/admin/categories" element={
          <AdminRoute><Category /></AdminRoute>
        } />
        <Route path="/admin/orders" element={
          <StaffRoute><Orders /></StaffRoute>
        } />
        <Route path="/admin/reports" element={
          <StaffRoute><Reports /></StaffRoute>
        } />
        <Route path="/admin/reports/daily" element={
          <StaffRoute><Reports /></StaffRoute>
        } />
        <Route path="/admin/reports/monthly" element={
          <StaffRoute><Reports /></StaffRoute>
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