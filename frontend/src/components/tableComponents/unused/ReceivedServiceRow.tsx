import * as React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import { Job } from '../../../models/Job';
import BlackButton from '../../inputs/blackbutton';
import { ServiceType, JobStatus } from '../../../models/enums';
import {formatDateTime} from "../../../utils/dateUtils";

interface ReceivedServiceRowProps {
  receivedService: Job;
  onViewDetails: (receivedService: Job) => void;
}

const ReceivedServiceRow: React.FC<ReceivedServiceRowProps> = ({ receivedService, onViewDetails }) => {
  return (
    <TableRow>
      <TableCell>{receivedService.serviceType}</TableCell>
      <TableCell>{JobStatus[receivedService.status]}</TableCell>
      <TableCell>{formatDateTime(receivedService.appointmentStartTime)}</TableCell>
      <TableCell>
        <BlackButton text="View" onClick={() => onViewDetails(receivedService)}/>
      </TableCell>
    </TableRow>
  );
};

export default ReceivedServiceRow;
