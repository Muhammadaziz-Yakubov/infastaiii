import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminProtectedRoute from './components/Admin/AdminProtectedRoute';
import Layout from './components/Layout';

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
    </div>
  </div>
);

// Lazy load pages for better performance
const AuthPage = lazy(() => import('./pages/AuthPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const BannedPage = lazy(() => import('./pages/BannedPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Archive = lazy(() => import('./pages/Archive'));
const Finance = lazy(() => import('./pages/Finance'));
const Goals = lazy(() => import('./pages/Goals'));
const GoalTracking = lazy(() => import('./pages/GoalTracking'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Pricing = lazy(() => import('./pages/Pricing'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// App komponenti
function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/login" element={<AuthPage />} />
          <Route path="/auth/register" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/banned" element={<BannedPage />} />

          {/* Protected routes with Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/goals/:id/tracking" element={<GoalTracking />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/pricing" element={<Pricing />} /> {/* Pricing page enabled */}
            </Route>
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* 404 - Not found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;