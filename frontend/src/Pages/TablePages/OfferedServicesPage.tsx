import * as React from 'react';
import Box from '@mui/material/Box'; // Changed import
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import {Job} from '../../models/Job';

import GenericProviderCard from '../../components/tableComponents/GenericProviderCard';
import GenericTableRow from '../../components/tableComponents/GenericTableRow';

import {ServiceRequest} from '../../models/ServiceRequest';
import {useAuth} from "../../contexts/AuthContext";
import {useEffect, useState} from "react";
import axios from "axios";
import {Link, useNavigate} from 'react-router-dom';
import {now} from 'moment';
import {formatDateTime} from '../../utils/dateUtils';
import {handleComplete, handleRevoke, handleCancel} from "../../utils/jobHandler";
import useAlert from "../../hooks/useAlert";
import AlertCustomized from "../../components/AlertCustomized";
import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from "@mui/material";
import GenericTable from "../../components/tableComponents/GenericTable";
import {ServiceType} from "../../models/enums";

type Item = ServiceRequest | Job;

export default function OfferedServicesTable() {
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
    const [jobs, setJobs] = React.useState<Job[]>([]);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const {token, account} = useAuth();

    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const {alert, triggerAlert, closeAlert} = useAlert(10000000);

    const statusOptions = ['All Jobs', 'Open', 'Completed', 'Cancelled'];
    const [statusFilter, setStatusFilter] = useState('All Jobs');
    const [serviceTypeFilter, setServiceTypeFilter] = useState("ALL");

    const navigate = useNavigate();

    useEffect(() => {
        if (token && account) {

            const fetchJobs = async () => {
                try {
                    const params = new URLSearchParams({
                        page: (page + 1).toString(),
                        limit: rowsPerPage.toString(),
                    });
                    if (statusFilter !== 'All Jobs') {
                        params.append('status', statusFilter.toLowerCase());
                    }
                    if (serviceTypeFilter !== 'ALL') {
                        params.append('serviceType', serviceTypeFilter);
                    }

                    const response = await axios.get(`/api/jobs/provider/${account._id}?${params.toString()}`, {
                        headers: {Authorization: `Bearer ${token}`}
                    });

                    setJobs(response.data.data);
                    setTotal(response.data.total);
                } catch (error) {
                    console.error('Failed to fetch service jobs:', error);
                    setJobs([]);
                }
            };

            fetchJobs();
        }
    }, [account, token, page, rowsPerPage, statusFilter, serviceTypeFilter]);

    const handleToggleMediaCard = (job: Item | null) => {
        if (job && (job as Job).receiver === null) {
            setDialogOpen(true);
            return;
        }
        setSelectedJob(job as Job);
        setShowMediaCard(job !== null);
    };

    const handleChangeServiceType = (event: any) => {
        setServiceTypeFilter(event.target.value);
        setPage(0);
    };

    const handleChangeStatus = (event: any) => {
        setStatusFilter(event.target.value);
        setPage(0);
    };

    const onComplete = () => {
        if (!selectedJob) {
            console.error('No job selected');
            return;
        }
        handleComplete({
            selectedJob,
            jobs,
            setJobs,
            token,
            setShowMediaCard,
            triggerAlert,
        });
    };

    const onRevoke = () => {
        if (!selectedJob) {
            console.error('No job selected');
            return;
        }
        handleRevoke({
            selectedJob,
            jobs,
            setJobs,
            token,
            setShowMediaCard,
        });
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

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    return (
        <div style={{display: 'flex', flexDirection: 'row', width: '100%', position: 'relative'}}>
            <div style={{flex: showMediaCard ? '3 1 auto' : '1 1 0%', marginRight: showMediaCard ? '30%' : '5%'}}>
                <AlertCustomized alert={alert} closeAlert={closeAlert}/>

                <Box sx={{minWidth: 275, margin: 2}}>
                    <Box>
                        <Typography variant="h6" component="div" sx={{marginBottom: '10px'}}>
                            Offered Services (Jobs)
                        </Typography>
                        <Typography variant="body2" component="div" sx={{marginBottom: '16px'}}>
                            When you accept a request, it automatically turns into a job.
                        </Typography>
                    </Box>
                    <Box sx={{display: 'flex', marginBottom: 2}}>
                        <FormControl style={{width: 300, marginRight: 5}}>
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

                        <FormControl style={{width: 300}}>
                            <InputLabel id="job-status-label">Job Status</InputLabel>
                            <Select
                                labelId="job-status-label"
                                id="job-status-select"
                                value={statusFilter}
                                label="Job Status"
                                onChange={handleChangeStatus}
                                fullWidth
                            >
                                {Object.values(statusOptions).map(type => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box style={{display: 'flex'}}>
                        <Box sx={{flexGrow: 1, marginRight: 2}}>
                            <Box>
                                {jobs.length === 0 ? (
                                    <Typography variant="body1">
                                        You don't have any incoming jobs
                                        {statusFilter === 'All Jobs' || statusFilter === '' ? '' : (
                                            <span> with status <span
                                                style={{fontStyle: 'italic'}}>{statusFilter.toLowerCase()}</span></span>
                                        )}
                                        {serviceTypeFilter === 'ALL' || serviceTypeFilter === '' ? '' : (
                                            <span> for service type <span
                                                style={{fontStyle: 'italic'}}>{serviceTypeFilter.toLowerCase()}</span></span>
                                        )}.
                                    </Typography>
                                ) : (
                                    <GenericTable data={jobs}
                                                  count={total}
                                                  page={page}
                                                  setPage={setPage}
                                                  rowsPerPage={rowsPerPage}
                                                  setRowsPerPage={setRowsPerPage}
                                                  setShowMediaCard={setShowMediaCard}
                                                  onViewDetails={handleToggleMediaCard}
                                                  isProvider={true}/>

                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </div>
            {showMediaCard && selectedJob && (
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
                    <GenericProviderCard item={selectedJob}
                                         provider={selectedJob.provider}
                                         receiver={selectedJob.receiver}
                                         onClose={() => setShowMediaCard(false)}
                                         inDetailPage={false}
                                         actions={{
                                             complete: onComplete,
                                             cancelJob: onCancel,
                                             review: () => navigate(`/customer_review/${selectedJob._id}`),
                                             revoke: onRevoke
                                         }}
                    />
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
