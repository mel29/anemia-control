import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

import {
  Box, Typography, Button, Container, Alert, AppBar, Toolbar, CircularProgress, IconButton, Grid, Card, CardContent,
  CardMedia, Divider, Stack, ThemeProvider, ArrowBackIcon, PersonIcon, BloodtypeIcon, PercentIcon, CakeIcon, MaleIcon, FemaleIcon
} from '../../mui-imports';

import mainTheme from '../../theme/mainTheme';
import { useLoading } from '../../contexts/LoadingContext';
import { useSnackbar } from '../../contexts/SnackbarContext';

const DetailItem = ({ label, value, icon: IconComponent }) => (
  <Grid item xs={12}>
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 1 }}>
        {IconComponent && <IconComponent sx={{ color: mainTheme.palette.primary.main, fontSize: '1.5rem', flexShrink: 0, mt: 0.5 }} />}

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: mainTheme.palette.primary.main, display: 'block', mb: 0.25 }}>
            {label}:
          </Typography>
          <Typography variant="body1" color="text.primary" sx={{ wordBreak: 'break-word' }}>
            {value || 'No disponible'}
          </Typography>
        </Box>
      </Stack>
      <Divider sx={{ my: 1 }} />
    </Box>
  </Grid>
);

function PatientDetailsPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { showLoading, hideLoading } = useLoading();
  const { showSnackbar } = useSnackbar();

  const hasFetchedInitially = useRef(false);

  useEffect(() => {
    if (!patientId) {
      setError('ID de paciente no proporcionado.');
      setLoading(false);
      setPatient(null);
      showSnackbar('Error: ID de paciente no proporcionado.', 'error');
      return;
    }

    const fetchPatientDetails = async () => {
      setLoading(true);
      setError('');
      showLoading(`Cargando detalles del paciente ${patientId.substring(0, 5)}...`);

      try {
        const docRef = doc(db, 'patients', patientId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPatient({ id: docSnap.id, ...docSnap.data() });
          console.log("Datos del paciente cargados:", docSnap.data());
        } else {
          setError('Paciente no encontrado.');
          setPatient(null);
          showSnackbar('Paciente no encontrado.', 'warning');
          console.log("No such document!");
        }
      } catch (err) {
        console.error("Error fetching patient details:", err);
        setError(`Error al cargar los detalles del paciente: ${err.message}`);
        setPatient(null);
        showSnackbar(`Error al cargar los detalles del paciente: ${err.message}`, 'error');
      } finally {
        setLoading(false);
        hideLoading();
      }
    };

    if (patientId) {
      if (!hasFetchedInitially.current) {
        hasFetchedInitially.current = true; // Marca como cargado
        fetchPatientDetails();
      }
    }
  }, [patientId, showLoading, hideLoading, showSnackbar]); // Dependencias: patientId y funciones de contexto

  if (loading) {
    return (
      <ThemeProvider theme={mainTheme}>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 70px)', backgroundColor: mainTheme.palette.background.default }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Cargando detalles del paciente...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // Manejo de errores
  if (error) {
    return (
      <ThemeProvider theme={mainTheme}>
        <Container component="main" maxWidth="md" sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/home')} sx={{ mt: 2 }}>
            Volver al Home
          </Button>
        </Container>
      </ThemeProvider>
    );
  }

  // Si hay un error al cargar los detalles del paciente
  if (!patient) {
    return (
      <ThemeProvider theme={mainTheme}>
        <Container component="main" maxWidth="md" sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
          <Alert severity="warning" sx={{ my: 2 }}>
            Detalles del paciente no disponibles o no encontrados.
          </Alert>
          <Button variant="contained" onClick={() => navigate('/home')} sx={{ mt: 2 }}>
            Volver al Home
          </Button>
        </Container>
      </ThemeProvider>
    );
  }

  const percentage = patient.predictionResult?.confianza
    ? `${parseFloat(patient.predictionResult.confianza).toFixed(4)}%`
    : 'N/A';

  return (
    <ThemeProvider theme={mainTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: mainTheme.palette.background.default, paddingBottom: '70px' }}>
        <AppBar position="static" color="primary" sx={{ mb: 4 }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="back"
              onClick={() => navigate('/home')}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
              Detalles del Paciente
            </Typography>
          </Toolbar>
        </AppBar>

        <Container component="main" maxWidth="md" sx={{ flexGrow: 1, py: 3 }}>
          <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, boxShadow: 3, borderRadius: 2 }}>
            {/* Sección de la imagen */}
            <Box sx={{ flex: 1, minWidth: { xs: 'auto', sm: 250 }, maxWidth: { xs: '100%', sm: 350 }, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
              {patient.imageUrl ? (
                <CardMedia
                  component="img"
                  image={patient.imageUrl}
                  alt={`Foto de ${patient.nombres}`}
                  sx={{ width: '100%', height: 'auto', maxHeight: 300, objectFit: 'contain', borderRadius: 1 }}
                />
              ) : (
                <Box sx={{ width: '100%', height: 200, bgcolor: 'grey.300', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay foto asociada.
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Sección de la información */}
            <CardContent sx={{ flex: 2, p: 3 }}>
              {/* Título de la sección de info */}
              <Typography variant="h5" component="h3" gutterBottom sx={{ color: 'primary.main', mb: 3, textAlign: 'center' }}>
                {patient.nombres} {patient.apellidos}
              </Typography>

              {/* Divisor general */}
              <Divider sx={{ my: 2 }} />

              {/* Stack para apilar los DetailItem verticalmente con espaciado */}
              <Stack spacing={0}>
                <DetailItem label="Nombres Completos" value={patient.nombres} icon={PersonIcon} />
                <DetailItem label="Apellidos Completos" value={patient.apellidos} icon={PersonIcon} />
                <DetailItem label="Edad" value={`${patient.edad} años`} icon={CakeIcon} />
                <DetailItem
                  label="Género"
                  value={patient.genero === 'masculino' ? 'Masculino' : 'Femenino'}
                  icon={patient.genero === 'masculino' ? MaleIcon : FemaleIcon}
                />
                <DetailItem label="Resultado" value={patient.predictionResult?.clase} icon={BloodtypeIcon} />
                <DetailItem label="Confianza de la predicción" value={percentage} icon={PercentIcon} />
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default PatientDetailsPage;