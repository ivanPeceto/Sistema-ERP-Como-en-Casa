// Este es el punto de entrada principal de nuestra aplicación React.
// Desde aquí, nuestra aplicación se inicia y se "monta" en el navegador.

import React from 'react';
import ReactDOM from 'react-dom/client';

// -------        -------        -------        -------        -------        -------

// Importamos el RouterProvider para habilitar la navegación en toda la app.
// 'router' (que importamos de './router') contiene todas las reglas de nuestras rutas.

import { RouterProvider } from 'react-router-dom';
import router from './router'; 
import './index.css';

// -------        -------        -------        -------        -------        -------

// Buscamos el elemento HTML con el 'id="root"' en nuestro archivo 'public/index.html'.
// Este será el contenedor principal donde se va a renderizar toda nuestra aplicación React.

const rootElement = document.getElementById('root');

// Verificamos si encontramos el elemento 'root' antes de intentar renderizar.

/* El RouterProvider se encarga de que todas nuestras rutas estén disponibles */
/* en cualquier parte de la aplicación, permitiendo la navegación. */

// <React.StrictMode> es una herramienta de React que nos ayuda a encontrar problemas
// potenciales durante el desarrollo. No afecta el rendimiento en producción.
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
} else {
  console.error("No se encontró el elemento 'root'. Asegurate de que tu archivo 'public/index.html' tenga un elemento con id 'root'.");
}