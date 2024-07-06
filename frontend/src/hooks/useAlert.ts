import { useState, useCallback, useEffect } from 'react';
import { AlertColor } from '@mui/material';

interface AlertState {
    open: boolean;
    message: string;
    severity: AlertColor;
}

function useAlert(defaultDuration: number | null) {
    const durationTimeout = defaultDuration || 3000 //default is 3000
    const [alert, setAlert] = useState<AlertState>({
        open: false,
        message: '',
        severity: 'info',
    });
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const closeAlert = useCallback(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);  // Clear the timeout if the alert is manually closed
            setTimeoutId(null);
        }
        setAlert(prev => ({ ...prev, open: false }));
    }, [timeoutId]);

    const triggerAlert = useCallback((message: string, severity: AlertColor = 'info', duration: number = durationTimeout) => {
        setAlert({ open: true, message, severity });

        const id = setTimeout(() => {
            closeAlert();
        }, duration);
        setTimeoutId(id);
    }, [closeAlert, durationTimeout]);

    // Cleanup timeout when component using this hook unmounts
    useEffect(() => {
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [timeoutId]);

    return {
        alert,
        triggerAlert,
        closeAlert,
    };
}

export default useAlert;
