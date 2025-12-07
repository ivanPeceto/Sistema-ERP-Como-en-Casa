import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'; 
import type { ChangeEvent, KeyboardEvent } from 'react';
import styles from './CrearPedidoModal.module.css';
import modalStyles from '../../../styles/modalStyles.module.css';
import { createPedido, getPedidosByDate } from '../../../services/pedido_service';
import type { Producto, PedidoItem, PedidoInput, Cliente } from '../../../types/models.d.ts';
import { buscarClientesPorCoincidencia, createCliente, getClientes } from '../../../services/client_service';
import { consumirStock } from '../../../services/product_service.ts';

interface CrearPedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  productos: Producto[];
}

const CrearPedidoModal: React.FC<CrearPedidoModalProps> = ({ isOpen, onClose, productos}) => {
  const [clienteInput, setClienteInput] = useState<string>(''); 
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clienteSuggestions, setClienteSuggestions] = useState<Cliente[]>([]);
  const [isSearchingClientes, setIsSearchingClientes] = useState<boolean>(false);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
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
    setSelectedCliente(null);
    setClienteSuggestions([]);
    setActiveSuggestionIndex(-1);
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
  
  /** @brief Hook que resetea el estado cuando el modal se abre. */
  useEffect(() => {
    if (isOpen) resetModalState();
  }, [isOpen, resetModalState]);

  /** @brief Hook para seleccionar la primera categoría por defecto si no hay ninguna seleccionada. */
  useEffect(() => {
    if (productos.length > 0 && !categoriaSeleccionada) {
      const categoriasUnicas = [...new Set(productos.map(p => p.categoria?.nombre || 'Sin Categoría'))];
      if (categoriasUnicas.length > 0) {
        setCategoriaSeleccionada(categoriasUnicas[0]);
      }
    }
  }, [productos, categoriaSeleccionada]);
  
  /**
   * @brief Hook `useEffect` que realiza la búsqueda de clientes con debounce.
   * @details Se activa cuando `clienteInput` cambia. Espera 300ms después de la
   * última pulsación antes de llamar a `buscarClientesPorCoincidencia`.
   */
  useEffect(() => {
    setIsSearchingClientes(true);

    // Temporizador de debounce
    const timerId = setTimeout(async () => {
      try {
        const suggestions = await buscarClientesPorCoincidencia(clienteInput);
        setClienteSuggestions(suggestions);
        setActiveSuggestionIndex(-1); 
      } catch (err) {
        console.error("Error buscando clientes:", err);
        setClienteSuggestions([]); 
      } finally {
        setIsSearchingClientes(false)
      }
    }, 300); // Esperar 300ms 

    return () => {
      clearTimeout(timerId);
      setIsSearchingClientes(false);
    };
  }, [clienteInput]); 

  /**
   * @brief Hook `useEffect` para hacer scroll automático a la sugerencia activa.
   * @details Cuando `activeSuggestionIndex` cambia, hace scroll en la lista
   * para que la sugerencia activa sea visible.
   */
  useEffect(() => {
    if (activeSuggestionIndex >= 0 && suggestionsRef.current) {
        const activeItem = suggestionsRef.current.children[activeSuggestionIndex] as HTMLLIElement;
        if (activeItem) {
            activeItem.scrollIntoView({ block: 'nearest' });
        }
    }
  }, [activeSuggestionIndex]);

  /** @brief Extrae una lista de nombres de categorías únicas a partir de los productos. */
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

  /** @brief Actualiza el estado del input del cliente */
  const handleClienteInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setClienteInput(e.target.value);
  };

  /** @brief Selecciona una sugerencia de cliente */
  const handleSelectSuggestion = (cliente: Cliente) => {
    setClienteInput(`${cliente.nombre}`);
    setSelectedCliente(cliente);
    setClienteSuggestions([]); 
    setActiveSuggestionIndex(-1);
  };

  /**
   * @brief Manejador para eventos de teclado en el input de cliente.
   * @details Permite navegar (flechas arriba/abajo), seleccionar (Enter/Tab)
   * y cerrar (Escape) la lista de sugerencias.
   * @param {KeyboardEvent<HTMLInputElement>} e Evento de teclado.
   */  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (clienteSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault(); 
        setActiveSuggestionIndex(prevIndex =>
          prevIndex < clienteSuggestions.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case 'ArrowUp':
        e.preventDefault(); 
        setActiveSuggestionIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : 0));
        break;
      case 'Enter':
        if (activeSuggestionIndex >= 0) {
          e.preventDefault(); 
          handleSelectSuggestion(clienteSuggestions[activeSuggestionIndex]);
        }
        break;
      case 'Tab':
         if (activeSuggestionIndex >= 0) {
           e.preventDefault(); 
           handleSelectSuggestion(clienteSuggestions[activeSuggestionIndex]);
         }
         break;
      case 'Escape':
        setClienteSuggestions([]);
        setActiveSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };


  const handleParaHoraChange = (e: ChangeEvent<HTMLInputElement>) => {
    setParaHora(e.target.value);
  };

  /**
   * @brief Maneja la confirmación final y envío del pedido al backend.
   * @details Valida que haya un cliente y productos, calcula el número de pedido secuencial
   * para el día, construye el payload y llama al servicio `createPedido`.
   */
  const handleConfirmarPedido = async () => {
    const clienteNombreTrimmed = clienteInput.trim();
    if (!clienteNombreTrimmed) {
      setError('Debe ingresar un nombre de cliente para el pedido.');
      return;
    }
    if (pedidoItems.length === 0) {
      setError('El pedido no puede estar vacío.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!selectedCliente) {
          console.log("Intentando crear nuevo cliente:", clienteNombreTrimmed);
          try {
              const nuevoCliente = await createCliente({
                  nombre: clienteNombreTrimmed,
              });
              console.log("Nuevo cliente creado:", nuevoCliente);
          } catch (createError: any) {
              console.error("Error al crear el cliente:", createError);
              console.warn("Continuando la creación del pedido con el nombre ingresado tras error al crear cliente.");
          }
      }
      const now = new Date();
      
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); 
      const day = String(now.getDate()).padStart(2, '0');
      
      // Fecha en formato YYYY-MM-DD para buscar en el backend
      const hoyLocalStr = `${year}-${month}-${day}`;

      // Obtener pedidos del día para asignar nuevo número
      const pedidosDeHoy = await getPedidosByDate(hoyLocalStr);
      const ultimoNumero = pedidosDeHoy.length === 0 ? 0 : pedidosDeHoy[pedidosDeHoy.length - 1].numero_pedido;
      const nuevoNumeroPedido = ultimoNumero + 1;

      // Armar payload
      const pedidoData: PedidoInput = {
        numero_pedido: nuevoNumeroPedido,
        fecha_pedido: hoyLocalStr,
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
          aclaraciones: item.aclaraciones || ''
        })),
      };


      console.log("Payload a enviar al backend:", pedidoData);
      await createPedido(pedidoData);

      try {
          const actualizaciones = pedidoItems.map(item => 
              consumirStock(item.id, item.cantidad)
          );
          
          await Promise.all(actualizaciones);
          console.log("Stock actualizado correctamente para todos los productos.");
          
      } catch (stockError) {
          console.error("ERROR: El pedido se creó, pero hubo un problema actualizando el stock:", stockError);
      }

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
              
              <div className={[modalStyles.formGroup, styles.clientForm].join(" ")}>
                <div className={`${styles.formRowElement} ${styles.clienteInputContainer}`}> {/* Contenedor relativo */}
                    <label className={modalStyles.formLabel} htmlFor="clienteInput">Cliente</label>
                    <input
                      type="text"
                      id="clienteInput"
                      name="clienteInput"
                      value={clienteInput}
                      onChange={handleClienteInputChange} 
                      onKeyDown={handleKeyDown}
                      className={modalStyles.formControl}
                      placeholder="Nombre del cliente"
                      autoFocus
                      autoComplete="off" 
                    />
                     {isSearchingClientes && <div className={styles.searchingIndicator}>Buscando...</div>}
                     {clienteSuggestions.length > 0 && (
                        <ul className={styles.suggestionsList} ref={suggestionsRef}>
                            {clienteSuggestions.map((suggestion, index) => (
                            <li
                                key={suggestion.id}
                                className={`${styles.suggestionItem} ${index === activeSuggestionIndex ? styles.suggestionItemActive : ''}`}
                                onClick={() => handleSelectSuggestion(suggestion)}
                                role="option"
                                aria-selected={index === activeSuggestionIndex}
                                tabIndex={-1} 
                            >
                                {suggestion.nombre}
                            </li>
                            ))}
                        </ul>
                     )}
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
            disabled={isLoading || pedidoItems.length === 0}
          >
            Guardar Pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearPedidoModal;
