import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Typography,
  VisibilityIcon,
  ThemeProvider
} from '../../mui-imports';

import mainTheme from '../../theme/mainTheme';

function PatientListItem({ patient, onViewDetails }) {
  const Wrapper = ({ children }) => <ThemeProvider theme={mainTheme}>{children}</ThemeProvider>;
  // Función para obtener las iniciales
  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  // Formatear la fecha y hora de registro (viene como un objeto Timestamp de Firestore)
  const formatTimestamp = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      const date = timestamp.toDate();
      return date.toLocaleString(); // Formato local de fecha y hora
    }
    return 'Fecha no disponible';
  };

  const initials = getInitials(patient.nombres, patient.apellidos);

  return (
    <Wrapper>
      <ListItem
        secondaryAction={ // Contenido a la derecha del item (botón de ver detalle)
          <IconButton edge="end" aria-label="ver-detalle" onClick={() => onViewDetails(patient.id)}>
            <VisibilityIcon sx={{ color: 'primary.main' }} /> {/* Icono de ojo */}
          </IconButton>
        }
        sx={{
          py: 2, // Padding vertical
          borderBottom: '1px solid #f0f0f0', // Separador suave
          '&:last-child': { borderBottom: 'none' }, // Sin borde en el último item
          '&:hover': {
            backgroundColor: '#e0f7fa', // Color al pasar el mouse
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out'
          }
        }}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: 'primary.main', width: 50, height: 50, fontSize: '1.5rem' }}>
            {initials}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="h6" component="div" sx={{ fontSize: '1.15rem' }}>
              {patient.nombres} {patient.apellidos}
            </Typography>
          }
          secondary={
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              Registrado: {formatTimestamp(patient.registeredAt)}
            </Typography>
          }
        />
      </ListItem>
    </Wrapper>
  );
}

export default PatientListItem;