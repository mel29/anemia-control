import { Box, Typography, Button, ThemeProvider } from '../../mui-imports';
import mainTheme from '../../theme/mainTheme';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

function EmptyState({ title, message, actionText, onAction, icon: IconComponent }) {
  return (
    <ThemeProvider theme={mainTheme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto',
          padding: 1,
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 1, // Sombra suave
          textAlign: 'center',
          width: '90%'
        }}
      >
        {IconComponent ? (
          <IconComponent sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        ) : (
          <FormatListBulletedIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        )}

        <Typography variant="h5" component="h3" sx={{ mb: 1, color: 'text.primary' }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {message}
        </Typography>

        {actionText && onAction && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={onAction}
            sx={{ mt: 2 }}
          >
            {actionText}
          </Button>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default EmptyState;