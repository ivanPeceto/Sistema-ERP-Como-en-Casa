/**
 * @archivo: index.tsx
 * @descripcion: Define la configuración de enrutamiento principal para la aplicación.
 * Utiliza `react-router-dom` para mapear URLs a los componentes correspondientes,
 * distinguiendo entre rutas que utilizan el layout principal y rutas de pantalla completa
 * como login o registro.
 **/
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import LoginPage from '../pages/login_page';
import RegisterPage from '../pages/register_page';
import CrearPedidoPage from '../pages/ArmarPedidosPage';
import GestionProductosPage from '../pages/GestionProductosPage';
import GestionClientesPage from '../pages/GestionClientesPage';
import GestionPedidosPage from '../pages/GestionPedidosPage';
import MainLayout from '../Layouts/MainLayout';

/**
 * Configuración del enrutador de la aplicación.
 *
 * Define las rutas principales:
 * - Rutas anidadas bajo `/` que utilizan `MainLayout` para la estructura visual común (sidebar).
 * - La ruta raíz (`/`) renderiza `CrearPedidoPage` por defecto.
 * - Rutas específicas como `/productos` y `/clientes` renderizan sus respectivas páginas de gestión.
 * - Rutas de nivel superior como `/login` y `/register` que renderizan componentes de página completa
 * sin el `MainLayout`.
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // Componente raíz que puede incluir contexto global o configuraciones iniciales.
    children: [
      {
        path: '/',
        element: <MainLayout />, // Layout principal para las secciones internas de la aplicación.
        children: [
          {
            index: true, // Define `CrearPedidoPage` como el componente para la ruta padre (`/`).
            element: <CrearPedidoPage />,
          },
          {
            path: 'productos',
            element: <GestionProductosPage />,
          },
          {
            path: 'clientes',
            element: <GestionClientesPage />,
          },
          {
            path: 'pedidos', 
            element: <GestionPedidosPage />,
          },
        ],
      },
    ],
  },
  // Rutas que no utilizan el MainLayout (login - registro).
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