import * as React from 'react';
import Card from '@mui/material/Card';
import CloseIcon from '@mui/icons-material/Close';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import Button from '@mui/material/Button';
import {Job} from '../../../models/Job';
import {GoStarFill} from 'react-icons/go';
import BlackButton from '../../inputs/blackbutton';
import Avatar from '@mui/material/Avatar';
import {Divider, IconButton} from '@mui/material';
import {JobStatus} from '../../../models/enums';
import {useAuth} from '../../../contexts/AuthContext';
import axios from 'axios';
import {Account} from '../../../models/Account';
import {useEffect} from 'react';
import {formatDateTime} from '../../../utils/dateUtils';
import {useNavigate} from "react-router-dom";

interface MediaCardProps {
    offeredService: Job;
    provider: Account | null;
    receiver: Account | null;
    onClose: () => void;
    onComplete: (offeredService: Job) => void;
    onCancel: (offeredService: Job) => void;
    onReview: (offeredService: Job) => void;
    onRevoke: (offeredService: Job) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({
                                                 offeredService,
                                                 provider,
                                                 receiver,
                                                 onClose,
                                                 onComplete,
                                                 onCancel,
                                                 onReview,
                                                 onRevoke
                                             }) => {
    const {account, token,} = useAuth();

    const navigate = useNavigate();

    const handleExpandClick = () => {
        navigate(`/jobs/${offeredService._id}`);
    };

    const renderButton = () => {
        console.log(receiver, provider)
        //Check whether user in sign-in context is a provider
        if (offeredService.status === JobStatus.open && account?._id === offeredService.provider._id) {
            return (
                <>
                    <BlackButton text="Mark as Completed" onClick={() => onComplete(offeredService)}
                                 sx={{marginRight: "1rem"}}/>
                    <BlackButton text="Cancel Service" onClick={() => onCancel(offeredService)}
                                 sx={{marginRight: "1rem"}}/>
                </>
            );
        }
        if (offeredService.status === JobStatus.open && account?._id === offeredService.receiver._id) {
            return (<>
                <BlackButton text="Cancel Service" onClick={onClose}/>
            </>);
        } else if (offeredService.status === JobStatus.completed) {
            return (<>
                <BlackButton text="Write a Review" onClick={() => onReview(offeredService)} sx={{marginRight: "1rem"}}/>
                <BlackButton text="Revoke Completion" onClick={() => onRevoke(offeredService)}/>
            </>);
        } else {
            console.log(offeredService.status);
            return;

        }
    };
    return (
        <Card>
            <IconButton onClick={handleExpandClick}>
                <OpenInFullIcon />
            </IconButton>

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
                    <Avatar alt={receiver?.firstName + " " + receiver?.lastName} src={receiver?.profileImageUrl}
                            sx={{width: 100, height: 100, marginRight: '1rem'}}/>
                    <div style={{marginRight: '1rem'}}>
                        <Typography variant="h6">
                            Request Detail
                        </Typography>
                        <Typography variant="body2" color="textSecondary" style={{marginBottom: '0.5rem'}}>
                            Receiver: {receiver?.firstName + " " + receiver?.lastName}
                        </Typography>
                    </div>
                    <div className='flex space-x-1 items-center'>
                        <div style={{marginRight: '0.25rem'}}>
                            <GoStarFill className='text-yellow-500'/>
                        </div>
                        <Typography variant="body2" color="text.secondary">
                            {offeredService.rating}
                        </Typography>
                    </div>
                </div>
                <Divider sx={{marginBottom: '1rem'}}/>
                <Typography variant="body2">
                    Service Type: {offeredService.serviceType}
                </Typography>
                <Typography variant="body2">
                    Appointment Time: {formatDateTime(offeredService.appointmentStartTime)}
                </Typography>
                <Typography variant="body2" sx={{marginBottom: '2rem'}}>
                    Service Fee: {offeredService.serviceFee}
                </Typography>
                <Typography variant="body2" sx={{marginBottom: '1rem'}}>
                    Status: {offeredService.status}
                </Typography>
                <Divider sx={{marginBottom: '1rem'}}/>
                <Typography variant="body2" sx={{marginBottom: '1rem'}}>
                    Description: {offeredService.comment}
                </Typography>
                {renderButton()}
            </CardContent>
        </Card>
    );
};

export default MediaCard;
