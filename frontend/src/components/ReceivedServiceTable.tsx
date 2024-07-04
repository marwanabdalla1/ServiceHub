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
import MediaCard from './ReceivedServiceCard';
import { Job } from '../models/Job';
import ReceivedServiceRow from './ReceivedServiceRow';
import { Account } from '../models/Account';
import account from '../models/Account';
import {Timeslot} from '../models/Timeslot';
import {ServiceRequest} from '../models/ServiceRequest';
import {RequestStatus, ServiceType, JobStatus} from '../models/enums';
import {ServiceOffering} from "../models/ServiceOffering";
import {useAuth} from "../contexts/AuthContext";
import {useEffect} from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { now } from 'moment';
import { formatDateTime } from '../utils/dateUtils';


//Candidate for deletion
// const serviceRequests: ServiceRequest[] = [
//   new ServiceRequest('sr1', RequestStatus.accepted, new Date(), ServiceType.babySitting,  undefined, new Date(), undefined, [new File([], "empty.txt", { type: "text/plain" })],
//   'something', 12, 30,  null, account, account, 5, '../../images/profiles/profile3.png'),
//   new ServiceRequest('sr2', RequestStatus.declined, new Date(), ServiceType.bikeRepair, null, new Date(), undefined, [new File([], "empty.txt", { type: "text/plain" })],
//   'somethingElse', 13, 30,  null, account, account, 5, '../../images/profiles/profile3.png'),
//   new ServiceRequest('sr3', RequestStatus.pending, new Date(), ServiceType.homeRemodeling, null, new Date(), undefined,[new File([], "empty.txt", { type: "text/plain" })],
//   'comment3', 14, 30, null, account, account, 5, '../../images/profiles/profile3.png')
// ];
//
//
// const rows: Job[] = [
//   new Job('1', ServiceType.bikeRepair, new Date('2024-05-11'), new Date('2024-05-11'), '50', JobStatus.open, 'Description 1', account, account,'../../images/profiles/profile3.png', 4.99,  new Timeslot(ServiceType.babySitting, new Date(), new Date(), true), serviceRequests[0], undefined),
//   new Job('2', ServiceType.petSitting, new Date('2024-05-12'), new Date('2024-05-11'), '30', JobStatus.completed, 'Description 2', account, account, '../../images/profiles/profile2.png', 5, new Timeslot(ServiceType.tutoring, new Date(), new Date(), true), serviceRequests[1], undefined),
//   new Job('3', ServiceType.homeRemodeling, new Date('2024-05-13'), new Date('2024-05-13'),  '100', JobStatus.cancelled, 'Description 3', account,account, '../../images/profiles/profile1.png',  3,  new Timeslot(ServiceType.petSitting, new Date(), new Date(), true), serviceRequests[2], undefined),
// ];

