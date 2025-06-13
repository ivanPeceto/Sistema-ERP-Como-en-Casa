/**
 * @file client_service.ts
 * @brief Servicio para las operaciones CRUD del microservicio de Clientes.
 */

import createAuthApiClient from '../api/apiClient';
import type { Cliente } from '../types/models.ts';

// URL base del microservicio de clientes
const CLIENTES_API_BASE_URL = import.meta.env.VITE_API_CLIENTES_URL;

// Cliente API configurado para el microservicio de clientes
const apiClient = createAuthApiClient(CLIENTES_API_BASE_URL);

/**
 * Obtiene la lista completa de clientes.
 */
export const getClientes = async (): Promise<Cliente[]> => {
    const response = await apiClient.get<Cliente[]>('/listar/');
    return response.data;
};

/**
 * Crea un nuevo cliente.
 */
export const createCliente = async (clienteData: Omit<Cliente, 'id'>): Promise<Cliente> => {
    const response = await apiClient.post<Cliente>('/crear/', clienteData);
    return response.data;
};

/**
 * Actualiza un cliente existente.
 */
export const updateCliente = async (id: number, clienteData: Omit<Cliente, 'id'>): Promise<any> => {
    const response = await apiClient.put(`/editar/?id=${id}`, clienteData);
    return response.data;
};

/**
 * Elimina un cliente.
 */
export const deleteCliente = async (id: number): Promise<any> => {
    const response = await apiClient.post(`/eliminar/?id=${id}`);
    return response.data;
};