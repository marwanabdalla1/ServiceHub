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
import MediaCard from './RequestCard';
import { ServiceRequest as Request } from '../models/ServiceRequest';
import RequestRow from './RequestRow'
import {ServiceType, RequestStatus} from '../models/enums'
import { Account, bikeRepairService } from '../models/Account';
import { Job } from '../models/Job';
import {ServiceOffering} from "../models/ServiceOffering";

function createRequest(
  serviceRequestId: string,
  requestStatus: RequestStatus,
  createdOn: Date,
  serviceType: ServiceType,
  serviceOffering: ServiceOffering | null | undefined,
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
    serviceOffering,
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


const accounts: Account [] = [
  new Account('11', 'Max', 'Mustermann', 'example.email@example.com','', 3.5, [bikeRepairService])
]

const rows: Request[] = [
  createRequest('1', RequestStatus.pending, new Date('2024-05-11'), ServiceType.bikeRepair, null, new Date('2024-05-11'), [] , 'comment 1', 12, 30, null, accounts[0],accounts[0], 5,'../../images/profiles/profile3.png'),
  createRequest('2', RequestStatus.pending, new Date('2024-05-12'), ServiceType.babySitting, null, new Date('2024-05-11'), [], 'comment 2', 13, 30, null, accounts[0], accounts[0], 4.99, '../../images/profiles/profile2.png'),
  createRequest('3', RequestStatus.pending, new Date('2024-05-13'), ServiceType.houseCleaning, null, new Date('2024-05-11'), [], 'comment 3', 2001, 3, null, accounts[0], accounts[0], 4.5, '../../images/profiles/profile1.png'),
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
            <MediaCard request={selectedRequest} 
                        onClose={() => setShowMediaCard(false)} 
                        onAccept={() => console.log('accepted.') }
                        onDecline={() => console.log('declined.') }
                        onProposeNewTime={() => console.log('New Time: ')} />
          </div>
        )}
      </Box>
    </Box>
  );
}
