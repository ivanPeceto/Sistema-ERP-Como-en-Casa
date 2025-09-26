import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import formStyles from '../../styles/formStyles.module.css';
import { createReceta, updateReceta } from '../../services/receta_service';
import { type Receta, type RecetaInput, type Insumo } from '../../types/models';

interface RecetaInsumoForm {
  insumo_id: number;
  cantidad: number;
}

interface CrearRecetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchRecetas: () => void;
  editingReceta: Receta | null;
  insumos: Insumo[];
}

const CrearRecetaModal: React.FC<CrearRecetaModalProps> = ({
  isOpen,
  onClose,
  fetchRecetas,
  editingReceta,
  insumos,
}) => {
    const [formData, setFormData] = useState<RecetaInput>({
        nombre: '',
        descripcion: '',
        insumos_data: [],
    });

    useEffect(() => {
      if (editingReceta) {
          setFormData({
              nombre: editingReceta.nombre,
              descripcion: editingReceta.descripcion,
              insumos_data: editingReceta.insumos.map(ri => ({
                  insumo_id: ri.insumo.id,
                  cantidad: ri.cantidad,
              })),
          });
      } else {
          setFormData({
              nombre: '',
              descripcion: '',
              insumos_data: insumos.length > 0 ? [{ insumo_id: insumos[0].id, cantidad: 0 }] : [],
          });
      }
    }, [editingReceta, insumos]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInsumoChange = (index: number, field: keyof RecetaInsumoForm, value: string) => {
        const newInsumosData = [...formData.insumos_data];
        newInsumosData[index] = {
            ...newInsumosData[index],
            [field]: field === 'cantidad' ? parseFloat(value) : parseInt(value),
        };
        setFormData(prev => ({ ...prev, insumos_data: newInsumosData }));
    };
  
    const addInsumo = () => {
        setFormData(prev => ({
            ...prev,
            insumos_data: [...prev.insumos_data, { insumo_id: insumos[0]?.id || 0, cantidad: 0 }],
        }));
    };
  
    const removeInsumo = (index: number) => {
        const newInsumosData = [...formData.insumos_data];
        newInsumosData.splice(index, 1);
        setFormData(prev => ({ ...prev, insumos_data: newInsumosData }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            if (editingReceta) {
                await updateReceta(editingReceta.id, formData);
            } else {
                await createReceta(formData);
            }
            fetchRecetas();
            onClose();
        } catch (error: any) {
            console.error('Error al guardar receta:', error);
            const errorMessage = error.response?.data?.detail || 'Error al guardar el producto.';
            console.error(errorMessage);
            alert(errorMessage);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={formStyles.modalOverlay}>
            <div className={formStyles.modalContent}>
                <h2>{editingReceta ? 'Editar Receta' : 'Nueva Receta'}</h2>
                <form onSubmit={handleSubmit} className={formStyles.formContainer}>
                    <div className={formStyles.formGrid}>
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
                        <div className={formStyles.formSectionScrollable}>
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
                    </div>
                    <div className={formStyles.formButtons}>
                        <button
                            type="button"
                            onClick={onClose}
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
    );
};

export default CrearRecetaModal;