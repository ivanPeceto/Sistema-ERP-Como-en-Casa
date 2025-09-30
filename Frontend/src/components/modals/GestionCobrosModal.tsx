import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import formStyles from '../../styles/formStyles.module.css';
import styles from './GestionCobrosModal.module.css';
import { getCobrosByPedido, deleteCobro } from '../../services/cobro_service';
import { getMetodosCobro } from '../../services/metodo_cobro_service';
import { type Pedido, type Cobro, type MetodoCobro } from '../../types/models';
import CrearEditarCobroModal from './CrearEditarCobroModal';
import GestionMetodosCobroView from './GestionMetodosCobroView'; 

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
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'cobros' | 'metodos'>('cobros'); 
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [metodosCobro, setMetodosCobro] = useState<MetodoCobro[]>([]);
  const [isCrearEditarModalOpen, setIsCrearEditarModalOpen] = useState(false);
  const [editingCobro, setEditingCobro] = useState<Cobro | null>(null);

  const fetchCobros = useCallback(async () => {
    if (pedido) {
      try {
        const data = await getCobrosByPedido(pedido.id);
        if (Array.isArray(data)) {
            setCobros(data);
        } else {
            setCobros([]); 
        }
      } catch (error) {
        console.error('Error al cargar cobros:', error);
        setCobros([]);
      }
    }
  }, [pedido]);

  const fetchMetodosCobro = useCallback(async () => {
    try {
      const data = await getMetodosCobro();
      setMetodosCobro(data);
    } catch (error) {
      console.error('Error al cargar métodos de cobro:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCobros();
      fetchMetodosCobro();
      setCurrentView('cobros');
    }
  }, [isOpen, fetchCobros, fetchMetodosCobro]);

  const handleEdit = (cobro: Cobro) => {
    setEditingCobro(cobro);
    setIsCrearEditarModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCobro(null);
    setIsCrearEditarModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este cobro?')) {
      try {
        await deleteCobro(id);
        fetchCobros();
      } catch (error) {
        console.error('Error al eliminar cobro:', error);
        alert('Error al eliminar el cobro.');
      }
    }
  };

  if (!isOpen || !pedido) return null;

  const totalAbonado = Array.isArray(cobros) 
    ? cobros.reduce((sum, c) => sum + c.monto, 0) 
    : 0;
  
  const montoRestante = pedido.total - totalAbonado;

  const renderCobrosList = () => (
    <>
      <div className={styles.cobrosResumen}>
        <span><strong>Total:</strong> ${pedido.total.toFixed(2)}</span>
        <span><strong>Abonado:</strong> ${totalAbonado.toFixed(2)}</span>
        <span style={{color: montoRestante <= 0 ? '#1c7e40' : '#cc404e'}}>
          <strong>Restante:</strong> ${montoRestante.toFixed(2)}
        </span>
      </div>

      <div className={formStyles.formSection}>
        <h3 className={formStyles.formSectionTitle}>Lista de Cobros</h3>
        <div className={styles.cobrosList}>
          {Array.isArray(cobros) && cobros.length > 0 ? (
            cobros.map(cobro => (
              <div key={cobro.id} className={styles.cobroItem}>
                <span>Monto: ${cobro.monto.toFixed(2)}</span>
                <small>Método: {metodosCobro.find(m => m.id === cobro.id_metodo_cobro)?.nombre || 'Desconocido'}</small>
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
        {/* Botón que cambia la vista a Gestionar Métodos */}
        <button 
          onClick={() => setCurrentView('metodos')} 
          className={formStyles.secondaryButton}
          style={{marginRight: 'auto'}}
        >
          Gestionar Métodos
        </button>
        
        <button onClick={handleCreate} className={formStyles.primaryButton}>
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
            {/* Botón Volver a la izquierda del título, con estilo verde */}
            {currentView === 'metodos' && (
                <button 
                    onClick={() => {
                        setCurrentView('cobros'); 
                        fetchMetodosCobro(); 
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
        
        {currentView === 'metodos' && (
          <GestionMetodosCobroView 
            onBack={() => {
              setCurrentView('cobros');
              fetchMetodosCobro();
            }} 
          />
        )}
      </div>
      
      <CrearEditarCobroModal
        isOpen={isCrearEditarModalOpen}
        onClose={() => setIsCrearEditarModalOpen(false)}
        fetchCobros={fetchCobros}
        pedidoId={pedido.id}
        editingCobro={editingCobro}
        metodosCobro={metodosCobro}
      />
    </div>
  );
};

export default GestionCobrosModal;