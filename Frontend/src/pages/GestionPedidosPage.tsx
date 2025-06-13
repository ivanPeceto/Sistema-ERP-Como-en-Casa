/**
 * @file GestionPedidosPage.tsx
 * @brief Componente para la gestión completa (CRUD) de pedidos.
 * @details
 * Este componente implementa la interfaz de usuario para la gestión y visualización de pedidos.
 * Permite listar pedidos, buscarlos por fecha y texto, y proporciona funcionalidades para:
 * 1. Ver los detalles de un pedido en un modal.
 * 2. Editar un pedido completo (hora, estado, productos) en un segundo modal.
 * 3. Cambiar rápidamente el estado de 'entregado' y 'pagado' desde la lista principal.
 * 4. Eliminar pedidos.
 * Orquesta la comunicación con los servicios de pedidos, clientes y productos.
 */


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import styles from '../styles/gestionPedidosPage.module.css';
import formStyles from '../styles/formStyles.module.css'; 
import crearPedidoStyles from '../styles/crearPedidoPage.module.css'; 

import { getPedidosByDate, editarPedido, deletePedido } from '../services/pedido_service';
import { getClientes } from '../services/client_service';
import { getProductos } from '../services/product_service'; 
import type { Pedido, PedidoInput, PedidoItem, Cliente, Producto} from '../types/models.d.ts';

/**
 * @brief Componente funcional para la página de gestión de pedidos.
 * @returns {React.ReactElement} El JSX que renderiza la página.
 */
