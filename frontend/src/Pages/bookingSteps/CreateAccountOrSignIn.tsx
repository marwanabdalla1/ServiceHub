import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Card, CardContent } from '@mui/material';
import { useBooking } from '../../contexts/BookingContext';


interface CreateAccountOrSignInProps {
    onNext: () => void;
    onBack: () => void;
}

function CreateAccountOrSignIn({ onNext, onBack }: CreateAccountOrSignInProps) {
    const { bookingDetails } = useBooking();
    const navigate = useNavigate();
    const isAuthenticated = false; // todo: Replace this with actual authentication logic

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/update-profile');
        }
    }, [isAuthenticated, navigate]);

    const handleSignUpClick = () => {
        navigate('/signup');
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Box sx={{ width: '60%' }}>
                    <Typography variant="h6" gutterBottom>
                        Step 1 of 3
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button variant="outlined" onClick={onBack}>Back</Button>
                        <Button variant="contained" onClick={onNext}>Next</Button>
                    </Box>
                    <Typography variant="h4" gutterBottom>
                        Create account or sign in
                    </Typography>
                    <Button variant="contained" sx={{ mb: 2, width: '100%' }} onClick={handleSignUpClick}>
                        Sign up with email
                    </Button>
                    <Button variant="text" sx={{ width: '100%' }} onClick={handleLoginClick}>
                        Log in
                    </Button>
                </Box>
                <Box sx={{ width: 250 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6">{`${bookingDetails.provider?.firstName} ${bookingDetails.provider?.lastName}`}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.location}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.service}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.price}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Container>
    );
}

export default CreateAccountOrSignIn;
