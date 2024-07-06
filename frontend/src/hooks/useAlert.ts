// hooks/useAlert.ts
import { useState, useCallback } from 'react';
import { Alert, AlertColor } from '@mui/material';

interface AlertState {
    open: boolean;
    message: string;
    severity: AlertColor;
}

function useAlert() {
    const [alert, setAlert] = useState<AlertState>({
        open: false,
        message: '',
        severity: 'info',
    });

    const triggerAlert = useCallback((message: string, severity: AlertColor = 'info') => {
        setAlert({ open: true, message, severity });
    }, []);

    const closeAlert = useCallback(() => {
        setAlert({ ...alert, open: false });
    }, [alert]);

    return {
        alert,
        triggerAlert,
        closeAlert,
    };
}

export default useAlert;
