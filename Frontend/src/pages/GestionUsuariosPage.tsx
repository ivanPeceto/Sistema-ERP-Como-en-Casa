/**
 * @file GestionUsuariosPage.tsx
 * @brief Página de gestión de usuarios con CRUD completo.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import styles from '../styles/gestionClientesPage.module.css';
import formStyles from '../styles/formStyles.module.css';

import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario
} from '../services/user_service';

import { getRoles } from '../services/role_service';

import type { User, UserForm, Rol } from '../types/models';

const GestionUsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<User[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<UserForm>({
    email: '',
    nombre: '',
    rol: '',
  });

  // --------------------------------------------------------
  // CARGA INICIAL
  // --------------------------------------------------------

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsuarios();
      setUsuarios(data);
      setFilteredUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // --------------------------------------------------------
  // BUSCADOR
  // --------------------------------------------------------

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredUsuarios(
      usuarios.filter(
        (u) =>
          u.nombre.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower) ||
          u.rol.toLowerCase().includes(lower)
      )
    );
  }, [searchTerm, usuarios]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  // --------------------------------------------------------
  // MODAL
  // --------------------------------------------------------

  const openModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        email: '',
        rol: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ nombre: '', email: '', rol: '' });
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // --------------------------------------------------------
  // SUBMIT
  // --------------------------------------------------------

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await updateUsuario(editingUser.id, formData);
      } else {
        await createUsuario(formData);
      }

      fetchUsers();
      closeModal();
    } catch (error: any) {
      console.error('Error al guardar usuario:', error);
    }
  };

  // --------------------------------------------------------
  // ELIMINAR
  // --------------------------------------------------------

  const handleDelete = async (userId: number) => {
    try {
      await deleteUsuario(userId);
      fetchUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------

  return (
    <div className={styles.pageContainer}>
      <h1>Gestión de usuarios</h1>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Buscar por nombre, email o rol..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        <button onClick={() => openModal()} className={styles.addButton}>
          Nuevo Usuario
        </button>
      </div>

      {/* Lista */}
      <div className={styles.listContainer}>
        {filteredUsuarios.length > 0 ? (
          filteredUsuarios.map((u) => (
            <div key={u.id} className={styles.listItem}>
              <div className={styles.itemInfo}>
                <strong>{u.nombre}</strong>
                <span>Email: {u.email}</span>
                <small>Rol: {u.rol}</small>
              </div>

              <div className={styles.itemActions}>
                <button onClick={() => openModal(u)} className={styles.editButton}>
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className={styles.deleteButton}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No se encontraron usuarios.</p>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>

            <form onSubmit={handleSubmit} className={formStyles.formContainer}>
              <div className={formStyles.formSection}>

                <div className={formStyles.formField}>
                  <label className={formStyles.formLabel} htmlFor="nombre">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={formStyles.formInput}
                    required
                  />
                </div>

                <div className={formStyles.formField}>
                  <label className={formStyles.formLabel} htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={formStyles.formInput}
                    required
                  />
                </div>

                <div className={formStyles.formField}>
                  <label className={formStyles.formLabel} htmlFor="rol">
                    Rol
                  </label>
                  <select
                    id="rol"
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    className={formStyles.formInput}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.nombre}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={formStyles.formButtons}>
                <button type="button" onClick={closeModal} className={formStyles.secondaryButton}>
                  Cancelar
                </button>
                <button type="submit" className={formStyles.primaryButton}>
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuariosPage;
