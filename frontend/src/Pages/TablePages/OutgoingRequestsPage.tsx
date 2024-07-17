import * as React from 'react';
import Box from '@mui/material/Box';

import Typography from '@mui/material/Typography';

import {Link as Routerlink} from 'react-router-dom'

import {ServiceRequest} from '../../models/ServiceRequest';
import axios from "axios";
import {useEffect, useState} from "react";
import {useAuth} from "../../contexts/AuthContext";
import {handleCancel} from "../../utils/requestHandler";
import GenericConsumerCard from "../../components/tableComponents/GenericConsumerCard";
import {Job} from "../../models/Job";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from "@mui/material";
import GenericTable from "../../components/tableComponents/GenericTable";
import useAlert from "../../hooks/useAlert";
import AlertCustomized from "../../components/AlertCustomized";

type Item = ServiceRequest | Job;

// requests that were sent as by the consumer
export default function RequestHistoryTable() {
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedRequest, setSelectedRequest] = React.useState<ServiceRequest | null>(null);
    const [serviceRequests, setServiceRequests] = React.useState<ServiceRequest[]>([]);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const {token, account} = useAuth();
    const [total, setTotal] = useState(0);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const {alert, triggerAlert, closeAlert} = useAlert(10000000);

    const statusOptions = ['All Statuses', 'Pending', 'Action Needed from Requester', 'Cancelled', 'Declined']; //exclude accepted
    const [statusFilter, setStatusFilter] = useState(['All Statuses']);
    const [serviceTypeFilter, setServiceTypeFilter] = useState(["All Types"]);

    useEffect(() => {
        if (token && account) {
            const fetchServiceRequests = async () => {
                try {
                    const params = new URLSearchParams({
                        page: (page + 1).toString(),
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

                    const response = await axios.get(`/api/requests/requester/${account._id}?${params.toString()}`, {
                        headers: {Authorization: `Bearer ${token}`}
                    });

                    setServiceRequests(response.data.data);
                    setTotal(response.data.total);
                } catch (error) {
                    setServiceRequests([]);
                }
            };

            fetchServiceRequests();
        }
    }, [account, token, page, rowsPerPage, statusFilter, serviceTypeFilter]);

    const handleToggleMediaCard = (req: Item | null) => {
        if (req && ((req as ServiceRequest).provider === null || (req as ServiceRequest).serviceOffering === null)) {
            setDialogOpen(true);
            return;
        }
        setSelectedRequest(req as ServiceRequest);
        setShowMediaCard(req !== null);

    };



    const onCancel = () => {
        if (!selectedRequest) {
            return;
        }
        handleCancel({
            selectedRequest,
            serviceRequests,
            setServiceRequests,
            token,
            account,
            setShowMediaCard,
            triggerAlert,
        });
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    return (
        <div style={{display: 'flex', flexDirection: 'row', width: '100%', position: 'relative'}}>
            <AlertCustomized alert={alert} closeAlert={closeAlert}/>
            <Box sx={{minWidth: 275, margin: 2, width: '100%'}}>
                    <Box>
                        <Typography variant="h6" component="div" sx={{marginBottom: '10px'}}>
                            My Outgoing Requests
                        </Typography>
                        <Typography variant="body2" component="div" sx={{marginBottom: '18px'}}>
                            Hint: Accepted requests automatically turn into
                            <Routerlink to="/outgoing/jobs"> jobs</Routerlink> and are not shown here.
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
                                      isProvider={false}
                                      statusOptions={statusOptions}
                                      statusFilter={statusFilter}
                                      setStatusFilter={setStatusFilter}
                                      serviceTypeFilter={serviceTypeFilter}
                                      setServiceTypeFilter={setServiceTypeFilter}
                        />


                    </Box>
                </Box>
            {showMediaCard && selectedRequest && (
                <div style={{
                    width: '25%',
                    flex: '1 0 25%',
                    position: 'fixed',
                    top: '20%',
                    right: '2%',
                    height: '80vh',
                    overflowY: 'auto',
                    padding: '5px',
                    boxSizing: 'border-box'
                }}>
                    <GenericConsumerCard item={selectedRequest}
                                         provider={selectedRequest.provider}
                                         receiver={selectedRequest.requestedBy}
                                         onClose={() => setShowMediaCard(false)}
                                         inDetailPage={false}
                                         actions={{
                                             cancelRequest: onCancel,
                                         }}
                    />
                </div>
            )}


            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Service Provider Not Available</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        The service provider is not available at the moment.
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
