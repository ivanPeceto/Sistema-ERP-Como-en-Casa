/**
 * @file CrearRecetaModal.tsx
 * @brief Modal para crear o editar recetas con soporte para Insumos y Sub-Recetas.
 */
import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import formStyles from '../../../styles/formStyles.module.css';
import recetasStyles from  './CrearRecetaModal.module.css';
import { createReceta, updateReceta } from '../../../services/receta_service';
import { type Receta, type RecetaInput, type Insumo } from '../../../types/models';

interface CrearRecetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchRecetas: () => void;
  editingReceta: Receta | null;
  insumos: Insumo[];
  recetasDisponibles: Receta[]; 
}

const CrearRecetaModal: React.FC<CrearRecetaModalProps> = ({
  isOpen,
  onClose,
  fetchRecetas,
  editingReceta,
  insumos,
  recetasDisponibles
}) => {
    const [formData, setFormData] = useState<RecetaInput>({
        nombre: '',
        descripcion: '',
        insumos: [],
        sub_recetas: [] 
    });

    useEffect(() => {
      if (editingReceta) {
          setFormData({
              nombre: editingReceta.nombre,
              descripcion: editingReceta.descripcion,
              insumos: editingReceta.insumos.map(ri => ({
                  insumo_id: ri.insumo_id,
                  cantidad: ri.cantidad,
              })),
              sub_recetas: editingReceta.sub_recetas.map(sr => ({
                  receta_hija_id: sr.receta_hija_id,
                  cantidad: sr.cantidad
              }))
          });
      } else {
          setFormData({
              nombre: '',
              descripcion: '',
              insumos: [],
              sub_recetas: []
          });
      }
    }, [editingReceta, isOpen]); 

    // --- Handlers Generales ---
    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- Lógica de Insumos ---
    const addInsumo = () => {
        if (insumos.length === 0) return alert("No hay insumos registrados.");
        setFormData(prev => ({
            ...prev,
            insumos: [...prev.insumos, { insumo_id: insumos[0].id, cantidad: 0 }],
        }));
    };

    const removeInsumo = (index: number) => {
        const newData = [...formData.insumos];
        newData.splice(index, 1);
        setFormData(prev => ({ ...prev, insumos: newData }));
    };

    const handleInsumoChange = (index: number, field: 'insumo_id' | 'cantidad', value: string) => {
        const newData = [...formData.insumos];
        newData[index] = {
            ...newData[index],
            [field]: field === 'cantidad' ? parseFloat(value) : parseInt(value),
        };
        setFormData(prev => ({ ...prev, insumos: newData }));
    };

    // --- Lógica de Sub-Recetas ---
    const addSubReceta = () => {
        // Filtramos para no sugerir la misma receta que estamos editando 
        const disponibles = editingReceta 
            ? recetasDisponibles.filter(r => r.id !== editingReceta.id)
            : recetasDisponibles;

        if (disponibles && disponibles.length === 0) return alert("No hay otras recetas disponibles para agregar.");

        setFormData(prev => ({
            ...prev,
            sub_recetas: [...prev.sub_recetas, { receta_hija_id: disponibles[0].id, cantidad: 0 }],
        }));
    };

    const removeSubReceta = (index: number) => {
        const newData = [...formData.sub_recetas];
        newData.splice(index, 1);
        setFormData(prev => ({ ...prev, sub_recetas: newData }));
    };

    const handleSubRecetaChange = (index: number, field: 'receta_hija_id' | 'cantidad', value: string) => {
        const newData = [...formData.sub_recetas];
        newData[index] = {
            ...newData[index],
            [field]: field === 'cantidad' ? parseFloat(value) : parseInt(value),
        };
        setFormData(prev => ({ ...prev, sub_recetas: newData }));
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
            const msg = error.response?.data?.detail || 'Error al procesar la solicitud.';
            alert(msg);
        }
    };

    if (!isOpen) return null;

    const opcionesRecetas = editingReceta 
        ? recetasDisponibles.filter(r => r.id !== editingReceta.id) 
        : recetasDisponibles;

    return (
        <div className={formStyles.modalOverlay}>
            <div className={formStyles.modalContent} style={{maxWidth: 'fit-content'}}>
                <h2>{editingReceta ? 'Editar Receta' : 'Nueva Receta'}</h2>
                <form onSubmit={handleSubmit} className={formStyles.formContainer}>
                    <div className={recetasStyles.innerLayoutRow} >
                        <div className={recetasStyles.innerLayoutCol}>
                            <div className={formStyles.formSection}>
                                <div className={formStyles.formField}>
                                    <label className={formStyles.formLabel}>Nombre</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        required
                                        className={formStyles.formInput}
                                    />
                                </div>
                                <div className={formStyles.formField}>
                                    <label className={formStyles.formLabel}>Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleInputChange}
                                        className={recetasStyles.formTextarea}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={recetasStyles.innerLayoutCol}>
                            <div className={formStyles.formSection} style={{minWidth: '20rem'}}>
                                <h3 className={formStyles.formSectionTitle}>
                                    Insumos Base
                                    <button type="button" onClick={addInsumo} className={recetasStyles.addButton} >
                                        +
                                    </button>
                                </h3>
                                <div className={formStyles.insumosListContainer} style={{maxHeight:'6rem', overflowY:'auto'}}>
                                    {formData.insumos.map((item, index) => (
                                        <div key={`ins-${index}`} className={formStyles.inlineFormFields} style={{marginBottom:'10px'}}>
                                            <select
                                                value={item.insumo_id}
                                                onChange={(e) => handleInsumoChange(index, 'insumo_id', e.target.value)}
                                                className={formStyles.formSelect}
                                                style={{flex: 2}}
                                            >
                                                {insumos.map(ins => (
                                                    <option key={ins.id} value={ins.id}>{ins.nombre} ({ins.unidad_medida})</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                value={item.cantidad}
                                                onChange={(e) => handleInsumoChange(index, 'cantidad', e.target.value)}
                                                step="0.01"
                                                className={formStyles.formInput}
                                                style={{maxWidth: '6rem'}}
                                                placeholder="Cant."
                                            />
                                            <button type="button" onClick={() => removeInsumo(index)} className={formStyles.deleteButton}>×</button>
                                        </div>
                                    ))}
                                    {formData.insumos.length === 0 && <p style={{color:'#999', fontSize:'0.9rem', fontStyle:'italic'}}>Sin insumos directos.</p>}
                                </div>
                            </div>
                        </div>
                        <div className={recetasStyles.innerLayoutCol}>
                            <div className={formStyles.formSection} style={{minWidth: '20rem'}}>
                                <h3 className={formStyles.formSectionTitle}>
                                    Sub-Recetas
                                    <button type="button" onClick={addSubReceta} className={recetasStyles.addButton}>
                                        + 
                                    </button>
                                </h3>
                                <div className={formStyles.insumosListContainer} style={{maxHeight:'250px', overflowY:'auto'}}>
                                    {formData.sub_recetas.map((item, index) => (
                                        <div key={`sub-${index}`} className={formStyles.inlineFormFields} style={{marginBottom:'10px'}}>
                                            <select
                                                value={item.receta_hija_id}
                                                onChange={(e) => handleSubRecetaChange(index, 'receta_hija_id', e.target.value)}
                                                className={formStyles.formSelect}
                                                style={{flex: 2}}
                                            >
                                                {opcionesRecetas.map(rec => (
                                                    <option key={rec.id} value={rec.id}>{rec.nombre}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                value={item.cantidad}
                                                onChange={(e) => handleSubRecetaChange(index, 'cantidad', e.target.value)}
                                                step="0.01"
                                                className={formStyles.formInput}
                                                style={{maxWidth: '6rem'}}
                                                placeholder="Cant."
                                            />
                                            <button type="button" onClick={() => removeSubReceta(index)} className={formStyles.deleteButton}>×</button>
                                        </div>
                                    ))}
                                    {formData.sub_recetas.length === 0 && <p style={{color:'#999', fontSize:'0.9rem', fontStyle:'italic'}}>Sin sub-recetas.</p>}
                                </div>
                            </div>   
                        </div>
                    </div>
                    <div className={formStyles.formButtons}>
                        <button type="button" onClick={onClose} className={formStyles.secondaryButton}>Cancelar</button>
                        <button type="submit" className={formStyles.primaryButton}>
                            {editingReceta ? 'Actualizar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearRecetaModal;