/*
 * @file GestionClientesPage.tsx
 * @description Página de gestión de clientes que permite crear, editar, eliminar y buscar clientes.
 * Utiliza el servicio de clientes para comunicarse con el backend y maneja la interfaz de usuario.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import styles from '../styles/gestionClientesPage.module.css';
import formStyles from '../styles/formStyles.module.css';
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  type Cliente
} from '../services/client_service';

/**
 * Componente principal de gestión de clientes.
 * Proporciona una interfaz para administrar clientes con operaciones CRUD.
 */
const GestionClientesPage: React.FC = () => {
  /**
   * Estados del componente:
   * - clientes: Lista completa de clientes del backend
   * - filteredClientes: Lista filtrada de clientes para búsqueda
   * - searchTerm: Término de búsqueda ingresado por el usuario
   * - isModalOpen: Estado del modal de edición/creación
   * - editingCliente: Cliente actualmente en edición (null si es nuevo)
   * - formData: Datos del formulario (sin ID)
   */
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Omit<Cliente, 'id'>>({
    nombre: '',
    telefono: '',
    direccion: '',
  });

  /**
   * Función para cargar la lista de clientes desde el backend.
   * @returns Promesa que resuelve cuando la carga es exitosa
   * @throws Error si la carga falla
   */
  const fetchClientes = useCallback(async () => {
    try {
      const data = await getClientes();
      setClientes(data);
      setFilteredClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      alert('Error al cargar clientes. Por favor, asegúrese de estar autenticado como superusuario y de que el servicio de clientes esté funcionando.');
    }
  }, []);

  /**
   * Efecto para cargar clientes al montar el componente.
   * Utiliza useCallback para evitar recreación innecesaria.
   */
  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  /**
   * Efecto para filtrar clientes en frontend según el término de búsqueda.
   * Realiza búsqueda por nombre, teléfono y dirección.
   */
  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const results = clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(lowercasedSearchTerm) ||
      (cliente.telefono && cliente.telefono.includes(searchTerm)) ||
      cliente.direccion.toLowerCase().includes(lowercasedSearchTerm)
    );
    setFilteredClientes(results);
  }, [searchTerm, clientes]);

  /**
   * Maneja cambios en el campo de búsqueda.
   * @param event Evento de cambio del input
   */
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  /**
   * Maneja cambios en los campos del formulario.
   * @param event Evento de cambio del input o textarea
   */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Abre el modal de edición/creación de cliente.
   * @param cliente Cliente a editar (null para nuevo cliente)
   */
  const openModal = useCallback((cliente: Cliente | null = null) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
      });
    } else {
      setEditingCliente(null);
      setFormData({ nombre: '', telefono: '', direccion: '' });
    }
    setIsModalOpen(true);
  }, []);

  /**
   * Cierra el modal y resetea el formulario.
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCliente(null);
    setFormData({ nombre: '', telefono: '', direccion: '' });
  }, []);

  /**
   * Maneja el envío del formulario (creación/edición).
   * @param event Evento de envío del formulario
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, formData);
        alert('Cliente actualizado exitosamente.');
      } else {
        await createCliente(formData);
        alert('Cliente creado exitosamente.');
      }
      fetchClientes();
      closeModal();
    } catch (error: any) {
      console.error('Error al guardar cliente:', error);
      const errorMessage = error.response?.data?.detail
        || (typeof error.response?.data === 'string' ? error.response.data : JSON.stringify(error.response?.data))
        || error.message
        || 'Error al guardar cliente. Verifique la consola para más detalles.';
      alert(errorMessage);
    }
  };

  /**
   * Maneja la eliminación de un cliente.
   * @param clienteId ID del cliente a eliminar
   */
  const handleDelete = async (clienteId: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este cliente? Esta acción es irreversible.')) {
      try {
        await deleteCliente(clienteId);
        alert('Cliente eliminado exitosamente.');
        fetchClientes();
      } catch (error: any) {
        console.error('Error al eliminar cliente:', error);
        const errorMessage = error.response?.data?.detail
          || (typeof error.response?.data === 'string' ? error.response.data : JSON.stringify(error.response?.data))
          || error.message
          || 'Error al eliminar cliente. Verifique la consola para más detalles.';
        alert(errorMessage);
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Encabezado y barra de herramientas */}
      <h1>Gestión de clientes</h1>
      <div className={styles.toolbar}>
        <div className={styles.searchBarContainer}>
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o dirección..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
        <button onClick={() => openModal()} className={styles.addButton}>
          Nuevo Cliente
        </button>
      </div>

      {/* Lista de clientes */}
      <div className={styles.listContainer}>
        {filteredClientes.length > 0 ? (
          filteredClientes.map(cliente => (
            <div key={cliente.id} className={styles.listItem}>
              <div className={styles.itemInfo}>
                <strong>{cliente.nombre}</strong>
                <span>Tel: {cliente.telefono}</span>
                <small>Dir: {cliente.direccion}</small>
              </div>
              <div className={styles.itemActions}>
                <button onClick={() => openModal(cliente)} className={styles.editButton}>Editar</button>
                <button onClick={() => handleDelete(cliente.id)} className={styles.deleteButton}>Eliminar</button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No se encontraron clientes.</p>
        )}
      </div>

      {/* Modal de edición/creación */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
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
                  <label className={formStyles.formLabel} htmlFor="telefono">Teléfono</label>
                  <input
                    type="text"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className={formStyles.formInput}
                  />
                </div>
                <div className={formStyles.formField}>
                  <label className={formStyles.formLabel} htmlFor="direccion">Dirección</label>
                  <textarea
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
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
                  {editingCliente ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionClientesPage;