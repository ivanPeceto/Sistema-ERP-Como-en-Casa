// Frontend/src/pages/GestionPedidosPage.tsx

/**
 * @file GestionPedidosPage.tsx
 * @description Este componente implementa la interfaz de usuario para la gestión y visualización de pedidos.
 * Se encarga de listar los pedidos existentes, permitir búsquedas por fecha o número de pedido,
 * y proporcionar funcionalidades para la consulta detallada, edición de estados y eliminación de pedidos.
 * El desarrollo de esta funcionalidad fue realizado en colaboración.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react'; 
import styles from '../styles/gestionPedidosPage.module.css'; 

// Definiciones de interfaces para estructurar los datos del pedido y sus ítems.
interface PedidoItem {
  id_producto: number;
  nombre_producto: string;
  cantidad_producto: number;
  precio_unitario: number;
  subtotal: number;
}

interface Pedido {
  id: number;
  numero_pedido: number;
  fecha_pedido: string; 
  id_cliente: number;
  para_hora: string | null;
  entregado: boolean;
  pagado: boolean;
  total: number;
  productos_detalle: PedidoItem[];
}

// Datos de ejemplo para el desarrollo y la demostración. Estos datos serán reemplazados
const mockPedidos: Pedido[] = [
  {
    id: 1,
    numero_pedido: 1001,
    fecha_pedido: '2025-06-05',
    id_cliente: 1,
    para_hora: '13:00',
    entregado: false,
    pagado: false,
    total: 3500.00,
    productos_detalle: [
      { id_producto: 101, nombre_producto: 'Pizza Muzzarella Grande', cantidad_producto: 1, precio_unitario: 1500, subtotal: 1500 },
      { id_producto: 401, nombre_producto: 'Gaseosa Coca-Cola 1.5L', cantidad_producto: 2, precio_unitario: 750, subtotal: 1500 },
      { id_producto: 201, nombre_producto: 'Empanada Carne Suave (unidad)', cantidad_producto: 2, precio_unitario: 250, subtotal: 500 },
    ],
  },
  {
    id: 2,
    numero_pedido: 1002,
    fecha_pedido: '2025-06-05',
    id_cliente: 2,
    para_hora: '21:30',
    entregado: true,
    pagado: true,
    total: 3200.00,
    productos_detalle: [
      { id_producto: 301, nombre_producto: 'Hamburguesa Clásica con Papas', cantidad_producto: 2, precio_unitario: 1200, subtotal: 2400 },
      { id_producto: 402, nombre_producto: 'Agua Mineral Sin Gas 1.5L', cantidad_producto: 2, precio_unitario: 400, subtotal: 800 },
    ],
  },
  {
    id: 3,
    numero_pedido: 1003,
    fecha_pedido: '2025-06-06',
    id_cliente: 1,
    para_hora: null,
    entregado: false,
    pagado: false,
    total: 1500.00,
    productos_detalle: [
      { id_producto: 101, nombre_producto: 'Pizza Muzzarella Grande', cantidad_producto: 1, precio_unitario: 1500, subtotal: 1500 },
    ],
  },
];

const GestionPedidosPage: React.FC = () => {
  // Estado para almacenar la lista completa de pedidos.
  const [pedidos, setPedidos] = useState<Pedido[]>(mockPedidos);
  // Estado para la lista de pedidos filtrados que se muestran en la interfaz.
  const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>(mockPedidos);
  // Estado para el término de búsqueda textual (número de pedido o nombre de producto).
  const [searchTerm, setSearchTerm] = useState<string>('');
  // Estado para la fecha seleccionada en el filtro, inicializada con la fecha actual.
  const [searchDate, setSearchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  // Estado booleano para controlar la visibilidad del modal de detalles.
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // Estado para almacenar el objeto de pedido que se está visualizando en el modal.
  const [viewingPedido, setViewingPedido] = useState<Pedido | null>(null);

  /**
   * `useEffect` para la lógica de filtrado. Se ejecuta cada vez que `searchTerm` o `searchDate` cambian,
   * actualizando la lista de pedidos que se muestran al usuario.
   * La implementación incluye la búsqueda por número de pedido y por el nombre de los productos dentro de cada pedido,
   * además del filtrado por fecha.
   */
  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const results = pedidos.filter(pedido => {
      // Se evalúa si el término de búsqueda coincide con el número de pedido o con algún producto asociado.
      const matchesSearchTerm =
        pedido.numero_pedido.toString().includes(lowercasedSearchTerm) ||
        pedido.productos_detalle.some(item => item.nombre_producto.toLowerCase().includes(lowercasedSearchTerm));

      // Se verifica si la fecha del pedido coincide con la fecha seleccionada en el filtro.
      const matchesDate = searchDate === '' || pedido.fecha_pedido === searchDate;

      // Un pedido se incluye en los resultados filtrados si cumple con ambas condiciones de búsqueda.
      return matchesSearchTerm && matchesDate;
    });
    setFilteredPedidos(results);
  }, [searchTerm, searchDate, pedidos]);

  // Manejador de eventos para actualizar el término de búsqueda.
  const handleSearchTermChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Manejador de eventos para actualizar la fecha de búsqueda.
  const handleSearchDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchDate(event.target.value);
  };

  /**
   * Función para abrir el modal de visualización de detalles de un pedido.
   * Se utiliza `useCallback` para memorizar esta función y evitar renderizados innecesarios.
   * @param {Pedido} pedido - El objeto de pedido a mostrar en detalle.
   */
  const openViewModal = useCallback((pedido: Pedido) => {
    setViewingPedido(pedido);
    setIsModalOpen(true);
  }, []);

  /**
   * Función para cerrar el modal de detalles, restableciendo el estado del pedido visualizado.
   * Se utiliza `useCallback` para la optimización.
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setViewingPedido(null);
  }, []);

  // Las siguientes funciones simulan interacciones con el backend.
  // En una implementación completa, cada una realizaría una llamada API (ej. con axios o fetch).

  /**
   * Simula el cambio del estado de entrega de un pedido.
   * Se utiliza `useCallback` para la optimización.
   * @param {number} pedidoId - El ID del pedido a actualizar.
   * @param {boolean} currentStatus - El estado actual de entrega del pedido.
   */
  const handleToggleEntregado = useCallback(async (pedidoId: number, currentStatus: boolean) => {
    console.log(`Simulando cambio de estado 'entregado' para pedido ${pedidoId} a ${!currentStatus}`);
    // TODO: Implementar la llamada al backend para actualizar el estado 'entregado'.
    // Ejemplo: await apiClient.put(`/pedidos/editar/?id=${pedidoId}`, { entregado: !currentStatus });
    setPedidos(prev =>
      prev.map(p => p.id === pedidoId ? { ...p, entregado: !currentStatus } : p)
    );
  }, []);

  /**
   * Simula el cambio del estado de pago de un pedido.
   * Se utiliza `useCallback` para la optimización.
   * @param {number} pedidoId - El ID del pedido a actualizar.
   * @param {boolean} currentStatus - El estado actual de pago del pedido.
   */
  const handleTogglePagado = useCallback(async (pedidoId: number, currentStatus: boolean) => {
    console.log(`Simulando cambio de estado 'pagado' para pedido ${pedidoId} a ${!currentStatus}`);
    // TODO: Implementar la llamada al backend para actualizar el estado 'pagado'.
    // Ejemplo: await apiClient.put(`/pedidos/editar/?id=${pedidoId}`, { pagado: !currentStatus });
    setPedidos(prev =>
      prev.map(p => p.id === pedidoId ? { ...p, pagado: !currentStatus } : p)
    );
  }, []);

  /**
   * Simula la eliminación de un pedido después de la confirmación del usuario.
   * Se utiliza `useCallback` para la optimización.
   * @param {number} pedidoId - El ID del pedido a eliminar.
   */
  const handleDeletePedido = useCallback(async (pedidoId: number) => {
    if (window.confirm('¿Confirma que desea eliminar este pedido? Esta acción es irreversible.')) {
      console.log(`Simulando eliminación de pedido: ${pedidoId}`);
      // TODO: Implementar la llamada al backend para eliminar el pedido.
      // Ejemplo: await apiClient.post(`/pedidos/eliminar/?id=${pedidoId}`);
      setPedidos(prev => prev.filter(p => p.id !== pedidoId));
    }
  }, []);

  /**
   * Renderiza la interfaz de usuario de la página de gestión de pedidos.
   */
  return (
    <div className={styles.pageContainer}>
      <h1>Gestión de Pedidos</h1>
      <div className={styles.toolbar}>
        <div className={styles.searchInputs}>
          {/* Campo de entrada para filtrar pedidos por fecha. */}
          <input
            type="date"
            value={searchDate}
            onChange={handleSearchDateChange}
            className={styles.dateInput}
          />
          {/* Campo de entrada para la búsqueda general por número de pedido o producto. */}
          <input
            type="text"
            placeholder="Buscar por #pedido o producto..."
            value={searchTerm}
            onChange={handleSearchTermChange}
            className={styles.searchInput}
          />
        </div>
        {/* No se incluye un botón directo para "Nuevo Pedido" ya que la creación se maneja en "Armar Pedido". */}
      </div>

      <div className={styles.listContainer}>
        {/* Renderizado condicional de la lista de pedidos o un mensaje de "no resultados". */}
        {filteredPedidos.length > 0 ? (
          filteredPedidos.map(pedido => (
            <div key={pedido.id} className={styles.listItem}>
              <div className={styles.itemInfo}>
                <strong>Pedido #{pedido.numero_pedido}</strong>
                <span>Fecha: {pedido.fecha_pedido}</span>
                <span>Cliente ID: {pedido.id_cliente}</span>
                <span>Hora: {pedido.para_hora || 'N/A'}</span>
                <strong>Total: ${pedido.total.toFixed(2)}</strong>
              </div>
              <div className={styles.itemActions}>
                {/* Botones para alternar el estado de "Entregado" y "Pagado", con estilos dinámicos. */}
                <button
                  onClick={() => handleToggleEntregado(pedido.id, pedido.entregado)}
                  className={`${styles.toggleButton} ${pedido.entregado ? styles.statusEntregado : styles.statusPendiente}`}
                >
                  {pedido.entregado ? 'Entregado' : 'Pendiente'}
                </button>
                <button
                  onClick={() => handleTogglePagado(pedido.id, pedido.pagado)}
                  className={`${styles.toggleButton} ${pedido.pagado ? styles.statusPagado : styles.statusNoPagado}`}
                >
                  {pedido.pagado ? 'Pagado' : 'No Pagado'}
                </button>
                {/* Botón para abrir el modal y ver los detalles completos del pedido. */}
                <button onClick={() => openViewModal(pedido)} className={styles.viewButton}>Ver Detalles</button>
                {/* Botón para eliminar el pedido. */}
                <button onClick={() => handleDeletePedido(pedido.id)} className={styles.deleteButton}>Eliminar</button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No se encontraron pedidos para la fecha o criterios de búsqueda seleccionados.</p>
        )}
      </div>

      {/* Modal para mostrar los detalles de un pedido específico. */}
      {isModalOpen && viewingPedido && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Detalles del Pedido #{viewingPedido.numero_pedido}</h2>
            <div className={styles.detailSection}>
              <p><strong>Fecha:</strong> {viewingPedido.fecha_pedido}</p>
              <p><strong>Cliente ID:</strong> {viewingPedido.id_cliente}</p>
              <p><strong>Hora de Entrega:</strong> {viewingPedido.para_hora || 'No especificada'}</p>
              <p><strong>Estado Entrega:</strong> {viewingPedido.entregado ? 'Entregado' : 'Pendiente'}</p>
              <p><strong>Estado Pago:</strong> {viewingPedido.pagado ? 'Pagado' : 'No Pagado'}</p>
              <h3>Productos:</h3>
              <ul className={styles.productListModal}>
                {/* Lista de productos incluidos en el pedido, con su cantidad, precio unitario y subtotal. */}
                {viewingPedido.productos_detalle.map((item, index) => (
                  <li key={index}>
                    {item.nombre_producto} - {item.cantidad_producto} x ${item.precio_unitario.toFixed(2)} = ${item.subtotal.toFixed(2)}
                  </li>
                ))}
              </ul>
              <p className={styles.modalTotal}><strong>Total del Pedido: ${viewingPedido.total.toFixed(2)}</strong></p>
            </div>
            <div className={styles.modalActions}>
              {/* Botón para cerrar el modal. */}
              <button type="button" onClick={closeModal} className={styles.cancelButton}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPedidosPage;