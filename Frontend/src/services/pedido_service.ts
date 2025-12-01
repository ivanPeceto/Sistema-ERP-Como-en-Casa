/**
 * @file pedido_service.ts
 * @brief Servicio para gestionar las operaciones relacionadas con los pedidos.
 * @details
 * Este archivo centraliza toda la comunicación con la API del microservicio de pedidos.
 * Proporciona un conjunto de funciones para las operaciones CRUD sobre los pedidos,
 *  utilizando una instancia de Axios dedicada y configurada para este servicio.
 */
import createAuthApiClient from '../api/apiClient';
import type { PedidoInput, Pedido } from '../types/models.d.ts';

/**
 * @brief URL base del microservicio de pedidos.
 * @details Se obtiene de las variables de entorno de Vite, definidas en el archivo `.env`
 * y cargadas en el entorno de Docker.
 */
const PEDIDOS_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * @brief Instancia de cliente API exclusiva para el servicio de pedidos.
 * @details Se crea llamando a la factoría con la URL base de este servicio.
 * Todas las funciones en este archivo utilizarán esta instancia.
 */
const pedidoAPICLient = createAuthApiClient(PEDIDOS_API_BASE_URL);

/**
 * @brief Envía la petición para crear un nuevo pedido al backend.
 * @details Realiza una petición POST al endpoint `/pedidos/crear/`.
 * @param {PedidoInput} pedidoData El objeto completo del pedido a crear, siguiendo la interfaz `PedidoInput`.
 * @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend tras la creación.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const createPedido = async (pedidoData: PedidoInput): Promise<any> => {
  const response = await pedidoAPICLient.post('/api/pedidos/crear/', pedidoData);
  return response.data;
};

/**
 * @brief Obtiene todos los pedidos para una fecha específica.
 * @details Realiza una petición GET al endpoint `/pedidos/buscar/`, pasando la fecha como query param.
 * @param {string} fecha La fecha de los pedidos a buscar, en formato "YYYY-MM-DD".
 * @returns {Promise<Pedido[]>} Una promesa que se resuelve con un array de objetos Pedido.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const getPedidosByDate = async (fecha: string): Promise<any[]> => {
  const response = await pedidoAPICLient.get(`/api/pedidos/buscar/?fecha=${fecha}`);
  return response.data;
};

/**
 * @brief Obtiene la lista completa de pedidos desde el backend.
 * @returns {Promise<Pedido[]>} Una promesa que se resuelve con un array de objetos Pedido.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const getPedidos = async (): Promise<Pedido[]> => {
    // Nota: El endpoint real podría requerir parámetros de búsqueda o filtro.
    const response = await pedidoAPICLient.get<Pedido[]>('/api/pedidos/buscar/');
    return response.data;
};

/**
 * @brief Actualiza un pedido existente en el backend.
 * @details Realiza una petición PUT al endpoint `/pedidos/editar/`. El backend identifica
 * el pedido a actualizar mediante la combinación de `fecha` y `numero` como query params.
 * @param {object} identifiers - Un objeto con los identificadores del pedido.
 * @param {string} identifiers.fecha - La fecha del pedido a actualizar.
 * @param {number} identifiers.numero - El número del pedido a actualizar.
 * @param {Partial<Pedido>} data - Un objeto con los campos del pedido que se desean modificar.
 * @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend.
 * @throws {Error} Relanza el error si la petición a la API falla.
 */
export const editarPedido = async (
  { fecha, numero }: { fecha: string; numero: number },
  data: Partial<Pedido>
): Promise<any> => {
  const response = await pedidoAPICLient.put(`/api/pedidos/editar/?fecha=${fecha}&numero=${numero}`, data);
  return response.data;
};

/**
* @brief Solicita la eliminación de un pedido existente en el backend.
* @details Realiza una petición POST al endpoint `/pedidos/eliminar/`. El backend identifica
* el pedido a eliminar mediante la combinación de `fecha` y `numero` como query params.
* @param {object} identifiers - Un objeto con los identificadores del pedido a eliminar.
* @param {string} identifiers.fecha - La fecha del pedido.
* @param {number} identifiers.numero - El número del pedido.
* @returns {Promise<any>} Una promesa que se resuelve con la respuesta del backend tras la eliminación.
* @throws {Error} Relanza el error si la petición a la API falla.
*/
export const deletePedido = async ({ fecha, numero }: { fecha: string; numero: number }): Promise<any> => {
  const response = await pedidoAPICLient.post(`/api/pedidos/eliminar/?fecha=${fecha}&numero=${numero}`);
  return response.data;
};

export const printPedido = async ({ fecha, numero }: { fecha: string; numero: number }): Promise<any> => {
  const response = await pedidoAPICLient.post(`/api/pedidos/imprimir/?fecha=${fecha}&numero=${numero}`);
  return response.data;
};

export const getSaldoPendientePedido = async ({fecha, numero}: {fecha: string, numero: number}): Promise<any[]> => {
  const response = await pedidoAPICLient.get(`/api/pedidos/saldo_pendiente/?fecha=${fecha}&numero=${numero}`);
  return response.data;
};