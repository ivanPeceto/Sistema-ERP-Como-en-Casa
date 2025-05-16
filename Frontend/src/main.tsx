// src/main.tsx

// --- Importaciones Esenciales ---
// React y ReactDOM para renderizar la aplicación en el navegador.
import React from 'react';
import ReactDOM from 'react-dom/client';

// RouterProvider para habilitar el enrutamiento en la aplicación.
// router (importado abajo) contiene la configuración de nuestras rutas.
import { RouterProvider } from 'react-router-dom';
import router from './router'; // Importa la configuración de rutas definida en src/router/index.tsx

// Estilos globales para toda la aplicación.
import './index.css';

// --- Lógica de Renderizado Principal ---
// Busca el elemento HTML con id 'root' en tu index.html.
// Este div es el contenedor donde se montará toda la aplicación React.
const rootElement = document.getElementById('root');

// Verifica que el elemento 'root' exista antes de intentar renderizar.
if (rootElement) {
  // Crea un "root" de React para la renderización concurrente (método moderno).
  ReactDOM.createRoot(rootElement).render(
    // React.StrictMode es una herramienta para destacar problemas potenciales en la aplicación.
    // Ayuda durante el desarrollo, no afecta el build de producción.
    <React.StrictMode>
      {/* RouterProvider toma la configuración de 'router' y hace que las rutas
          estén disponibles para toda la aplicación, permitiendo la navegación. */}
      <RouterProvider router={router} />
    </React.StrictMode>
  );
} else {
  // Si no se encuentra el elemento 'root', muestra un error en la consola.
  // Esto usualmente indica un problema con el archivo public/index.html.
  console.error("Failed to find the root element. Ensure your 'public/index.html' has an element with id 'root'.");
}