// src/pages/AuthPage.jsx - Authentication Page Wrapper
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthComponent from '../components/Auth/AuthComponent';
import authService from '../services/authService';

const AuthPage = () => {
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return <AuthComponent />;
};

export default AuthPage;
