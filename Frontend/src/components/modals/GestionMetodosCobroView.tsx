import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import formStyles from '../../styles/formStyles.module.css';
import styles from '../modals/GestionCobrosModal.module.css'; 
import { createMetodoCobro, updateMetodoCobro, deleteMetodoCobro, getMetodosCobro } from '../../services/metodo_cobro_service';
import { type MetodoCobro } from '../../types/models';

interface GestionMetodosCobroViewProps {
    onBack: () => void; 
}

type MetodoCobroInput = Omit<MetodoCobro, 'id'>;

const GestionMetodosCobroView: React.FC<GestionMetodosCobroViewProps> = ({ onBack }) => {
    const [metodos, setMetodos] = useState<MetodoCobro[]>([]);
    const [formData, setFormData] = useState<MetodoCobroInput>({ nombre: '' });
    const [editingMetodo, setEditingMetodo] = useState<MetodoCobro | null>(null);

    const fetchMetodos = useCallback(async () => {
        try {
            const data = await getMetodosCobro();
            if (Array.isArray(data)) {
                setMetodos(data);
            } else {
                setMetodos([]);
            }
        } catch (error) {
            console.error('Error al cargar métodos de cobro:', error);
            setMetodos([]);
        }
    }, []);

    useEffect(() => {
        fetchMetodos();
    }, [fetchMetodos]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData({ nombre: value });
    };

    const handleEditStart = (metodo: MetodoCobro) => {
        setEditingMetodo(metodo);
        setFormData({ nombre: metodo.nombre });
    };

    const handleCancel = () => {
        setEditingMetodo(null);
        setFormData({ nombre: '' });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (editingMetodo) {
                await updateMetodoCobro(editingMetodo.id, formData);
            } else {
                await createMetodoCobro(formData);
            }
            fetchMetodos();
            handleCancel();
        } catch (error) {
            console.error('Error al guardar método de cobro:', error);
            alert('Error al guardar método de cobro.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Está seguro de que desea eliminar este método de cobro?')) {
            try {
                await deleteMetodoCobro(id);
                fetchMetodos();
            } catch (error) {
                console.error('Error al eliminar método de cobro:', error);
                alert('Error al eliminar método de cobro.');
            }
        }
    };

    return (
        <div className={formStyles.formContainer}>
            
            <div className={formStyles.formSection}>
                <h3 className={formStyles.formSectionTitle}>{editingMetodo ? 'Editar Método' : 'Nuevo Método'}</h3>
                
                {/* Contenedor para centrar el formulario de creación */}
                <div className={styles.centeredFormWrapper}>
                    <form onSubmit={handleSubmit} className={styles.metodosForm}>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            className={`${formStyles.formInput} ${styles.metodosInputWidth}`}
                            placeholder="Nombre del método (Ej: Efectivo, Tarjeta VISA)"
                            required
                        />
                        <button type="submit" className={`${formStyles.primaryButton} ${styles.smallButton}`}>
                            {editingMetodo ? 'Actualizar' : 'Crear'}
                        </button>
                        {editingMetodo && (
                            <button type="button" onClick={handleCancel} className={`${formStyles.secondaryButton} ${styles.smallButton}`}>
                                Cancelar Edición
                            </button>
                        )}
                    </form>
                </div>
            </div>

            <div className={formStyles.formSection}>
                <h3 className={formStyles.formSectionTitle}>Métodos Existentes</h3>
                <div className={styles.cobrosList}>
                    {Array.isArray(metodos) && metodos.map(metodo => (
                        <div key={metodo.id} className={styles.cobroItem}>
                            <span>{metodo.nombre}</span>
                            <div className={styles.itemActions}>
                                <button onClick={() => handleEditStart(metodo)} className={formStyles.editButton}>Editar</button>
                                <button onClick={() => handleDelete(metodo.id)} className={formStyles.deleteButton}>X</button>
                            </div>
                        </div>
                    ))}
                    {Array.isArray(metodos) && metodos.length === 0 && <p>No hay métodos de cobro registrados.</p>}
                </div>
            </div>
        </div>
    );
};

export default GestionMetodosCobroView;