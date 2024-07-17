import React, {useEffect, useState} from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Rating,
    Avatar,
    TextField,
    Box,
    Dialog,
    DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
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
    isEditing?: boolean;
    setIsEditing?: (value: boolean) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
                                                   review,
                                                   job,
                                                   reviewer,
                                                   recipient,
                                                   onReviewUpdated,
                                                   isEditing: externalIsEditing,
                                                   setIsEditing: externalSetIsEditing,
                                               }) => {
    const [rating, setRating] = React.useState<number | null>(review?.rating || 0);
    const [reviewText, setReviewText] = React.useState(review?.content || '');

    const [localIsEditing, localSetIsEditing] = useState(false);

    const isEditing = externalIsEditing !== undefined ? externalIsEditing : localIsEditing;
    const setIsEditing = externalSetIsEditing || localSetIsEditing;

    const {token, account} = useAuth();
    const {alert, triggerAlert, closeAlert} = useAlert(5000);
    const [profileImage, setProfileImage] = React.useState<string | null>(null);

    const [openDialog, setOpenDialog] = React.useState(false);

    // fetch profile image
    useEffect(() => {
        if (reviewer) {
            fetchProfileImageById(reviewer._id).then((image) => {
                setProfileImage(image);
            });
        }
    }, [reviewer]);

    const handleDialogOpen = () => {
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };


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
        setIsEditing(true);
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

            // alert('Review deleted successfully!');
            // navigate('/jobs/offeredServices');  // Redirect or update local state
        } catch (error) {
            console.error('Failed to delete review:', error);
            // alert('Failed to delete review.');
            triggerAlert('Failed to delete review.', 'Please try again later', 'error', 5000);

        } finally {
            handleDialogClose(); // Close the dialog
        }
    };


    return (
        <Card sx={{display: 'flex-start', ml: 2, border: '1px solid', borderColor: 'grey.300'}}>
            <div>
                {/*<button onClick={handleAction}>Do Something</button>*/}
                <AlertCustomized alert={alert} closeAlert={closeAlert}/>
            </div>

            <Dialog
                open={openDialog}
                onClose={handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this review? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="primary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

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
                            placeholder={"Optional review text"}
                            rows={4}
                            variant="outlined"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        />
                    </CardContent>
                    <CardContent>
                        <Button onClick={handleSubmit} disabled={rating === 0} variant="contained" color="primary"
                                sx={{mr: 2}}>
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
                            <Button onClick={handleDialogOpen} variant="outlined" color={"error"}>
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
