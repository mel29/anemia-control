import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Para navegar programáticamente
import { auth, db } from '../../firebase/firebaseConfig'; // Importa db y auth
import { signOut } from 'firebase/auth';

import { useLoading } from '../../contexts/LoadingContext';
import { useSnackbar } from '../../contexts/SnackbarContext';

import useFirestoreCollection from '../../hooks/useFirestoreCollection';

// Importa componentes de Material UI
import {
  Box, Typography, Button, Container, Alert, List, AppBar, Toolbar, useMediaQuery, useTheme, AddIcon, ExitToAppIcon,
  ThemeProvider, AppLogo, GroupAddIcon, CircularProgress
} from '../../mui-imports';
import mainTheme from '../../theme/mainTheme';

import PatientListItem from '../../components/PatientListItem/PatientListItem';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import EmptyState from '../../components/EmptyState/EmptyState';

function HomePage() {
  const navigate = useNavigate();

  const [openConfirmLogout, setOpenConfirmLogout] = useState(false);

  const { showLoading, hideLoading } = useLoading();
  const { showSnackbar } = useSnackbar();

  const muiTheme = useTheme(); // Accede al tema de MUI
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down('sm')); // 'sm' es 600px por defecto en MUI

  const {
    data: patients,
    loading,
    error,
    refreshData // útil si recargamos la lista manualmente
  } = useFirestoreCollection('patients', 'registeredAt', 'desc'); // (collectionName, orderByField, orderDirection)

  const handleOpenConfirmLogout = () => {
    setOpenConfirmLogout(true);
  };

  const handleCloseConfirmLogout = () => {
    setOpenConfirmLogout(false);
  };

  const handleConfirmLogout = async () => {
    setOpenConfirmLogout(false); // Cierra el diálogo de confirmación
    showLoading('Cerrando sesión...'); // Muestra el loading mientras se cierra sesión
    try {
      await signOut(auth);
      hideLoading();
      showSnackbar('Sesión cerrada correctamente.', 'info');
      navigate('/login'); // El AuthProvider puede redirigir si el user se vuelve null
    } catch (err) {
      // El error ya se muestra con showSnackbar en el contexto
      console.error("Error al cerrar sesión:", err);
      hideLoading();
      showSnackbar('Error al cerrar sesión. Intenta de nuevo.', 'error');
    }
  };

  const handleAddPatient = () => {
    navigate('/register-patient'); // Navega al formulario de registro
  };

  const handleViewPatientDetails = (patientId) => {
    navigate(`/patient/${patientId}`); // Navega al detalle del paciente
  };

  return (
    <ThemeProvider theme={mainTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: mainTheme.palette.background.default, paddingBottom: '70px' }}>
        {/* Header con AppBar */}
        <AppBar position="static" color="primary" sx={{ mb: 4 }}>
          <Toolbar>
            <Box component="img" src={AppLogo} alt="Anemia Control Logo"
              sx={{
                height: 40,
                width: 40,
                mr: 2,
                display: 'block'
              }} />

            <Typography variant="h6" component="div"
              sx={{
                color: 'white',
                flexShrink: 0,
                mr: 2,
                display: { xs: 'none', sm: 'block' }
              }}>
              Dashboard de Pacientes
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1, justifyContent: 'flex-end' }}>
              <Button
                color="inherit" // Hereda el color del AppBar (blanco para texto)
                startIcon={<AddIcon />}
                onClick={handleAddPatient}
                sx={{
                  mr: 1,
                  whiteSpace: 'nowrap', // Evita que el texto se rompa
                  minWidth: isSmallScreen ? 'auto' : 0, // En pantalla pequeña, minWidth 'auto', sino 0
                  px: isSmallScreen ? 1 : 2, // Padding horizontal más pequeño en móvil
                  '& .MuiButton-startIcon': { // Estilo para el icono
                    marginRight: isSmallScreen ? 0 : 8 // Margen del icono
                  },
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                {isSmallScreen ? '' : 'Agregar Paciente'}
              </Button>
              <Button
                color="inherit"
                startIcon={<ExitToAppIcon />}
                onClick={handleOpenConfirmLogout}
                sx={{
                  whiteSpace: 'nowrap',
                  minWidth: isSmallScreen ? 'auto' : 0,
                  px: isSmallScreen ? 1 : 2,
                  '& .MuiButton-startIcon': {
                    marginRight: isSmallScreen ? 0 : 8
                  },
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                {isSmallScreen ? '' : 'Cerrar Sesión'}
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ flexGrow: 1, py: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }} >
              <CircularProgress size={60} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
              <Button onClick={handleOpenConfirmLogout} color="error" variant="outlined" sx={{ ml: 2 }}>
                Cerrar Sesión
              </Button>
            </Alert>
          ) : patients.length === 0 ? (
            <EmptyState
              title="¡Aún no hay pacientes registrados!"
              message="Parece que no hay datos de pacientes en el sistema. Registra al primer paciente para comenzar a controlar la anemia."
              actionText="Registrar Nuevo Paciente"
              onAction={handleAddPatient}
              icon={GroupAddIcon} // Usa un icono de grupo para añadir paciente
            />
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
              {patients.map(patient => (
                <PatientListItem
                  key={patient.id}
                  patient={patient}
                  onViewDetails={handleViewPatientDetails}
                />
              ))}
            </List>
          )}
        </Container>

        <ConfirmationDialog
          open={openConfirmLogout}
          title="Confirmar Cierre de Sesión"
          message="¿Estás seguro que deseas cerrar tu sesión actual?"
          onConfirm={handleConfirmLogout}
          onCancel={handleCloseConfirmLogout}
        />
      </Box>
    </ThemeProvider>
  );
}

export default HomePage;