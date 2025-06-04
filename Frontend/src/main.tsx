/**
 * @archivo: main.tsx
 * @descripcion: Punto de entrada principal de la aplicación React.
 * Inicializa y monta la aplicación en el DOM.
 **/

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {/* RouterProvider proporciona el contexto de enrutamiento a la aplicación. */}
      <RouterProvider router={router} />
    </React.StrictMode>
  );
} else {
  console.error("No se encontró el elemento 'root'. Asegurate de que tu archivo 'public/index.html' tenga un elemento con id 'root'.");
}