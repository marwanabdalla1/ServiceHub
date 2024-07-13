// src/components/JobDetailsPage.tsx
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import {Job} from '../models/Job';
import {Container, Typography, Box} from '@mui/material';
import {useAuth} from '../contexts/AuthContext';
import {Review} from "../models/Review"; // Assuming you have a component to list reviews
import handleAccept from "./TablePages/IncomingRequestsTable"
import GenericProviderCard from "../components/tableComponents/GenericProviderCard";
import GenericConsumerCard from "../components/tableComponents/GenericConsumerCard";
import {handleCancel, handleComplete, handleRevoke} from "../utils/jobHandler";
import {ServiceRequest} from "../models/ServiceRequest";
import useAlert from "../hooks/useAlert";
import AlertCustomized from "../components/AlertCustomized";
import useErrorHandler from "../hooks/useErrorHandler";
import ErrorPage from "./ErrorPage";

// Define the props interface
interface JobDetailsPageProps {
    // role: string;
}

type Item = ServiceRequest | Job;


// tood: modify this
const JobDetailsPage: React.FC<JobDetailsPageProps> = () => {
    const {jobId} = useParams<{ jobId: string }>();
    const [job, setJob] = useState<Job | null>(null);
    const {token, account} = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);

    const {error, setError, handleError} = useErrorHandler();

    const [role, setRole] = useState<string | undefined>(undefined)
    const location = useLocation();
    const [redirectPath, setRedirectPath] = useState(() => location.state?.redirectPath || undefined);
    const [loading, setLoading] = useState(true);

    const {alert, triggerAlert, closeAlert} = useAlert(100000);


    const navigate = useNavigate();


    useEffect(() => {
        setLoading(true);

        const fetchJob = async () => {
            try {

                const response = await axios.get<Job>(`/api/jobs/${jobId}`, {
                    headers: {Authorization: `Bearer ${token}`},
                });
                setJob(response.data);
                setLoading(false);

                console.log(response)
                if (!response) {
                    setError({title: '404 Not Found', message: 'The job you\'re looking for cannot be found.'});
                    return;
                }

                // Fetch reviews for the job
                try {
                    const reviewsResponse = await axios.get<Review[]>(`/api/reviews/by-jobs/${jobId}`, {
                        headers: {Authorization: `Bearer ${token}`},
                    });

                    console.log("reviews response", reviewsResponse)

                    if (!reviewsResponse) {
                        console.log('No reviews found');
                        setReviews([]);
                    } else {
                        setReviews(reviewsResponse.data);
                    }
                } catch (error) {
                    setReviews([]);
                }
            } catch (error) {
                console.error('Failed to fetch job details:', error);
                setLoading(false);
                handleError(error)


            }
        };

        if (jobId) {
            fetchJob();
        }
    }, [jobId, token]);


    useEffect(() => {
        // Adjust paths based on role
        if (job) {
            const isProvider = account?._id === job.provider._id;
            const isConsumer = account?._id === job.receiver._id;

            const pathIncludesIncoming = location.pathname.includes("incoming");
            const pathIncludesOutgoing = location.pathname.includes("outgoing");

            if ((pathIncludesIncoming && !isProvider) || (pathIncludesOutgoing && !isConsumer)) {
                navigate("/unauthorized");
            } else if (isProvider) {
                setRole("provider");
                if (!redirectPath) {
                    setRedirectPath('/incoming/jobs');
                }
            } else if (isConsumer) {
                setRole("consumer");
                if (!redirectPath) {
                    setRedirectPath('/outgoing/jobs');
                }
            } else {
                // If neither, navigate to unauthorized
                navigate("/unauthorized");
            }
        }
    }, [job, account, token])

    // unmount
    useEffect(() => {
        return () => {
            setError(null);
        };
    }, []);

    if (!job) {
        if (loading) {
            return <Typography>Loading...</Typography>
        } else {
            console.log("error")
            return <ErrorPage title={"404 Not Found"} message={'The job you\'re looking for cannot be found.'}/>
        }
    }
    // // Authorization check
    // if ((role === "provider" && account?._id !== job.provider._id) ||
    //     (role === "consumer" && account?._id !== job.receiver._id)) {
    //     navigate("/unauthorized")
    // }



    if (error) {
        console.log("youre in iferror", error)
        return <ErrorPage title={error.title} message={error.message}/>
    }


    const onCancel = () => {
        if (!job) {
            console.error('No job selected');
            return;
        }
        handleCancel({
            selectedJob: job,
            jobs: [],
            setJobs: null,
            token: token,
            account: account,
            setShowMediaCard: () => {
            },
        });

        window.location.reload();
    };

    const onComplete = () => {
        if (!job) {
            console.error('No job selected');
            return;
        }
        handleComplete({
            selectedJob: job,
            jobs: [],
            setJobs: null,
            token: token,
            setShowMediaCard: () => {
            },
            triggerAlert,
        });

        window.location.reload();
    };

    // handle revoking completed job
    const onRevoke = () => {
        if (!job) {
            console.error('No job selected');
            return;
        }
        handleRevoke({
            selectedJob: job,
            jobs: [],
            setJobs: null,
            token: token,
            setShowMediaCard: () => {
            },
        });

        window.location.reload();
    };

    const handleReview = (job: Item) => {
        navigate(`/customer_review/${job._id}`);
    };


    const providerProps = {
        item: job,
        provider: job.provider,
        receiver: job.receiver,
        onClose: () => {
        },
        inDetailPage: true,
        redirectPath: redirectPath,


        actions: {
            cancelJob: onCancel,      // Placeholder function
            complete: onComplete,
            review: () => handleReview(job),
            revoke: onRevoke
        }
    };

    const consumerProps = {
        item: job,
        provider: job.provider,
        receiver: job.receiver,
        onClose: () => {
        },
        inDetailPage: true,
        redirectPath: redirectPath,
        actions: {
            cancelJob: onCancel,      // Placeholder function
            review: () => handleReview(job)
        }
    };


    const CardComponent = role === "provider" ? GenericProviderCard : GenericConsumerCard;
    const cardProps = role === "provider" ? providerProps : consumerProps;

    return (
        <Container>
            <div>
                {/*<button onClick={handleAction}>Do Something</button>*/}
                <AlertCustomized alert={alert} closeAlert={closeAlert}/>
            </div>

            <Box sx={{mt: 4}}>
                <Typography variant="h4" gutterBottom>
                    {job.serviceType} Job Details
                </Typography>
                <CardComponent {...cardProps} />

                {/*<MediaCard*/}
                {/*    offeredService={job}*/}
                {/*    provider={job.provider}*/}
                {/*    receiver={job.receiver}*/}
                {/*    onComplete={handleAccept}*/}
                {/*    onCancel={handleCancel}*/}
                {/*    onReview={handleReview}*/}
                {/*    onRevoke={handleRevoke}*/}
                {/*    onClose={handleCancel}*/}
                {/*    // showExpandIcon={false} // Disable the expand icon for the details page*/}
                {/*/>*/}
                <Box sx={{mt: 4}}>
                    <Typography variant="h5">Reviews</Typography>
                    {/*<ReviewList reviews={reviews} /> /!* Render reviews *!/*/}
                </Box>
            </Box>
        </Container>
    );
};

export default JobDetailsPage;
