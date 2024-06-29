import React, {useEffect} from 'react';
import {Container, Box, Typography, Card, CardContent, Avatar, Button, TextField} from '@mui/material';
import Rating from '@mui/material/Rating';
import {appointments, bobBikerAppointment} from '../models/Appointment';
import AppointmentCard from '../components/AppointmentCard';
import {Job} from "../models/Job";
import {useAuth} from "../contexts/AuthContext";
import {useLocation} from "react-router-dom";
import axios from "axios";

const ReviewPage: React.FC = () => {
    const [rating, setRating] = React.useState<number | null>(0);
    const [reviewText, setReviewText] = React.useState(''); // State to hold the review text

    const {token, account} = useAuth();

    const location = useLocation();
    const job = location.state?.job;

    console.log(job)


    if (!job) {
        return <Typography variant="h6">No job selected for review.</Typography>;
    }

    const handleRatingChange = (event: React.SyntheticEvent, newValue: number | null) => {
        setRating(newValue);
    };

    const handleReviewTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setReviewText(event.target.value);
    };

    const handleSubmit = async () => {

        if (!token) {
            alert('You are not logged in.');
            return;
        }

        const reviewData = {
            jobId: job._id,
            rating: rating,
            content: reviewText,
            serviceOffering: job?.serviceOffering,
            reviewer: account?._id,
            recipient: job.provider._id, //todo: also make it possible for provider to review
        };

        console.log(reviewData)

        // POST request to your backend
        try {
            await axios.post('/api/reviews', reviewData, {
                headers: {Authorization: `Bearer ${token}`}
            });
            alert('Review submitted successfully!');
            // Redirect or update UI
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Failed to submit review.');
        }
    };

    return (
        <Container>
            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 4}}>
                {/* Left Section: Appointments */}
                {/*<Box sx={{width: '30%', mr: 30}}>*/}
                {/*    <Typography variant="h5" gutterBottom>*/}
                {/*        Upcoming appointments*/}
                {/*    </Typography>*/}
                {/*    {appointments.map((appointment, index) => (*/}
                {/*        <AppointmentCard key={index} {...appointment} />*/}
                {/*    ))}*/}
                {/*    <Typography variant="h5" gutterBottom>*/}
                {/*        Past appointments*/}
                {/*    </Typography>*/}
                {/*    {appointments.map((appointment, index) => (*/}
                {/*        <AppointmentCard key={index} {...appointment} />*/}
                {/*    ))}*/}
                {/*</Box>*/}

                {/* Right Section: Review Form */}
                <Box sx={{width: '65%'}}>
                    <Typography variant="h5" gutterBottom>
                        Happy with the service? Then give <span
                        style={{fontWeight: 'bold'}}>{job?.provider.firstName}</span> a rating!
                    </Typography>
                    <Card>
                        <CardContent sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <Avatar
                                sx={{
                                    width: 56,
                                    height: 56,
                                    mr: 2
                                }}

                                /*todo: also need to include their profile when GET (in controller)*/
                                src={job?.provider.profileImageUrl}
                            />
                            <Box>
                                <Typography
                                    variant="h6">{job?.provider.firstName} {job?.provider.lastName}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {job?.serviceType}, {new Date(job?.appointmentStartTime).toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Job ID #: {job?._id}
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
                            <Button variant="contained" color="primary" onClick={handleSubmit}>
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