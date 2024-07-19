import * as React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { ServiceRequest } from '../../models/ServiceRequest';
import BlackButton from '../inputs/blackbutton';
import {JobStatus} from '../../models/enums';
import {Job} from "../../models/Job";
import {formatDateTime} from "../../utils/dateUtils";

type Item = ServiceRequest | Job;

interface GenericRowProps {
    item: Item;
    isProvider: boolean;
    onViewDetails: (item: Item | ServiceRequest | Job | null) => void;
}

const GenericRow: React.FC<GenericRowProps> = ({ item, isProvider, onViewDetails }) => {

    const status = 'requestStatus' in item ?  item.requestStatus: JobStatus[item.status];

    // if there is no corresponding timeslot to the request/job
        // (meaning it was either declined, canceled or the consumer needs to select new time),
        // we let the user know that the time is invalid
    const displayedTime = item.timeslot ? formatDateTime(item.timeslot.start) : formatDateTime(item.appointmentStartTime) + " (invalid)"

    const displayInfo = () => {
        if (isProvider) {
            // Use type guard to check if it's a Job
            if ('receiver' in item && item.receiver) {
                return `${item.receiver.firstName} ${item.receiver.lastName}`;
            }
            // Use type guard to check if it's a ServiceRequest
            else if ('requestedBy' in item && item.requestedBy) {
                return `${item.requestedBy.firstName} ${item.requestedBy.lastName}`;
            } else{
                return "Account Deleted"
            }
        }
        // Default to showing provider info if available
        if ('provider' in item && item.provider) {
            return `${item.provider.firstName} ${item.provider.lastName}`;
        }
        return 'Account Deleted';
    };



    return (
        <TableRow>
            <TableCell>{item.serviceType}</TableCell>
            <TableCell>{status}</TableCell>
            <TableCell>{displayInfo()}</TableCell>
            <TableCell>{displayedTime}</TableCell>
            <TableCell>
                <BlackButton text="View" onClick={() => onViewDetails(item)} />
            </TableCell>
        </TableRow>
    );
};

export default GenericRow;



