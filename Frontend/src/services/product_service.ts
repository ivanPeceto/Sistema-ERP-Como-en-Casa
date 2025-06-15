/**
 * @file product_service.ts
 * @brief Servicio para las operaciones CRUD del microservicio de Productos.
 * @details
 * Este archivo encapsula toda la comunicación con la API del microservicio de productos.
 * Proporciona un conjunto de funciones CRUD.
 * Utiliza una instancia de Axios dedicada, creada a partir de la factoría `createAuthApiClient`.
 */

import createAuthApiClient from '../api/apiClient';
import type { Producto, ProductoInput } from '../types/models.d.ts';

/**
 * @brief URL base del microservicio de productos.
 * @details Se obtiene de las variables de entorno de Vite, definidas en el archivo `.env`
 * y cargadas en el entorno de Docker.
 */
const PRODUCTOS_API_BASE_URL = import.meta.env.VITE_API_PRODUCTOS_URL;

/**
 * @brief Instancia de cliente API exclusiva para el servicio de productos.
 * @details Se crea llamando a la factoría con la URL base de este servicio.
 * Todas las funciones en este archivo utilizarán esta instancia.
 */
const productAPIClient = createAuthApiClient(PRODUCTOS_API_BASE_URL);

/**
 * @brief Obtiene la lista completa de productos desde el backend.
 * @details Realiza una petición GET al endpoint `/producto/listar/`.
 * @returns {Promise<Producto[]>} Una promesa que se resuelve con un array de objetos Producto.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const getProductos = async (): Promise<Producto[]> => {
    const response = await productAPIClient.get<Producto[]>('/listar/');
    return response.data;
};

/**
 * @brief Envía los datos de un nuevo producto al backend para su creación.
 * @details Realiza una petición POST al endpoint `/producto/crear/`.
 * @param {ProductoInput} productoData Un objeto con los datos del producto a crear.
 * @returns {Promise<Producto>} Una promesa que se resuelve con el objeto del producto recién creado.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const createProducto = async (productoData: ProductoInput): Promise<Producto> => {
    const response = await productAPIClient.post<Producto>('/crear/', productoData);
    return response.data;
};

/**
 * @brief Envía datos actualizados de un producto existente al backend.
 * @details Realiza una petición PUT al endpoint `/producto/editar/`, identificando
 * el producto a actualizar mediante un query param `id`.
 * @param {number} id El ID del producto que se va a actualizar.
 * @param {ProductoInput} productoData Un objeto con todos los nuevos datos para el producto.
 * @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const updateProducto = async (id: number, productoData: ProductoInput): Promise<any> => {
    const response = await productAPIClient.put(`/editar/?id=${id}`, productoData);
    return response.data;
};

/**
 * @brief Solicita la eliminación de un producto existente en el backend.
 * @details Realiza una petición POST al endpoint `/producto/eliminar/`, identificando
 * el producto con un query param `id`.
 * @param {number} id El ID del producto a eliminar.
 * @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const deleteProducto = async (id: number): Promise<any> => {
    const response = await productAPIClient.post(`/eliminar/?id=${id}`);
    return response.data;
};

/**
 * @brief Actualiza parcialmente un producto existente en el backend.
 * @details Realiza una petición PUT para modificar el campo 'disponible'.
 * @param {number} id El ID del producto a actualizar.
 * @param {Partial<ProductoInput>} productoData Un objeto con los campos específicos a modificar.
 * @returns {Promise<Producto>} Una promesa que se resuelve con el producto actualizado.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const cambiarDisponibilidad = async (producto: Producto): Promise<Producto> => {
  const actualizado = { ...producto, disponible: !producto.disponible };
  const response = await productAPIClient.put(`/editar/?id=${id}`, actualizado);
  return response.data;
};