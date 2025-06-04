/**
 * @archivo: App.tsx
 * @descripcion: Componente raíz de la aplicación.
 * Actúa como el layout principal y renderiza las rutas anidadas mediante <Outlet />.
 **/
import { Outlet } from 'react-router-dom';
import './App.css';

/**
 * Componente funcional App.
 * Contiene el Outlet de React Router para renderizar la ruta activa.
 * @returns: {JSX.Element} El componente App renderizado.
 **/

function App() {
  return (
    <>
      {/* Outlet renderiza el componente hijo que coincide con la ruta actual. */}
      <Outlet />
    </>
  );
}

export default App;