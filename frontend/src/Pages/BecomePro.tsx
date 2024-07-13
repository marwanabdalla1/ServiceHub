import React, {useEffect, useState} from 'react';
import {Card, CardContent, Box, Avatar, Typography, Rating} from '@mui/material';
import '@fortawesome/fontawesome-free/css/all.min.css';
import BlackButton from '../components/inputs/blackbutton';
import {loadStripe} from '@stripe/stripe-js';
import axios from 'axios';
import {useAuth} from '../contexts/AuthContext';
import {Feedback} from '../models/Feedback';
import {defaultProfileImage, fetchFeedbackProfileImages} from "../services/filterProfileImage";

const stripePromise = loadStripe('pk_test_51NEdzDChuUsrK8kGX1Wcu8TazsmDPprhV212alFOg78GS9W3FW8JLv1S6FyJnirCaj4f5UevhfUetfDSxIvATSHp003QYXNJYT');

const BecomeProPage: React.FC = () => {
    const {token} = useAuth();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [feedbackProfileImages, setFeedbackProfileImages] = useState<{ [key: string]: string }>({});
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get<Feedback[]>('/api/feedback/premium-upgrade', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setFeedbacks(response.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        fetchReviews();
    }, [token]);


// Use the useEffect hook to call the new function when reviews change
    useEffect(() => {
        if (feedbacks.length > 0) {
            fetchFeedbackProfileImages(feedbacks).then(images => {
                setFeedbackProfileImages(images);
            });
        }
    }, [feedbacks]);


    const handleJoinNow = async () => {
        try {
            const response = await axios.post('/api/becomepro/payment',
                {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            const sessionId = response.data.id;
            const stripe = await stripePromise;

            if (!stripe) {
                throw new Error('Stripe failed to initialize');
            }

            const {error} = await stripe.redirectToCheckout({sessionId});

            if (error) {
                console.error('Error:', error.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className='flex flex-col items-center justify-center mt-4'>
            <div className="w-3/4 flex flex-col rounded md:flex-row items-center bg-customGreen pl-8">
                <div className="text-left">
                    <h1 className="text-4xl font-bold mb-4">ServiceHub: Connecting You to the Best, for All Your
                        Needs!</h1>
                    <BlackButton className="py-2" text="Join Now" onClick={handleJoinNow}/>
                </div>
                <div className="md:mt-0 mr-0">
                    <img src="/images/handshake.png" alt="Handshake" className="w-full"/>
                </div>
            </div>
            {/* Review Section */}
            <div className="w-3/4 mt-8">
                <h2 className="text-3xl font-bold mb-4">What Our Pro Members Say</h2>
                <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                    {feedbacks.map((feedback) => (
                        <Card key={feedback._id} sx={{mb: 2}}>
                            <CardContent>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <Avatar
                                        src={feedbackProfileImages[feedback.givenBy._id] || defaultProfileImage}
                                        sx={{mr: 2}}
                                        alt={feedback.title}
                                    />
                                    <h5 className="text-lg font-bold text-gray-900 mr-2">{feedback.title}</h5>
                                </Box>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <Rating precision={0.5} value={feedback.rating} readOnly/>
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {feedback.content}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Feedback given by {feedback.givenBy.firstName} {feedback.givenBy.lastName} on {new Date(feedback.createdAt).toLocaleDateString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}

                </div>
            </div>
        </div>
    );
};

export default BecomeProPage;
