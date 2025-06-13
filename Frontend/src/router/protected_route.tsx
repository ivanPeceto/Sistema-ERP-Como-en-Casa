/**
 * @file ProtectedRoute.tsx
 * @brief Componente para proteger rutas que requieren autenticación.
 * @details
 * Este componente actúa como una "barrera" para las rutas de la aplicación.
 * Envuelve a los componentes de página que solo deben ser visibles para usuarios autenticados.
 * Su lógica se basa en el estado proporcionado por el `AuthContext` para decidir si renderizar
 * la página solicitada o redirigir al usuario a la pantalla de inicio de sesión.
 */

import React, { type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth_context';

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;