import React from 'react';
import styles from '../SiguienteAccionModal/SiguienteAccionModal.module.css';
import formStyles from '../../../styles/formStyles.module.css'; 
import type { Pedido } from '../../../types/models';

interface SiguienteAccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntregarDirecto: () => void;
  onEditarAntes: () => void;
  pedido: Pedido | null;
}

const SiguienteAccionModal: React.FC<SiguienteAccionModalProps> = ({
  isOpen,
  onClose,
  onEntregarDirecto,
  onEditarAntes,
  pedido
}) => {
  if (!isOpen || !pedido) return null;

  return (
    <div className={formStyles.modalOverlay}>
      <div className={`${formStyles.modalContent} ${styles.container}`}>
        <h3 className={styles.title}>Finalizar Pedido #{pedido.numero_pedido}</h3>
        <p className={styles.description}>
          ¿Desea entregar el pedido directamente o necesita hacer modificaciones finales (agregar bebidas, extras)?
        </p>

        <div className={styles.buttonGroup}>
          <button 
            onClick={onEntregarDirecto} 
            className={`${formStyles.primaryButton} ${styles.btnDirecto}`}
          >
            Entregar
          </button>
          
          <button 
            onClick={onEditarAntes} 
            className={`${formStyles.secondaryButton} ${styles.btnEditar}`}
          >
            Editar
          </button>
        </div>

        <button onClick={onClose} className={styles.closeLink}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default SiguienteAccionModal;