import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Importa Firestore
import { db } from '../../firebase/firebaseConfig'; // Importa la instancia 'db'

import { useLoading } from '../../contexts/LoadingContext';
import { useSnackbar } from '../../contexts/SnackbarContext';

// Importa componentes de Material UI
import {
  Box, TextField, Button, Typography, Container, FormControl, CircularProgress, InputLabel, Select, MenuItem, AppBar,
  Toolbar, IconButton, ArrowBackIcon, ThemeProvider
} from '../../mui-imports';
import mainTheme from '../../theme/mainTheme';

function RegisterPatientForm() {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [edad, setEdad] = useState('');
  const [genero, setGenero] = useState(''); // Estado para el género

  const [errors, setErrors] = useState({}); // Objeto para manejar los errores de validación
  const { showLoading, hideLoading, isLoading } = useLoading();
  const { showSnackbar } = useSnackbar();

  const [errorMessage] = useState(''); // Error general al guardar en DB

  const navigate = useNavigate();

  // Función de validación de campos
  const validateForm = () => {
    const newErrors = {};
    const lettersOnlyRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/; // Permite letras, tildes, ñ y espacios
    const numbersOnlyRegex = /^\d+$/; // Solo números

    if (!nombres.trim()) {
      newErrors.nombres = 'Los nombres son obligatorios.';
    } else if (!lettersOnlyRegex.test(nombres.trim())) {
      newErrors.nombres = 'Los nombres solo deben contener letras.';
    }

    if (!apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios.';
    } else if (!lettersOnlyRegex.test(apellidos.trim())) {
      newErrors.apellidos = 'Los apellidos solo deben contener letras.';
    }

    if (!edad.trim()) {
      newErrors.edad = 'La edad es obligatoria.';
    } else if (!numbersOnlyRegex.test(edad.trim())) {
      newErrors.edad = 'La edad solo debe contener números.';
    } else if (parseInt(edad) < 0 || parseInt(edad) > 120) { // Validar rango de edad
      newErrors.edad = 'La edad debe estar entre 0 y 120 años.';
    }

    if (!genero) { // Validamos que el género no sea vacío
      newErrors.genero = 'El género es obligatorio.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Si hay errores de validación, la función validateForm ya los ha establecido.
      showSnackbar('Por favor, corrige los errores del formulario.', 'error');
      return;
    }

    showLoading('Guardando paciente...'); // Mostrar mensaje de carga

    try {
      // Añadir el nuevo documento a la colección 'patients' en Firestore
      const docRef = await addDoc(collection(db, 'patients'), {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        edad: parseInt(edad), // Guardamos la edad como número
        genero: genero,
        registeredAt: serverTimestamp(), // Guarda la fecha y hora del servidor de Firebase
        imageUrl: null, // Campo para la URL de la imagen, inicialmente nulo
      });

      console.log("Documento escrito con ID: ", docRef.id);
      showSnackbar('Paciente registrado exitosamente!', 'success');

      // Redirigir a la pantalla de carga de fotos, pasando el ID del paciente recién creado
      navigate(`/upload-photo/${docRef.id}`);

    } catch (err) {
      console.error("Error al guardar paciente:", err);
      showSnackbar('Error al guardar el paciente. Por favor, intenta de nuevo.', 'error');
    } finally {
      hideLoading();
    }
  };

  return (
    <ThemeProvider theme={mainTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: mainTheme.palette.background.default, paddingBottom: '70px' }}>
        {/* AppBar para el encabezado con botón de regresar */}
        <AppBar position="static" color="primary" sx={{ mb: 4 }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="back"
              onClick={() => navigate('/home')} // Navega de regreso al Home
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
              Registrar Nuevo Paciente
            </Typography>
          </Toolbar>
        </AppBar>

        <Container component="main" maxWidth="sm" sx={{ flexGrow: 1, py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            sx={{
              marginTop: 4,
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
            <Typography component="h2" variant="h5" sx={{ mb: 3, color: 'primary.main' }}>
              Formulario de Registro
            </Typography>
            <Box component="form" onSubmit={handleSavePatient} noValidate sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="nombres"
                label="Nombres Completos"
                name="nombres"
                value={nombres}
                onChange={(e) => {
                  setNombres(e.target.value);
                  setErrors(prev => ({ ...prev, nombres: '' }));
                }}
                error={!!errors.nombres} //!! convierte a booleano
                helperText={errors.nombres} // Muestra el mensaje de error debajo del input
                disabled={isLoading}
                variant="outlined"
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="apellidos"
                label="Apellidos Completos"
                name="apellidos"
                value={apellidos}
                onChange={(e) => {
                  setApellidos(e.target.value);
                  setErrors(prev => ({ ...prev, apellidos: '' }));
                }}
                error={!!errors.apellidos}
                helperText={errors.apellidos}
                disabled={isLoading}
                variant="outlined"
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="edad"
                label="Edad"
                name="edad"
                value={edad}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setEdad(value);
                  setErrors(prev => ({ ...prev, edad: '' }));
                }}
                error={!!errors.edad}
                helperText={errors.edad}
                disabled={isLoading}
                variant="outlined"
              />

              <FormControl fullWidth margin="normal" required error={!!errors.genero}>
                <InputLabel id="genero-label">Género</InputLabel>
                <Select
                  labelId="genero-label"
                  id="genero"
                  value={genero}
                  label="Género"
                  onChange={(e) => {
                    setGenero(e.target.value);
                    setErrors(prev => ({ ...prev, genero: '' }));
                  }}
                  disabled={isLoading}
                >
                  <MenuItem value="">-- Selecciona --</MenuItem>
                  <MenuItem value="masculino">Masculino</MenuItem>
                  <MenuItem value="femenino">Femenino</MenuItem>
                </Select>
                {errors.genero && <Typography variant="caption" color="error">{errors.genero}</Typography>}
              </FormControl>

              {errorMessage && (
                showSnackbar(errorMessage, 'error')
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Guardar Paciente'}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default RegisterPatientForm;