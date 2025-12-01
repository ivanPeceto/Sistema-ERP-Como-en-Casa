// src/components/modals/EditarPedidoModal.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import styles from './CrearPedidoModal.module.css'; // Usamos los mismos estilos base
import modalStyles from '../../../styles/modalStyles.module.css';
import { editarPedido } from '../../../services/pedido_service.ts';
import type { Producto, Pedido, PedidoInput, PedidoItem } from '../../../types/models.ts';

// Define las props que el modal va a recibir
interface EditarPedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPedido: Pedido | null; // El pedido que se va a editar
  productos: Producto[]; // La lista de productos disponibles
  fetchInitialDataParent: () => void;
}

const EditarPedidoModal: React.FC<EditarPedidoModalProps> = ({ isOpen, onClose, editingPedido, productos, fetchInitialDataParent }) => {
  const [editFormData, setEditFormData] = useState<Partial<PedidoInput>>({});
  const [editingPedidoItems, setEditingPedidoItems] = useState<PedidoItem[]>([]);
  const [editCategoriaSeleccionada, setEditCategoriaSeleccionada] = useState<string>('');
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Efecto para inicializar los estados cuando el modal se abre
  useEffect(() => {
    if (isOpen && editingPedido) {
      setEditFormData({
        cliente: editingPedido.cliente || '',
        para_hora: editingPedido.para_hora,
        estado: editingPedido.estado,
        avisado: editingPedido.avisado,
        pagado: editingPedido.pagado,
        entregado: editingPedido.entregado,
      });
      setEditingPedidoItems(editingPedido.productos_detalle.map(item => ({
        id: item.id_producto,
        nombre: item.nombre_producto,
        precio_unitario: parseFloat(item.precio_unitario.toString()) || 0,
        cantidad: parseFloat(item.cantidad_producto.toString()) || 0,
        subtotal: (parseFloat(item.cantidad_producto.toString()) * (parseFloat(item.precio_unitario.toString()) || 0)) || 0,
        aclaraciones: item.aclaraciones || '',
      })));
      setProductSearchTerm('');
    }
  }, [isOpen, editingPedido]);

  /** @brief Extrae las categorías únicas para el selector de productos. */
  const editCategoriasUnicas = useMemo(() =>
    [...new Set(productos.map(p => p.categoria?.nombre || 'Sin Categoría'))],
    [productos]
  );

  /** @brief Filtra los productos que se muestran basándose en la categoría seleccionada y término de búsqueda. */
  const productosFiltrados = useMemo(() => {
    if (!editCategoriaSeleccionada) return [];

    let results = productos.filter(p => 
      (p.categoria?.nombre || 'Sin categoría') === editCategoriaSeleccionada && p.disponible
    );
    
    if (productSearchTerm){
      const curatedInput = productSearchTerm.toLowerCase();
      results = results.filter(p => 
        p.nombre.toLowerCase().includes(curatedInput)
      );
    }
    return results;
  }, [editCategoriaSeleccionada, productos, productSearchTerm]);

  /** @brief Calcula el total del pedido. */
  const totalEditingPedido = useMemo(() => {
    return editingPedidoItems.reduce((total, item) => total + (parseFloat(item.cantidad.toString()) * (parseFloat(item.precio_unitario.toString()) || 0)), 0);
  }, [editingPedidoItems]);

  const handleEditInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    const inputValue = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value;
    
    setEditFormData(prev => ({
      ...prev,
      [name]: inputValue,
    }));
  };

  const getFechaISO = (dateString: string) => {
    return dateString.split('T')[0];
  };

  const updateEditingItemAclaraciones = useCallback((productId: number, aclaracion: string) => {
    setEditingPedidoItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, aclaraciones: aclaracion }
          : item
      )
    );
  }, []);

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
          subtotal: productPrice,
          aclaraciones: '',
        }];
      }
    });
  }, []);

  const removeProductFromEditingOrder = useCallback((productId: number) => {
    setEditingPedidoItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);
  
  const updateEditingItemQuantity = useCallback((productId: number, quantity: number) => {
    const parsedQuantity = parseFloat(quantity.toString());
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        return;
    }
    if (parsedQuantity === 0) {
        removeProductFromEditingOrder(productId);
        return;
    }
    setEditingPedidoItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, cantidad: parsedQuantity, subtotal: Number((parsedQuantity * (parseFloat(item.precio_unitario.toString()) || 0)).toFixed(2)) }
          : item
      )
    );
  }, [removeProductFromEditingOrder]);

  const prepareUpdatePayload = useCallback((pedido: Pedido, updates: Partial<PedidoInput>, currentItems: PedidoItem[]): PedidoInput => {
    const productosParaEnviar = currentItems.map(item => ({
      id_producto: item.id,
      nombre_producto: item.nombre,
      cantidad_producto: item.cantidad,
      precio_unitario: parseFloat(item.precio_unitario.toString()) || 0,
      aclaraciones: item.aclaraciones || '',
    }));

    return {
      numero_pedido: pedido.numero_pedido,
      fecha_pedido: getFechaISO(pedido.fecha_pedido),
      cliente: updates.cliente !== undefined ? updates.cliente : pedido.cliente,
      para_hora: updates.para_hora !== undefined ? updates.para_hora : pedido.para_hora,
      estado: updates.estado !== undefined ? updates.estado : pedido.estado,
      avisado: updates.avisado !== undefined ? updates.avisado : pedido.avisado,
      entregado: updates.entregado !== undefined ? updates.entregado : pedido.entregado,
      pagado: updates.pagado !== undefined ? updates.pagado : pedido.pagado,
      productos: productosParaEnviar,
    };
  }, []);

  /** @brief Actualiza el estado del término de búsqueda de productos.  */
  const handleProductSearchTerm = (event: ChangeEvent<HTMLInputElement>) => {
    setProductSearchTerm(event.target.value)
  };

  const handleEditSubmit = useCallback(async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    if (!editingPedido) return;

    if (editingPedidoItems.length === 0) {
      console.error('El pedido no puede estar vacío. Añada al menos un producto.');
      setError('El pedido no puede estar vacío. Añada al menos un producto.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const payload = prepareUpdatePayload(editingPedido, editFormData, editingPedidoItems);
      await editarPedido(
        { fecha: getFechaISO(editingPedido.fecha_pedido), numero: editingPedido.numero_pedido },
        payload
      );
      onClose();
      fetchInitialDataParent();
    } catch (err) {
      console.error('Error al actualizar pedido:', err);
      setError('Error al actualizar el pedido. Intente de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  }, [editingPedido, editFormData, editingPedidoItems, prepareUpdatePayload, onClose, fetchInitialDataParent]);

  if (!isOpen || !editingPedido) return null;

  return (
    <div className={modalStyles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {isLoading && <div className={modalStyles.loadingContainer}><p>Guardando cambios...</p></div>}
        {error && <div className={modalStyles.error}>{error}</div>}

        <div className={styles.modalBody}>
          <div className={styles.createModalGrid}>
            
            {/* Panel Izquierdo: Información y Productos del Pedido */}
            <div className={styles.clientSelectionPanel}>
              <h2>Información del Pedido</h2>
              
              {/* --- Campos de Cliente y Hora --- */}
              <div className={[modalStyles.formGroup, styles.clientForm].join(" ")}>
                <div className={styles.formRowElement}>
                  <label className={modalStyles.formLabel} htmlFor="cliente">Cliente</label>
                  <input
                    type="text"
                    id="cliente"
                    name="cliente"
                    value={editFormData.cliente || ''}
                    onChange={handleEditInputChange}
                    className={modalStyles.formControl}
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div className={styles.formRowElement}>
                  <label className={modalStyles.formLabel} htmlFor="para_hora">Hora de Entrega</label>
                  <input
                    type="time"
                    id="para_hora"
                    name="para_hora"
                    value={editFormData.para_hora || ''}
                    onChange={handleEditInputChange}
                    className={`${modalStyles.formControl} ${modalStyles.timeInput}`}
                  />
                </div>
              </div>

              {/* --- Campos de Estado y Banderas --- */}
              <div className={[modalStyles.formGroup, styles.clientForm].join(" ")}>
                <div className={styles.formRowElement}>
                  <label className={modalStyles.formLabel}>Estado del Pedido</label>
                  <select
                    id="estado"
                    name="estado"
                    value={editFormData.estado || ''}
                    onChange={handleEditInputChange}
                    className={modalStyles.formControl}
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="LISTO">Listo</option>
                    <option value="ENTREGADO">Entregado</option>
                  </select>
                </div>
                <div className={styles.formRowElement}>
                  <label className={modalStyles.formLabel}>Estados Adicionales</label>
                  <div className={modalStyles.checkboxGroupContainer}>
                    {/**<div className={modalStyles.checkboxContainer}>
                      <input type="checkbox" id="pagado" name="pagado" checked={editFormData.pagado || false} onChange={handleEditInputChange} className={modalStyles.checkboxInput}/>
                      <label htmlFor="pagado" className={modalStyles.formLabel}>
                        <span className={`${modalStyles.statusBadge} ${editFormData.pagado ? modalStyles.statusPaid : modalStyles.statusUnpaid}`}>
                          <i className={`fas ${editFormData.pagado ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i> Pagado
                        </span>
                      </label>
                    </div> */}
                    <div className={modalStyles.checkboxContainer}>
                      <input type="checkbox" id="avisado" name="avisado" checked={editFormData.avisado || false} onChange={handleEditInputChange} className={modalStyles.checkboxInput}/>
                      <label htmlFor="avisado" className={modalStyles.formLabel}>
                        <span className={`${modalStyles.statusBadge} ${editFormData.avisado ? modalStyles.statusNotified : modalStyles.statusUnnotified}`}>
                          <i className={`fas ${editFormData.avisado ? 'fa-bell' : 'fa-bell-slash'}`}></i> Avisado
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Lista de Productos en el Pedido --- */}
              <div className={styles.orderItemsList}>
                {editingPedidoItems.length === 0 ? (
                  <div className={styles.emptyListContainer}>
                    <i className={`fas fa-inbox ${styles.emptyListIcon}`}></i>
                    <p>No hay productos en el pedido</p>
                    <p className={styles.emptyListMessage}>Agrega productos desde el panel derecho</p>
                  </div>
                ) : (
                  editingPedidoItems.map(item => (
                    <div key={item.id} className={styles.orderItem}>
                      <div className={styles.orderItemControls}>
                        <button onClick={() => updateEditingItemQuantity(item.id, item.cantidad - 1)} className={styles.quantityButton}>-</button>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.cantidad}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => updateEditingItemQuantity(item.id, parseFloat(e.target.value))}
                            className={styles.quantityInput}
                        />
                        <button onClick={() => updateEditingItemQuantity(item.id, item.cantidad + 1)} className={styles.quantityButton}>+</button>
                      </div>
                      <div className={styles.orderItemInfo}>
                        <strong>{item.nombre}</strong>
                        <textarea
                          placeholder="Aclaraciones..."
                          value={item.aclaraciones || ''}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateEditingItemAclaraciones(item.id, e.target.value)}
                          className={styles.aclaracionesInput}
                        ></textarea>
                      </div>
                      <div>
                        <span className={styles.orderItemSubtotal}>${(item.subtotal || 0).toFixed(2)}</span>
                        <button onClick={() => removeProductFromEditingOrder(item.id)} className={styles.deleteItemButton}>×</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* --- Resumen del Pedido con Total --- */}
              {editingPedidoItems.length > 0 && (
                <div className={styles.orderSummary}>
                  <div className={styles.totalDisplay}>
                    <strong>TOTAL: ${totalEditingPedido.toFixed(2)}</strong>
                  </div>
                </div>
              )}
            </div>
            
            {/* Panel Derecho: Selección de Productos */}
            <div className={styles.productSelectionPanel}>
              <h2>Añadir Productos</h2>
              <div className={styles.productSearchContainer}>
                <input
                  type="text"
                  placeholder="Buscar producto en esta categoría..."
                  value={productSearchTerm}
                  onChange={handleProductSearchTerm}
                  className={styles.productSearchInput}
                />
              </div>
              <div className={styles.categoryTabs}>
                {(editCategoriasUnicas || []).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.categoryTab} ${editCategoriaSeleccionada === cat ? styles.activeTab : ''}`}
                    onClick={() => setEditCategoriaSeleccionada(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className={styles.productList}>
                {productosFiltrados.length > 0 ? (
                  productosFiltrados.map(producto => (
                    <div key={producto.id} className={styles.productItem}>
                      <div className={styles.productInfo}>
                        <button
                          type="button"
                          onClick={() => addProductToEditingOrder(producto)}
                          className={styles.addButtonSmall}
                        >
                          Añadir
                        </button>
                        <strong>{producto.nombre}</strong>
                        <span>${(parseFloat(producto.precio_unitario.toString()) || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={modalStyles.centeredText}>No hay productos en esta categoría.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className={modalStyles.modalFooter}>
          <button
            type="button"
            onClick={onClose}
            className={`${modalStyles.modalButton} ${modalStyles.modalButtonSecondary}`}
            disabled={isLoading}
          >
            <i className={`fas fa-times ${modalStyles.iconMarginRight}`}></i>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleEditSubmit}
            className={`${modalStyles.modalButton} ${modalStyles.modalButtonPrimary}`}
            disabled={isLoading || editingPedidoItems.length === 0}
          >
            <i className={`fas fa-save ${modalStyles.iconMarginRight}`}></i>
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarPedidoModal;