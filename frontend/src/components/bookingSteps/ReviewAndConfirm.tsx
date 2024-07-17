import React, {useEffect, useState} from 'react';
import {
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
import { BookingDetails} from '../../contexts/BookingContext';
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {RequestStatus, ServiceType} from "../../models/enums";
import {useAuth} from "../../contexts/AuthContext";
import { BookingError} from '../../services/timeslotService';
import useAlert from "../../hooks/useAlert";
import AlertCustomized from "../AlertCustomized";



interface ReviewAndConfirmProps {
    bookingDetails: BookingDetails;
    handleCancel: () => void;

}

// step 4
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
                comment: comment || " ",
                serviceFee: bookingDetails.price, // Assuming the frontend uses 'fee' and backend expects 'serviceFee'
                serviceOffering: bookingDetails.serviceOffering?._id, // Adjust field names as needed
                job: undefined,
                provider: bookingDetails.provider?._id,
                requestedBy: bookingDetails.requestedBy?._id,
            };

            if (bookingDetails.provider?._id === bookingDetails.requestedBy?._id) {
                // Trigger the error dialog
                triggerAlert("Error", "You cannot book from your own service! \n Redirecting back to homepage...", "error", 5000, "dialog", "center", "/");
                return;
            }




            try {
                // step 1: post the request
                const response = await axios.post(apiEndpoint, requestData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const requestId = response.data._id;
                setRequestId(requestId);

                sendEmailNotification(bookingDetails.requestedBy?.email ? bookingDetails.requestedBy?.email : "",
                    bookingDetails.requestedBy?.firstName ? bookingDetails.requestedBy?.firstName : "",
                    bookingDetails.serviceType, bookingDetails.timeSlot?.start ? bookingDetails.timeSlot?.start : new Date());


                navigate(`/confirmation/${requestId}/booking`); // Navigate to a confirmation page or show a confirmation message


                //     if booking timeslot fails, then roll back the request
            } catch (error: any) {

                if (error.code === 409 || error.response?.status === 409) {
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
                <AlertCustomized alert={alert} closeAlert={closeAlert}/>
            </div>

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
                {/*review and confirm*/}
                <Typography variant="h4" gutterBottom>
                    Review and confirm booking
                </Typography>
                <Card sx={{mb: 2}}>
                    {/*details of the booking*/}
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
                    {/*consumer can add notes*/}
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
                <Box sx={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2}}>

                    {/*display a "disclaimer" info that providers have access to the consumer's contact*/}
                    <Typography variant="body2" color="text-secondary" sx={{maxWidth: "50%",
                        fontSize: '0.75rem',
                        textAlign: 'right',
                        mr: 2
                        }}>
                        By confirming the booking, you consent to share your contact details (email, phone number, and address) with the provider to enable the carrying out of the service.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleConfirmBooking} sx={{whiteSpace: 'nowrap', mr: 2, minHeight: 'auto',
                        maxHeight: 40,}}>
                        Confirm Booking
                    </Button>
                    <Button variant="outlined" onClick={handleCancel} sx={{whiteSpace: 'nowrap', maxHeight: 40}}>Cancel </Button>
                </Box>
            </>

        </>);
}


export default ReviewAndConfirm;
