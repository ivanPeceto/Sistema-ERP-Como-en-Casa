// src/pages/GestionPedidosPage.tsx
import React from 'react';
// Asegúrate que el nombre del archivo CSS coincida. Si es 'gestion_pedidos.module.css', déjalo así.
// Si lo renombraste a 'gestion_pedidos_page.module.css', cámbialo aquí.
import styles from '../styles/gestion_pedidos.module.css';

// Asumiendo que las imágenes están en la carpeta 'public/img/'
const imgHamburguesa = "/img/hamburguesa.png";
const imgPizza = "/img/pizza.png";
const imgPapasFritas = "/img/papasfritas.png";
const imgEmpanadas = "/img/empanadas.png";
const imgBebidas = "/img/bebidas.png";

const GestionPedidosPage: React.FC = () => {
  return (
    <div className={styles.gestionPedidosContainer}>
      <h1>GESTIÓN DE PEDIDOS</h1>
      {/* Contenido principal wrapper, el marginTop se puede manejar con CSS Modules si prefieres */}
      <div className={styles.contenidoPrincipal} style={{ marginTop: '5rem' }}>
        <section className={styles.categorias}>
          <div className={styles.categoria}>
            <img src={imgHamburguesa} alt="Hamburguesas" />
            <span>Hamburguesas</span>
          </div>
          <div className={styles.categoria}>
            <img src={imgPizza} alt="Pizzas" />
            <span>Pizzas</span>
          </div>
          <div className={styles.categoria}>
            <img src={imgPapasFritas} alt="Papas fritas" />
            <span>Papas fritas</span>
          </div>
          <div className={styles.categoria}>
            <img src={imgEmpanadas} alt="Empanadas" />
            <span>Empanadas</span>
          </div>
          <div className={styles.categoria}>
            <img src={imgBebidas} alt="Bebidas" />
            <span>Bebidas</span>
          </div>
        </section>

        <section className={styles.paneles}>
          {/* Panel de Pedidos en Espera */}
          <div className={styles.panel}>
            <h2>PEDIDOS EN ESPERA</h2>
            <div className={styles.contenido}>
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
            </div>
          </div>

          {/* Panel Central - Pedido del Cliente */}
          <div className={`${styles.panel} ${styles.central}`}>
            <h2>CLIENTE #33</h2>
            <div className={styles.contenido}>
              <div className={`${styles.fila} ${styles.encabezado}`}>
                <span className={styles.cantidad}>Cantidad</span>
                <span className={styles.producto}>Producto</span>
                <span className={styles.precio}>Precio</span>
                <span className={styles.acciones}></span> {/* Columna vacía para alinear con botones */}
              </div>
              <div className={styles.fila}>
                <span className={styles.cantidad}>03</span>
                <span className={styles.producto}>Papas Fritas Cono</span>
                <span className={styles.precio}>$10000</span>
                <span className={styles.acciones}>
                  <button>📝</button>
                  <button>❌</button>
                </span>
              </div>
              <div className={styles.fila}>
                <span className={styles.cantidad}>03</span>
                <span className={styles.producto}>Pizza Napolitana</span>
                <span className={styles.precio}>$2000</span>
                <span className={styles.acciones}>
                  <button>📝</button>
                  <button>❌</button>
                </span>
              </div>
              <div className={styles.fila}>
                <span className={styles.cantidad}>03</span>
                <span className={styles.producto}>Pizza Muzarella</span>
                <span className={styles.precio}>$10000</span>
                <span className={styles.acciones}>
                  <button>📝</button>
                  <button>❌</button>
                </span>
              </div>
              <div className={styles.fila}>
                <span className={styles.cantidad}>03</span>
                <span className={styles.producto}>Empanadas de Carne</span>
                <span className={styles.precio}>$5000</span>
                <span className={styles.acciones}>
                  <button>📝</button>
                  <button>❌</button>
                </span>
              </div>
              <div className={styles.fila}>
                <span className={styles.cantidad}>03</span>
                <span className={styles.producto}>Empanadas JyQ</span>
                <span className={styles.precio}>$3500</span>
                <span className={styles.acciones}>
                  <button>📝</button>
                  <button>❌</button>
                </span>
              </div>
            </div>
            <div className={styles.resumen}>
              <div><strong>TOTAL:</strong> $30500</div>
              <button>CONFIRMAR PEDIDO</button>
            </div>
          </div>

          {/* Panel de Pedidos Terminados */}
          <div className={styles.panel}>
            <h2>PEDIDOS TERMINADOS</h2>
            <div className={styles.contenido}>
              <div className={`${styles.fila} ${styles.encabezado}`}>
                <span>Pedido</span>
                <span>Estado</span>
              </div>
              <div className={`${styles.fila} ${styles.pedido}`}>
                <span>#2295</span>
                <span>Entregado</span>
              </div>
              <div className={`${styles.fila} ${styles.pedido}`}>
                <span>#2296</span>
                <span>Entregado</span>
              </div>
              <div className={`${styles.fila} ${styles.pedido}`}>
                <span>#2297</span>
                <span>Entregado</span>
              </div>
              <div className={`${styles.fila} ${styles.pedido}`}>
                <span>#2298</span>
                <span>Entregado</span>
              </div>
              <div className={`${styles.fila} ${styles.pedido}`}>
                <span>#2299</span>
                <span>Entregado</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GestionPedidosPage;