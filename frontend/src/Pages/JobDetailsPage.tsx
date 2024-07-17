// src/components/JobDetailsPage.tsx
import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import {Job} from '../models/Job';
import {Container, Typography, Box, CircularProgress} from '@mui/material';
import {useAuth} from '../contexts/AuthContext';
import {Review} from "../models/Review"; // Assuming you have a component to list reviews
import GenericProviderCard from "../components/tableComponents/GenericProviderCard";
import GenericConsumerCard from "../components/tableComponents/GenericConsumerCard";
import {handleCancel, handleComplete, handleRevoke} from "../utils/jobHandler";
import {ServiceRequest} from "../models/ServiceRequest";
import useAlert from "../hooks/useAlert";
import AlertCustomized from "../components/AlertCustomized";
import useErrorHandler from "../hooks/useErrorHandler";
import ErrorPage from "./ErrorPage";
import ReviewCard from "../components/ReviewCard";
import BlackButton from "../components/inputs/blackbutton";
import {Account} from "../models/Account";

// Define the props interface
interface JobDetailsPageProps {
    // role: string;
}

type Item = ServiceRequest | Job;


// tood: modify this
const JobDetailsPage = () => {
        const {jobId} = useParams<{ jobId: string }>();
        const [job, setJob] = useState<Job | null>(null);
        const {token, account} = useAuth();
        const [reviews, setReviews] = useState<Review[]>([]);

        const [myReview, setMyReview] = useState<Review | undefined>(undefined);
        const [otherReview, setOtherReview] = useState<Review | undefined>(undefined);

        const [otherParty, setOtherParty] = React.useState<Account | null>(null);


        const [role, setRole] = useState<string | undefined>(undefined)
        const location = useLocation();
        const [redirectPath, setRedirectPath] = useState(() => location.state?.redirectPath || undefined);
        const [loading, setLoading] = useState(true);

        const {alert, triggerAlert, closeAlert} = useAlert(100000);

        // ref for review sections
        const reviewsRef = useRef<HTMLDivElement>(null);

        const [isEditing, setIsEditing] = useState(false);


        const [showNewReview, setShowNewReview] = useState(false);

        const navigate = useNavigate();


        useEffect(() => {
            setLoading(true);

            const fetchJob = async () => {
                try {

                    const response = await axios.get<Job>(`/api/jobs/${jobId}`, {
                        headers: {Authorization: `Bearer ${token}`},
                    });

                    if (!response) {
                        navigate("/not-found");
                        return;
                    }
                    console.log("job data with timeslot,", response.data)
                    const jobData = response.data;

                    // determine the role
                    if (account && jobData) {
                        const isProvider = account?._id.toString() === jobData.provider._id.toString();
                        const isConsumer = account?._id.toString() === jobData.receiver._id.toString();

                        const pathIncludesIncoming = location.pathname.includes("incoming");
                        const pathIncludesOutgoing = location.pathname.includes("outgoing");

                        if ((pathIncludesIncoming && !isProvider) || (pathIncludesOutgoing && !isConsumer)) {
                            navigate("/unauthorized");
                        } else if (isProvider) {
                            setRole("provider");
                            setOtherParty(jobData.receiver);
                            if (!redirectPath) {
                                setRedirectPath('/incoming/jobs');
                            }
                        } else if (isConsumer) {
                            setRole("consumer");
                            setOtherParty(jobData.provider);
                            if (!redirectPath) {
                                setRedirectPath('/outgoing/jobs');
                            }
                        } else {
                            // If neither, navigate to unauthorized
                            navigate("/unauthorized");
                        }

                        setJob(jobData);



                        // get the reviews
                        const reviewsResponse = await axios.get(`/api/reviews/by-jobs-all/${jobId}`, {
                            headers: {Authorization: `Bearer ${token}`},
                        });

                        if(!reviewsResponse){
                            setReviews([]);
                            setLoading(false);
                            return;
                        }

                        if (reviewsResponse.data && reviewsResponse.data.reviews && reviewsResponse.data.reviews.length > 0) {
                            console.log("success")
                            console.log("setting reviews", reviewsResponse.data.reviews)
                            setReviews(reviewsResponse.data.reviews);
                            console.log(reviews)

                            // Finding my review and other's review
                            const revFromMe = reviewsResponse.data.reviews.find((r: Review) => r.reviewer.toString() === account?._id.toString());
                            console.log("rev from me:", revFromMe)
                            if (revFromMe) {
                                setMyReview(revFromMe)
                            }
                            const revFromOther = reviewsResponse.data.reviews.find((r: Review) => r.recipient.toString() === account?._id.toString());
                            console.log("rev from other:", revFromOther)
                            if (revFromOther) {
                                setOtherReview(revFromOther)
                            }

                            console.log("My review: ", myReview);
                            console.log("Other review:", otherReview);
                            setLoading(false);
                        } else {
                            console.log('No reviews found');
                            setLoading(false);
                            setReviews([]);
                        }

                    }
                } catch (error:any) {
                    console.error('Failed to fetch job details:', error);
                    setLoading(false);
                    if (error.response.status && error.response.status === 403) {
                        navigate("/unauthorized")
                    } else {
                        return <ErrorPage title={"404 Not Found"}
                                          message={'The page you are looking for does not exist.'}/>;
                    }

                }

                console.log("reviews here:", reviews)
            };

            if (jobId) {
                fetchJob();
            }
        }, [jobId, token, account]);

        //
        // useEffect(() => {
        //     // Adjust paths based on role
        //     if (job) {
        //         const isProvider = account?._id.toString() === job.provider._id.toString();
        //         const isConsumer = account?._id.toString() === job.receiver._id.toString();
        //
        //         const pathIncludesIncoming = location.pathname.includes("incoming");
        //         const pathIncludesOutgoing = location.pathname.includes("outgoing");
        //
        //         if ((pathIncludesIncoming && !isProvider) || (pathIncludesOutgoing && !isConsumer)) {
        //             navigate("/unauthorized");
        //         } else if (isProvider) {
        //             setRole("provider");
        //             setOtherParty(job.receiver);
        //             if (!redirectPath) {
        //                 setRedirectPath('/incoming/jobs');
        //             }
        //         } else if (isConsumer) {
        //             setRole("consumer");
        //             setOtherParty(job.provider);
        //             if (!redirectPath) {
        //                 setRedirectPath('/outgoing/jobs');
        //             }
        //         } else {
        //             // If neither, navigate to unauthorized
        //             navigate("/unauthorized");
        //         }
        //     }
        // }, [job, account, token])

        // unmount
        // useEffect(() => {
        //
        //     return () => {
        //         setError(null)
        //     };
        // }, []);

        if (!job) {
            if (loading) {
                return (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                        <CircularProgress/>
                    </Box>
                )
            } else {
                console.log("error")
                // navigate("/not-found")
                return <ErrorPage title={"404 Not Found"} message={'The page you are looking for does not exist.'}/>;
                // return <ErrorPage title={"404 Not Found"} message={'The job you\'re looking for cannot be found.'}/>
            }
        }
        // // Authorization check
        // if ((role === "provider" && account?._id !== job.provider._id) ||
        //     (role === "consumer" && account?._id !== job.receiver._id)) {
        //     navigate("/unauthorized")
        // }


        const handleToggleNewReview = () => {
            setShowNewReview(!showNewReview); // Toggle visibility of the review card
        };

        const onCancel = async () => {
            if (!job) {
                console.error('No job selected');
                return;
            }
            try {
                await handleCancel({
                    selectedJob: job,
                    jobs: [],
                    setJobs: null,
                    token: token,
                    account: account,
                    setShowMediaCard: () => {
                    },
                });

                window.location.reload();
            } catch (error) {
                console.error('Error accepting request:', error);
                // Handle error appropriately if needed
            }

        };

        const onComplete = async () => {
            if (!job) {
                console.error('No job selected');
                return;
            }
            try {
                await handleComplete({
                    selectedJob: job,
                    jobs: [],
                    setJobs: null,
                    token: token,
                    setShowMediaCard: () => {
                    },
                    triggerAlert,
                });

                window.location.reload();
            } catch
                (error) {
                console.error('Error accepting request:', error);
                // Handle error appropriately if needed
            }
        };

// handle revoking completed job
        const onRevoke = async () => {
            if (!job) {
                console.error('No job selected');
                return;
            }
            try {
                await handleRevoke({
                    selectedJob: job,
                    jobs: [],
                    setJobs: null,
                    token: token,
                    setShowMediaCard: () => {
                    },
                });
                window.location.reload();

            } catch (error) {
                console.error('Error accepting request:', error);
                // Handle error appropriately if needed
            }

        };

        const handleReview = (job: Item) => {
            reviewsRef.current?.scrollIntoView({behavior: 'smooth'});

            if (!myReview) {
                setShowNewReview(!showNewReview);
            } else {
                setIsEditing(!isEditing);
            }

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

                    {job.status.toString() === "completed" &&
                        <Box ref={reviewsRef} sx={{mt: 4}}>
                            <Typography variant="h4">Reviews</Typography>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                                {/*<ReviewList reviews={reviews} /> /!* Render reviews *!/*/}
                                {otherReview ? (
                                    <Box sx={{width: '45%', p: 1}}>
                                        <Typography variant="h6" sx={{mt: 3}}>Review from {otherParty?.firstName} to
                                            you</Typography>
                                        <ReviewCard
                                            review={otherReview}
                                            job={job}
                                            reviewer={otherParty}
                                            recipient={account}
                                            onReviewUpdated={() => {
                                            }}
                                        />
                                    </Box>
                                ) : (<Typography variant="h6" sx={{mb: 2, mt: 3}}>{otherParty?.firstName} hasn't written a
                                    review
                                    yet.</Typography>)
                                }

                                {myReview ? (
                                    <Box sx={{width: '45%', p: 1}}>
                                        <Typography variant="h6" sx={{mt: 3}}>Your review
                                            to {otherParty?.firstName}:</Typography>
                                        <ReviewCard
                                            review={myReview}
                                            job={job}
                                            reviewer={account}
                                            recipient={otherParty}
                                            onReviewUpdated={() => {
                                            }}
                                            isEditing={isEditing}
                                            setIsEditing={setIsEditing}
                                        />
                                    </Box>
                                ) : (
                                    showNewReview ? (
                                        <Box sx={{width: '45%', p: 1}}>

                                            <ReviewCard
                                                job={job}
                                                reviewer={account}
                                                recipient={otherParty}
                                                onReviewUpdated={() => {
                                                    setShowNewReview(false);
                                                }}
                                                isEditing={true}
                                            />
                                        </Box>
                                    ) : (
                                        <Box sx={{
                                            width: '45%',
                                            p: 1,
                                            mt: 5,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <BlackButton
                                                text={`Write a review to ${otherParty?.firstName}`}
                                                onClick={handleToggleNewReview}
                                                sx={{marginRight: "1rem", fontSize: '14px', padding: "0.5rem 0.5rem"}}
                                            />
                                        </Box>
                                    )
                                )}

                            </Box>
                        </Box>}
                </Box>
            </Container>
        );
    }
;

export default JobDetailsPage;
