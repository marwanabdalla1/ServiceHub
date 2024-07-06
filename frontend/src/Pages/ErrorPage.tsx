import React from 'react';
import { Typography, Container, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
    title: string;  // Title for the error page
    message: string;  // Description or error message
}

const ErrorPage: React.FC<ErrorPageProps> = ({ title, message }) => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm">
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh" // This ensures the box takes at least the full height of the viewport
                textAlign="center"
            >
                <Typography variant="h3" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h5" gutterBottom>
                    {message}
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate('/')} sx={{ mt: 4 }}>
                    Go to Home
                </Button>
            </Box>
        </Container>
    );
};

export default ErrorPage;
