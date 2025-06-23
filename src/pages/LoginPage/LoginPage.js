import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';

import { useLoading } from '../../contexts/LoadingContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useAuth } from '../../contexts/AuthContext';

// Importa componentes de Material UI
import {
  Box, TextField, Button, Container, CircularProgress, ThemeProvider, AppLogo
} from '../../mui-imports';
import mainTheme from '../../theme/mainTheme';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Si el usuario ya está autenticado, redirige al Home (esto es para cuando se llega a /login directamente)
  useEffect(() => {
    if (user) {
      navigate('/home'); // Redirige directamente al Home
    }
  }, [user, navigate]); // Depende de 'user' y 'navigate'

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    showLoading('Iniciando sesión...');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Cuando el login de Firebase es exitoso, el AuthProvider detecta el cambio
      // y actualiza el estado global 'user'. El useEffect de este componente
      // detectará ese cambio y llamará a onLoginSuccess (que redirige).
      showSnackbar('¡Inicio de sesión exitoso!', 'success');
    } catch (err) {
      console.error("Error al iniciar sesión:", err.code, err.message);
      let errorMessage = 'Error al iniciar sesión. Intenta de nuevo.';
      // ... (manejo de errores)
      showSnackbar(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      hideLoading();
    }
  };

  return (
    <ThemeProvider theme={mainTheme}> {/* Envuelve tu componente con el tema */}
      <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingBottom: '70px' }}>
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'white',
            padding: 4,
            borderRadius: 2,
            boxShadow: 3,
            width: '100%'
          }}
        >
          {/* Logo de la aplicación */}
          <Box component="img" src={AppLogo} alt="Anemia Control Logo" sx={{ mb: 3, width: 100, height: 100 }} />

          <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              variant="outlined"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              variant="outlined"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default LoginPage;