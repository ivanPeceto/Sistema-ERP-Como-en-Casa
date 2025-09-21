/**
 * @file GestionRecetasPage.tsx
 * @brief Página principal para la gestión de recetas.
 * @details
 * Este componente de React implementa una interfaz de usuario completa para las operaciones
 * CRUD sobre las recetas. Se comunica con los servicios `receta_service` e `insumo_service`
 * para interactuar con el backend. Incluye funcionalidades de búsqueda, un modal para la
 * edición y creación, un modal para la visualización de insumos, y feedback para el usuario.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/gestionProductosPage.module.css';
import formStyles from '../styles/formStyles.module.css';
import { getRecetas, createReceta, updateReceta, deleteReceta } from '../services/receta_service';
import { getInsumos } from '../services/insumo_service';
import { type Receta, type RecetaInput, type Insumo } from '../types/models';

interface RecetaInsumoForm {
  insumo_id: number;
  cantidad: number;
}

/**
 * @brief Componente funcional para la página de gestión de recetas.
 * @returns {React.ReactElement} El JSX que renderiza la página completa.
 */
const GestionRecetasPage: React.FC = () => {
    const navigate = useNavigate();
    const [recetas, setRecetas] = useState<Receta[]>([]);
    const [filteredRecetas, setFilteredRecetas] = useState<Receta[]>([]);
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingReceta, setEditingReceta] = useState<Receta | null>(null);
    const [viewingReceta, setViewingReceta] = useState<Receta | null>(null); 
    
    const [formData, setFormData] = useState<RecetaInput>({
        nombre: '',
        descripcion: '',
        insumos_data: [],
    });

    /**
     * @brief Carga la lista de recetas desde el servicio y actualiza el estado.
     * @details Se envuelve en `useCallback` para evitar recrearse en cada render, optimizando el rendimiento.
     */
    const fetchRecetas = useCallback(async () => {
        try {
            const data = await getRecetas();
            setRecetas(data);
            setFilteredRecetas(data);
        } catch (error) {
            console.error('Error al cargar recetas:', error);
        }
    }, []);

    /**
     * @brief Carga la lista de insumos desde el servicio.
     * @details Se utiliza para poblar el `<select>` en el formulario del modal.
     */
    const fetchInsumos = useCallback(async () => {
        try {
            const data = await getInsumos();
            setInsumos(data);
        } catch (error) {
            console.error('Error al cargar insumos:', error);
        }
    }, []);

    useEffect(() => {
        fetchRecetas();
        fetchInsumos();
    }, [fetchRecetas, fetchInsumos]);

    /**
     * @brief Efecto para filtrar las recetas.
     * @details Filtra por el término de búsqueda en nombre, descripción o insumos.
     */
    useEffect(() => {
        let results = recetas;
        if (searchTerm) {
            const lowercasedValue = searchTerm.toLowerCase();
            results = results.filter(r =>
                r.nombre.toLowerCase().includes(lowercasedValue) ||
                r.descripcion?.toLowerCase().includes(lowercasedValue) ||
                r.insumos.some(ri => ri.insumo.nombre.toLowerCase().includes(lowercasedValue))
            );
        }
        setFilteredRecetas(results);
    }, [searchTerm, recetas]);

    /**
     * @brief Actualiza el estado del término de búsqueda.
     * @param {ChangeEvent<HTMLInputElement>} event El evento del input de búsqueda.
     */
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    /**
     * @brief Manejador genérico para todos los inputs del formulario del modal.
     * @details Actualiza el estado `formData` basándose en el `name` del input.
     * @param {ChangeEvent<...>} event El evento del campo del formulario.
     */
    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * @brief Maneja la actualización de los insumos en el formulario.
     * @param {number} index El índice del insumo en el array.
     * @param {keyof RecetaInsumoForm} field El campo a actualizar (`insumo_id` o `cantidad`).
     * @param {string} value El nuevo valor.
     */
    const handleInsumoChange = (index: number, field: keyof RecetaInsumoForm, value: string) => {
      const newInsumosData = [...formData.insumos_data];
      newInsumosData[index] = {
        ...newInsumosData[index],
        [field]: field === 'cantidad' ? parseFloat(value) : parseInt(value),
      };
      setFormData(prev => ({ ...prev, insumos_data: newInsumosData }));
    };
  
    /**
     * @brief Añade un nuevo insumo al formulario.
     */
    const addInsumo = () => {
      setFormData(prev => ({
        ...prev,
        insumos_data: [...prev.insumos_data, { insumo_id: insumos[0]?.id || 0, cantidad: 0 }],
      }));
    };
  
    /**
     * @brief Elimina un insumo del formulario.
     * @param {number} index El índice del insumo a eliminar.
     */
    const removeInsumo = (index: number) => {
      const newInsumosData = [...formData.insumos_data];
      newInsumosData.splice(index, 1);
      setFormData(prev => ({ ...prev, insumos_data: newInsumosData }));
    };

    /**
     * @brief Abre el modal y configura el formulario para crear o editar una receta.
     * @param {Receta | null} receta La receta a editar, o `null` para crear una nueva.
     */
    const openModal = useCallback((receta: Receta | null = null) => {
        if (receta) {
            setEditingReceta(receta);
            setFormData({
                nombre: receta.nombre,
                descripcion: receta.descripcion,
                insumos_data: receta.insumos.map(ri => ({
                    insumo_id: ri.insumo.id,
                    cantidad: ri.cantidad,
                })),
            });
        } else {
            setEditingReceta(null);
            setFormData({
                nombre: '',
                descripcion: '',
                insumos_data: [{ insumo_id: insumos[0]?.id || 0, cantidad: 0 }],
            });
        }
        setIsModalOpen(true);
    }, [insumos]);

    /**
     * @brief Cierra el modal de creación/edición y resetea el estado.
     */
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingReceta(null);
    }, []);

    /**
     * @brief Abre el modal de visualización de insumos.
     * @param {Receta} receta La receta cuyos insumos se van a mostrar.
     */
    const openViewModal = (receta: Receta) => {
        setViewingReceta(receta);
    };

    /**
     * @brief Cierra el modal de visualización de insumos.
     */
    const closeViewModal = () => {
        setViewingReceta(null);
    };

    /**
     * @brief Maneja el envío del formulario, llamando al servicio de crear o actualizar.
     * @param {FormEvent<HTMLFormElement>} event El evento de envío del formulario.
     */
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (editingReceta) {
                await updateReceta(editingReceta.id, formData);
            } else {
                await createReceta(formData);
            }

            fetchRecetas();
            closeModal();
        } catch (error: any) {
            console.error('Error al guardar receta:', error);
            const errorMessage = error.response?.data?.detail || 'Error al guardar el producto.';
            console.error(errorMessage);
        }
    };
