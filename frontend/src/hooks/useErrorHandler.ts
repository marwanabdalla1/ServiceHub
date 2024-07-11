import { useState } from 'react';
import axios from 'axios';

function useErrorHandler(defaultMessage = 'An unexpected error occurred') {
    const [error, setError] = useState({
        title: '',
        message: defaultMessage,
    });

    const handleError = (err: any) => {
        if (axios.isAxiosError(err)) {
            if (err.response) {
                // Customize based on status codes or error types

                setError({
                    title: `${err.response.status} ${err.response.statusText}`,
                    message: err.response.data.message || defaultMessage,
                });
            } else if (err.request) {
                setError({
                    title: 'Network Error',
                    message: 'The request was made but no response was received',
                });
            } else {
                setError({
                    title: 'Error',
                    message: err.message,
                });
            }
        } else {
            setError({
                title: 'Error',
                message: err.toString() || defaultMessage,
            });
        }
    };

    return { error, setError, handleError };
}

export default useErrorHandler;
