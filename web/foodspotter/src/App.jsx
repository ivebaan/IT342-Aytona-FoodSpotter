import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./features/auth/pages/RegisterPage";
import LoginPage from "./features/auth/pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";
import VendorStalls from "./pages/VendorStalls";
import Explore from "./pages/Explore";
import AdminPanel from "./pages/AdminPanel";
import { AuthProvider, useAuth } from "./features/auth/hooks/useAuth";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function PrivateVendorRoute({ children }) {
  const { user, loading } = useAuth();
  const currentUser = user || {};
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Syncing your account...</div>;
  }
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  if (
    currentUser.role !== "VENDOR" &&
    currentUser.role !== "OWNER" &&
    currentUser.role !== "ADMIN" &&
    currentUser.role !== "SUPER_ADMIN"
  )
    return <Navigate to="/dashboard" replace />;
  return children;
}

function PrivateAdminRoute({ children }) {
  const { user, loading } = useAuth();
  const currentUser = user || {};
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Syncing your account...</div>;
  }
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <PrivateRoute>
                <Explore />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/vendor/stalls"
            element={
              <PrivateVendorRoute>
                <VendorStalls />
              </PrivateVendorRoute>
            }
          />
          <Route
            path="/admin/panel"
            element={
              <PrivateAdminRoute>
                <AdminPanel />
              </PrivateAdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
