/**
 * @file GestionRolesPage.tsx
 * @brief Página de gestión de roles que permite crear, editar, eliminar y listar roles.
 * @details
 * Este componente de React implementa una interfaz de usuario completa para las operaciones
 * CRUD sobre la entidad de Roles. Se comunica con el `role_service` para
 * interactuar con el backend y maneja toda la lógica de la interfaz, incluyendo
 * un modal para la edición y creación de roles.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/gestionCategoriaPage.module.css';
import formStyles from '../styles/formStyles.module.css';
import {
  getRoles,
  createRol,
  updateRol,
  deleteRol
} from '../services/role_service';
import type { Rol } from '../types/models';

/**
 * @brief Componente principal de gestión de roles.
 * @details Proporciona una interfaz para administrar roles con operaciones CRUD.
 * @returns {React.ReactElement} El JSX que renderiza la página completa.
 */
const GestionRolesPage: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [formData, setFormData] = useState<Omit<Rol, 'id'>>({
    nombre: '',
    descripcion: '',
  });

  const fetchRoles = useCallback(async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = useCallback((rol: Rol | null = null) => {
    if (rol) {
      setEditingRol(rol);
      setFormData({ nombre: rol.nombre, descripcion: rol.descripcion });
    } else {
      setEditingRol(null);
      setFormData({ nombre: '', descripcion: '' });
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingRol(null);
    setFormData({ nombre: '', descripcion: '' });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (editingRol) {
        await updateRol(editingRol.id, formData);
      } else {
        await createRol(formData);
      }
      fetchRoles();
      closeModal();
    } catch (error: any) {
      console.error('Error al guardar rol:', error);
    }
  };

  const handleDelete = async (rolId: number) => {
    if (window.confirm(`¿Está seguro de eliminar el rol "${roles.find(r => r.id === rolId)?.nombre}"?`)) {
      try {
        await deleteRol(rolId);
        fetchRoles();
      } catch (error) {
        console.error('Error al eliminar rol:', error);
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Gestión de Roles</h1>
      <div className={styles.toolbar}>
        <button 
          onClick={() => navigate('/gestion/productos')} 
          className={`${styles.addButton} ${styles.secondaryButton}`}
        >
          Volver
        </button>
        <button onClick={() => openModal()} className={styles.addButton}>
          Nuevo Rol
        </button>
      </div>

      <div className={styles.listContainer}>
        {roles.length > 0 ? (
          roles.map(r => (
            <div key={r.id} className={styles.listItem}>
              <div className={styles.itemInfo}>
                <strong>{r.nombre}</strong>
                <small>{r.descripcion}</small>
              </div>
              <div className={styles.itemActions}>
                <button onClick={() => openModal(r)} className={styles.editButton}>Editar</button>
                <button onClick={() => handleDelete(r.id)} className={styles.deleteButton}>Eliminar</button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No se encontraron roles.</p>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingRol ? 'Editar Rol' : 'Nuevo Rol'}</h2>
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
                  {editingRol ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionRolesPage;
