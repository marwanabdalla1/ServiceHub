import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Card, CardContent, TextField, Button, Grid, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

interface UserDetails {
    address: string;
    postal: string;
    location: string;
    country: string;
    phoneNumber: string;
    [key: string]: string | number;
}

function UpdateSProfile() {
    const navigate = useNavigate();
    const { token, account } = useAuth();
    console.log(account);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (account) {
            setLoading(false);
        }
    }, [account]);

    const validationSchema = Yup.object({
        address: Yup.string().required('Address is required'),
        postal: Yup.string().matches(/^\d+$/, 'Postal code must be numeric').required('Postal code is required'),
        location: Yup.string().required('Location is required'),
        country: Yup.string().required('Country is required'),
        phoneNumber: Yup.string().matches(/^\d+$/, 'Phone number must be numeric').required('Phone number is required')
    });

    const handleSaveProfile = async (values: UserDetails) => {
        const apiEndpoint = '/api/account';
        try {
            const response = await axios.put(apiEndpoint, values, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            console.log('User updated:', response.data);
            navigate('/addservice');
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleCancel = () => {
        navigate('/');
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
                    <Typography variant="h4" gutterBottom>
                        Please confirm your contact data
                    </Typography>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                BASIC INFO
                            </Typography>
                            {account && (
                                <Formik
                                    initialValues={{
                                        address: account.address || '',
                                        postal: account.postal || '',
                                        location: account.location || '',
                                        country: account.country || '',
                                        phoneNumber: account.phoneNumber || ''
                                    }}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSaveProfile}
                                >
                                    {({ isSubmitting, isValid }) => (
                                        <Form>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Field
                                                        name="address"
                                                        as={TextField}
                                                        label="Address"
                                                        fullWidth
                                                        variant="outlined"
                                                        helperText={<ErrorMessage name="address" />}
                                                        error={Boolean(ErrorMessage.name === "address")}
                                                    />
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Field
                                                        name="postal"
                                                        as={TextField}
                                                        label="Postal"
                                                        fullWidth
                                                        variant="outlined"
                                                        helperText={<ErrorMessage name="postal" />}
                                                        error={Boolean(ErrorMessage.name === "postal")}
                                                    />
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Field
                                                        name="location"
                                                        as={TextField}
                                                        label="City"
                                                        fullWidth
                                                        variant="outlined"
                                                        helperText={<ErrorMessage name="location" />}
                                                        error={Boolean(ErrorMessage.name === "location")}
                                                    />
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Field
                                                        name="country"
                                                        as={TextField}
                                                        label="Country"
                                                        fullWidth
                                                        variant="outlined"
                                                        helperText={<ErrorMessage name="country" />}
                                                        error={Boolean(ErrorMessage.name === "country")}
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Field
                                                        name="phoneNumber"
                                                        as={TextField}
                                                        label="Phone Number"
                                                        fullWidth
                                                        variant="outlined"
                                                        helperText={<ErrorMessage name="phoneNumber" />}
                                                        error={Boolean(ErrorMessage.name === "phoneNumber")}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                                <Button
                                                    variant="contained"
                                                    sx={{ mr: 2 }}
                                                    type="submit"
                                                    disabled={!isValid || isSubmitting}
                                                >
                                                    {isSubmitting ? 'Saving...' : 'Save'}
                                                </Button>
                                                <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
                                            </Box>
                                        </Form>
                                    )}
                                </Formik>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Container>
    );
}

export default UpdateSProfile;
