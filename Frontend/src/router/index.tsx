// src/router/index.tsx
import { createBrowserRouter} from 'react-router-dom'; // <--- IMPORTANTE
import App from '../App';
import LoginPage from '../pages/login_page';        
import RegisterPage from '../pages/register_page';  

// Asegúrate de que el nombre del archivo y la importación coincidan exactamente en mayúsculas/minúsculas
import GestionPedidosPage from '../pages/gestion_pedidos_page'; // Si tu archivo es GestionPedidosPage.tsx
// (El resto de tus componentes de página si los tienes)

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // App contiene el MainMenu y el Outlet
    children: [
      {
        index: true,
        element: <GestionPedidosPage />,
      },

    ],
  },
  { // Rutas que NO USAN el layout de App (sin MainMenu)
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
]);

export default router; // Exportas el objeto router directamente