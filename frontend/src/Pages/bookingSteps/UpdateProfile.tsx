import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Card, CardContent, TextField, Button, Grid } from '@mui/material';
import { useBooking, BookingDetails } from '../../contexts/BookingContext';
import axios from "axios";
import {useAuth} from "../../contexts/AuthContext";


interface UpdateProfileProps {
    onNext: () => void;
    onBack: () => void;
    bookingDetails: BookingDetails;
}

// all the required data for user
interface UserDetails {
    firstName: string;
    lastName: string;
    address: string;
    postal: string ;
    location: string;
    country: string;
    // email: string; //should not be changed here
    phoneNumber: string;
    [key: string]: string | number;  // Allows any string to index into the object, expecting a string or number value
}


function UpdateProfile({ onNext, onBack, bookingDetails}: UpdateProfileProps) {
    // const { bookingDetails } = useBooking();
    const navigate = useNavigate();
    const { token } = useAuth();

    // Initialize state directly from bookingDetails.requestedBy
    const [userDetails, setUserDetails] = useState<UserDetails>({
        firstName: bookingDetails.requestedBy?.firstName || '',
        lastName: bookingDetails.requestedBy?.lastName || '',
        address: bookingDetails.requestedBy?.address || '',
        postal: bookingDetails.requestedBy?.postal || '',
        location: bookingDetails.requestedBy?.location || '',
        country: bookingDetails.requestedBy?.country || '',
        // email: bookingDetails.requestedBy?.email || '',
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
        const fields = ['firstName', 'lastName', 'phoneNumber', 'address', 'postal', 'location', 'country']; // Extend based on required fields
        return fields.some(field => !userDetails[field]);
    };


    const handleSaveProfile = async() => {
        const apiEndpoint = '/api/account/'
        console.log(userDetails)
        try {
            const response = await axios.put(apiEndpoint, userDetails, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            console.log('User updated:', response.data);
            onNext();
        } catch (error) {
            console.error('Error updating user:', error);
        }

        // Handle save profile logic
        // navigate('/review-and-confirm');
    };

    const handleCancel = () => {
        navigate(`/offerings/${bookingDetails.serviceOffering?._id}`);
    };


    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Box sx={{ width: '60%'  }}>
                    <Typography variant="h6" gutterBottom>
                        Step 3 of 3
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Please confirm your contact data
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button variant="outlined" onClick={onBack}>Back</Button>
                        {/*<Button variant="contained" onClick={onNext}>Next</Button>*/}
                    </Box>
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
                                        onChange={e => {setUserDetails(prevDetails => ({...prevDetails, firstName: e.target.value}));
                                            setIsModified(true);
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Last Name"
                                        fullWidth
                                        variant="outlined"
                                        value={userDetails.lastName}
                                        onChange={e =>
                                        {setUserDetails(prevDetails => ({...prevDetails, lastName: e.target.value}));
                                        setIsModified(true);
                                        }}

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
                                <Grid item xs={3}>
                                    <TextField
                                        label="Postal"
                                        fullWidth
                                        variant="outlined"
                                        value={userDetails.postal}
                                        onChange={e => {setUserDetails(prevDetails => ({...prevDetails, postal: e.target.value}));
                                            setIsModified(true);

                                        }}

                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        label="City"
                                        fullWidth
                                        variant="outlined"
                                        value={userDetails.location}
                                        onChange={e => {setUserDetails(prevDetails => ({...prevDetails, location: e.target.value}));
                                            setIsModified(true);
                                        }}

                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        label="Country"
                                        fullWidth
                                        variant="outlined"
                                        value={userDetails.country}
                                        onChange={e => {setUserDetails(prevDetails => ({...prevDetails, country: e.target.value}))
                                            setIsModified(true);
                                        }}

                                    />
                                </Grid>

                                {/*email should not be changeable!*/}
                                {/*<Grid item xs={3}>*/}
                                {/*    <TextField*/}
                                {/*        label="Email"*/}
                                {/*        fullWidth*/}
                                {/*        variant="outlined"*/}
                                {/*        value={userDetails.email}*/}
                                {/*        onChange={e => setUserDetails({...userDetails, email: e.target.value})}*/}
                                {/*    />*/}
                                {/*</Grid>*/}
                                <Grid item xs={12}>
                                    <TextField
                                        label="Phone Number"
                                        fullWidth
                                        variant="outlined"
                                        value={userDetails.phoneNumber}
                                        onChange={e => setUserDetails({...userDetails, phoneNumber: e.target.value})}
                                    />
                                </Grid>
                            </Grid>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button variant="contained" sx={{ mr: 2 }} onClick={isModified? handleSaveProfile:onNext} disabled={isAnyFieldMissing()}>
                                    {isModified ? "Save":"Confirm"}
                                </Button>
                                {/*todo: handle cancel*/}
                                <Button variant="outlined" onClick={handleCancel}>Cancel </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ width: 250 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6">{bookingDetails.provider?.lastName}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.location}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.timeSlot?.start ? bookingDetails.timeSlot?.start.toLocaleString() : 'No date set'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.serviceOffering?.serviceType}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {bookingDetails.price}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Container>
    );
}

export default UpdateProfile;
