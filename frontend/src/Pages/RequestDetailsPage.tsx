// src/components/JobDetailsPage.tsx
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import {Job} from '../models/Job';
import {
    Container,
    Typography,
    Box,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    Dialog, CircularProgress
} from '@mui/material';
import {useAuth} from '../contexts/AuthContext';
import {Review} from "../models/Review"; // Assuming you have a component to list reviews
import GenericProviderCard from "../components/tableComponents/GenericProviderCard";
import GenericConsumerCard from "../components/tableComponents/GenericConsumerCard";
import {handleAccept, handleCancel, handleDecline, handleTimeChange} from "../utils/requestHandler";
import {ServiceRequest} from "../models/ServiceRequest";
import useAlert from "../hooks/useAlert";
import AlertCustomized from "../components/AlertCustomized";

import useErrorHandler from '../hooks/useErrorHandler';
import ErrorPage from "./ErrorPage";

// Define the props interface
interface RequestDetailsPageProps {}

type Item = ServiceRequest | Job;


// tood: modify this
const RequestDetailsPage: React.FC<RequestDetailsPageProps> = () => {
    const {requestId} = useParams<{ requestId: string }>();
    const [request, setRequest] = useState<ServiceRequest | null>(null);
    const {token, account} = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);

    const {error, setError, handleError} = useErrorHandler();

    const [role, setRole] = useState<string | undefined>(undefined)

    // for time change
    const [timeChangePopUp, setTimeChangePopUp] = useState(false);
    const [comment, setComment] = useState('');

    const [loading, setLoading] = useState(true);

    const {alert, triggerAlert, closeAlert} = useAlert(3000);


    const navigate = useNavigate();
    const location = useLocation();

    const [redirectPath, setRedirectPath] = useState(() => location.state?.redirectPath || undefined);


    useEffect(() => {
        setLoading(true);
        const fetchRequest = async () => {
            try {

                const response = await axios.get<ServiceRequest>(`/api/requests/${requestId}`, {
                    headers: {Authorization: `Bearer ${token}`},
                });

                console.log("request data,", response.data)

                setRequest(response.data);
                setLoading(false);
                //

                console.log(response)
                if (!response) {
                    setError({title:'404 Not Found', message:'The request you\'re looking for cannot be found.'});
                    return;
                }

                // // Fetch reviews for the request
                // const reviewsResponse = await axios.get<Review[]>(`/api/reviews/job/${requestId}`, {
                //     headers: { Authorization: `Bearer ${token}` },
                // });
                // setReviews(reviewsResponse.data);
            } catch (err: any) {
                setLoading(false)
                console.error('Failed to fetch request details:', err);
                handleError(err)
            }
        };

        if (requestId) {
            fetchRequest();
        }
    }, [requestId, token, account]);

    useEffect(() => {
        // Adjust paths based on role
        if (request) {
            const isProvider = account?._id === request.provider._id;
            const isConsumer = account?._id === request.requestedBy._id;

            const pathIncludesIncoming = location.pathname.includes("incoming");
            const pathIncludesOutgoing = location.pathname.includes("outgoing");

            if ((pathIncludesIncoming && !isProvider) || (pathIncludesOutgoing && !isConsumer)) {
                navigate("/unauthorized");
            } else if (isProvider) {
                setRole("provider");
                if (!redirectPath) {
                    setRedirectPath('/incoming');
                }
            } else if (isConsumer) {
                setRole("consumer");
                if (!redirectPath) {
                    setRedirectPath('/outgoing');
                }
            } else {
                // If neither, navigate to unauthorized
                navigate("/unauthorized");
            }
        }

    }, [request, account, token]);

    // unmount
    useEffect(() => {
        return () => {
            setError(null);
        };
    }, []);

    if (error) {
        console.log("youre in iferror", error)
        return <ErrorPage title={error.title} message={error.message}/>
    }

    if (!request) {
        if (loading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                    <CircularProgress />
                </Box>
            )
        } else {
            console.log("error")
            return <ErrorPage title={"404 Not Found"} message={'The request you\'re looking for cannot be found.'}/>
        }
    }



    // Authorization check
    // if ((role === "provider" && account?._id !== request.provider._id) ||
    //     (role === "consumer" && account?._id !== request.requestedBy._id)) {
    //     // You could alternatively redirect to a different page or display a modal
    //     navigate("/unauthorized")
    // }

    const onCancel = () => {
        if (!request) {
            console.error('No request selected');
            return;
        }


        handleCancel({
            selectedRequest: request,
            serviceRequests: [],
            setServiceRequests: null,
            token: token,
            setShowMediaCard: () => {
            },
        });

        window.location.reload();

    };

    const onDecline = () => {
        if (!request) {
            console.error('No request selected');
            return;
        }
        handleDecline({
            selectedRequest: request,
            serviceRequests: [],
            setServiceRequests: null,
            token: token,
            setShowMediaCard: () => {
            },
        });

        window.location.reload();

    };

    const onAccept = () => {
        if (!request) {
            console.error('No request selected');
            return;
        }
        handleAccept({
            selectedRequest: request,
            serviceRequests: [],
            setServiceRequests: null,
            token: token,
            setShowMediaCard: () => {
            },
        });
        window.location.reload();


    };

    const onTimeChange = () => {
        if (!request) {
            console.error('No request selected');
            return;
        }
        handleTimeChange({
            selectedRequest: request,
            serviceRequests: [],
            setServiceRequests: null,
            token: token,
            setShowMediaCard: () => {
            },
            comment,
            setTimeChangePopUp,
            navigate
        });

        window.location.reload();
    };


    const providerProps = {
        item: request,
        provider: request?.provider,
        receiver: request?.requestedBy,
        onClose: () => {
        },
        inDetailPage: true,
        redirectPath: redirectPath,

        actions: {
            accept: onAccept,
            cancelRequest: onCancel,
            decline: onDecline,
            changeTime: () => setTimeChangePopUp(true),
        }
    };

    const consumerProps = {
        item: request,
        provider: request?.provider,
        receiver: request?.requestedBy,
        onClose: () => {
        },
        inDetailPage: true,
        redirectPath: redirectPath,
        actions: {
            cancelRequest: onCancel,
        }
    };


    const CardComponent = role === "provider" ? GenericProviderCard : GenericConsumerCard;
    const cardProps = role === "provider" ? providerProps : consumerProps;

    // @ts-ignore
    // @ts-ignore
    return (
        <Container>
            <div>
                {/*<button onClick={handleAction}>Do Something</button>*/}
                <AlertCustomized alert={alert} closeAlert={closeAlert}/>
            </div>


            <Dialog open={timeChangePopUp} onClose={() => setTimeChangePopUp(false)}>
                <DialogTitle>Request Time Slot Update</DialogTitle>
                <DialogContent>
                    In case you're not available anymore or think the service will take a longer time,
                    please let the requester know in the comment.
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        maxRows={5}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        label="Comment"
                        variant="outlined"
                        placeholder="Please provide additional details or preferred time."
                    />
                    The consumer will be alerted of the need to select a new timeslot.
                    Please update your availabilities accordingly.
                </DialogContent>
                <DialogActions>
                    <Button onClick={onTimeChange}>Notify Requester and Update My Availability</Button>
                </DialogActions>
            </Dialog>

            <Box sx={{mt: 4}}>
                <Typography variant="h4" gutterBottom>
                    {request?.serviceType} Request Details
                </Typography>
                <CardComponent {...cardProps} />

                {/*<MediaCard*/}
                {/*    offeredService={request}*/}
                {/*    provider={request.provider}*/}
                {/*    receiver={request.receiver}*/}
                {/*    onComplete={handleAccept}*/}
                {/*    onCancel={handleCancel}*/}
                {/*    onReview={handleReview}*/}
                {/*    onRevoke={handleRevoke}*/}
                {/*    onClose={handleCancel}*/}
                {/*    // showExpandIcon={false} // Disable the expand icon for the details page*/}
                {/*/>*/}
            </Box>
        </Container>
    );
};

export default RequestDetailsPage;
