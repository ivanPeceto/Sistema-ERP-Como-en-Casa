/**
 * @file GestionCategoriasPage.tsx
 * @brief Página de gestión de categorías que permite crear, editar, eliminar y listar categorías.
 * @details
 * Este componente de React implementa una interfaz de usuario completa para las operaciones
 * CRUD sobre la entidad de Categorías. Se comunica con el `category_service` para
 * interactuar con el backend y maneja toda la lógica de la interfaz, incluyendo
 * un modal para la edición y creación de categorías.
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
  deleteCategoria
} from '../services/category_service';
import type { Categoria } from '../types/models';

/**
 * @brief Componente principal de gestión de categorías.
 * @details Proporciona una interfaz para administrar categorías con operaciones CRUD.
 * @returns {React.ReactElement} El JSX que renderiza la página completa.
 */
const GestionCategoriasPage: React.FC = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState<Omit<Categoria, 'id'>>({
    nombre: '',
    descripcion: '',
  });

  /**
   * @brief Carga la lista de categorías desde el backend usando el servicio.
   * @details Se envuelve en `useCallback` para optimizar y evitar que la función se
   * recree en cada renderizado. Muestra una alerta en caso de error.
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
    fetchCategorias();
  }, [fetchCategorias]);

  /**
   * @brief Maneja los cambios en los campos del formulario del modal.
   * @param {ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} event El evento del campo del formulario.
   */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * @brief Abre el modal y configura el formulario para crear o editar una categoría.
   * @param {Categoria | null} categoria La categoría a editar, o `null` para crear una nueva.
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

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCategoria(null);
    setFormData({ nombre: '', descripcion: '' });
  }, []);

  /**
   * @brief Maneja el envío del formulario, llamando al servicio de crear o actualizar.
   * @param {FormEvent<HTMLFormElement>} event El evento de envío del formulario.
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (editingCategoria) {
        await updateCategoria(editingCategoria.id, formData);
      } else {
        await createCategoria(formData);
      }
      fetchCategorias();
      closeModal();
    } catch (error: any) {
      console.error('Error al guardar categoría:', error);
    }
  };

  /**
   * @brief Maneja la eliminación de una categoría, con un diálogo de confirmación.
   * @param {number} categoriaId El ID de la categoría a eliminar.
   */
  const handleDelete = async (categoriaId: number) => {
    if (window.confirm(`¿Está seguro de eliminar la categoría "${categorias.find(cat => cat.id === categoriaId)?.nombre}"?`)) {
      try {
        await deleteCategoria(categoriaId);
        fetchCategorias();
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Gestion de Categorias</h1>
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