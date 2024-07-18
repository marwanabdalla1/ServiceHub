import React, {useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import { Typography, Button} from '@mui/material';
import {BookingDetails, useBooking} from '../../contexts/BookingContext';
import {useAuth} from "../../contexts/AuthContext";


interface CreateAccountOrSignInProps {
    onNext: () => void;
    bookingDetails: BookingDetails;
}

// step one of booking (skipped if the user is already signed in)
function CreateAccountOrSignIn({onNext, bookingDetails}: CreateAccountOrSignInProps) {
    const {setRequestedBy} = useBooking();
    const navigate = useNavigate();
    const {token, account} = useAuth();

    const location = useLocation();

    useEffect(() => {
        if (account && token) {
            setRequestedBy(account);
            onNext();
        }
    }, [account]);


    const handleSignUpClick = () => {
        navigate('/signup', {state: {from: location}});
    };

    const handleLoginClick = () => {
        navigate('/login', {state: {from: location}});
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
