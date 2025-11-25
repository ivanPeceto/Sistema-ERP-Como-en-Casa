import React, { useState, useEffect, useCallback, useMemo, type ChangeEvent } from 'react';
import styles from './CrearPedidoModal.module.css';
import modalStyles from '../../../styles/modalStyles.module.css';
import { createPedido, getPedidosByDate } from '../../../services/pedido_service';
import { getClientes } from '../../../services/client_service';
import type { Producto, PedidoItem, PedidoInput, Cliente } from '../../../types/models.d.ts';

interface CrearPedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
}

const CrearPedidoModal: React.FC<CrearPedidoModalProps> = ({ isOpen, onClose, productos }) => {
  /** Estados de pedido */
  const [clienteInput, setClienteInput] = useState<string>('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([]);
  const [paraHora, setParaHora] = useState<string>('');
  const [productSearchTerm, setPruductSearchTerm] = useState<string>('');

  /** Estados de UI */
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  /** Obtener clientes desde la API */
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await getClientes();
        setClientes(data);
      } catch (err) {
        console.error("Error al cargar clientes", err);
      }
    };
    fetchClientes();
  }, []);

  /** Reset modal */
  const resetModalState = useCallback(() => {
    setClienteInput('');
    setClienteSeleccionado(null);
    setPedidoItems([]);
    setParaHora('');
    setError(null);
    setIsLoading(false);
    setPruductSearchTerm('');

    if (productos.length > 0) {
      const categoriasUnicas = [...new Set(productos.map(p => p.categoria?.nombre || 'Sin Categoría'))];
      setCategoriaSeleccionada(categoriasUnicas[0] || '');
    } else {
      setCategoriaSeleccionada('');
    }
  }, [productos]);

  useEffect(() => {
    if (isOpen) resetModalState();
  }, [isOpen, resetModalState]);

  /** Categorías únicas */
  const categoriasUnicas = useMemo(() =>
    [...new Set(productos.map(p => p.categoria?.nombre || 'Sin Categoría'))],
    [productos]
  );

  /** Filtrar productos por categoría y búsqueda */
  const productosFiltrados = useMemo(() => {
    if (!categoriaSeleccionada) return [];
    let results = productos.filter(p =>
      (p.categoria?.nombre || 'Sin categoría') === categoriaSeleccionada && p.disponible
    );
    if (productSearchTerm) {
      const term = productSearchTerm.toLowerCase();
      results = results.filter(p => p.nombre.toLowerCase().includes(term));
    }
    return results;
  }, [categoriaSeleccionada, productos, productSearchTerm]);

  /** Calcular total del pedido */
  const totalPedido = useMemo(() => pedidoItems.reduce((total, item) => total + (item.subtotal || 0), 0), [pedidoItems]);

  /** Funciones para manejo de items */
  const eliminarItemDelPedido = useCallback((productoId: number) => {
    setPedidoItems(prev => prev.filter(item => item.id !== productoId));
  }, []);

  const actualizarCantidadItem = useCallback((productoId: number, cantidad: number) => {
    if (cantidad < 0) {
      eliminarItemDelPedido(productoId);
      return;
    }
    setPedidoItems(prev =>
      prev.map(item =>
        item.id === productoId
          ? { ...item, cantidad, subtotal: Number(cantidad * (Number(item.precio_unitario) || 0)) }
          : item
      )
    );
  }, [eliminarItemDelPedido]);

  const updateItemAclaraciones = useCallback((productoId: number, aclaracion: string) => {
    setPedidoItems(prev => prev.map(item =>
      item.id === productoId
        ? { ...item, aclaraciones: aclaracion }
        : item
    ));
  }, []);

  const agregarProductoAlPedido = useCallback((producto: Producto) => {
    setPedidoItems(prev => {
      const existing = prev.find(i => i.id === producto.id);
      const precioUnitario = Number(producto.precio_unitario) || 0;
      if (existing) {
        const nuevaCantidad = existing.cantidad + 1;
        return prev.map(i =>
          i.id === producto.id
            ? { ...i, cantidad: nuevaCantidad, subtotal: Number(nuevaCantidad * precioUnitario) }
            : i
        );
      } else {
        return [...prev, { ...producto, cantidad: 1, precio_unitario: precioUnitario, subtotal: Number(precioUnitario), aclaraciones: '' }];
      }
    });
  }, []);

  /** Handlers de inputs */
  const handleProductSearchTerm = (e: ChangeEvent<HTMLInputElement>) => setPruductSearchTerm(e.target.value);
  const handleParaHoraChange = (e: ChangeEvent<HTMLInputElement>) => setParaHora(e.target.value);

  /** Confirmar pedido */
  const handleConfirmarPedido = async () => {
    // Validaciones iniciales
    if (!clienteSeleccionado) {
      setError('Debe seleccionar un cliente.');
      return;
    }
    if (pedidoItems.length === 0) {
      setError('El pedido no puede estar vacío.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fecha en formato YYYY-MM-DD
      const today = new Date();
      const hoy = today.toISOString().split('T')[0];

      // Obtener pedidos del día para asignar nuevo número
      const pedidosDeHoy = await getPedidosByDate(hoy);
      const ultimoNumero = pedidosDeHoy.length === 0 ? 0 : pedidosDeHoy[pedidosDeHoy.length - 1].numero_pedido;
      const nuevoNumeroPedido = ultimoNumero + 1;

      // Armar payload
      const pedidoData: PedidoInput = {
        numero_pedido: nuevoNumeroPedido,
        fecha_pedido: today.toISOString().split('T')[0], // solo fecha
        id_cliente: clienteSeleccionado.id,
        cliente: clienteSeleccionado.nombre,
        para_hora: paraHora || null, // null si está vacío
        productos: pedidoItems.map(item => ({
          id_producto: item.id,
          nombre_producto: item.nombre,
          cantidad_producto: item.cantidad,
          precio_unitario: item.precio_unitario,
          aclaraciones: item.aclaraciones || ''
        })),
        estado: 'PENDIENTE',
        entregado: false,
        avisado: false,
        pagado: false
      };


      // Depuración: revisar payload
      console.log("Payload a enviar al backend:", pedidoData);

      // Llamada al backend
      await createPedido(pedidoData);

      // Reset del modal y cierre
      resetModalState();
      onClose();
    } catch (err: any) {
      console.error("Error al crear pedido:", err);
      // Si el backend devuelve mensaje, se puede mostrar
      if (err.response?.data?.detail) {
        setError(`Error: ${err.response.data.detail}`);
      } else {
        setError('Error al confirmar el pedido. Intente de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}></div>

        {isLoading && <div className={modalStyles.loadingContainer}><p>Creando pedido...</p></div>}
        {error && <div className={modalStyles.error}>{error}</div>}

        <div className={styles.modalBody}>
          <div className={styles.createModalGrid}>
            {/* Información del pedido */}
            <div className={styles.clientSelectionPanel}>
              <h2>Información del Pedido</h2>
              <div className={[modalStyles.formGroup, styles.clientForm].join(' ')}>
                <div className={styles.formRowElement}>
                  <label className={modalStyles.formLabel} htmlFor="clienteSelect">Cliente</label>
                  <select
                    id="clienteSelect"
                    className={modalStyles.formControl}
                    value={clienteSeleccionado?.id || ''}
                    onChange={(e) => {
                      const cliente = clientes.find(c => c.id === Number(e.target.value)) || null;
                      setClienteSeleccionado(cliente);
                      setClienteInput(cliente?.nombre || '');
                    }}
                  >
                    <option value="">Seleccione un cliente</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
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

              {/* Lista de items del pedido */}
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
                          onChange={(e) => actualizarCantidadItem(item.id, parseFloat(e.target.value))}
                          className={styles.quantityInput}
                        />
                        <button onClick={() => actualizarCantidadItem(item.id, item.cantidad + 1)} className={styles.quantityButton}>+</button>
                      </div>
                      <div className={styles.orderItemInfo}>
                        <strong>{item.nombre}</strong>
                        <textarea
                          placeholder="Aclaraciones..."
                          value={item.aclaraciones || ''}
                          onChange={(e) => updateItemAclaraciones(item.id, e.target.value)}
                          className={styles.aclaracionesInput}
                        />
                      </div>
                      <div>
                        <span className={styles.orderItemSubtotal}>${item.subtotal || 0}</span>
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

            {/* Selección de productos */}
            <div className={styles.productSelectionPanel}>
              <h2>Seleccionar Productos</h2>
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
                {categoriasUnicas.map(cat => (
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
                {productosFiltrados.length > 0 ? (
                  productosFiltrados.map(producto => (
                    <div key={producto.id} className={styles.productItem}>
                      <div className={styles.productInfo}>
                        <button
                          onClick={() => agregarProductoAlPedido(producto)}
                          className={styles.addButtonSmall}
                        >
                          Añadir
                        </button>
                        <strong>{producto.nombre}</strong>
                        <span>${producto.precio_unitario || 0}</span>
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

        {/* Footer */}
        <div className={modalStyles.modalFooter}>
          <button
            type="button"
            onClick={onClose}
            className={`${modalStyles.modalButton} ${modalStyles.modalButtonSecondary}`}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmarPedido}
            className={`${modalStyles.modalButton} ${modalStyles.modalButtonPrimary}`}
            disabled={isLoading || !clienteSeleccionado || pedidoItems.length === 0}
          >
            Guardar Pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearPedidoModal;
