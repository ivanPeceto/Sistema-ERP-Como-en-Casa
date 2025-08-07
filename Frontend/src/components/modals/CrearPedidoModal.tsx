import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import type { ChangeEvent } from 'react';
import styles from './CrearPedidoModal.module.css';
import modalStyles from '../../styles/modalStyles.module.css'; 

import { createPedido, getPedidosByDate } from '../../services/pedido_service';
import { getProductos } from '../../services/product_service';
import type { Producto, PedidoItem, PedidoInput, PedidoEstado } from '../../types/models.d.ts';

interface CrearPedidoModalProps {
  isOpen: boolean; 
  onClose: () => void; 
  productos: Producto[];
  fetchInitialDataParent: () => void; 
}

const CrearPedidoModal: React.FC<CrearPedidoModalProps> = ({ isOpen, onClose, productos, fetchInitialDataParent }) => {
  const [clienteInput, setClienteInput] = useState<string>(''); 
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([]);
  const [paraHora, setParaHora] = useState<string>(''); 
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const resetModalState = useCallback(() => {
    setClienteInput('');
    setPedidoItems([]);
    setParaHora('');
    setError(null);
    setIsLoading(false);

    if (productos.length > 0) {
      const categoriasUnicas = [...new Set(productos.map(p => p.categoria?.nombre || 'Sin Categoría'))];
      if (categoriasUnicas.length > 0) {
        setCategoriaSeleccionada(categoriasUnicas[0]);
      } else {
        setCategoriaSeleccionada('');
      }
    } else {
      setCategoriaSeleccionada('');
    }
  }, [productos]);
  
  useEffect(() => {
    if (isOpen) {
      resetModalState();
    }
  }, [isOpen, resetModalState]);

  useEffect(() => {
    if (productos.length > 0 && !categoriaSeleccionada) {
      const categoriasUnicas = [...new Set(productos.map(p => p.categoria?.nombre || 'Sin Categoría'))];
      if (categoriasUnicas.length > 0) {
        setCategoriaSeleccionada(categoriasUnicas[0]);
      }
    }
  }, [productos, categoriaSeleccionada]);

  /** @brief Extrae una lista de nombres de categorías únicas a partir de los productos. */
  const categoriasUnicas = useMemo(() =>
    [...new Set(productos.map(p => p.categoria?.nombre || 'Sin Categoría'))],
  [productos]);

  /** @brief Filtra los productos que se muestran basándose en la categoría seleccionada. */
  const productosFiltradosPorCategoria = useMemo(() => {
    if (!categoriaSeleccionada) return [];
    return productos.filter(p => (p.categoria?.nombre || 'Sin Categoría') === categoriaSeleccionada && p.disponible);
  }, [categoriaSeleccionada, productos]);

  /** @brief Calcula el total del pedido actual cada vez que la lista de ítems cambia. */
  const totalPedido = useMemo(() => {
    return pedidoItems.reduce((total, item) => total + (item.subtotal || 0), 0);
  }, [pedidoItems]);

  /** @brief Elimina un ítem del pedido actual. */
  const eliminarItemDelPedido = useCallback((productoId: number) => {
    setPedidoItems(prevItems => prevItems.filter(item => item.id !== productoId));
  }, []);

  /** @brief Actualiza la cantidad de un ítem en el pedido. Si la cantidad es < 1, lo elimina. */
  const actualizarCantidadItem = useCallback((productoId: number, cantidad: number) => {
    if (cantidad < 0) {
      eliminarItemDelPedido(productoId);
      return;
    }
    setPedidoItems(prevItems =>
      prevItems.map(item =>
        item.id === productoId
          ? { ...item, cantidad, subtotal: Number((cantidad * (Number(item.precio_unitario) || 0))) }
          : item
      )
    );
  }, [eliminarItemDelPedido]);

  /** @brief Actualiza la aclaración de un ítem de producto en el pedido. */
  const updateItemAclaraciones = useCallback((productoId: number, aclaracion: string) => {
    setPedidoItems(prevItems =>
      prevItems.map(item =>
        item.id === productoId
          ? { ...item, aclaraciones: aclaracion }
          : item
      )
    );
  }, []);

  /** @brief Añade un producto al pedido o incrementa su cantidad si ya existe. */
  const agregarProductoAlPedido = useCallback((producto: Producto) => {
    setPedidoItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === producto.id);
      const precioUnitario = Number(producto.precio_unitario) || 0;
      
      if (existingItem) {
        const nuevaCantidad = existingItem.cantidad + 1;
        return prevItems.map(item =>
          item.id === producto.id
            ? { 
                ...item, 
                cantidad: nuevaCantidad, 
                subtotal: Number((nuevaCantidad * precioUnitario))
              }
            : item
        );
      } else {
        return [
          ...prevItems, 
          { 
            ...producto, 
            cantidad: 1, 
            precio_unitario: precioUnitario,
            subtotal: Number(precioUnitario),
            aclaraciones: '' 
          }
        ];
      }
    });
  }, []);

  const handleParaHoraChange = (e: ChangeEvent<HTMLInputElement>) => {
    setParaHora(e.target.value);
  };

  /**
   * @brief Maneja la confirmación final y envío del pedido al backend.
   * @details Valida que haya un cliente y productos, calcula el número de pedido secuencial
   * para el día, construye el payload y llama al servicio `createPedido`.
   */
  const handleConfirmarPedido = async () => {
    if (!clienteInput.trim()) {
      setError('Debe ingresar un nombre de cliente para el pedido.');
      return;
    }
    if (pedidoItems.length === 0) {
      setError('El pedido no puede estar vacío. Añada al menos un producto.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Los meses son 0-indexados
      const day = today.getDate().toString().padStart(2, '0');
      const hoy = `${year}-${month}-${day}`;
      const pedidosDeHoy = await getPedidosByDate(hoy);
      const nuevoNumeroPedido: number =  (pedidosDeHoy.length === 0)? 1 : pedidosDeHoy[pedidosDeHoy.length-1].numero_pedido + 1;

      const pedidoData: PedidoInput = {
        numero_pedido: nuevoNumeroPedido,
        fecha_pedido: hoy,
        //Deprecated
        id_cliente: 1,
        //
        cliente: clienteInput.trim(), 
        para_hora: paraHora || null,
        estado: 'PENDIENTE', 
        avisado: false, 
        //Deprecated
        entregado: false,
        // 
        pagado: false, 
        productos: pedidoItems.map(item => ({
          id_producto: item.id,
          nombre_producto: item.nombre,
          cantidad_producto: item.cantidad,
          precio_unitario: item.precio_unitario,
          aclaraciones: item.aclaraciones || '', 
        })),
      };

      await createPedido(pedidoData);

      setPedidoItems([]);
      setClienteInput('');
      setParaHora(''); 
      onClose(); 
      fetchInitialDataParent(); 
    } catch (err) {
      console.error("Error al confirmar el pedido:", err);
      setError('Error al confirmar el pedido. Intente de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
        </div>
        
        {isLoading && <div className={modalStyles.loadingContainer}><p>Creando pedido...</p></div>}
        {/**{error && <div className={modalStyles.error}>{error}</div>}*/}

        <div className={styles.modalBody}>
          <div className={styles.createModalGrid}>
            {/* Panel de información del pedido (Cliente y Hora de Entrega) */}
            <div className={styles.clientSelectionPanel}>
              <h2>Información del Pedido</h2>
              
              <div className={[modalStyles.formGroup, styles.clientForm].join(" ")}>
                <div className={styles.formRowElement}>
                    <label className={modalStyles.formLabel} htmlFor="clienteInput">Cliente</label>
                    <input
                      type="text"
                      id="clienteInput"
                      name="clienteInput"
                      value={clienteInput}
                      onChange={(e) => setClienteInput(e.target.value)}
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
                    value={paraHora}
                    onChange={handleParaHoraChange}
                    className={`${modalStyles.formControl} ${modalStyles.timeInput}`}
                  />
                </div>
                
              </div>


              
              <div className={styles.orderItemsList}>
                {pedidoItems.length === 0 ? (
                  <p className={styles.emptyOrderText}>Aún no hay productos en el pedido.</p>
                ) : (
                  pedidoItems.map(item => (
                    <div key={item.id} className={styles.orderItem}>

                      <div className={styles.orderItemControls}>
                        <button onClick={() => actualizarCantidadItem(item.id, item.cantidad - 1)} className={styles.quantityButton}>-</button>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.cantidad}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => actualizarCantidadItem(item.id, parseFloat(e.target.value))}
                            className={styles.quantityInput}
                        />

                        <button onClick={() => actualizarCantidadItem(item.id, item.cantidad + 1)} className={styles.quantityButton}>+</button>
                        
                      </div>

                      <div className={styles.orderItemInfo}>

                        <strong>{item.nombre}</strong>                        
                        <textarea
                          placeholder="Aclaraciones..."
                          value={item.aclaraciones || ''}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateItemAclaraciones(item.id, e.target.value)}
                          className={styles.aclaracionesInput}
                        ></textarea>

                      </div>

                      <div>
                        
                        <span className={styles.orderItemSubtotal}>${(item.subtotal || 0)}</span>
                        
                        <button onClick={() => eliminarItemDelPedido(item.id)} className={styles.deleteItemButton}>×</button>

                      </div>

                    </div>
                  ))
                )}
              </div>

              {pedidoItems.length > 0 && (
                <div className={styles.orderSummary}>
                  <div className={styles.totalDisplay}>
                    <strong>TOTAL: ${totalPedido}</strong>
                  </div>
                </div>
              )}
            </div>
            
            {/* Panel de selección de productos */}
            <div className={styles.productSelectionPanel}>
              <h2>Seleccionar Productos</h2>
              <div className={styles.categoryTabs}>
                {(categoriasUnicas || []).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.categoryTab} ${categoriaSeleccionada === cat ? styles.activeTab : ''}`}
                    onClick={() => setCategoriaSeleccionada(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className={styles.productList}>
                {productosFiltradosPorCategoria.length > 0 ? (
                  productosFiltradosPorCategoria.map(producto => (
                    <div key={producto.id} className={styles.productItem}>
                      <div className={styles.productInfo}>
                        <button
                        onClick={() => agregarProductoAlPedido(producto)}
                        className={styles.addButtonSmall}
                        >
                          Añadir
                        </button>
                        <strong>{producto.nombre}</strong>
                        <span>${(producto.precio_unitario || 0)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={modalStyles.centeredText}>No hay productos disponibles en esta categoría.</p>
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
            onClick={handleConfirmarPedido}
            className={`${modalStyles.modalButton} ${modalStyles.modalButtonPrimary}`}
            disabled={isLoading || !clienteInput.trim() || pedidoItems.length === 0}
          >
            <i className={`fas fa-save ${modalStyles.iconMarginRight}`}></i>
            Guardar Pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearPedidoModal;