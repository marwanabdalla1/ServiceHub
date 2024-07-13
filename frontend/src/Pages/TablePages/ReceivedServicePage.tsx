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
import { Job } from '../../models/Job';
import { RequestStatus, ServiceType, JobStatus } from '../../models/enums';

import GenericTableRow from '../../components/tableComponents/GenericTableRow';
import GenericConsumerCard from "../../components/tableComponents/GenericConsumerCard";
import { handleCancel, sortBookingItems } from "../../utils/jobHandler";

import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { now } from 'moment';
import { formatDateTime } from '../../utils/dateUtils';
import { ServiceRequest } from "../../models/ServiceRequest";
import GenericProviderCard from "../../components/tableComponents/GenericProviderCard";
import { Button, FormControl, InputLabel, MenuItem, Select, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import GenericTable from "../../components/tableComponents/GenericTable";

type Item = ServiceRequest | Job;

export default function ReceivedServiceTable() {
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
    const [jobs, setJobs] = React.useState<Job[]>([]);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const { token, account } = useAuth();
    const navigate = useNavigate();

    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const statusOptions = ['All Jobs', 'Open', 'Completed', 'Cancelled'];
    const [statusFilter, setStatusFilter] = useState('All Jobs');
    const [serviceTypeFilter, setServiceTypeFilter] = useState("ALL");

    useEffect(() => {
        if (token && account) {
            const fetchJobs = async () => {
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

                    const response = await axios.get(`/api/jobs/requester/${account._id}?${params.toString()}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    setJobs(response.data.data);
                    setTotal(response.data.total);
                } catch (error) {
                    console.error('Failed to fetch service requests:', error);
                    setJobs([]);
                }
            };

            fetchJobs();
        }
    }, [account, token, page, rowsPerPage, statusFilter, serviceTypeFilter]);

    const handleToggleMediaCard = (job: Item | null) => {
        if (job && ((job as Job).provider === null || (job as Job).serviceOffering === null)) {
            setDialogOpen(true);
            return;
        }
        setSelectedJob(job as Job);
        setShowMediaCard(job !== null);
    };

    const handleChangeServiceType = (event: any) => {
        setServiceTypeFilter(event.target.value);
    };

    const handleChangeStatus = (event: any) => {
        setStatusFilter(event.target.value);
    };

    const onCancel = () => {
        if (!selectedJob) {
            console.error('No job selected');
            return;
        }
        handleCancel({
            selectedJob,
            jobs,
            setJobs,
            token,
            account,
            setShowMediaCard,
        });
    };

    const handleReview = (job: Item) => {
        navigate(`/customer_review/${job._id}`);
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
                            Services (Jobs) Received
                        </Typography>
                        <Typography variant="body2" component="div" sx={{ marginBottom: '16px' }}>
                            Here are all the services you've received from a provider.
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
                                {jobs.length === 0 ? (
                                    <Typography variant="body1">
                                        You haven't booked any job{statusFilter === 'All Jobs' || statusFilter === '' ? '' : (
                                            <span> with status <span style={{ fontStyle: 'italic' }}>{statusFilter.toLowerCase()}</span></span>
                                        )}
                                        {serviceTypeFilter === 'ALL' || serviceTypeFilter === '' ? '' : (
                                            <span> for service type <span
                                                style={{ fontStyle: 'italic' }}>{serviceTypeFilter.toLowerCase()}</span></span>
                                        )} yet.
                                    </Typography>
                                ) : (
                                    <GenericTable data={jobs}
                                        count={total}
                                        page={page}
                                        setPage={setPage}
                                        rowsPerPage={rowsPerPage}
                                        setRowsPerPage={setRowsPerPage}
                                        setShowMediaCard={setShowMediaCard}
                                        onViewDetails={handleToggleMediaCard} />

                                )}
                            </Box>
                        </Box>
                        {showMediaCard && selectedJob && (
                            <div style={{ position: 'relative', flexShrink: 0, width: 400, marginLeft: 2 }}>
                                <GenericConsumerCard item={selectedJob}
                                    provider={selectedJob.provider}
                                    receiver={selectedJob.receiver}
                                    onClose={() => setShowMediaCard(false)}
                                    inDetailPage={false}
                                    actions={{
                                        cancelJob: onCancel,
                                        review: () => handleReview(selectedJob),
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
