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
    // todo: might need to reformat depending on the thing
    const formatDateTime = (date: any) => {
        if (!(date instanceof Date)) date = new Date(date);
        return date.toLocaleString('en-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit', // hour in 2-digit format
            minute: '2-digit', // minute in 2-digit format
            hour12: false // use AM/PM
        });
    };

    const status = 'requestStatus' in item ?  item.requestStatus: JobStatus[item.status];

    const displayedTime = item.timeslot ? formatDateTime(item.timeslot.end) : formatDateTime(item.appointmentEndTime) + " (invalid)"

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



