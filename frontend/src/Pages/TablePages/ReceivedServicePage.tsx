import * as React from 'react';
import Box from '@mui/material/Box';

import Typography from '@mui/material/Typography';

import {Job} from '../../models/Job';

import GenericConsumerCard from "../../components/tableComponents/GenericConsumerCard";
import {handleCancel} from "../../utils/jobHandler";

import {useAuth} from "../../contexts/AuthContext";
import {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import {ServiceRequest} from "../../models/ServiceRequest";
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

// jobs that a consumer receives
export default function ReceivedServiceTable() {
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
    const [jobs, setJobs] = React.useState<Job[]>([]);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const {token, account} = useAuth();
    const navigate = useNavigate();

    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const statusOptions = ['All Statuses', 'Open', 'Completed', 'Cancelled'];
    const [statusFilter, setStatusFilter] = useState(['All Statuses']);
    const [serviceTypeFilter, setServiceTypeFilter] = useState(["All Types"]);

    const {alert, triggerAlert, closeAlert} = useAlert(10000000);


    useEffect(() => {
        if (token && account) {
            const fetchJobs = async () => {
                try {
                    const params = new URLSearchParams({
                        page: (page + 1).toString(),
                        limit: rowsPerPage.toString(),
                    });
                    if (statusFilter.length > 0 && !statusFilter.includes('All Statuses')) {
                        statusFilter.forEach(type => {
                            params.append('status', type.toLowerCase());
                        });
                    }


                    // Handling multiple service type filters
                    if (serviceTypeFilter.length > 0 && !serviceTypeFilter.includes('All Types')) {
                        serviceTypeFilter.forEach(type => {
                            params.append('serviceType', type);
                        });
                    }
                    const response = await axios.get(`/api/jobs/requester/${account._id}?${params.toString()}`, {
                        headers: {Authorization: `Bearer ${token}`}
                    });

                    setJobs(response.data.data);
                    setTotal(response.data.total);
                } catch (error) {
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


    const onCancel = () => {
        if (!selectedJob) {
            return;
        }
        handleCancel({
            selectedJob,
            jobs,
            setJobs,
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
                        <Typography variant="h6" component="div" sx={{marginBottom: '16px'}}>
                            Services (Jobs) Received
                        </Typography>
                        <Typography variant="body2" component="div" sx={{marginBottom: '16px'}}>
                            When the provider accepts a request, it is automatically turned into a job. Here are all the
                            services (jobs) you've received.
                        </Typography>
                    </Box>

                    <Box style={{flex: showMediaCard ? '3 1 auto' : '1 1 0%', marginRight: showMediaCard ? '30%' : '5%'}}>

                        <GenericTable data={jobs}
                                      count={total}
                                      page={page}
                                      setPage={setPage}
                                      rowsPerPage={rowsPerPage}
                                      setRowsPerPage={setRowsPerPage}
                                      setShowMediaCard={setShowMediaCard}
                                      onViewDetails={handleToggleMediaCard}
                                      statusOptions={statusOptions}
                                      statusFilter={statusFilter}
                                      setStatusFilter={setStatusFilter}
                                      serviceTypeFilter={serviceTypeFilter}
                                      setServiceTypeFilter={setServiceTypeFilter}
                                      isProvider={false}/>


                    </Box>
                </Box>
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
                    <GenericConsumerCard item={selectedJob}
                                         provider={selectedJob.provider}
                                         receiver={selectedJob.receiver}
                                         onClose={() => setShowMediaCard(false)}
                                         inDetailPage={false}
                                         actions={{
                                             cancelJob: onCancel,
                                             review: () => navigate(`/jobs/${selectedJob._id}`),
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
