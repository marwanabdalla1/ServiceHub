import React, { useState } from 'react';
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
import { ServiceRequest as Request } from '../models/ServiceRequest';
import IncomingRequestRow from './IncomingRequestRow';
import Modal from './inputs/Modal';
import IncomingRequestMediaCard from './IncomingRequestCard';
import { RequestStatus, ServiceType } from '../models/enums';
import { Account } from '../models/Account';
import { Job } from '../models/Job';

function createRequest(
  serviceRequestId: string,
  requestStatus: RequestStatus,
  createdOn: Date,
  serviceType: ServiceType,
  appointmentTime: Date,
  uploads: File[],
  comment: string,
  serviceFee: number,
  duration: number,
  job: Job | null,
  provider: Account,
  requestedBy: Account,
  rating: number,
  profileImageUrl: string,
): Request {
  return {
    serviceRequestId,
    requestStatus,
    createdOn,
    serviceType,
    appointmentTime,
    uploads,
    comment,
    serviceFee,
    duration,
    job,
    provider,
    requestedBy,
    rating,
    profileImageUrl,
  };
}

const accounts: Account[] = [
  {
    id: '11',
    firstName: 'Max',
    lastName: 'Mustermann',
    email: 'example.email@example.com',
    phoneNumber: '911',
    address: 'Arcisstraße',
    profileImageUrl: 'stringImage',
    description: 'desc',
    location: 'loc',
    isProvider: false,
    isPremium: false,
    rating: 5,
    reviewCount: 40,
    serviceOfferings: [],
    availability: [],
    reviews: [],
    notifications: [],
    requestHistory: [],
    jobHistory: []
  }
];
const rows: Request[] = [
  createRequest('1', RequestStatus.pending, new Date('2024-05-11'), ServiceType.bikeRepair, new Date('2024-05-11'), [] , 'comment 1', 12, 30, null, accounts[0],accounts[0], 5,'../../images/profiles/profile3.png'),
  createRequest('2', RequestStatus.pending, new Date('2024-05-12'), ServiceType.babySitting, new Date('2024-05-11'), [], 'comment 2', 13, 30, null, accounts[0], accounts[0], 4.99, '../../images/profiles/profile2.png'),
  createRequest('3', RequestStatus.pending, new Date('2024-05-13'), ServiceType.houseCleaning, new Date('2024-05-11'), [], 'comment 3', 2001, 3, null, accounts[0], accounts[0], 4.5, '../../images/profiles/profile1.png'),
];

export default function IncomingRequestTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null); 

  const openModal = (request: Request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Box sx={{ minWidth: 275, margin: 2 }}>
      <Box>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ marginBottom: '16px' }}>
          <Typography color="textPrimary">Incoming Requests</Typography>
        </Breadcrumbs>
        <Typography variant="h6" component="div" sx={{ marginBottom: '16px' }}>
          Incoming Requests
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
                    <TableCell>Published Date</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <IncomingRequestRow key={row.serviceRequestId} request={row} onViewDetails={() => openModal(row)} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
        <Modal show={isModalOpen} onClose={closeModal}>
          <div className='modal-content'>
            <h1 className='modalTitle'>Request Detail</h1>
            {selectedRequest && <IncomingRequestMediaCard request={selectedRequest} 
                                                          onClose={closeModal} />}
          </div>
        </Modal>
      </Box>
    </Box>
  );
}