/**
     * @brief Maneja la eliminación de una receta.
     * @details Elimina la receta sin confirmación previa para un flujo más rápido.
     * @param {number} recetaId El ID de la receta a eliminar.
     */
    const handleDelete = async (recetaId: number) => {
      try {
          await deleteReceta(recetaId);
          fetchRecetas();
      } catch (error) {
          console.error('Error al eliminar receta:', error);
      }
    };

    return (
        <div className={styles.pageContainer}>
            <h1>Gestión de Recetas</h1>

            <div className={styles.toolbar}>
                <div className={styles.searchBarContainer}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o insumo..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                    <div className={styles.toolbarButtons}>
                      <button
                          onClick={() => navigate('/gestion/insumos')}
                          className={`${styles.addButton} ${styles.secondaryButton}`}
                      >
                        Gestionar Insumos
                      </button>
                      <button onClick={() => openModal()} className={styles.addButton}>
                          Nueva Receta
                      </button>
                    </div>
                </div>
            </div>

            <div className={styles.listContainer}>
                {filteredRecetas.length > 0 ? (
                    filteredRecetas.map((receta) => (
                        <div
                            key={receta.id}
                            className={`${styles.listItem}`}
                        >
                            <div className={styles.itemActions}>
                                <button onClick={() => openViewModal(receta)} className={`${styles.editButton} ${styles.secondaryButton}`}>Ver</button>
                                <button onClick={() => openModal(receta)} className={styles.editButton}>Editar</button>
                                <button onClick={() => handleDelete(receta.id)} className={styles.deleteButton}>Eliminar</button>
                            </div>
                            <div className={styles.itemInfo}>
                                <strong>{receta.nombre}</strong>
                                <span>{receta.descripcion}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.noResults}>No se encontraron recetas.</p>
                )}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>{editingReceta ? 'Editar Receta' : 'Nueva Receta'}</h2>
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
                            <div className={formStyles.formSection}>
                                <h3 className={formStyles.formSectionTitle}>Insumos</h3>
                                {formData.insumos_data.map((insumoItem, index) => (
                                    <div key={index} className={formStyles.formField}>
                                        <label className={formStyles.formLabel}>Insumo #{index + 1}</label>
                                        <div className={formStyles.inlineFormFields}>
                                            <select
                                                value={insumoItem.insumo_id}
                                                onChange={(e) => handleInsumoChange(index, 'insumo_id', e.target.value)}
                                                required
                                                className={formStyles.formSelect}
                                            >
                                                {insumos.map(insumo => (
                                                    <option key={insumo.id} value={insumo.id}>{insumo.nombre} ({insumo.unidad_medida})</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                value={insumoItem.cantidad}
                                                onChange={(e) => handleInsumoChange(index, 'cantidad', e.target.value)}
                                                step="0.01"
                                                required
                                                className={formStyles.formInput}
                                            />
                                            <button type="button" onClick={() => removeInsumo(index)} className={formStyles.deleteButton}>X</button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={addInsumo} className={formStyles.secondaryButton}>
                                    Añadir Insumo
                                </button>
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
                                    {editingReceta ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {viewingReceta && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>Insumos para "{viewingReceta.nombre}"</h2>
                        <div className={formStyles.formSection}>
                            <h3 className={formStyles.formSectionTitle}>Lista de Insumos</h3>
                            {viewingReceta.insumos.length > 0 ? (
                                <ul>
                                    {viewingReceta.insumos.map((ri, index) => (
                                        <li key={index}>
                                            <strong>{ri.insumo.nombre}</strong>: {ri.cantidad} {ri.insumo.unidad_medida}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No hay insumos definidos para esta receta.</p>
                            )}
                        </div>
                        <div className={formStyles.formButtons}>
                            <button
                                type="button"
                                onClick={closeViewModal}
                                className={formStyles.secondaryButton}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionRecetasPage;