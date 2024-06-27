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
import MediaCard from './OfferedServiceCard';
import { Job } from '../models/Job';
//import JobRow from './JobRow';
import OfferedServiceRows from './OfferedServiceRow';
import { Account } from '../models/Account';
import account from '../models/Account';
import { Timeslot } from '../models/Timeslot';
import { ServiceRequest } from '../models/ServiceRequest';
import { RequestStatus, ServiceType, JobStatus } from '../models/enums';
import {ServiceOffering} from "../models/ServiceOffering";
import {useAuth} from "../contexts/AuthContext";
import {useEffect} from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { now } from 'moment';
import OfferedServiceRow from './OfferedServiceRow';


export default function OfferedServicesTable() {
  const [showMediaCard, setShowMediaCard] = React.useState(false);
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const {token, account} = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = React.useState<Account | null>(null);
  const [receiver, setReceiver] = React.useState<Account | null>(null);

  // todo: this probably can be combined/reused along with the request history table
  useEffect(() => {
    if (token && account) {
      // console.log("this is the logged in account in request table:", account)
      // setLoading(true);
      axios.get<Job[]>(`/api/jobs/provider/${account._id}`, {
        headers: {Authorization: `Bearer ${token}` }
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

  const handleToggleMediaCard = (job: Job | null) => {
    setSelectedJob(job);
    setShowMediaCard(job !== null);
  };

  useEffect(() => {
    if (selectedJob) {
      fetchProvider(selectedJob.provider);
      fetchReceiver(selectedJob.receiver);
    }
  }, [selectedJob, token]);

  const fetchProvider = (providerId: Account) => {
    axios.get<Account>(`/api/account/providers/${providerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setProvider(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch provider:', error);
        setProvider(null);
      });
  };

  const fetchReceiver = (receiverId: Account) => {
    axios.get<Account>(`/api/account/providers/${receiverId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setReceiver(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch receiver:', error);
        setReceiver(null);
      });
  };

  // handle completing the job
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
          status: JobStatus.completed,
        };
        console.log("selected request id:" , selectedJob?._id, updateJobData)
        const updateJob = await axios.put(`/api/jobs/${selectedJob?._id}`, updateJobData, {
          headers: {Authorization: `Bearer ${token}` }
        });
        console.log('Job Updated:', updateJob.data);
        console.log("jobs: " + jobs[0]);
        // Update local state to reflect these changes
        const updatedJobs = jobs.map(job => {
          if (job._id === selectedJob._id) {
            return { ...job, ...updateJobData };
          }
          return job;
        });

        setJobs(updatedJobs);
        
        setShowMediaCard(false);
     } catch (error) {
      console.error('Error completing job:', error);
    }



  };

  // handle revoking completed job
  const handleRevoke =  async() => {
 

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
          status: JobStatus.open,
        };
        console.log("selected request id:" , selectedJob?._id, updateJobData)
        const updateJob = await axios.put(`/api/jobs/${selectedJob?._id}`, updateJobData, {
          headers: {Authorization: `Bearer ${token}` }
        });
        console.log('Job Updated:', updateJob.data);
        // Update local state to reflect these changes
        const updatedJobs = jobs.map(job => {
          if (job._id === selectedJob._id) {
            return { ...job, ...updateJobData };
          }
          return job;
        });

        setJobs(updatedJobs);
        
        setShowMediaCard(false);
     } catch (error) {
      console.error('Error completing job:', error);
    }



  };

  //   todo: for completed jobs: revoke the completion!

  return (
    <Box sx={{ minWidth: 275, margin: 2 }}>
      <Box>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ marginBottom: '16px' }}>
          <Link color="inherit" href="/" underline="hover">
            Offered Services
          </Link>
        </Breadcrumbs>
        <Typography variant="h6" component="div" sx={{ marginBottom: '16px' }}>
          Offered Services
        </Typography>
      </Box>
      <Box style={{ display: 'flex' }}>
        <Box sx={{ flexGrow: 1, marginRight: 2 }}>
          <Box>
            <TableContainer component={Paper} sx={{ overflow: 'auto' }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
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
                    <OfferedServiceRow key={job._id} offeredService={job} onViewDetails={handleToggleMediaCard} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
        {showMediaCard && selectedJob && (
          <div style={{ position: 'relative', flexShrink: 0, width: 400, marginLeft: 2 }}>
            <MediaCard offeredService={selectedJob}
                      provider={provider}
                      receiver={receiver}
                       onClose={() => setShowMediaCard(false)}
                       onComplete={handleComplete}
                       onCancel = {() => console.log("job cancelled")}
                       onReview={() => navigate("/customer_review")}
                      onRevoke={handleRevoke}
            />
          </div>
        )}
      </Box>
    </Box>
  );
}
