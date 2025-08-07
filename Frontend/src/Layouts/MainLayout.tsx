import * as React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar/sidebar'; 
import styles from './MainLayout.module.css'; 


const MainLayout: React.FC = () => {
  return (
    <div className={styles.mainLayoutContainer}>
      <main className={styles.contentArea}>
        <Outlet /> 
      </main>
      <Sidebar />
    </div>
  );
};


export default MainLayout;