import React, { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import formStyles from "../../../styles/formStyles.module.css";
import cobroStyles from "./CrearEditarCobroModal.module.css";
import { createCobro, updateCobro } from "../../../services/cobro_service";
import {
  type Cobro,
  type CobroInput,
  type MetodoCobro,
  METODO_COBRO,
} from "../../../types";

interface CrearEditarCobroModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchCobros: () => void;
  pedidoId: number;
  editingCobro: Cobro | null;
  saldoPendiente: number;
  metodosCobro: MetodoCobro[];
}

interface FormData {
  pedido: number;
  tipo: MetodoCobro;
  monto: number | "";
  descuento: number | "";
  recargo: number | "";
  moneda: string;
  banco?: string;
  referencia?: string;
  cuotas?: number | "";
}

const CrearEditarCobroModal: React.FC<CrearEditarCobroModalProps> = ({
  isOpen,
  onClose,
  fetchCobros,
  pedidoId,
  editingCobro,
  saldoPendiente,
  metodosCobro,
}) => {
  const getInitialFormData = (): FormData => ({
    pedido: pedidoId,
    tipo: "efectivo",
    monto: saldoPendiente,
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
        setFormData({
          pedido: editingCobro.pedido,
          tipo: editingCobro.tipo,
          monto: editingCobro.monto,
          descuento: editingCobro.descuento ?? 0,
          recargo: editingCobro.recargo ?? 0,
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

    if (["monto", "cuotas"].includes(name)) {
      newValue = Number(value);
    } else if (["descuento", "recargo"].includes(name)) {
      newValue = Number(value);
      if (newValue < 0) newValue = 0;
      if (newValue > 100) newValue = 100;
    }

    setFormData((prev) => {
      let updated = { ...prev, [name]: newValue };

      // Limpiar campos que no aplican al cambiar el tipo
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
      monto: Number(formData.monto),
      descuento: Number(formData.descuento) || 0,
      recargo: Number(formData.recargo) || 0,
      moneda: formData.moneda,
      banco: ["debito", "credito", "mercadopago"].includes(formData.tipo)
        ? formData.banco
        : undefined,
      referencia: ["debito", "credito", "mercadopago"].includes(formData.tipo)
        ? formData.referencia
        : undefined,
      cuotas:
        formData.tipo === "credito"
          ? formData.cuotas
            ? Number(formData.cuotas)
            : undefined
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
      const errorMessage =
        error.response?.data?.monto || "Error al guardar el cobro.";
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
                Detalles del Cobro
              </h3>
              <div className={cobroStyles.doubleInputsContainer}>
                <div className={cobroStyles.inputField}>
                  <label className={formStyles.formLabel}>Monto</label>
                  <input
                    type="number"
                    name="monto"
                    value={ Number(formData.monto) >= 0 ? formData.monto : 0}
                    onChange={handleInputChange}
                    className={formStyles.formInput}
                    placeholder="0"
                    step="0.1"
                    required
                  />
                </div>
                <div className={cobroStyles.inputField}>
                  <label className={formStyles.formLabel}>Método de Cobro</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className={formStyles.formSelect}
                    required
                  >
                    {(Object.keys(METODO_COBRO) as MetodoCobro[]).map((m) => (
                      <option key={m} value={m}>
                        {METODO_COBRO[m]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {["debito", "credito"].includes(formData.tipo) && (
                <>
                  <div className={formStyles.formField}>
                    <label className={formStyles.formLabel}>Banco</label>
                    <input
                      type="text"
                      name="banco"
                      value={formData.banco}
                      onChange={handleInputChange}
                      className={formStyles.formInput}
                    />
                  </div>
                  <div className={formStyles.formField}>
                    <label className={formStyles.formLabel}>Referencia</label>
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
                  />
                </div>
              )}
              <div className={cobroStyles.doubleInputsContainer}>
                <div className={cobroStyles.inputField}>
                  <label className={formStyles.formLabel}>Descuento (%)</label>
                  <input
                    type="number"
                    name="descuento"
                    value={formData.descuento}
                    onChange={handleInputChange}
                    className={formStyles.formInput}
                    min={0}
                    max={100}
                    step="1"
                  />
                </div>

                <div className={cobroStyles.inputField}>
                  <label className={formStyles.formLabel}>Recargo (%)</label>
                  <input
                    type="number"
                    name="recargo"
                    value={formData.recargo}
                    onChange={handleInputChange}
                    className={formStyles.formInput}
                    min={0}
                    max={100}
                    step="1"
                  />
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
