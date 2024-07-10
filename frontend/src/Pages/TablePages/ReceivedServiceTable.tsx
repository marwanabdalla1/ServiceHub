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
// import MediaCard from './ReceivedServiceCard';
import {Job} from '../../models/Job';
// import ReceivedServiceRow from './ReceivedServiceRow';

import {RequestStatus, ServiceType, JobStatus} from '../../models/enums';

import GenericTableRow from '../../components/tableComponents/GenericTableRow'
import GenericConsumerCard from "../../components/tableComponents/GenericConsumerCard";
import {handleCancel, sortBookingItems} from "../../utils/jobHandler";


import {useAuth} from "../../contexts/AuthContext";
import {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import {now} from 'moment';
import {formatDateTime} from '../../utils/dateUtils';
import {ServiceRequest} from "../../models/ServiceRequest";
import GenericProviderCard from "../../components/tableComponents/GenericProviderCard";
import {Button} from "@mui/material";
import GenericTable from "../../components/tableComponents/GenericTable";


type Item = ServiceRequest | Job;

export default function ReceivedServiceTable() {
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
    const [jobs, setJobs] = React.useState<Job[]>([]);
    const {token, account} = useAuth();
    const navigate = useNavigate();

    const statusOptions = ['ALL JOBS', 'Open', 'Completed', 'Cancelled'];
    const [statusFilter, setStatusFilter] = useState('ALL JOBS');

    const filteredJobs = jobs.filter((job) =>
        statusFilter === 'ALL JOBS' || statusFilter === '' ? true : job.status === statusFilter.toLowerCase()
    );

    // todo: this probably can be combined/reused along with the request history table
    useEffect(() => {
        if (token && account) {
            // console.log("this is the logged in account in request table:", account)
            // setLoading(true);
            axios.get<Job[]>(`/api/jobs/requester/${account._id}`, {
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

    /*// handle completing the job
    const handleComplete =  async() => {


      if (!selectedJob) {
        console.error('No job selected');
        return;
      }
   //   sanity check: appointment time has to be in the past
      if (!selectedJob.appointmentEndTime || selectedJob.appointmentEndTime > new Date()){
          //TODO: add modal to let user know
          console.error('The job cannot be completed, since its appointment is in the future.');
          return;
      }

      try {

        // update the job
          const updateJobData = {
            jobStatus: JobStatus.completed,
          };
          console.log("selected request id:" , selectedJob?._id, updateJobData)
          const updateJob = await axios.put(`/api/jobs/${selectedJob?._id}`, updateJobData, {
            headers: {Authorization: `Bearer ${token}` }
          });
          console.log('Request Updated:', updateJob.data);

          console.log(updateJob);

          setReceivedServices(updateJob.data);
          setShowMediaCard(false);
       } catch (error) {
        console.error('Error completing job:', error);
      }



    };
   */
    // handle cancel the job
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



    return (
        <div style={{display: 'flex'}}>
            <div style={{flex: 1, padding: '20px'}}>
                <Box sx={{minWidth: 275, margin: 2}}>
                    <Box>
                        {/*<Breadcrumbs separator={<NavigateNextIcon fontSize="small"/>} aria-label="breadcrumb"*/}
                        {/*             sx={{marginBottom: '16px'}}>*/}
                        {/*    <Link color="inherit" href="/frontend/public" underline="hover">*/}
                        {/*        History*/}
                        {/*    </Link>*/}
                        {/*    <Typography color="textPrimary">Received Services</Typography>*/}
                        {/*</Breadcrumbs>*/}
                        <Typography variant="h6" component="div" sx={{marginBottom: '16px'}}>
                            Services (Jobs) Received
                        </Typography>
                        <Typography variant="body2" component="div" sx={{marginBottom: '16px'}}>
                            Here are all the services you've received from a provider.
                            {/*<Link to="/incoming/jobs"> jobs</Link>.*/}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', marginBottom: 2 }}>
                        {statusOptions.map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter.toLowerCase() === status.toLowerCase() ? 'contained' : 'outlined'}
                                onClick={() => setStatusFilter(status)}
                                sx={{ margin: 0.5, textTransform: 'none'}}
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
                                        You haven't booked any job {statusFilter === 'ALL JOBS' || statusFilter === ''? '' : (
                                        <span> with status <span style={{ fontStyle: 'italic' }}>{statusFilter.toLowerCase()}</span></span>
                                    )} yet.
                                    </Typography>
                                ) : (
                                    <GenericTable data={filteredJobs} />

                                )}
                            </Box>
                        </Box>
                        {showMediaCard && selectedJob && (
                            <div style={{position: 'relative', flexShrink: 0, width: 400, marginLeft: 2}}>
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
                                {/*<GenericConsumerCard receivedService={selectedJob}*/}
                                {/*          provider={selectedJob.provider}*/}
                                {/*          receiver={selectedJob.receiver}*/}
                                {/*           onClose={() => setShowMediaCard(false)}*/}
                                {/*           onCancel = {handleCancel}*/}
                                {/*           onReview={()=>navigate(`/customer_review/${selectedJob._id}`)}*/}
                                {/*/>*/}
                            </div>
                        )}
                    </Box>
                </Box>
            </div>
        </div>
    );
}
