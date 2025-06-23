import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useLoading } from './LoadingContext';
import { useSnackbar } from './SnackbarContext';

const AuthContext = createContext();

// Custom Hook para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Carga inicial de autenticación

  const { showLoading, hideLoading } = useLoading();
  const { showSnackbar } = useSnackbar();

  // Observador del estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false); // La verificación de autenticación ha terminado
    });

    // Limpieza: desuscribirse del observador
    return () => unsubscribe();
  }, []); // Se ejecuta solo una vez al levantar el componente

  // Función para cerrar sesión
  const logout = async () => {
    showLoading('Cerrando sesión...');
    try {
      await signOut(auth);
      showSnackbar('Sesión cerrada correctamente.', 'info');
      // Redirección se maneja en el componente que llama (ej. HomePage)
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      showSnackbar('Error al cerrar sesión. Intenta de nuevo.', 'error');
      // Puedes devolver un error o manejarlo aquí directamente
    } finally {
      hideLoading();
    }
  };

  const value = {
    user,
    loadingAuth,
    logout, // Exportamos la función de logout
  };

  // Muestra una pantalla de carga mientras Firebase verifica el estado de autenticación inicial
  if (loadingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.5em', color: '#007bff', backgroundColor: '#f0f2f5' }}>
        <p>Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};