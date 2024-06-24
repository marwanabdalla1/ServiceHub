import React, {useState} from 'react';
import Box from '@mui/material/Box'; // Changed import
import CardContent from '@mui/material/Box'; // Changed import
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {ServiceRequest, ServiceRequest as Request} from '../models/ServiceRequest';
import IncomingRequestRow from './IncomingRequestRow';
import Modal from './inputs/Modal';
import MediaCard from './RequestCard';

import {ServiceType, RequestStatus, JobStatus} from '../models/enums'
import {Account, bikeRepairService} from '../models/Account';
import {useEffect} from "react";
import {useAuth} from "../contexts/AuthContext";
import axios from "axios";


export default function IncomingRequestTable() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedRequest, setSelectedRequest] = React.useState<ServiceRequest | null>(null);
    const [serviceRequests, setServiceRequests] = React.useState<ServiceRequest[]>([]);
    const {token, account} = useAuth();

    const openModal = (request: Request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleToggleMediaCard = (req: ServiceRequest | null) => {
        setSelectedRequest(req);
        setShowMediaCard(req !== null);
      };

      const handleAccept =  async() => {

        if (!selectedRequest) {
          console.error('No request selected');
          return;
        }


        // get data from the request (selectedRequest)
        const {requestStatus, job, _id, requestedBy, provider, ...rest} = selectedRequest;

        const jobData = {
          status: JobStatus.open,
          request: selectedRequest._id,
          receiver: selectedRequest.requestedBy._id,
          provider: selectedRequest.provider._id,
          ...rest,

        }

        console.log("job data at frontend:", jobData)


        // post new job
        try {
          const jobResponse = await axios.post("api/jobs/", jobData, {
            headers: {Authorization: `Bearer ${token}` }
          });
          console.log("job posted!", jobResponse);

          // update the request
          if (jobResponse.data && jobResponse.data._id) {
            const updateRequestData = {
              job: jobResponse.data._id, // or whatever the attribute is called in your database
              requestStatus: RequestStatus.accepted,
            };
            console.log("selected request id:" , selectedRequest._id, updateRequestData)
            const updateResponse = await axios.put(`/api/requests/${selectedRequest._id}`, updateRequestData, {
              headers: {Authorization: `Bearer ${token}` }
            });
            console.log('Request Updated:', updateResponse.data);


            // Update local state to reflect these changes
            const updatedServiceRequests = serviceRequests.map(req => {
              if (req._id === selectedRequest._id) {
                return { ...req, ...updateRequestData, job: jobResponse.data._id };
              }
              return req;
            });

            console.log(updatedServiceRequests);
            setServiceRequests(updatedServiceRequests);
            setShowMediaCard(false);
        } } catch (error) {
          console.error('Error posting job:', error);
        }



      };

      const handleDecline =  async() => {

        if (!selectedRequest) {
          console.error('No request selected');
          return;
        }


        // get data from the request (selectedRequest)
        const {requestStatus, job, _id, requestedBy, provider, ...rest} = selectedRequest;

        try {

          // update the request
            const updateRequestData = {
             requestStatus: RequestStatus.declined,
            };
            console.log("selected request id:" , selectedRequest._id, updateRequestData)
            const updateResponse = await axios.put(`/api/requests/${selectedRequest._id}`, updateRequestData, {
              headers: {Authorization: `Bearer ${token}` }
            });
            console.log('Request Updated:', updateResponse.data);


            // Update local state to reflect these changes
            const updatedServiceRequests = serviceRequests.map(req => {
              if (req._id === selectedRequest._id) {
                return { ...req, ...updateRequestData };
              }
              return req;
            });

            console.log(updatedServiceRequests);
            setServiceRequests(updatedServiceRequests);
            setShowMediaCard(false);
         } catch (error) {
          console.error('Error cancelling Request:', error);
        }



      };

    useEffect(() => {
        console.log(token)
        if (token && account) {
          console.log("this is the logged in account in request table:", account)
          // setLoading(true);
          axios.get<ServiceRequest[]>(`/api/requests/provider/incoming/${account._id}`, {
            headers: {Authorization: `Bearer ${token}` }
          })
              .then(response => {
                console.log("getting requests ...", response.data)
                setServiceRequests(response.data);
                // setLoading(false);
              })
              .catch(error => {
                console.error('Failed to fetch service requests:', error);
                setServiceRequests([]);
                // setError('Failed to load service requests');
                // setLoading(false);
              });
        }
      }, [account?._id]);

    return (
        <Box sx={{minWidth: 275, margin: 2}}>
            <Box>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small"/>} aria-label="breadcrumb"
                             sx={{marginBottom: '16px'}}>
                    <Typography color="textPrimary">Incoming Requests</Typography>
                </Breadcrumbs>
                <Typography variant="h6" component="div" sx={{marginBottom: '16px'}}>
                    Incoming Requests
                </Typography>
            </Box>
            <Box style={{display: 'flex'}}>
                <Box sx={{flexGrow: 1, marginRight: 2}}>
                    <Box>
                        <TableContainer component={Paper} sx={{overflow: 'auto'}}>
                            <Table sx={{minWidth: 650}} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Published Date</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                {serviceRequests.map((request) => (
                                    <IncomingRequestRow key={request._id} request={request} onViewDetails={handleToggleMediaCard} />
                  ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Box>
                {showMediaCard && selectedRequest && (
          <div style={{ position: 'relative', flexShrink: 0, width: 400, marginLeft: 2 }}>
            <MediaCard request={selectedRequest}
                        onClose={() => setShowMediaCard(false)}
                        onAccept={handleAccept}
                        onDecline={handleDecline }
                        onProposeNewTime={() => console.log('New Time: ')}
                        onCancel={() => {}} />
          </div>
        )}
            </Box>
        </Box>
    );
}
