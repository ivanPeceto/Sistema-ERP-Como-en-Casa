import React from 'react';
import styles from './OrderPanel.module.css';

// -------        -------        -------        -------        -------        -------

interface OrderPanelProps {
  title: string;
  type: 'waiting' | 'current' | 'completed'; 
}

// -------        -------        -------        -------        -------        -------

const OrderPanel: React.FC<OrderPanelProps> = ({ title, type }) => {
  // Datos de ejemplo estáticos para cada tipo de panel
  const getPanelContent = () => {
    if (type === 'current') {
      return 
    } else {
      return 
    }
  };

  // -------        -------        -------        -------        -------        -------

  return (
    <div className={`${styles.panel} ${type === 'current' ? styles.central : ''}`}>
      <h2>{title}</h2>
      <div className={styles.contenido}>
        {getPanelContent()}
      </div>

      {type === 'current' && (
        <div className={styles.resumen}>
          <div><strong>TOTAL:</strong> $30500</div>
          <button>CONFIRMAR PEDIDO</button>
        </div>
      )}
    </div>
  );
};

// -------        -------        -------        -------        -------        -------

export default OrderPanel;