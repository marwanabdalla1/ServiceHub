import React, { useEffect } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import { Container, Box, Typography, Button, Card, CardContent } from '@mui/material';
import {BookingDetails, useBooking } from '../../contexts/BookingContext';
import {Account} from "../../models/Account";
import {useAuth} from "../../contexts/AuthContext";


interface CreateAccountOrSignInProps {
    onNext: () => void;
    onBack: () => void;
    bookingDetails: BookingDetails;
}

function CreateAccountOrSignIn({ onNext, onBack, bookingDetails }: CreateAccountOrSignInProps) {
    const { setRequestedBy} = useBooking();
    const navigate = useNavigate();
    const { offeringId } = useParams<{ offeringId: string }>(); // Get the offeringId from the route params
    const {token, account} = useAuth();

    // const isAuthenticated = true; // todo: Replace this with actual authentication logic

    useEffect(() => {
        console.log("Effect run check");
        if (account && token) {
            console.log("AUTHENTICATED!!!")
            setRequestedBy(account);
            console.log(account)
            onNext();
            // navigate('/update-profile');
        }
    }, [account]);


    //todo: implement this
    // const fetchUserFromAuthService = async (): Promise<Account> => {
    //     // Mock implementation: Replace with actual logic to fetch the authenticated user details
    //     return {
    //         _id: '666eda4dda888fe359668b63',
    //         firstName: 'John',
    //         lastName: 'Doe',
    //         email: 'john.doe@mail.com',
    //         phoneNumber: '1234567890',
    //         address: '123 Main St',
    //         location: 'Berlin',
    //         postal: "12345",
    //         country: "Germany",
    //         description: 'Enthusiastic and experienced bike repair technician.',
    //         isProvider: false,
    //         profileImageUrl: '',
    //         isPremium: true,
    //         createdOn: new Date('2024-06-16T12:27:57.086+00:00'),
    //         notifications: [],
    //         requestHistory: [],
    //         jobHistory: [],
    //         serviceOfferings: [],
    //         reviews: [],
    //         rating: 0,
    //         reviewCount: 0
    //     };
    // };


    // todo: make these navigate back to the booking page!
    const handleSignUpClick = () => {
        navigate('/signup');
    };

    const handleLoginClick = () => {
        navigate('/login');
        // loginUser()
    };

    if (!account || !token){
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Box sx={{ width: '60%' }}>
                        <Typography variant="h6" gutterBottom>
                            Step 1 of 3
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Button variant="outlined" onClick={onBack}>Back</Button>
                            {/*<Button variant="contained" onClick={onNext}>Next</Button>*/}
                        </Box>
                        <Typography variant="h4" gutterBottom>
                            Create account or sign in
                        </Typography>
                        <Button variant="contained" sx={{ mb: 2, width: '100%' }} onClick={handleSignUpClick}>
                            Sign up with email
                        </Button>
                        <Button variant="text" sx={{ width: '100%' }} onClick={handleLoginClick}>
                            Log in
                        </Button>
                    </Box>
                    <Box sx={{ width: '20%' }}>
                        <Card>
                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6">{`${bookingDetails.provider?.firstName} ${bookingDetails.provider?.lastName}`}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {bookingDetails.serviceOffering?.location}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {bookingDetails.serviceType}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {bookingDetails.price} per hour
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Container>
        );
    }
    return null
}

export default CreateAccountOrSignIn;
