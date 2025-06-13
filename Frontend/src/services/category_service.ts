/*
 * @file category_service.ts
 * @description Servicio que maneja la comunicación con el backend para operaciones CRUD de categorías.
 * Este servicio proporciona funciones para crear, leer, actualizar y eliminar categorías,
 * compartiendo la misma URL base que el servicio de productos.
 */

import createAuthApiClient from '../api/apiClient';

/**
 * URL base del microservicio de productos y categorías. Se obtiene de las variables de entorno.
 * Se comparte la misma URL base con el servicio de productos.
 * Si no está definida, se muestra un mensaje de error en la consola.
 */
const PRODUCTOS_API_BASE_URL = import.meta.env.VITE_API_PRODUCTOS_URL;

/**
 * Cliente API configurado con autenticación para interactuar con el microservicio de productos/categorías.
 * Se reutiliza la misma instancia de cliente API que el servicio de productos.
 */
const apiClient = createAuthApiClient(PRODUCTOS_API_BASE_URL);

/*
 * Interfaces y tipos de datos
 */

/**
 * Define la estructura de una categoría en el sistema.
 * Esta interfaz representa una categoría completa con sus datos básicos.
 * Nota: El campo 'id' es opcional durante la creación de una nueva categoría.
 */
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

/*
 * Funciones de servicio para operaciones CRUD con categorías
 */

/**
 * Obtiene la lista completa de categorías del backend.
 * @returns Promesa que resuelve a un array de categorías
 * @throws Error si la obtención falla
 */
export const getCategorias = async (): Promise<Categoria[]> => {
  try {
    const response = await apiClient.get<Categoria[]>('/categoria/listar/');
    return response.data;
  } catch (error) {
    console.error('Error en getCategorias:', error);
    throw error;
  }
};

/**
 * Crea una nueva categoría en el sistema.
 * @param categoriaData Datos de la categoría a crear (sin ID)
 * @returns Promesa que resuelve a la categoría creada
 * @throws Error si la creación falla
 */
export const createCategoria = async (categoriaData: Omit<Categoria, 'id'>): Promise<Categoria> => {
  try {
    const response = await apiClient.post<Categoria>('/categoria/crear/', categoriaData);
    return response.data;
  } catch (error) {
    console.error('Error en createCategoria:', error);
    throw error;
  }
};

/**
 * Actualiza una categoría existente.
 * @param id ID de la categoría a actualizar
 * @param categoriaData Datos actualizados de la categoría (sin ID)
 * @returns Promesa que resuelve a los datos actualizados
 * @throws Error si la actualización falla
 */
export const updateCategoria = async (id: number, categoriaData: Omit<Categoria, 'id'>): Promise<any> => {
  try {
    // La URL usa un query param `id` para identificar la categoría a actualizar
    const response = await apiClient.put(`/categoria/editar/?id=${id}`, categoriaData);
    return response.data;
  } catch (error) {
    console.error('Error en updateCategoria:', error);
    throw error;
  }
};

/**
 * Elimina una categoría del sistema.
 * @param id ID de la categoría a eliminar
 * @returns Promesa que resuelve cuando la eliminación es exitosa
 * @throws Error si la eliminación falla
 */
export const deleteCategoria = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.post(`/categoria/eliminar/?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error en deleteCategoria:', error);
    throw error;
  }
};