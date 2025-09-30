import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import formStyles from '../../styles/formStyles.module.css';
import { createCobro, updateCobro } from '../../services/cobro_service';
import { type Cobro, type CobroInput, type MetodoCobro } from '../../types/models';

interface CrearEditarCobroModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchCobros: () => void;
  pedidoId: number;
  editingCobro: Cobro | null;
  metodosCobro: MetodoCobro[];
}

const CrearEditarCobroModal: React.FC<CrearEditarCobroModalProps> = ({
  isOpen,
  onClose,
  fetchCobros,
  pedidoId,
  editingCobro,
  metodosCobro,
}) => {
  const [formData, setFormData] = useState<CobroInput>({
    pedido: pedidoId,
    // Usamos chequeo opcional (?) aquí también, aunque la prop debe ser un array.
    id_metodo_cobro: metodosCobro[0]?.id, 
    monto: 0,
    descuento: 0,
    recargo: 0,
  });

  useEffect(() => {
    if (editingCobro) {
      setFormData({
        pedido: editingCobro.pedido,
        id_metodo_cobro: editingCobro.id_metodo_cobro,
        monto: +editingCobro.monto,
        descuento: +editingCobro.descuento,
        recargo: +editingCobro.recargo,
      });
    } else {
      setFormData({
        pedido: pedidoId,
        // Usamos chequeo opcional en el inicio del formulario
        id_metodo_cobro: metodosCobro[0]?.id, 
        monto: 0,
        descuento: 0,
        recargo: 0,
      });
    }
  }, [editingCobro, pedidoId, metodosCobro]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'id_metodo_cobro') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingCobro) {
        await updateCobro(editingCobro.id, formData);
      } else {
        await createCobro(formData);
      }
      fetchCobros();
      onClose();
    } catch (error: any) {
      console.error('Error al guardar cobro:', error);
      const errorMessage = error.response?.data?.monto || 'Error al guardar el cobro.';
      alert(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={formStyles.modalOverlay}>
      <div className={formStyles.modalContent}>
        <h2>{editingCobro ? 'Editar Cobro' : 'Nuevo Cobro'}</h2>
        <form onSubmit={handleSubmit} className={formStyles.formContainer}>
          <div className={formStyles.formGrid}>
            <div className={formStyles.formSection}>
              <h3 className={formStyles.formSectionTitle}>Detalles del Cobro</h3>
              <div className={formStyles.formField}>
                <label className={formStyles.formLabel}>Monto</label>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleInputChange}
                  className={formStyles.formInput}
                  step="0.01"
                  required
                />
              </div>
              <div className={formStyles.formField}>
                <label className={formStyles.formLabel}>Método de Cobro</label>
                <select
                  name="id_metodo_cobro"
                  value={formData.id_metodo_cobro || ''}
                  onChange={handleInputChange}
                  className={formStyles.formSelect}
                  required
                >
                  {/* FIX: Chequeo defensivo para evitar el error de .map() */}
                  {Array.isArray(metodosCobro) && metodosCobro.map(metodo => (
                    <option key={metodo.id} value={metodo.id}>{metodo.nombre}</option>
                  ))}
                </select>
              </div>
              <div className={formStyles.formField}>
                <label className={formStyles.formLabel}>Descuento</label>
                <input
                  type="number"
                  name="descuento"
                  value={formData.descuento || 0}
                  onChange={handleInputChange}
                  className={formStyles.formInput}
                  step="0.01"
                />
              </div>
              <div className={formStyles.formField}>
                <label className={formStyles.formLabel}>Recargo</label>
                <input
                  type="number"
                  name="recargo"
                  value={formData.recargo || 0}
                  onChange={handleInputChange}
                  className={formStyles.formInput}
                  step="0.01"
                />
              </div>
            </div>
          </div>
          <div className={formStyles.formButtons}>
            <button type="button" onClick={onClose} className={formStyles.secondaryButton}>
              Cancelar
            </button>
            <button type="submit" className={formStyles.primaryButton}>
              {editingCobro ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearEditarCobroModal;