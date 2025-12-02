import React from 'react';
import GestionRecetasPage from './GestionRecetasPage';
import GestionInsumosPage from './GestionInsumosPage';

interface GestionRecetasAndInsumosPageProps {}

/**
 * @brief Componente funcional para la página de recetas e insumos.
 * @returns {React.ReactElement} El JSX que renderiza la página completa.
 */
const GestionProductosAndCategoriasPage: React.FC<GestionRecetasAndInsumosPageProps> = () => {

    return (
        <div style={{display: 'flex', height: '100%'}}>
            <GestionRecetasPage/>
            <GestionInsumosPage/>
        </div>
    );
};

export default GestionProductosAndCategoriasPage;