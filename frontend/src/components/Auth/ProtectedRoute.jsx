import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../../services/authService';

const ProtectedRoute = () => {
  // Check if user is authenticated using the auth service
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;