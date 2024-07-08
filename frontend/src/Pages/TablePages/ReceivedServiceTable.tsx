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

import GenericTableRow from '../../components/tableComponents/generic/GenericTableRow'
import GenericConsumerCard from "../../components/tableComponents/generic/GenericConsumerCard";
import {handleCancel} from "../../utils/jobHandler";


import {useAuth} from "../../contexts/AuthContext";
import {useEffect} from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import {now} from 'moment';
import {formatDateTime} from '../../utils/dateUtils';
import {ServiceRequest} from "../../models/ServiceRequest";
import GenericProviderCard from "../../components/tableComponents/generic/GenericProviderCard";


type Item = ServiceRequest | Job;

export default function ReceivedServiceTable() {
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
    const [jobs, setJobs] = React.useState<Job[]>([]);
    const {token, account} = useAuth();
    const navigate = useNavigate();


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
                            Received Services
                        </Typography>
                    </Box>
                    <Box style={{display: 'flex'}}>
                        <Box sx={{flexGrow: 1, marginRight: 2}}>
                            <Box>
                                {jobs.length === 0 ? (
                                    <Typography variant="body1">You haven't booked anything yet.</Typography>
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
                                                {jobs.map((receivedService) => (
                                                    <GenericTableRow key={receivedService._id} item={receivedService}
                                                                     onViewDetails={handleToggleMediaCard}/>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>)}
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
