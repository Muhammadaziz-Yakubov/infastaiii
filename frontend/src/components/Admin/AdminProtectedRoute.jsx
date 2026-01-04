import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';

const AdminProtectedRoute = () => {
  const { isAdminAuthenticated } = useAdminStore();

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
