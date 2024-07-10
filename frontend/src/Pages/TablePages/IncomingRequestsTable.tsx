import React, {useState} from 'react';
import CardContent from '@mui/material/Box';
import {
    Dialog,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,
    TextField,
    Select,
    FormControl, InputLabel, MenuItem, Container
} from '@mui/material';

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
import {TablePagination} from '@mui/material';


import {
    handleAccept,
    handleDecline,
    handleCancel,
    handleTimeChange,
} from '../../utils/requestHandler';
import {sortBookingItems} from "../../utils/jobHandler";
import GenericTable from "../../components/tableComponents/GenericTable";  // Adjust the path as necessary



type Item = ServiceRequest | Job;

export default function IncomingRequestTable() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedRequest, setSelectedRequest] = React.useState<ServiceRequest | null>(null);
    const [serviceRequests, setServiceRequests] = React.useState<ServiceRequest[]>([]);
    const [comment, setComment] = useState('');
    const [total, setTotal] = useState(0);

    const {token, account} = useAuth();
    const [timeChangePopUp, setTimeChangePopUp] = useState(false);
    const navigate = useNavigate();


    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const serviceTypeOptions = Object.keys(ServiceType)
    const statusOptions = ['All Requests', 'Pending', 'Action Needed from Requester', 'Accepted', 'Cancelled', 'Declined'];
    const [statusFilter, setStatusFilter] = useState('All Requests');
    const [serviceTypeFilter, setServiceTypeFilter] = useState("ALL");

    useEffect(() => {
        console.log(token)
        if (token && account) {

            const fetchServiceRequests = async () => {
                try {
                    const params = new URLSearchParams({
                        page: (page + 1).toString(), // API is zero-indexed, React state is zero-indexed
                        limit: rowsPerPage.toString(),
                    });
                    if (statusFilter !== 'All Requests') {
                        params.append('requestStatus', statusFilter.toLowerCase());
                    }

                    if (serviceTypeFilter !== 'ALL') {
                        params.append('serviceType', serviceTypeFilter); // Ensure this matches the actual enum/case used in your database
                    }

                    console.log(params)

                    const response = await axios.get(`/api/requests/provider/${account._id}?${params.toString()}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    console.log("fetched service requests,", response)
                    setServiceRequests(response.data.data);
                    setTotal(response.data.total);
                } catch (error) {
                    console.error('Failed to fetch service requests:', error);
                    setServiceRequests([]);
                }
            };

            fetchServiceRequests();


            // console.log("this is the logged in account in request table:", account)
            // // setLoading(true);
            // // get all requests instead of only incoming ones
            // axios.get<ServiceRequest[]>(`/api/requests/provider/${account._id}`, {
            //     headers: {Authorization: `Bearer ${token}`}
            // })
            //     .then(response => {
            //
            //         console.log("getting requests ...", response.data)
            //         const sortedData = sortBookingItems(response.data);
            //         setServiceRequests(sortedData as ServiceRequest[]);
            //         // setLoading(false);
            //     })
            //     .catch(error => {
            //         console.error('Failed to fetch service requests:', error);
            //         setServiceRequests([]);
            //         // setError('Failed to load service requests');
            //         // setLoading(false);
            //     });
        }
    }, [token, account, page, rowsPerPage, statusFilter, serviceTypeFilter]);

    const handleChangeServiceType = (event: any) => {
        setServiceTypeFilter(event.target.value);
    };

    const handleChangeStatus = (event: any) => {
        setStatusFilter(event.target.value);
    };

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

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ): void => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ): void => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset page to zero after row change
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
            <div style={{flex: 1, padding: '10px'}}>
                <Box sx={{minWidth: 275, margin: 2}}>
                    <Box>
                        {/*<Breadcrumbs separator={<NavigateNextIcon fontSize="small"/>} aria-label="breadcrumb"*/}
                        {/*             sx={{marginBottom: '16px'}}>*/}
                        {/*    <Typography color="textPrimary">Incoming Requests</Typography>*/}
                        {/*</Breadcrumbs>*/}
                        <Typography variant="h6" component="div" sx={{marginBottom: '10px'}}>
                            Incoming Requests
                        </Typography>
                        <Typography variant="body2" component="div" sx={{marginBottom: '16px'}}>
                            Hint: Accepted requests automatically turn into
                            <Link to="/incoming/jobs"> jobs</Link>.
                        </Typography>
                    </Box>

                    <Box sx={{display: 'flex', marginBottom: 2}}>
                        <FormControl style={{ width: 300, marginRight:5}}>
                            <InputLabel id="service-type-label">Filter Service Type</InputLabel>
                            <Select
                                labelId="service-type-label"
                                id="service-type-select"
                                value={serviceTypeFilter}
                                label="Filter Service Type"
                                onChange={handleChangeServiceType}
                                fullWidth
                            >
                                <MenuItem value="ALL">All</MenuItem>
                                {Object.values(ServiceType).map(type => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl style={{ width: 300 }}>
                            <InputLabel id="service-type-label">Request Status</InputLabel>
                            <Select
                                labelId="request-status-label"
                                id="request-status-select"
                                value={statusFilter}
                                label="Request Status"
                                onChange={handleChangeStatus}
                                fullWidth
                            >
                                {Object.values(statusOptions).map(type => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/*{statusOptions.map((status) => (*/}
                        {/*    <Button*/}
                        {/*        key={status}*/}
                        {/*        variant={statusFilter.toLowerCase() === status.toLowerCase() ? 'contained' : 'outlined'}*/}
                        {/*        onClick={() => setStatusFilter(status)}*/}
                        {/*        sx={{margin: 0.5, textTransform: 'none'}}*/}
                        {/*    >*/}
                        {/*        {status}*/}
                        {/*    </Button>*/}
                        {/*))}*/}
                    </Box>

                    <Box style={{display: 'flex'}}>
                        <Box sx={{flexGrow: 1, marginRight: 2}}>
                            <Box>
                                {serviceRequests.length === 0 ? (
                                    <Typography variant="body1">
                                        You don't have any incoming
                                        request
                                        {statusFilter === 'All Requests' || statusFilter === '' ? '' : (
                                        <span> with status <span
                                            style={{fontStyle: 'italic'}}>{statusFilter.toLowerCase()}</span></span>
                                    )}
                                        {serviceTypeFilter === 'ALL' || serviceTypeFilter === '' ? '' : (
                                            <span> for service type <span
                                                style={{fontStyle: 'italic'}}>{serviceTypeFilter.toLowerCase()}</span></span>
                                        )}.
                                    </Typography>) : (
                                    <GenericTable data={serviceRequests}
                                                  count={total}
                                                  page={page}
                                                  setPage={setPage}
                                                  rowsPerPage={rowsPerPage}
                                                  setRowsPerPage={setRowsPerPage}
                                                  setShowMediaCard={setShowMediaCard}
                                                  onViewDetails={handleToggleMediaCard}
                                    />

                                )}
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
