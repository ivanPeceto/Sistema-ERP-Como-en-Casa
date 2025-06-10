/**
 * @archivo: GestionProductosPage.tsx
 * @descripcion: Página para la administración de productos.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import styles from '../styles/gestionClientesPage.module.css';

import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  cambiarDisponibilidad,
} from '../services/producto_service.ts';

import type { Producto } from '../services/producto_service.ts';

const GestionProductosPage: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
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

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    const results = productos.filter(producto =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProductos(results);
  }, [searchTerm, productos]);

  const fetchProductos = async () => {
    try {
      const data = await listarProductos();
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar productos. Intente nuevamente.');
    }
  };

  const handleCrearProducto = async (productoData: Partial<Producto>) => {
    try {
      const nuevoProducto = await crearProducto(productoData);
      setProductos(prev => [...prev, nuevoProducto]);
    } catch (error) {
      console.error('Error al crear producto:', error);
      alert('Error al crear producto. Intente nuevamente.');
    }
  };

  const handleActualizarProducto = async (id: number, productoData: Partial<Producto>) => {
    try {
      await actualizarProducto(id, productoData);
      await fetchProductos();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      alert('Error al actualizar producto. Intente nuevamente.');
    }
  };

  const handleEliminarProducto = async (id: number) => {
    try {
      await eliminarProducto(id);
      setProductos(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar producto. Intente nuevamente.');
    }
  };

  const handleToggleDisponibilidad = async (producto: Producto) => {
    try {
      await cambiarDisponibilidad(producto);
      await fetchProductos();
    } catch (error) {
      console.error('Error al cambiar disponibilidad:', error);
      alert('Error al cambiar disponibilidad. Intente nuevamente.');
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

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

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProducto(null);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingProducto) {
      await handleActualizarProducto(editingProducto.id, formData);
    } else {
      await handleCrearProducto(formData);
    }
    closeModal();
  };

  const handleDelete = async (productoId: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      await handleEliminarProducto(productoId);
    }
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
            <div
              key={producto.id}
              className={`${styles.listItem} ${!producto.disponible ? styles.itemNoDisponible : ''}`}
            >
              <div className={styles.itemInfo}>
                <strong>{producto.nombre}</strong>
                <span>
                  ${producto.precio_unitario.toFixed(2)} - {producto.disponible ? 'Disponible' : 'No Disponible'}
                </span>
                <small>{producto.descripcion}</small>
              </div>
              <div className={styles.itemActions}>
                <button onClick={() => handleToggleDisponibilidad(producto)} className={styles.toggleButton}>
                  {producto.disponible ? 'Deshabilitar' : 'Habilitar'}
                </button>
                <button onClick={() => openModal(producto)} className={styles.editButton}>
                  Editar
                </button>
                <button onClick={() => handleDelete(producto.id)} className={styles.deleteButton}>
                  Eliminar
                </button>
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
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="descripcion">Descripción:</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="precio_unitario">Precio Unitario:</label>
                <input
                  type="number"
                  id="precio_unitario"
                  name="precio_unitario"
                  value={formData.precio_unitario || 0}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="precio_por_bulto">Precio por Bulto (opcional):</label>
                <input
                  type="number"
                  id="precio_por_bulto"
                  name="precio_por_bulto"
                  value={formData.precio_por_bulto || 0}
                  onChange={handleInputChange}
                  step="0.01"
                />
              </div>
              <div className={styles.formGroupCheckbox}>
                <input
                  type="checkbox"
                  id="disponible"
                  name="disponible"
                  checked={formData.disponible ?? true}
                  onChange={handleInputChange}
                />
                <label htmlFor="disponible">Disponible</label>
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveButton}>
                  Guardar
                </button>
                <button type="button" onClick={closeModal} className={styles.cancelButton}>
                  Cancelar
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
