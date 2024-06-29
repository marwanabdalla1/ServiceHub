import React, {useEffect} from 'react';
import {Container, Box, Typography, Card, CardContent, Avatar, Button, TextField, Link as MuiLink} from '@mui/material';
import Rating from '@mui/material/Rating';
import {appointments, bobBikerAppointment} from '../models/Appointment';
import AppointmentCard from '../components/AppointmentCard';
import {Job} from "../models/Job";
import {useAuth} from "../contexts/AuthContext";
import {useLocation, useNavigate} from "react-router-dom";
import axios from "axios";
import {Review} from "../models/Review";

const ReviewPage: React.FC = () => {
    const [review, setReview] = React.useState<Review|null>(null); // Holds the existing review data
    const [rating, setRating] = React.useState<number | null>(0);
    const [reviewText, setReviewText] = React.useState(''); // State to hold the review text
    const [isEditing, setIsEditing] = React.useState(false);  // Tracks if we are editing an existing review
    const navigate = useNavigate();

    const {token, account} = useAuth();

    const location = useLocation();
    const job = location.state?.job;



    useEffect(() => {
        console.log("customer review page")
        // This useEffect will always run, but the internal logic runs only under certain conditions.
        if (job && !review) {  // Condition to perform fetching
            console.log("Fetching review for job:", job._id);
            const fetchReview = async () => {
                try {
                    const response = await axios.get(`/api/reviews/by-jobs/${job._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data.success) {
                        setReview(response.data.review);
                        setRating(response.data.review.rating);
                        setReviewText(response.data.review.content);
                    } else {
                        // Handle case where no review is returned
                        console.log("No review found, possible first-time review setup.");
                    }
                } catch (error) {
                    console.error('Error fetching review:', error);
                }
            };
            fetchReview();
        }
    }, [job, review, token]); // Ensure dependencies are correctly listed for reactivity


    if (!job) {
        return <Typography variant="h6">No job selected for review.</Typography>;
    }

    // useEffect(() => {
    //     if (job && !review) {
    //         console.log("job and no review!")
    //
    //         const fetchReview = async () => {
    //             try {
    //                 const response = await axios.get(`/api/reviews/by-jobs/${job._id}`, {
    //                     headers: { Authorization: `Bearer ${token}` }
    //                 });
    //                 console.log("response for review: ", response)
    //                 if (response.data.success) {
    //                     setReview(response.data.review);
    //                     setRating(response.data.review.ratingForProvider);
    //                     setReviewText(response.data.review.content);
    //                 }
    //             } catch (error) {
    //                 console.error('Error fetching review:', error);
    //             }
    //         };
    //         fetchReview();
    //     } else{}
    // }, [token]);


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
            await axios[method](url, reviewData, {
                headers: {Authorization: `Bearer ${token}`}
            });
            alert(`Review ${review ? 'updated' : 'submitted'} successfully!`);
            navigate('/jobs/jobHistory');
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
            navigate('/jobs/jobhistory');  // Redirect or update local state
        } catch (error) {
            console.error('Failed to delete review:', error);
            alert('Failed to delete review.');
        }
    };

    return (
        // <Container>
        //     <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 4}}>
        //         {/* Left Section: Appointments */}
        //         {/*<Box sx={{width: '30%', mr: 30}}>*/}
        //         {/*    <Typography variant="h5" gutterBottom>*/}
        //         {/*        Upcoming appointments*/}
        //         {/*    </Typography>*/}
        //         {/*    {appointments.map((appointment, index) => (*/}
        //         {/*        <AppointmentCard key={index} {...appointment} />*/}
        //         {/*    ))}*/}
        //         {/*    <Typography variant="h5" gutterBottom>*/}
        //         {/*        Past appointments*/}
        //         {/*    </Typography>*/}
        //         {/*    {appointments.map((appointment, index) => (*/}
        //         {/*        <AppointmentCard key={index} {...appointment} />*/}
        //         {/*    ))}*/}
        //         {/*</Box>*/}
        //
        //         {/* Right Section: Review Form */}
        //         <Box sx={{width: '65%'}}>
        //             <Typography variant="h5" gutterBottom>
        //                 Happy with the service? Then give <span
        //                 style={{fontWeight: 'bold'}}>{job?.provider.firstName}</span> a rating!
        //             </Typography>
        //             <Card>
        //                 <CardContent sx={{display: 'flex', alignItems: 'center', mb: 2}}>
        //                     <Avatar
        //                         sx={{
        //                             width: 56,
        //                             height: 56,
        //                             mr: 2
        //                         }}
        //
        //                         src={job?.provider.profileImageUrl}
        //                     />
        //                     <Box>
        //                         <Typography
        //                             variant="h6">{job?.provider.firstName} {job?.provider.lastName}</Typography>
        //                         <Typography variant="body2" color="text.secondary">
        //                             {job?.serviceType}, {new Date(job?.appointmentStartTime).toLocaleString()}
        //                         </Typography>
        //                         <Typography variant="body2" color="text.secondary">
        //                             Job ID: {job?._id}
        //                         </Typography>
        //                     </Box>
        //                 </CardContent>
        //                 <CardContent>
        //                     <Typography variant="h6" gutterBottom>
        //                         Rating
        //                     </Typography>
        //                     <Rating
        //                         name="service-rating"
        //                         value={rating}
        //                         onChange={handleRatingChange}
        //                         size="large"
        //                     />
        //                     <Typography variant="h6" gutterBottom sx={{mt: 2}}>
        //                         Review (optional)
        //                     </Typography>
        //                     <TextField
        //                         fullWidth
        //                         multiline
        //                         rows={4}
        //                         variant="outlined"
        //                     />
        //                 </CardContent>
        //                 <CardContent>
        //                     <Button variant="contained" color="primary" onClick={handleSubmit}>
        //                         Submit
        //                     </Button>
        //                 </CardContent>
        //             </Card>
        //         </Box>
        //     </Box>
        // </Container>



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
                                variant="h6">{job?.provider.firstName} {job?.provider.lastName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {job?.serviceType}, {new Date(job?.appointmentStartTime).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Job ID: {job?._id}
                            </Typography>
                        </Box>
                    </CardContent>
                    {review && !isEditing ? (
                        <>
                            <Typography variant="h5" gutterBottom>
                                Review for {job?.provider.firstName}
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
                                {review ? 'Edit your review' : 'Write a review'} for {job?.provider.firstName}
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