/*
 * @file GestionCategoriasPage.tsx
 * @description Página de gestión de categorías que permite crear, editar, eliminar y listar categorías.
 * Utiliza el servicio de categorías para comunicarse con el backend y maneja la interfaz de usuario.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/gestionClientesPage.module.css';
import formStyles from '../styles/formStyles.module.css';
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  type Categoria
} from '../services/category_service';

/**
 * Componente principal de gestión de categorías.
 * Proporciona una interfaz para administrar categorías con operaciones CRUD.
 */
const GestionCategoriasPage: React.FC = () => {
  const navigate = useNavigate();
  /**
   * Estados del componente:
   * - categorias: Lista completa de categorías del backend
   * - isModalOpen: Estado del modal de edición/creación
   * - editingCategoria: Categoría actualmente en edición (null si es nueva)
   * - formData: Datos del formulario (sin ID)
   */
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState<Omit<Categoria, 'id'>>({
    nombre: '',
    descripcion: '',
  });

  /**
   * Función para cargar la lista de categorías desde el backend.
   * @returns Promesa que resuelve cuando la carga es exitosa
   * @throws Error si la carga falla
   */
  const fetchCategorias = useCallback(async () => {
    try {
      const data = await getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      alert('Error al cargar categorías. Revisa la consola.');
    }
  }, []);

  /**
   * Efecto para cargar categorías al montar el componente.
   * Utiliza useCallback para evitar recreación innecesaria.
   */
  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  /**
   * Maneja cambios en los campos del formulario.
   * @param event Evento de cambio del input o textarea
   */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Abre el modal de edición/creación de categoría.
   * @param categoria Categoría a editar (null para nueva categoría)
   */
  const openModal = useCallback((categoria: Categoria | null = null) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({ nombre: categoria.nombre, descripcion: categoria.descripcion });
    } else {
      setEditingCategoria(null);
      setFormData({ nombre: '', descripcion: '' });
    }
    setIsModalOpen(true);
  }, []);

  /**
   * Cierra el modal y resetea el formulario.
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCategoria(null);
    setFormData({ nombre: '', descripcion: '' });
  }, []);

  /**
   * Maneja el envío del formulario (creación/edición).
   * @param event Evento de envío del formulario
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (editingCategoria) {
        await updateCategoria(editingCategoria.id, formData);
        alert('Categoría actualizada exitosamente.');
      } else {
        await createCategoria(formData);
        alert('Categoría creada exitosamente.');
      }
      fetchCategorias();
      closeModal();
    } catch (error: any) {
      console.error('Error al guardar categoría:', error);
      alert(error.response?.data?.detail || 'Error al guardar.');
    }
  };

  /**
   * Maneja la eliminación de una categoría.
   * @param categoriaId ID de la categoría a eliminar
   */
  const handleDelete = async (categoriaId: number) => {
    if (window.confirm('¿Seguro que querés eliminar esta categoría?')) {
      try {
        await deleteCategoria(categoriaId);
        alert('Categoría eliminada.');
        fetchCategorias();
      } catch (error: any) {
        console.error('Error al eliminar categoría:', error);
        alert(error.response?.data?.detail || 'Error al eliminar.');
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Encabezado y barra de herramientas */}
      <h1>CATEGORIAS</h1>
      <div className={styles.toolbar}>
        <button 
          onClick={() => navigate('/gestion/productos')} 
          className={`${styles.addButton} ${styles.secondaryButton}`}
        >
          Volver
        </button>
        <button onClick={() => openModal()} className={styles.addButton}>
          Nueva Categoría
        </button>
      </div>

      {/* Lista de categorías */}
      <div className={styles.listContainer}>
        {categorias.length > 0 ? (
          categorias.map(cat => (
            <div key={cat.id} className={styles.listItem}>
              <div className={styles.itemInfo}>
                <strong>{cat.nombre}</strong>
                <small>{cat.descripcion}</small>
              </div>
              <div className={styles.itemActions}>
                <button onClick={() => openModal(cat)} className={styles.editButton}>Editar</button>
                <button onClick={() => handleDelete(cat.id)} className={styles.deleteButton}>Eliminar</button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No se encontraron categorías.</p>
        )}
      </div>

      {/* Modal de edición/creación */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
            <form onSubmit={handleSubmit} className={formStyles.formContainer}>
              <div className={formStyles.formSection}>
                <h3 className={formStyles.formSectionTitle}>Información</h3>
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
                  {editingCategoria ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionCategoriasPage;