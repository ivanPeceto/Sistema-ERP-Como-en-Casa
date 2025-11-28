import React, { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import formStyles from "../../../styles/formStyles.module.css";
import { createCobro, updateCobro } from "../../../services/cobro_service";
import {
  type MetodoCobro,
  METODO_COBRO,
  METODO_COBRO_LABELS
} from "../../../types/types";
import type {
  Cobro,
  CobroInput
} from "../../../types/models"

interface CrearEditarCobroModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchCobros: () => void;
  pedidoId: number;
  editingCobro: Cobro | null;
  saldoPendiente: number;
}

interface FormData {
  pedido: number;
  tipo: MetodoCobro;
  monto: number | "";      // Monto Base
  descuento: number | "";  // Porcentaje
  recargo: number | "";    // Porcentaje
  moneda: string;
  banco: string;
  referencia: string;
  cuotas: number | "";
}

const CrearEditarCobroModal: React.FC<CrearEditarCobroModalProps> = ({
  isOpen,
  onClose,
  fetchCobros,
  pedidoId,
  editingCobro,
  saldoPendiente,
}) => {
  
  const getInitialFormData = (): FormData => ({
    pedido: pedidoId,
    tipo: "efectivo",
    monto: saldoPendiente > 0 ? Number(saldoPendiente.toFixed(2)) : "",
    descuento: 0,
    recargo: 0,
    moneda: "ARS",
    banco: "",
    referencia: "",
    cuotas: "",
  });

  const [formData, setFormData] = useState<FormData>(getInitialFormData());

  useEffect(() => {
    if (isOpen) {
      if (editingCobro) {
        // --- LÓGICA DE INGENIERÍA INVERSA PARA EDICIÓN ---
        // El backend nos da: Monto Final (Neto) y Valor Absoluto de Descuento/Recargo.
        // El formulario necesita: Monto Base y Porcentajes.
        
        const valDescuento = Number(editingCobro.descuento || 0);
        const valRecargo = Number(editingCobro.recargo || 0);
        const montoFinal = Number(editingCobro.monto);

        // 1. Reconstruir el Monto Base Original
        // Si hubo descuento: Base = Final + Descuento
        // Si hubo recargo:   Base = Final - Recargo
        let montoBase = montoFinal + valDescuento - valRecargo;

        // 2. Recalcular Porcentajes
        let pctDescuento = 0;
        let pctRecargo = 0;

        if (montoBase > 0) {
            if (valDescuento > 0) pctDescuento = (valDescuento / montoBase) * 100;
            if (valRecargo > 0) pctRecargo = (valRecargo / montoBase) * 100;
        }

        setFormData({
          pedido: editingCobro.pedido,
          tipo: editingCobro.tipo,
          monto: Number(montoBase.toFixed(2)), // Mostramos el base
          descuento: Number(pctDescuento.toFixed(2)), // Mostramos %
          recargo: Number(pctRecargo.toFixed(2)),     // Mostramos %
          moneda: editingCobro.moneda ?? "ARS",
          banco: editingCobro.banco ?? "",
          referencia: editingCobro.referencia ?? "",
          cuotas: editingCobro.cuotas ?? "",
        });
      } else {
        setFormData(getInitialFormData());
      }
    }
  }, [isOpen, editingCobro, pedidoId, saldoPendiente]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let newValue: any = value;

    // Conversiones numéricas
    if (["monto", "cuotas", "descuento", "recargo"].includes(name)) {
      // Permitir cadena vacía para UX
      if (value === "") newValue = "";
      else newValue = Number(value);
      
      // Validar rangos de porcentaje
      if (typeof newValue === 'number' && ["descuento", "recargo"].includes(name)) {
         if (newValue < 0) newValue = 0;
         if (newValue > 100) newValue = 100;
      }
    }

    setFormData((prev) => {
      let updated = { ...prev, [name]: newValue };

      // Limpiar campos irrelevantes al cambiar tipo
      if (name === "tipo") {
        if (!["debito", "credito", "mercadopago"].includes(newValue)) {
          updated.banco = "";
          updated.referencia = "";
        }
        if (newValue !== "credito") {
          updated.cuotas = "";
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.monto || Number(formData.monto) <= 0) {
      alert("El monto es requerido y debe ser mayor a cero.");
      return;
    }

    const dataToSubmit: CobroInput = {
      pedido: pedidoId,
      tipo: formData.tipo,
      monto: Number(formData.monto), // Enviamos monto BASE
      descuento: Number(formData.descuento) || 0, // Enviamos %
      recargo: Number(formData.recargo) || 0,     // Enviamos %
      moneda: formData.moneda,
      banco: ["debito", "credito", "mercadopago"].includes(formData.tipo)
        ? formData.banco
        : undefined,
      referencia: ["debito", "credito", "mercadopago"].includes(formData.tipo)
        ? formData.referencia
        : undefined,
      cuotas:
        formData.tipo === "credito" && formData.cuotas
          ? Number(formData.cuotas)
          : undefined,
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
      console.error("Error al guardar cobro:", error);
      // Ajuste para capturar errores generales o de campo
      const errorMessage =
        error.response?.data?.error || 
        error.response?.data?.detail || 
        "Error al guardar el cobro.";
      alert(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={formStyles.modalOverlay}>
      <div className={formStyles.modalContent}>
        <h2>{editingCobro ? "Editar Cobro" : "Nuevo Cobro"}</h2>
        <form onSubmit={handleSubmit} className={formStyles.formContainer}>
          <div className={formStyles.formGrid}>
            <div className={formStyles.formSection}>
              <h3 className={formStyles.formSectionTitle}>
                Detalles del Pago
              </h3>

              <div className={formStyles.formField}>
                <label className={formStyles.formLabel}>Monto a Pagar (Base)</label>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleInputChange}
                  className={formStyles.formInput}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
                {!editingCobro && saldoPendiente > 0 && (
                    <small style={{color: '#666'}}>Saldo restante: ${saldoPendiente}</small>
                )}
              </div>

              <div className={formStyles.formField}>
                <label className={formStyles.formLabel}>Método de Cobro</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className={formStyles.formSelect}
                  required
                >
                  {(Object.keys(METODO_COBRO_LABELS) as MetodoCobro[]).map((m) => (
                    <option key={m} value={m}>
                      {METODO_COBRO_LABELS[m]}
                    </option>
                  ))}
                </select>
              </div>

              {["debito", "credito", "mercadopago"].includes(formData.tipo) && (
                <>
                  <div className={formStyles.formField}>
                    <label className={formStyles.formLabel}>
                        {formData.tipo === 'mercadopago' ? 'Nro Operación' : 'Banco'}
                    </label>
                    <input
                      type="text"
                      name="banco"
                      value={formData.banco}
                      onChange={handleInputChange}
                      className={formStyles.formInput}
                      placeholder={formData.tipo === 'mercadopago' ? 'Ej: 12345678' : 'Ej: Galicia'}
                    />
                  </div>
                  <div className={formStyles.formField}>
                    <label className={formStyles.formLabel}>Referencia / Lote</label>
                    <input
                      type="text"
                      name="referencia"
                      value={formData.referencia}
                      onChange={handleInputChange}
                      className={formStyles.formInput}
                    />
                  </div>
                </>
              )}

              {formData.tipo === "credito" && (
                <div className={formStyles.formField}>
                  <label className={formStyles.formLabel}>Cuotas</label>
                  <input
                    type="number"
                    name="cuotas"
                    value={formData.cuotas}
                    onChange={handleInputChange}
                    className={formStyles.formInput}
                    min={1}
                    placeholder="1"
                  />
                </div>
              )}

              <div className={formStyles.formField}>
                <div style={{display:'flex', gap:'10px'}}>
                  <div className={formStyles.formField} style={{flex:1}}>
                    <label className={formStyles.formLabel}>Descuento (%)</label>
                    <input
                      type="number"
                      name="descuento"
                      value={formData.descuento}
                      onChange={handleInputChange}
                      className={formStyles.formInput}
                      min={0}
                      max={100}
                      placeholder="0"
                    />
                  </div>

                  <div className={formStyles.formField} style={{flex:1}}>
                    <label className={formStyles.formLabel}>Recargo (%)</label>
                    <input
                      type="number"
                      name="recargo"
                      value={formData.recargo}
                      onChange={handleInputChange}
                      className={formStyles.formInput}
                      min={0}
                      max={100}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

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
            <button type="submit" className={formStyles.primaryButton}>
              {editingCobro ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearEditarCobroModal;