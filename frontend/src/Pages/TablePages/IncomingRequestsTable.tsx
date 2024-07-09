import React, {useState} from 'react';
import CardContent from '@mui/material/Box';
import {Dialog, Button, DialogActions, DialogContent, DialogTitle, Box, TextField} from '@mui/material';

import {Link} from 'react-router-dom'
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
import {ServiceRequest, ServiceRequest as Request} from '../../models/ServiceRequest';
// import IncomingRequestRow from './IncomingRequestRow';
import Modal from '../../components/inputs/Modal';
// import MediaCard from './IncomingRequestCard';

import GenericProviderCard from '../../components/tableComponents/GenericProviderCard'
import GenericTableRow from '../../components/tableComponents/GenericTableRow'

import {ServiceType, RequestStatus, JobStatus} from '../../models/enums'
import {Account} from '../../models/Account';
import {useEffect} from "react";
import {useAuth} from "../../contexts/AuthContext";
import axios from "axios";
import {formatDateTime} from '../../utils/dateUtils';
import {useNavigate} from "react-router-dom";
import {Job} from "../../models/Job";


import {
    handleAccept,
    handleDecline,
    handleCancel,
    handleTimeChange,
} from '../../utils/requestHandler';
import {sortBookingItems} from "../../utils/jobHandler";  // Adjust the path as necessary


// todo: replace ALL appointmentstarttime/endtime

type Item = ServiceRequest | Job;

export default function IncomingRequestTable() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedRequest, setSelectedRequest] = React.useState<ServiceRequest | null>(null);
    const [serviceRequests, setServiceRequests] = React.useState<ServiceRequest[]>([]);
    const [comment, setComment] = useState('');
    const {token, account} = useAuth();
    const [timeChangePopUp, setTimeChangePopUp] = useState(false);
    const navigate = useNavigate();


    const statusOptions = ['ALL REQUESTS', 'Pending', 'Action Needed from Requester', 'Accepted', 'Cancelled', 'Declined'];
    const [statusFilter, setStatusFilter] = useState('ALL REQUESTS');
    const filteredRequests = serviceRequests.filter((request) =>
        statusFilter === 'ALL REQUESTS' || statusFilter === '' ? true : request.requestStatus === statusFilter.toLowerCase()
    );
    useEffect(() => {
        console.log(token)
        if (token && account) {
            console.log("this is the logged in account in request table:", account)
            // setLoading(true);
            // get all requests instead of only incoming ones
            axios.get<ServiceRequest[]>(`/api/requests/provider/${account._id}`, {
                headers: {Authorization: `Bearer ${token}`}
            })
                .then(response => {

                    console.log("getting requests ...", response.data)
                    const sortedData = sortBookingItems(response.data);
                    setServiceRequests(sortedData as ServiceRequest[]);
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

    const handleToggleMediaCard = (req: ServiceRequest | Item | null) => {
        setSelectedRequest(req as ServiceRequest);
        setShowMediaCard(req !== null);
    };


    const onAccept = () => {
        if (!selectedRequest) {
            console.error('No request selected');
            return;
        }
        handleAccept({
            selectedRequest,
            serviceRequests,
            setServiceRequests,
            token,
            setShowMediaCard,
        });
    };

    const onDecline = () => {
        if (!selectedRequest) {
            console.error('No request selected');
            return;
        }
        handleDecline({
            selectedRequest,
            serviceRequests,
            setServiceRequests,
            token,
            setShowMediaCard,
        });
    };

    const onCancel = () => {
        if (!selectedRequest) {
            console.error('No request selected');
            return;
        }
        handleCancel({
            selectedRequest,
            serviceRequests,
            setServiceRequests,
            token,
            account,
            setShowMediaCard,
        });
    };

    const onTimeChange = () => {
        if (!selectedRequest) {
            console.error('No request selected');
            return;
        }
        handleTimeChange({
            selectedRequest,
            serviceRequests,
            setServiceRequests,
            token,
            setShowMediaCard,
            comment,
            setTimeChangePopUp,
            navigate
        });
    };




    return (
        <div style={{display: 'flex'}}>
            <div style={{flex: 1, padding: '20px'}}>
                <Box sx={{minWidth: 275, margin: 2}}>
                    <Box>
                        {/*<Breadcrumbs separator={<NavigateNextIcon fontSize="small"/>} aria-label="breadcrumb"*/}
                        {/*             sx={{marginBottom: '16px'}}>*/}
                        {/*    <Typography color="textPrimary">Incoming Requests</Typography>*/}
                        {/*</Breadcrumbs>*/}
                        <Typography variant="h6" component="div" sx={{marginBottom: '16px'}}>
                            Incoming Requests
                        </Typography>
                        <Typography variant="body2" component="div" sx={{marginBottom: '16px'}}>
                            Accepted requests automatically turn into
                            <Link to="/incoming/jobs"> jobs</Link>.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', marginBottom: 2 }}>
                        {statusOptions.map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter.toLowerCase() === status.toLowerCase() ? 'contained' : 'outlined'}
                                onClick={() => setStatusFilter(status)}
                                sx={{ margin: 0.5, textTransform: 'none'}}
                            >
                                {status}
                            </Button>
                        ))}
                    </Box>

                    <Box style={{display: 'flex'}}>
                        <Box sx={{flexGrow: 1, marginRight: 2}}>
                            <Box>
                                {filteredRequests.length === 0 ? (
                                    <Typography variant="body1">
                                        You don't have any incoming request {statusFilter === 'ALL REQUESTS' || statusFilter === ''? '' : (
                                        <span> with status <span style={{ fontStyle: 'italic' }}>{statusFilter.toLowerCase()}</span></span>
                                    )}.
                                    </Typography>                                ) : (
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
                                                {filteredRequests.map((request) => (
                                                    <GenericTableRow key={request._id} item={request}
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
                        {showMediaCard && selectedRequest && (
                            <div style={{position: 'relative', flexShrink: 0, width: 400, marginLeft: 2}}>
                                <GenericProviderCard item={selectedRequest}
                                                     onClose={() => setShowMediaCard(false)}
                                                     provider={selectedRequest.provider}
                                                     receiver={selectedRequest.requestedBy}
                                                     inDetailPage={false}
                                                     actions={{
                                                         accept: onAccept,
                                                         decline: onDecline,
                                                         cancelRequest: onCancel,
                                                         changeTime: () => setTimeChangePopUp(true)
                                                     }}/>
                            </div>
                        )}
                    </Box>
                </Box>
            </div>
        </div>
    );
}
