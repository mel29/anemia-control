import { createTheme } from '@mui/material/styles';

const mainTheme = createTheme({
  palette: {
    primary: {
      main: '#A4161A', // rojo principal
    },
    secondary: {
      main: '#28a745', // verde para éxito/botones
    },
    error: {
      main: '#dc3545', // rojo para errores
    },
    background: {
      default: '#f5f7fa', // color de fondo de las páginas
    }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default mainTheme;