/**
 * @file ArmarPedidosPage.tsx
 * @description Página para la creación y armado de nuevos pedidos. Permite seleccionar
 * productos por categoría, ajustar cantidades y confirmar el pedido.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import styles from '../styles/crearPedidoPage.module.css';

/**
 * @typedef CategoriaProducto
 * @description Tipo para las categorías de productos.
 */
type CategoriaProducto = 'Pizzas' | 'Empanadas' | 'Hamburguesas' | 'Bebidas';

/**
 * @interface Producto
 * @description Define la estructura base de un producto.
 */
interface Producto {
  id: number;
  nombre: string;
  categoria: CategoriaProducto;
  precio: number;
  descripcion?: string;
  disponible?: boolean; // Indica si el producto está disponible para la venta.
}

/**
 * @interface PedidoItem
 * @extends Producto
 * @description Representa un ítem dentro de un pedido, extendiendo Producto con cantidad y subtotal.
 */
interface PedidoItem extends Producto {
  cantidad: number;
  subtotal: number;
  notas?: string; // Notas adicionales para el ítem del pedido.
}

// Definición de categorías de productos disponibles.
const CATEGORIAS: CategoriaProducto[] = ['Pizzas', 'Empanadas', 'Hamburguesas', 'Bebidas'];

// Datos de ejemplo iniciales. Serán reemplazados por datos del backend.
const mockProductosDisponibles: Producto[] = [
  { id: 101, nombre: 'Pizza Muzzarella Grande', categoria: 'Pizzas', precio: 1500, disponible: true },
  { id: 102, nombre: 'Pizza Napolitana Especial', categoria: 'Pizzas', precio: 1700, disponible: true },
  { id: 103, nombre: 'Pizza Fugazzeta Rellena', categoria: 'Pizzas', precio: 1800, disponible: false },
  { id: 201, nombre: 'Empanada Carne Suave (unidad)', categoria: 'Empanadas', precio: 280, disponible: true },
  { id: 202, nombre: 'Empanada Jamón y Queso (unidad)', categoria: 'Empanadas', precio: 280, disponible: true },
  { id: 203, nombre: 'Docena Empanadas Surtidas', categoria: 'Empanadas', precio: 3000, disponible: true },
  { id: 301, nombre: 'Hamburguesa Clásica con Papas', categoria: 'Hamburguesas', precio: 1200, disponible: true },
  { id: 302, nombre: 'Hamburguesa Doble Cheddar y Bacon', categoria: 'Hamburguesas', precio: 1600, disponible: true },
  { id: 401, nombre: 'Gaseosa Coca-Cola 1.5L', categoria: 'Bebidas', precio: 750, disponible: true },
  { id: 402, nombre: 'Agua Mineral Sin Gas 1.5L', categoria: 'Bebidas', precio: 450, disponible: true },
  { id: 403, nombre: 'Cerveza Brahma Litro Retornable', categoria: 'Bebidas', precio: 800, disponible: true },
];

/**
 * Componente funcional para la página de creación de pedidos.
 * @returns {JSX.Element} La interfaz de usuario para armar un nuevo pedido.
 */
