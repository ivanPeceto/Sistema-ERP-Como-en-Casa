/**
 * @file insumo_service.ts
 * @brief Servicio para las operaciones CRUD del microservicio de Insumos.
 * @details
 * Este archivo encapsula la comunicación con la API del microservicio de productos
 * para la gestión de insumos. Proporciona funciones para listar,
 * crear, actualizar y eliminar insumos.
 */

import createAuthApiClient from '../api/apiClient';
import type { Insumo } from '../types/models';

/**
 * @brief URL base del microservicio de productos.
 * @details Se obtiene de las variables de entorno de Vite.
 */
const PRODUCTOS_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const insumoAPIClient = createAuthApiClient(PRODUCTOS_API_BASE_URL);

/**
 * @brief Obtiene la lista completa de insumos desde el backend.
 * @details Realiza una petición GET al endpoint `/api/productos/insumo/listar/`.
 * @returns {Promise<Insumo[]>} Una promesa que se resuelve con un array de objetos Insumo.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const getInsumos = async (): Promise<Insumo[]> => {
    const response = await insumoAPIClient.get<Insumo[]>('/api/productos/insumo/listar/');
    return response.data;
};

/**
 * @brief Envía los datos de un nuevo insumo al backend para su creación.
 * @details Realiza una petición POST al endpoint `/api/productos/insumo/crear/`.
 * @param {Omit<Insumo, 'id'>} insumoData Un objeto con los datos del insumo a crear.
 * @returns {Promise<Insumo>} Una promesa que se resuelve con el objeto del insumo recién creado.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const createInsumo = async (insumoData: Omit<Insumo, 'id'>): Promise<Insumo> => {
    const response = await insumoAPIClient.post<Insumo>('/api/productos/insumo/crear/', insumoData);
    return response.data;
};

/**
 * @brief Envía datos actualizados de un insumo existente al backend.
 * @details Realiza una petición PUT al endpoint `/api/productos/insumo/editar/`, identificando
 * el insumo a actualizar mediante un query param `id`.
 * @param {number} id El ID del insumo que se va a actualizar.
 * @param {Omit<Insumo, 'id'>} insumoData Un objeto con los nuevos datos para el insumo.
 * @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const updateInsumo = async (id: number, insumoData: Omit<Insumo, 'id'>): Promise<any> => {
    const response = await insumoAPIClient.put(`/api/productos/insumo/editar/?id=${id}`, insumoData);
    return response.data;
};

/**
 * @brief Solicita la eliminación de un insumo existente en el backend.
 * @details Realiza una petición POST al endpoint `/api/productos/insumo/eliminar/`, identificando
 * el insumo con un query param `id`.
 * @param {number} id El ID del insumo a eliminar.
 * @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const deleteInsumo = async (id: number): Promise<any> => {
    const response = await insumoAPIClient.post(`/api/productos/insumo/eliminar/?id=${id}`);
    return response.data;
};