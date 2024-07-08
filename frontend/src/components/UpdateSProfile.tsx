import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Card, CardContent, TextField, Button, Grid, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface UpdateProfileProps {
    onNext: () => void;
    onBack: () => void;
}

// All the required data for user
interface UserDetails {
    address: string;
    postal: string;
    location: string;
    country: string;
    phoneNumber: string;
    [key: string]: string | number;  // Allows any string to index into the object, expecting a string or number value
}

function UpdateSProfile({ onNext, onBack }: UpdateProfileProps) {
    const navigate = useNavigate();
    const { token } = useAuth();

    // Initialize state for user details, loading, and error
    const [userDetails, setUserDetails] = useState<UserDetails>({
        address: '',
        postal: '',
        location: '',
        country: '',
        phoneNumber: ''
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [isModified, setIsModified] = useState(false);

    useEffect(() => {
        // Fetch user details from API
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get('/api/user/details', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                setUserDetails(response.data);
                setLoading(false);
                setEditMode(isAnyFieldMissing(response.data));
            } catch (error : any) {
                setError(error);
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [token]);

    // Function to check for missing fields
    const isAnyFieldMissing = (data: UserDetails) => {
        const fields = ['phoneNumber', 'address', 'postal', 'location', 'country'];
        return fields.some(field => !data[field]);
    };

    const handleSaveProfile = async () => {
        const apiEndpoint = '/api/account/';
        try {
            const response = await axios.put(apiEndpoint, userDetails, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            console.log('User updated:', response.data);
            onNext();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleCancel = () => {
        navigate('/profile'); // Adjust the navigation as per your requirement
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Typography variant="h6" color="error">
                        Error loading user details. Please try again later.
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Box sx={{ width: '60%' }}>
                    <Typography variant="h6" gutterBottom>
                        Step 3 of 3
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Please confirm your contact data
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button variant="outlined" onClick={onBack}>Back</Button>
                    </Box>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                BASIC INFO
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Address"
                                        fullWidth
                                        variant="outlined"
                                        value={userDetails.address}
                                        onChange={e => {
                                            setUserDetails(prevDetails => ({ ...prevDetails, address: e.target.value }));
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
                                        onChange={e => {
                                            setUserDetails(prevDetails => ({ ...prevDetails, postal: e.target.value }));
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
                                        onChange={e => {
                                            setUserDetails(prevDetails => ({ ...prevDetails, location: e.target.value }));
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
                                        onChange={e => {
                                            setUserDetails(prevDetails => ({ ...prevDetails, country: e.target.value }));
                                            setIsModified(true);
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Phone Number"
                                        fullWidth
                                        variant="outlined"
                                        value={userDetails.phoneNumber}
                                        onChange={e => setUserDetails({ ...userDetails, phoneNumber: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button variant="contained" sx={{ mr: 2 }} onClick={isModified ? handleSaveProfile : onNext} disabled={isAnyFieldMissing(userDetails)}>
                                    {isModified ? "Save" : "Confirm"}
                                </Button>
                                <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ width: 250 }}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6">Provider Info</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {/* Add provider info here if needed */}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Container>
    );
}

export default UpdateSProfile;
