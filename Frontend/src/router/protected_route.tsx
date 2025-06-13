/**
 * @file ProtectedRoute.tsx
 * @brief Componente para proteger rutas que requieren autenticación.
 */
import React, { type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth_context';

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Muestra un loader o nada mientras se verifica el estado de autenticación inicial.
  if (isLoading) {
    return <div>Cargando...</div>;
  }

  // Si no está autenticado, redirige a la página de login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza el componente hijo (la página protegida).
  return children;
};

export default ProtectedRoute;