import * as React from 'react';
import Box from '@mui/material/Box';
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
import {ServiceRequest} from '../../models/ServiceRequest';


import GenericProviderCard from '../../components/tableComponents/GenericProviderCard'
import GenericTableRow from '../../components/tableComponents/GenericTableRow'

import axios from "axios";
import {useEffect} from "react";
import {useAuth} from "../../contexts/AuthContext";
import {formatDateTime} from '../../utils/dateUtils';
import {handleCancel} from "../../utils/requestHandler";
import GenericConsumerCard from "../../components/tableComponents/GenericConsumerCard";
import {Job} from "../../models/Job";

type Item = ServiceRequest | Job;

export default function RequestHistoryTable() {
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedRequest, setSelectedRequest] = React.useState<ServiceRequest | null>(null);
    const [serviceRequests, setServiceRequests] = React.useState<ServiceRequest[]>([]);
    const {token, account} = useAuth();

    // const providerId = account?._id;

    // useEffect(() => {
    //   // get all the requests of this provider
    //   axios.get(`/api/requests/provider/${providerId}`)
    //       .then(response => {
    //         setServiceRequests(response.data);
    //       })
    //       .catch(error => {
    //         console.error('Failed to fetch service requests:', error);
    //         setServiceRequests([]); // Consider how to handle errors, possibly setting an error state
    //       });
    // }, [providerId]); // This effect depends on `providerId`

    useEffect(() => {
        console.log(token)
        if (token && account) {
            console.log("this is the logged in account in request table:", account)
            // setLoading(true);
            axios.get<ServiceRequest[]>(`/api/requests/requester/${account._id}`, {
                headers: {Authorization: `Bearer ${token}`}
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


    const handleToggleMediaCard = (req: Item | null) => {
        setSelectedRequest(req as ServiceRequest);
        setShowMediaCard(req !== null);
    };

//   const handleCancel =  async() => {
//
//     if (!selectedRequest) {
//       console.error('No request selected');
//       return;
//     }
//
//
//     // get data from the request (selectedRequest)
//     const {requestStatus, job, _id, requestedBy, provider, ...rest} = selectedRequest;
//
//     try {
//
//       // update the request
//         const updateRequestData = {
//          requestStatus: RequestStatus.cancelled,
//         };
//         console.log("selected request id:" , selectedRequest._id, updateRequestData)
//         const updateResponse = await axios.put(`/api/requests/${selectedRequest._id}`, updateRequestData, {
//           headers: {Authorization: `Bearer ${token}` }
//         });
//         console.log('Request Updated:', updateResponse.data);
//
//
//         // Update local state to reflect these changes
//         const updatedServiceRequests = serviceRequests.map(req => {
//           if (req._id === selectedRequest._id) {
//             return { ...req, ...updateRequestData };
//           }
//           return req;
//         });
//
//         console.log(updatedServiceRequests);
//         setServiceRequests(updatedServiceRequests);
//         setShowMediaCard(false);
//      } catch (error) {
//       console.error('Error cancelling Request:', error);
//     }
//
// // Prepare notification data
//
// if(selectedRequest.requestStatus == RequestStatus.accepted) {
// const notificationData = {
//   isViewed: false,
//   content: `Your scheduled job for ${selectedRequest.serviceType} on the ${formatDateTime(selectedRequest.appointmentStartTime)} has been cancelled`,
//   serviceRequest: selectedRequest._id,
//   recipient: selectedRequest.provider._id,
//   ...rest,
// };
//
// console.log("notification data at frontend:", notificationData);
//
// // generate new notification
// try {
//   const notification = await axios.post("api/notification/", notificationData, {
//     headers: { Authorization: `Bearer ${token}` }
//   });
//   console.log("Notification sent!", notification);
//
//
// } catch (notificationError) {
//   console.error('Error sending notification:', notificationError);
// }
//
//
// }};


    const onCancel = () => {
        if (!selectedRequest) {
            console.error('No request selected');
            return;
        }
        handleCancel({
            selectedRequest,
            serviceRequests,
            setServiceRequests,
            token,
            setShowMediaCard,
        });
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
                        {/*    <Typography color="textPrimary">Request History</Typography>*/}
                        {/*</Breadcrumbs>*/}
                        <Typography variant="h6" component="div" sx={{marginBottom: '16px'}}>
                            Request History
                        </Typography>
                    </Box>
                    <Box style={{display: 'flex'}}>
                        <Box sx={{flexGrow: 1, marginRight: 2}}>
                            <Box>
                                {serviceRequests.length === 0 ? (
                                    <Typography variant="body1">You haven't requested anything yet..</Typography>
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
                                                {serviceRequests.map((request) => (
                                                    <GenericTableRow key={request._id} item={request}
                                                                     onViewDetails={handleToggleMediaCard}/>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>)}
                            </Box>
                        </Box>
                        {showMediaCard && selectedRequest && (
                            <div style={{position: 'relative', flexShrink: 0, width: 400, marginLeft: 2}}>
                                {/*<MediaCard request={selectedRequest}*/}
                                {/*           onClose={() => setShowMediaCard(false)}*/}
                                {/*           onDecline={() => console.log('declined.')}*/}
                                {/*           onProposeNewTime={() => console.log('New Time: ')}*/}
                                {/*           onCancel={onCancel}/>*/}

                                <GenericConsumerCard item={selectedRequest}
                                                     provider={selectedRequest.provider}
                                                     receiver={selectedRequest.requestedBy}
                                                     onClose={() => setShowMediaCard(false)}
                                                     inDetailPage={false}
                                                     actions={{
                                                         cancelRequest: onCancel,
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
