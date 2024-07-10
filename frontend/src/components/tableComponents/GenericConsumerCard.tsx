// GenericServiceCard.js
import React, {useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import BlackButton from '../inputs/blackbutton';
import {ServiceRequest} from "../../models/ServiceRequest";
import {Job} from "../../models/Job";
import {useAuth} from "../../contexts/AuthContext";
import {Account} from "../../models/Account";
import {Button, Divider, IconButton} from "@mui/material";
import {JobStatus, RequestStatus} from "../../models/enums";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import CloseIcon from "@mui/icons-material/Close";
import {redirect, useNavigate} from "react-router-dom";
import {formatDateTime} from "../../utils/dateUtils";


type Item = ServiceRequest | Job;


interface GenericConsumerCardProps {
    item: Item;
    provider: Account | null;
    receiver: Account | null;

    onClose: () => void;
    inDetailPage: boolean;
    redirectPath?: string;


    // actions, depending on if it's job or request
    actions: {
        // for requests
        cancelRequest?: (item: Item) => void;
        // proposeNewTime?: (item: Item) => void; //not really needed

        // for jobs
        cancelJob?: (item: Item) => void;
        review?: (item: Item) => void;
    };

}

// Helper to determine if item is a Job
const isJob = (item: Item): item is Job => {
    console.log("is item job?", (item as Job).receiver !== undefined);
    return (item as Job).receiver !== undefined; // Or any other unique property of Job
};

// const isJob = (item as Job).receiver !== undefined;  // Assuming 'receiver' is unique to Job


const GenericConsumerCard: React.FC<GenericConsumerCardProps> = ({
                                                                     item,
                                                                     inDetailPage,
                                                                     redirectPath,
                                                                     provider,
                                                                     receiver,
                                                                     onClose,
                                                                     actions
                                                                 }) => {

    const {account, token, isProvider} = useAuth();
    const [isInDetailPage, setIsInDetailPage] = useState(inDetailPage); // Example initial state

    const navigate = useNavigate();

    const handleProposeNewTime = (request: ServiceRequest) => {
        navigate(`/change-booking-time/${request._id}`); // Navigate to the calendar to select a new Timeslot
    }

    // todo: check account is correct consumer otherwise not authorized?

    const renderActions = () => {
        const buttons = [];
        if (!isJob(item)) {
            // ServiceRequest actions
            if (item.requestStatus === "cancelled") {
                console.log("No Actions possible for CANCELLED requests!");
            } else if (item.requestStatus === RequestStatus.declined) {
                console.log("No Actions possible for DECLINED requests!");
                // } else if (item.requestStatus === RequestStatus.accepted) {
                //     buttons.push(<BlackButton text="Cancel Request" onClick={() => actions.cancelRequest?.(item)}
                //                               sx={{marginRight: "1rem"}}/>);
            } else if (actions.cancelRequest && ["pending", "accepted", "action needed from requestor"].includes(item.requestStatus)) {
                buttons.push(<BlackButton text="Cancel Request" onClick={() => actions.cancelRequest?.(item)}
                                          sx={{marginRight: "1rem"}}/>);

            }
            if (item.requestStatus === "action needed from requestor") {
                buttons.push(<BlackButton text="Action Needed: Change Time" onClick={() => handleProposeNewTime(item)}
                                          sx={{marginRight: "1rem"}}/>);
            }

        } else {
            // Job actions
            if (actions.cancelJob && item.status === "open") {
                buttons.push(
                    <BlackButton text="Cancel Job" onClick={() => actions.cancelJob?.(item)}
                                 sx={{marginRight: "1rem"}}/>);

            }
            if (actions.review && item.status === "completed") {
                buttons.push(
                    <BlackButton text="Review" onClick={() => actions.review?.(item)}
                                 sx={{marginRight: "1rem"}}/>);
            }
        }
        return buttons;
    };

    const handleIconClick = () => {
        setIsInDetailPage(!isInDetailPage);
        if (inDetailPage) {
            if (redirectPath) {
                navigate(redirectPath)
            } else {
                if (isJob(item)) {
                    navigate('/outgoing/jobs');
                } else {
                    navigate('/outgoing/requests');
                }
            }

        } else {
            if (isJob(item)) {
                navigate(`/outgoing/jobs/${item._id}`);
            } else {
                navigate(`/outgoing/requests/${item._id}`);
            }
        }
    };

    const generalStatus = 'requestStatus' in item ? item.requestStatus : JobStatus[item.status];


    return (
        <Card>
            <IconButton onClick={handleIconClick}>
                {inDetailPage ? <CloseFullscreenIcon/> : <OpenInFullIcon/>}
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
                    {/*todo: profile image!*/}
                    <Avatar alt={provider?.firstName + " " + receiver?.lastName} src={provider?.profileImageUrl}
                            sx={{width: 100, height: 100, marginRight: '0.5rem'}}/>
                    <div style={{marginRight: '1rem', textAlign: 'left'}}>
                        <Typography variant="h6">
                            {isJob(item) ? "Job Detail" : "Request Detail"}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" style={{marginBottom: '0.5rem'}}>
                            Provider: {provider?.firstName + " " + provider?.lastName}
                        </Typography>
                    </div>
                </div>

                <Divider sx={{marginBottom: '1rem'}}/>
                <Typography variant="body2" marginBottom={2}>
                    {isJob(item) ? "Job ID" : "Request ID"}: {item._id}
                </Typography>
                <Typography variant="body2">
                    Service Type: {item.serviceType}
                </Typography>
                <Typography variant="body2">
                    Appointment Start Time: {formatDateTime(item.timeslot?.start)}
                </Typography>
                <Typography variant="body2">
                    Appointment End Time: {formatDateTime(item.timeslot?.end)}
                </Typography>
                <Typography variant="body2" sx={{marginBottom: '2rem'}}>
                    Service Fee: €{item.serviceFee} per hour
                </Typography>
                <Typography variant="body2" sx={{marginBottom: '1rem'}}>
                    Status: {generalStatus}
                </Typography>
                <Divider sx={{marginBottom: '1rem'}}/>
                <Typography variant="body2" sx={{marginBottom: '1rem'}}>
                    Description: {item.comment}
                </Typography>
                {renderActions()}
            </CardContent>
        </Card>
    );
};

export default GenericConsumerCard;
