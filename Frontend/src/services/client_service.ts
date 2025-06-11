/*
 * @file client_service.ts
 * @description Servicio que maneja la comunicación con el backend para operaciones CRUD de clientes.
 * Este servicio proporciona funciones para crear, leer, actualizar y eliminar clientes,
 * así como para buscar clientes por diferentes criterios.
 */

import createAuthApiClient from '../api/apiClient';

/**
 * URL base del microservicio de clientes. Se obtiene de las variables de entorno.
 * Si no está definida, se muestra un mensaje de error en la consola.
 */
const CLIENTES_API_BASE_URL = import.meta.env.VITE_API_CLIENTES_URL;

if (!CLIENTES_API_BASE_URL) {
  console.error('VITE_API_CLIENTES_URL no está definida. La comunicación con el servicio de clientes podría fallar.');
}

/**
 * Cliente API configurado con autenticación para interactuar con el microservicio de clientes.
 */
const apiClientClientes = createAuthApiClient(CLIENTES_API_BASE_URL);

/*
 * Interfaces y tipos de datos
 */

/**
 * Define la estructura de un cliente en el sistema.
 * Esta interfaz representa un cliente completo con sus datos básicos.
 * Nota: El campo 'id' es opcional durante la creación del cliente.
 */
export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string;
}

/*
 * Funciones de servicio para operaciones CRUD con clientes
 */

/**
 * Obtiene la lista completa de clientes del backend.
 * @returns Promesa que resuelve a un array de clientes
 * @throws Error si la obtención falla
 */
export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const response = await apiClientClientes.get('/listar/'); 
    return response.data as Cliente[];
  } catch (error) {
    console.error('Error en getClientes:', error);
    throw error;
  }
};

/**
 * Crea un nuevo cliente en el sistema.
 * @param clienteData Datos del cliente a crear (sin ID)
 * @returns Promesa que resuelve al cliente creado
 * @throws Error si la creación falla
 */
export const createCliente = async (clienteData: Omit<Cliente, 'id'>): Promise<Cliente> => {
  try {
    const response = await apiClientClientes.post('/crear/', clienteData); 
    return response.data as Cliente;
  } catch (error) {
    console.error('Error en createCliente:', error);
    throw error;
  }
};

/**
 * Actualiza un cliente existente.
 * @param id ID del cliente a actualizar
 * @param clienteData Datos actualizados del cliente (sin ID)
 * @returns Promesa que resuelve a los datos actualizados
 * @throws Error si la actualización falla
 */
export const updateCliente = async (id: number, clienteData: Omit<Cliente, 'id'>): Promise<any> => {
  try {
    const response = await apiClientClientes.put(`/editar/?id=${id}`, clienteData);
    return response.data;
  } catch (error) {
    console.error('Error en updateCliente:', error);
    throw error;
  }
};

/**
 * Elimina un cliente del sistema.
 * @param id ID del cliente a eliminar
 * @returns Promesa que resuelve cuando la eliminación es exitosa
 * @throws Error si la eliminación falla
 */
export const deleteCliente = async (id: number): Promise<any> => {
  try {
    const response = await apiClientClientes.post(`/eliminar/?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en deleteCliente:', error);
    throw error;
  }
};

/**
 * Busca clientes por diferentes criterios.
 * Permite buscar por ID, nombre o teléfono.
 * @param query Objeto con los criterios de búsqueda (opcional)
 * @returns Promesa que resuelve a un array de clientes coincidentes
 * @throws Error si la búsqueda falla
 */
export const searchClientes = async (query: { id?: number; nombre?: string; telefono?: string }): Promise<Cliente[]> => {
  try {
    const params = new URLSearchParams();
    if (query.id) params.append('id', query.id.toString());
    if (query.nombre) params.append('nombre', query.nombre);
    if (query.telefono) params.append('telefono', query.telefono);

    if (!query.id && !query.nombre && !query.telefono) {
      return await getClientes();
    }

    const response = await apiClientClientes.get(`/buscar/?${params.toString()}`);
    return response.data as Cliente[];
  } catch (error) {
    console.error('Error en searchClientes:', error);
    throw error;
  }
};