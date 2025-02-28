import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Job} from '../../models/Job';

import GenericProviderCard from '../../components/tableComponents/GenericProviderCard';
import {ServiceRequest} from '../../models/ServiceRequest';
import {useAuth} from "../../contexts/AuthContext";
import {useEffect, useState} from "react";
import axios from "axios";
import {Link, useNavigate} from 'react-router-dom';
import {handleComplete, handleRevoke, handleCancel} from "../../utils/jobHandler";
import useAlert from "../../hooks/useAlert";
import AlertCustomized from "../../components/AlertCustomized";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions, CircularProgress
} from "@mui/material";
import GenericTable from "../../components/tableComponents/GenericTable";

type Item = ServiceRequest | Job;

// jobs that a provider has accepted
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

    const statusOptions = ['All Statuses', 'Open', 'Completed', 'Cancelled'];
    const [statusFilter, setStatusFilter] = useState(['All Statuses']);
    const [serviceTypeFilter, setServiceTypeFilter] = useState(["All Types"]);

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [firstFetchReady, setFirstFetchReady] = useState<boolean>(false);


    useEffect(() => {
        if (!token) {
            navigate('/unauthorized');
        }
        if (token && account) {
            setIsLoading(true)
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


                    const response = await axios.get(`/api/jobs/provider/${account._id}?${params.toString()}`, {
                        headers: {Authorization: `Bearer ${token}`}
                    });

                    setJobs(response.data.data);
                    setTotal(response.data.total);
                } catch (error) {
                    setJobs([]);
                } finally {
                    setIsLoading(false)
                }
            };
            fetchJobs();
            setFirstFetchReady(true)// only flip once
        }
    }, [account, token, page, rowsPerPage, statusFilter, serviceTypeFilter]);

    if (isLoading && !firstFetchReady) {
        return (
            <Box mt={20} className="flex justify-center">
                <CircularProgress/>
            </Box>
        )
    }

    const handleToggleMediaCard = (job: Item | null) => {
        if (job && (job as Job).receiver === null) {
            setDialogOpen(true);
            return;
        }
        setSelectedJob(job as Job);
        setShowMediaCard(job !== null);
    };


    // actions to perform on the offered
    const onComplete = () => {
        if (!selectedJob) {
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
            return;
        }
        handleRevoke({
            selectedJob,
            jobs,
            setJobs,
            token,
            setShowMediaCard,
            triggerAlert,

        });
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
                    <Typography variant="h6" component="div" sx={{marginBottom: '10px'}}>
                        Offered Services (Jobs)
                    </Typography>
                    <Typography variant="body2" component="div" sx={{marginBottom: '16px'}}>
                        When you accept a request, it automatically turns into a job.
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
                                  isProvider={true}
                                  statusOptions={statusOptions}
                                  statusFilter={statusFilter}
                                  setStatusFilter={setStatusFilter}
                                  serviceTypeFilter={serviceTypeFilter}
                                  setServiceTypeFilter={setServiceTypeFilter}
                    />
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
                    <GenericProviderCard item={selectedJob}
                                         provider={selectedJob.provider}
                                         receiver={selectedJob.receiver}
                                         onClose={() => setShowMediaCard(false)}
                                         inDetailPage={false}
                                         actions={{
                                             complete: onComplete,
                                             cancelJob: onCancel,
                                             review: () => navigate(`/jobs/${selectedJob._id}`),
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
