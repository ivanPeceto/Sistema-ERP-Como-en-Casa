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
import styles from '../styles/gestionRecetasPage.module.css';
import formStyles from '../styles/formStyles.module.css';
import { getRecetas, deleteReceta } from '../services/receta_service';
import { getInsumos } from '../services/insumo_service';
import { type Receta, type Insumo } from '../types/models';
import CrearRecetaModal from '../components/modals/CrearRecetaModal/CrearRecetaModal';

interface GestionRecetasPageProps {}

const GestionRecetasPage: React.FC<GestionRecetasPageProps> = () => {
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
                r.insumos.some(ri => ri.insumo_nombre.toLowerCase().includes(lowercasedValue))
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

    const renderViewModalContent = () => {
        if (!viewingReceta) return null;
        
        return (
            <div className={formStyles.modalOverlay}>
                <div className={`${formStyles.modalContent} ${styles.viewModalContent}`}>
                    <div className={styles.viewGrid}>
                        
                        <div className={styles.detailColumn}>
                            <h2 className={styles.recipeTitle}>{viewingReceta.nombre}</h2>
                            <h4 className={styles.columnHeader}>Descripción / Pasos</h4>
                            <p className={styles.columnContent}>
                                {viewingReceta.descripcion || <span className={styles.emptyText}>Sin descripción disponible.</span>}
                            </p>
                        </div>

                        <div className={styles.detailColumn}>
                            <h4 className={styles.columnHeader}>Insumos</h4>
                            {viewingReceta.insumos.length > 0 ? (
                                <ul className={styles.ingredientList}>
                                    {viewingReceta.insumos.map((ri, index) => (
                                        <li key={index} className={styles.ingredientItem}>
                                            <span style={{color: '#09c935', fontWeight:'bold'}}>{ri.cantidad} {ri.insumo_unidad}</span>
                                            {' '} de {ri.insumo_nombre}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={styles.emptyText}>No requiere insumos directos.</p>
                            )}
                        </div>

                        <div className={styles.detailColumn}>
                            <h4 className={styles.columnHeader}>Composición (Sub-Recetas)</h4>
                            {viewingReceta.sub_recetas && viewingReceta.sub_recetas.length > 0 ? (
                                <ul className={styles.ingredientList}>
                                    {viewingReceta.sub_recetas.map((sr, index) => (
                                        <li key={index} className={styles.ingredientItem}>
                                            <span style={{color: '#ffc107', fontWeight:'bold'}}>{sr.cantidad} un.</span>
                                            {' '} de {sr.receta_hija_nombre}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={styles.emptyText}>No incluye sub-recetas.</p>
                            )}
                        </div>
                    </div>

                    {viewingReceta.costo_estimado !== undefined && (
                        <div className={styles.costSection}>
                            <span className={styles.costLabel}>Costo Estimado: <span className={styles.costValue}>${viewingReceta.costo_estimado}</span></span>
                            
                            <button type="button" onClick={closeViewModal} className={formStyles.secondaryButton}>
                                Cerrar
                            </button>

                        </div>
                    )}
                </div>
            </div>
        );
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
                    <button onClick={() => openModal()} className={styles.addButton}>
                        Nueva Receta
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
                            <div className={styles.itemInfo}>
                                <strong>{receta.nombre}</strong>
                                <span style={{fontSize:'0.85rem', color:'#666'}}>
                                  {receta.insumos.length} insumos {receta.sub_recetas?.length > 0 && ` + ${receta.sub_recetas.length} sub-recetas`}
                                </span>
                            </div>
                            <div className={styles.itemActions}>
                                <button onClick={() => openViewModal(receta)} className={`${styles.viewButton} ${styles.secondaryButton}`}>Ver</button>
                                <button onClick={() => openModal(receta)} className={styles.editButton}>Editar</button>
                                <button onClick={() => handleDelete(receta.id)} className={styles.deleteButton}>Eliminar</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.noResults}>No se encontraron recetas.</p>
                )}
            </div>

            {renderViewModalContent()}

            <CrearRecetaModal
              isOpen={isCrearRecetaModalOpen}
              onClose={closeModal}
              fetchRecetas={fetchRecetas}
              editingReceta={editingReceta}
              insumos={insumos}
              recetasDisponibles={recetas} 
            />
        </div>
    );
};

export default GestionRecetasPage;