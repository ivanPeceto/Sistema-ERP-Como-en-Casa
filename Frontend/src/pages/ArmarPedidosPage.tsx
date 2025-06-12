/**
 * @file CrearPedidoPage.tsx
 * @description Página para la creación y armado de nuevos pedidos. Permite seleccionar
 * productos por categoría, ajustar cantidades y confirmar el pedido.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import styles from '../styles/crearPedidoPage.module.css';
import { getClientes, type Cliente } from '../services/client_service';
import { getProductos, type Producto } from '../services/product_service';
import { createPedido, getPedidosByDate, type PedidoInput } from '../services/pedido_service';
import type { PedidoItem } from '../types/models.d.ts';

const CrearPedidoPage: React.FC = () => {
  // --- Estados para datos externos ---
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  // --- Estados para la UI y el formulario ---
  const [clienteBusqueda, setClienteBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([]);
  
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
    if (!clienteBusqueda) return [];
    return clientes.filter(c => c.nombre.toLowerCase().includes(clienteBusqueda.toLowerCase()));
  }, [clienteBusqueda, clientes]);

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
    setClienteBusqueda(cliente.nombre);
  }

  const handleConfirmarPedido = async () => {
    if (!clienteSeleccionado) {
      alert('Por favor, seleccione un cliente de la lista.');
      return;
    }
    if (pedidoItems.length === 0) {
      alert('El pedido está vacío.');
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
      alert(`Pedido #${nuevoNumeroPedido} creado para ${clienteSeleccionado.nombre}.`);
      
      setPedidoItems([]);
      setClienteSeleccionado(null);
      setClienteBusqueda('');

    } catch (err) {
      console.error("Error al confirmar el pedido:", err);
      alert("Ocurrió un error al confirmar el pedido.");
    }
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  // --- Renderizado del Componente ---
  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerSection}>
        <h1>Armar Nuevo Pedido</h1>
        <div className={styles.clienteSelectorContainer}> {/* 1. Añadimos un contenedor padre */}
          <div className={styles.clienteSelector}>
            <label htmlFor="cliente">Cliente: </label>
            <input
              type="text"
              id="cliente"
              value={clienteBusqueda}
              onChange={(e) => setClienteBusqueda(e.target.value)}
              placeholder="Buscar nombre del cliente..."
            />
          </div>
          
          {/* 2. Movemos el desplegable para que sea hermano del input, pero dentro del contenedor padre */}
          {clienteBusqueda && clientesFiltrados.length > 0 && (
            <div className={styles.clienteDropdown}>
              {clientesFiltrados.map(cliente => (
                <div key={cliente.id} onClick={() => handleSeleccionarCliente(cliente)} className={styles.clienteDropdownItem}>
                  {cliente.nombre}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={styles.mainGrid}>
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