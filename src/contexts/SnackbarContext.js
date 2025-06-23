import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '../mui-imports';

const SnackbarContext = createContext();

// Custom Hook para usar el contexto de Snackbar
export const useSnackbar = () => {
    return useContext(SnackbarContext);
};

// Proveedor del contexto de Snackbar
export const SnackbarProvider = ({ children }) => {
    const [snackbarState, setSnackbarState] = useState({
        open: false,
        message: '',
        severity: 'info', // info, success, warning, error
        autoHideDuration: 6000, // Duración por defecto
    });

    // Función para mostrar el Snackbar
    const showSnackbar = useCallback((message, severity = 'info', autoHideDuration = 6000) => {
        setSnackbarState({
            open: true,
            message,
            severity,
            autoHideDuration,
        });
    }, []);

    // Función para cerrar el Snackbar
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarState(prevState => ({ ...prevState, open: false }));
    };

    const value = {
        showSnackbar,
    };

    return (
        <SnackbarContext.Provider value={value}>
            {children}
            {/* El Snackbar se renderiza aquí, fuera del flujo normal de los hijos */}
            <Snackbar
                open={snackbarState.open}
                autoHideDuration={snackbarState.autoHideDuration}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Posición del Snackbar
            >
                <Alert
                    onClose={handleClose}
                    severity={snackbarState.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbarState.message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
};