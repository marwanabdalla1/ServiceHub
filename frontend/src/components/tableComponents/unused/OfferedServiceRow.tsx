import * as React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import { Job } from '../../../models/Job';
import BlackButton from '../../inputs/blackbutton';
import { ServiceType, JobStatus } from '../../../models/enums';
import {formatDateTime} from "../../../utils/dateUtils";

interface OfferedServiceRowProps {
  offeredService: Job;
  onViewDetails: (offeredService: Job) => void;
}

const OfferedServiceRow: React.FC<OfferedServiceRowProps> = ({ offeredService, onViewDetails }) => {
  return (
    <TableRow>
      <TableCell>{offeredService.serviceType}</TableCell>
      <TableCell>{JobStatus[offeredService.status]}</TableCell>
      <TableCell>{formatDateTime(offeredService.appointmentStartTime)}</TableCell>
      <TableCell>
        <BlackButton text="View" onClick={() => onViewDetails(offeredService)}/>
      </TableCell>
    </TableRow>
  );
};

export default OfferedServiceRow;
