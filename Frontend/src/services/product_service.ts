/**
 * @file product_service.ts
 * @brief Servicio para las operaciones CRUD del microservicio de Productos.
 */

import createAuthApiClient from '../api/apiClient';
import type { Producto, ProductoInput } from '../types/models.d.ts';

const PRODUCTOS_API_BASE_URL = import.meta.env.VITE_API_PRODUCTOS_URL;

const apiClient = createAuthApiClient(PRODUCTOS_API_BASE_URL);

export const getProductos = async (): Promise<Producto[]> => {
    const response = await apiClient.get<Producto[]>('/listar/');
    return response.data;
};

export const createProducto = async (productoData: ProductoInput): Promise<Producto> => {
    const response = await apiClient.post<Producto>('/crear/', productoData);
    return response.data;
};

export const updateProducto = async (id: number, productoData: ProductoInput): Promise<any> => {
    const response = await apiClient.put(`/editar/?id=${id}`, productoData);
    return response.data;
};

export const deleteProducto = async (id: number): Promise<any> => {
    const response = await apiClient.post(`/eliminar/?id=${id}`);
    return response.data;
};

export const cambiarDisponibilidad = async (producto: Producto): Promise<Producto> => {
  const actualizado = { ...producto, disponible: !producto.disponible };
  const response = await apiClient.put(`/editar/?id=${id}`, actualizado);
  return response.data;
};