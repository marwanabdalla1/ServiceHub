import React, {useEffect} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {Container, Box, Typography, Button, Card, CardContent} from '@mui/material';
import {BookingDetails, useBooking} from '../../contexts/BookingContext';
import {Account} from "../../models/Account";
import {useAuth} from "../../contexts/AuthContext";


interface CreateAccountOrSignInProps {
    onNext: () => void;
    bookingDetails: BookingDetails;
}

function CreateAccountOrSignIn({onNext, bookingDetails}: CreateAccountOrSignInProps) {
    const {setRequestedBy} = useBooking();
    const navigate = useNavigate();
    const {offeringId} = useParams<{ offeringId: string }>(); // Get the offeringId from the route params
    const {token, account} = useAuth();

    const location = useLocation();
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
        navigate('/signup', {state: {from: location}});
    };

    const handleLoginClick = () => {
        navigate('/login', {state: {from: location}});
        // loginUser()
    };

    if (!account || !token) {
        return (
            <>

                <Typography variant="h4" gutterBottom>
                    Create account or sign in
                </Typography>
                <Button variant="contained" sx={{mb: 2, width: '100%'}} onClick={handleSignUpClick}>
                    Sign up with email
                </Button>
                <Button variant="text" sx={{width: '100%'}} onClick={handleLoginClick}>
                    Log in
                </Button>
            </>
        );
    }
    return null
}

export default CreateAccountOrSignIn;
