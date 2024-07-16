import React, {useState} from 'react';
import {
    Dialog,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    Box,
    TextField,

} from '@mui/material';

import {Link} from 'react-router-dom'
import Typography from '@mui/material/Typography';
import {ServiceRequest} from '../../models/ServiceRequest';
import GenericProviderCard from '../../components/tableComponents/GenericProviderCard'
import {useEffect} from "react";
import {useAuth} from "../../contexts/AuthContext";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {Job} from "../../models/Job";
import {
    handleAccept,
    handleDecline,
    handleCancel,
    handleTimeChange,
} from '../../utils/requestHandler';
import GenericTable from "../../components/tableComponents/GenericTable";  // Adjust the path as necessary

import AlertCustomized from "../../components/AlertCustomized";
import useAlert from '../../hooks/useAlert';


type Item = ServiceRequest | Job;

export default function IncomingRequestTable() {
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedRequest, setSelectedRequest] = React.useState<ServiceRequest | null>(null);
    const [serviceRequests, setServiceRequests] = React.useState<ServiceRequest[]>([]);
    const [comment, setComment] = useState('');
    const [total, setTotal] = useState(0);

    const {token, account} = useAuth();
    const [timeChangePopUp, setTimeChangePopUp] = useState(false);
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const {alert, triggerAlert, closeAlert} = useAlert(10000000);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const statusOptions = ['All Statuses', 'Pending', 'Action Needed from Requester', 'Cancelled', 'Declined']; //exclude accepted
    const [statusFilter, setStatusFilter] = useState(['All Statuses']);
    const [serviceTypeFilter, setServiceTypeFilter] = useState(["All Types"]);


    useEffect(() => {
        console.log(token)
        if (token && account) {

            const fetchServiceRequests = async () => {
                try {
                    const params = new URLSearchParams({
                        page: (page + 1).toString(), // API is zero-indexed, React state is zero-indexed
                        limit: rowsPerPage.toString(),
                    });


                    if (statusFilter.length > 0 && !statusFilter.includes('All Statuses')) {
                        statusFilter.forEach(type => {
                            params.append('requestStatus', type.toLowerCase());
                        });
                    }


                    // Handling multiple service type filters
                    if (serviceTypeFilter.length > 0 && !serviceTypeFilter.includes('All Types')) {
                        serviceTypeFilter.forEach(type => {
                            params.append('serviceType', type);
                        });
                    }

                    console.log(params)

                    const response = await axios.get(`/api/requests/provider/${account._id}?${params.toString()}`, {
                        headers: {Authorization: `Bearer ${token}`}
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
        }
    }, [token, account, page, rowsPerPage, statusFilter, serviceTypeFilter]);


    const handleToggleMediaCard = (req: ServiceRequest | Item | null) => {
        console.log("Request:", req);
        console.log("showMediaCard now", showMediaCard);

        console.log("showMediaCard will be set to:", req !== null);

        if (req && (req as ServiceRequest).requestedBy === null) {
            setDialogOpen(true);
            return;
        }
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
    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    return (
        // <div style={{display: 'flex'}}>
        //     <div style={{flex: 1, padding: '10px'}}>
        <div style={{display: 'flex', flexDirection: 'row', width: '100%', position: 'relative'}}>
            {/*<div style={{flexGrow: showMediaCard ? 1 : 1, transition: 'flex-grow 0.3s', padding: '10px'}}>*/}
            {/*<div >*/}

                <AlertCustomized alert={alert} closeAlert={closeAlert}/>

                <Box sx={{minWidth: 275, margin: 2, width: '100%'}}>
                    <Box>
                        <Typography variant="h6" component="div" sx={{marginBottom: '10px'}}>
                            Incoming Requests
                        </Typography>
                        <Typography variant="body2" component="div" sx={{marginBottom: '18px'}}>
                            Hint: Accepted requests automatically turn into
                            <Link to="/incoming/jobs"> jobs</Link> and are thus not shown here.
                        </Typography>
                    </Box>

                    <Box style={{flex: showMediaCard ? '3 1 auto' : '1 1 0%', marginRight: showMediaCard ? '30%' : '5%'}}>
                        <GenericTable data={serviceRequests}
                                      count={total}
                                      page={page}
                                      setPage={setPage}
                                      rowsPerPage={rowsPerPage}
                                      setRowsPerPage={setRowsPerPage}
                                      setShowMediaCard={setShowMediaCard}
                                      onViewDetails={handleToggleMediaCard}
                                      isProvider={true}
                                      statusOptions={statusOptions}
                                      statusFilter={statusFilter}
                                      setStatusFilter={setStatusFilter}
                                      serviceTypeFilter={serviceTypeFilter}
                                      setServiceTypeFilter={setServiceTypeFilter}
                        />


                    </Box>
                </Box>
            {/*</div>*/}


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
                // <div style={{position: 'sticky', flexShrink: 0, width: 400, marginLeft: 'auto'}}>
                <div style={{
                    width: '25%',
                    flex: '1 0 25%',
                    position: 'fixed',
                    top: '20%',
                    right: '1%',
                    height: '80vh',
                    overflowY: 'auto',
                    padding: '5px',
                    boxSizing: 'border-box'
                }}>
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

            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Service Receiver Not Available</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        The service receiver is not available at the moment.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
