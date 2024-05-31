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
import MediaCard from './JobCard';
import { Job } from '../models/Job';
import JobRow from './JobRow';
import { Account } from '../models/Account';
import account from '../models/Account';
import { Timeslot } from '../models/Timeslot';
import { ServiceRequest } from '../models/ServiceRequest';
import { RequestStatus, ServiceType } from '../models/enums';

function createJob(
  jobId: string,
  serviceType: string,
  appointmentTime: Date,
  serviceFee: string,
  status: string,
  description: string,
  provider: Account,
  providerImage: string,
  rating: number,
  dateOfService: Date,
  timeOfService: Timeslot,
  request: ServiceRequest
): Job {
  return {
    jobId,
    serviceType,
    appointmentTime,
    serviceFee,
    status,
    description,
    provider,
    providerImage,
    rating,
    dateOfService,
    timeOfService,
    request
  };
}

//Candidate for deletion
const serviceRequests: ServiceRequest[] = [
  new ServiceRequest('sr1', RequestStatus.accepted, new Date(), ServiceType.babySitting, new Date(), [new File([], "empty.txt", { type: "text/plain" })], 
  'something', null, account, account),
  new ServiceRequest('sr2', RequestStatus.declined, new Date(), ServiceType.bikeRepair, new Date(), [new File([], "empty.txt", { type: "text/plain" })], 
  'somethingElse', null, account, account),
  new ServiceRequest('sr3', RequestStatus.pending, new Date(), ServiceType.homeRemodeling, new Date(), [new File([], "empty.txt", { type: "text/plain" })], 
  'comment3', null, account, account)
];


const rows: Job[] = [
  createJob('1', 'Bike Repair', new Date('2024-05-11'), '50', 'Open', 'Description 1', account, '../../images/profiles/profile3.png', 4.99, new Date(), new Timeslot(new Date(), new Date()), serviceRequests[0]),
  createJob('2', 'Car Wash', new Date('2024-05-12'), '30', 'Completed', 'Description 2', account, '../../images/profiles/profile2.png', 5, new Date(), new Timeslot(new Date(), new Date()), serviceRequests[1]),
  createJob('3', 'Plumbing', new Date('2024-05-13'), '100', 'Pending', 'Description 3', account, '../../images/profiles/profile1.png',  3, new Date(), new Timeslot(new Date(), new Date()), serviceRequests[2]),
];

export default function JobHistoryTable() {
  const [showMediaCard, setShowMediaCard] = React.useState(false);
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null); 

  const handleToggleMediaCard = (job: Job | null) => {
    setSelectedJob(job);
    setShowMediaCard(job !== null);
  };

  return (
    <Box sx={{ minWidth: 275, margin: 2 }}>
      <Box>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ marginBottom: '16px' }}>
          <Link color="inherit" href="/" underline="hover">
            History
          </Link>
          <Typography color="textPrimary">Job History</Typography>
        </Breadcrumbs>
        <Typography variant="h6" component="div" sx={{ marginBottom: '16px' }}>
          Job History
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
                    <JobRow key={row.appointmentTime.toString()} job={row} onViewDetails={handleToggleMediaCard} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
        {showMediaCard && selectedJob && (
          <div style={{ position: 'relative', flexShrink: 0, width: 400, marginLeft: 2 }}>
            <MediaCard job={selectedJob} onClose={() => setShowMediaCard(false)} />
          </div>
        )}
      </Box>
    </Box>
  );
}
