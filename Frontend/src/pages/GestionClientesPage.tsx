import React, { useState, useEffect} from 'react';
import type { ChangeEvent, FormEvent  } from 'react'; 
import styles from '../styles/gestionClientesPage.module.css';

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
}

const mockClientes: Cliente[] = [
  { id: 1, nombre: 'Carlos Pérez', email: 'carlos.perez@example.com', telefono: '1122334455', direccion: 'Av. Siempre Viva 123' },
  { id: 2, nombre: 'Ana Gómez', email: 'ana.gomez@example.com', telefono: '5566778899', direccion: 'Calle Falsa 456' },
  { id: 3, nombre: 'Luis Fernández', email: 'luis.fernandez@example.com', telefono: '0011223344', direccion: 'Pasaje Alegría 789' },
];

const GestionClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>(mockClientes);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Omit<Cliente, 'id'>>({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  useEffect(() => {
    // TODO: Cargar clientes del backend cuando el componente se monte
    // async function fetchClientes() {
    //   try {
    //     // const response = await apiClient.get('/clientes'); // Reemplaza con tu cliente API
    //     // setClientes(response.data);
    //     // setFilteredClientes(response.data);
    //   } catch (error) {
    //     console.error("Error al cargar clientes:", error);
    //   }
    // }
    // fetchClientes();
  }, []);

  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const results = clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(lowercasedSearchTerm) ||
      cliente.email.toLowerCase().includes(lowercasedSearchTerm) ||
      cliente.telefono.includes(searchTerm) // El teléfono puede no necesitar toLowerCase si siempre son números
    );
    setFilteredClientes(results);
  }, [searchTerm, clientes]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (cliente: Cliente | null = null) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
      });
    } else {
      setEditingCliente(null);
      setFormData({ nombre: '', email: '', telefono: '', direccion: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCliente(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingCliente) {
      console.log('Actualizando cliente:', editingCliente.id, formData);
      // TODO: Llamada al backend para ACTUALIZAR cliente
      // try {
      //   const response = await apiClient.put(`/clientes/${editingCliente.id}`, formData);
      //   setClientes(clientes.map(c => c.id === editingCliente.id ? { ...editingCliente, ...formData } : c));
      //   closeModal();
      // } catch (error) {
      //   console.error("Error al actualizar cliente:", error);
      // }
    } else {
      console.log('Creando nuevo cliente:', formData);
      // TODO: Llamada al backend para CREAR cliente
      // try {
      //   const response = await apiClient.post('/clientes', formData);
      //   // Asumiendo que el backend devuelve el cliente creado con su ID
      //   setClientes(prevClientes => [...prevClientes, { id: response.data.id, ...formData }]);
      //   closeModal();
      // } catch (error) {
      //   console.error("Error al crear cliente:", error);
      // }
    }
  };

  const handleDelete = async (clienteId: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
      console.log('Eliminando cliente:', clienteId);
      // TODO: Llamada al backend para ELIMINAR cliente
      // try {
      //   await apiClient.delete(`/clientes/${clienteId}`);
      //   setClientes(clientes.filter(c => c.id !== clienteId));
      // } catch (error) {
      //   console.error("Error al eliminar cliente:", error);
      // }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1>Gestión de Clientes</h1>
      <div className={styles.toolbar}>
        <div className={styles.searchBarContainer}>
          <input
            type="text"
            placeholder="Buscar por nombre, email, teléfono..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          {/* Puedes añadir un icono de búsqueda aquí si lo deseas */}
        </div>
        <button onClick={() => openModal()} className={styles.addButton}>
          Nuevo Cliente
        </button>
      </div>

      <div className={styles.listContainer}>
        {filteredClientes.length > 0 ? (
          filteredClientes.map(cliente => (
            <div key={cliente.id} className={styles.listItem}>
              <div className={styles.itemInfo}>
                <strong>{cliente.nombre}</strong>
                <span>Email: {cliente.email}</span>
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

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="nombre">Nombre:</label>
                <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="telefono">Teléfono:</label>
                <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="direccion">Dirección:</label>
                <textarea id="direccion" name="direccion" value={formData.direccion} onChange={handleInputChange} />
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

export default GestionClientesPage;