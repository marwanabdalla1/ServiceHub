import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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

function createJob(
  jobId: string,
  serviceType: string,
  appointmentTime: Date,
  serviceFee: string,
  status: string,
  description: string,
  provider: string,
  providerImage: string,
  rating: number
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
    rating
  };
}

const rows: Job[] = [
  createJob('1', 'Bike Repair', new Date('2024-05-11'), '50', 'Open', 'Description 1', 'John Doe', '../../images/profiles/profile3.png', 4.99),
  createJob('2', 'Car Wash', new Date('2024-05-12'), '30', 'Completed', 'Description 2', 'Jane Smith', '../../images/profiles/profile2.png', 5),
  createJob('3', 'Plumbing', new Date('2024-05-13'), '100', 'Pending', 'Description 3', 'Alice Johnson', '../../images/profiles/profile1.png',  3),
];

export default function JobHistoryTable() {
  const [showMediaCard, setShowMediaCard] = React.useState(false);
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null); 

  const handleToggleMediaCard = (job: Job | null) => {
    setSelectedJob(job);
    setShowMediaCard(job !== null);
  };

  return (
    <Card sx={{ minWidth: 275, margin: 2 }}>
      <CardContent>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ marginBottom: '16px' }}>
          <Link color="inherit" href="/" underline="hover">
            History
          </Link>
          <Typography color="textPrimary">Job History</Typography>
        </Breadcrumbs>
        <Typography variant="h6" component="div" sx={{ marginBottom: '16px' }}>
          Job History
        </Typography>
        <div style={{ display: 'flex' }}>
          <Card sx={{ flexGrow: 1, marginRight: 2 }}> 
            <CardContent>
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
            </CardContent>
          </Card>
          {showMediaCard && selectedJob && (
            <div style={{ position: 'relative', flexShrink: 0, width: 400, marginLeft: 2 }}>
              <MediaCard job={selectedJob} onClose={() => setShowMediaCard(false)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
