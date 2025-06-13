/**
 * @file api/index.ts
 * @brief Punto central para la creación de instancias de API para cada microservicio.
 * @details
 * Este archivo utiliza la función factoría de apiClient para generar y exportar
 * una instancia de Axios pre-configurada para cada microservicio.
 * Esto centraliza la configuración y evita la creación de múltiples instancias en
 * diferentes partes del código.
 */

import createAuthApiClient from './apiClient'; 

const USERS_API_URL = `${import.meta.env.VITE_API_USUARIOS_URL}`;
const CLIENTES_API_URL = `${import.meta.env.VITE_API_CLIENTES_URL}`;
const PRODUCTOS_API_URL = `${import.meta.env.VITE_API_PRODUCTOS_URL}`;
const PEDIDOS_API_URL = `${import.meta.env.VITE_API_PEDIDOS_URL}`;

export const usersApi = createAuthApiClient(USERS_API_URL);
export const clientesApi = createAuthApiClient(CLIENTES_API_URL);
export const productosApi = createAuthApiClient(PRODUCTOS_API_URL);
export const pedidosApi = createAuthApiClient(PEDIDOS_API_URL);