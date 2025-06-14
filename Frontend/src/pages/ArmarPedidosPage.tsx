/**
 * @file CrearPedidoPage.tsx
 * @brief Página para la creación y armado de nuevos pedidos.
 * @details
 * Este es el componente central para la operatoria diaria. Permite a los usuarios
 * armar un nuevo pedido de forma interactiva. Orquesta la información de los servicios
 * de clientes y productos para construir un objeto de pedido que finalmente se envía
 * al servicio de pedidos. La interfaz está dividida en tres paneles principales:
 * selección de cliente, selección de productos por categoría y el resumen del pedido actual.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import styles from '../styles/crearPedidoPage.module.css';
import { getClientes } from '../services/client_service';
import { getProductos } from '../services/product_service';
import { createPedido, getPedidosByDate } from '../services/pedido_service';
import type { PedidoItem, PedidoInput, Producto, Cliente } from '../types/models.d.ts';

const CrearPedidoPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([]);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [paraHora, setParaHora] = useState<string>(''); // Nuevo estado para la hora de entrega

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    /**
   * @brief Carga los datos iniciales de clientes y productos en paralelo.
   */
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [clientesData, productosData] = await Promise.all([getClientes(), getProductos()]);
      setClientes(clientesData);
      setProductos(productosData);
      if (productosData.length > 0) {
        const categoriasUnicas = [...new Set(productosData.map(p => p.categoria?.nombre || 'Sin Categoría'))];
        if (categoriasUnicas.length > 0) {
            setCategoriaSeleccionada(categoriasUnicas[0]);
        }
      }
    } catch (err) {
      setError('Error al cargar datos iniciales. Verifique el estado de los servicios.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  /** @brief Filtra la lista de clientes basándose en el término de búsqueda. */
  const clientesFiltrados = useMemo(() => {
    if (!clienteSearchTerm) {
      return clientes;
    }
    return clientes.filter(c =>
      c.nombre.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
      c.telefono.includes(clienteSearchTerm) ||
      c.direccion.toLowerCase().includes(clienteSearchTerm.toLowerCase())
    );
  }, [clienteSearchTerm, clientes]);

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
    if (cantidad < 1) {
      eliminarItemDelPedido(productoId);
      return;
    }
    setPedidoItems(prevItems =>
      prevItems.map(item =>
        item.id === productoId
          ? { ...item, cantidad, subtotal: cantidad * item.precio_unitario }
          : item
      )
    );
  }, [eliminarItemDelPedido]);

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
                subtotal: Number((nuevaCantidad * (Number(item.precio_unitario) || 0)).toFixed(2))
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
            subtotal: Number(precioUnitario.toFixed(2)),
            precio: Number(precioUnitario.toFixed(2))
          }
        ];
      }
    });
  }, []);

  const handleSeleccionarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setClienteSearchTerm(cliente.nombre);
  }

  // Nuevo: Manejador para el cambio de la hora de entrega
  const handleParaHoraChange = (e: ChangeEvent<HTMLInputElement>) => {
    setParaHora(e.target.value);
  };

  /**
   * @brief Maneja la confirmación final y envío del pedido al backend.
   * @details Valida que haya un cliente y productos, calcula el número de pedido secuencial
   * para el día, construye el payload y llama al servicio `createPedido`.
   */
  const handleConfirmarPedido = async () => {
    if (!clienteSeleccionado) {
      return;
    }
    if (pedidoItems.length === 0) {
      return;
    }

    try {
      const hoy = new Date().toISOString().split('T')[0];
      const pedidosDeHoy = await getPedidosByDate(hoy);
      const nuevoNumeroPedido = pedidosDeHoy.length + 1;

      const pedidoData: PedidoInput = {
        numero_pedido: nuevoNumeroPedido,
        fecha_pedido: hoy,
        id_cliente: clienteSeleccionado.id,
        para_hora: paraHora || null, // Usamos el nuevo estado para la hora de entrega
        entregado: false,
        pagado: false,
        productos: pedidoItems.map(item => ({
          id_producto: item.id,
          nombre_producto: item.nombre,
          cantidad_producto: item.cantidad,
          precio_unitario: item.precio_unitario,
        })),
      };

      await createPedido(pedidoData);

      // Resetear estados después de confirmar el pedido
      setPedidoItems([]);
      setClienteSeleccionado(null);
      setClienteSearchTerm('');
      setParaHora(''); // Resetear también el campo de la hora

    } catch (err) {
      console.error("Error al confirmar el pedido:", err);
    }
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerSection}>
        <h1>Armar Nuevo Pedido</h1>
        {clienteSeleccionado && (
            <div className={styles.clienteSeleccionadoInline}>
                Pedido para: <strong>{clienteSeleccionado.nombre}</strong>
            </div>
        )}
      </div>
      <div className={styles.mainGrid}>
        <div className={styles.clientSelectionPanel}>
          <h2>Seleccionar Cliente</h2>
          <div className={styles.clientSearch}>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={clienteSearchTerm}
              onChange={(e) => setClienteSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.clientList}>
            {clientesFiltrados.length > 0 ? (
              clientesFiltrados.map(cliente => (
                <div
                  key={cliente.id}
                  className={`${styles.clientItem} ${clienteSeleccionado?.id === cliente.id ? styles.selectedClient : ''}`}
                  onClick={() => handleSeleccionarCliente(cliente)}
                >
                  <strong>{cliente.nombre}</strong>
                  <span>{cliente.telefono}</span>
                  <small>{cliente.direccion}</small>
                </div>
              ))
            ) : (
              <p>No se encontraron clientes.</p>
            )}
          </div>
        </div>

        <div className={styles.productSelectionPanel}>
          <h2>Seleccionar Productos</h2>
          <div className={styles.categoryTabs}>
            {(categoriasUnicas || []).map(cat => (
              <button
                key={cat}
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
                    <strong>{producto.nombre}</strong>
                    <span>${(producto.precio_unitario || 0)}</span>
                  </div>
                  <button
                    onClick={() => agregarProductoAlPedido(producto)}
                    className={styles.addButtonSmall}
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

        <div className={styles.currentOrderPanel}>
          <h2>Pedido Actual</h2>
          {/* Nuevo: Sección para la hora de entrega */}
          <div className={styles.deliveryTimeSection}>
            <label htmlFor="deliveryTime">Hora de Entrega:</label>
            <input
              type="time"
              id="deliveryTime"
              value={paraHora}
              onChange={handleParaHoraChange}
              className={styles.timeInput}
            />
          </div>
          {/* Fin de la nueva sección */}
          <div className={styles.orderItemsList}>
            {pedidoItems.length === 0 ? (
              <p className={styles.emptyOrderText}>Aún no hay productos en el pedido.</p>
            ) : (
              pedidoItems.map(item => (
                <div key={item.id} className={styles.orderItem}>
                  <div className={styles.orderItemInfo}>
                    <strong>{item.nombre}</strong>
                    <span>${(item.precio_unitario || 0)} c/u</span>
                  </div>
                  <div className={styles.orderItemControls}>
                    <button onClick={() => actualizarCantidadItem(item.id, item.cantidad - 1)} className={styles.quantityButton}>-</button>
                    <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => actualizarCantidadItem(item.id, parseInt(e.target.value) || 1)}
                        className={styles.quantityInput}
                    />
                    <button onClick={() => actualizarCantidadItem(item.id, item.cantidad + 1)} className={styles.quantityButton}>+</button>
                  </div>
                  <span className={styles.orderItemSubtotal}>${(item.subtotal || 0)}</span>
                  <button onClick={() => eliminarItemDelPedido(item.id)} className={styles.deleteItemButton}>×</button>
                </div>
              ))
            )}
          </div>
          {pedidoItems.length > 0 && (
            <div className={styles.orderSummary}>
              <div className={styles.totalDisplay}>
                <strong>TOTAL: ${totalPedido}</strong>
              </div>
              <button onClick={handleConfirmarPedido} className={styles.confirmOrderButton} disabled={!clienteSeleccionado}>
                Confirmar Pedido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrearPedidoPage;