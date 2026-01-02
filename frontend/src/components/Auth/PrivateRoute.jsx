// src/components/Auth/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    // Foydalanuvchi tizimga kirmagan, auth sahifasiga yo'naltirish
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

export default PrivateRoute;