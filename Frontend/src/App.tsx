import { Outlet } from 'react-router-dom';

import './App.css';

/**
 * Componente App: El componente principal o "layout" para un conjunto de rutas.
 * Define la estructura común (si la hay, como un menú o pie de página) y
 * utiliza <Outlet /> para mostrar el contenido de la página actual según la ruta.
 */
function App() {
  return (

    <>
      {/* 'main' es el contenedor principal para el contenido de las páginas. */}
      <main className="content">
        {/* Outlet: Punto de inserción para las rutas hijas.
            React Router renderizará aquí el componente de página correspondiente
            a la URL actual. */}
        <Outlet />
      </main>
    </>
  );
}


export default App;