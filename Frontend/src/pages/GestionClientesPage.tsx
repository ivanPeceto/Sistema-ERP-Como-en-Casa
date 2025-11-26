import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import styles from '../styles/gestionProductosPage.module.css';
import formStyles from '../styles/formStyles.module.css';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/client_service';
import type { Cliente } from '../types/models';

const GestionClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Omit<Cliente, 'id'>>({ nombre: '', telefono: '', direccion: '' });

  const fetchClientes = useCallback(async () => {
    try {
      const data = await getClientes();
      const clientesArray = Array.isArray(data) ? data : [];
      setClientes(clientesArray);
      setFilteredClientes(clientesArray);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setClientes([]);
      setFilteredClientes([]);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  useEffect(() => {
    if (!Array.isArray(clientes)) return setFilteredClientes([]);
    const lower = searchTerm.toLowerCase();
    const results = clientes.filter(c =>
      c.nombre.toLowerCase().includes(lower) ||
      c.telefono.includes(searchTerm) ||
      c.direccion.toLowerCase().includes(lower)
    );
    setFilteredClientes(results);
  }, [searchTerm, clientes]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTelephoneInput = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').substring(0, 10);
    let formatted = digits;
    if (digits.length > 6) formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    else if (digits.length > 3) formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    setFormData(prev => ({ ...prev, telefono: formatted }));
  };

  const openModal = useCallback((cliente: Cliente | null = null) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({ nombre: cliente.nombre, telefono: cliente.telefono, direccion: cliente.direccion });
    } else {
      setEditingCliente(null);
      setFormData({ nombre: '', telefono: '', direccion: '' });
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCliente(null);
    setFormData({ nombre: '', telefono: '', direccion: '' });
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingCliente) await updateCliente(editingCliente.id, formData);
      else await createCliente(formData);
      fetchClientes();
      closeModal();
    } catch (error: any) {
      console.error('Error al guardar cliente:', error.response?.data?.detail || error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que quieres eliminar este cliente?')) return;
    try {
      await deleteCliente(id);
      fetchClientes();
    } catch (error: any) {
      console.error('Error al eliminar cliente:', error.response?.data?.detail || error);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Gestión de clientes</h1>
      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o dirección..."
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        <button onClick={() => openModal()} className={styles.addButton}>Nuevo Cliente</button>
      </div>

      <div className={styles.listContainer}>
        {Array.isArray(filteredClientes) && filteredClientes.length > 0 ? (
          filteredClientes.map(c => (
            <div key={c.id} className={styles.listItem}>
              <div className={styles.itemInfo}>
                <strong>{c.nombre}</strong>
                <span>Tel: {c.telefono}</span>
                <small>Dir: {c.direccion}</small>
              </div>
              <div className={styles.itemActions}>
                <button onClick={() => openModal(c)} className={styles.editButton}>Editar</button>
                <button onClick={() => handleDelete(c.id)} className={styles.deleteButton}>Eliminar</button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No se encontraron clientes.</p>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            <form onSubmit={handleSubmit} className={formStyles.formContainer}>
              <div className={formStyles.formSection}>
                <div className={formStyles.formField}>
                  <label htmlFor="nombre" className={`${formStyles.formLabel} ${formStyles.requiredLabel}`}>Nombre</label>
                  <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} required className={formStyles.formInput} />
                </div>
                <div className={formStyles.formField}>
                  <label htmlFor="telefono" className={formStyles.formLabel}>Teléfono</label>
                  <input type="tel" id="telefono" name="telefono" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" value={formData.telefono} onChange={handleTelephoneInput} maxLength={12} className={formStyles.formInput} required />
                </div>
                <div className={formStyles.formField}>
                  <label htmlFor="direccion" className={formStyles.formLabel}>Dirección</label>
                  <textarea id="direccion" name="direccion" value={formData.direccion} onChange={handleInputChange} className={formStyles.formTextarea} />
                </div>
              </div>
              <div className={formStyles.formButtons}>
                <button type="button" onClick={closeModal} className={formStyles.secondaryButton}>Cancelar</button>
                <button type="submit" className={formStyles.primaryButton}>{editingCliente ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionClientesPage;
