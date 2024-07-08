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
import Link from '@mui/material/Link';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {Job} from '../../models/Job';

import GenericProviderCard from '../../components/tableComponents/generic/GenericProviderCard'
import GenericTableRow from '../../components/tableComponents/generic/GenericTableRow'


import {Account} from '../../models/Account';
import {Timeslot} from '../../models/Timeslot';
import {ServiceRequest} from '../../models/ServiceRequest';
import {RequestStatus, ServiceType, JobStatus} from '../../models/enums';
import {ServiceOffering} from "../../models/ServiceOffering";
import {useAuth} from "../../contexts/AuthContext";
import {useEffect} from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import {now} from 'moment';
import {formatDateTime} from '../../utils/dateUtils';
import {handleComplete, handleRevoke, handleCancel} from "../../utils/jobHandler";
import useAlert from "../../hooks/useAlert";

type Item = ServiceRequest | Job;

export default function OfferedServicesTable() {
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
    const [jobs, setJobs] = React.useState<Job[]>([]);
    const {token, account} = useAuth();


    const { alert, triggerAlert, closeAlert } = useAlert(10000000);


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
                    setJobs(response.data);
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
        <Box sx={{minWidth: 275, margin: 2}}>
            <Box>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small"/>} aria-label="breadcrumb"
                             sx={{marginBottom: '16px'}}>
                    <Link color="inherit" href="/frontend/public" underline="hover">
                        Offered Services
                    </Link>
                </Breadcrumbs>
                <Typography variant="h6" component="div" sx={{marginBottom: '16px'}}>
                    Offered Services
                </Typography>
            </Box>
            <Box style={{display: 'flex'}}>
                <Box sx={{flexGrow: 1, marginRight: 2}}>
                    <Box>
                        {jobs.length === 0 ? (
                            <Typography variant="body1">No jobs received.</Typography>
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
                                        {jobs.map((job) => (
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
    );
}
