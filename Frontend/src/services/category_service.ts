/**
 * @file category_service.ts
 * @brief Servicio para gestionar las operaciones CRUD de categorías.
 * @details
 * Este archivo encapsula toda la comunicación con los endpoints de categorías
 * del microservicio de productos. Proporciona un conjunto de funciones asíncronas
 * para crear, leer, actualizar y eliminar categorías, abstrayendo la lógica de las
 * llamadas API de los componentes de la interfaz de usuario.
 */

import createAuthApiClient from '../api/apiClient';
import {type Categoria } from '../types/models';

/**
 * @brief URL base del microservicio que gestiona productos y categorías.
 * @details Se obtiene de las variables de entorno de Vite. Es fundamental que la variable
 * `VITE_API_PRODUCTOS_URL` esté definida en el archivo `.env` para que el servicio
 * pueda comunicarse con el backend.
 */
const PRODUCTOS_API_BASE_URL = import.meta.env.VITE_API_PRODUCTOS_URL;

/**
 * @brief Instancia de cliente API exclusiva para el servicio de productos/categorias.
 * @details Se crea llamando a la factoría con la URL base de este servicio.
 * Todas las funciones en este archivo utilizarán esta instancia.
 */
const categoryAPIClient = createAuthApiClient(PRODUCTOS_API_BASE_URL);


/**
 * @brief Obtiene la lista completa de categorías desde el backend.
 * @details Realiza una petición GET al endpoint `/categoria/listar/`.
 * @returns {Promise<Categoria[]>} Una promesa que se resuelve con un array de objetos Categoria.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const getCategorias = async (): Promise<Categoria[]> => {
  try {
    const response = await categoryAPIClient.get<Categoria[]>('/categoria/listar/');
    return response.data;
  } catch (error) {
    console.error('Error en getCategorias:', error);
    throw error;
  }
};

/**
 * @brief Envía los datos de una nueva categoría al backend para su creación.
 * @details Realiza una petición POST al endpoint `/categoria/crear/`.
 * @param {Omit<Categoria, 'id'>} categoriaData Un objeto con los datos de la categoría a crear.
 * Se utiliza `Omit` para excluir el `id`, ya que es generado por el backend.
 * @returns {Promise<Categoria>} Una promesa que se resuelve con el objeto de la categoría recién creada (incluyendo su nuevo `id`).
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const createCategoria = async (categoriaData: Omit<Categoria, 'id'>): Promise<Categoria> => {
  try {
    const response = await categoryAPIClient.post<Categoria>('/categoria/crear/', categoriaData);
    return response.data;
  } catch (error) {
    console.error('Error en createCategoria:', error);
    throw error;
  }
};

/**
 * @brief Envía datos actualizados de una categoría existente al backend.
 * @details Realiza una petición PUT al endpoint `/categoria/editar/`, identificando la
 * categoría a actualizar mediante un query param `id`.
 * @param {number} id El ID de la categoría a actualizar.
 * @param {Omit<Categoria, 'id'>} categoriaData Un objeto con los nuevos datos para la categoría.
 * @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend tras la actualización.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const updateCategoria = async (id: number, categoriaData: Omit<Categoria, 'id'>): Promise<any> => {
  try {
    // La URL usa un query param `id` para identificar la categoría a actualizar
    const response = await categoryAPIClient.put(`/categoria/editar/?id=${id}`, categoriaData);
    return response.data;
  } catch (error) {
    console.error('Error en updateCategoria:', error);
    throw error;
  }
};

/**
 * @brief Solicita la eliminación de una categoría existente en el backend.
 * @details Realiza una petición POST al endpoint `/categoria/eliminar/`, identificando la
 * categoría a eliminar mediante un query param `id`.
 * @param {number} id El ID de la categoría a eliminar.
 * @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend tras la eliminación.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const deleteCategoria = async (id: number): Promise<any> => {
  try {
    const response = await categoryAPIClient.post(`/categoria/eliminar/?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en deleteCategoria:', error);
    throw error;
  }
};