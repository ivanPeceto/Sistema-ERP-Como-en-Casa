import React, { useState, useEffect, useCallback } from 'react';
import formStyles from '../../../styles/formStyles.module.css';
import styles from './GestionCobrosModal.module.css';
import { getCobrosByPedido, deleteCobro } from '../../../services/cobro_service';
import { METODO_COBRO, type Pedido, type Cobro, type MetodoCobro } from '../../../types';
import CrearEditarCobroModal from '../CrearEditarCobroModal/CrearEditarCobroModal';

interface GestionCobrosModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: Pedido | null; 
}

const GREEN_BACK_BUTTON_STYLE = {
  backgroundColor: '#1c7e40',
  color: 'white',
  padding: '8px 15px', 
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
};

const GestionCobrosModal: React.FC<GestionCobrosModalProps> = ({ isOpen, onClose, pedido }) => {
  const [currentView, setCurrentView] = useState<'cobros' | 'metodos'>('cobros'); 
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [metodosCobro, setMetodosCobro] = useState<MetodoCobro[]>([]);
  const [isCrearEditarModalOpen, setIsCrearEditarModalOpen] = useState(false);
  const [editingCobro, setEditingCobro] = useState<Cobro | null>(null);

  const fetchCobros = useCallback(async () => {
    if (!pedido) return;
    try {
      const data = await getCobrosByPedido(pedido.id);
      setCobros(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar cobros:', error);
      setCobros([]);
    }
  }, [pedido]);

  useEffect(() => {
    if (isOpen) {
      fetchCobros();
      setCurrentView('cobros');
    }
  }, [isOpen, fetchCobros]);

  const handleEdit = (cobro: Cobro) => {
    setEditingCobro(cobro);
    setIsCrearEditarModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCobro(null);
    setIsCrearEditarModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este cobro?')) return;
    try {
      await deleteCobro(id);
      fetchCobros();
    } catch (error) {
      console.error('Error al eliminar cobro:', error);
      alert('Error al eliminar el cobro.');
    }
  };

  if (!isOpen || !pedido) return null;

  const saldoPendiente = pedido.saldo_pendiente ?? 0;
  const pedidoTotalAbonado = saldoPendiente <= 0;
  const totalAbonado = Number(pedido.total) - saldoPendiente;

  const renderCobrosList = () => (
    <>
      <div className={styles.cobrosResumen}>
        <span><strong>Total:</strong> ${pedido.total}</span>
        <span><strong>Abonado:</strong> ${totalAbonado}</span>
        <span style={{ color: pedidoTotalAbonado ? '#1c7e40' : '#cc404e' }}>
          <strong>Restante:</strong> ${saldoPendiente}
        </span>
        {pedidoTotalAbonado && <span style={{ color: '#1c7e40', fontWeight: 'bold', marginLeft: '15px' }}>¡Pedido totalmente abonado!</span>}
      </div>

      <div className={formStyles.formSection}>
        <h3 className={formStyles.formSectionTitle}>Lista de Cobros</h3>
        <div className={styles.cobrosList}>
          {cobros.length > 0 ? (
            cobros.map(cobro => (
              <div key={cobro.id} className={styles.cobroItem}>
                <span>${Number(cobro.monto)}</span>
                <small>{METODO_COBRO[cobro.tipo] || 'Desconocido'}</small>
                {(cobro.descuento || cobro.recargo) && (
                  <small style={{ marginLeft: '10px' }}>
                    {cobro.descuento ? `- Descuento: ${cobro.descuento}%` : ''} {cobro.recargo ? `+ Recargo: ${cobro.recargo}%` : ''}
                  </small>
                )}
                <div className={styles.itemActions}>
                  <button onClick={() => handleEdit(cobro)} className={formStyles.editButton}>Editar</button>
                  <button onClick={() => handleDelete(cobro.id)} className={formStyles.deleteButton}>X</button>
                </div>
              </div>
            ))
          ) : (
            <p>No se han registrado cobros para este pedido.</p>
          )}
        </div>
      </div>

      <div className={formStyles.formButtons}>
        <button 
          onClick={handleCreate} 
          className={formStyles.primaryButton}
          disabled={pedidoTotalAbonado}
          title={pedidoTotalAbonado ? 'No se puede crear más cobros, pedido totalmente abonado' : ''}
        >
          Nuevo Cobro
        </button>
        <button onClick={onClose} className={formStyles.secondaryButton}>
          Cerrar
        </button>
      </div>
    </>
  );

  return (
    <div className={formStyles.modalOverlay}>
      <div className={formStyles.modalContent}>
        <div className={styles.headerBar}>
          {currentView === 'metodos' && (
            <button 
              onClick={() => {
                setCurrentView('cobros'); 
              }} 
              style={GREEN_BACK_BUTTON_STYLE}
            >
              Volver
            </button>
          )}
          <h2>
            {currentView === 'cobros' 
              ? `Cobros de Pedido #${pedido.numero_pedido}` 
              : 'Métodos de Cobro'}
          </h2>
          {currentView === 'cobros' && <span className={styles.spacer}></span>}
        </div>
        
        {currentView === 'cobros' && renderCobrosList()}
        
      </div>
      
      <CrearEditarCobroModal
        isOpen={isCrearEditarModalOpen}
        onClose={() => setIsCrearEditarModalOpen(false)}
        fetchCobros={fetchCobros}
        pedidoId={pedido.id}
        editingCobro={editingCobro}
        metodosCobro={metodosCobro}
        saldoPendiente={saldoPendiente}
      />
    </div>
  );
};

export default GestionCobrosModal;
