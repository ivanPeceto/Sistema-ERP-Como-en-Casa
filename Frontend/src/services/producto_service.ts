// frontend/src/services/productoService.ts
import apiClient from '../api/apiClient';

// La URL base para el microservicio de productos
const PRODUCTOS_API_URL = `${import.meta.env.VITE_API_PRODUCTOS_URL}/productos`;

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  disponible: boolean;
  precio_por_bulto?: number;
}

export const listarProductos = async (): Promise<Producto[]> => {
  const response = await apiClient.get<Producto[]>(`${PRODUCTOS_API_URL}/listar/`);
  return response.data;
};

export const crearProducto = async (productoData: Partial<Producto>): Promise<Producto> => {
  const response = await apiClient.post<Producto>(`${PRODUCTOS_API_URL}/crear`, productoData);
  return response.data;
};

export const actualizarProducto = async (id: number, productoData: Partial<Producto>): Promise<Producto> => {
  const response = await apiClient.put<Producto>(`${PRODUCTOS_API_URL}/editar/${id}`, productoData);
  return response.data;
};

export const eliminarProducto = async (id: number): Promise<void> => {
  await apiClient.delete(`${PRODUCTOS_API_URL}/eliminar/${id}`);
};

export const cambiarDisponibilidad = async (producto: Producto): Promise<Producto> => {
  const actualizado = { ...producto, disponible: !producto.disponible };
  const response = await apiClient.put<Producto>(`${PRODUCTOS_API_URL}/${producto.id}`, actualizado);
  return response.data;
};
