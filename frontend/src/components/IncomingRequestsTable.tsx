import React, {useState} from 'react';
import CardContent from '@mui/material/Box';
import {Dialog, Button, DialogActions, DialogContent, DialogTitle, Box, TextField} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {ServiceRequest, ServiceRequest as Request} from '../models/ServiceRequest';
import IncomingRequestRow from './IncomingRequestRow';
import Modal from './inputs/Modal';
import MediaCard from './IncomingRequestCard';

import {ServiceType, RequestStatus, JobStatus} from '../models/enums'
import {Account} from '../models/Account';
import {useEffect} from "react";
import {useAuth} from "../contexts/AuthContext";
import axios from "axios";
import {formatDateTime} from '../utils/dateUtils';
import {useNavigate} from "react-router-dom";

// todo: replace ALL appointmentstarttime/endtime

export default function IncomingRequestTable() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedRequest, setSelectedRequest] = React.useState<ServiceRequest | null>(null);
    const [serviceRequests, setServiceRequests] = React.useState<ServiceRequest[]>([]);
    const [comment, setComment] = useState('');
    const {token, account} = useAuth();
    const [timeChangePopUp, setTimeChangePopUp] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        console.log(token)
        if (token && account) {
            console.log("this is the logged in account in request table:", account)
            // setLoading(true);
            axios.get<ServiceRequest[]>(`/api/requests/provider/incoming/${account._id}`, {
                headers: {Authorization: `Bearer ${token}`}
            })
                .then(response => {
                    console.log("getting requests ...", response.data)
                    setServiceRequests(response.data);
                    // setLoading(false);
                })
                .catch(error => {
                    console.error('Failed to fetch service requests:', error);
                    setServiceRequests([]);
                    // setError('Failed to load service requests');
                    // setLoading(false);
                });
        }
    }, [token, account]);

    const openModal = (request: Request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleToggleMediaCard = (req: ServiceRequest | null) => {
        setSelectedRequest(req);
        setShowMediaCard(req !== null);
    };

    const handleAccept = async () => {

        if (!selectedRequest) {
            console.error('No request selected');
            return;
        }


        // get data from the request (selectedRequest)
        const {requestStatus, job, _id, requestedBy, provider, ...rest} = selectedRequest;

        const jobData = {
            status: JobStatus.open,
            request: selectedRequest._id,
            receiver: selectedRequest.requestedBy._id,
            provider: selectedRequest.provider._id,
            ...rest,
        };

        console.log("job data at frontend:", jobData);

        // post new job
        try {
            const jobResponse = await axios.post("api/jobs/", jobData, {
                headers: {Authorization: `Bearer ${token}`}
            });
            console.log("job posted!", jobResponse);

            // update the request
            if (jobResponse.data && jobResponse.data._id) {
                const updateRequestData = {
                    job: jobResponse.data._id,
                    requestStatus: RequestStatus.accepted,
                };
                console.log("selected request id:", selectedRequest._id, updateRequestData);

                const updateResponse = await axios.patch(`/api/requests/${selectedRequest._id}`, updateRequestData, {
                    headers: {Authorization: `Bearer ${token}`}
                });
                console.log('Request Updated:', updateResponse.data);

                // Update local state to reflect these changes
                const updatedServiceRequests = serviceRequests.map(req => {
                    if (req._id === selectedRequest._id) {
                        return {...req, ...updateRequestData, job: jobResponse.data._id};
                    }
                    return req;
                });

                console.log(updatedServiceRequests);
                setServiceRequests(updatedServiceRequests);
                setShowMediaCard(false);

                // Prepare notification data
                const notificationData = {
                    isViewed: false,
                    content: `Your service request for ${selectedRequest.serviceType} on the ${formatDateTime(selectedRequest.timeslot?.start)} has been accepted`,
                    serviceRequest: selectedRequest._id,
                    job: jobResponse.data._id,
                    recipient: selectedRequest.requestedBy._id,
                    ...rest,
                };

                console.log("notification data at frontend:", notificationData);

                // generate new notification
                try {
                    const notification = await axios.post("api/notification/", notificationData, {
                        headers: {Authorization: `Bearer ${token}`}
                    });
                    console.log("Notification sent!", notification);


                } catch (notificationError) {
                    console.error('Error sending notification:', notificationError);
                }
            }
        } catch (error) {
            console.error('Error posting job:', error);
        }
    }


    const handleDecline = async () => {

        if (!selectedRequest) {
            console.error('No request selected');
            return;
        }


        // get data from the request (selectedRequest)
        const {requestStatus, job, _id, requestedBy, provider, ...rest} = selectedRequest;

        try {

            // update the request
            const updateRequestData = {
                requestStatus: RequestStatus.declined,
            };
            console.log("selected request id:", selectedRequest._id, updateRequestData)
            const updateResponse = await axios.patch(`/api/requests/${selectedRequest._id}`, updateRequestData, {
                headers: {Authorization: `Bearer ${token}`}
            });
            console.log('Request Updated:', updateResponse.data);


            // Update local state to reflect these changes
            const updatedServiceRequests = serviceRequests.map(req => {
                if (req._id === selectedRequest._id) {
                    return {...req, ...updateRequestData};
                }
                return req;
            });

            console.log(updatedServiceRequests);
            setServiceRequests(updatedServiceRequests);
            setShowMediaCard(false);
        } catch (error) {
            console.error('Error declining Request:', error);
        }

        // Prepare notification data
        const notificationData = {
            isViewed: false,
            content: `Your service request for ${selectedRequest.serviceType} on the ${formatDateTime(selectedRequest.timeslot?.start)} has been declined `,
            serviceRequest: selectedRequest._id,
            recipient: selectedRequest.requestedBy._id,
            ...rest,
        };

        console.log("notification data at frontend:", notificationData);

        // generate new notification
        try {
            const notification = await axios.post("api/notification/", notificationData, {
                headers: {Authorization: `Bearer ${token}`}
            });
            console.log("Notification sent!", notification);


        } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
        }


    };

    const handleCancel = async () => {

        if (!selectedRequest) {
            console.error('No request selected');
            return;
        }


        // get data from the request (selectedRequest)
        const {requestStatus, job, _id, requestedBy, provider, ...rest} = selectedRequest;

        try {

            // update the request
            const updateRequestData = {
                requestStatus: RequestStatus.cancelled,
            };
            console.log("selected request id:", selectedRequest._id, updateRequestData)
            const updateResponse = await axios.patch(`/api/requests/${selectedRequest._id}`, updateRequestData, {
                headers: {Authorization: `Bearer ${token}`}
            });
            console.log('Request Updated:', updateResponse.data);


            // todo: also cancel the timeslot
            // Update local state to reflect these changes
            const updatedServiceRequests = serviceRequests.map(req => {
                if (req._id === selectedRequest._id) {
                    return {...req, ...updateRequestData};
                }
                return req;
            });

            console.log(updatedServiceRequests);
            setServiceRequests(updatedServiceRequests);
            setShowMediaCard(false);
        } catch (error) {
            console.error('Error cancelling Request:', error);
        }

        // Prepare notification data
        const notificationData = {
            isViewed: false,
            content: `Your service request for ${selectedRequest.serviceType} on the ${formatDateTime(selectedRequest.timeslot?.start)} has been cancelled`,
            serviceRequest: selectedRequest._id,
            recipient: selectedRequest.requestedBy._id,
            ...rest,
        };

        console.log("notification data at frontend:", notificationData);

        // generate new notification
        try {
            const notification = await axios.post("api/notification/", notificationData, {
                headers: {Authorization: `Bearer ${token}`}
            });
            console.log("Notification sent!", notification);


        } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
        }


    };

    const handleTimeChange = async () => {
        setTimeChangePopUp(true);
        console.log("handle time change begin");

        if (!selectedRequest) {
            console.error('No request selected');
            return;
        }

        console.log("request exists");

        // get data from the request (selectedRequest)
        const {requestStatus, job, _id, requestedBy, provider, ...rest} = selectedRequest;

        console.log(selectedRequest)
        // Prepare notification data
        const notificationData = {
            isViewed: false,
            content: `Please change the booking time for your service request ${selectedRequest.serviceType} on the ${formatDateTime(selectedRequest.timeslot?.start)}.
            \n Comment from the provider: ${comment}`,
            serviceRequest: selectedRequest._id,
            recipient: selectedRequest.requestedBy._id,
            notificationType: 'Timeslot Change Request',
            ...rest,
        };

        console.log("notification data at frontend:", notificationData);

        // generate new notification
        try {
            const notification = await axios.post("api/notifications/", notificationData, {
                headers: {Authorization: `Bearer ${token}`}
            });
            console.log("Notification sent!", notification);

            //  update request status

        } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
        }

        try {

            // update the request status
            const updateRequestData = {
                requestStatus: RequestStatus.requestorActionNeeded,
            };
            console.log("selected request id:", selectedRequest._id, updateRequestData)
            const updateResponse = await axios.patch(`/api/requests/${selectedRequest._id}`, updateRequestData, {
                headers: {Authorization: `Bearer ${token}`}
            });
            console.log('Request Updated:', updateResponse.data);

            // Update local state to reflect these changes
            const updatedServiceRequests = serviceRequests.map(req => {
                if (req._id === selectedRequest._id) {
                    return {...req, ...updateRequestData, timeslot: undefined};
                }
                return req;
            });

            console.log("updates after sending timeslot change:", updatedServiceRequests);
            setServiceRequests(updatedServiceRequests);
            setShowMediaCard(false);
        } catch (error) {
            console.error('Error cancelling Request:', error);
        }
        navigate("/select-availability")
        setTimeChangePopUp(false);
    };

    return (
        <Box sx={{minWidth: 275, margin: 2}}>
            <Box>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small"/>} aria-label="breadcrumb"
                             sx={{marginBottom: '16px'}}>
                    <Typography color="textPrimary">Incoming Requests</Typography>
                </Breadcrumbs>
                <Typography variant="h6" component="div" sx={{marginBottom: '16px'}}>
                    Incoming Requests
                </Typography>
            </Box>
            <Box style={{display: 'flex'}}>
                <Box sx={{flexGrow: 1, marginRight: 2}}>
                    <Box>
                        {serviceRequests.length === 0 ? (
                            <Typography variant="body1">No incoming requests.</Typography>
                        ) : (
                            <TableContainer component={Paper} sx={{overflow: 'auto'}}>
                                <Table sx={{minWidth: 650}} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Appointment Date</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {serviceRequests.map((request) => (
                                            <IncomingRequestRow key={request._id} request={request}
                                                                onViewDetails={handleToggleMediaCard}/>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>)}
                    </Box>
                </Box>
                {/*<Dialog open={timeChangePopUp} onClose={handleTimeChange}>*/}
                {/*    <DialogTitle>Time Slot Update Requested</DialogTitle>*/}
                {/*    <DialogContent>*/}
                {/*        The consumer will be alerted of the need to select a new TimeSlot.*/}
                {/*        Please update your availabilities accordingly.*/}
                {/*    </DialogContent>*/}
                {/*    <DialogActions>*/}
                {/*        <Button onClick={handleTimeChange}>Notify Requester</Button>*/}
                {/*    </DialogActions>*/}
                {/*</Dialog>*/}
                <Dialog open={timeChangePopUp} onClose={() => setTimeChangePopUp(false)}>
                    <DialogTitle>Request Time Slot Update</DialogTitle>
                    <DialogContent>
                        In case you're not available anymore or think the service will take a longer time, please let the requester know in the comment.
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
                        <Button onClick={handleTimeChange}>Notify Requester and Update My Availability</Button>
                    </DialogActions>
                </Dialog>
                {showMediaCard && selectedRequest && (
                    <div style={{position: 'relative', flexShrink: 0, width: 400, marginLeft: 2}}>
                        <MediaCard request={selectedRequest}
                                   onClose={() => setShowMediaCard(false)}
                                   onAccept={handleAccept}
                                   onDecline={handleDecline}
                                   onCancel={handleCancel}
                                   onTimeChange={() => setTimeChangePopUp(true)}/>
                    </div>
                )}
            </Box>
        </Box>
    );
}
