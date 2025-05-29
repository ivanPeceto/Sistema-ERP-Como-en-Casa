// Aca se define que componente se ve en cada url.
import { createBrowserRouter } from 'react-router-dom';
import App from '../App'; 
import LoginPage from '../pages/login_page';
import RegisterPage from '../pages/register_page';
import GestionPedidosPage from '../pages/gestion_pedidos_page';
import MainLayout from '../Layouts/MainLayout'; 

  // -------        -------        -------        -------        -------        -------

const router = createBrowserRouter([
  {
    path: '/',
    // -- App es el punto de partida del router
    element: <App />, 
    children: [
      {
        path: '/', 
        element: <MainLayout />,
        children: [
          {
            index: true, // Esto hace que gestion_pedidos_page sea la página por defecto en '/'
            element: <GestionPedidosPage />,
          },
        ],
      },
    ],
  },

  // -------        -------        -------        -------        -------        -------

  { // Estas son rutas que NO usan el layout principal (sin sidebar). Por ejmplo el login o registro
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
]);

  // -------        -------        -------        -------        -------        -------

export default router; 