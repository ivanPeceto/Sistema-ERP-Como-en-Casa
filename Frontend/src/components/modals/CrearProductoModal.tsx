import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import formStyles from '../../styles/formStyles.module.css';
import { createProducto, updateProducto } from '../../services/product_service';
import { type Producto, type Categoria, type ProductoInput, type Receta } from '../../types/models';

interface CrearProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchProductos: () => void;
  editingProducto: Producto | null;
  categorias: Categoria[];
  recetas: Receta[];
}

type TipoInventario = 'manual' | 'receta';

const CrearProductoModal: React.FC<CrearProductoModalProps> = ({
  isOpen,
  onClose,
  fetchProductos,
  editingProducto,
  categorias,
  recetas,
}) => {
  const [formData, setFormData] = useState<ProductoInput>({
    nombre: '',
    descripcion: '',
    precio_unitario: 0,
    stock: 0, 
    disponible: true,
    categoria_id: null,
    receta_id: null,
    cantidad_receta: 1
  });

  const [tipoInventario, setTipoInventario] = useState<TipoInventario>('manual');

  useEffect(() => {
    if (editingProducto) {
      const tieneReceta = !!editingProducto.receta_nombre || (typeof editingProducto.receta === 'number');
      setTipoInventario(tieneReceta ? 'receta' : 'manual');
      setFormData({
        nombre: editingProducto.nombre,
        descripcion: editingProducto.descripcion,
        precio_unitario: +editingProducto.precio_unitario,
        stock: editingProducto.stock,
        disponible: editingProducto.disponible,
        categoria_id: editingProducto.categoria?.id ?? null,
        receta_id: typeof editingProducto.receta === 'number' ? editingProducto.receta : null, 
        cantidad_receta: editingProducto.cantidad_receta || 1,
      });
    } else {
      setTipoInventario('manual');
      setFormData({
        nombre: '',
        descripcion: '',
        precio_unitario: 0,
        stock: 0, 
        disponible: true,
        categoria_id: categorias.length > 0 ? categorias[0].id : null,
        receta_id: null,
        cantidad_receta: 1,
      });
    }
  }, [editingProducto, categorias, isOpen]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    
    if (type === 'checkbox') {
      const target = event.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
        const numericFields = ['precio_unitario', 'stock', 'categoria_id', 'receta_id', 'cantidad_receta'];
        const finalValue = numericFields.includes(name) 
            ? (value ? parseFloat(value) : (name === 'receta_id' || name === 'categoria_id' ? null : 0))
            : value;

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleTipoInventarioChange = (e: ChangeEvent<HTMLSelectElement>) => {
      setTipoInventario(e.target.value as TipoInventario);
      if (e.target.value === 'manual') {
          setFormData(prev => ({ ...prev, receta_id: null }));
      } else {
          setFormData(prev => ({ ...prev, stock: 0 }));
      }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (tipoInventario === 'receta' && !formData.receta_id) {
        alert("Debe seleccionar una receta para este tipo de producto.");
        return;
    }

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
      <div className={`${formStyles.modalContent} ${formStyles.createProductoModal}`}>
        <h2>{editingProducto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <form onSubmit={handleSubmit} className={formStyles.formContainer}>
          <div className={formStyles.formGrid}>
            <div className={formStyles.formGridSectionStart}>
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
          
          <div className={formStyles.formGridSectionEnd}>
          <div className={formStyles.formSection}>
            <h3 className={formStyles.formSectionTitle}>Control de Inventario</h3>
            
            <div className={formStyles.formField} style={{marginBottom:'15px'}}>
                <label className={formStyles.formLabel}>Tipo de Gestión</label>
                <select 
                    value={tipoInventario} 
                    onChange={handleTipoInventarioChange}
                    className={formStyles.formSelect}
                >
                    <option value="manual">Stock Directo (Producto Simple)</option>
                    <option value="receta">Basado en Receta (Producto Elaborado)</option>
                </select>
            </div>

            {tipoInventario === 'manual' ? (
                <div className={formStyles.formField}>
                    <label className={formStyles.formLabel}>Stock Actual</label>
                    <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        min="0"
                        className={formStyles.formInput}
                        placeholder="Ej: 50 latas"
                    />
                    
                </div>
            ) : (
                <div >
                    <div className={formStyles.formField}>
                        <label className={`${formStyles.formLabel} ${formStyles.requiredLabel}`}>Receta Asociada</label>
                        <select
                            name="receta_id"
                            value={formData.receta_id || ''}
                            onChange={handleInputChange}
                            className={formStyles.formSelect}
                        >
                            <option value="">Seleccionar Receta...</option>
                            {recetas.map(r => (
                                <option key={r.id} value={r.id}>{r.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className={formStyles.formField}>
                        <label className={formStyles.formLabel}>Consumo</label>
                        <input
                            type="number"
                            name="cantidad_receta"
                            value={formData.cantidad_receta}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0.01"
                            className={formStyles.formInput}
                        />
                        <div><small style={{color:'#aaa'}}>Unidades de receta por venta.</small></div>
                    </div>
                </div>
            )}
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