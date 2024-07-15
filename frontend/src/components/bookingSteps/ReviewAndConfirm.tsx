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
import axios, {AxiosError} from "axios";
import {RequestStatus, ServiceType} from "../../models/enums";
import {useAuth} from "../../contexts/AuthContext";
import {Timeslot} from "../../models/Timeslot";
import {bookTimeSlot, BookingError} from '../../services/timeslotService';
import useAlert from "../../hooks/useAlert";
import AlertCustomized from "../AlertCustomized";
import {formatDateTime} from "../../utils/dateUtils";
import * as mongoose from "mongoose";


interface ReviewAndConfirmProps {
    bookingDetails: BookingDetails;
    handleCancel: () => void;

}

function ReviewAndConfirm({bookingDetails, handleCancel}: ReviewAndConfirmProps) {
    // const { bookingDetails } = useBooking();
    const navigate = useNavigate();
    const [comment, setComment] = useState('');

    // alert
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState<AlertColor>('success');
    const [showAlert, setShowAlert] = useState(false);
    const [countdown, setCountdown] = useState(5); // Countdown timer in seconds
    const {triggerAlert, alert, closeAlert} = useAlert(3000);

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

    const sendEmailNotification = async (email: string,
                                         name: string,
                                         serviceType: ServiceType | undefined,
                                         startTime: Date) => {
        try {
            await axios.post('/api/email/requestConfirmation', {
                email: email,
                name: name,
                serviceType: serviceType,
                startTime: startTime,
            }).then((res) => {
                console.log(`Email sent to ${email}:`, res);
            }).catch((err) => {
                console.error(`Error sending email to ${email}:`, err);
            });
        } catch (error) {
            console.error("There was an error sending the email", error);
        }
    };
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
            };

            if (bookingDetails.provider?._id === bookingDetails.requestedBy?._id) {
                // Trigger the error dialog
                triggerAlert("Error", "You cannot book from your own service! \n Redirecting back to homepage...", "error", 5000, "dialog", "center", "/");
                return;
            }

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
                console.log()
                console.log('Booking confirmed:', response.data);

                sendEmailNotification(bookingDetails.requestedBy?.email ? bookingDetails.requestedBy?.email : "",
                    bookingDetails.requestedBy?.firstName ? bookingDetails.requestedBy?.firstName : "",
                    bookingDetails.serviceType, bookingDetails.timeSlot?.start ? bookingDetails.timeSlot?.start : new Date());


                // not needed, now all handled in backend
                // const timeSlotWithRequest = {
                //     ...bookingDetails.timeSlot,
                //     // title: bookingDetails.timeSlot?.title,
                //     requestId: requestId,
                // };

                // try {
                // step 2: post the timeslot into timeslot table
                // todo: comment out later
                // const timeslotResponse = await bookTimeSlot(timeSlotWithRequest, token);
                // console.log("Timeslot booked successfully", timeslotResponse);
                //
                // // // step 3: send notification to provider
                // const notificationContent = `You have a new service request for ${requestData.serviceType} at ${formatDateTime(requestData.timeSlot?.start)}.`;
                //
                // const notificationData = {
                //     isViewed: false,
                //     content: notificationContent,
                //     notificationType: "New Request",
                //     serviceRequest: requestId,
                //     recipient: requestData.provider
                // };
                // // generate new notification
                // try {
                //     const notification = await axios.post("api/notifications/", notificationData, {
                //         headers: {Authorization: `Bearer ${token}`}
                //     });
                //     console.log("Notification sent!", notification);
                //
                // } catch (notificationError) {
                //     console.error('Error sending notification:', notificationError);
                // }

                // navigate('/confirmation'); // Navigate to a confirmation page or show a confirmation message
                navigate(`/confirmation/${requestId}/booking`); // Navigate to a confirmation page or show a confirmation message


                //     if booking timeslot fails, then roll back the request
            } catch (error: any) {
                console.error('Error confirming booking:', error);

                if (error.code === 409 || error.response?.status === 409) {
                    setAlertMessage('Unfortunately, the selected timeslot is no longer available. Please select another time.');
                    setAlertSeverity('error');
                    setShowAlert(true);
                    setCountdown(5);
                    // try {
                    //     if (requestId) {
                    //         console.log(requestId)
                    //         await axios.delete(`/api/requests/${requestId}`, {
                    //             headers: {'Authorization': `Bearer ${token}`}
                    //         });
                    //     }
                    // } catch (error: any) {
                    //     console.log(error)
                    // }
                } else {
                    // alert('An error occurred while confirming your booking. Please try again.');
                    setAlertMessage('An error occurred while confirming your booking. Please try again.');
                    setAlertSeverity('error');
                    setShowAlert(true);
                    setCountdown(5);
                }
            }

        }
    ;

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
        <>
            <div>
                {/*<button onClick={handleAction}>Do Something</button>*/}
                <AlertCustomized alert={alert} closeAlert={closeAlert}/>
            </div>

            {/*todo: modify this to use the component*/}
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
            <>
                {/*<Typography variant="h6" gutterBottom>*/}
                {/*    Step 4 of 4*/}
                {/*</Typography>*/}
                <Typography variant="h4" gutterBottom>
                    Review and confirm booking
                </Typography>
                {/*<Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2}}>*/}
                {/*    <Button variant="outlined" onClick={onBack}>Back</Button>*/}
                {/*</Box>*/}
                <Card sx={{mb: 2}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Booking Details
                        </Typography>
                        <Typography variant="body1">
                            <strong>Provider:</strong> {bookingDetails.provider?.firstName} {bookingDetails.provider?.lastName}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Location:</strong> {bookingDetails.provider?.location}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Service:</strong> {bookingDetails.serviceType}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Date:</strong> {bookingDetails.timeSlot?.start ? bookingDetails.timeSlot?.start.toLocaleString() : 'No date set'}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Hourly Price:</strong> {bookingDetails.price}
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
                    <Button variant="contained" color="primary" onClick={handleConfirmBooking} sx={{mr: 2}}>
                        Confirm Booking
                    </Button>
                    <Button variant="outlined" onClick={handleCancel}>Cancel </Button>
                </Box>
            </>

        </>);
}


export default ReviewAndConfirm;
