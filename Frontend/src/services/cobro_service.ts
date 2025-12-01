import createAuthApiClient from '../api/apiClient';
import type { Cobro, CobroInput, MetodoCobro, Pedido } from '../types';

const PEDIDOS_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const cobroAPIClient = createAuthApiClient(PEDIDOS_API_BASE_URL);

/**
 * @brief Obtiene los cobros asociados a un pedido específico.
 * @details Usa el endpoint de listar, asumiendo que acepta un filtro por ID de pedido.
 * @param {number} idPedido ID del pedido a filtrar.
 * @returns {Promise<Cobro[]>} Lista de cobros.
 */
export const getCobrosByPedido = async (idPedido: number): Promise<Cobro[]> => {
  const response = await cobroAPIClient.get<Cobro[]>(`/api/pedidos/cobros/listar/${idPedido}`);
  return response.data;
};

/**
 * @brief Crea un nuevo cobro (POST a /api/pedidos/cobros/crear/).
 */
export const createCobro = async (cobroData: CobroInput): Promise<Cobro> => {
  const response = await cobroAPIClient.post<Cobro>('/api/pedidos/cobros/', cobroData);
  return response.data;
};

/**
 * @brief Actualiza un cobro existente (PUT a /api/pedidos/cobros/editar/?id=...).
 */
export const updateCobro = async (id: number, cobroData: CobroInput): Promise<any> => {
  const response = await cobroAPIClient.put(`/api/pedidos/cobros/${id}/`, cobroData);
  return response.data;
};

/**
 * @brief Elimina un cobro existente (DELETE a /api/pedidos/cobros/eliminar/?id=...).
 */
export const deleteCobro = async (id: number): Promise<any> => {
  const response = await cobroAPIClient.delete(`/api/pedidos/cobros/${id}/`);
  return response.data;
};

/**
 * @brief Crea un cobro para saldar el total de un pedido.
 */
export const createFullPaymentCobro = async (pedido: Pedido, tipo: MetodoCobro): Promise<Cobro> => {
    const idPedido: number = pedido.id;
    const cobroData: CobroInput = {
        pedido: idPedido,
        monto: pedido.saldo_pendiente,
        tipo: tipo,
    };
    const response = await cobroAPIClient.post<Cobro>('/api/pedidos/cobros/', cobroData);
    return response.data;
}