import React from 'react';
import styles from './OrderPanel.module.css';
import OrderItemRow from './order_panel_fila';

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
      return (
        <>
          <div className={`${styles.fila} ${styles.encabezado}`}>
            <span className={styles.cantidad}>Cantidad</span>
            <span className={styles.producto}>Producto</span>
            <span className={styles.precio}>Precio</span>
            <span className={styles.acciones}></span>
          </div>
          <OrderItemRow cantidad="03" producto="Papas Fritas Cono" precio="$10000" />
          <OrderItemRow cantidad="01" producto="Pizza Napolitana" precio="$2000" />
          <OrderItemRow cantidad="01" producto="Pizza Muzarella" precio="$10000" />
          <OrderItemRow cantidad="01" producto="Empanadas de Carne" precio="$5000" />
          <OrderItemRow cantidad="01" producto="Empanadas JyQ" precio="$3500" />
        </>
      );
    } else {
      return (
        <>
          <div className={`${styles.fila} ${styles.encabezado}`}>
            <span>Pedido</span>
            <span>Estado</span>
          </div>
          <div className={`${styles.fila} ${styles.pedido}`}>
            <span>#2301</span>
            <span>En cocina</span>
          </div>
          <div className={`${styles.fila} ${styles.pedido}`}>
            <span>#2302</span>
            <span>Confirmado</span>
          </div>
          <div className={`${styles.fila} ${styles.pedido}`}>
            <span>#2303</span>
            <span>En cocina</span>
          </div>
          <div className={`${styles.fila} ${styles.pedido}`}>
            <span>#2304</span>
            <span>Preparando</span>
          </div>
          <div className={`${styles.fila} ${styles.pedido}`}>
            <span>#2305</span>
            <span>En cola</span>
          </div>
        </>
      );
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