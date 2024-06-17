import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Card, CardContent, TextField, Button, Grid } from '@mui/material';
import { useBooking } from '../../contexts/BookingContext';


interface UpdateProfileProps {
    onNext: () => void;
    onBack: () => void;
}

function UpdateProfile({ onNext, onBack }: UpdateProfileProps) {
    const { bookingDetails } = useBooking();
    const navigate = useNavigate();

    const handleSaveProfile = () => {
        // Handle save profile logic
        navigate('/review-and-confirm');
    };

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Box sx={{ width: '60%' }}>
                    <Typography variant="h6" gutterBottom>
                        Step 3 of 3
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Please update your profile
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button variant="outlined" onClick={onBack}>Back</Button>
                        <Button variant="contained" onClick={onNext}>Next</Button>
                    </Box>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                BASIC INFO
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField label="First Name" fullWidth variant="outlined" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Last Name" fullWidth variant="outlined" />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField label="Address" fullWidth variant="outlined" />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField label="Postal" fullWidth variant="outlined" />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField label="City" fullWidth variant="outlined" />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField label="Country" fullWidth variant="outlined" />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField label="Email" fullWidth variant="outlined" />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField label="Phone Number" fullWidth variant="outlined" />
                                </Grid>
                            </Grid>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button variant="contained" sx={{ mr: 2 }} onClick={handleSaveProfile}>
                                    Save
                                </Button>
                                <Button variant="outlined">Cancel</Button>
                            </Box>
                        </CardContent>
                    </Card>
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

export default UpdateProfile;
