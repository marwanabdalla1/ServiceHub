import { useState, useCallback, useEffect } from 'react';
import { AlertColor } from '@mui/material';
import {useNavigate} from "react-router-dom";

export interface AlertState {
    open: boolean;
    title: string,
    message: string;
    severity: AlertColor;
    type: string;
    position: string;
    duration: number;
    redirectUrl?: string;
}

function useAlert(defaultDuration: number | null) {
    const navigate = useNavigate();
    const durationTimeout = defaultDuration || 3000 // Default is 3000 milliseconds
    const [alert, setAlert] = useState<AlertState>({
        open: false,
        title: '',
        message: '',
        severity: 'info',
        duration: durationTimeout,
        type: 'dialog', // Default to dialog, could be 'notification'
        position: 'center', // Customize the position, like 'top-right', 'bottom-left', etc.
    });
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const closeAlert = useCallback(() => {
        if (timeoutId) {
            clearTimeout(timeoutId); // Clear the timeout if the alert is manually closed
            setTimeoutId(null);
        }

        setAlert(prev => ({ ...prev, open: false }));


        if (alert.redirectUrl) {
            if (window.location.pathname === alert.redirectUrl) {
                window.location.reload();
            } else {
                console.log("navigating")
                navigate(alert.redirectUrl);
            }
        } else{
            window.location.reload();
        }

    }, [timeoutId]);

    const triggerAlert = useCallback((title: string, message: string, severity: AlertColor = 'info', duration: number = durationTimeout, type: string = 'dialog', position: string = 'center', redirectUrl?:string) => {
        setAlert({ open: true, title, message, severity, duration, type, position, redirectUrl });

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
