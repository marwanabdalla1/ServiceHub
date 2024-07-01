import React, {useEffect} from 'react';
import {Container, Box, Typography, Card, CardContent, Avatar, Button, TextField, Link as MuiLink} from '@mui/material';
import Rating from '@mui/material/Rating';
import {appointments, bobBikerAppointment} from '../models/Appointment';
import AppointmentCard from '../components/AppointmentCard';
import { useParams } from 'react-router-dom';
import {Job} from "../models/Job";
import {useAuth} from "../contexts/AuthContext";
import {useLocation, useNavigate} from "react-router-dom";
import axios from "axios";
import {Review} from "../models/Review";
import { Account } from '../models/Account';

const ReviewPage: React.FC = () => {
    const [review, setReview] = React.useState<Review|null>(null); // Holds the existing review data
    const [job, setJob] = React.useState<Job|null>(null);
    const [reviewee, setReviewee] = React.useState<Account|null>(null);
    const [newReview, setNewReview] = React.useState<Review|null>(null);
    const [rating, setRating] = React.useState<number | null>(0);
    const [reviewText, setReviewText] = React.useState(''); // State to hold the review text
    const [isEditing, setIsEditing] = React.useState(false);  // Tracks if we are editing an existing review
    const navigate = useNavigate();

    const {token, account} = useAuth();

    const { jobId } = useParams();

    

    useEffect(() => {
        // This useEffect will always run, but the internal logic runs only under certain conditions.
        if (jobId && !review) {  // Condition to perform fetching
            console.log("Fetching job: ", jobId);
            const fetchJob = async() => {
                try {
                    const response = await axios.get(`/api/jobs/${jobId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log(response.data);
                    setJob(response.data);
                    let revieweeId;
                    console.log("Provider: ", job?.provider);
                    console.log("Receiver: ", job?.receiver);
                    if(account?._id === job?.provider){
                        revieweeId = job?.receiver;
                    } else if(account?._id === job?.receiver) {
                        revieweeId = job?.provider;
                    } else {
                        console.error("Current user should not have access to this review!");
                        revieweeId = "";
                    }

                    const getReviewee =  await axios.get(`/api/account/${revieweeId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setReviewee(getReviewee.data);
                } catch (error) {
                    console.error('Error fetching Job:', error);
                }
            }; 
            fetchJob();
            console.log("Fetched job: ", job?._id);
            console.log("Fetching review for job:", jobId);
            const fetchReview = async () => {
                try {
                    const response = await axios.get(`/api/reviews/by-jobs/${jobId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data.success) {
                        setReview(response.data.review);
                        setRating(response.data.review.rating);
                        setReviewText(response.data.review.content);
                    } else {
                        // Handle case where no review is returned
                        console.log("No review found, possible first-time review setup.");
                        try {
                            const response = await axios.get(`/api/jobs/${jobId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                        setJob(response.data);
                        const newReview = {
                            rating: 0,
                            content: "",
                            createdOn: new Date(),
                            recipient: response.data.provider, 
                            reviewer: response.data.receiver,
                            service: response.data.serviceType
                            };
                           
                        } catch (error) {
                            console.error('Error fetching review:', error);
                        }



                    }
                } catch (error) {
                    console.error('Error fetching review:', error);
                }
            };
            fetchReview();
        } else {
            console.log("ELSE CONDIITON MET!!!")

        }
    }, [jobId, review, token]); // Ensure dependencies are correctly listed for reactivity


    if (!jobId) {
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

        // check if this is posting a new review or updating
        const method = review ? 'patch' : 'post';
        const url = review ? `/api/reviews/${review._id}` : '/api/reviews';


        const reviewData = {
            jobId: jobId,
            rating: rating,
            content: reviewText,
            serviceOffering: job?.serviceOffering,
            reviewer: account?._id,
            recipient: job?.provider, //todo: also make it possible for provider to review
        };

        console.log(reviewData)

        // POST request to your backend
        try {
            await axios[method](url, reviewData, {
                headers: {Authorization: `Bearer ${token}`}
            });
            alert(`Review ${review ? 'updated' : 'submitted'} successfully!`);
            navigate('/jobs/offeredServices');
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Failed to submit review.');
        }
    };

    const handleEdit = () => {
        setIsEditing(true);  // Set editing to true to render the editable form
    };


    const handleDelete = async () => {
        try {
            await axios.delete(`/api/reviews/${review?._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Review deleted successfully!');
            navigate('/jobs/offeredServices');  // Redirect or update local state
        } catch (error) {
            console.error('Failed to delete review:', error);
            alert('Failed to delete review.');
        }
    };

    return (
        
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Box sx={{ width: '65%' }}>
                    <CardContent sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                        <Avatar
                            sx={{
                                width: 56,
                                height: 56,
                                mr: 2
                            }}

                            /*todo: also need to include their profile when GET (in controller)*/
                            // src={job?.provider.profileImageUrl}
                        />
                        <Box>
                            <Typography
                                variant="h6">{reviewee?.firstName} {reviewee?.lastName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {job?.serviceType}, {new Date(job ? job.appointmentStartTime: new Date()).toLocaleString()}
                            </Typography>
                        </Box>
                    </CardContent>
                    {review && !isEditing ? (
                        <>
                            <Typography variant="h5" gutterBottom>
                                Review for {reviewee?.firstName}
                            </Typography>
                            <Card>
                                <CardContent>
                                    <Typography variant="body1">{reviewText}</Typography>
                                    <Rating name="read-only" value={rating} readOnly />
                                </CardContent>
                                <CardContent>
                                    <Button onClick={handleEdit} variant="outlined" color="primary">
                                        Edit
                                    </Button>
                                    <Button onClick={handleDelete} variant="outlined" color="secondary">
                                        Delete
                                    </Button>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <>
                            <Typography variant="h5" gutterBottom>
                                {review ? 'Edit your review' : 'Write a review'} for {reviewee?.firstName}
                            </Typography>
                            <Card>

                                <CardContent>
                                    <Rating
                                        name="service-rating"
                                        value={rating}
                                        onChange={(event, newValue) => setRating(newValue)}
                                        size="large"
                                    />
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        variant="outlined"
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                    />
                                </CardContent>
                                <CardContent>
                                    <Button onClick={handleSubmit} variant="contained" color="primary">
                                        {review ? 'Update Review' : 'Submit Review'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </>
                    )}
                    
                    {/*todo: replace with actual email*/}
                    <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                        Something wrong? <MuiLink href="mailto:support@example.com" underline="hover">
                        Contact us
                    </MuiLink>
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default ReviewPage;