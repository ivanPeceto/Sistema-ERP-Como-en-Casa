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
    {
      label: 'Administración',
      icon: (
        <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>

          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
        </svg>
      ),
      children: [
        {
          path: '/gestion/clientes', label: 'Clientes', icon: <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        },
        {
          path: '/gestion/usuarios', label: 'Usuarios', icon: <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>

        },
        {
          path: '/gestion/roles', label: 'Roles', icon: <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
        },
      ],
    },

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
