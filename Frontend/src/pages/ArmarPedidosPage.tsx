/**
 * @file CrearPedidoPage.tsx
 * @description Página para la creación y armado de nuevos pedidos. Permite seleccionar
 * productos por categoría, ajustar cantidades y confirmar el pedido.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import styles from '../styles/crearPedidoPage.module.css';
import { getClientes } from '../services/client_service';
import { getProductos } from '../services/product_service';
import { createPedido, getPedidosByDate } from '../services/pedido_service';
import type { PedidoItem, Cliente, Producto, PedidoInput } from '../types/models.d.ts';

const CrearPedidoPage: React.FC = () => {
  // --- Estados para datos externos ---
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  // --- Estados para la UI y el formulario ---
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([]);
  const [clienteSearchTerm, setClienteSearchTerm] = useState(''); // Nuevo estado para el término de búsqueda de clientes

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Lógica de carga de datos ---
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

  // --- Lógica de filtrado y cálculos (Memorizada para optimización) ---

  const clientesFiltrados = useMemo(() => {
    if (!clienteSearchTerm) {
      return clientes; // Si no hay término de búsqueda, muestra todos los clientes
    }
    return clientes.filter(c => 
      c.nombre.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
      c.telefono.includes(clienteSearchTerm) ||
      c.direccion.toLowerCase().includes(clienteSearchTerm.toLowerCase())
    );
  }, [clienteSearchTerm, clientes]);

  const categoriasUnicas = useMemo(() =>
    [...new Set(productos.map(p => p.categoria?.nombre || 'Sin Categoría'))],
  [productos]);

  const productosFiltradosPorCategoria = useMemo(() => {
    if (!categoriaSeleccionada) return [];
    return productos.filter(p => (p.categoria?.nombre || 'Sin Categoría') === categoriaSeleccionada && p.disponible);
  }, [categoriaSeleccionada, productos]);

  const totalPedido = useMemo(() => {
    return pedidoItems.reduce((total, item) => total + (item.subtotal || 0), 0);
  }, [pedidoItems]);

  // --- Manejadores de eventos ---

  const eliminarItemDelPedido = useCallback((productoId: number) => {
    setPedidoItems(prevItems => prevItems.filter(item => item.id !== productoId));
  }, []);

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

  const agregarProductoAlPedido = useCallback((producto: Producto) => {
    setPedidoItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === producto.id);
      if (existingItem) {
        // Si el ítem ya existe, actualiza su cantidad y subtotal.
        return prevItems.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio_unitario }
            : item
        );
      } else {
        // Si es un ítem nuevo, lo añade a la lista.
        return [...prevItems, { ...producto, cantidad: 1, subtotal: producto.precio_unitario, precio: producto.precio_unitario }];
      }
    });
  }, []);
  
  const handleSeleccionarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setClienteSearchTerm(''); // Limpiamos el término de búsqueda al seleccionar un cliente
  };

  const handleClienteSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setClienteSearchTerm(value);
    
    // Si el usuario está borrando o modificando el texto, deseleccionamos el cliente actual
    if (clienteSeleccionado && value !== clienteSeleccionado.nombre) {
      setClienteSeleccionado(null);
    }
  };
  
  const getInputPlaceholder = () => {
    return clienteSeleccionado ? 'Buscar otro cliente...' : 'Buscar cliente...';
  };
  
  const getInputValue = () => {
    return clienteSeleccionado ? '' : clienteSearchTerm;
  };
  
  const handleClearSelection = () => {
    setClienteSeleccionado(null);
    setClienteSearchTerm('');
  };

  const handleConfirmarPedido = async () => {
    if (!clienteSeleccionado) {
      console.error('Por favor, seleccione un cliente de la lista.');
      return;
    }
    if (pedidoItems.length === 0) {
      console.error('El pedido está vacío.');
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
        para_hora: null,
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
      console.log(`Pedido #${nuevoNumeroPedido} creado para ${clienteSeleccionado.nombre}.`);
      
      setPedidoItems([]);
      setClienteSeleccionado(null);
      setClienteSearchTerm('');

    } catch (err) {
      console.error("Error al confirmar el pedido:", err);
      console.error("Ocurrió un error al confirmar el pedido.");
    }
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  // --- Renderizado del Componente ---
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
        {/* Nuevo panel de Selección de Clientes */}
        <div className={styles.clientSelectionPanel}>
          <h2>Seleccionar Cliente</h2>
          <div className={styles.clientSearch}>
            <input
              type="text"
              placeholder={getInputPlaceholder()}
              value={getInputValue()}
              onChange={handleClienteSearchChange}
              className={clienteSeleccionado ? styles.searchDisabled : ''}
              disabled={!!clienteSeleccionado}
            />
            {clienteSeleccionado && (
              <button 
                onClick={handleClearSelection}
                className={styles.clearButton}
                title="Cambiar cliente"
              >
                Cambiar
              </button>
            )}
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