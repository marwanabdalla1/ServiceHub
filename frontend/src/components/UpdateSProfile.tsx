import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Grid,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    MenuItem,
    Select,
    InputLabel,
    FormControl
} from '@mui/material';
import {useAuth} from '../contexts/AuthContext';
import axios from 'axios';
import {Formik, Field, Form, ErrorMessage, FieldProps} from 'formik';
import * as Yup from 'yup';
import {GERMAN_CITIES_SUPPORT, GERMAN_POSTAL_REGEX, PHONE_NUMBER_REGEX} from "../shared/Constants";

interface UserDetails {
    address: string;
    postal: string;
    location: string;
    phoneNumber: string;

    [key: string]: string | number;
}

function UpdateSProfile() {
    const navigate = useNavigate();
    const {token, account} = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            navigate("/unauthorized")
        }
        if (account) {
            setLoading(false);
        }
    }, [token, account]);

    const validationSchema = Yup.object({
        address: Yup.string().required('Address is required'),
        postal: Yup.string().matches(GERMAN_POSTAL_REGEX, 'Postal code is invalid').required('Postal code is required'),
        location: Yup.string().required('Location is required'),
        phoneNumber: Yup.string().matches(PHONE_NUMBER_REGEX, 'Phone number is invalid').required('Phone number is required')
    });

    const handleSaveProfile = async (values: UserDetails) => {
        const apiEndpoint = '/api/account';
        try {
            const response = await axios.put(apiEndpoint, values, {
                headers: {'Authorization': `Bearer ${token}`},
            });
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
                <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                    <CircularProgress/>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                    <Typography variant="h6" color="error">
                        Error loading user details. Please try again later.
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container>
            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 4}}>
                <Box sx={{width: '60%'}}>
                    <Typography variant="h4" gutterBottom>
                        Please confirm your contact data
                    </Typography>

                    <Stepper activeStep={0} alternativeLabel sx={{mb: 2}}>
                        <Step>
                            <StepLabel>Check Profile</StepLabel>
                        </Step>
                        <Step disabled>
                            <StepLabel>Add Service</StepLabel>
                        </Step>
                        <Step disabled>
                            <StepLabel>Add Availability</StepLabel>
                        </Step>
                    </Stepper>

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
                                        phoneNumber: account.phoneNumber || ''
                                    }}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSaveProfile}
                                >
                                    {({isSubmitting, isValid}) => (
                                        <Form>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Field
                                                        name="address"
                                                        as={TextField}
                                                        label="Address"
                                                        fullWidth
                                                        variant="outlined"
                                                        helperText={<ErrorMessage name="address"/>}
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
                                                        helperText={<ErrorMessage name="postal"/>}
                                                        error={Boolean(ErrorMessage.name === "postal")}
                                                    />
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Field name="location">
                                                        {({field}: FieldProps) => (
                                                            <FormControl fullWidth variant="outlined">
                                                                <InputLabel>City</InputLabel>
                                                                <Select
                                                                    {...field}
                                                                    label="City"
                                                                >
                                                                    {Object.values(GERMAN_CITIES_SUPPORT).map((city) => (
                                                                        <MenuItem key={city}
                                                                                  value={city}>{city}</MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        )}
                                                    </Field>
                                                    <ErrorMessage name="location" component="div"/>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Field
                                                        name="phoneNumber"
                                                        as={TextField}
                                                        label="Phone Number"
                                                        fullWidth
                                                        variant="outlined"
                                                        helperText={<ErrorMessage name="phoneNumber"/>}
                                                        error={Boolean(ErrorMessage.name === "phoneNumber")}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
                                                <Button
                                                    variant="contained"
                                                    sx={{mr: 2}}
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
