// GenericServiceCard.js
import React, {useEffect, useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import BlackButton from '../inputs/blackbutton';
import {ServiceRequest} from "../../models/ServiceRequest";
import {Job} from "../../models/Job";
import {useAuth} from "../../contexts/AuthContext";
import {Account} from "../../models/Account";
import {Divider, IconButton} from "@mui/material";
import {JobStatus, RequestStatus} from "../../models/enums";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import CloseIcon from "@mui/icons-material/Close";
import {useNavigate} from "react-router-dom";
import {formatDateTime} from "../../utils/dateUtils";
import {defaultProfileImage, fetchProfileImageById} from "../../services/fetchProfileImage";
import Link from "@mui/material/Link";
import {Link as RouterLink} from 'react-router-dom';
import axios from "axios";
import {GoStarFill} from "react-icons/go";


type Item = ServiceRequest | Job;


interface GenericProviderCardProps {
    item: Item;
    provider: Account | null;
    receiver: Account | null;

    onClose: () => void;
    inDetailPage: boolean;
    redirectPath?: string;


    // actions, depending on if it's job or request
    actions: {
        // for requests
        accept?: (item: Item) => void;
        decline?: (item: Item) => void;
        cancelRequest?: (item: Item) => void;
        changeTime?: (value: boolean) => void;

        // for jobs
        cancelJob?: (item: Item) => void;
        complete?: (item: Item) => void;
        review?: (item: Item) => void;
        revoke?: (item: Item) => void;
    };

}

// Helper to determine if item is a Job
const isJob = (item: Item): item is Job => {
    return (item as Job).receiver !== undefined; // Or any other unique property of Job
};


const GenericProviderCard: React.FC<GenericProviderCardProps> = ({
                                                                     item,
                                                                     inDetailPage,
                                                                     redirectPath,
                                                                     provider,
                                                                     receiver,
                                                                     onClose,
                                                                     actions
                                                                 }) => {

        const {account, token, isProvider} = useAuth();
        const navigate = useNavigate();
        const [profileImage, setProfileImage] = useState<string | null>(null);

        // score of the consumer
        const [averageScore, setAverageScore] = useState<number>(0); // State to store average score
        const [consumerReviewsCount, setConsumerReviewsCount] = useState<number>(0); // State to store average score


        useEffect(() => {
            if (token && account && receiver) {
                fetchProfileImageById(receiver._id).then((image) => {
                    setProfileImage(image);
                });


                // Fetch the score of the consumer
                const getConsumerScore = async (accountId: string) => {
                    try {
                        const response = await axios.get(`/api/reviews/score/${accountId}`, {
                            headers: {Authorization: `Bearer ${token}`},
                        });
                        if (response && response.data) {
                            setAverageScore(response.data.averageScore);
                            setConsumerReviewsCount(response.data.count);

                        } else {
                            setAverageScore(0);
                        }
                    } catch (error) {
                        setAverageScore(0);
                    }
                }

                getConsumerScore(receiver._id.toString())

            }

        }, [token, account, receiver]);

        const renderActions = () => {
            const buttons = [];
            if (!isJob(item)) {

                // ServiceRequest actions
                if (item.requestStatus === "cancelled") {
                    //no actions possible
                } else if (item.requestStatus === RequestStatus.declined) {
                    //no actions possible
                } else if (item.requestStatus === RequestStatus.accepted && item.job) {
                    buttons.push(<BlackButton text="View Job" onClick={() => navigate(`/incoming/jobs/${item.job}`)}
                                              sx={{marginRight: "1rem", padding: "0.5rem 0.5rem"}}/>);
                } else if (item.requestStatus === "pending" && item.timeslot) {
                    buttons.push(<BlackButton text="Accept" onClick={() => actions.accept?.(item)}
                                              sx={{marginRight: "1rem", padding: "0.5rem 0.5rem"}}/>);
                    buttons.push(<BlackButton text="Decline" onClick={() => actions.decline?.(item)}
                                              sx={{marginRight: "1rem", padding: "0.5rem 0.5rem"}}/>);
                    buttons.push(<BlackButton text="Request Time Change" onClick={() => actions.changeTime?.(true)}
                                              sx={{marginRight: "1rem", padding: "0.5rem 0.5rem"}}/>);

                } else if (item.requestStatus === "pending" && !item.timeslot) {
                    buttons.push(<BlackButton text="Timeslot invalid. Click to cancel request"
                                              onClick={() => actions.cancelRequest?.(item)}
                                              sx={{marginRight: "1rem", padding: "0.5rem 0.5rem"}}/>);
                }
                if (actions.cancelRequest && ["action needed from requester"].includes(item.requestStatus)) {
                    buttons.push(<BlackButton text="Cancel Request" onClick={() => actions.cancelRequest?.(item)}
                                              sx={{marginRight: "1rem", padding: "0.5rem 0.5rem"}}/>);

                }

            } else {
                // Job actions
                if (actions.complete && item.status === "open") {
                    buttons.push(
                        <BlackButton text="Mark as Completed" onClick={() => actions.complete?.(item)}
                                     sx={{marginRight: "1rem", padding: "0.5rem 0.5rem"}}/>);
                }

                if (actions.cancelJob && item.status === "open") {
                    buttons.push(
                        <BlackButton text="Cancel Job" onClick={() => actions.cancelJob?.(item)}
                                     sx={{marginRight: "1rem", padding: "0.5rem 0.5rem"}}/>);

                }
                if (actions.review && item.status === "completed") {
                    buttons.push(
                        <BlackButton text="Review" onClick={() => actions.review?.(item)}
                                     sx={{marginRight: "1rem", padding: "0.5rem 0.5rem"}}/>);
                }
                if (actions.revoke && item.status === "completed") {
                    buttons.push(
                        <BlackButton text="Revoke Completion" onClick={() => actions.revoke?.(item)}
                                     sx={{marginRight: "1rem", padding: "0.5rem 0.5rem"}}/>);

                }
            }
            return buttons;
        };

        const handleIconClick = () => {
            if (inDetailPage)
                if (redirectPath) {
                    navigate(redirectPath)
                } else {

                    if (isJob(item)) {
                        navigate('/incoming/jobs');
                    } else {
                        navigate('/incoming/requests');
                    }

                }
            else {
                if (isJob(item)) {
                    navigate(`/incoming/jobs/${item._id}`);
                } else {
                    navigate(`/incoming/requests/${item._id}`);
                }
            }
        };

        const generalStatus = 'requestStatus' in item ? item.requestStatus : JobStatus[item.status];

        return (
            <Card>
                {/*render button depending on if we are in detailed page*/}
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

                {/*details*/}
                <CardContent>
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
                        <Avatar alt={receiver?.firstName + " " + receiver?.lastName}
                                src={receiver ? profileImage || undefined : defaultProfileImage}
                                sx={{width: 100, height: 100, marginRight: '0.5rem'}}/>
                        <div style={{marginRight: '1rem', textAlign: 'left'}}>
                            <Typography variant="h6">
                                {isJob(item) ? "Job Detail" : "Request Detail"}
                            </Typography>
                            <div style={{display: "flex", justifyContent: "space-between"}}>
                                <Typography variant="body1" color="textPrimary" marginRight={2}>
                                    Receiver: {receiver?.firstName + " " + receiver?.lastName}
                                </Typography>
                                {Number(consumerReviewsCount) !== 0 && (
                                    <div style={{display: "flex", justifyContent: "start"}}>
                                        <GoStarFill className='text-yellow-500'/>
                                        <Typography variant="body2" color="text.secondary">
                                            {averageScore} ({consumerReviewsCount})
                                        </Typography>
                                    </div>
                                )}
                            </div>
                            <Typography variant="body2" color="textSecondary">
                                Email: <a href={`mailto:${receiver?.email}`}
                                          style={{color: 'inherit', textDecoration: 'none'}}>{receiver?.email}</a>
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {receiver?.phoneNumber ? (
                                    <a href={`tel:${receiver.phoneNumber}`}
                                       style={{color: 'inherit', textDecoration: 'none'}}>
                                        Phone: {receiver.phoneNumber}
                                    </a>
                                ) : ""}
                            </Typography>

                        </div>
                    </div>

                    <Divider sx={{marginBottom: '1rem'}}/>
                    <Typography variant="body2" marginBottom={2}>
                        {isJob(item) ? "Job ID" : "Request ID"}: {item._id}
                    </Typography>
                    <div style={{display: 'grid', gridTemplateColumns: 'max-content auto', gap: '0.5rem'}}>

                        <Typography variant="body2" color="text.secondary" component="span">Service Type:</Typography>
                        <Typography variant="body2" component="span">
                            {item.serviceOffering ? (
                                <Link
                                    component={RouterLink}
                                    to={`/offerings/${item.serviceOffering}`}
                                    underline="hover"
                                    sx={{color: 'inherit', textDecoration: 'none'}}
                                >
                                    {item.serviceType}
                                </Link>
                            ) : (
                                item.serviceType
                            )}
                        </Typography>


                        <Typography variant="body2" color="text.secondary" component="span">
                            Address:
                        </Typography>
                        <Typography variant="body2" component="span">
                            {receiver?.address}, {receiver?.postal} {receiver?.location}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" component="span">
                            Appointment Start Time:
                        </Typography>
                        <Typography variant="body2" component="span">
                            {item.timeslot ? formatDateTime(item.timeslot.start) : formatDateTime(item.appointmentStartTime) + " (invalid)"}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" component="span">
                            Appointment End Time:
                        </Typography>
                        <Typography variant="body2" component="span">
                            {item.timeslot ? formatDateTime(item.timeslot.end) : formatDateTime(item.appointmentEndTime) + " (invalid)"}
                        </Typography>


                        <Typography variant="body2" color="text.secondary" sx={{marginBottom: '1rem'}} component="span">
                            Service Fee:
                        </Typography>
                        <Typography variant="body2" component="span" sx={{marginBottom: '1rem'}}>
                            €{item.serviceFee} per hour
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{marginBottom: '1rem'}} component="span">
                            Status:
                        </Typography>
                        <Typography variant="body2" sx={{marginBottom: '1rem'}} component='span'>
                            {generalStatus}
                        </Typography>

                        {item.comment && item.comment.trim() && (
                            <>
                                <Typography variant="body2" color="text.secondary" sx={{marginBottom: '1rem'}}
                                            component="span">
                                    Description:
                                </Typography>
                                <Typography variant="body2" sx={{marginBottom: '1rem'}} component='span'>
                                    {item.comment}
                                </Typography>
                            </>
                        )}

                    </div>
                    <div style={{display: 'flex', flexWrap: 'nowrap', overflowX: 'auto'}}>
                        {renderActions()}
                    </div>

                    <Typography variant="body2" color="textSecondary" sx={{marginTop: 2, fontSize: '0.7rem'}}>
                        Last Updated: {formatDateTime(item.updatedAt)}
                    </Typography>
                </CardContent>
            </Card>
        );
    }
;

export default GenericProviderCard;
