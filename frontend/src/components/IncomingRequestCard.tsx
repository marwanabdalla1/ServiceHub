import * as React from 'react';
import Card from '@mui/material/Card';
import CloseIcon from '@mui/icons-material/Close';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {ServiceRequest as Request, ServiceRequest} from '../models/ServiceRequest';
import {GoStarFill} from 'react-icons/go';
import BlackButton from './inputs/blackbutton';
import Avatar from '@mui/material/Avatar';
import {Divider} from '@mui/material';
import {RequestStatus} from '../models/enums';
import {useAuth} from '../contexts/AuthContext';
import {useNavigate} from 'react-router-dom';
import {Account} from '../models/Account';
import axios from 'axios';
import {formatDateTime} from '../utils/dateUtils';

interface MediaCardProps {
    request: Request;
    onClose: () => void;
    onAccept: (request: Request) => void;
    onDecline: (request: Request) => void;
    onCancel: (request: Request) => void;
    onTimeChange: (value: boolean) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({request, onClose, onAccept, onDecline, onCancel, onTimeChange}) => {

    //const { account, token, isProvider } = useAuth();
    //const navigate = useNavigate();


    const renderButton = () => {
        if (request.requestStatus === RequestStatus.cancelled) {
            console.log("No Actions possible for CANCELLED requests!");
        } else if (request.requestStatus === RequestStatus.declined) {
            console.log("No Actions possible for DECLINED requests!");
        } else if (request.requestStatus === RequestStatus.accepted) {
            return (<BlackButton text="Cancel Request" onClick={() => onCancel(request)} sx={{marginRight: "1rem"}}/>);
        } else if (request.requestStatus === RequestStatus.pending) {
            return (
                <>
                    <BlackButton text="Decline Request" onClick={() => onDecline(request)} sx={{marginRight: "1rem"}}/>
                    <BlackButton text="Accept Request" onClick={() => onAccept(request)} sx={{marginRight: "1rem"}}/>
                    <BlackButton text="Request Time Change" onClick={() => onTimeChange(true)}
                                 sx={{marginTop: "1rem"}}/>
                </>
            );
        } else {
            return (
                <Typography>No action possible for this request.</Typography>
            );
        }
    };
    return (
        <Card>
            <button
                style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                }}
                onClick={onClose}
                aria-label="close"
            >
                <CloseIcon/>
            </button>
            <CardContent>
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
                    {/*const requesterName = request.requestedBy ? `${request.requestedBy.firstName} ${request.requestedBy.lastName}` : 'Account Deleted';*/}

                    <Avatar
                        alt={request.requestedBy ? `${request.requestedBy.firstName} ${request.requestedBy.lastName}` : 'Account Deleted'}
                        src={request.profileImageUrl} sx={{width: 100, height: 100, marginRight: '1rem'}}/>
                    <div style={{marginRight: '1rem'}}>
                        <Typography variant="h6">
                            Request Detail
                        </Typography>
                        <Typography variant="body2" color="textSecondary" style={{marginBottom: '0.5rem'}}>
                            Requestor: {request.requestedBy ? `${request.requestedBy.firstName} ${request.requestedBy.lastName}` : 'Account Deleted'}
                        </Typography>
                    </div>
                    <div className='flex space-x-1 items-center'>
                        <div style={{marginRight: '0.25rem'}}>
                            <GoStarFill className='text-yellow-500'/>
                        </div>
                        <Typography variant="body2" color="text.secondary">
                            {request.rating}
                        </Typography>
                    </div>
                </div>
                <Divider sx={{marginBottom: '1rem'}}/>
                <Typography variant="body2">
                    Service Type: {request.serviceType}
                </Typography>
                <Typography variant="body2">
                    Appointment Start Time: {formatDateTime(request.timeslot?.start)}
                </Typography>
                <Typography variant="body2">
                    Appointment End Time: {formatDateTime(request.timeslot?.end)}
                </Typography>
                <Typography variant="body2" sx={{marginBottom: '2rem'}}>
                    Service Fee: {request.serviceFee}
                </Typography>
                <Typography variant="body2" sx={{marginBottom: '1rem'}}>
                    Status: {request.requestStatus}
                </Typography>
                <Divider sx={{marginBottom: '1rem'}}/>
                <Typography variant="body2" sx={{marginBottom: '1rem'}}>
                    Description: {request.comment}
                </Typography>
                {renderButton()}
            </CardContent>
        </Card>
    );
};

export default MediaCard;
