import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import formStyles from '../../styles/formStyles.module.css';
import { createProducto, updateProducto } from '../../services/product_service';
import { type Producto, type Categoria, type ProductoInput } from '../../types/models';

interface CrearProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchProductos: () => void;
  editingProducto: Producto | null;
  categorias: Categoria[];
}

const CrearProductoModal: React.FC<CrearProductoModalProps> = ({
  isOpen,
  onClose,
  fetchProductos,
  editingProducto,
  categorias,
}) => {
  const [formData, setFormData] = useState<ProductoInput>({
    nombre: '',
    descripcion: '',
    precio_unitario: 0,
    stock: 0, 
    disponible: true,
    categoria_id: null,
  });

  useEffect(() => {
    if (editingProducto) {
      setFormData({
        nombre: editingProducto.nombre,
        descripcion: editingProducto.descripcion,
        precio_unitario: +editingProducto.precio_unitario,
        stock: editingProducto.stock,
        disponible: editingProducto.disponible,
        categoria_id: editingProducto.categoria?.id ?? null,
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        precio_unitario: 0,
        stock: 0, 
        disponible: true,
        categoria_id: categorias.length > 0 ? categorias[0].id : null,
      });
    }
  }, [editingProducto, categorias]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    if (type === 'checkbox') {
      const target = event.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else if (name === 'precio_unitario') { 
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'categoria_id') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.categoria_id) {
      return;
    }
    try {
      if (editingProducto) {
        await updateProducto(editingProducto.id, formData);
      } else {
        await createProducto(formData);
      }
      fetchProductos();
      onClose();
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      const errorMessage = error.response?.data?.detail || 'Error al guardar el producto.';
      console.error(errorMessage);
      alert(errorMessage);
    }
  };


  if (!isOpen) return null;

  return (
    <div className={formStyles.modalOverlay}>
      <div className={formStyles.modalContent}>
        <h2>{editingProducto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
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

            <div className={formStyles.formSection}>
              <h3 className={formStyles.formSectionTitle}>Precios</h3>
              <div className={formStyles.formField}>
                <label className={`${formStyles.formLabel} ${formStyles.requiredLabel}`} htmlFor="precio_unitario">Precio Unitario</label>
                <input
                  type="number"
                  id="precio_unitario"
                  name="precio_unitario"
                  value={formData.precio_unitario}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                  className={formStyles.formInput}
                />
              </div>
            </div>

            {/* Agrupamos estos dos campos en un nuevo div para que queden en línea */}
            <div className={formStyles.formSection}>
              <h3 className={formStyles.formSectionTitle}>Estado y Categoría</h3>
              <div className={formStyles.inlineFormSection}>
                <div className={formStyles.formField}>
                  <label className={formStyles.formLabel} htmlFor="disponible">Disponible</label>
                  <input
                    type="checkbox"
                    id="disponible"
                    name="disponible"
                    checked={formData.disponible}
                    onChange={handleInputChange}
                    className={formStyles.formCheckbox}
                  />
                </div>
                <div className={formStyles.formField}>
                  <label className={formStyles.formLabel} htmlFor="categoria_id">Categoría</label>
                  <select
                    id="categoria_id"
                    name="categoria_id"
                    value={formData.categoria_id || ''}
                    onChange={handleInputChange}
                    className={formStyles.formSelect}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
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
            <button
              type="submit"
              className={formStyles.primaryButton}
            >
              {editingProducto ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CrearProductoModal;