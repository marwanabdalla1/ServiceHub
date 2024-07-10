import React from 'react';
import { Typography, Container, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
    title: string;  // Title for the error page
    message: string;  // Description or error message
    redirectPath?: string;
    redirectTitle?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ title, message, redirectPath= "/", redirectTitle="Home" }) => {
    const navigate = useNavigate();
    const messageElements = message.split('\n').map((part, index) => (
        <span key={index}>
      {part}
            {index < message.split('\n').length - 1 && <br />}
    </span>
    ));

    return (
        <Container maxWidth="md">
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
                    {messageElements}
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate(redirectPath)} sx={{ mt: 2 }}>
                    Go to {redirectTitle}
                </Button>
            </Box>
        </Container>
    );
};

export default ErrorPage;
