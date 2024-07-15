import React, {useEffect} from 'react';
import {Card, CardContent, Typography, Button, Rating, Avatar, TextField, Box} from '@mui/material';
import {Review} from '../models/Review';
import {Account} from "../models/Account";
import axios from "axios";
import {useAuth} from "../contexts/AuthContext";
import useAlert from "../hooks/useAlert";
import {Job} from "../models/Job";
import {defaultProfileImage, fetchProfileImageById} from "../services/fetchProfileImage";
import {formatDateTime} from "../utils/dateUtils";
import AlertCustomized from "./AlertCustomized";

interface ReviewCardProps {
    review?: Review;
    job: Job;
    reviewer: Account | null;
    recipient: Account | null;
    onReviewUpdated: () => void; // Callback to refresh reviews on the job details page
    setEdit?: boolean
}

const ReviewCard: React.FC<ReviewCardProps> = ({
                                                   review,
                                                   job,
                                                   reviewer,
                                                   recipient,
                                                   onReviewUpdated,
                                                   setEdit
                                               }) => {
    const [rating, setRating] = React.useState<number | null>(review?.rating || 0);
    const [reviewText, setReviewText] = React.useState(review?.content || '');
    const [isEditing, setIsEditing] = React.useState(setEdit || false);  // Tracks if we are editing an existing review
    const {token, account} = useAuth();
    const {alert, triggerAlert, closeAlert} = useAlert(5000);
    const [profileImage, setProfileImage] = React.useState<string | null>(null);


    // fetch profile image
    useEffect(() => {
        if (reviewer) {
            fetchProfileImageById(reviewer._id).then((image) => {
                setProfileImage(image);
            });
        }
    }, [reviewer]);


    const isReviewer = account && account?._id.toString() === reviewer?._id.toString();

    const handleSubmit = async () => {
        console.log("review data: ", review)

        if (!token) {
            triggerAlert('Error', 'You are not logged in.', 'error');
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
            recipient: recipient?._id,
        };

        console.log("review data", reviewData)

        // POST/patch
        try {
            await axios[method](url, reviewData, {
                headers: {Authorization: `Bearer ${token}`}
            });
            const reviewString = (`Review ${review ? 'updated' : 'submitted'} successfully!`);
            triggerAlert(reviewString, '', 'success', 3000, 'dialog', 'center', window.location.pathname.toString())

            setIsEditing(false);
            // setTimeout(() => {
            //     window.location.reload();
            // }, 3100); // Delay reloading
        } catch (error) {
            console.error('Failed to submit review:', error);
            triggerAlert('Failed to submit review.', 'An error occured. Please try again later', 'error', 5000, 'dialog', 'center', `/customer-review/${job._id}`);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);  // Set editing to true to render the editable form
    };

    const handleCancel = () => {
        setIsEditing(false);
        console.log("location:", window.location)
        if (!review) {
        //
            onReviewUpdated()
        }
    };

    const handleDelete = async () => {
        if (!review?._id) return;
        try {
            await axios.delete(`/api/reviews/${review?._id}`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            triggerAlert('Review deleted successfully!', '', 'success', 3000, 'dialog', 'center', window.location.pathname.toString());

            setTimeout(() => {
                window.location.reload();
            }, 3100); // Delay reloading to allow alert to display
            // alert('Review deleted successfully!');
            // navigate('/jobs/offeredServices');  // Redirect or update local state
        } catch (error) {
            console.error('Failed to delete review:', error);
            // alert('Failed to delete review.');
            triggerAlert('Failed to delete review.', 'Please try again later', 'error', 5000);

        } finally{
            window.location.reload()

        }
    };


    return (
        <Card sx={{display: 'flex-start', ml: 2, border: '1px solid', borderColor: 'grey.300'}}>
            <div>
                {/*<button onClick={handleAction}>Do Something</button>*/}
                <AlertCustomized alert={alert} closeAlert={closeAlert}/>
            </div>

            {isReviewer && isEditing ? (
                <>
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
                        <Button onClick={handleSubmit} variant="contained" color="primary" sx={{mr: 2}}>
                            {review ? 'Update Review' : 'Submit Review'}
                        </Button>
                        <Button onClick={handleCancel} variant="outlined" color="primary">Cancel</Button>
                    </CardContent>
                </>
            ) : (
                <>
                    <CardContent>
                        <CardContent sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <Avatar
                                sx={{
                                    width: 56,
                                    height: 56,
                                    mr: 2
                                }}

                                /*todo: also need to include their profile when GET (in controller)*/
                                src={profileImage ? profileImage || undefined : defaultProfileImage}
                            />
                            <Box>
                                <Typography
                                    variant="h6">{reviewer?.firstName} {reviewer?.lastName}</Typography>
                                {/*<Typography variant="body2" color="text.secondary">*/}
                                {/*    {job?.serviceType}, {formatDateTime(job?.timeslot?.start || new Date()) || formatDateTime(new Date())}*/}
                                {/*</Typography>*/}
                                <Typography variant="body2" color="text.secondary">
                                    Reviewed on {formatDateTime(review?.updatedAt)}
                                </Typography>
                            </Box>
                        </CardContent>

                        <Rating name="read-only" value={review?.rating} readOnly/>
                        <Typography variant="body1">{review?.content}</Typography>
                    </CardContent>
                    {isReviewer && (
                        <CardContent>
                            <Button onClick={handleEdit} variant="outlined" color="primary" sx={{mr: 3}}>
                                Edit
                            </Button>
                            <Button onClick={handleDelete} variant="outlined" color="secondary">
                                Delete
                            </Button>
                        </CardContent>
                    )}
                </>
            )}
        </Card>
    );
};

export default ReviewCard;
