import React, {useEffect, useState} from 'react';
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Alert,
    AlertColor,
    AlertTitle, LinearProgress
} from '@mui/material';
import {useBooking, BookingDetails} from '../../contexts/BookingContext';
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {RequestStatus} from "../../models/enums";
import {useAuth} from "../../contexts/AuthContext";
import {Timeslot} from "../../models/Timeslot";


interface ReviewAndConfirmProps {
    onComplete: () => void;
    onBack: () => void;
    bookingDetails: BookingDetails;
}

function ReviewAndConfirm({onComplete, onBack, bookingDetails}: ReviewAndConfirmProps) {
    // const { bookingDetails } = useBooking();
    const navigate = useNavigate();
    const [comment, setComment] = useState('');

    // alert
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState<AlertColor>('success');
    const [showAlert, setShowAlert] = useState(false);
    const [countdown, setCountdown] = useState(5); // Countdown timer in seconds


    const {token} = useAuth();
    const [requestId, setRequestId] = useState('');


    // Handle changes in the TextField
    const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setComment(event.target.value);
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showAlert && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prevCountdown) => {
                    if (prevCountdown <= 0.1) {
                        handleAlertClose();
                        return 0;
                    }
                    return prevCountdown - 0.1;
                });
            }, 100);
        } else if (countdown <= 0) {
            handleAlertClose();
        }
        return () => clearInterval(timer);
    }, [showAlert, countdown]);
    // const bookTimeSlot = (timeSlot: any) => {
    //     axios.post('/api/timeslots/book', timeSlot, {
    //         headers: {
    //             'Authorization': `Bearer ${token}`
    //         }
    //     }).then(response => {
    //         // Update local state with new timeslots after booking
    //         console.log("timeslot booked successfully", response.data)
    //         // fetchAvailability();
    //     }).catch(error => {
    //         console.error("Error booking timeslot:", error);
    //     });
    // };


    const checkTimeslotAvailability = async (start: Date, end: Date, createdById: string) => {
        return axios.get(`/api/timeslots/check-availability`, {
            params: {start, end, createdById},
            headers: {'Authorization': `Bearer ${token}`}
        });
    };


    class BookingError extends Error {
        code: number;

        constructor(message: string, code: number) {
            super(message);
            this.name = "BookingError";
            this.code = code; // Custom property to store specific error codes
        }
    }

    const bookTimeSlot = (timeSlot: any): Promise<any> => {
        return new Promise((resolve, reject) => {
            console.log("bookTimeSlot:", timeSlot)
            axios.post('/api/timeslots/book', timeSlot, {
                headers: {'Authorization': `Bearer ${token}`}
            })
                .then(response => {
                    console.log("timeslot booked successfully", response.data);
                    resolve(response.data);  // Resolve the promise with the response data
                })
                .catch(error => {
                    console.error("Error booking timeslot:", error);
                    if (error.response) {
                        // Check specific status codes or error messages
                        if (error.response.status === 409) { // Assuming 409 means conflict, e.g., timeslot not available
                            reject(new BookingError("Timeslot is no longer available", 409));
                        } else {
                            reject(new BookingError("An error occurred while booking the timeslot", error.response.status));
                        }
                    } else {
                        reject(new Error("Network or other error"));
                    }
                });
        });
    };


    // const bookTimeSlot = (timeSlot: any): Promise<any> => {
    //     return new Promise((resolve, reject) => {
    //         axios.post('/api/timeslots/book', timeSlot, {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`
    //             }
    //         })
    //             .then(response => {
    //                 console.log("timeslot booked successfully", response.data);
    //                 resolve(response.data);  // Resolve the promise with the response data
    //             })
    //             .catch(error => {
    //                 console.error("Error booking timeslot:", error);
    //                 reject(error);  // Reject the promise if there's an error
    //             });
    //     });
    // };

    const handleConfirmBooking = async () => {

        const apiEndpoint = '/api/requests'


        const requestData = {
            requestStatus: RequestStatus.pending, // Set default or transformed values
            serviceType: bookingDetails.serviceType,
            timeSlot: bookingDetails.timeSlot, //this includes transit time
            appointmentStartTime: bookingDetails.timeSlot?.start,
            appointmentEndTime: bookingDetails.timeSlot?.end,
            // uploads: [], //bookingDetails.uploads? || [],
            comment: comment || " ",
            serviceFee: bookingDetails.price, // Assuming the frontend uses 'fee' and backend expects 'serviceFee'
            serviceOffering: bookingDetails.serviceOffering?._id, // Adjust field names as needed
            job: undefined,
            provider: bookingDetails.provider?._id,
            requestedBy: bookingDetails.requestedBy?._id,
            // requestedBy: "666eda4dda888fe359668b63",
            // rating:  0, // Set default if not provided //no rating for the request, only for jobs
            profileImageUrl: "URL placeholder "
        };

        console.log((bookingDetails))
        console.log(requestData)


        try {
            // step 1: post the request
            const response = await axios.post(apiEndpoint, requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const requestId = response.data._id;
            setRequestId(requestId);
            console.log('Booking confirmed:', response.data);

            const timeSlotWithRequest = {
                ...bookingDetails.timeSlot,
                // title: bookingDetails.timeSlot?.title,
                requestId: requestId,
            };

            // try {
            // step 2: post the timeslot into timeslot table
            const timeslotResponse = await bookTimeSlot(timeSlotWithRequest);
            console.log("Timeslot booked successfully", timeslotResponse);

            // step 3: update the request -> not needed anymore because we dont save timeslot in request!
            // try {
            //     const updatedRequestData = { timeslot: timeslotResponse._id };
            //     await axios.patch(`/api/requests/${requestId}`, updatedRequestData, {
            //         headers: {
            //             'Authorization': `Bearer ${token}`
            //         }
            //     });
            //     console.log('Request updated with timeslot ID:', timeslotResponse._id);
            // } catch (error) {
            //     console.error('Error updating request with timeslot ID:', error);
            //     // Handle the error (e.g., log it, show a message, etc.)
            //     // This error does not affect the overall booking confirmation
            // }


            // navigate('/confirmation'); // Navigate to a confirmation page or show a confirmation message
            navigate(`/offerings/${requestId}/confirm`); // Navigate to a confirmation page or show a confirmation message

            //     if booking timeslot fails, then roll back the request
        } catch (error: any) {
            console.error('Error confirming booking:', error);

            if (error instanceof BookingError && error.code === 409) {
                // await axios.delete(`/api/requests/${requestId}`, {
                //     headers: {'Authorization': `Bearer ${token}`}
                // });
                // console.error('Rolled back the created request due to timeslot booking failure.');
                // alert('Unfortunately, the selected timeslot is no longer available. Please select another time.');

                setAlertMessage('Unfortunately, the selected timeslot is no longer available. Please select another time.');
                setAlertSeverity('error');
                setShowAlert(true);
                setCountdown(5);
            } else {
                // alert('An error occurred while confirming your booking. Please try again.');

                setAlertMessage('An error occurred while confirming your booking. Please try again.');
                setAlertSeverity('error');
                setShowAlert(true);

                setCountdown(5);
            }
            // Error handling
        }


        // } catch (error) {
        //     console.error('Error confirming booking:', error);
        //     alert('Failed to confirm booking. Please retry.'); // General error handling
        //     navigate(`/offerings/${bookingDetails.serviceOffering?._id}`);
        // }


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
    };

    // Handle booking confirmation logic
    const handleAlertClose = () => {
        setShowAlert(false);
        navigate(`/offerings/${bookingDetails.serviceOffering?._id}`); // Redirect after closing the alert
    };

    const getButtonColor = (severity: AlertColor) => {
        switch (severity) {
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
            case 'info':
                return 'info';
            case 'success':
                return 'success';
            default:
                return 'primary';
        }
    };

    return (
        <Container>
            {showAlert && (
                <Box sx={{position: 'relative', mb: 2, maxWidth: '500px', margin: 'auto'}}>
                    <LinearProgress variant="determinate" value={(countdown / 5) * 100}
                                    color={getButtonColor(alertSeverity)}
                                    sx={{position: 'absolute', top: 0, left: 0, right: 0}}/>

                    <Alert severity={alertSeverity}>
                        <AlertTitle>Error</AlertTitle>
                        {alertMessage}
                        <Box mt={2} display="flex" justifyContent="flex-end">
                            <Button onClick={handleAlertClose} variant="contained"
                                    color={getButtonColor(alertSeverity)}
                                    sx={{ml: 2}}>
                                OK
                            </Button>
                        </Box>
                    </Alert>
                </Box>
            )}
            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 4}}>
                <Box sx={{width: '60%'}}>
                    <Typography variant="h6" gutterBottom>
                        Step 4 of 4
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Review and confirm booking
                    </Typography>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2}}>
                        <Button variant="outlined" onClick={onBack}>Back</Button>
                    </Box>
                    <Card sx={{mb: 2}}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Booking Details
                            </Typography>
                            <Typography variant="body1">
                                <strong>Name:</strong> {bookingDetails.provider?.lastName}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Location:</strong> {bookingDetails.serviceOffering?.location}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Service:</strong> {bookingDetails.serviceType}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Date:</strong> {bookingDetails.timeSlot?.start ? bookingDetails.timeSlot?.start.toLocaleString() : 'No date set'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Price:</strong> {bookingDetails.price}
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{mb: 2}}>
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
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
                        <Button variant="contained" color="primary" onClick={handleConfirmBooking}>
                            Confirm Booking
                        </Button>
                    </Box>
                </Box>
                <Box sx={{width: 250}}>
                    <Card>
                        <CardContent sx={{display: 'flex', alignItems: 'center'}}>
                            <Box>
                                <Typography
                                    variant="h6">{`${bookingDetails.provider?.firstName} ${bookingDetails.provider?.lastName}`}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.location}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.timeSlot?.start ? bookingDetails.timeSlot?.start.toLocaleString() : 'No date set'}
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