const CrearPedidoPage: React.FC = () => {
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaProducto>(CATEGORIAS[0]);
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>(''); // Puede ser un ID o nombre de cliente.

  // Efecto para cargar y filtrar productos disponibles (simulado).
  useEffect(() => {
    // TODO: Implementar llamada al backend para obtener productosDisponibles.
    // async function fetchProductos() {
    //   try {
    //     // const response = await apiClient.get('/productos?disponible=true');
    //     // setProductosDisponibles(response.data);
    //   } catch (error) { console.error("Error al cargar productos:", error); }
    // }
    // fetchProductos();
    setProductosDisponibles(mockProductosDisponibles.filter(p => p.disponible !== false));
  }, []);

  // Memoriza los productos filtrados por la categoría seleccionada.
  const productosFiltradosPorCategoria = useMemo(() => {
    return productosDisponibles.filter(p => p.categoria === categoriaSeleccionada);
  }, [productosDisponibles, categoriaSeleccionada]);

  /**
   * Agrega un producto al pedido o incrementa su cantidad si ya existe.
   * @param {Producto} producto - El producto a agregar.
   * @param {number} [cantidad=1] - La cantidad a agregar.
   */
  const agregarProductoAlPedido = useCallback((producto: Producto, cantidad: number = 1) => {
    setPedidoItems(prevItems => {
      const itemExistente = prevItems.find(item => item.id === producto.id);
      if (itemExistente) {
        return prevItems.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad, subtotal: (item.cantidad + cantidad) * item.precio }
            : item
        );
      } else {
        return [...prevItems, { ...producto, cantidad, subtotal: producto.precio * cantidad }];
      }
    });
  }, []);

  /**
   * Actualiza la cantidad de un ítem en el pedido. Si la cantidad es 0 o menor, elimina el ítem.
   * @param {number} productoId - ID del producto a actualizar.
   * @param {number} nuevaCantidad - Nueva cantidad del producto.
   */
  const actualizarCantidadItem = useCallback((productoId: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarItemDelPedido(productoId);
      return;
    }
    setPedidoItems(prevItems =>
      prevItems.map(item =>
        item.id === productoId
          ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precio }
          : item
      )
    );
  }, []);

  /**
   * Elimina un ítem del pedido.
   * @param {number} productoId - ID del producto a eliminar.
   */
  const eliminarItemDelPedido = useCallback((productoId: number) => {
    setPedidoItems(prevItems => prevItems.filter(item => item.id !== productoId));
  }, []);

  // Memoriza el cálculo del total del pedido.
  const totalPedido = useMemo(() => {
    return pedidoItems.reduce((total, item) => total + item.subtotal, 0);
  }, [pedidoItems]);

  /**
   * Maneja la confirmación del pedido. Prepara los datos y (eventualmente) los envía al backend.
   */
  const handleConfirmarPedido = async () => {
    if (pedidoItems.length === 0) {
      alert("El pedido está vacío. Agregue productos antes de confirmar.");
      return;
    }
    // TODO: Validar clienteSeleccionado si es un campo requerido.

    const pedidoParaEnviar = {
      cliente: clienteSeleccionado, // Podría ser un ID o nombre. Ajustar según backend.
      fecha_pedido: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD.
      items: pedidoItems.map(item => ({
        id_producto: item.id,
        cantidad: item.cantidad, // Nombre original 'cantidad_producto'
        // Opcional: enviar nombre y precio si el backend no los busca por ID.
        // nombre_producto: item.nombre,
        // precio_unitario_al_momento_pedido: item.precio,
      })),
      total_calculado: totalPedido, // El backend podría recalcular por seguridad.
      estado_pedido: 'pendiente', // Estado inicial del pedido.
      // Otros campos como: para_hora_estimada, notas_generales_pedido, etc.
    };

    console.log("Enviando pedido al backend:", pedidoParaEnviar);
    // TODO: Implementar llamada al backend para crear el pedido.
    // try {
    //   // const response = await apiClient.post('/pedidos/crear', pedidoParaEnviar);
    //   // console.log('Pedido creado:', response.data);
    //   alert('Pedido confirmado exitosamente (simulación)');
    //   setPedidoItems([]); // Limpiar pedido actual.
    //   setClienteSeleccionado(''); // Limpiar cliente.
    // } catch (error) {
    //   console.error('Error al confirmar pedido:', error);
    //   alert('Error al confirmar el pedido. Intente nuevamente.');
    // }
    alert('Pedido confirmado exitosamente (simulación)');
    setPedidoItems([]);
    setClienteSeleccionado('');
  };


  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerSection}>
        <h1>Armar Nuevo Pedido</h1>
        <div className={styles.clienteSelector}>
          <label htmlFor="cliente">Cliente: </label>
          <input
            type="text"
            id="cliente"
            value={clienteSeleccionado}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setClienteSeleccionado(e.target.value)}
            placeholder="Nombre o ID del cliente"
          />
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.productSelectionPanel}>
          <h2>Seleccionar Productos</h2>
          <div className={styles.categoryTabs}>
            {CATEGORIAS.map(cat => (
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
                    <span>${producto.precio.toFixed(2)}</span>
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
                    <span>${item.precio.toFixed(2)} c/u</span>
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
                  <span className={styles.orderItemSubtotal}>${item.subtotal.toFixed(2)}</span>
                  <button onClick={() => eliminarItemDelPedido(item.id)} className={styles.deleteItemButton}>×</button>
                </div>
              ))
            )}
          </div>
          {pedidoItems.length > 0 && (
            <div className={styles.orderSummary}>
              <div className={styles.totalDisplay}>
                <strong>TOTAL: ${totalPedido.toFixed(2)}</strong>
              </div>
              <button onClick={handleConfirmarPedido} className={styles.confirmOrderButton}>
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