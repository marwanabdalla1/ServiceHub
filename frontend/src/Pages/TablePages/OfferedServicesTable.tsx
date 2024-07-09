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

import GenericProviderCard from '../../components/tableComponents/GenericProviderCard'
import GenericTableRow from '../../components/tableComponents/GenericTableRow'


import {ServiceRequest} from '../../models/ServiceRequest';
import {useAuth} from "../../contexts/AuthContext";
import {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import {now} from 'moment';
import {formatDateTime} from '../../utils/dateUtils';
import {handleComplete, handleRevoke, handleCancel, sortBookingItems} from "../../utils/jobHandler";
import useAlert from "../../hooks/useAlert";
import AlertCustomized from "../../components/AlertCustomized";
import {Button} from "@mui/material";

type Item = ServiceRequest | Job;

export default function OfferedServicesTable() {
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
    const [jobs, setJobs] = React.useState<Job[]>([]);
    const {token, account} = useAuth();


    const {alert, triggerAlert, closeAlert} = useAlert(10000000);

    const statusOptions = ['ALL JOBS', 'Open', 'Completed', 'Cancelled'];
    const [statusFilter, setStatusFilter] = useState('ALL JOBS');

    const filteredJobs = jobs.filter((job) =>
        statusFilter === 'ALL JOBS' || statusFilter === '' ? true : job.status === statusFilter.toLowerCase()
    );


    const navigate = useNavigate();

    // todo: this probably can be combined/reused along with the request history table
    useEffect(() => {
        if (token && account) {
            // console.log("this is the logged in account in request table:", account)
            // setLoading(true);
            axios.get<Job[]>(`/api/jobs/provider/${account._id}`, {
                headers: {Authorization: `Bearer ${token}`}
            })
                .then(response => {
                    console.log("getting requests ...", response.data)
                    const sortedData = sortBookingItems(response.data);
                    setJobs(sortedData as Job[]);
                    // setLoading(false);
                })
                .catch(error => {
                    console.error('Failed to fetch service requests:', error);
                    setJobs([]);
                    // setError('Failed to load service requests');
                    // setLoading(false);
                });


        }
    }, [account?._id]);

    const handleToggleMediaCard = (job: Item | null) => {
        setSelectedJob(job as Job);
        setShowMediaCard(job !== null);
    };


    // handle completing the job
    const onComplete = () => {
        if (!selectedJob) {
            console.error('No request selected');
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

    // handle revoking completed job
    const onRevoke = () => {
        if (!selectedJob) {
            console.error('No request selected');
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


    // handle cancelling
    const onCancel = () => {
        if (!selectedJob) {
            console.error('No request selected');
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
    return (
        <div style={{display: 'flex'}}>
            <div style={{flex: 1, padding: '20px'}}>
                <div>
                    {/*<button onClick={handleAction}>Do Something</button>*/}
                    <AlertCustomized alert={alert} closeAlert={closeAlert}/>
                </div>

                <Box sx={{minWidth: 275, margin: 2}}>
                    <Box>
                        {/*todo: maybe breadcrumbs*/}
                        {/*<Breadcrumbs separator={<NavigateNextIcon fontSize="small"/>} aria-label="breadcrumb"*/}
                        {/*             sx={{marginBottom: '16px'}}>*/}
                        {/*    /!*<Link color="inherit" href="/frontend/public" underline="hover">*!/*/}
                        {/*    /!*    Offered Services (Jobs)*!/*/}
                        {/*    /!*</Link>*!/*/}
                        {/*</Breadcrumbs>*/}
                        <Typography variant="h6" component="div" sx={{marginBottom: '16px'}}>
                            Offered Services (Jobs)
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', marginBottom: 2 }}>
                        {statusOptions.map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter.toLowerCase() === status.toLowerCase() ? 'contained' : 'outlined'}
                                onClick={() => setStatusFilter(status)}
                                sx={{ margin: 0.5, textTransform: 'none' }}
                            >
                                {status}
                            </Button>
                        ))}
                    </Box>

                    <Box style={{display: 'flex'}}>
                        <Box sx={{flexGrow: 1, marginRight: 2}}>
                            <Box>
                                {filteredJobs.length === 0 ? (
                                    <Typography variant="body1">
                                        You don't have any incoming jobs
                                        {statusFilter === 'ALL JOBS' || statusFilter === ''? '' : (
                                            <span> with status <span style={{ fontStyle: 'italic' }}>{statusFilter.toLowerCase()}</span></span>
                                        )}.                                    </Typography>
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
                                                {filteredJobs.map((job) => (
                                                    <GenericTableRow key={job._id} item={job}
                                                                     onViewDetails={handleToggleMediaCard}/>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>)}
                            </Box>
                        </Box>
                        {showMediaCard && selectedJob && (
                            <div style={{position: 'relative', flexShrink: 0, width: 400, marginLeft: 2}}>
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
                    </Box>
                </Box>
            </div>
        </div>
    );
}
