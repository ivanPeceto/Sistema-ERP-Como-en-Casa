/**
 * @file GestionPedidosPage.tsx
 * @description Este componente implementa la interfaz de usuario para la gestión y visualización de pedidos.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import styles from '../styles/gestionPedidosPage.module.css';
import formStyles from '../styles/formStyles.module.css'; // Importamos estilos de formulario
import crearPedidoStyles from '../styles/crearPedidoPage.module.css'; // Importamos estilos de CrearPedidoPage para reutilizar

// --- Servicios y Tipos ---
import { getPedidosByDate, editarPedido, deletePedido } from '../services/pedido_service';
import { getClientes } from '../services/client_service';
import type { Cliente } from '../types/models';
import { getProductos } from '../services/product_service'; // Importamos getProductos
import type { Producto } from '../types/models.d.ts';
import type { Pedido, PedidoInput, PedidoItem } from '../types/models.d.ts';


const GestionPedidosPage: React.FC = () => {
  // --- Estados del Componente ---
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]); // Nuevo: Estado para productos
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchDate, setSearchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Modal para ver detalles
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false); // Nuevo: Modal para editar
  const [viewingPedido, setViewingPedido] = useState<Pedido | null>(null);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null); // Nuevo: Pedido en edición
  const [editFormData, setEditFormData] = useState<Partial<Pedido>>({}); // Nuevo: Datos del formulario de edición (para hora, entregado, pagado)
  const [editingPedidoItems, setEditingPedidoItems] = useState<PedidoItem[]>([]); // Nuevo: Productos del pedido en edición
  const [editCategoriaSeleccionada, setEditCategoriaSeleccionada] = useState<string>(''); // Nuevo: Categoría seleccionada en el modal de edición
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- Lógica de Carga de Datos ---
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pedidosData, clientesData, productosData] = await Promise.all([
        getPedidosByDate(searchDate),
        getClientes(),
        getProductos() // Cargar productos
      ]);
      setPedidos(pedidosData);
      setClientes(clientesData);
      setProductos(productosData);
      if (productosData.length > 0) {
        const categoriasUnicas = [...new Set(productosData.map(p => p.categoria?.nombre || 'Sin Categoría'))];
        if (categoriasUnicas.length > 0) {
          setEditCategoriaSeleccionada(categoriasUnicas[0]); // Establecer la primera categoría para la edición
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

  // Nuevo: Categorías únicas para el modal de edición
  const editCategoriasUnicas = useMemo(() =>
    [...new Set(productos.map(p => p.categoria?.nombre || 'Sin Categoría'))],
    [productos]
  );

  // Nuevo: Productos filtrados por categoría para el modal de edición
  const editProductosFiltradosPorCategoria = useMemo(() => {
    if (!editCategoriaSeleccionada) return [];
    return productos.filter(p => (p.categoria?.nombre || 'Sin Categoría') === editCategoriaSeleccionada && p.disponible);
  }, [editCategoriaSeleccionada, productos]);

  // Nuevo: Calcular el total del pedido en edición
  const totalEditingPedido = useMemo(() => {
    // Aseguramos que la suma siempre sea un número, usando parseFloat y un valor por defecto de 0
    return editingPedidoItems.reduce((total, item) => total + (parseFloat(item.cantidad.toString()) * (parseFloat(item.precio_unitario.toString()) || 0)), 0);
  }, [editingPedidoItems]);

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

  // Nuevo: Abre el modal de edición
  const openEditModal = useCallback((pedido: Pedido) => {
    setEditingPedido(pedido);
    setEditFormData({
      para_hora: pedido.para_hora,
      entregado: pedido.entregado,
      pagado: pedido.pagado,
    });
    // Convertir productos_detalle a PedidoItem para la edición
    setEditingPedidoItems(pedido.productos_detalle.map(item => ({
      id: item.id_producto, // Usamos id_producto como id para PedidoItem
      nombre: item.nombre_producto,
      cantidad: parseFloat(item.cantidad_producto.toString()) || 0, // Aseguramos que sea número
      precio_unitario: parseFloat(item.precio_unitario.toString()) || 0, // Aseguramos que sea número
      subtotal: (parseFloat(item.cantidad_producto.toString()) * (parseFloat(item.precio_unitario.toString()) || 0)) || 0, // Aseguramos que sea número
    })));
    setIsEditModalOpen(true);
  }, []);

  // Nuevo: Cierra el modal de edición
  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingPedido(null);
    setEditFormData({});
    setEditingPedidoItems([]);
  }, []);

  // Nuevo: Maneja los cambios en los inputs del formulario de edición (hora, checkboxes)
  const handleEditInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Nuevo: Agregar producto al pedido en edición
  const addProductToEditingOrder = useCallback((product: Producto) => {
    setEditingPedidoItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      const productPrice = parseFloat(product.precio_unitario.toString()) || 0; // Aseguramos que sea número
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

  // Nuevo: Eliminar producto del pedido en edición
  const removeProductFromEditingOrder = useCallback((productId: number) => {
    setEditingPedidoItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  // Nuevo: Actualizar cantidad de producto en el pedido en edición
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
      precio_unitario: parseFloat(item.precio_unitario.toString()) || 0, // Aseguramos que sea número
    }));

    return {
      numero_pedido: pedido.numero_pedido,
      fecha_pedido: pedido.fecha_pedido,
      id_cliente: pedido.id_cliente,
      // Usamos el valor del formulario si está definido, de lo contrario, el valor original del pedido
      para_hora: updates.para_hora !== undefined ? updates.para_hora : pedido.para_hora,
      entregado: updates.entregado !== undefined ? updates.entregado : pedido.entregado,
      pagado: updates.pagado !== undefined ? updates.pagado : pedido.pagado,
      productos: productosParaEnviar,
    };
  }, []);


  // Nuevo: Maneja el envío del formulario de edición
  const handleEditSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPedido) return;

    if (editingPedidoItems.length === 0) {
      console.error('El pedido no puede estar vacío. Añada al menos un producto.');
      return;
    }

    try {
      const payload = prepareUpdatePayload(editingPedido, editFormData, editingPedidoItems);

      await editarPedido(
        { fecha: editingPedido.fecha_pedido, numero: editingPedido.numero_pedido },
        payload
      );
      console.log('Pedido actualizado exitosamente');
      closeEditModal();
      fetchInitialData(); 
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
    }
  }, [editingPedido, editFormData, editingPedidoItems, prepareUpdatePayload, closeEditModal, fetchInitialData]);


  const handleToggleEntregado = useCallback(async (pedido: Pedido) => {
    try {
      const payload = prepareUpdatePayload(pedido, { entregado: !pedido.entregado }, pedido.productos_detalle.map(item => ({
        id: item.id_producto,
        nombre: item.nombre_producto,
        cantidad: item.cantidad_producto,
        // Ensure price is a number before passing
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
      alert('No se pudo actualizar el estado del pedido.'); 
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
    try {
      await deletePedido({ fecha: pedido.fecha_pedido, numero: pedido.numero_pedido });
      fetchInitialData();
    } catch (error) {
      console.error(`Error al eliminar pedido ${pedido.id}:`, error);
    }
  }, [fetchInitialData]);

  // Categorizar los pedidos
  const pedidosPendientes = useMemo(() => 
    filteredPedidos.filter(pedido => !pedido.entregado),
    [filteredPedidos]
  );

  const pedidosEntregados = useMemo(() => 
    filteredPedidos.filter(pedido => pedido.entregado),
    [filteredPedidos]
  );

  const pedidosPagados = useMemo(() => 
    filteredPedidos.filter(pedido => pedido.pagado),
    [filteredPedidos]
  );

  const pedidosNoPagados = useMemo(() => 
    filteredPedidos.filter(pedido => !pedido.pagado),
    [filteredPedidos]
  );

  const [activeTab, setActiveTab] = useState<'todos' | 'pendientes' | 'entregados' | 'pagados' | 'noPagados'>('todos');

  // Función para formatear la fecha
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

  // Función para renderizar la lista de pedidos
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

  // --- Renderizado del Componente ---
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

      {/* Contenido de la pestaña activa */}
      {activeTab === 'todos' && renderPedidosList(filteredPedidos)}
      {activeTab === 'pendientes' && renderPedidosList(pedidosPendientes)}
      {activeTab === 'entregados' && renderPedidosList(pedidosEntregados)}
      {activeTab === 'pagados' && renderPedidosList(pedidosPagados)}
      {activeTab === 'noPagados' && renderPedidosList(pedidosNoPagados)}

      {/* Modal para ver detalles del pedido (existente) */}
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

      {/* Nuevo Modal para Editar Pedido */}
      {isEditModalOpen && editingPedido && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContentWide}> {/* Usamos una clase CSS para un modal más ancho */}
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
                      className={`${formStyles.formInput} ${styles.editTimeInput}`} /* styles.editTimeInput added here */
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

              {/* Sección de Productos para Edición */}
              <div className={styles.editModalProductsSection}>
                <div className={crearPedidoStyles.productSelectionPanel}> {/* Reutilizamos estilos */}
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
                            {/* Ensure price is a number before calling toFixed */}
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

                <div className={crearPedidoStyles.currentOrderPanel}> {/* Reutilizamos estilos */}
                  <h2>Productos del Pedido</h2>
                  <div className={crearPedidoStyles.orderItemsList}>
                    {editingPedidoItems.length === 0 ? (
                      <p className={crearPedidoStyles.emptyOrderText}>No hay productos en el pedido.</p>
                    ) : (
                      editingPedidoItems.map(item => (
                        <div key={item.id} className={crearPedidoStyles.orderItem}>
                          <div className={crearPedidoStyles.orderItemInfo}>
                            <strong>{item.nombre}</strong>
                            {/* Ensure price is a number before calling toFixed */}
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
                          {/* Ensure subtotal is a number before calling toFixed */}
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
                      {/* Ensure totalEditingPedido is a number before calling toFixed */}
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