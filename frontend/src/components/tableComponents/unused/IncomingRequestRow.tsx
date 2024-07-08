import * as React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import { ServiceRequest } from '../../../models/ServiceRequest';
import BlackButton from '../../inputs/blackbutton';
import { ServiceType } from '../../../models/enums';
import { formatDateTime } from '../../../utils/dateUtils';

interface IncomingRequestRowProps {
  request: ServiceRequest;
  onViewDetails: (request: ServiceRequest) => void;
}

const RequestRow: React.FC<IncomingRequestRowProps> = ({ request, onViewDetails }) => {
  return (
    <TableRow>
      <TableCell>{request.serviceType}</TableCell>
        <TableCell>{request.requestStatus}</TableCell>
        <TableCell>{formatDateTime(request.timeslot?.start)}</TableCell>
      <TableCell>
        <BlackButton text="View" onClick={() => onViewDetails(request)}/>
      </TableCell>
    </TableRow>
  );
};

export default RequestRow;
