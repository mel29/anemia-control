import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../firebase/firebaseConfig';

import { useLoading } from '../../contexts/LoadingContext';
import { useSnackbar } from '../../contexts/SnackbarContext';

import {
  Box, Typography, Button, CircularProgress, Alert, Container,
  AppBar, Toolbar, IconButton, Card, CardContent, CardMedia,
  LinearProgress, Stack, ThemeProvider, ArrowBackIcon, AddPhotoAlternateIcon, PhotoCameraIcon
} from '../../mui-imports';

import mainTheme from '../../theme/mainTheme';

function PhotoUpload() {
  const [image, setImage] = useState(null);
  const { showLoading, hideLoading, isLoading: isGlobalLoading } = useLoading();
  const { showSnackbar } = useSnackbar();
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [saveDbError, setSaveDbError] = useState('');

  const [patientName, setPatientName] = useState('...');
  const [patientLoadError, setPatientLoadError] = useState('');

  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const navigate = useNavigate();
  const { patientId } = useParams();

  const [triggerSuccessSnackbar, setTriggerSuccessSnackbar] = useState(false);
  const [triggerErrorSnackbar, setTriggerErrorSnackbar] = useState(false);

  const ML_API_URL = "https://anemia-control-api-107317727490.us-central1.run.app/predict/"

  useEffect(() => {
    const fetchPatientName = async () => {
      try {
        const docRef = doc(db, 'patients', patientId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPatientName(`${data.nombres || ''} ${data.apellidos || ''}`);
        } else {
          setPatientName('Paciente no encontrado');
          setPatientLoadError('Paciente no encontrado en la base de datos.');
          showSnackbar('Error: Paciente no encontrado.', 'error');
        }
      } catch (err) {
        console.error("Error al cargar el nombre del paciente:", err);
        setPatientName('Error al cargar nombre');
        setPatientLoadError('Error al cargar el nombre del paciente.');
        showSnackbar('Error al cargar nombre del paciente.', 'error');
      }
    };

    if (patientId) {
      fetchPatientName();
    } else {
      setPatientLoadError('ID de paciente no disponible.');
      showSnackbar('Error: ID de paciente no disponible.', 'error');
    }

    setImage(null);
    setIsProcessingUpload(false);
    setProgress(0);
    setDownloadURL('');
    setUploadError('');
    setSaveDbError('');
    setTriggerSuccessSnackbar(false);
    setTriggerErrorSnackbar(false);
  }, [patientId, showSnackbar]);


  useEffect(() => {
    if (triggerSuccessSnackbar) {
      showSnackbar('¡Imagen subida y asociada exitosamente!', 'success');
    }
  }, [triggerSuccessSnackbar, showSnackbar]);

  useEffect(() => {
    if (triggerErrorSnackbar) {
      const msg = uploadError || saveDbError || patientLoadError || 'Ocurrió un error inesperado durante la subida.';
      showSnackbar(msg, 'error');
      setTriggerErrorSnackbar(false);
    }
  }, [triggerErrorSnackbar, uploadError, saveDbError, patientLoadError, showSnackbar]);


  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setUploadError('');
      setSaveDbError('');
      setDownloadURL('');
      setProgress(0);
      setTriggerSuccessSnackbar(false);
      setTriggerErrorSnackbar(false);
      setIsProcessingUpload(false);
    }
  };

  const handleUpload = () => {
    if (!image) {
      const msg = 'Por favor, selecciona una imagen primero para subir.';
      setUploadError(msg);
      showSnackbar(msg, 'warning');
      return;
    }
    if (!patientId) {
      const msg = 'Error: ID de paciente no disponible para asociar la imagen.';
      setUploadError(msg);
      showSnackbar(msg, 'error');
      return;
    }
    if (patientLoadError) {
      const msg = `No se puede subir la imagen: ${patientLoadError}`;
      setUploadError(msg);
      showSnackbar(msg, 'error');
      return;
    }
    if (patientName === '...' || !patientName.trim()) { // Nos aseguramos de que el nombre del paciente se haya cargado
      const msg = 'Por favor, espera a que los datos del paciente carguen completamente.';
      setUploadError(msg);
      showSnackbar(msg, 'warning');
      return;
    }

    setIsProcessingUpload(true);
    setUploadError('');
    setSaveDbError('');
    setTriggerSuccessSnackbar(false);
    setTriggerErrorSnackbar(false);

    showLoading('Subiendo y analizando imagen...'); // Activa el Backdrop global

    const storageRef = ref(storage, `patient_images/${patientId}/${Date.now()}-${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on('state_changed',
      (snapshot) => {
        const prog = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(prog);
        console.log(`[PhotoUpload] Progreso de subida: ${prog}%`); // Log de progreso
      },
      (error) => {
        console.error("[PhotoUpload] Error en la subida a Storage:", error); // Log de error en Storage
        setUploadError(`Error al subir: ${error.message || 'Error desconocido'}`);
        setTriggerErrorSnackbar(true);
        setIsProcessingUpload(false);
        setProgress(0);
        hideLoading();
      },
      async () => { // Callback de COMPLETADO de la subida a Storage
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setDownloadURL(url);
          setProgress(100);
          setImage(null);
          if (galleryInputRef.current) galleryInputRef.current.value = "";
          if (cameraInputRef.current) cameraInputRef.current.value = "";

          console.log("[PhotoUpload] URL de descarga obtenida:", url);

          // Llamada a la API de ML para procesar la imagen
          console.log(`[PhotoUpload] Llamando a API del modelo ML: ${ML_API_URL}`);
          const modelResponse = await fetch(ML_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url_image: url }),
          });

          if (!modelResponse.ok) {
            let errorMsg = `ML_API_RESPONSE: ${modelResponse.message || 'Error desconocido'}`;
            try {
              const errorBody = await modelResponse.json();
              errorMsg += ` - Detalles: ${JSON.stringify(errorBody)}`;
            } catch (jsonError) {
              console.warn("[PhotoUpload] No se pudo parsear el cuerpo del error como JSON.");
            }
            throw new Error(errorMsg);
          }

          const modelData = await modelResponse.json();
          console.log("[PhotoUpload] Respuesta del modelo ML:", modelData);

          if (modelData.success) {
            // --- Actualizar el documento del paciente en Firestore con la URL de la imagen y el resultado del modelo ---
            const patientDocRef = doc(db, 'patients', patientId);
            await updateDoc(patientDocRef, {
              imageUrl: url,
              predictionResult: { // Guarda el resultado del modelo
                clase: modelData.clase,
                confianza: modelData.confianza,
                message: modelData.message,
                processedAt: serverTimestamp()
              },
            });
            console.log("[PhotoUpload] Firestore actualizado con URL y resultado del modelo.");
            setTriggerSuccessSnackbar(true);

          } else {
            // Si el modelo devuelve success: false
            throw new Error(`Error del modelo: ${modelData.message || 'Predicción fallida.'}`);
          }

          setIsProcessingUpload(false); // Desactiva el estado local ANTES de navegar
          hideLoading(); // Oculta loading global ANTES de navegar
          navigate(`/patient/${patientId}`);

        } catch (err) {
          console.error("[PhotoUpload] ERROR en proceso de ML o Firestore:", err);
          setSaveDbError(`Error al analizar la imagen o guardar el resultado: ${err.message || 'Error desconocido'}`);
          setTriggerErrorSnackbar(true);
          setIsProcessingUpload(false);
          setProgress(0);
          hideLoading();
        }
      }
    );
  };

  return (
    <ThemeProvider theme={mainTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: mainTheme.palette.background.default, paddingBottom: '70px' }}>
        <AppBar position="static" color="primary" sx={{ mb: 4 }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="back"
              onClick={() => navigate(`/patient/${patientId}`)}
              sx={{ mr: 2 }}
              disabled={isGlobalLoading || isProcessingUpload || patientName === '...'}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
              Subir Foto para: {patientName}
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
              Seleccionar o Tomar Foto
            </Typography>
            {patientLoadError && (
              <Alert severity="error" sx={{ mt: 2, mb: 2, width: '100%' }}>
                {patientLoadError} No se puede continuar.
              </Alert>
            )}
            {patientName === '...' && !patientLoadError && (
              <CircularProgress sx={{ my: 2 }} />
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, width: '100%', justifyContent: 'center' }}>
              <input
                type="file" accept="image/*" onChange={handleChange} style={{ display: 'none' }} ref={galleryInputRef}
              />
              <Button
                variant="outlined" startIcon={<AddPhotoAlternateIcon />} onClick={() => galleryInputRef.current.click()}
                disabled={isProcessingUpload || !!patientLoadError || patientName === '...'}
                sx={{ flexGrow: 1 }}
              >
                Abrir Galería
              </Button>

              <input
                type="file" accept="image/*" capture="camera" onChange={handleChange} style={{ display: 'none' }} ref={cameraInputRef}
              />
              <Button
                variant="contained" startIcon={<PhotoCameraIcon />} onClick={() => cameraInputRef.current.click()}
                disabled={isProcessingUpload || !!patientLoadError || patientName === '...'}
                color="secondary" sx={{ flexGrow: 1 }}
              >
                Abrir Cámara
              </Button>
            </Stack>

            {image && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Imagen seleccionada: {image.name}</Typography>}

            {isProcessingUpload && progress > 0 && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 5 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  Subiendo: {progress}%
                </Typography>
              </Box>
            )}

            {!isProcessingUpload && (
              <Button
                variant="contained" color="primary" onClick={handleUpload}
                disabled={!image || !!patientLoadError || patientName === '...'}
                sx={{ mt: 3, mb: 2, py: 1.5, width: '100%', maxWidth: 250 }}
              >
                Subir Imagen
              </Button>
            )}

            {image && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Card sx={{ maxWidth: 300, boxShadow: 1 }}>
                  <CardMedia
                    component="img" image={URL.createObjectURL(image)} alt="Vista previa de imagen"
                    sx={{ maxHeight: 200, objectFit: 'contain' }}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {image.name} ({Math.round(image.size / 1024)} KB)
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default PhotoUpload;