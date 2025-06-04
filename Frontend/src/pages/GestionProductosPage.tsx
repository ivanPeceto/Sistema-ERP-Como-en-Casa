/**
 * @archivo: GestionProductosPage.tsx
 * @descripcion: Página para la administración de productos. Permite listar, buscar,
 * crear, editar, eliminar y cambiar la disponibilidad de productos.
 */
import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import styles from '../styles/gestionClientesPage.module.css';

/**
 * @interface: Producto
 * @descripcion: Define la estructura de un objeto Producto.
 */
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  disponible: boolean;
}

// Datos de ejemplo iniciales. Serán reemplazados por datos del backend.
const mockProductos: Producto[] = [
  { id: 1, nombre: 'Pizza Muzzarella', descripcion: 'Clásica pizza de muzzarella', precio_unitario: 1200, disponible: true },
  { id: 2, nombre: 'Empanada de Carne', descripcion: 'Empanada de carne cortada a cuchillo', precio_unitario: 250, disponible: true },
  { id: 3, nombre: 'Milanesa Napolitana', descripcion: 'Milanesa de ternera con salsa, jamón y muzzarella', precio_unitario: 1800, disponible: false },
];

/**
 * Componente funcional para la gestión de productos.
 * @returns {JSX.Element} La interfaz de usuario para la administración de productos.
 */
const GestionProductosPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>(mockProductos);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>(mockProductos);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<Partial<Producto>>({
    nombre: '',
    descripcion: '',
    precio_unitario: 0,
    precio_por_bulto: 0,
    disponible: true,
  });

  // Efecto para cargar productos (simulado, placeholder para API call).
  useEffect(() => {
    // TODO: Cargar productos desde el backend al montar el componente.
    // async function fetchProductos() {
    //   try {
    //     // const response = await apiClient.get('/productos');
    //     // setProductos(response.data);
    //   } catch (error) {
    //     console.error("Error al cargar productos:", error);
    //   }
    // }
    // fetchProductos();
  }, []);

  // Efecto para filtrar productos basado en el término de búsqueda.
  useEffect(() => {
    const results = productos.filter(producto =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProductos(results);
  }, [searchTerm, productos]);

  /**
   * Maneja cambios en el campo de búsqueda.
   * @param {ChangeEvent<HTMLInputElement>} event - Evento de cambio del input.
   */
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  /**
   * Maneja cambios en los campos del formulario del modal.
   * @param {ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} event - Evento de cambio del input/textarea.
   */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked; // Para checkboxes
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  /**
   * Abre el modal para crear o editar un producto.
   * @param {Producto | null} [producto=null] - El producto a editar, o null para crear uno nuevo.
   */
  const openModal = useCallback((producto: Producto | null = null) => {
    if (producto) {
      setEditingProducto(producto);
      setFormData({ ...producto });
    } else {
      setEditingProducto(null);
      setFormData({ nombre: '', descripcion: '', precio_unitario: 0, precio_por_bulto: 0, disponible: true });
    }
    setIsModalOpen(true);
  }, []);

  /** Cierra el modal y resetea el estado de edición. */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProducto(null);
  }, []);

  /**
   * Maneja el envío del formulario del modal (crear/actualizar producto).
   * @param {FormEvent<HTMLFormElement>} event - Evento de envío del formulario.
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingProducto) {
      console.log('Actualizando producto:', editingProducto.id, formData);
      // TODO: Implementar llamada al backend para actualizar el producto.
      // Ejemplo: await apiClient.put(`/productos/${editingProducto.id}`, formData);
      // Actualizar estado local: setProductos(productos.map(p => p.id === editingProducto.id ? { ...editingProducto, ...formData } : p));
    } else {
      console.log('Creando nuevo producto:', formData);
      // TODO: Implementar llamada al backend para crear el producto.
      // Ejemplo: const response = await apiClient.post('/productos', formData);
      // Actualizar estado local: setProductos([...productos, response.data]);
    }
    closeModal();
  };

  /**
   * Maneja la eliminación de un producto.
   * @param {number} productoId - ID del producto a eliminar.
   */
  const handleDelete = async (productoId: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      console.log('Eliminando producto:', productoId);
      // TODO: Implementar llamada al backend para eliminar el producto.
      // Ejemplo: await apiClient.delete(`/productos/${productoId}`);
      // Actualizar estado local: setProductos(productos.filter(p => p.id !== productoId));
    }
  };

  /**
   * Cambia el estado de disponibilidad de un producto.
   * @param {Producto} producto - El producto cuya disponibilidad se va a cambiar.
   */
  const toggleDisponibilidad = async (producto: Producto) => {
    const updatedProducto = { ...producto, disponible: !producto.disponible };
    console.log('Cambiando disponibilidad producto:', producto.id, updatedProducto.disponible);
    // TODO: Implementar llamada al backend para actualizar la disponibilidad del producto.
    // Ejemplo: await apiClient.put(`/productos/${producto.id}`, updatedProducto);
    // Actualizar estado local: setProductos(productos.map(p => p.id === producto.id ? updatedProducto : p));
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Gestión de Productos</h1>
      <div className={styles.toolbar}>
        <div className={styles.searchBarContainer}>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
        <button onClick={() => openModal()} className={styles.addButton}>
          Nuevo Producto
        </button>
      </div>

      <div className={styles.listContainer}>
        {filteredProductos.length > 0 ? (
          filteredProductos.map(producto => (
            <div key={producto.id} className={`${styles.listItem} ${!producto.disponible ? styles.itemNoDisponible : ''}`}>
              <div className={styles.itemInfo}>
                <strong>{producto.nombre}</strong>
                <span>${producto.precio_unitario.toFixed(2)} - {producto.disponible ? 'Disponible' : 'No Disponible'}</span>
                <small>{producto.descripcion}</small>
              </div>
              <div className={styles.itemActions}>
                <button onClick={() => toggleDisponibilidad(producto)} className={styles.toggleButton}>
                  {producto.disponible ? 'Deshabilitar' : 'Habilitar'}
                </button>
                <button onClick={() => openModal(producto)} className={styles.editButton}>Editar</button>
                <button onClick={() => handleDelete(producto.id)} className={styles.deleteButton}>Eliminar</button>
              </div>
            </div>
          ))
        ) : (
          <p>No se encontraron productos.</p>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingProducto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="nombre">Nombre:</label>
                <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="descripcion">Descripción:</label>
                <textarea id="descripcion" name="descripcion" value={formData.descripcion || ''} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="precio_unitario">Precio Unitario:</label>
                <input type="number" id="precio_unitario" name="precio_unitario" value={formData.precio_unitario || 0} onChange={handleInputChange} step="0.01" required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="precio_por_bulto">Precio por Bulto (opcional):</label>
                <input type="number" id="precio_por_bulto" name="precio_por_bulto" value={formData.precio_por_bulto || 0} onChange={handleInputChange} step="0.01" />
              </div>
              <div className={styles.formGroupCheckbox}>
                <input type="checkbox" id="disponible" name="disponible" checked={formData.disponible === undefined ? true : formData.disponible} onChange={handleInputChange} />
                <label htmlFor="disponible">Disponible</label>
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveButton}>Guardar</button>
                <button type="button" onClick={closeModal} className={styles.cancelButton}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionProductosPage;