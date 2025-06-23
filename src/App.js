import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { LoadingProvider } from './contexts/LoadingContext';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Importa los componentes de cada página
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import RegisterPatientForm from './pages/RegisterPatientForm/RegisterPatientForm';
import PatientDetailsPage from './pages/PatientDetailsPage/PatientDetailsPage';
import PhotoUpload from './components/PhotoUpload/PhotoUpload';

import './App.css';

// Este componente usará useAuth para acceder al estado del usuario
const PrivateRoute = ({ children }) => {
  const { user, loadingAuth } = useAuth(); // Obtiene user y loadingAuth del contexto

  if (loadingAuth) {
    // La pantalla de carga inicial ya se maneja en AuthProvider, pero esto es un fallback/transición
    return null;
  }

  return user ? children : <Navigate to="/login" replace />;
};

function App() {

  return (
    <LoadingProvider>
      <SnackbarProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Ruta de Login: solo accesible si NO hay usuario autenticado */}
                <Route
                  path="/login"
                  element={<LoginPage />}
                />

                {/* Rutas Protegidas: usan PrivateRoute */}
                <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                <Route path="/register-patient" element={<PrivateRoute><RegisterPatientForm /></PrivateRoute>} />
                <Route path="/upload-photo/:patientId" element={<PrivateRoute><PhotoUpload /></PrivateRoute>} />
                <Route path="/patient/:patientId" element={<PrivateRoute><PatientDetailsPage /></PrivateRoute>} />

                {/* Ruta por defecto/comodín: redirige a /home si logueado, a /login si no */}
                <Route
                  path="*"
                  element={<AppRedirector />} // Componente auxiliar para la redirección inicial
                />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </LoadingProvider>
  );
}

// Componente auxiliar para la redirección inicial
const AppRedirector = () => {
  const { user, loadingAuth } = useAuth();
  if (loadingAuth) return null; // No redirigir mientras la autenticación carga
  return user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
};

export default App;
