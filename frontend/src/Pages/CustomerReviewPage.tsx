import React from 'react';
import {Container, Box, Typography, Card, CardContent, Avatar, Button, TextField} from '@mui/material';
import Rating from '@mui/material/Rating';
import {appointments, bobBikerAppointment} from '../models/Appointment';
import AppointmentCard from '../components/AppointmentCard';
import { useParams } from 'react-router-dom';

const ReviewPage: React.FC = () => {
    const { jobId } = useParams();
    const [rating, setRating] = React.useState<number | null>(0);

    const handleRatingChange = (event: React.SyntheticEvent, newValue: number | null) => {
        setRating(newValue);
    };

    return (
        <Container>
            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 4}}>
                {/* Left Section: Appointments */}
                <Box sx={{width: '30%', mr: 30}}>
                    <Typography variant="h5" gutterBottom>
                        Upcoming appointments
                    </Typography>
                    {appointments.map((appointment, index) => (
                        <AppointmentCard key={index} {...appointment} />
                    ))}
                    <Typography variant="h5" gutterBottom>
                        Past appointments
                    </Typography>
                    {appointments.map((appointment, index) => (
                        <AppointmentCard key={index} {...appointment} />
                    ))}
                </Box>

                {/* Right Section: Review Form */}
                <Box sx={{width: '65%'}}>
                    <Typography variant="h5" gutterBottom>
                        Happy with the service? Then give <span
                        style={{fontWeight: 'bold'}}>{bobBikerAppointment?.user.firstName}</span> a rating!
                    </Typography>
                    <Card>
                        <CardContent sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <Avatar
                                sx={{
                                    width: 56,
                                    height: 56,
                                    mr: 2
                                }}
                                src={bobBikerAppointment?.user.profileImageUrl}
                            />
                            <Box>
                                <Typography
                                    variant="h6">{bobBikerAppointment?.user.firstName} {bobBikerAppointment?.user.lastName}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bobBikerAppointment?.service}, {new Date(bobBikerAppointment?.date).toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Booking ref #: {bobBikerAppointment?.bookingRef}
                                </Typography>
                            </Box>
                        </CardContent>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Rating
                            </Typography>
                            <Rating
                                name="service-rating"
                                value={rating}
                                onChange={handleRatingChange}
                                size="large"
                            />
                            <Typography variant="h6" gutterBottom sx={{mt: 2}}>
                                Review (optional)
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                            />
                        </CardContent>
                        <CardContent>
                            <Button variant="contained" color="primary">
                                Submit
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Container>
    );
};

export default ReviewPage;