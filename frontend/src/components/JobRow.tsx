import * as React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import { Job } from '../models/Job';
import BlackButton from './inputs/blackbutton';
import { ServiceType, JobStatus } from '../models/enums';

interface JobRowProps {
  job: Job;
  onViewDetails: (job: Job) => void;
}

const JobRow: React.FC<JobRowProps> = ({ job, onViewDetails }) => {
  return (
    <TableRow>
      <TableCell>{ServiceType[job.serviceType]}</TableCell>
      <TableCell>{JobStatus[job.status]}</TableCell>
      <TableCell>{job.appointmentTime.toLocaleDateString()}</TableCell>
      <TableCell>
        <BlackButton text="View" onClick={() => onViewDetails(job)}/>
      </TableCell>
    </TableRow>
  );
};

export default JobRow;
