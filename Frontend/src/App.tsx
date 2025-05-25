// Este es el componente principal de nuestra aplicación React.
// Funciona como un contenedor global para todas las rutas que definimos.
import { Outlet } from 'react-router-dom';
import './App.css'; // Estilos generales que aplicamos a la raíz de nuestra app.

// -------        -------        -------        -------        -------        -------

/* El <Outlet /> es el punto donde React Router va a renderizar el componente */
/*    de la ruta que coincida con la URL actual. */
/*   Por ejemplo, si la URL es '/', renderizará nuestro main_layout. */
/*    Si es '/login', renderizará login_page. */

function App() {
  return (
    <>
      <Outlet />
    </>
  );
}

// -------        -------        -------        -------        -------        -------

export default App; // Exportamos App para que lo pueda usar el main.tsx como punto de entrada.

// -------        -------        -------        -------        -------        -------