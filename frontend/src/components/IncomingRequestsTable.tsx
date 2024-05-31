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
import { Request } from '../models/Request';
import IncomingRequestRow from './IncomingRequestRow';
import Modal from './inputs/Modal';
import IncomingRequestMediaCard from './IncomingRequestCard';

function createRequest(
  requestId: string,
  serviceType: string,
  appointmentTime: Date,
  serviceFee: string,
  status: string,
  description: string,
  requestor: string,
  requestorImage: string,
  rating: number,
  publishedDate: Date
): Request {
  return {
    requestId,
    serviceType,
    appointmentTime,
    serviceFee,
    status,
    description,
    requestor,
    requestorImage,
    rating,
    publishedDate
  };
}

const rows: Request[] = [
  createRequest('1', 'Bike Repair', new Date('2024-05-11'), '50', 'Pending', 'Description 1', 'John Doe', '../../images/profiles/profile3.png', 4.99, new Date('2024-05-11')),
  createRequest('2', 'Car Wash', new Date('2024-05-12'), '30', 'Pending', 'Description 2', 'Jane Smith', '../../images/profiles/profile2.png', 5, new Date('2024-05-11')),
  createRequest('3', 'Plumbing', new Date('2024-05-13'), '100', 'Pending', 'Description 3', 'Alice Johnson', '../../images/profiles/profile1.png',  3, new Date('2024-05-11')),
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
                    <IncomingRequestRow key={row.requestId} request={row} onViewDetails={() => openModal(row)} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
        <Modal show={isModalOpen} onClose={closeModal}>
          <div className='modal-content'>
            <h1 className='modalTitle'>Request Detail</h1>
            {selectedRequest && <IncomingRequestMediaCard request={selectedRequest} onClose={closeModal} />}
          </div>
        </Modal>
      </Box>
    </Box>
  );
}
