/**
 * @file receta_service.ts
 * @brief Servicio para las operaciones CRUD del microservicio de Recetas.
 * @details
 * Este archivo encapsula toda la comunicación con la API del microservicio de productos
 * para la gestión de recetas. Proporciona un conjunto de funciones para listar,
 * crear, actualizar y eliminar recetas, utilizando una instancia de Axios dedicada.
 */

import createAuthApiClient from '../api/apiClient';
import type { Receta, RecetaInput } from '../types/models';

/**
 * @brief URL base del microservicio de productos.
 * @details Se obtiene de las variables de entorno de Vite.
 */
const PRODUCTOS_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const recetaAPIClient = createAuthApiClient(PRODUCTOS_API_BASE_URL);

/**
 * @brief Obtiene la lista completa de recetas desde el backend.
 * @details Realiza una petición GET al endpoint `/api/productos/receta/listar/`.
 * @returns {Promise<Receta[]>} Una promesa que se resuelve con un array de objetos Receta.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const getRecetas = async (): Promise<Receta[]> => {
    const response = await recetaAPIClient.get<Receta[]>('/api/productos/receta/listar/');
    return response.data;
};

/**
 * @brief Envía los datos de una nueva receta al backend para su creación.
 * @details Realiza una petición POST al endpoint `/api/productos/receta/crear/`.
 * @param {RecetaInput} recetaData Un objeto con los datos de la receta a crear, incluyendo los insumos.
 * @returns {Promise<Receta>} Una promesa que se resuelve con el objeto de la receta recién creada.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const createReceta = async (recetaData: RecetaInput): Promise<Receta> => {
    const response = await recetaAPIClient.post<Receta>('/api/productos/receta/crear/', recetaData);
    return response.data;
};

/**
 * @brief Envía datos actualizados de una receta existente al backend.
 * @details Realiza una petición PUT al endpoint `/api/productos/receta/editar/`, identificando
 * la receta a actualizar mediante un query param `id`.
 * @param {number} id El ID de la receta que se va a actualizar.
 * @param {RecetaInput} recetaData Un objeto con los nuevos datos para la receta, incluyendo los insumos.
 * @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const updateReceta = async (id: number, recetaData: RecetaInput): Promise<any> => {
    const response = await recetaAPIClient.put(`/api/productos/receta/editar/?id=${id}`, recetaData);
    return response.data;
};

/**
 * @brief Solicita la eliminación de una receta existente en el backend.
 * @details Realiza una petición POST al endpoint `/api/productos/receta/eliminar/`, identificando
 * la receta con un query param `id`.
 * @param {number} id El ID de la receta a eliminar.
 * @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const deleteReceta = async (id: number): Promise<any> => {
    const response = await recetaAPIClient.post(`/api/productos/receta/eliminar/?id=${id}`);
    return response.data;
};