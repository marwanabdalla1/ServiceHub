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
import { formatDateTime } from '../utils/dateUtils';


export default function OfferedServicesTable() {
  const [showMediaCard, setShowMediaCard] = React.useState(false);
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const {token, account} = useAuth();
  const navigate = useNavigate();
  const [providerAccount, setProviderAccount] = React.useState<Account | null>(null);
  const [receiverAccount, setReceiverAccount] = React.useState<Account | null>(null);

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
      console.log(selectedJob);
      fetchProvider(selectedJob.provider);
      fetchReceiver(selectedJob.receiver);
    }
  }, [selectedJob, token]);

  const fetchProvider = (p_provider: Account) => {
    console.log("Get provider name for ", p_provider);
    axios.get<Account>(`/api/account/providers/${p_provider._id}`, {
      headers: {Authorization: `Bearer ${token}` }
    })
      .then(response => {
        console.log("Got response ", response.data);
        setProviderAccount(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch provider:', error);
        setProviderAccount(null);
      });
  };

  const fetchReceiver = (p_requester: Account) => {
    console.log("Get receiver name for ", p_requester);
    axios.get<Account>(`/api/account/requester/${p_requester._id}`, {
      headers: {Authorization: `Bearer ${token}` }
    })
      .then(response => {
        console.log("Got response ", response.data);
        setReceiverAccount(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch receiver:', error);
        setReceiverAccount(null);
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
        const updatedOfferedServices = jobs.map(job => {
          if (job._id === selectedJob._id) {
            return { ...job, ...updateJobData };
          }
          return job;
        });

        setJobs(updatedOfferedServices);
        
        setShowMediaCard(false);
     } catch (error) {
      console.error('Error completing job:', error);
    }

    const {status, _id, receiver, provider, ...rest} = selectedJob;
    // Prepare notification data
    const notificationData = {
      isViewed: false,
      content: `Your service for ${selectedJob.serviceType} on the ${formatDateTime(selectedJob.appointmentStartTime)} has been marked as complete`,
      job: selectedJob._id,
      recipient: selectedJob.receiver._id,
      ...rest,
    };

    console.log("notification data at frontend:", notificationData);

    // generate new notification
    try {
      const notification = await axios.post("api/notification/", notificationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Notification sent!", notification);

      
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }
    


  };

  // handle revoking completed job
  const handleRevoke =  async() => {
 

    if (!selectedJob) {
      console.error('No job selected');
      return;
    }

    try {

      // update the job
        const updateOfferedServiceData = {
          status: JobStatus.open,
        };
        console.log("selected job id:" , selectedJob?._id, updateOfferedServiceData)
        const updateJob = await axios.put(`/api/jobs/${selectedJob?._id}`, updateOfferedServiceData, {
          headers: {Authorization: `Bearer ${token}` }
        });
        console.log('Job Updated:', updateJob.data);
        // Update local state to reflect these changes
        const updatedOfferedServices = jobs.map(job => {
          if (job._id === selectedJob._id) {
            return { ...job, ...updateOfferedServiceData };
          }
          return job;
        });

        setJobs(updatedOfferedServices);
        
        setShowMediaCard(false);
     } catch (error) {
      console.error('Error completing job:', error);
    }

    const {status, _id, receiver, provider, ...rest} = selectedJob;
    // Prepare notification data
    const notificationData = {
      isViewed: false,
      content: `The completion of your service for ${selectedJob.serviceType} on the ${formatDateTime(selectedJob.appointmentStartTime)} has been revoked`,
      job: selectedJob._id,
      recipient: selectedJob.receiver._id,
      ...rest,
    };

    console.log("notification data at frontend:", notificationData);

    // generate new notification
    try {
      const notification = await axios.post("api/notification/", notificationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Notification sent!", notification);

      
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }
    


  };

  const handleCancel =  async() => {
    
    if (!selectedJob) {
      console.error('No job selected');
      return;
    }

    try {

      // update the request
        const updateOfferedServiceData = {
         status: JobStatus.cancelled,
        };
        console.log("selected job id:" , selectedJob?._id, updateOfferedServiceData)
        const updateResponse = await axios.put(`/api/jobs/${selectedJob?._id}`, updateOfferedServiceData, {
          headers: {Authorization: `Bearer ${token}` }
        });
        console.log('Job Updated:', updateResponse.data);


        // Update local state to reflect these changes
        const updatedOfferedServices = jobs.map(job => {
          if (job._id === selectedJob._id) {
            return { ...job, ...updateOfferedServiceData };
          }
          return job;
        });

        console.log(updatedOfferedServices);
        setJobs(updatedOfferedServices);
        setShowMediaCard(false);
     } catch (error) {
      console.error('Error cancelling Request:', error);
    }

    const {status, _id, receiver, provider, ...rest} = selectedJob;
    // Prepare notification data
    const notificationData = {
      isViewed: false,
      content: `Your scheduled service for ${selectedJob.serviceType} on the ${formatDateTime(selectedJob.appointmentStartTime)} has been cancelled`,
      job: selectedJob._id,
      recipient: selectedJob.receiver._id,
      ...rest,
    };

    console.log("notification data at frontend:", notificationData);

    // generate new notification
    try {
      const notification = await axios.post("api/notification/", notificationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Notification sent!", notification);

      
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }

    let email = "";
    let addressee = "";

    if (account?._id === providerAccount?._id) {

      email = receiverAccount?.email ? receiverAccount?.email : "";
      addressee = receiverAccount?.firstName + " " + receiverAccount?.lastName;
      
    } else if (account?._id === receiverAccount?._id) {
      email = providerAccount?.email ? providerAccount?.email : "";
      addressee = providerAccount?.firstName + " " + providerAccount?.lastName;
    }

    // send Email notification
    try {
      await axios.post('/api/email/cancelNotification', {email: email, serviceType: selectedJob.serviceType,
         startTime: selectedJob.appointmentStartTime, name: addressee}).then(
          (res) => {
              console.log(res);
          }
      ).catch((err) => {
              console.error(err);
          }
      );

  } catch (error) {
      console.error("There was an error sending the email", error);
  }

  };

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
                      provider={providerAccount}
                      receiver={receiverAccount}
                       onClose={() => setShowMediaCard(false)}
                       onComplete={handleComplete}
                       onCancel = {handleCancel}
                       onReview={()=>navigate(`/customer_review/${selectedJob._id}`)}
                      onRevoke={handleRevoke}
            />
          </div>
        )}
      </Box>
    </Box>
  );
}