const GestionPedidosPage: React.FC = () => {
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

    /**
   * @brief Carga todos los datos iniciales necesarios para la página.
   * @details Utiliza `Promise.all` para cargar pedidos, clientes y productos en paralelo, mejorando el rendimiento.
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
      setClientes([]);
      setProductos([]);
      alert('Error al cargar datos iniciales. Verifique la conexión con el backend.');
    } finally {
      setIsLoading(false);
    }
  }, [searchDate]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  /** @brief Crea un mapa de `id` de cliente a `nombre` para evitar búsquedas repetitivas. */
  const clienteNombreMap = useMemo(() => {
    return new Map(clientes.map(cliente => [cliente.id, cliente.nombre]));
  }, [clientes]);

  /** @brief Filtra la lista principal de pedidos basándose en el `searchTerm`. */
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

  /** @brief Obtiene una lista de nombres de categorías únicas para el modal de edición. */  
  const editCategoriasUnicas = useMemo(() =>
    [...new Set(productos.map(p => p.categoria?.nombre || 'Sin Categoría'))],
    [productos]
  );

  /** @brief Filtra los productos disponibles para añadir en el modal de edición según la categoría seleccionada. */
  const editProductosFiltradosPorCategoria = useMemo(() => {
    if (!editCategoriaSeleccionada) return [];
    return productos.filter(p => (p.categoria?.nombre || 'Sin Categoría') === editCategoriaSeleccionada && p.disponible);
  }, [editCategoriaSeleccionada, productos]);

  /** @brief Calcula el total del pedido que se está editando en tiempo real. */  
  const totalEditingPedido = useMemo(() => {
    return editingPedidoItems.reduce((total, item) => total + (parseFloat(item.cantidad.toString()) * (parseFloat(item.precio_unitario.toString()) || 0)), 0);
  }, [editingPedidoItems]);

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
   * @brief Abre el modal de "Editar Pedido" y carga los datos del pedido seleccionado en los estados del formulario.
   * @param {Pedido} pedido El pedido que se va a editar.
   */
  const openEditModal = useCallback((pedido: Pedido) => {
    setEditingPedido(pedido);
    setEditFormData({
      para_hora: pedido.para_hora,
      entregado: pedido.entregado,
      pagado: pedido.pagado,
    });
    setEditingPedidoItems(pedido.productos_detalle.map(item => ({
      id: item.id_producto, 
      nombre: item.nombre_producto,
      cantidad: parseFloat(item.cantidad_producto.toString()) || 0, 
      precio_unitario: parseFloat(item.precio_unitario.toString()) || 0, 
      subtotal: (parseFloat(item.cantidad_producto.toString()) * (parseFloat(item.precio_unitario.toString()) || 0)) || 0, // Aseguramos que sea número
    })));
    setIsEditModalOpen(true);
  }, []);

  /** @brief Cierra el modal de "Editar Pedido" y resetea los estados del formulario. */  
  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingPedido(null);
    setEditFormData({});
    setEditingPedidoItems([]);
  }, []);

  /** @brief Maneja los cambios en los inputs del formulario de edición. */  
  const handleEditInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  /** @brief Añade un producto a la lista de ítems del pedido en edición. */
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

  /** @brief Elimina un producto de la lista de ítems del pedido en edición. */  
  const removeProductFromEditingOrder = useCallback((productId: number) => {
    setEditingPedidoItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  /** @brief Actualiza la cantidad de un producto en la lista de ítems del pedido en edición. */
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


  /**
   * @brief Maneja el envío del formulario del modal de edición.
   * @param {FormEvent<HTMLFormElement>} event El evento de envío del formulario.
   */
  const handleEditSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPedido) return;

    if (editingPedidoItems.length === 0) {
      alert('El pedido no puede estar vacío. Por favor, añada al menos un producto.');
      return;
    }

    try {
      const payload = prepareUpdatePayload(editingPedido, editFormData, editingPedidoItems);

      await editarPedido(
        { fecha: editingPedido.fecha_pedido, numero: editingPedido.numero_pedido },
        payload
      );
      alert('Pedido actualizado exitosamente.');
      closeEditModal();
      fetchInitialData(); // Recargar todos los datos para reflejar los cambios
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      alert('Ocurrió un error al actualizar el pedido. Por favor, intente de nuevo.');
    }
  }, [editingPedido, editFormData, editingPedidoItems, prepareUpdatePayload, closeEditModal, fetchInitialData]);

  /**
   * @brief Maneja el cambio rápido de estado entregado desde la lista principal.
   * @param {Pedido} pedido El pedido a modificar.
   * @param {Partial<Pedido>} update El cambio de estado a aplicar.
   */
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
      alert('No se pudo actualizar el estado del pedido.');
    }
  }, [fetchInitialData, prepareUpdatePayload]);

  /**
   * @brief Maneja el cambio rápido de estado pagado desde la lista principal.
   * @param {Pedido} pedido El pedido a modificar.
   * @param {Partial<Pedido>} update El cambio de estado a aplicar.
   */
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
      alert('No se pudo actualizar el estado del pedido.');
    }
  }, [fetchInitialData, prepareUpdatePayload]);

  /**
   * @brief Maneja la eliminación de un pedido, con confirmación previa.
   * @param {Pedido} pedido El pedido a eliminar.
   */
  const handleDeletePedido = useCallback(async (pedido: Pedido) => {
    if (window.confirm(`¿Confirma que desea eliminar el Pedido #${pedido.numero_pedido}? Esta acción es irreversible.`)) {
      try {
        await deletePedido({
          fecha: pedido.fecha_pedido,
          numero: pedido.numero_pedido
        });
        fetchInitialData();
      } catch (error) {
        console.error(`Error al eliminar pedido ${pedido.id}:`, error);
        alert('No se pudo eliminar el pedido.');
      }
    }
  }, [fetchInitialData]);

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
                {/* Nuevo botón de Editar */}
                <button onClick={() => openEditModal(pedido)} className={styles.editButton}>Editar</button>
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

                <div className={formStyles.formField}>
                  <label className={formStyles.formLabel} htmlFor="para_hora">Hora de Entrega (HH:MM)</label>
                  <input
                    type="time"
                    id="para_hora"
                    name="para_hora"
                    value={editFormData.para_hora || ''}
                    onChange={handleEditInputChange}
                    className={formStyles.formInput}
                  />
                </div>

                <div className={formStyles.formField}>
                  <input
                    type="checkbox"
                    id="entregado"
                    name="entregado"
                    checked={editFormData.entregado || false}
                    onChange={handleEditInputChange}
                    className={formStyles.formCheckbox}
                  />
                  <label htmlFor="entregado" className={formStyles.formLabel}>Pedido Entregado</label>
                </div>

                <div className={formStyles.formField}>
                  <input
                    type="checkbox"
                    id="pagado"
                    name="pagado"
                    checked={editFormData.pagado || false}
                    onChange={handleEditInputChange}
                    className={formStyles.formCheckbox}
                  />
                  <label htmlFor="pagado" className={formStyles.formLabel}>Pedido Pagado</label>
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
                            <span>${(parseFloat(producto.precio_unitario.toString()) || 0)}</span>
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
                            <span>${(parseFloat(item.precio_unitario.toString()) || 0)} c/u</span>
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
                          <span className={crearPedidoStyles.orderItemSubtotal}>${(parseFloat(item.subtotal.toString()) || 0)}</span>
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
                      <strong>TOTAL: ${totalEditingPedido}</strong>
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