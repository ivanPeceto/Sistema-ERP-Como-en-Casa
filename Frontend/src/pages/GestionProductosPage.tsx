/**
 * @file GestionProductosPage.tsx
 * @brief Página principal para la gestión de productos.
 * @details
 * Este componente de React implementa una interfaz de usuario completa para las operaciones
 * CRUD sobre los productos. Ahora utiliza un componente de modal externo para la creación
 * y edición de productos, manteniendo el código más limpio y modular.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/gestionProductosPage.module.css';
import formStyles from '../styles/formStyles.module.css';
import { getProductos, deleteProducto } from '../services/product_service';
import { getCategorias } from '../services/category_service';
import { type Producto, type Categoria } from '../types/models';
import CrearProductoModal from '../components/modals/CrearProductoModal';

interface GestionProductosPageProps {}

/**
 * @brief Componente funcional para la página de gestión de productos.
 * @returns {React.ReactElement} El JSX que renderiza la página completa.
 */
const GestionProductosPage: React.FC<GestionProductosPageProps> = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [isCrearProductoModalOpen, setIsCrearProductoModalOpen] = useState<boolean>(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  /**
   * @brief Carga la lista de productos desde el servicio y actualiza el estado.
   * @details Se envuelve en `useCallback` para evitar recrearse en cada render, optimizando el rendimiento.
   */
  const fetchProductos = useCallback(async () => {
    try {
      const data = await getProductos();
      setProductos(data);
      setFilteredProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }, []);

  /**
   * @brief Carga la lista de categorías desde el servicio.
   * @details Se utiliza para poblar el `<select>` en el formulario del modal.
   */
  const fetchCategorias = useCallback(async () => {
    try {
      const data = await getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }, []);

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, [fetchProductos, fetchCategorias]);

  /** @brief Extrae una lista de nombres de categorías únicas a partir de los productos. */
  const categoriasUnicas = useMemo(() => {
    const nombres = new Set(productos.map(p => p.categoria?.nombre).filter(Boolean) as string[]);
    return ['Todos', ...nombres]; 
  }, [productos]);

  /**
   * @brief Efecto para filtrar los productos.
   * @details Primero filtra por categoría y luego por el término de búsqueda.
   */
  useEffect(() => {
    let results = productos;
    if (selectedCategory !== 'Todos') {
      results = results.filter(p => (p.categoria?.nombre || 'Sin Categoría') === selectedCategory);
    }
    if (searchTerm) {
      const lowercasedValue = searchTerm.toLowerCase();
      results = results.filter(p =>
        p.nombre.toLowerCase().includes(lowercasedValue) ||
        p.descripcion.toLowerCase().includes(lowercasedValue)
      );
    }
    setFilteredProductos(results);
  }, [searchTerm, selectedCategory, productos]);

  /**
   * @brief Actualiza el estado del término de búsqueda cada vez que el usuario escribe en el input.
   * @param {ChangeEvent<HTMLInputElement>} event El evento del input de búsqueda.
   */
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  /**
   * @brief Abre el modal y configura el formulario para crear o editar un producto.
   * @param {Producto | null} producto El producto a editar, o `null` para crear uno nuevo.
   */
  const openModal = useCallback((producto: Producto | null = null) => {
    setEditingProducto(producto);
    setIsCrearProductoModalOpen(true);
  }, []);

  /**
   * @brief Cierra el modal y resetea el estado de edición.
   */
  const closeModal = useCallback(() => {
    setIsCrearProductoModalOpen(false);
    setEditingProducto(null);
  }, []);

  /**
   * @brief Maneja la eliminación de un producto, con confirmación previa.
   * @param {number} productoId El ID del producto a eliminar.
   */
  const handleDelete = async (productoId: number) => {
    if (window.confirm(`¿Está seguro que desea eliminar el producto?`)) {
      try {
        await deleteProducto(productoId);
        fetchProductos();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Gestion de Productos</h1>
      <div className={styles.toolbar}>
        <div className={styles.searchBarContainer}>
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          <button onClick={() => openModal()} className={styles.addButton}>
            Nuevo Producto
          </button>
        </div>
        <div className={styles.toolbarButtons}>
          {/*<button
            onClick={() => navigate('/gestion/categorias')}
            className={`${styles.addButton} ${styles.secondaryButton}`}
          >
            Gestionar Categorías
          </button>*/}
        </div>
      </div>

      <div className={styles.categoryTabs}>
        {categoriasUnicas.map(cat => (
          <button
            key={cat}
            className={`${styles.categoryTab} ${selectedCategory === cat ? styles.activeTab : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.listContainer}>
        {filteredProductos.length > 0 ? (
          filteredProductos.map((producto) => (
            <div
              key={producto.id}
              className={`${styles.listItem} ${!producto.disponible ? styles.itemNoDisponible : ''}`}
            >
              <div className={styles.itemInfo}>
                <strong>{producto.nombre}</strong>
                <span>Precio: ${(+producto.precio_unitario).toFixed(2)}</span>
                {producto.categoria && <small>Categoría: {producto.categoria.nombre}</small>}
              </div>
              <div className={styles.itemActions}>
                <button onClick={() => openModal(producto)} className={styles.editButton}>Editar</button>
                <button onClick={() => handleDelete(producto.id)} className={styles.deleteButton}>Eliminar</button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No se encontraron productos.</p>
        )}
      </div>

      <CrearProductoModal
        isOpen={isCrearProductoModalOpen}
        onClose={closeModal}
        fetchProductos={fetchProductos}
        editingProducto={editingProducto}
        categorias={categorias}
      />
    </div>
  );
};

export default GestionProductosPage;