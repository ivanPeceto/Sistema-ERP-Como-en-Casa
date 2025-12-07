/**
 * @file router/index.tsx
 * @brief Configuración de rutas principal con protección por autenticación y roles.
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import LoginPage from '../pages/login_page';
import RegisterPage from '../pages/register_page';
import CrearPedidoPage from '../pages/ArmarPedidosPage';
import GestionProductosPage from '../pages/GestionProductosPage';
import GestionClientesPage from '../pages/GestionClientesPage';
import GestionPedidosPage from '../pages/GestionPedidosPage';
import GestionCategoriasPage from '../pages/GestionCategoriasPage';
import GestionRecetasPage from '../pages/GestionRecetasPage';
import GestionInsumosPage from '../pages/GestionInsumosPage';
import GestionRolesPage from '../pages/GestionRolesPage';
import MainLayout from '../Layouts/MainLayout';
import ProtectedRoute from './protected_route';
import GestionUsuariosPage from '../pages/GestionUsuariosPage';

import GestionProductosAndCategoriasPage from '../pages/GestionProductosAndCategoriasPage';
import GestionRecetasAndInsumosPage from '../pages/GestionRecetasAndInsumosPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: '/gestion',
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute allowedRoles={['Administrador', 'Recepcionista']}>
                <CrearPedidoPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'productos',
            element: (
              <ProtectedRoute allowedRoles={['Administrador', 'Cocinero']}>
                <GestionProductosAndCategoriasPage/>
              </ProtectedRoute>
            ),
            //element: (
            //  <ProtectedRoute allowedRoles={['Administrador', 'Cocinero']}>
            //    <GestionProductosPage />
            //  </ProtectedRoute>
           // ),
          },
          {
            path: 'clientes',
            element: (
              <ProtectedRoute allowedRoles={['Administrador', 'Recepcionista']}>
                <GestionClientesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'pedidos',
            element: (
              <ProtectedRoute allowedRoles={['Administrador', 'Recepcionista']}>
                <GestionPedidosPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'categorias',
            element: (
              <ProtectedRoute allowedRoles={['Administrador']}>
                <GestionCategoriasPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'roles',
            element: (
              <ProtectedRoute allowedRoles={['Administrador']}>
                <GestionRolesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'usuarios',
            element: (
              <ProtectedRoute allowedRoles={['Administrador']}>
                <GestionUsuariosPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'recetas',
            element: (
              <ProtectedRoute allowedRoles={['Administrador', 'Cocinero']}>
                <GestionRecetasAndInsumosPage/>
              </ProtectedRoute>
              /*<ProtectedRoute allowedRoles={['Administrador', 'Cocinero']}>
                <GestionRecetasPage />
              </ProtectedRoute>*/
            ),
          },
          {
            path: 'insumos',
            element: (
              <ProtectedRoute allowedRoles={['Administrador', 'Cocinero']}>
                <GestionInsumosPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/unauthorized',
    element: <div>No tienes permiso para acceder a esta página.</div>,
  },
]);

export default router;
