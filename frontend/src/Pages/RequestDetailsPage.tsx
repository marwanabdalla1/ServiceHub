import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
    Dialog, CircularProgress
} from '@mui/material';
import {useAuth} from '../contexts/AuthContext';
import {Review} from "../models/Review";
import GenericProviderCard from "../components/tableComponents/GenericProviderCard";
import GenericConsumerCard from "../components/tableComponents/GenericConsumerCard";
import {handleAccept, handleCancel, handleDecline, handleTimeChange} from "../utils/requestHandler";
import {ServiceRequest} from "../models/ServiceRequest";
import useAlert from "../hooks/useAlert";
import AlertCustomized from "../components/AlertCustomized";
import ErrorPage from "./ErrorPage";

// Define the props interface
interface RequestDetailsPageProps {
}

type Item = ServiceRequest | Job;

function RequestDetailsPage() {
    const {requestId} = useParams<{ requestId: string }>();
    const [request, setRequest] = useState<ServiceRequest | null>(null);
    const {token, account} = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);

    const [role, setRole] = useState<string | undefined>(undefined)

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

                if (!response) {
                    navigate("/not-found");
                    return;
                }


                // determine the role
                if (account && response && response.data) {
                    const isProvider = account?._id === response.data.provider._id;
                    const isConsumer = account?._id === response.data.requestedBy._id;

                    const pathIncludesIncoming = location.pathname.includes("incoming");
                    const pathIncludesOutgoing = location.pathname.includes("outgoing");

                    console.log("request found!", isProvider, isConsumer)
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
                        navigate("/unauthorized");
                    }
                }

                setRequest(response.data);
                setLoading(false);


            } catch (error: any) {
                setLoading(false);
                console.log("error", error)
                if (error.response.status && error.response.status === 403) {
                    navigate("/unauthorized")
                } else {
                    return <ErrorPage title={"404 Not Found"}
                                      message={'The page you are looking for does not exist.'}/>;
                }
            }

        };

        if (requestId) {
            fetchRequest();
        }
    }, [requestId, token, account]);


    if (!request) {
        if (loading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                    <CircularProgress/>
                </Box>
            );
        } else {
            return <ErrorPage title={"404 Not Found"} message={'The page you are looking for does not exist.'}/>;
        }
    }

    const onCancel = async () => {
        if (!request) return;

        await handleCancel({
            selectedRequest: request,
            serviceRequests: [],
            setServiceRequests: null,
            token: token,
            setShowMediaCard: () => { },
            triggerAlert: triggerAlert,
        });
        window.location.reload();
    };

    const onDecline = async () => {
        if (!request) return;

        await handleDecline({
            selectedRequest: request,
            serviceRequests: [],
            setServiceRequests: null,
            token: token,
            setShowMediaCard: () => { },
            triggerAlert: triggerAlert,
        });
        window.location.reload();
    };

    const onAccept = async () => {
        if (!request) return;

        await handleAccept({
            selectedRequest: request,
            serviceRequests: [],
            setServiceRequests: null,
            token: token,
            setShowMediaCard: () => { },
            triggerAlert: triggerAlert,
        });
        window.location.reload();
    };

    const onTimeChange = async () => {
        if (!request) return;

        await handleTimeChange({
            selectedRequest: request,
            serviceRequests: [],
            setServiceRequests: null,
            token: token,
            setShowMediaCard: () => { },
            comment,
            setTimeChangePopUp,
            navigate,
            triggerAlert: triggerAlert,

        });
        window.location.reload();
    };

    const providerProps = {
        item: request,
        provider: request?.provider,
        receiver: request?.requestedBy,
        onClose: () => { },
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
        onClose: () => { },
        inDetailPage: true,
        redirectPath: redirectPath,
        actions: {
            cancelRequest: onCancel,
        }
    };

    const CardComponent = role === "provider" ? GenericProviderCard : GenericConsumerCard;
    const cardProps = role === "provider" ? providerProps : consumerProps;

    return (
        <Container>
            <div>
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

            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {request?.serviceType} Request Details
                </Typography>
                <CardComponent {...cardProps} />
            </Box>
        </Container>
    );
};

export default RequestDetailsPage;
