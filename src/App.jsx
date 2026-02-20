import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FleetProvider } from './context/FleetContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import DashboardPage from './pages/Dashboard/DashboardPage';
import LoginPage from './pages/Login/LoginPage';
import VehicleRegistry from './pages/Vehicles/VehicleRegistry';
import TripDispatcher from './pages/Trips/TripDispatcher';
import MaintenancePage from './pages/Maintenance/MaintenancePage';
import DriverCenter from './pages/Drivers/DriverCenter';
import FinancialsPage from './pages/Financials/FinancialsPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import AuditLogViewer from './pages/Analytics/AuditLogViewer';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <FleetProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/vehicles" element={<ProtectedRoute allowedRoles={['Manager', 'Dispatcher']}><VehicleRegistry /></ProtectedRoute>} />
              <Route path="/trips" element={<ProtectedRoute allowedRoles={['Manager', 'Dispatcher']}><TripDispatcher /></ProtectedRoute>} />
              <Route path="/maintenance" element={<ProtectedRoute allowedRoles={['Manager', 'Dispatcher']}><MaintenancePage /></ProtectedRoute>} />
              <Route path="/drivers" element={<ProtectedRoute allowedRoles={['Manager', 'Safety']}><DriverCenter /></ProtectedRoute>} />
              <Route path="/financials" element={<ProtectedRoute allowedRoles={['Manager', 'Analyst']}><FinancialsPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute allowedRoles={['Manager', 'Analyst']}><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['Manager']}><AuditLogViewer /></ProtectedRoute>} />
            </Routes>
          </Router>
        </FleetProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
