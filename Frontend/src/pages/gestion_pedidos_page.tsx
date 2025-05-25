// Aca definimos la página principal para la gestión de pedidos.
// Muestra los diferentes paneles: en espera, el actual del cliente y los terminados.

import React from 'react';
import styles from '../styles/gestion_pedidos.module.css'; 
import OrderPanel from '../components/order_panel/order_panel'; 

// -------        -------        -------        -------        -------        -------

const GestionPedidosPage: React.FC = () => {
  return (

    // -------        -------        -------        -------        -------        -------

    // Este es el contenedor principal de la página de gestión de pedidos.
    <div className={styles.gestionPedidosContainer}>

      {/* -------        -------        -------        -------        -------        ------- */}

      {/* Contenedor para organizar los paneles de pedidos */}
      <div className={styles.contenidoPrincipal}>
        <section className={styles.paneles}>

          {/* -------        -------        -------        -------        -------        ------- */}

          {/* Panel de Pedidos en Espera */}
          <OrderPanel
            title="PEDIDOS EN ESPERA"
            type="waiting"
          />

          {/* -------        -------        -------        -------        -------        ------- */}

          {/* Panel Central - Pedido del cliente */}
          <OrderPanel
            title="CLIENTE #33" // Esto va a cambiar por el nombre del cliente real.
            type="current"
          />

          {/* -------        -------        -------        -------        -------        ------- */}

          {/* Panel de Pedidos Terminados */}
          <OrderPanel
            title="PEDIDOS TERMINADOS"
            type="completed"
          />

        </section>
      </div>
    </div>
  );
};

// -------        -------        -------        -------        -------        -------

export default GestionPedidosPage; // Exportamos la página para usarla en el router.