import {useState, useCallback, useEffect, useRef} from 'react';
import {AlertColor} from '@mui/material';
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

function useAlert(defaultDuration: number =5000) {
    const navigate = useNavigate();
    // const durationTimeout = defaultDuration || 5000 // Default is 3000 milliseconds
    const [alert, setAlert] = useState<AlertState>({
        open: false,
        title: '',
        message: '',
        severity: 'info',
        duration: defaultDuration,
        type: 'dialog', // Default to dialog, could be 'notification'
        position: 'center', // Customize the position
    });
    // const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

    // close the alert on clicking the button
    const closeAlert = useCallback(() => {
        // if (timeoutId) {
        //     clearTimeout(timeoutId); // Clear the timeout if the alert is manually closed
        //     setTimeoutId(null);
        // }

        setAlert(prev => ({...prev, open: false}));


        if (alert.redirectUrl) {
            if(alert.redirectUrl.toString() === 'none'){
                return;
            }
            else if (window.location.pathname === alert.redirectUrl) {
                window.location.reload();
            } else {
                navigate(alert.redirectUrl);
            }
        } else {
            window.location.reload()
        }

    }, [alert.redirectUrl]);

    // customizable alert
    const triggerAlert = useCallback((title: string, message: string, severity: AlertColor = 'info', duration: number = defaultDuration, type: string = 'dialog', position: string = 'center', redirectUrl?: string) => {
        setAlert({open: true, title, message, severity, duration, type, position, redirectUrl});

        timeoutIdRef.current = setTimeout(() => {
            closeAlert();
        }, duration);
    }, [closeAlert, defaultDuration]);

    // Cleanup timeout when component using this hook unmounts
    useEffect(() => {
        return () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
            }
        };
    }, []);

    return {
        alert,
        triggerAlert,
        closeAlert,
    };
}

export default useAlert;
