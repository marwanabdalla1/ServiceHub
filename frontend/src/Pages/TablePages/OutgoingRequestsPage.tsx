import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { ServiceRequest } from '../../models/ServiceRequest';

import GenericProviderCard from '../../components/tableComponents/GenericProviderCard';
import GenericTableRow from '../../components/tableComponents/GenericTableRow';

import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { formatDateTime } from '../../utils/dateUtils';
import { handleCancel } from "../../utils/requestHandler";
import GenericConsumerCard from "../../components/tableComponents/GenericConsumerCard";
import { Job } from "../../models/Job";
import { Button, FormControl, InputLabel, MenuItem, Select, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { sortBookingItems } from "../../utils/jobHandler";
import GenericTable from "../../components/tableComponents/GenericTable";
import { ServiceType } from "../../models/enums";

type Item = ServiceRequest | Job;

export default function RequestHistoryTable() {
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedRequest, setSelectedRequest] = React.useState<ServiceRequest | null>(null);
    const [serviceRequests, setServiceRequests] = React.useState<ServiceRequest[]>([]);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const { token, account } = useAuth();
    const [total, setTotal] = useState(0);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const statusOptions = ['All Requests', 'Pending', 'Action Needed from Requester', 'Accepted', 'Cancelled', 'Declined'];
    const [statusFilter, setStatusFilter] = useState('All Requests');

    const [serviceTypeFilter, setServiceTypeFilter] = useState("ALL");

    useEffect(() => {
        console.log(token)
        if (token && account) {
            const fetchServiceRequests = async () => {
                try {
                    const params = new URLSearchParams({
                        page: (page + 1).toString(),
                        limit: rowsPerPage.toString(),
                    });
                    if (statusFilter !== 'All Requests') {
                        params.append('requestStatus', statusFilter.toLowerCase());
                    }
                    if (serviceTypeFilter !== 'ALL') {
                        params.append('serviceType', serviceTypeFilter);
                    }

                    const response = await axios.get(`/api/requests/requester/${account._id}?${params.toString()}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    setServiceRequests(response.data.data);
                    setTotal(response.data.total);
                } catch (error) {
                    console.error('Failed to fetch service requests:', error);
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

    const handleChangeServiceType = (event: any) => {
        setServiceTypeFilter(event.target.value);
    };

    const handleChangeStatus = (event: any) => {
        setStatusFilter(event.target.value);
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

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, padding: '20px' }}>
                <Box sx={{ minWidth: 275, margin: 2 }}>
                    <Box>
                        <Typography variant="h6" component="div" sx={{ marginBottom: '16px' }}>
                            My Outgoing Requests
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', marginBottom: 2 }}>
                        <FormControl style={{ width: 300, marginRight: 5 }}>
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
                    </Box>

                    <Box style={{ display: 'flex' }}>
                        <Box sx={{ flexGrow: 1, marginRight: 2 }}>
                            <Box>
                                {serviceRequests.length === 0 ? (
                                    <Typography variant="body1">
                                        You don't have any requests{statusFilter === 'All Requests' || statusFilter === '' ? '' : (
                                            <span> with status <span style={{ fontStyle: 'italic' }}>{statusFilter.toLowerCase()}</span></span>
                                        )}
                                        {serviceTypeFilter === 'ALL' || serviceTypeFilter === '' ? '' : (
                                            <span> for service type <span
                                                style={{ fontStyle: 'italic' }}>{serviceTypeFilter.toLowerCase()}</span></span>
                                        )}
                                        yet.
                                    </Typography>
                                ) : (
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
                        {showMediaCard && selectedRequest && (
                            <div style={{ position: 'relative', flexShrink: 0, width: 400, marginLeft: 2 }}>
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
                    </Box>
                </Box>
            </div>

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
