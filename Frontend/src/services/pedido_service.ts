/**
 * @file pedido_service.ts
 * @brief Servicio para gestionar las operaciones relacionadas con los pedidos.
 */
import createAuthApiClient from '../api/apiClient';
import type { PedidoInput, Pedido } from '../types/models.d.ts';

// URL base del microservicio de pedidos
const PEDIDOS_API_BASE_URL = import.meta.env.VITE_API_PEDIDOS_URL;
const apiClient = createAuthApiClient(PEDIDOS_API_BASE_URL);

/**
 * Envía la petición para crear un nuevo pedido al backend.
 */
export const createPedido = async (pedidoData: PedidoInput): Promise<any> => {
  const response = await apiClient.post('/crear/', pedidoData);
  return response.data;
};

/**
 * Obtiene todos los pedidos para una fecha específica.
 */
export const getPedidosByDate = async (fecha: string): Promise<any[]> => {
  const response = await apiClient.get(`/buscar/?fecha=${fecha}`);
  return response.data as Pedido[];
};

/**
 * @brief Actualiza parcialmente un pedido existente.
 * @details Ideal para cambiar estados como 'entregado' o 'pagado'.
 * @param {number} pedidoId El ID del pedido a actualizar.
 * @param {Partial<Pedido>} data Los campos a actualizar. Ejemplo: { entregado: true }
 * @returns {Promise<any>} La respuesta del backend.
 */
export const editarPedido = async (
  { fecha, numero }: { fecha: string; numero: number },
  data: Partial<Pedido>
): Promise<any> => {
  const response = await apiClient.put(`/editar/?fecha=${fecha}&numero=${numero}`, data);
  return response.data;
};

/**
* @brief Elimina un pedido del sistema.
*/
export const deletePedido = async ({ fecha, numero }: { fecha: string; numero: number }): Promise<any> => {
  const response = await apiClient.post(`/eliminar/?fecha=${fecha}&numero=${numero}`);
  return response.data;
};