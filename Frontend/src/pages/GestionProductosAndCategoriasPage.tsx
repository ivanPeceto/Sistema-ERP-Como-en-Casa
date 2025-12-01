import React from 'react';
import { useNavigate } from 'react-router-dom';
import GestionProductosPage from '../pages/GestionProductosPage';
import GestionCategoriasPage from '../pages/GestionCategoriasPage';

interface GestionProductosAndCategoriasPageProps {}

/**
 * @brief Componente funcional para la página de gestión de productos.
 * @returns {React.ReactElement} El JSX que renderiza la página completa.
 */
const GestionProductosAndCategoriasPage: React.FC<GestionProductosAndCategoriasPageProps> = () => {

    return (
        <div style={{display: 'flex', height: '100%'}}>
            <GestionProductosPage/>
            <GestionCategoriasPage/>
        </div>
    );
};

export default GestionProductosAndCategoriasPage;