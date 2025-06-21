/**
 * @file GestionPedidosPage.tsx
 * @brief Componente para la gestión completa y visualización de pedidos.
 * @details
 * Este componente implementa una interfaz de usuario avanzada para la gestión de pedidos.
 * Sus funcionalidades principales incluyen:
 * - Carga de pedidos filtrados por fecha.
 * - Búsqueda por texto (N° de pedido, cliente, producto).
 * - Visualización de pedidos en pestañas por estado (Todos, Pendientes, Entregados, etc.).
 * - Un modal para ver los detalles de un pedido.
 * - Un modal para la edición completa de un pedido, incluyendo sus productos.
 * - Acciones rápidas para cambiar estados y eliminar pedidos desde la vista principal.
 * Orquesta la comunicación con múltiples servicios del backend (pedidos, clientes, productos).
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom'; 
import styles from '../styles/gestionPedidosPage.module.css';
import formStyles from '../styles/formStyles.module.css';
import crearPedidoStyles from '../styles/crearPedidoPage.module.css';

import { getPedidosByDate, editarPedido, deletePedido } from '../services/pedido_service';
import { getClientes } from '../services/client_service';
import type { Cliente } from '../types/models';
import { getProductos } from '../services/product_service';
import type { Producto } from '../types/models.d.ts';
import type { Pedido, PedidoInput, PedidoItem } from '../types/models.d.ts';


const GestionPedidosPage: React.FC = () => {
  const navigate = useNavigate(); 

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchDate, setSearchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [viewingPedido, setViewingPedido] = useState<Pedido | null>(null);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Pedido>>({});
  const [editingPedidoItems, setEditingPedidoItems] = useState<PedidoItem[]>([]);
  const [editCategoriaSeleccionada, setEditCategoriaSeleccionada] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

   /**
   * @brief Carga todos los datos iniciales necesarios para la página en paralelo.
   */
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pedidosData, clientesData, productosData] = await Promise.all([
        getPedidosByDate(searchDate),
        getClientes(),
        getProductos()
      ]);
      setPedidos(pedidosData);
      setClientes(clientesData);
      setProductos(productosData);
      if (productosData.length > 0) {
        const categoriasUnicas = [...new Set(productosData.map(p => p.categoria?.nombre || 'Sin Categoría'))];
        if (categoriasUnicas.length > 0) {
          setEditCategoriaSeleccionada(categoriasUnicas[0]);
        }
      }
    } catch (error) {
      console.error(`Error al cargar datos iniciales:`, error);
      setPedidos([]);
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchDate]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  /** @brief Crea un mapa de ID de cliente a nombre para una búsqueda eficiente en el renderizado. */
  const clienteNombreMap = useMemo(() => {
    return new Map(clientes.map(cliente => [cliente.id, cliente.nombre]));
  }, [clientes]);

  /** @brief Filtra los pedidos por texto después de haber sido filtrados por fecha. */
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

  /** @brief Extrae las categorías únicas para el selector de productos en el modal de edición. */
  const editCategoriasUnicas = useMemo(() =>
    [...new Set(productos.map(p => p.categoria?.nombre || 'Sin Categoría'))],
    [productos]
  );

    /** @brief Filtra los productos en el modal de edición por la categoría seleccionada. */
  const editProductosFiltradosPorCategoria = useMemo(() => {
    if (!editCategoriaSeleccionada) return [];
    return productos.filter(p => (p.categoria?.nombre || 'Sin Categoría') === editCategoriaSeleccionada && p.disponible);
  }, [editCategoriaSeleccionada, productos]);

  /** @brief Calcula el total del pedido que se está editando. */
  const totalEditingPedido = useMemo(() => {
    return editingPedidoItems.reduce((total, item) => total + (parseFloat(item.cantidad.toString()) * (parseFloat(item.precio_unitario.toString()) || 0)), 0);
  }, [editingPedidoItems]);

  /** @brief Deriva la lista de pedidos pendientes a partir de la lista filtrada. */
  const pedidosPendientes = useMemo(() =>
    filteredPedidos.filter(pedido => !pedido.entregado),
    [filteredPedidos]
  );

  /** @brief Deriva la lista de pedidos entregados. */
  const pedidosEntregados = useMemo(() =>
    filteredPedidos.filter(pedido => pedido.entregado),
    [filteredPedidos]
  );

  /** @brief Deriva la lista de pedidos pagados. */
  const pedidosPagados = useMemo(() =>
    filteredPedidos.filter(pedido => pedido.pagado),
    [filteredPedidos]
  );

  /** @brief Deriva la lista de pedidos no pagados. */
  const pedidosNoPagados = useMemo(() =>
    filteredPedidos.filter(pedido => !pedido.pagado),
    [filteredPedidos]
  );

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

  const openEditModal = useCallback((pedido: Pedido) => {
    setEditingPedido(pedido);
    setEditFormData({
      para_hora: pedido.para_hora,
      entregado: pedido.entregado,
    });
    setEditingPedidoItems(pedido.productos_detalle.map(item => ({
      id: item.id_producto,
      nombre: item.nombre_producto,
      precio_unitario: parseFloat(item.precio_unitario.toString()) || 0,
      cantidad: parseFloat(item.cantidad_producto.toString()) || 0,
      subtotal: (parseFloat(item.cantidad_producto.toString()) * (parseFloat(item.precio_unitario.toString()) || 0)) || 0,
    })));
    setIsEditModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingPedido(null);
    setEditFormData({});
    setEditingPedidoItems([]);
  }, []);

  const handleEditInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const addProductToEditingOrder = useCallback((product: Producto) => {
    setEditingPedidoItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      const productPrice = parseFloat(product.precio_unitario.toString()) || 0;
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * productPrice }
            : item
        );
      } else {
        return [...prevItems, {
          id: product.id,
          nombre: product.nombre,
          cantidad: 1,
          precio_unitario: productPrice,
          subtotal: productPrice
        }];
      }
    });
  }, []);

  const removeProductFromEditingOrder = useCallback((productId: number) => {
    setEditingPedidoItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  const updateEditingItemQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity < 1) {
      removeProductFromEditingOrder(productId);
      return;
    }
    setEditingPedidoItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, cantidad: quantity, subtotal: quantity * (parseFloat(item.precio_unitario.toString()) || 0) } // Aseguramos que sea número
          : item
      )
    );
  }, [removeProductFromEditingOrder]);

  /**
   * @brief Prepara el payload completo necesario para la actualización (PUT).
   * @param {Pedido} pedido - El pedido original.
   * @param {Partial<Pedido>} updates - Los campos que se quieren cambiar.
   * @param {PedidoItem[]} currentItems - Los ítems de producto actuales del pedido.
   * @returns El objeto de datos listo para ser enviado al backend.
   */
  const prepareUpdatePayload = useCallback((pedido: Pedido, updates: Partial<Pedido>, currentItems: PedidoItem[]): PedidoInput => {
    const productosParaEnviar = currentItems.map(item => ({
      id_producto: item.id,
      nombre_producto: item.nombre,
      cantidad_producto: item.cantidad,
      precio_unitario: parseFloat(item.precio_unitario.toString()) || 0,
    }));

    return {
      numero_pedido: pedido.numero_pedido,
      fecha_pedido: pedido.fecha_pedido,
      id_cliente: pedido.id_cliente,
      para_hora: updates.para_hora !== undefined ? updates.para_hora : pedido.para_hora,
      entregado: updates.entregado !== undefined ? updates.entregado : pedido.entregado,
      pagado: updates.pagado !== undefined ? updates.pagado : pedido.pagado,
      productos: productosParaEnviar,
    };
  }, []);


  const handleEditSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPedido) return;

    if (editingPedidoItems.length === 0) {
      console.error('El pedido no puede estar vacío. Añada al menos un producto.');
      alert('El pedido no puede estar vacío. Por favor, añada al menos un producto.'); // Added alert
      return;
    }

    try {
      const payload = prepareUpdatePayload(editingPedido, editFormData, editingPedidoItems);

      await editarPedido(
        { fecha: editingPedido.fecha_pedido, numero: editingPedido.numero_pedido },
        payload
      );
      console.log('Pedido actualizado exitosamente');
      alert('Pedido actualizado exitosamente.'); // Added alert
      closeEditModal();
      fetchInitialData();
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      alert('Ocurrió un error al actualizar el pedido. Por favor, intente de nuevo.'); // Added alert
    }
  }, [editingPedido, editFormData, editingPedidoItems, prepareUpdatePayload, closeEditModal, fetchInitialData]);


  const handleToggleEntregado = useCallback(async (pedido: Pedido) => {
    try {
      const payload = prepareUpdatePayload(pedido, { entregado: !pedido.entregado }, pedido.productos_detalle.map(item => ({
        id: item.id_producto,
        nombre: item.nombre_producto,
        cantidad: item.cantidad_producto,
        precio_unitario: parseFloat(item.precio_unitario.toString()) || 0,
        subtotal: (parseFloat(item.cantidad_producto.toString()) * (parseFloat(item.precio_unitario.toString()) || 0)) || 0,
      })));
      await editarPedido(
        { fecha: pedido.fecha_pedido, numero: pedido.numero_pedido },
        payload
      );
      fetchInitialData();
    } catch (error) {
      console.error(`Error al cambiar estado 'entregado' para pedido ${pedido.id}:`, error);
      alert('No se pudo actualizar el estado del pedido.'); // Added alert
    }
  }, [fetchInitialData, prepareUpdatePayload]);

  const handleTogglePagado = useCallback(async (pedido: Pedido) => {
    try {
      const payload = prepareUpdatePayload(pedido, { pagado: !pedido.pagado }, pedido.productos_detalle.map(item => ({
        id: item.id_producto,
        nombre: item.nombre_producto,
        cantidad: item.cantidad_producto,
        precio_unitario: parseFloat(item.precio_unitario.toString()) || 0,
        subtotal: (parseFloat(item.cantidad_producto.toString()) * (parseFloat(item.precio_unitario.toString()) || 0)) || 0,
      })));
      await editarPedido(
        { fecha: pedido.fecha_pedido, numero: pedido.numero_pedido },
        payload
      );
      fetchInitialData();
    } catch (error) {
      console.error(`Error al cambiar estado 'pagado' para pedido ${pedido.id}:`, error);
      alert('No se pudo actualizar el estado del pedido.'); // Added alert
    }
  }, [fetchInitialData, prepareUpdatePayload]);

  const handleDeletePedido = useCallback(async (pedido: Pedido) => {
    if (window.confirm(`¿Confirma que desea eliminar el Pedido #${pedido.numero_pedido}? Esta acción es irreversible.`)) {
      try {
        await deletePedido({ fecha: pedido.fecha_pedido, numero: pedido.numero_pedido });
        fetchInitialData();
      } catch (error) {
        console.error(`Error al eliminar pedido ${pedido.id}:`, error);
        alert('No se pudo eliminar el pedido.'); // Added alert
      }
    }
  }, [fetchInitialData]);



  const [activeTab, setActiveTab] = useState<'todos' | 'pendientes' | 'entregados' | 'pagados' | 'noPagados'>('todos');

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-AR', options);
  };

  /**
   * @brief Función de renderizado que genera la lista de pedidos en formato de tarjetas.
   * @param {Pedido[]} pedidosToList La lista de pedidos a renderizar.
   * @returns {React.ReactElement} El JSX de la lista de pedidos.
   */
  const renderPedidosList = (pedidos: Pedido[]) => (
    <div className={styles.listContainer}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <p>Cargando pedidos...</p>
        </div>
      ) : pedidos.length > 0 ? (
        <div className={styles.pedidosGrid}>
          {pedidos.map(pedido => (
            <div key={pedido.id} className={`${styles.pedidoCard} ${pedido.entregado ? styles.entregado : ''} ${pedido.pagado ? styles.pagado : ''}`}>
              <div className={styles.pedidoHeader}>
                <div className={styles.pedidoNumero}>Pedido #{pedido.numero_pedido}</div>
                <div className={styles.pedidoFecha}>
                  {formatDate(pedido.fecha_pedido)}
                </div>
              </div>

              <div className={styles.pedidoCliente}>
                <i className="fas fa-user"></i>
                {clienteNombreMap.get(pedido.id_cliente) || `Cliente #${pedido.id_cliente}`}
              </div>

              <div className={styles.pedidoHora}>
                <i className="fas fa-clock"></i>
                Hora de entrega: {pedido.para_hora || 'A definir'}
              </div>

              <div className={styles.pedidoResumen}>
                <div className={styles.productosCount}>
                  <i className="fas fa-box-open"></i>
                  {pedido.productos_detalle.length} {pedido.productos_detalle.length === 1 ? 'producto' : 'productos'}
                </div>
                <div className={styles.pedidoTotal}>
                  Total: <span>${typeof pedido.total === 'number' ? pedido.total.toFixed(2) : '0.00'}</span>
                </div>
              </div>

              <div className={styles.pedidoEstados}>
                <div
                  className={`${styles.estadoBadge} ${pedido.entregado ? styles.entregadoBadge : styles.pendienteBadge}`}
                  onClick={() => handleToggleEntregado(pedido)}
                >
                  <i className={`fas ${pedido.entregado ? 'fa-check-circle' : 'fa-clock'}`}></i>
                  {pedido.entregado ? 'Entregado' : 'Pendiente'}
                </div>
                <div
                  className={`${styles.estadoBadge} ${pedido.pagado ? styles.pagadoBadge : styles.noPagadoBadge}`}
                  onClick={() => handleTogglePagado(pedido)}
                >
                  <i className={`fas ${pedido.pagado ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                  {pedido.pagado ? 'Pagado' : 'Pendiente pago'}
                </div>
              </div>

              <div className={styles.pedidoAcciones}>
                <button
                  onClick={() => openViewModal(pedido)}
                  className={styles.actionButton}
                  title="Ver detalles"
                >
                  <i className="fas fa-eye"></i>
                  <span>Ver</span>
                </button>
                <button
                  onClick={() => openEditModal(pedido)}
                  className={styles.actionButton}
                  title="Editar pedido"
                >
                  <i className="fas fa-edit"></i>
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDeletePedido(pedido)}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  title="Eliminar pedido"
                >
                  <i className="fas fa-trash"></i>
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>
          <i className="fas fa-inbox"></i>
          <p>No se encontraron pedidos</p>
        </div>
      )}
    </div>
  );

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
            placeholder="Buscar por numero o cliente..."
            value={searchTerm}
            onChange={handleSearchTermChange}
            className={styles.searchInput}
          />
        </div>
        {/* Nuevo Botón "Armar Pedido" */}
        <button
          onClick={() => navigate('/gestion')} // Redirige a la ruta de Armar Pedido
          className={styles.newOrderButton} // Clase CSS para el nuevo botón
        >
          Armar Nuevo Pedido
        </button>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'todos' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          Todos ({filteredPedidos.length})
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'pendientes' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pendientes')}
        >
          Pendientes ({pedidosPendientes.length})
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'entregados' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('entregados')}
        >
          Entregados ({pedidosEntregados.length})
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'pagados' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pagados')}
        >
          Pagados ({pedidosPagados.length})
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'noPagados' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('noPagados')}
        >
          No Pagados ({pedidosNoPagados.length})
        </button>
      </div>

      {activeTab === 'todos' && renderPedidosList(filteredPedidos)}
      {activeTab === 'pendientes' && renderPedidosList(pedidosPendientes)}
      {activeTab === 'entregados' && renderPedidosList(pedidosEntregados)}
      {activeTab === 'pagados' && renderPedidosList(pedidosPagados)}
      {activeTab === 'noPagados' && renderPedidosList(pedidosNoPagados)}

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
                    {item.nombre_producto} - {item.cantidad_producto} x ${ (parseFloat(item.precio_unitario?.toString() || '0')).toFixed(2) } = ${ (parseFloat(item.subtotal?.toString() || '0')).toFixed(2) }
                  </li>
                ))}
              </ul>
              <p className={styles.modalTotal}><strong>Total del Pedido: ${typeof viewingPedido.total === 'number' ? viewingPedido.total.toFixed(2) : 'N/A'}</strong></p>
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={closeModal} className={styles.cancelButton}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingPedido && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContentWide}>
            <h2>Editar Pedido #{editingPedido.numero_pedido}</h2>
            <form onSubmit={handleEditSubmit} className={formStyles.formContainer}>
              <div className={formStyles.formSection}>
                <h3 className={formStyles.formSectionTitle}>Información del Pedido</h3>

                <p><strong>Cliente:</strong> {clienteNombreMap.get(editingPedido.id_cliente) || `ID: ${editingPedido.id_cliente}`}</p>
                <p><strong>Fecha:</strong> {editingPedido.fecha_pedido}</p>

                <div className={formStyles.formRow}>
                  <div className={formStyles.formField}>
                    <label className={formStyles.formLabel} htmlFor="para_hora">Hora de Entrega</label>
                    <input
                      type="time"
                      id="para_hora"
                      name="para_hora"
                      value={editFormData.para_hora || ''}
                      onChange={handleEditInputChange}
                      className={`${formStyles.formInput} ${styles.editTimeInput}`}
                    />
                  </div>

                  <div className={`${formStyles.formField} ${styles.checkboxField}`}>
                    <input
                      type="checkbox"
                      id="entregado"
                      name="entregado"
                      checked={editFormData.entregado || false}
                      onChange={handleEditInputChange}
                      className={formStyles.formCheckbox}
                    />
                    <label htmlFor="entregado" className={formStyles.formLabel}>Entregado</label>
                  </div>

                  <div className={`${formStyles.formField} ${styles.checkboxField}`}>
                    <input
                      type="checkbox"
                      id="pagado"
                      name="pagado"
                      checked={editFormData.pagado || false}
                      onChange={handleEditInputChange}
                      className={formStyles.formCheckbox}
                    />
                    <label htmlFor="pagado" className={formStyles.formLabel}>Pagado</label>
                  </div>
                </div>
              </div>

              <div className={styles.editModalProductsSection}>
                <div className={crearPedidoStyles.productSelectionPanel}>
                  <h2>Añadir Productos</h2>
                  <div className={crearPedidoStyles.categoryTabs}>
                    {(editCategoriasUnicas || []).map(cat => (
                      <button
                        key={cat}
                        className={`${crearPedidoStyles.categoryTab} ${editCategoriaSeleccionada === cat ? crearPedidoStyles.activeTab : ''}`}
                        onClick={() => setEditCategoriaSeleccionada(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className={crearPedidoStyles.productList}>
                    {editProductosFiltradosPorCategoria.length > 0 ? (
                      editProductosFiltradosPorCategoria.map(producto => (
                        <div key={producto.id} className={crearPedidoStyles.productItem}>
                          <div className={crearPedidoStyles.productInfo}>
                            <strong>{producto.nombre}</strong>
                            <span>${(parseFloat(producto.precio_unitario.toString()) || 0).toFixed(2)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => addProductToEditingOrder(producto)}
                            className={crearPedidoStyles.addButtonSmall}
                          >
                            Añadir
                          </button>
                        </div>
                      ))
                    ) : (
                      <p>No hay productos disponibles en esta categoría.</p>
                    )}
                  </div>
                </div>

                <div className={crearPedidoStyles.currentOrderPanel}>
                  <h2>Productos del Pedido</h2>
                  <div className={crearPedidoStyles.orderItemsList}>
                    {editingPedidoItems.length === 0 ? (
                      <p className={crearPedidoStyles.emptyOrderText}>No hay productos en el pedido.</p>
                    ) : (
                      editingPedidoItems.map(item => (
                        <div key={item.id} className={crearPedidoStyles.orderItem}>
                          <div className={crearPedidoStyles.orderItemInfo}>
                            <strong>{item.nombre}</strong>
                            <span>${(parseFloat(item.precio_unitario.toString()) || 0).toFixed(2)} c/u</span>
                          </div>
                          <div className={crearPedidoStyles.orderItemControls}>
                            <button
                              type="button"
                              onClick={() => updateEditingItemQuantity(item.id, item.cantidad - 1)}
                              className={crearPedidoStyles.quantityButton}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.cantidad}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => updateEditingItemQuantity(item.id, parseInt(e.target.value) || 1)}
                              className={crearPedidoStyles.quantityInput}
                            />
                            <button
                              type="button"
                              onClick={() => updateEditingItemQuantity(item.id, item.cantidad + 1)}
                              className={crearPedidoStyles.quantityButton}
                            >
                              +
                            </button>
                          </div>
                          <span className={crearPedidoStyles.orderItemSubtotal}>${(parseFloat(item.subtotal.toString()) || 0).toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => removeProductFromEditingOrder(item.id)}
                            className={crearPedidoStyles.deleteItemButton}
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className={crearPedidoStyles.orderSummary}>
                    <div className={crearPedidoStyles.totalDisplay}>
                      <strong>TOTAL: ${totalEditingPedido.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className={formStyles.formButtons}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className={formStyles.secondaryButton}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={formStyles.primaryButton}
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPedidosPage;