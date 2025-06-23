import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ThemeProvider 
} from '../../mui-imports';

import mainTheme from '../../theme/mainTheme';

function ConfirmationDialog({ open, title, message, onConfirm, onCancel }) {
  return (
    <ThemeProvider theme={mainTheme}>
      <Dialog
        open={open}
        onClose={onCancel}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
      >
        <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmation-dialog-description">
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="primary" variant="outlined">
            Cancelar
          </Button>
          <Button onClick={onConfirm} color="primary" variant="contained" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default ConfirmationDialog;