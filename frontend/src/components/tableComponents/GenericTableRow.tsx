import * as React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import { ServiceRequest } from '../../models/ServiceRequest';
import BlackButton from '../inputs/blackbutton';
import {ServiceType, RequestStatus, JobStatus} from '../../models/enums';
import {Job} from "../../models/Job";

type Item = ServiceRequest | Job;

interface GenericRowProps {
    item: Item;
    onViewDetails: (item: Item | ServiceRequest | Job | null) => void;
}

const GenericRow: React.FC<GenericRowProps> = ({ item, onViewDetails }) => {
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


    return (
        <TableRow>
            <TableCell>{item.serviceType}</TableCell>
            <TableCell>{status}</TableCell>
            <TableCell>{formatDateTime(item.timeslot?.start)}</TableCell>
            <TableCell>
                <BlackButton text="View" onClick={() => onViewDetails(item)} />
            </TableCell>
        </TableRow>
    );
};

export default GenericRow;



