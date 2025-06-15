/**
 * @file client_service.ts
 * @brief Servicio para las operaciones CRUD del microservicio de Clientes.
 * @details
 * Este archivo centraliza toda la lógica de comunicación con la API del microservicio
 * de clientes. Proporciona funciones específicas para cada operación (crear, leer,
 * actualizar, eliminar), utilizando una instancia de Axios dedicada y configurada
 * a través de la factoría `createAuthApiClient`.
 */

import createAuthApiClient from '../api/apiClient';
import type { Cliente } from '../types/models.ts';

/**
 * @brief URL base del microservicio de clientes.
 * @details Se obtiene de las variables de entorno de Vite, definidas en el archivo `.env`
 * y cargadas en el entorno de Docker.
 */
const CLIENTES_API_BASE_URL = import.meta.env.VITE_API_CLIENTES_URL;

/**
 * @brief Instancia de cliente API exclusiva para el servicio de clientes.
 * @details Se crea llamando a la factoría con la URL base de este servicio.
 * Todas las funciones en este archivo utilizarán esta instancia.
 */
const clientAPIClient = createAuthApiClient(CLIENTES_API_BASE_URL);

/**
 * @brief Obtiene la lista completa de clientes desde el backend.
 * @details Realiza una petición GET al endpoint `/clientes/listar/`.
 * @returns {Promise<Cliente[]>} Una promesa que se resuelve con un array de objetos Cliente.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const getClientes = async (): Promise<Cliente[]> => {
    const response = await clientAPIClient.get<Cliente[]>('/listar/');
    return response.data;
};

/**
 * @brief Envía los datos de un nuevo cliente al backend para su creación.
 * @details Realiza una petición POST al endpoint `/clientes/crear/`.
 * @param {Omit<Cliente, 'id'>} clienteData Un objeto con los datos del cliente a crear.
 * `Omit` se usa para indicar que el `id` no es necesario para la creación.
 * @returns {Promise<Cliente>} Una promesa que se resuelve con el objeto del cliente recién creado.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const createCliente = async (clienteData: Omit<Cliente, 'id'>): Promise<Cliente> => {
    const response = await clientAPIClient.post<Cliente>('/crear/', clienteData);
    return response.data;
};

/**
 * @brief Envía datos actualizados de un cliente existente al backend.
 * @details Realiza una petición PUT al endpoint `/clientes/editar/`, identificando
 * al cliente a actualizar mediante un query param `id`.
 * @param {number} id El ID del cliente que se va a actualizar.
 * @param {Omit<Cliente, 'id'>} clienteData Un objeto con los nuevos datos para el cliente.
 * @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const updateCliente = async (id: number, clienteData: Omit<Cliente, 'id'>): Promise<any> => {
    const response = await clientAPIClient.put(`/editar/?id=${id}`, clienteData);
    return response.data;
};

/**
 * @brief Solicita la eliminación de un cliente existente en el backend.
 * @details Realiza una petición POST al endpoint `/clientes/eliminar/`,
 *  identificando al cliente con un query param `id`.
 * @param {number} id El ID del cliente a eliminar.
 * @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const deleteCliente = async (id: number): Promise<any> => {
    const response = await clientAPIClient.post(`/eliminar/?id=${id}`);
    return response.data;
};