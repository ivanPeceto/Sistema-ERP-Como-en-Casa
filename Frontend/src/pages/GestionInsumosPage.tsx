/**
 * @file GestionInsumosPage.tsx
 * @brief Página principal para la gestión de insumos.
 * @details
 * Este componente de React implementa una interfaz de usuario completa para las operaciones
 * CRUD sobre los insumos. Se comunica con el servicio `insumo_service` para interactuar
 * con el backend. Incluye un modal para la edición y creación, y un sistema de feedback para el usuario.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/gestionProductosPage.module.css';
import formStyles from '../styles/formStyles.module.css';
import { getInsumos, createInsumo, updateInsumo, deleteInsumo } from '../services/insumo_service';
import { type Insumo } from '../types/models';

interface GestionInsumosPageProps {}

/**
 * @brief Componente funcional para la página de gestión de insumos.
 * @returns {React.ReactElement} El JSX que renderiza la página completa.
 */
const GestionInsumosPage: React.FC<GestionInsumosPageProps> = () => {
  const navigate = useNavigate();
  
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [filteredInsumos, setFilteredInsumos] = useState<Insumo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
  
  const [formData, setFormData] = useState<Omit<Insumo, 'id'>>({
    nombre: '',
    unidad_medida: '',
    stock_actual: 0,
    costo_unitario: 0,
  });

  /**
   * @brief Carga la lista de insumos desde el servicio y actualiza el estado.
   * @details Se envuelve en `useCallback` para evitar recrearse en cada render.
   */
  const fetchInsumos = useCallback(async () => {
    try {
      const data = await getInsumos();
      setInsumos(data);
      setFilteredInsumos(data);
    } catch (error) {
      console.error('Error al cargar insumos:', error);
    }
  }, []);

  useEffect(() => {
    fetchInsumos();
  }, [fetchInsumos]);

  /**
   * @brief Actualiza la lista de insumos filtrados cuando la lista principal cambia.
   */
  useEffect(() => {
    setFilteredInsumos(insumos);
  }, [insumos]);

  /**
   * @brief Manejador genérico para todos los inputs del formulario del modal.
   * @details Actualiza el estado `formData` basándose en el `name` del input.
   * @param {ChangeEvent<HTMLInputElement>} event El evento del campo del formulario.
   */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;

    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  /**
   * @brief Abre el modal y configura el formulario para crear o editar un insumo.
   * @param {Insumo | null} insumo El insumo a editar, o `null` para crear uno nuevo.
   */
  const openModal = useCallback((insumo: Insumo | null = null) => {
    if (insumo) {
      setEditingInsumo(insumo);
      setFormData({
        nombre: insumo.nombre,
        unidad_medida: insumo.unidad_medida,
        stock_actual: +insumo.stock_actual,
        costo_unitario: +insumo.costo_unitario,
      });
    } else {
      setEditingInsumo(null);
      setFormData({
        nombre: '',
        unidad_medida: '',
        stock_actual: 0,
        costo_unitario: 0,
      });
    }
    setIsModalOpen(true);
  }, []);

  /**
   * @brief Cierra el modal y resetea el estado de edición.
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingInsumo(null);
  }, []);

  /**
   * @brief Maneja el envío del formulario, llamando al servicio de crear o actualizar.
   * @param {FormEvent<HTMLFormElement>} event El evento de envío del formulario.
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (editingInsumo) {
        await updateInsumo(editingInsumo.id, formData);
      } else {
        await createInsumo(formData);
      }

      fetchInsumos();
      closeModal();
    } catch (error: any) {
        console.error('Error al guardar insumo:', error);
        if (error.response) {
            console.error('Detalles del error:', error.response.data);
            alert('Error: ' + JSON.stringify(error.response.data));
        } else {
            console.error('Error al guardar el insumo. No se recibió respuesta del servidor.');
            alert('Error al guardar el insumo. No se recibió respuesta del servidor.');
        }
    }
  };
    /**
     * @brief Maneja la eliminación de un insumo.
     * @details Elimina el insumo sin confirmación previa para un flujo más rápido.
     * @param {number} insumoId El ID del insumo a eliminar.
     */
    const handleDelete = async (insumoId: number) => {
      try {
        await deleteInsumo(insumoId);
        fetchInsumos();
      } catch (error) {
        console.error('Error al eliminar insumo:', error);
      }
    };

  return (
    <div className={styles.pageContainer}>
      <h1>Gestión de Insumos</h1>

      <div className={styles.toolbar}>
        <div className={styles.toolbarButtons}>
          <button
              onClick={() => navigate('/gestion/recetas')}
              className={`${styles.addButton} ${styles.secondaryButton}`}
          >
            Volver
          </button>
        </div>
        <div className={styles.toolbarButtons}>
          <button onClick={() => openModal()} className={styles.addButton}>
            Nuevo Insumo
          </button>
        </div>
      </div>

      <div className={styles.listContainer}>
        {filteredInsumos.length > 0 ? (
          filteredInsumos.map((insumo) => (
            <div
              key={insumo.id}
              className={styles.listItem}
            >
              <div className={styles.itemActions}>
                <button onClick={() => openModal(insumo)} className={styles.editButton}>Editar</button>
                <button onClick={() => handleDelete(insumo.id)} className={styles.deleteButton}>Eliminar</button>
              </div>
              <div className={styles.itemInfo}>
                <strong>{insumo.nombre}</strong>
                <span>Unidad de medida: {insumo.unidad_medida}</span>
                <span>Stock: {insumo.stock_actual}</span>
                <span>Costo: ${insumo.costo_unitario}</span>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>No se encontraron insumos.</p>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>{editingInsumo ? 'Editar Insumo' : 'Nuevo Insumo'}</h2>
            <form onSubmit={handleSubmit} className={formStyles.formContainer}>
              <div className={formStyles.formSection}>
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
                  <label className={`${formStyles.formLabel} ${formStyles.requiredLabel}`} htmlFor="unidad_medida">Unidad de Medida</label>
                  <input
                    type="text"
                    id="unidad_medida"
                    name="unidad_medida"
                    value={formData.unidad_medida}
                    onChange={handleInputChange}
                    required
                    className={formStyles.formInput}
                  />
                </div>
                <div className={formStyles.formField}>
                  <label className={`${formStyles.formLabel} ${formStyles.requiredLabel}`} htmlFor="stock_actual">Stock Actual</label>
                  <input
                    type="number"
                    id="stock_actual"
                    name="stock_actual"
                    value={formData.stock_actual}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    className={formStyles.formInput}
                  />
                </div>
                <div className={formStyles.formField}>
                  <label className={`${formStyles.formLabel} ${formStyles.requiredLabel}`} htmlFor="costo_unitario">Costo Unitario</label>
                  <input
                    type="number"
                    id="costo_unitario"
                    name="costo_unitario"
                    value={formData.costo_unitario}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    className={formStyles.formInput}
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
                  {editingInsumo ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionInsumosPage;