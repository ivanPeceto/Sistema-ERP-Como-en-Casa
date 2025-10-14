import createAuthApiClient from '../api/apiClient';
import type { Cobro, CobroInput } from '../types/models';

const PEDIDOS_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const cobroAPIClient = createAuthApiClient(PEDIDOS_API_BASE_URL);

/**
 * @brief Obtiene los cobros asociados a un pedido específico.
 * @details Usa el endpoint de listar, asumiendo que acepta un filtro por ID de pedido.
 * @param {number} idPedido ID del pedido a filtrar.
 * @returns {Promise<Cobro[]>} Lista de cobros.
 */
export const getCobrosByPedido = async (idPedido: number): Promise<Cobro[]> => {
  const response = await cobroAPIClient.get<Cobro[]>(`/api/cobros/listar/?id_pedido=${idPedido}`);
  return response.data;
};

/**
 * @brief Crea un nuevo cobro (POST a /api/cobros/crear/).
 */
export const createCobro = async (cobroData: CobroInput): Promise<Cobro> => {
  const response = await cobroAPIClient.post<Cobro>('/api/cobros/crear/', cobroData);
  return response.data;
};

/**
 * @brief Actualiza un cobro existente (PUT a /api/cobros/editar/?id=...).
 */
export const updateCobro = async (id: number, cobroData: CobroInput): Promise<any> => {
  const response = await cobroAPIClient.put(`/api/cobros/editar/?id=${id}`, cobroData);
  return response.data;
};

/**
 * @brief Elimina un cobro existente (DELETE a /api/cobros/eliminar/?id=...).
 */
export const deleteCobro = async (id: number): Promise<any> => {
  const response = await cobroAPIClient.delete(`/api/cobros/eliminar/?id=${id}`);
  return response.data;
};