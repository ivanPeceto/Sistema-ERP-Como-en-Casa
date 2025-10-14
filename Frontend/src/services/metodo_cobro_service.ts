import createAuthApiClient from '../api/apiClient';
import type { MetodoCobro } from '../types/models';

const PEDIDOS_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const metodoCobroAPIClient = createAuthApiClient(PEDIDOS_API_BASE_URL);

/**
 * @brief Obtiene la lista completa de métodos de cobro.
 */
export const getMetodosCobro = async (): Promise<MetodoCobro[]> => {
  const response = await metodoCobroAPIClient.get<MetodoCobro[]>('/api/pedidos/cobros/metodos/listar/');
  return response.data;
};

/**
 * @brief Crea un nuevo método de cobro (POST a /api/pedidos/cobros/metodos/crear/).
 * @param {Omit<MetodoCobro, 'id'>} metodoData Objeto con el nombre del método.
 */
export const createMetodoCobro = async (metodoData: Omit<MetodoCobro, 'id'>): Promise<MetodoCobro> => {
  const response = await metodoCobroAPIClient.post<MetodoCobro>('/api/pedidos/cobros/metodos/crear/', metodoData);
  return response.data;
};

/**
 * @brief Actualiza un método de cobro existente (PUT a /api/pedidos/cobros/metodos/editar/?id=...).
 * @param {number} id El ID del método a actualizar.
 * @param {Omit<MetodoCobro, 'id'>} metodoData Objeto con el nombre del método.
 */
export const updateMetodoCobro = async (id: number, metodoData: Omit<MetodoCobro, 'id'>): Promise<any> => {
  const response = await metodoCobroAPIClient.put(`/api/pedidos/cobros/metodos/editar/?id=${id}`, metodoData);
  return response.data;
};

/**
 * @brief Elimina un método de cobro existente (POST a /api/pedidos/cobros/metodos/eliminar/?id=...).
 * @details Nota: El endpoint DELETE del backend se mapea a POST en tu configuración.
 * @param {number} id El ID del método a eliminar.
 */
export const deleteMetodoCobro = async (id: number): Promise<any> => {
  // Nota: El backend utiliza POST para eliminar (patrón de Django/REST Framework a veces usado).
  const response = await metodoCobroAPIClient.post(`/api/pedidos/cobros/metodos/eliminar/?id=${id}`);
  return response.data;
};