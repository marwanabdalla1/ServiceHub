// src/components/JobDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import { Job } from '../models/Job';
import {
    Container,
    Typography,
    Box,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    Dialog
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import {Review} from "../models/Review"; // Assuming you have a component to list reviews
import GenericProviderCard from "../components/tableComponents/generic/GenericProviderCard";
import GenericConsumerCard from "../components/tableComponents/generic/GenericConsumerCard";
import {handleAccept, handleCancel, handleDecline, handleTimeChange} from "../utils/requestHandler";
import {ServiceRequest} from "../models/ServiceRequest";
import useAlert from "../hooks/useAlert";
import AlertCustomized from "../components/AlertCustomized";

// Define the props interface
interface RequestDetailsPageProps {
    role: string;
}

type Item = ServiceRequest | Job;


// tood: modify this
const RequestDetailsPage: React.FC<RequestDetailsPageProps>  = ({ role }) => {
    const { requestId } = useParams<{ requestId: string }>();
    const [request, setRequest] = useState<ServiceRequest | null>(null);
    const { token, account } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);

    // for time change
    const [timeChangePopUp, setTimeChangePopUp] = useState(false);
    const [comment, setComment] = useState('');

    const { alert, triggerAlert, closeAlert } = useAlert(100000);


    const navigate = useNavigate();


    useEffect(() => {
        const fetchJob = async () => {
            try {

                const response = await axios.get<ServiceRequest>(`/api/requests/${requestId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRequest(response.data);

                // todo: set

                // Fetch reviews for the request
                const reviewsResponse = await axios.get<Review[]>(`/api/reviews/job/${requestId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setReviews(reviewsResponse.data);
            } catch (error) {
                console.error('Failed to fetch request details:', error);
            }
        };

        if (requestId) {
            fetchJob();
        }
    }, [requestId, token]);

    if (!request) {
        return <div>Loading...</div>;
    }

    // Authorization check
    if ((role === "provider" && account?._id !== request.provider._id) ||
        (role === "consumer" && account?._id !== request.requestedBy._id)) {
        // You could alternatively redirect to a different page or display a modal
        navigate("/unauthorized")
    }

    const onCancel = () => {
        if (!request) {
            console.error('No request selected');
            return;
        }


        handleCancel({
            selectedRequest:request,
            serviceRequests: [],
            setServiceRequests: null,
            token:token,
            setShowMediaCard: () => {},
        });
    };

    const onDecline = () => {
        if (!request) {
            console.error('No request selected');
            return;
        }
        handleDecline({
            selectedRequest:request,
            serviceRequests: [],
            setServiceRequests: null,
            token:token,
            setShowMediaCard: () => {},
        });
    };

    const onAccept = () => {
        if (!request) {
            console.error('No request selected');
            return;
        }
        handleAccept({
            selectedRequest:request,
            serviceRequests: [],
            setServiceRequests: null,
            token:token,
            setShowMediaCard: () => {},
        });
    };

    const onTimeChange = () => {
        if (!request) {
            console.error('No request selected');
            return;
        }
        handleTimeChange({
            selectedRequest:request,
            serviceRequests: [],
            setServiceRequests: null,
            token:token,
            setShowMediaCard: () => {},
            comment,
            setTimeChangePopUp,
            navigate
        });
    };




    const providerProps = {
        item: request,
        provider: request.provider,
        receiver: request.requestedBy,
        onClose: () => {},
        inDetailPage: true,

        actions:{
            accept: onAccept,
            cancelRequest: onCancel,
            decline: onDecline,
            changeTime: () => setTimeChangePopUp(true),
        }
    };

    const consumerProps = {
        item: request,
        provider: request.provider,
        receiver: request.requestedBy,
        onClose: () => {},
        inDetailPage: true,
        actions:{
            cancelRequest: onCancel,
        }
    };


    const CardComponent = role === "provider" ? GenericProviderCard : GenericConsumerCard;
    const cardProps = role === "provider" ? providerProps : consumerProps;

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
                    {request.serviceType} Request Details
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
