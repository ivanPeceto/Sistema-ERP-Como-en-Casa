/**
 * @file sidebar.tsx
 * @brief Componente de barra lateral de navegación
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './sidebar.module.css';
import { useAuth } from '../../context/auth_context';

/**
 * Estado para submenús
 */
const Sidebar: React.FC = () => {
  const { logout, user, isAuthenticated } = useAuth();

  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>({});

  /**
   * @interface MenuItem
   */
  interface MenuItem {
    path?: string;
    label: string;
    icon: React.ReactNode;
    children?: { path: string; label: string; icon?: React.ReactNode }[];
  }

  /**
   * Ítems del menú
   */
  const menuItems: MenuItem[] = [
    { path: '/gestion/roles', label: 'Usuarios', icon: <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { path: '/gestion/clientes', label: 'Clientes', icon: <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { path: '/gestion/productos', label: 'Productos', icon: <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
    { path: '/gestion/pedidos', label: 'Pedidos', icon: <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
    { path: '/gestion/recetas', label: 'Recetas', icon: <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 14c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 20c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" /></svg> },
  ];

  /**
   * Usuario actual
   */
  const accountItem = {
    label: isAuthenticated && user ? user.nombre : 'Perfil',
    icon: (
      <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg"
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  const logoutIcon = (
    <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg"
      fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );

  /**
   * RENDER
   */
  return (
    <div className={`${styles.horizontalBarContainer} ${styles.darkTheme}`}>

      {/* LOGO */}
      <div className={styles.logoLink}>
        <svg className={styles.logoIcon} xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20" fill="currentColor">
          <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
        </svg>
        <span className={styles.logoText}>
          GESTOR DE PEDIDOS - COMO EN CASA ROTISERIA
        </span>
      </div>

      {/* MENU */}
      <div className={styles.menuSection}>
        {menuItems.map((item) => {
          // SI TIENE SUBMENÚ
          if (item.children) {
            const isOpen = openMenus[item.label] || false;

            return (
              <div key={item.label} className={styles.menuParent}>
                <div
                  className={styles.menuItem}
                  onClick={() =>
                    setOpenMenus((prev) => ({ ...prev, [item.label]: !isOpen }))
                  }
                >
                  {item.icon}
                  <span className={styles.menuItemText}>{item.label}</span>
                  <span className={`${styles.arrow} ${isOpen ? styles.open : ""}`}>
                    ▲
                  </span>
                </div>

                {isOpen && (
                  <div className={styles.subMenu}>
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `${styles.subMenuItem} ${isActive ? styles.activeDarkSub : ""
                          }`
                        }
                        onClick={() => setOpenMenus((prev) => ({ ...prev, [item.label]: false }))}
                      >
                        {child.icon && <span className={styles.icon}>{child.icon}</span>}
                        <span className={styles.menuItemText}>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }


          // ITEMS NORMALES
          return (
            <NavLink
              key={item.path}
              to={item.path!}
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.activeDark : ''}`
              }
            >
              {item.icon}
              <span className={styles.menuItemText}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* CUENTA */}
      <div className={styles.accountSection}>
        <div className={styles.accountLink} style={{ cursor: 'default' }}>
          {accountItem.icon}
          <span className={styles.accountText}>{accountItem.label}</span>
        </div>

        <button
          onClick={logout}
          className={styles.logoutButton}
          title="Cerrar sesión"
        >
          {logoutIcon}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
