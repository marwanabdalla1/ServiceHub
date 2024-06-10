import * as React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import { Job } from '../models/Job';
import BlackButton from './inputs/blackbutton';
import { ServiceType } from '../models/enums';

interface JobRowProps {
  job: Job;
  onViewDetails: (job: Job) => void;
}

const JobRow: React.FC<JobRowProps> = ({ job, onViewDetails }) => {
  return (
    <TableRow>
      <TableCell>{job.serviceType}</TableCell>
      <TableCell>{job.status}</TableCell>
      <TableCell>{job.appointmentTime.toLocaleDateString()}</TableCell>
      <TableCell>
        <BlackButton text="View" onClick={() => onViewDetails(job)}/>
      </TableCell>
    </TableRow>
  );
};

export default JobRow;
