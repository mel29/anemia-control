import React, { createContext, useContext, useState } from 'react';
import { Backdrop, Typography, Box } from '../mui-imports';

const LoadingContext = createContext();

// Custom Hook para usar el contexto de carga
export const useLoading = () => {
    return useContext(LoadingContext);
};

// Proveedor del contexto de carga
export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Cargando...');

    // Función para activar el estado de carga
    const showLoading = (message = 'Cargando...') => {
        setLoadingMessage(message);
        setIsLoading(true);
    };

    // Función para desactivar el estado de carga
    const hideLoading = () => {
        setIsLoading(false);
        setLoadingMessage('Cargando...'); // Restablecer mensaje predeterminado
    };

    const value = {
        isLoading,
        loadingMessage,
        showLoading,
        hideLoading,
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}
            {/* El Backdrop se renderiza aquí, fuera del flujo normal de los hijos */}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isLoading}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
                        {loadingMessage}
                    </Typography>
                </Box>
            </Backdrop>
        </LoadingContext.Provider>
    );
};