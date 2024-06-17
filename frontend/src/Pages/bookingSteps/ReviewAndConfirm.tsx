import React from 'react';
import { Container, Box, Typography, Card, CardContent, TextField, Button } from '@mui/material';
import { useBooking } from '../../contexts/BookingContext';
import {useNavigate} from "react-router-dom";



interface ReviewAndConfirmProps {
    onComplete: () => void;
    onBack: () => void;
}

function ReviewAndConfirm({ onComplete, onBack }: ReviewAndConfirmProps) {
    const { bookingDetails } = useBooking();
    const navigate = useNavigate();

    const handleConfirmBooking = () => {
        // Handle booking confirmation logic
        navigate('/confirmation'); // Navigate to a confirmation page or show a confirmation message
    };

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Box sx={{ width: '60%' }}>
                    <Typography variant="h6" gutterBottom>
                        Step 4 of 4
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Review and confirm booking
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button variant="outlined" onClick={onBack}>Back</Button>
                    </Box>
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Booking Details
                            </Typography>
                            <Typography variant="body1">
                                <strong>Name:</strong> {bookingDetails.provider?.lastName}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Location:</strong> {bookingDetails.location}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Service:</strong> {bookingDetails.service}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Date:</strong> {bookingDetails.startTime ? bookingDetails.startTime.toLocaleString() : 'No date set'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Price:</strong> {bookingDetails.price}
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Add Booking Notes
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                placeholder="Include comments or requests about your booking"
                            />
                        </CardContent>
                    </Card>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button variant="contained" color="primary" onClick={handleConfirmBooking}>
                            Confirm Booking
                        </Button>
                    </Box>
                </Box>
                <Box sx={{ width: 250 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6">{bookingDetails.provider?.lastName}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.location}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.startTime ? bookingDetails.startTime.toLocaleString() : 'No date set'}
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

export default ReviewAndConfirm;
