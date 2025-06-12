/**
 * @file GestionPedidosPage.tsx
 * @description Este componente implementa la interfaz de usuario para la gestión y visualización de pedidos.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ChangeEvent } from 'react'; 
import styles from '../styles/gestionPedidosPage.module.css'; 

// --- Servicios y Tipos ---
// Asegúrate de que los nombres de las funciones importadas coincidan con tu servicio
import { getPedidosByDate, editarPedido, deletePedido } from '../services/pedido_service'; 
import { getClientes, type Cliente } from '../services/client_service';
import type { Pedido, PedidoInput } from '../types/models.d.ts';


const GestionPedidosPage: React.FC = () => {
  // --- Estados del Componente ---
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchDate, setSearchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewingPedido, setViewingPedido] = useState<Pedido | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // --- Lógica de Carga de Datos ---
  const fetchPedidos = useCallback(async () => {
    setIsLoading(true);
    try {
      // Usamos la función del servicio que ahora apunta a /buscar/
      const data = await getPedidosByDate(searchDate);
      setPedidos(data);
    } catch (error) {
      console.error(`Error al cargar pedidos para la fecha ${searchDate}:`, error);
      setPedidos([]); 
      alert('Error al cargar pedidos. Verifique la conexión con el backend.');
    } finally {
      setIsLoading(false);
    }
  }, [searchDate]);

  const fetchClientes = useCallback(async () => {
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]); // Se ejecuta al inicio y cuando fetchPedidos cambia (por cambio de fecha)

  // --- Lógica de UI (Filtros y Mapeos) ---
  const clienteNombreMap = useMemo(() => {
    return new Map(clientes.map(cliente => [cliente.id, cliente.nombre]));
  }, [clientes]);

  const filteredPedidos = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return pedidos.filter(pedido => {
      const matchesSearchTerm =
        pedido.numero_pedido.toString().includes(lowercasedSearchTerm) ||
        (clienteNombreMap.get(pedido.id_cliente) || '').toLowerCase().includes(lowercasedSearchTerm) ||
        pedido.productos_detalle.some(item => item.nombre_producto.toLowerCase().includes(lowercasedSearchTerm));
      return matchesSearchTerm;
    });
  }, [searchTerm, pedidos, clienteNombreMap]);

  // --- Manejadores de Eventos ---
  const handleSearchTermChange = (event: ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value);
  const handleSearchDateChange = (event: ChangeEvent<HTMLInputElement>) => setSearchDate(event.target.value);
  
  const openViewModal = useCallback((pedido: Pedido) => {
    setViewingPedido(pedido);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setViewingPedido(null);
  }, []);


  /**
   * @brief Prepara el payload completo necesario para la actualización (PUT).
   * @param {Pedido} pedido - El pedido original.
   * @param {Partial<Pedido>} updates - Los campos que se quieren cambiar.
   * @returns El objeto de datos listo para ser enviado al backend.
   */
  const prepareUpdatePayload = (pedido: Pedido, updates: Partial<Pedido>) => {
    // Mapeamos los productos_detalle (lectura) al formato 'productos' (escritura)
    const productosParaEnviar = pedido.productos_detalle.map(item => ({
      id_producto: item.id_producto,
      nombre_producto: item.nombre_producto,
      cantidad_producto: item.cantidad_producto,
      precio_unitario: item.precio_unitario,
    }));

    return {
      numero_pedido: pedido.numero_pedido,
      fecha_pedido: pedido.fecha_pedido,
      id_cliente: pedido.id_cliente,
      para_hora: pedido.para_hora,
      entregado: pedido.entregado,
      pagado: pedido.pagado,
      ...updates, // Aplicamos los cambios específicos (ej. { pagado: true })
      productos: productosParaEnviar, // Adjuntamos la lista de productos requerida
    };
  };

  const handleToggleEntregado = useCallback(async (pedido: Pedido) => {
    try {
      const payload = prepareUpdatePayload(pedido, { entregado: !pedido.entregado });
      await editarPedido(
        { fecha: pedido.fecha_pedido, numero: pedido.numero_pedido },
        payload
      );
      fetchPedidos();
    } catch (error) {
      console.error(`Error al cambiar estado 'entregado' para pedido ${pedido.id}:`, error);
      alert('No se pudo actualizar el estado del pedido.');
    }
  }, [fetchPedidos]);

  const handleTogglePagado = useCallback(async (pedido: Pedido) => {
    try {
      const payload = prepareUpdatePayload(pedido, { pagado: !pedido.pagado });
      await editarPedido(
        { fecha: pedido.fecha_pedido, numero: pedido.numero_pedido },
        payload
      );
      fetchPedidos();
    } catch (error) {
      console.error(`Error al cambiar estado 'pagado' para pedido ${pedido.id}:`, error);
      alert('No se pudo actualizar el estado del pedido.');
    }
  }, [fetchPedidos]);

  const handleDeletePedido = useCallback(async (pedido: Pedido) => {
    if (window.confirm(`¿Confirma que desea eliminar el Pedido #${pedido.numero_pedido}? Esta acción es irreversible.`)) {
      try {
        // Se llama a deletePedido pasando solo fecha y número.
        await deletePedido({ 
          fecha: pedido.fecha_pedido, 
          numero: pedido.numero_pedido 
        });
        fetchPedidos(); // Recargar la lista
      } catch (error) {
        console.error(`Error al eliminar pedido ${pedido.id}:`, error);
        alert('No se pudo eliminar el pedido.');
      }
    }
  }, [fetchPedidos]);

  // --- Renderizado del Componente (HTML INTACTO) ---
  return (
    <div className={styles.pageContainer}>
      <h1>Gestión de Pedidos</h1>
      <div className={styles.toolbar}>
        <div className={styles.searchInputs}>
          <input
            type="date"
            value={searchDate}
            onChange={handleSearchDateChange}
            className={styles.dateInput}
          />
          <input
            type="text"
            placeholder="Buscar por #pedido, cliente o producto..."
            value={searchTerm}
            onChange={handleSearchTermChange}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.listContainer}>
        {isLoading ? (
          <p>Cargando pedidos...</p>
        ) : filteredPedidos.length > 0 ? (
          filteredPedidos.map(pedido => (
            <div key={pedido.id} className={styles.listItem}>
              <div className={styles.itemInfo}>
                <strong>Pedido #{pedido.numero_pedido}</strong>
                <span>Fecha: {pedido.fecha_pedido}</span>
                <span>Cliente: {clienteNombreMap.get(pedido.id_cliente) || `ID: ${pedido.id_cliente}`}</span>
                <span>Hora: {pedido.para_hora || 'N/A'}</span>
                <strong>Total: ${typeof pedido.total === 'number' ? pedido.total : 'N/A'}</strong>
              </div>
              <div className={styles.itemActions}>
                <button
                  onClick={() => handleToggleEntregado(pedido)}
                  className={`${styles.toggleButton} ${pedido.entregado ? styles.statusEntregado : styles.statusPendiente}`}
                >
                  {pedido.entregado ? 'Entregado' : 'Pendiente'}
                </button>
                <button
                  onClick={() => handleTogglePagado(pedido)}
                  className={`${styles.toggleButton} ${pedido.pagado ? styles.statusPagado : styles.statusNoPagado}`}
                >
                  {pedido.pagado ? 'Pagado' : 'No Pagado'}
                </button>
                <button onClick={() => openViewModal(pedido)} className={styles.viewButton}>Ver Detalles</button>
                <button onClick={() => handleDeletePedido(pedido)} className={styles.deleteButton}>Eliminar</button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No se encontraron pedidos para la fecha o criterios de búsqueda seleccionados.</p>
        )}
      </div>

      {isModalOpen && viewingPedido && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Detalles del Pedido #{viewingPedido.numero_pedido}</h2>
            <div className={styles.detailSection}>
              <p><strong>Fecha:</strong> {viewingPedido.fecha_pedido}</p>
              <p><strong>Cliente:</strong> {clienteNombreMap.get(viewingPedido.id_cliente) || `ID: ${viewingPedido.id_cliente}`}</p>
              <p><strong>Hora de Entrega:</strong> {viewingPedido.para_hora || 'No especificada'}</p>
              <p><strong>Estado Entrega:</strong> {viewingPedido.entregado ? 'Entregado' : 'Pendiente'}</p>
              <p><strong>Estado Pago:</strong> {viewingPedido.pagado ? 'Pagado' : 'No Pagado'}</p>
              <h3>Productos:</h3>
              <ul className={styles.productListModal}>
                {viewingPedido.productos_detalle.map((item, index) => (
                  <li key={index}>
                    {item.nombre_producto} - {item.cantidad_producto} x ${typeof item.precio_unitario === 'number' ? item.precio_unitario : 'N/A'} = ${typeof item.subtotal === 'number' ? item.subtotal.toFixed(2) : 'N/A'}
                  </li>
                ))}
              </ul>
              <p className={styles.modalTotal}><strong>Total del Pedido: ${typeof viewingPedido.total === 'number' ? viewingPedido.total : 'N/A'}</strong></p>
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={closeModal} className={styles.cancelButton}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPedidosPage;