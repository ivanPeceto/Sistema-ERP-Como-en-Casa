/**
 * @file GestionPedidosPage.tsx
 * @brief Componente para la gestión completa y visualización de pedidos.
 * @details
 * Este componente implementa una interfaz de usuario avanzada para la gestión de pedidos.
 * Sus funcionalidades principales incluyen:
 * - Carga de pedidos filtrados por fecha.
 * - Búsqueda por texto (N° de pedido, producto).
 * - Visualización de pedidos en pestañas por estado (Todos, Pendientes, Entregados, etc.).
 * - Un modal para ver los detalles de un pedido.
 * - Un modal para la edición completa de un pedido, incluyendo sus productos.
 * - Acciones rápidas para cambiar estados y eliminar pedidos desde la vista principal.
 * Orquesta la comunicación con múltiples servicios del backend (pedidos, productos).
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/gestionPedidosPage.module.css';
import modalStyles from '../styles/modalStyles.module.css';
import CrearPedidoModal from '../components/modals/CrearPedidoModal/CrearPedidoModal.tsx';
import EditarPedidoModal from '../components/modals/CrearPedidoModal/EditarPedidoModal.tsx';
import GestionCobrosModal from '../components/modals/GestionCobrosModal/GestionCobrosModal.tsx';

import { getPedidosByDate, editarPedido, deletePedido, printPedido } from '../services/pedido_service';
import { getProductos } from '../services/product_service';
import type {
  Producto,
  Pedido, PedidoInput, PedidoItem, PedidoEstado,
  SocketMessage
} from '../types';
import { usePedidosSocket } from '../hooks/usePedidosSocket';

/**
 * @class GestionPedidosPage
 * @brief Componente principal para la gestión de pedidos
 * 
 * @details
 * Este componente proporciona una interfaz completa para gestionar pedidos, incluyendo:
 * - Visualización de pedidos con filtrado por fecha y búsqueda
 * - Gestión de estados de pedidos (entregado, pagado)
 * - Edición de pedidos existentes
 * - Eliminación de pedidos
 * - Vista detallada de pedidos
 * 
 * @note Este componente utiliza múltiples estados para manejar la información de:
 * - Lista de pedidos
 * - Productos
 * - Filtros de búsqueda
 * - Estados de los modales
 * 
 * @see Pedido
 * @see Producto
 */
const GestionPedidosPage: React.FC = () => {
  const navigate = useNavigate();

  // Estados principales
  /** @brief Lista completa de pedidos */
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  /** @brief Lista de productos disponibles */
  const [productos, setProductos] = useState<Producto[]>([]);

  /** @brief Término de búsqueda para filtrar pedidos */
  const [searchTerm, setSearchTerm] = useState<string>('');

  /** @brief Fecha para filtrar los pedidos (formato YYYY-MM-DD) */
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const hoy = `${year}-${month}-${day}`;
  const [searchDate, setSearchDate] = useState<string>(() => {
    const saved = localStorage.getItem("searchDate");
    return saved ?? hoy; // si existe en localStorage → usarlo. Si no → usar hoy.
  });

  // Estados de los modales
  /** @brief Controla la visibilidad del modal de visualización */
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  /** @brief Controla la visibilidad del modal de edición */
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  /** @brief Almacena el pedido que se está visualizando */
  const [viewingPedido, setViewingPedido] = useState<Pedido | null>(null);

  /** @brief Almacena el pedido que se está editando */
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);

  /** @brief Datos del formulario de edición */
  const [editFormData, setEditFormData] = useState<Partial<Pedido>>({});

  /** @brief Items del pedido que se está editando */
  const [editingPedidoItems, setEditingPedidoItems] = useState<PedidoItem[]>([]);

  /** @brief Categoría seleccionada en el filtro de productos */
  const [editCategoriaSeleccionada, setEditCategoriaSeleccionada] = useState<string>('');

  /** @brief Estado de carga inicial de datos */
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /** @brief Controla la visibilidad del modal de total de ventas */
  const [isTotalVentasModalOpen, setIsTotalVentasModalOpen] = useState<boolean>(false);

  /** @brief Almacena el total de ventas calculado para el día */
  const [totalVentasDia, setTotalVentasDia] = useState<number>(0);

  /** @brief Controla la visibilidad del modal de creación de pedido */
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  /** @brief Controla la visibilidad del modal de cobros*/
  const [isCobrosModalOpen, setIsCobrosModalOpen] = useState<boolean>(false);

  /** @brief Almacena el pedido asociado al cobro */
  const [pedidoCobrar, setPedidoCobrar] = useState<Pedido | null>(null);


  const openCobrosModal = useCallback((pedido: Pedido) => {
    setPedidoCobrar(pedido)
    setIsCobrosModalOpen(true);
  }, []);

  const closeCobrosModal = useCallback(() => {
    setIsCobrosModalOpen(false);
  }, []);

  const openCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleSocketMessage = useCallback((data: SocketMessage) => {
    if (data.source === 'pedidos') {
      if (data.action === 'delete' && data.id) {
        console.log("Eliminación de PEDIDO recibida para el ID:", data.id);
        setPedidos(currentPedidos =>
          currentPedidos.filter(p => p.id !== data.id)
        );
        return;
      }
      if ((data.action === 'create' || data.action === 'update') && data.pedido) {
        console.log("Actualización/Creación de PEDIDO recibida:", data.pedido);
        setPedidos(currentPedidos => {
          const index = currentPedidos.findIndex(p => p.id === data.pedido!.id);
          const newPedidos = [...currentPedidos];

          if (index !== -1) {
            newPedidos[index] = data.pedido!;
          } else {
            newPedidos.push(data.pedido!);
          }
          return newPedidos.sort((a, b) => a.numero_pedido - b.numero_pedido);
        });
      }
    }
  }, []);

  usePedidosSocket(handleSocketMessage);

  /**
  * @brief Carga todos los datos iniciales necesarios para la página en paralelo.
  * @details
  * Realiza las siguientes operaciones de forma paralela:
  * 1. Obtiene los pedidos para la fecha seleccionada
  * 2. Obtiene la lista de productos
  * 
  * @throws {Error} Si ocurre un error al cargar los datos
  * @async
  */
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pedidosData, productosData] = await Promise.all([
        getPedidosByDate(searchDate),
        getProductos()
      ]);
      setPedidos(pedidosData);
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
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchDate]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);


  /** @brief Filtra los pedidos por texto después de haber sido filtrados por fecha. */
  const filteredPedidos = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return pedidos.filter(pedido => {
      const matchesSearchTerm =
        pedido.numero_pedido.toString().includes(lowercasedSearchTerm) ||
        pedido.cliente.toLowerCase().includes(lowercasedSearchTerm) ||
        pedido.productos_detalle.some(item => item.nombre_producto.toLowerCase().includes(lowercasedSearchTerm));
      return matchesSearchTerm;
    });
  }, [searchTerm, pedidos]);

  /** @brief Deriva la lista de pedidos pendientes a partir de la lista filtrada. */
  const pedidosPendientes = useMemo(() =>
    filteredPedidos.filter(pedido => pedido.estado === 'PENDIENTE'),
    [filteredPedidos]
  );

  /** @brief Deriva la lista de pedidos listos. */
  const pedidosListos = useMemo(() =>
    filteredPedidos.filter(pedido => pedido.estado === 'LISTO'),
    [filteredPedidos]
  );

  /** @brief Deriva la lista de pedidos entregados. */
  const pedidosEntregados = useMemo(() =>
    filteredPedidos.filter(pedido => pedido.estado === 'ENTREGADO'),
    [filteredPedidos]
  );

  // Deprecated 
  /** @brief Deriva la lista de pedidos pagados. */
  const pedidosPagados = useMemo(() =>
    filteredPedidos.filter(pedido => pedido.pagado),
    [filteredPedidos]
  );

  /** @brief Deriva la lista de pedidos no pagados. */
  const pedidosNoPagados = useMemo(() =>
    filteredPedidos.filter(pedido => !pedido.pagado),
    [filteredPedidos]
  );
  //--

  /**
   * @brief Maneja el cambio en el término de búsqueda
   * @param {ChangeEvent<HTMLInputElement>} event - Evento del input de búsqueda
   */
  const handleSearchTermChange = (event: ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(event.target.value);

  /**
   * @brief Maneja el cambio en la fecha de búsqueda
   * @param {ChangeEvent<HTMLInputElement>} event - Evento del input de fecha
   */
  const handleSearchDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setSearchDate(newDate);
    localStorage.setItem("searchDate", newDate);
  };

  /**
   * @brief Abre el modal de visualización de un pedido
   * @param {Pedido} pedido - Pedido a visualizar
   */
  const openViewModal = useCallback((pedido: Pedido) => {
    setViewingPedido(pedido);
    setIsModalOpen(true);
  }, []);

  /**
   * @brief Cierra el modal de visualización
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setViewingPedido(null);
  }, []);

  /**
   * @brief Cierra el modal de edición y limpia los estados relacionados
   * @description
   * Esta función se encarga de cerrar el modal de edición y limpiar
   * todos los estados relacionados con la edición de un pedido.
   */
  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingPedido(null);
    setEditingPedidoItems([]);
    setEditFormData({});
  }, []);


  /**
   * @brief Abre el modal de edición de un pedido
   * @param {Pedido} pedido - Pedido a editar
   * @description
   * Inicializa el estado de edición con los datos del pedido seleccionado,
   * incluyendo la información de los productos asociados.
   */
  const openEditModal = useCallback((pedido: Pedido) => {
    setEditingPedido(pedido);
    setEditFormData({
      para_hora: pedido.para_hora,
      estado: pedido.estado,
      //deprecated
      entregado: pedido.entregado,
      //
      avisado: pedido.avisado,
      pagado: pedido.pagado,
    });
    setEditingPedidoItems(pedido.productos_detalle.map(item => ({
      id: item.id_producto,
      nombre: item.nombre_producto,
      precio_unitario: parseFloat(item.precio_unitario.toString()) || 0,
      cantidad: parseFloat(item.cantidad_producto.toString()) || 0,
      subtotal: (parseFloat(item.cantidad_producto.toString()) * (parseFloat(item.precio_unitario.toString()) || 0)) || 0,
      aclaraciones: item.aclaraciones || '',
    })));
    setIsEditModalOpen(true);
  }, []);

  const removeProductFromEditingOrder = useCallback((productId: number) => {
    setEditingPedidoItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

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
      aclaraciones: item.aclaraciones || '',
    }));

    return {
      numero_pedido: pedido.numero_pedido,
      fecha_pedido: pedido.fecha_pedido,
      cliente: updates.cliente !== undefined ? updates.cliente : pedido.cliente,
      para_hora: updates.para_hora !== undefined ? updates.para_hora : pedido.para_hora,
      estado: updates.estado !== undefined ? updates.estado : pedido.estado,
      avisado: updates.avisado !== undefined ? updates.avisado : pedido.avisado,
      //deprecated
      entregado: updates.entregado !== undefined ? updates.entregado : pedido.entregado,
      //
      pagado: updates.pagado !== undefined ? updates.pagado : pedido.pagado,
      productos: productosParaEnviar,
    };
  }, []);

  const getFechaISO = (dateString: string) => {
    return dateString.split('T')[0];
  };

  /**
   * @brief Alterna el estado de 'entregado' de un pedido
   * @param {Pedido} pedido - El pedido cuyo estado se va a modificar
   * @returns {Promise<void>}
   * @description
   * Cambia el estado de entrega de un pedido y actualiza la información
   * en el servidor. Muestra mensajes de éxito/error al usuario.
   */
  const handleUpdatePedidoEstado = useCallback(async (pedido: Pedido) => {
    let nuevoEstado: PedidoEstado = pedido.estado as PedidoEstado;

    if (pedido.estado === 'PENDIENTE') {
      nuevoEstado = 'LISTO';
    } else if (pedido.estado === 'LISTO') {
      nuevoEstado = 'ENTREGADO';
    } else if (pedido.estado === 'ENTREGADO') {
      nuevoEstado = 'PENDIENTE';
    }

    try {
      const payload = prepareUpdatePayload(
        pedido,
        {
          estado: nuevoEstado
        },
        pedido.productos_detalle.map(item => ({
          id: item.id_producto,
          nombre: item.nombre_producto,
          cantidad: item.cantidad_producto,
          precio_unitario: parseFloat(item.precio_unitario.toString()) || 0,
          subtotal: (parseFloat(item.cantidad_producto.toString()) * (parseFloat(item.precio_unitario.toString()) || 0)) || 0,
          aclaraciones: item.aclaraciones || '',
        })));
      await editarPedido(
        { fecha: getFechaISO(pedido.fecha_pedido), numero: pedido.numero_pedido },
        payload
      );
      fetchInitialData();
    } catch (error) {
      console.error(`Error al cambiar estado 'entregado' para pedido ${pedido.id}:`, error);
      console.error('No se pudo actualizar el estado del pedido.');
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
        aclaraciones: item.aclaraciones || '',
      })));
      await editarPedido(
        { fecha: getFechaISO(pedido.fecha_pedido), numero: pedido.numero_pedido },
        payload
      );
      fetchInitialData();
    } catch (error) {
      console.error(`Error al cambiar estado 'pagado' para pedido ${pedido.id}:`, error);
      console.error('No se pudo actualizar el estado del pedido.');
    }
  }, [fetchInitialData, prepareUpdatePayload]);

  const handleToggleAvisado = useCallback(async (pedido: Pedido) => {
    try {
      const payload = prepareUpdatePayload(pedido, { avisado: !pedido.avisado }, pedido.productos_detalle.map(item => ({
        id: item.id_producto,
        nombre: item.nombre_producto,
        cantidad: item.cantidad_producto,
        precio_unitario: parseFloat(item.precio_unitario.toString()) || 0,
        subtotal: (parseFloat(item.cantidad_producto.toString()) * (parseFloat(item.precio_unitario.toString()) || 0)) || 0,
        aclaraciones: item.aclaraciones || '',
      })));
      await editarPedido(
        { fecha: getFechaISO(pedido.fecha_pedido), numero: pedido.numero_pedido },
        payload
      );
      fetchInitialData();
    } catch (error) {
      console.error(`Error al cambiar estado 'pagado' para pedido ${pedido.id}:`, error);
      console.error('No se pudo actualizar el estado del pedido.');
    }
  }, [fetchInitialData, prepareUpdatePayload]);

  const handleDeletePedido = useCallback(async (pedido: Pedido) => {
    if (window.confirm(`¿Confirma que desea eliminar el Pedido #${pedido.numero_pedido}? Esta acción es irreversible.`)) {
      try {
        await deletePedido({ fecha: getFechaISO(pedido.fecha_pedido), numero: pedido.numero_pedido });
        fetchInitialData();
      } catch (error) {
        console.error(`Error al eliminar pedido ${pedido.id}:`, error);
        console.error('No se pudo eliminar el pedido.');
      }
    }
  }, [fetchInitialData]);


  const handlePrintPedido = useCallback(async (pedido: Pedido) => {
    try {
      await printPedido({ fecha: getFechaISO(pedido.fecha_pedido), numero: pedido.numero_pedido });
      fetchInitialData();
    } catch (error) {
      console.error(`Error al imprimir pedido ${pedido.id}:`, error);
      console.error('No se pudo imprimir el pedido.');
    }
  }, [fetchInitialData]);

  const [activeTab, setActiveTab] = useState< 'PENDIENTE' | 'LISTO' | 'ENTREGADO' | 'pagados' | 'noPagados'>('PENDIENTE');

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

  /**
   * @brief Calcula el total de ventas del día, lo guarda en el estado y abre el modal.
   * @details Suma el campo 'total' de todos los pedidos cargados para la fecha seleccionada.
   */
  const handleCalcularTotalVentas = useCallback(() => {
    const totalDelDia = pedidos.reduce((acumulador, pedido) => {
      return acumulador + (Number(pedido.total) || 0);
    }, 0);

    setTotalVentasDia(totalDelDia);
    setIsTotalVentasModalOpen(true);
  }, [pedidos]); // Se recalcula si la lista de pedidos cambia

  /**
   * @brief Cierra el modal de total de ventas.
   */
  const closeTotalVentasModal = useCallback(() => {
    setIsTotalVentasModalOpen(false);
  }, []);

  /**
   * @brief Función de renderizado que genera la lista de pedidos en formato de tarjetas.
   * @param {Pedido[]} pedidosToList La lista de pedidos a renderizar.
   * @returns {React.ReactElement} El JSX de la lista de pedidos.
   */
  const renderPedidosList = (pedidos: Pedido[]) => (
    <div className={styles.listContainer}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <p>Cargando pedidos...</p>
        </div>
      ) : pedidos.length > 0 ? (
        <div className={styles.pedidosGrid}>
          {pedidos.map(pedido => (
            <div
              key={pedido.id}
              className={`${styles.pedidoCard} ${pedido.estado === 'ENTREGADO' ? styles.entregado :
                  pedido.estado === 'LISTO' ? styles.listo : ''
                }`}
            >
              <div className={styles.pedidoHeader}>
                <div className={styles.pedidoNumero}>Pedido #{pedido.numero_pedido}</div>
                <div className={styles.pedidoFecha}>
                  {formatDate(pedido.fecha_pedido)}
                </div>
                <button className={styles.imprimirButton}
                  onClick={() => handlePrintPedido(pedido)}>
                  <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                </button>
              </div>

              <div className={styles.pedidoCliente}>
                <i className="fas fa-user"></i>
                {pedido.cliente}
              </div>

              <div className={styles.pedidoHora}>
                <i className="fas fa-clock"></i>
                Hora de entrega: {pedido.para_hora || 'A definir'}
              </div>

              <div className={styles.pedidoResumen}>
                <div>
                  {
                    pedido.productos_detalle.map(producto => (
                      <div key={producto.id_producto} className={styles.pedidoProductos}>
                        {producto.cantidad_producto}  {producto.nombre_producto}
                        {producto.aclaraciones && <span className={styles.aclaracionesProducto}> ({producto.aclaraciones})</span>}
                      </div>
                    ))
                  }
                </div>
                <div className={styles.pedidoTotal}>
                  Total: <span>${typeof pedido.total === 'number' ? pedido.total.toFixed(0) : '0.00'}</span>
                </div>
              </div>

              <div className={styles.pedidoEstados}>
                <button
                  className={`${styles.estadoBadge} ${pedido.estado === 'PENDIENTE' ? styles.pendienteBadge :
                      pedido.estado === 'LISTO' ? styles.listoBadge :
                        styles.entregadoBadge
                    }`}
                  onClick={() => handleUpdatePedidoEstado(pedido)}
                >
                  {pedido.estado === 'PENDIENTE' ? 'Listo' :
                    pedido.estado === 'LISTO' ? 'Entregado ' : 'Entregado'}
                </button>

                <button
                  className={`${styles.estadoBadge} ${pedido.pagado ? styles.pagadoBadge : styles.noPagadoBadge
                    }`}
                  onClick={() => handleTogglePagado(pedido)}
                >
                  <i className={`fas ${pedido.pagado ? 'fa-dollar-sign' : 'fa-hand-holding-usd'}`}></i>
                  {pedido.pagado ? 'Pagado' : 'No Pagado'}
                </button>
              </div>
              <div className={styles.pedidoEstados}>
                <button
                  className={`${styles.estadoBadge} ${pedido.avisado ? styles.avisadoBadge :
                      styles.noAvisadoBadge
                    }`}
                  onClick={() => handleToggleAvisado(pedido)}
                >
                  {pedido.avisado ? 'Avisado' : 'No avisado'}
                </button>
              </div>

              <div className={styles.pedidoAcciones}>
                <button
                  onClick={() => openCobrosModal(pedido)}
                  className={styles.actionButton}
                  title="Crear cobro"
                >
                  <i className="fas fa-eye"></i>
                  <span>Cobro</span>
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

  return (
    <div className={styles.pageContainer}>
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
          <button
            onClick={openCreateModal}
            className={styles.newOrderButton}
          >
            Nuevo Pedido
          </button>
        </div>
        <button
          onClick={handleCalcularTotalVentas}
          className={`${styles.newOrderButton}`}
          title="Calcular total de ventas del día"
        >
          <i className="fas fa-calculator" style={{ marginRight: '8px' }}></i>
          Calcular Ventas
        </button>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'PENDIENTE' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('PENDIENTE')}
        >
          Pendientes ({pedidosPendientes.length})
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'LISTO' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('LISTO')}
        >
          Listos ({pedidosListos.length})
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'ENTREGADO' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('ENTREGADO')}
        >
          Entregados ({pedidosEntregados.length})
        </button>
        {/** 
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
        */}
      </div>

      {activeTab === 'PENDIENTE' && renderPedidosList(pedidosPendientes)}
      {activeTab === 'LISTO' && renderPedidosList(pedidosListos)}
      {activeTab === 'ENTREGADO' && renderPedidosList(pedidosEntregados)}

      <CrearPedidoModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        productos={productos}
      // clientes={clientes} 
      // onPedidoCreated={handlePedidoCreated}
      />
      <GestionCobrosModal
        isOpen={isCobrosModalOpen}
        onClose={closeCobrosModal}
        pedido={pedidoCobrar}
      />

      {isModalOpen && viewingPedido && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Detalles del Pedido #{viewingPedido.numero_pedido}</h2>
            <div className={styles.detailSection}>
              <p><strong>Fecha:</strong> {viewingPedido.fecha_pedido}</p>
              <p><strong>Cliente:</strong> {viewingPedido.cliente}</p>
              <p><strong>Hora de Entrega:</strong> {viewingPedido.para_hora || 'No especificada'}</p>
              <p><strong>Estado del Pedido:</strong> {viewingPedido.estado}</p>              <p><strong>Estado Pago:</strong> {viewingPedido.pagado ? 'Pagado' : 'No Pagado'}</p>
              <h3>Productos:</h3>
              <ul className={styles.productListModal}>
                {viewingPedido.productos_detalle.map((item, index) => (
                  <li key={index}>
                    {item.nombre_producto} - {item.cantidad_producto} x ${(parseFloat(item.precio_unitario?.toString() || '0')).toFixed(1)} = ${(parseFloat(item.subtotal?.toString() || '0')).toFixed(2)}
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

      <EditarPedidoModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        editingPedido={editingPedido}
        productos={productos}
        fetchInitialDataParent={fetchInitialData}
      />

      {isTotalVentasModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>
              <i className="fas fa-chart-bar" style={{ marginRight: '10px' }}></i>
              Total de Ventas del Día
            </h2>
            <div className={styles.detailSection}>
              <p><strong>Fecha:</strong> {new Date(searchDate + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              <p style={{ fontSize: '1.8rem', marginTop: '20px' }}>
                <strong>Total: ${totalVentasDia.toFixed(2)}</strong>
              </p>
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={closeTotalVentasModal} className={`${modalStyles.modalButton} ${modalStyles.modalButtonPrimary}`}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPedidosPage;