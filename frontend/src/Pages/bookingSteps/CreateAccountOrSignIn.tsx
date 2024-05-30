import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Card, CardContent } from '@mui/material';
import { useBooking } from '../../context/BookingContext';

function CreateAccountOrSignIn() {
    const { bookingDetails } = useBooking();
    const navigate = useNavigate();
    const isAuthenticated = false; // Replace this with your actual authentication logic

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
                        Step 2 of 3
                    </Typography>
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
                                <Typography variant="h6">{bookingDetails.name}</Typography>
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
