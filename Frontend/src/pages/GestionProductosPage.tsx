/*
 * @file GestionProductosPage.tsx
 * @description Página principal para la gestión de productos.
 * Permite listar, crear, editar y eliminar productos del sistema.
 * Utiliza un modal para el formulario de productos y tiene funcionalidad de búsqueda.
 */

import React, { useState, useEffect, useCallback } from 'react';

import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/gestionProductosPage.module.css';
import formStyles from '../styles/formStyles.module.css';


/**
 * Importaciones de servicios y tipos necesarios para la gestión de productos y categorías.
 */
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from '../services/product_service';
import { getCategorias, type Categoria } from '../services/category_service';
import {type Producto, type ProductoInput} from '../types/models'
interface GestionProductosPageProps {}

const GestionProductosPage: React.FC<GestionProductosPageProps> = () => {
  const navigate = useNavigate();

  /**
   * Estados del componente:
   * - productos: Lista completa de productos
   * - filteredProductos: Lista filtrada de productos para búsqueda
   * - categorias: Lista de categorías disponibles
   * - searchTerm: Término de búsqueda actual
   * - isModalOpen: Estado del modal de formulario
   * - editingProducto: Producto actualmente en edición (null si es nuevo)
   * - formData: Datos del formulario actual
   */
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<ProductoInput>({
    nombre: '',
    descripcion: '',
    precio_unitario: 0,
    precio_por_bulto: 0,
    stock: 0,
    disponible: true,
    categoria_id: null,
  });


  /**
   * Funciones para obtener datos del backend
   */
  const fetchProductos = useCallback(async () => {
    try {
      const data = await getProductos();
      setProductos(data);
      setFilteredProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar productos. Revisa que el backend esté funcionando.');
    }
  }, []);

  const fetchCategorias = useCallback(async () => {
    try {
      const data = await getCategorias();
      setCategorias(data);
      // Establecer la primera categoría como valor por defecto si existe
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, categoria_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }, []);

  /**
   * Efectos del componente
   */

  useEffect(() => {
    // Cargar datos iniciales al montar el componente
    fetchProductos();
    fetchCategorias();
  }, [fetchProductos, fetchCategorias]);

  useEffect(() => {
    // Búsqueda en tiempo real por nombre o descripción
    const lowercasedValue = searchTerm.toLowerCase();
    const results = productos.filter(p =>
      p.nombre.toLowerCase().includes(lowercasedValue) ||
      p.descripcion.toLowerCase().includes(lowercasedValue)
    );
    setFilteredProductos(results);
  }, [searchTerm, productos]);



  /**
   * Manejadores de eventos del formulario
   */

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };


  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;

    // Manejo especializado para diferentes tipos de campos
    if (type === 'checkbox') {
      const target = event.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else if (name === 'precio_unitario' || name === 'precio_por_bulto' || name === 'stock') {
      // Convertir a número con fallback a 0 si no es válido
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'categoria_id') {
      // Manejar selección de categoría
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : null }));
    } else {
      // Manejar campos de texto
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Abre el modal de formulario con los datos del producto seleccionado o en modo nuevo
   */

  const openModal = useCallback((producto: Producto | null = null) => {
    if (producto) {
      // Cargar datos del producto existente
      setEditingProducto(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio_unitario: +producto.precio_unitario,
        precio_por_bulto: +producto.precio_por_bulto,
        stock: +producto.stock,
        disponible: producto.disponible,
        categoria_id: producto.categoria?.id ?? null,
      });
    } else {
      // Inicializar formulario en modo nuevo
      setEditingProducto(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio_unitario: 0,
        precio_por_bulto: 0,
        stock: 0,
        disponible: true,
        categoria_id: categorias.length > 0 ? categorias[0].id : null,
      });
    }
    setIsModalOpen(true);
  }, [categorias]);


  /**
   * Cierra el modal de formulario
   */

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProducto(null);
  }, []);


  /**
   * Maneja el envío del formulario de producto
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validación de categoría
    if (!formData.categoria_id) {
      alert('Por favor, seleccione una categoría para el producto.');
      return;
    }

    try {
      // Operación CRUD según el modo (editar/crear)
      if (editingProducto) {
        await updateProducto(editingProducto.id, formData);
        alert('Producto actualizado exitosamente.');
      } else {
        await createProducto(formData);
        alert('Producto creado exitosamente.');
      }

      // Actualizar lista y cerrar modal
      fetchProductos();
      closeModal();
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      const errorMessage = error.response?.data?.detail || JSON.stringify(error.response?.data) || 'Ocurrió un error al guardar.';
      alert(errorMessage);

    }
  };

  /**
   * Maneja la eliminación de un producto
   */
  const handleDelete = async (productoId: number) => {
    if (window.confirm('¿Estás seguro de que querés eliminar este producto?')) {
      try {
        await deleteProducto(productoId);
        alert('Producto eliminado.');
        fetchProductos();
      } catch (error: any) {
        console.error('Error al eliminar producto:', error);
        alert(error.response?.data?.detail || 'Error al eliminar.');
      }
    }
  };

  /**
   * Renderizado del componente
   */

  return (
    <div className={styles.pageContainer}>
      <h1>Gestión de Productos</h1>
      
      {/* Barra de herramientas con búsqueda y botones */}
      <div className={styles.toolbar}>
        <div className={styles.searchBarContainer}>
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.toolbarButtons}>
          <button 
            onClick={() => navigate('/gestion/categorias')} 
            className={`${styles.addButton} ${styles.secondaryButton}`}
          >
            Gestionar Categorías
          </button>
          <button onClick={() => openModal()} className={styles.addButton}>
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Lista de productos filtrada */}
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
                <span>Stock: {producto.stock}</span>
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

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingProducto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit} className={formStyles.formContainer}>
              <div className={formStyles.formSection}>
                <h3 className={formStyles.formSectionTitle}>Información Básica</h3>
                <div className={formStyles.formField}>
                  <label className={`${formStyles.formLabel} ${formStyles.requiredLabel}`} htmlFor="nombre">Nombre</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className={formStyles.formInput}
                  />
                </div>
                <div className={formStyles.formField}>
                  <label className={formStyles.formLabel} htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    className={formStyles.formTextarea}
                  />
                </div>
              </div>
              <div className={formStyles.formSection}>
                <h3 className={formStyles.formSectionTitle}>Precios y Stock</h3>
                <div className={formStyles.formField}>
                  <label className={`${formStyles.formLabel} ${formStyles.requiredLabel}`} htmlFor="precio_unitario">Precio Unitario</label>
                  <input
                    type="number"
                    id="precio_unitario"
                    name="precio_unitario"
                    value={formData.precio_unitario}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    className={formStyles.formInput}
                  />
                </div>
                <div className={formStyles.formField}>
                  <label className={`${formStyles.formLabel} ${formStyles.requiredLabel}`} htmlFor="precio_por_bulto">Precio por Bulto</label>
                  <input
                    type="number"
                    id="precio_por_bulto"
                    name="precio_por_bulto"
                    value={formData.precio_por_bulto}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    className={formStyles.formInput}
                  />
                </div>
                <div className={formStyles.formField}>
                  <label className={`${formStyles.formLabel} ${formStyles.requiredLabel}`} htmlFor="stock">Stock</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    className={formStyles.formInput}
                  />
                </div>
              </div>
              <div className={formStyles.formSection}>
                <h3 className={formStyles.formSectionTitle}>Estado y Categoría</h3>
                <div className={formStyles.formField}>
                  <label className={formStyles.formLabel} htmlFor="disponible">Disponible</label>
                  <input
                    type="checkbox"
                    id="disponible"
                    name="disponible"
                    checked={formData.disponible}
                    onChange={handleInputChange}
                    className={formStyles.formInput}
                  />
                </div>
                <div className={formStyles.formField}>
                  <label className={formStyles.formLabel} htmlFor="categoria_id">Categoría</label>
                  <select
                    id="categoria_id"
                    name="categoria_id"
                    value={formData.categoria_id || ''}
                    onChange={handleInputChange}
                    className={formStyles.formSelect}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={formStyles.formButtons}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={formStyles.secondaryButton}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={formStyles.primaryButton}
                >
                  {editingProducto ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionProductosPage;
