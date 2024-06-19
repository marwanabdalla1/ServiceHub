import React, {useState} from 'react';
import { Container, Box, Typography, Card, CardContent, TextField, Button } from '@mui/material';
import { useBooking, BookingDetails } from '../../contexts/BookingContext';
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {RequestStatus} from "../../models/enums";



interface ReviewAndConfirmProps {
    onComplete: () => void;
    onBack: () => void;
    bookingDetails: BookingDetails;
}

function ReviewAndConfirm({ onComplete, onBack , bookingDetails}: ReviewAndConfirmProps) {
    // const { bookingDetails } = useBooking();
    const navigate = useNavigate();
    const [comment, setComment] = useState('');


    // Handle changes in the TextField
    const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setComment(event.target.value);
    };

    const handleConfirmBooking = async() => {

        const apiEndpoint = '/api/requests/new-service-request'


        const requestData = {
            requestStatus: RequestStatus.pending, // Set default or transformed values
            serviceType: bookingDetails.serviceType,
            appointmentStartTime: Date.now(), //todo: update the actual time
            appointmentEndTime: Date.now(),
            // uploads: [], //bookingDetails.uploads? || [],
            comment: comment || " ",
            serviceFee: bookingDetails.price, // Assuming the frontend uses 'fee' and backend expects 'serviceFee'
            serviceOffering: bookingDetails.serviceOffering?._id, // Adjust field names as needed
            job: undefined,
            provider: bookingDetails.provider?._id,
            // requestedBy: bookingDetails.requestedBy?._id,
            requestedBy: "666eda4dda888fe359668b63",
            // rating:  0, // Set default if not provided //no rating for the request, only for jobs
            profileImageUrl: "URL placeholder "
        };

        console.log((bookingDetails))
        console.log(requestData)


        // post this
        try {
            const response = await axios.post(apiEndpoint, requestData);
            console.log('Booking confirmed:', response.data);
        } catch(error: any) {
                console.error('Error confirming booking:', error);
                // Error handling
            }

        // example from the signup page
        // const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        //         event.preventDefault();
        //         const data = new FormData(event.currentTarget);
        //
        //         // Prepare the user data
        //         const account = {
        //             firstName: data.get('firstName'),
        //             lastName: data.get('lastName'),
        //             email: data.get('email'),
        //             password: data.get('password'),
        //         };
        //
        //         try {
        //             // Make a POST request to the /signup endpoint
        //             const response = await axios.post('/api/auth/signup', account);
        //             // Log the status and status text of the response
        //             console.log(`Status: ${response.status}`);
        //             console.log(`Status Text: ${response.statusText}`);
        //
        //             console.log(response.data);
        //         } catch (error) {
        //             // Handle the error here. For example, you might display an error message to the user
        //             console.error('Error creating user:', error);
        //         }
        //     };

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
                                <strong>Service:</strong> {bookingDetails.serviceOffering?.serviceType}
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
                                value={comment}
                                onChange={handleCommentChange}
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
                                <Typography variant="h6">{`${bookingDetails.provider?.firstName} ${bookingDetails.provider?.lastName}`}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.location}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.startTime ? bookingDetails.startTime.toLocaleString() : 'No date set'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.serviceOffering?.serviceType}
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
