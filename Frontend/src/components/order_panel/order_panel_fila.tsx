import React from 'react';
import styles from './OrderPanel.module.css';

// -------        -------        -------        -------        -------        -------

interface OrderItemRowProps {
  cantidad: string;
  producto: string;
  precio: string;
}

// -------        -------        -------        -------        -------        -------

const OrderItemRow: React.FC<OrderItemRowProps> = ({ cantidad, producto, precio }) => {
  return (
    <div className={styles.fila}>
      <span className={styles.cantidad}>{cantidad}</span>
      <span className={styles.producto}>{producto}</span>
      <span className={styles.precio}>{precio}</span>
    </div>
  );
};

// -------        -------        -------        -------        -------        -------

export default OrderItemRow;