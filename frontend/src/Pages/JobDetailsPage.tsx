// src/components/JobDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Job } from '../models/Job';
import { Container, Typography, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import MediaCard from '../components/OfferedServiceCard';
// import ReviewList from './ReviewList';
import {Review} from "../models/Review"; // Assuming you have a component to list reviews

const JobDetailsPage: React.FC = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const [job, setJob] = useState<Job | null>(null);
    const { token } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await axios.get<Job>(`/api/jobs/${jobId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setJob(response.data);

                // Fetch reviews for the job
                const reviewsResponse = await axios.get<Review[]>(`/api/reviews/job/${jobId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setReviews(reviewsResponse.data);
            } catch (error) {
                console.error('Failed to fetch job details:', error);
            }
        };

        if (jobId) {
            fetchJob();
        }
    }, [jobId, token]);

    if (!job) {
        return <div>Loading...</div>;
    }

    const handleCancel = () => {
        // Implement cancel logic
    };

    const handleReview = () => {
        // Implement review logic
    };

    const handleComplete = () => {
        // Implement complete logic
    };

    const handleRevoke = () => {
        // Implement revoke logic
    };

    return (
        <Container>
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {job.serviceType} Job Details
                </Typography>
                <MediaCard
                    offeredService={job}
                    provider={job.provider}
                    receiver={job.receiver}
                    onComplete={handleComplete}
                    onCancel={handleCancel}
                    onReview={handleReview}
                    onRevoke={handleRevoke}
                    onClose={handleCancel}
                    // showExpandIcon={false} // Disable the expand icon for the details page
                />
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5">Reviews</Typography>
                    {/*<ReviewList reviews={reviews} /> /!* Render reviews *!/*/}
                </Box>
            </Box>
        </Container>
    );
};

export default JobDetailsPage;
