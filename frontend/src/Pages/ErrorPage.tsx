import React from 'react';
import { Typography, Container, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
interface ErrorPageProps {
    title: string;
    message: string;
    redirectPath?: string;
    redirectTitle?: string;
}

// uniform, reusable error page
const ErrorPage: React.FC<ErrorPageProps> = ({
                                                 title,
                                                 message,
                                                 redirectPath = "/",
                                                 redirectTitle = "Home"
                                             }) => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            textAlign: 'center'
        }}>
            <Box style={{ marginBottom: 20 }}>
                <SentimentVeryDissatisfiedIcon style={{ fontSize: 80, color: '#ff6347' }} /> {/* Tomato-colored icon */}
                <Typography variant="h4" component="h1" gutterBottom style={{ fontWeight: 'bold', color: '#333' }}>
                    {title}
                </Typography>
                <Typography variant="subtitle1" style={{ color: '#555' }}>
                    {message}
                </Typography>
            </Box>
            <Button variant="contained" color="primary" onClick={() => navigate(redirectPath)} sx={{ mt: 2, backgroundColor: '#ff7961', '&:hover': { backgroundColor: '#b71c1c' } }}>
                Go To {redirectTitle}
            </Button>
        </Container>
    );
};

export default ErrorPage;
