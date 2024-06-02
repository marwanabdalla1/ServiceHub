import * as React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import { ServiceRequest as Request } from '../models/ServiceRequest';
import BlackButton from './inputs/blackbutton';
import { ServiceType } from '../models/enums';

interface IncomingRequestRowProps {
  request: Request;
  onViewDetails: (request: Request) => void;
}

const RequestRow: React.FC<IncomingRequestRowProps> = ({ request, onViewDetails }) => {
  return (
    <TableRow>
      <TableCell>{ServiceType[request.serviceType]}</TableCell>
      <TableCell>{request.createdOn.toLocaleDateString()}</TableCell>
      <TableCell>
        <BlackButton text="View" onClick={() => onViewDetails(request)}/>
      </TableCell>
    </TableRow>
  );
};

export default RequestRow;
