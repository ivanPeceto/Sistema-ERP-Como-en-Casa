/**
 * @file CrearEditarCobroModal.tsx
 * @brief Componente modal para registrar o modificar un cobro asociado a un pedido.
 */
import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import formStyles from '../../../styles/formStyles.module.css';
import { createCobro, updateCobro } from '../../../services/cobro_service';
import { type Cobro, type CobroInput, type MetodoCobro } from '../../../types/models';

/**
 * @interface CrearEditarCobroModalProps
 * @brief Propiedades para el componente CrearEditarCobroModal.
 */
interface CrearEditarCobroModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchCobros: () => void;
  pedidoId: number;
  editingCobro: Cobro | null;
  metodosCobro: MetodoCobro[];
  montoRestante: number;
}

/**
 * @class CrearEditarCobroModal
 * @brief Componente funcional de React para la gestión de cobros.
 * * @param {CrearEditarCobroModalProps} props Las propiedades del componente.
 * @returns {React.ReactElement | null} El JSX del componente modal o `null` si no está abierto.
 */
const CrearEditarCobroModal: React.FC<CrearEditarCobroModalProps> = ({
  isOpen,
  onClose,
  fetchCobros,
  pedidoId,
  editingCobro,
  metodosCobro,
  montoRestante,
}) => {
  /**
   * @brief Genera el estado inicial para el formulario.
   * @returns El objeto de estado inicial del formulario.
   */
  const getInitialFormData = () => ({
    pedido: pedidoId,
    id_metodo_cobro: metodosCobro[0]?.id?.toString() || '',
    monto: montoRestante,
    descuento: '',
    recargo: '',
    descuento_porcentual: '',
    recargo_porcentual: '',
  });
  
  /** @brief Estado para manejar los datos del formulario. Los valores se guardan como strings para permitir campos vacíos. */
  const [formData, setFormData] = useState(getInitialFormData());

  /**
   * @brief Hook para inicializar o resetear el estado del formulario.
   * @details
   * - Se activa cuando el modal se abre (`isOpen`) o cuando cambia el cobro a editar.
   * - Si hay un `editingCobro`, puebla el formulario con sus datos.
   * - Si no, resetea el formulario a su estado inicial vacío.
   */
  useEffect(() => {
    if (isOpen) {
        if (editingCobro) {
          setFormData({
            pedido: editingCobro.pedido,
            id_metodo_cobro: editingCobro.id_metodo_cobro.toString(),
            monto: editingCobro.monto.toString(),
            descuento: editingCobro.descuento?.toString() || '',
            recargo: editingCobro.recargo?.toString() || '',
            descuento_porcentual: editingCobro.descuento_porcentual?.toString() || '',
            recargo_porcentual: editingCobro.recargo_porcentual?.toString() || '', 
          });
        } else {
          setFormData(getInitialFormData());
        }
    }
  }, [isOpen, editingCobro, pedidoId, metodosCobro, montoRestante]);

  /**
   * @brief Maneja los cambios en los inputs del formulario.
   * @param {ChangeEvent<HTMLInputElement | HTMLSelectElement>} e El evento de cambio del input.
   * @details
   * Actualiza el estado `formData` con el nuevo valor del campo modificado.
   * El valor se mantiene como `string` para una mejor experiencia de usuario.
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  /**
   * @brief Gestiona el envío del formulario.
   * @param {FormEvent<HTMLFormElement>} e El evento de envío del formulario.
   * @details
   * 1. Previene el comportamiento por defecto del formulario parseando los strings a number.
   * 2. Valida que el monto sea un número válido y mayor a cero.
   * 3. Convierte los datos del estado (strings) al formato numérico esperado por la API (`CobroInput`).
   * 4. Llama al servicio `updateCobro` o `createCobro` según si se está editando o creando.
   * 5. En caso de éxito, refresca los datos en el padre y cierra el modal.
   * 6. En caso de error, muestra una alerta con el mensaje del backend.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      alert('El monto es requerido y debe ser mayor a cero.');
      return;
    }

    const dataToSubmit: CobroInput = {
      pedido: pedidoId,
      id_metodo_cobro: parseInt(formData.id_metodo_cobro, 10),
      monto: parseFloat(formData.monto),
      descuento: parseFloat(formData.descuento) || 0,
      recargo: parseFloat(formData.recargo) || 0,
      descuento_porcentual: parseFloat(formData.descuento_porcentual) || 0,
      recargo_porcentual: parseFloat(formData.recargo_porcentual) || 0,
    };

    try {
      if (editingCobro) {
        await updateCobro(editingCobro.id, dataToSubmit);
      } else {
        await createCobro(dataToSubmit);
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
                  value={Number(formData.monto).toFixed(0)} 
                  onChange={handleInputChange}
                  className={formStyles.formInput}
                  placeholder="0.00" 
                  step="0.01"
                  required
                />
              </div>
              <div className={formStyles.formField}>
                <label className={formStyles.formLabel}>Método de Cobro</label>
                <select
                  name="id_metodo_cobro"
                  value={formData.id_metodo_cobro}
                  onChange={handleInputChange}
                  className={formStyles.formSelect}
                  required
                >
                  <option value="" disabled>Seleccione un método</option>
                  {Array.isArray(metodosCobro) && metodosCobro.map(metodo => (
                    <option key={metodo.id} value={metodo.id}>{metodo.nombre}</option>
                  ))}
                </select>
              </div>
              <div style={{display: 'flex'}}>
                <div style ={{padding: 5}}>
                  <div className={formStyles.formField}>
                    <label className={formStyles.formLabel}>Descuento fijo</label>
                    <input
                      type="number"
                      name="descuento"
                      value={Number(formData.descuento).toFixed(0)}
                      onChange={handleInputChange}
                      className={formStyles.formInput}
                      placeholder="0.00" 
                      step="1"
                    />
                  </div>
                  <div className={formStyles.formField}>
                    <label className={formStyles.formLabel}>Recargo fijo</label>
                    <input
                      type="number"
                      name="recargo"
                      value={Number(formData.recargo).toFixed(0)}
                      onChange={handleInputChange}
                      className={formStyles.formInput}
                      placeholder="0.00"
                      step="1"
                    />
                  </div>
                </div>
                <div style ={{padding: 5}}>
                  <div className={formStyles.formField}>
                    <label className={formStyles.formLabel}>Descuento Porcentual (%)</label>
                    <input
                      value={Number(formData.descuento_porcentual).toFixed(0)}
                      type="number" name="descuento_porcentual"
                      onChange={handleInputChange} className={formStyles.formInput}
                      placeholder="1"
                      max={100}
                    />
                  </div>
                  <div className={formStyles.formField}>
                    <label className={formStyles.formLabel}>Recargo Porcentual (%)</label>
                    <input
                      value={Number(formData.recargo_porcentual).toFixed(0)}
                      type="number" name="recargo_porcentual"
                      onChange={handleInputChange} className={formStyles.formInput}
                      placeholder="0" step="1"
                      max={100}
                    />
                  </div>
                </div>
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