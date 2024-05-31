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
import MediaCard from './RequestCard';
import { Request } from '../models/Request';
import RequestRow from './RequestRow';

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
  createRequest('1', 'Bike Repair', new Date('2024-05-11'), '50', 'Open', 'Description 1', 'John Doe', '../../images/profiles/profile3.png', 4.99, new Date('2024-05-13')),
  createRequest('2', 'Car Wash', new Date('2024-05-12'), '30', 'Completed', 'Description 2', 'Jane Smith', '../../images/profiles/profile2.png', 5, new Date('2024-05-13')),
  createRequest('3', 'Plumbing', new Date('2024-05-13'), '100', 'Pending', 'Description 3', 'Alice Johnson', '../../images/profiles/profile1.png',  3, new Date('2024-05-13')),
];

export default function RequestHistoryTable() {
  const [showMediaCard, setShowMediaCard] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<Request | null>(null); 

  const handleToggleMediaCard = (req: Request | null) => {
    setSelectedRequest(req);
    setShowMediaCard(req !== null);
  };

  return (
    <Box sx={{ minWidth: 275, margin: 2 }}>
      <Box>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ marginBottom: '16px' }}>
          <Link color="inherit" href="/" underline="hover">
            History
          </Link>
          <Typography color="textPrimary">Request History</Typography>
        </Breadcrumbs>
        <Typography variant="h6" component="div" sx={{ marginBottom: '16px' }}>
          Request History
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
                  {rows.map((row) => (
                    <RequestRow key={row.appointmentTime.toString()} request={row} onViewDetails={handleToggleMediaCard} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
        {showMediaCard && selectedRequest && (
          <div style={{ position: 'relative', flexShrink: 0, width: 400, marginLeft: 2 }}>
            <MediaCard request={selectedRequest} onClose={() => setShowMediaCard(false)} />
          </div>
        )}
      </Box>
    </Box>
  );
}
