/*
 * @file product_service.ts
 * @description Servicio que maneja la comunicación con el backend para operaciones CRUD de productos.
 * Este servicio proporciona funciones para crear, leer, actualizar y eliminar productos,
 * así como para buscar productos por diferentes criterios.
 */

import createAuthApiClient from '../api/apiClient';

/**
 * URL base del microservicio de productos. Se obtiene de las variables de entorno.
 * Si no está definida, se muestra un mensaje de error en la consola.
 */
const PRODUCTOS_API_BASE_URL = import.meta.env.VITE_API_PRODUCTOS_URL;

if (!PRODUCTOS_API_BASE_URL) {
  console.error('VITE_API_PRODUCTOS_URL no está definida. La comunicación con el servicio de productos podría fallar.');
}

/**
 * Cliente API configurado con autenticación para interactuar con el microservicio de productos.
 */
const apiClient = createAuthApiClient(PRODUCTOS_API_BASE_URL);

/*
 * Interfaces y tipos de datos
 */

/**
 * Define la estructura de una categoría de producto.
 * Esta interfaz se utiliza tanto para representar categorías en productos como para el servicio de categorías.
 */
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

/**
 * Define la estructura de un producto tal como se recibe del backend.
 * Esta interfaz representa un producto completo con su relación con la categoría.
 * Nota: El campo 'categoria' es un objeto completo debido al uso de CategoriaSerializer en el backend.
 */
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  stock: number;
  precio_por_bulto: number;
  disponible: boolean;
  categoria: Categoria | null;
}

/**
 * Define la estructura de los datos que se envían al backend para crear o actualizar productos.
 * Esta interfaz se utiliza como tipo de entrada para las operaciones de escritura (POST, PUT).
 * Nota: Se utiliza 'categoria_id' en lugar de 'categoria' para mantener la consistencia con el backend.
 */
export interface ProductoInput {
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  stock: number;
  precio_por_bulto: number;
  disponible: boolean;
  categoria_id: number | null; 
}


/*
 * Funciones de servicio para operaciones CRUD con productos
 */

/**
 * Obtiene la lista completa de productos del backend.
 * @returns Promesa que resuelve a un array de productos
 */
export const getProductos = async (): Promise<Producto[]> => {
  const response = await apiClient.get<Producto[]>('/listar/');
  return response.data;
};

/**
 * Realiza una búsqueda de productos basada en un término de búsqueda.
 * La búsqueda se realiza en el backend y puede incluir nombre y descripción.
 * @param searchTerm Término de búsqueda
 * @returns Promesa que resuelve a un array de productos coincidentes
 */
export const searchProductos = async (searchTerm: string): Promise<Producto[]> => {
  const response = await apiClient.get<Producto[]>(`/buscar/?search=${searchTerm}`);
  return response.data;
};

/**
 * Crea un nuevo producto en el sistema.
 * @param productoData Datos del producto a crear
 * @returns Promesa que resuelve al producto creado
 * @throws Error si la creación falla
 */
export const createProducto = async (productoData: ProductoInput): Promise<Producto> => {
  const response = await apiClient.post<Producto>('/crear/', productoData);
  return response.data;
};

/**
 * Actualiza un producto existente.
 * @param id ID del producto a actualizar
 * @param productoData Datos actualizados del producto
 * @returns Promesa que resuelve a los datos actualizados
 * @throws Error si la actualización falla
 */
export const updateProducto = async (id: number, productoData: ProductoInput): Promise<any> => {
  const response = await apiClient.put(`/editar/?id=${id}`, productoData);
  return response.data;
};

/**
 * Elimina un producto del sistema.
 * @param id ID del producto a eliminar
 * @returns Promesa que resuelve cuando la eliminación es exitosa
 * @throws Error si la eliminación falla
 */
export const deleteProducto = async (id: number): Promise<any> => {
  const response = await apiClient.post(`/eliminar/?id=${id}`);
  return response.data;
};

