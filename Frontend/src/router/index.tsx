/**
 * @file router/index.tsx
 * @brief Define la configuración de enrutamiento principal para la aplicación.
 * @details
 * Este archivo utiliza la función `createBrowserRouter` de `react-router-dom` para
 * crear y configurar todas las rutas de la Single-Page Application (SPA).
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
import MainLayout from '../Layouts/MainLayout';
import ProtectedRoute from './protected_route'; 

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
            element: <CrearPedidoPage />,
          },
          {
            path: 'productos',
            element: 
              <GestionProductosPage />,
          },
          {
            path: 'clientes',
            element: 
              <GestionClientesPage />,
          },
          {
            path: 'pedidos', 
            element: 
              <GestionPedidosPage />,
          },
          {
            path: 'categorias',
            element: <GestionCategoriasPage />,
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
]);

export default router;