/**
 * @file ProtectedRoute.tsx
 * @brief Componente para proteger rutas que requieren autenticación.
 * @details
 * Este componente actúa como una "barrera" para las rutas de la aplicación.
 * Envuelve a los componentes de página que solo deben ser visibles para usuarios autenticados.
 * Su lógica se basa en el estado proporcionado por el `AuthContext` para decidir si renderizar
 * la página solicitada o redirigir al usuario a la pantalla de inicio de sesión.
 */

// src/router/ProtectedRoute.tsx
import React, { type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth_context';
import { hasRole } from '../auth/auth';

interface ProtectedRouteProps {
  children: ReactElement;
  allowedRoles?: string[]; // Opcional: roles permitidos
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, token } = useAuth(); 

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && token && !hasRole(token, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