export default function ReceivedServiceTable() {
  const [showMediaCard, setShowMediaCard] = React.useState(false);
  const [selectedReceivedService, setSelectedReceivedService] = React.useState<Job | null>(null);
  const [receivedServices, setReceivedServices] = React.useState<Job[]>([]);
  const {token, account} = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = React.useState<Account | null>(null);
  const [receiver, setReceiver] = React.useState<Account | null>(null);

  // todo: this probably can be combined/reused along with the request history table
  useEffect(() => {
    if (token && account) {
      // console.log("this is the logged in account in request table:", account)
      // setLoading(true);
      axios.get<Job[]>(`/api/jobs/requester/${account._id}`, {
        headers: {Authorization: `Bearer ${token}` }
      })
          .then(response => {
            console.log("getting requests ...", response.data)
            setReceivedServices(response.data);
            // setLoading(false);
          })
          .catch(error => {
            console.error('Failed to fetch service requests:', error);
            setReceivedServices([]);
            // setError('Failed to load service requests');
            // setLoading(false);
          });


    }
  }, [account?._id]);

  const handleToggleMediaCard = (job: Job | null) => {
    setSelectedReceivedService(job);
    setShowMediaCard(job !== null);
  };

  useEffect(() => {
    if (selectedReceivedService) {
      fetchProvider(selectedReceivedService.provider);
      fetchReceiver(selectedReceivedService.receiver);
    }
  }, [selectedReceivedService, token]);

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

  /*// handle completing the job
  const handleComplete =  async() => {
 

    if (!selectedReceivedService) {
      console.error('No job selected');
      return;
    }
 //   sanity check: appointment time has to be in the past
    if (!selectedReceivedService.appointmentEndTime || selectedReceivedService.appointmentEndTime > new Date()){
        //TODO: add modal to let user know
        console.error('The job cannot be completed, since its appointment is in the future.');
        return;
    }

    try {

      // update the job
        const updateJobData = {
          jobStatus: JobStatus.completed,
        };
        console.log("selected request id:" , selectedReceivedService?._id, updateJobData)
        const updateJob = await axios.put(`/api/jobs/${selectedReceivedService?._id}`, updateJobData, {
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
  const handleCancel =  async() => {
 

    if (!selectedReceivedService) {
      console.error('No job selected');
      return;
    }

    try {

      // update the job
        const updateJobData = {
          status: JobStatus.cancelled,
        };
        console.log("selected request id:" , selectedReceivedService?._id, updateJobData)
        const updateJob = await axios.put(`/api/jobs/${selectedReceivedService?._id}`, updateJobData, {
          headers: {Authorization: `Bearer ${token}` }
        });
        console.log('Job Updated:', updateJob.data);
        // Update local state to reflect these changes
        const updatedJobs = receivedServices.map(receivedService => {
          if (receivedService._id === selectedReceivedService._id) {
            return { ...receivedService, ...updateJobData };
          }
          return receivedService;
        });

        setReceivedServices(updatedJobs);
        
        setShowMediaCard(false);
     } catch (error) {
      console.error('Error completing job:', error);
    }

    const {status, _id, receiver, provider, ...rest} = selectedReceivedService;
    // Prepare notification data
    const notificationData = {
      isViewed: false,
      content: `Your scheduled job for ${selectedReceivedService.serviceType} on the ${formatDateTime(selectedReceivedService.appointmentStartTime)} has been cancelled`,
      job: selectedReceivedService._id,
      recipient: selectedReceivedService.provider._id,
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

  const handleReview = (job: Job) => {
    navigate(`/customer_review/${job._id}`);
  };
  



  return (
    <Box sx={{ minWidth: 275, margin: 2 }}>
      <Box>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ marginBottom: '16px' }}>
          <Link color="inherit" href="/" underline="hover">
            History
          </Link>
          <Typography color="textPrimary">Received Services</Typography>
        </Breadcrumbs>
        <Typography variant="h6" component="div" sx={{ marginBottom: '16px' }}>
          Received Services
        </Typography>
      </Box>
      <Box style={{ display: 'flex' }}>
        <Box sx={{ flexGrow: 1, marginRight: 2 }}>
          <Box>
            {receivedServices.length === 0 ? (
                <Typography variant="body1">You haven't booked anything yet.</Typography>
            ) : (
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
                  {receivedServices.map((receivedService) => (
                    <ReceivedServiceRow key={receivedService._id} receivedService={receivedService} onViewDetails={handleToggleMediaCard} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>)}
          </Box>
        </Box>
        {showMediaCard && selectedReceivedService && (
          <div style={{ position: 'relative', flexShrink: 0, width: 400, marginLeft: 2 }}>
            <MediaCard receivedService={selectedReceivedService}
                      provider={provider}
                      receiver={receiver}
                       onClose={() => setShowMediaCard(false)}
                       onCancel = {handleCancel}
                       onReview={()=>navigate(`/customer_review/${selectedReceivedService._id}`)}
            />
          </div>
        )}
      </Box>
    </Box>
  );
}
