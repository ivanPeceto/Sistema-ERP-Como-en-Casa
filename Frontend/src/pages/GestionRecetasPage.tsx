/**
 * @file GestionRecetasPage.tsx
 * @brief Página principal para la gestión de recetas.
 * @details
 * Este componente de React implementa una interfaz de usuario completa para las operaciones
 * CRUD sobre las recetas. Ahora utiliza un componente de modal externo para la creación
 * y edición de recetas, manteniendo el código más limpio y modular.
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/gestionProductosPage.module.css';
import formStyles from '../styles/formStyles.module.css';
import { getRecetas, deleteReceta } from '../services/receta_service';
import { getInsumos } from '../services/insumo_service';
import { type Receta, type Insumo } from '../types/models';
import CrearRecetaModal from '../components/modals/CrearRecetaModal';

interface GestionRecetasPageProps {}

const GestionRecetasPage: React.FC = () => {
    const navigate = useNavigate();
    const [recetas, setRecetas] = useState<Receta[]>([]);
    const [filteredRecetas, setFilteredRecetas] = useState<Receta[]>([]);
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    const [isCrearRecetaModalOpen, setIsCrearRecetaModalOpen] = useState<boolean>(false);
    const [editingReceta, setEditingReceta] = useState<Receta | null>(null);
    const [viewingReceta, setViewingReceta] = useState<Receta | null>(null); 
    
    const fetchRecetas = useCallback(async () => {
        try {
            const data = await getRecetas();
            setRecetas(data);
            setFilteredRecetas(data);
        } catch (error) {
            console.error('Error al cargar recetas:', error);
        }
    }, []);

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

    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const openModal = useCallback((receta: Receta | null = null) => {
        setEditingReceta(receta);
        setIsCrearRecetaModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsCrearRecetaModalOpen(false);
        setEditingReceta(null);
    }, []);

    const openViewModal = (receta: Receta) => {
        setViewingReceta(receta);
    };

    const closeViewModal = () => {
        setViewingReceta(null);
    };

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
            <div className={styles.toolbar}>
                {/* Reorganizmos los botones de la misma forma que en la página de productos */}
                <div className={styles.searchBarContainer}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o insumo..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                    <button onClick={() => openModal()} className={styles.addButton}>
                        Nueva Receta
                    </button>
                </div>
                <div className={styles.toolbarButtons}>
                    <button
                        onClick={() => navigate('/gestion/insumos')}
                        className={`${styles.addButton} ${styles.secondaryButton}`}
                    >
                        Gestionar Insumos
                    </button>
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
                                <button onClick={() => openViewModal(receta)} className={`${styles.viewButton} ${styles.secondaryButton}`}>Ver</button>
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

            {viewingReceta && (
                <div className={formStyles.modalOverlay}>
                    <div className={formStyles.modalContent}>
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

            <CrearRecetaModal
              isOpen={isCrearRecetaModalOpen}
              onClose={closeModal}
              fetchRecetas={fetchRecetas}
              editingReceta={editingReceta}
              insumos={insumos}
            />
        </div>
    );
};

export default GestionRecetasPage;