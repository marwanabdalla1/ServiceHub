import React from 'react';
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField
} from '@mui/material';
import Typography from "@mui/material/Typography";

interface ConfirmDeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (email?: string) => void;
    message: string;
    isDeleteAccount?: boolean;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
                                                                     open,
                                                                     onClose,
                                                                     onConfirm,
                                                                     message,
                                                                     isDeleteAccount = false
                                                                 }) => {
    const [email, setEmail] = React.useState<string>('');

    const handleConfirm = () => {
        if (isDeleteAccount) {
            onConfirm(email);
        } else {
            onConfirm();
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
                <DialogContentText>
                    <Typography component="span" sx={{color: 'red', fontWeight: 'bold'}}>
                        Important: This action is permanent and cannot be undone.
                    </Typography>
                </DialogContentText>
                {isDeleteAccount && (
                    <Box mt={2}>
                        <DialogContentText>
                            Please enter the email address associated with this account to confirm.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Email Address"
                            type="email"
                            fullWidth
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleConfirm} color="error" autoFocus>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDeleteDialog;
