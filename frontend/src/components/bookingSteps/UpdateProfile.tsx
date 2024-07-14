import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Container, Box, Typography, Card, CardContent, TextField, Button, Grid, Autocomplete} from '@mui/material';
import {useBooking, BookingDetails} from '../../contexts/BookingContext';
import axios from "axios";
import {useAuth} from "../../contexts/AuthContext";
import BookingSideCard from "../../components/BookingSideCard";
import {GERMAN_CITIES_SUPPORT} from "../../shared/Constants";
import {checkEmptyFields} from "../../validators/GeneralValidator";
import {isValidEmail, isValidName, isValidPhoneNumber, isValidPostalCode} from "../../validators/AccountDataValidator";
import {toast} from "react-toastify";


interface UpdateProfileProps {
    onNext: () => void;
    handleCancel: () => void;

    bookingDetails: BookingDetails;
}

// all the required data for user
interface UserDetails {
    firstName: string;
    lastName: string;
    address: string;
    postal: string;
    location: string;
    // email: string; //should not be changed here
    phoneNumber: string;

    [key: string]: string | number;  // Allows any string to index into the object, expecting a string or number value
}


function UpdateProfile({onNext, handleCancel, bookingDetails}: UpdateProfileProps) {
    // const { bookingDetails } = useBooking();
    const navigate = useNavigate();
    const {token} = useAuth();

    // Initialize state directly from bookingDetails.requestedBy
    const [userDetails, setUserDetails] = useState<UserDetails>({
        firstName: bookingDetails.requestedBy?.firstName || '',
        lastName: bookingDetails.requestedBy?.lastName || '',
        address: bookingDetails.requestedBy?.address || '',
        postal: bookingDetails.requestedBy?.postal || '',
        location: bookingDetails.requestedBy?.location || '',
        email: bookingDetails.requestedBy?.email || '',
        phoneNumber: bookingDetails.requestedBy?.phoneNumber || ''
    });

    console.log("requested by:", bookingDetails.requestedBy)


    const [editMode, setEditMode] = useState(false);
    const [isModified, setIsModified] = useState(false);


    useEffect(() => {
        // Check if any essential fields are missing and set edit mode accordingly
        setEditMode(isAnyFieldMissing());
    }, [bookingDetails.requestedBy]);

    // Function to check for missing fields
    const isAnyFieldMissing = () => {
        const fields = ['firstName', 'lastName', 'phoneNumber', 'address', 'postal', 'location']; // Extend based on required fields
        return fields.some(field => !userDetails[field]);
    };


    const handleSaveProfile = async () => {
        if (checkEmptyFields(userDetails.firstName, 'First Name') || checkEmptyFields(userDetails.lastName, 'Last Name') ||
            checkEmptyFields(userDetails.address, 'Address') || checkEmptyFields(userDetails.postal, 'Postal') ||
            checkEmptyFields(userDetails.location, 'City') || checkEmptyFields(userDetails.phoneNumber, 'Phone Number')) {
            return;
        }

        if (!isValidName(userDetails.firstName)) {
            toast.error('First Name should not contain numbers or invalid characters.');
            return;
        }

        if (!isValidName(userDetails.lastName)) {
            toast.error('Last Name should not contain numbers or invalid characters.');
            return;
        }

        if (!isValidPostalCode(userDetails.postal)) {
            toast.error('Invalid postal code');
            return;
        }

        if (!isValidPhoneNumber(userDetails.phoneNumber)) {
            toast.error('Invalid phone number');
            return;
        }

        const apiEndpoint = '/api/account/'
        console.log(userDetails)
        try {
            const response = await axios.put(apiEndpoint, userDetails, {
                headers: {'Authorization': `Bearer ${token}`},
            });
            console.log('User updated:', response.data);
            onNext();
        } catch (error) {
            console.error('Error updating user:', error);
        }

        // Handle save profile logic
        // navigate('/review-and-confirm');
    };


    return (
        // <Container>
        //     <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        //         <Box sx={{ width: '75%'  }}>
        <>
            <Typography variant="h4" gutterBottom>
                Please confirm your contact data
            </Typography>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        BASIC INFO
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="First Name"
                                fullWidth
                                variant="outlined"
                                value={userDetails.firstName}
                                InputProps={{
                                    readOnly: true,
                                }}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Last Name"
                                fullWidth
                                variant="outlined"
                                value={userDetails.lastName}
                                InputProps={{
                                    readOnly: true,
                                }}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Address"
                                fullWidth
                                variant="outlined"
                                value={userDetails.address}
                                onChange={e => {
                                    setUserDetails(prevDetails => ({...prevDetails, address: e.target.value}));
                                    setIsModified(true);
                                }}

                            />
                        </Grid>
                        <Grid item xs={5}>
                            <TextField
                                label="Postal"
                                fullWidth
                                variant="outlined"
                                value={userDetails.postal}
                                onChange={e => {
                                    setUserDetails(prevDetails => ({...prevDetails, postal: e.target.value}));
                                    setIsModified(true);
                                }}

                            />
                        </Grid>
                        <Grid item xs={7}>
                            <Autocomplete
                                options={Object.values(GERMAN_CITIES_SUPPORT)}
                                getOptionLabel={(option) => option}
                                value={userDetails.location}
                                onChange={(event, newValue) => {
                                    setUserDetails(prevDetails => ({...prevDetails, location: newValue || ''}));
                                    setIsModified(true);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="City"
                                        fullWidth
                                        autoComplete="address-level2"
                                        variant="outlined"
                                    />
                                )}
                            />
                        </Grid>

                        {/*email should not be changeable!*/}
                        <Grid item xs={6}>
                            <TextField
                                label="Email"
                                fullWidth
                                variant="outlined"
                                value={userDetails.email}
                                InputProps={{
                                    readOnly: true,
                                }}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Phone Number"
                                fullWidth
                                variant="outlined"
                                value={userDetails.phoneNumber}
                                onChange={e => setUserDetails({...userDetails, phoneNumber: e.target.value})}
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
                        <Button variant="contained" sx={{mr: 2}} onClick={isModified ? handleSaveProfile : onNext}
                                disabled={isAnyFieldMissing()}>
                            {isModified ? "Save" : "Confirm"}
                        </Button>
                        {/*todo: handle cancel*/}
                        <Button variant="outlined" onClick={handleCancel}>Cancel </Button>
                    </Box>
                </CardContent>
            </Card>

        </>

    );
}

export default UpdateProfile;
