import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    Snackbar,
    Alert, AlertTitle
} from '@mui/material';
import { AlertState } from '../hooks/useAlert';

interface AlertComponentProps {
    alert: AlertState;
    closeAlert: () => void;
}

const AlertCustomized: React.FC<AlertComponentProps> = ({ alert, closeAlert }) => {
    return (
        <>
            {alert.open && (alert.type === 'dialog' ? (
                <Dialog
                    open={alert.open}
                    onClose={closeAlert}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    {/*<DialogTitle id="alert-dialog-title">{"Attention Needed"}</DialogTitle>*/}
                    <Alert severity={alert.severity}>
                        <AlertTitle> {alert.title} </AlertTitle>
                        {alert.message.split('\n').map((line, index) => (
                            <React.Fragment key={index}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))}
                        <DialogActions>
                            <Button onClick={closeAlert} color={alert.severity} autoFocus>
                                OK
                            </Button>
                        </DialogActions>
                    </Alert>
                    {/*<DialogContent>*/}
                    {/*    <DialogContentText id="alert-dialog-description">*/}
                    {/*        {alert.message}*/}
                    {/*    </DialogContentText>*/}
                    {/*</DialogContent>*/}
                </Dialog>
            ) : (
                <Snackbar
                    open={alert.open}
                    autoHideDuration={6000}
                    onClose={closeAlert}
                    message={alert.message}
                    action={
                        <Button color="secondary" size="small" onClick={closeAlert}>
                            Close
                        </Button>
                    }
                />
            ))}
        </>
    );
};

export default AlertCustomized;