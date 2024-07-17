import React, { useState, ChangeEvent, useEffect } from 'react';
import { Autocomplete, TextField, InputAdornment, Box, Grid, Stepper, Step, StepLabel, CircularProgress, Typography } from '@mui/material';
import LightBlueButton from '../components/inputs/BlueButton';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from "react-toastify";

interface FormData {
    selectedService: { title: string } | null;
    hourlyRate: string;
    acceptedPaymentMethods: Array<{ title: string }>;
    description: string;
    certificateId: string | null;
    defaultSlotTime: string;
    travelTime: string;
}

function AddServicePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { token, account } = useAuth();
    const isProvider = account?.isProvider;
    const serviceToEdit = location.state?.service || null;
    const [certificate, setCertificate] = useState<File | null>(null);
    const [isCertificateUploaded, setIsCertificateUploaded] = useState<boolean>(false);
    const serviceTypes = [
        { title: 'Bike Repair' },
        { title: 'Moving Services' },
        { title: 'Babysitting' },
        { title: 'Tutoring' },
        { title: 'Petsitting' },
        { title: 'Landscaping Services' },
        { title: 'Home Remodeling' },
        { title: 'House Cleaning' }
    ];
    const paymentMethods = [
        { title: 'Cash' }, { title: 'Paypal' }, { title: 'Bank Transfer' }
    ];
    const [formData, setFormData] = useState<FormData>({
        selectedService: null,
        hourlyRate: '',
        acceptedPaymentMethods: [],
        description: 'Welcome to my service page.',
        certificateId: null,
        defaultSlotTime: '',
        travelTime: ''
    });
    const [errors, setErrors] = useState({
        selectedService: false,
        hourlyRate: false,
        acceptedPaymentMethods: false,
        defaultSlotTime: false,
        travelTime: false
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // New state for error message
    const [isLoading, setIsLoading] = useState<boolean>(false); // New state for loading
    const isEditMode = Boolean(serviceToEdit);

    useEffect(() => {
        if (isEditMode && serviceToEdit) {
            console.log('Service to edit:', serviceToEdit);
            setFormData({
                selectedService: { title: serviceToEdit.serviceType },
                hourlyRate: serviceToEdit.hourlyRate.toString(),
                acceptedPaymentMethods: serviceToEdit.acceptedPaymentMethods ? serviceToEdit.acceptedPaymentMethods.map((method: string) => ({ title: method })) : [],
                description: serviceToEdit.description,
                certificateId: serviceToEdit.certificateId,
                defaultSlotTime: serviceToEdit.baseDuration.toString(),
                travelTime: serviceToEdit.bufferTimeDuration.toString()
            });
            fetchCertificate(serviceToEdit._id).then(r => console.log('Certificate fetched'));
        }
    }, [isEditMode, serviceToEdit]);

    const fetchCertificate = async (_id: string) => {
        try {
            // Fetch certificate
            const certificateResponse = await axios.get(`/api/certificate/${_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });
            setCertificate(certificateResponse.data);
            console.log('Certificate fetched:', certificateResponse.data)
        } catch (error) {
            console.error('Error fetching certificate:', error);
        }
    };

    const handleDeleteCertificate = async () => {
        try {
            // Delete certificate
            const response = await axios.delete(`/api/certificate/${serviceToEdit._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Certificate deleted:', response.data);
            setCertificate(null); // Reset the certificate state
        } catch (error) {
            console.error('Error deleting certificate:', error);
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const certificate = event.target.files ? event.target.files[0] : null;
        setCertificate(certificate);
        setIsCertificateUploaded(true);
    };

    const handleChange = (key: keyof FormData, value: any) => {
        if (key === 'acceptedPaymentMethods') {
            // E.g. map [{title: 'Cash'}, {title: 'Cash'}]  to Set['Cash','Cash'] -> ['Cash']->[title: 'Cash']
            const uniquePaymentMethods = Array.from(new Set(value.map((item: {
                title: string
            }) => item.title))).map(title => ({ title: title as string }));
            setFormData(prev => ({ ...prev, [key]: uniquePaymentMethods }));
        } else {
            setFormData(prev => ({ ...prev, [key]: value }));
        }
    };

    const validateForm = () => {
        const newErrors = {
            selectedService: !formData.selectedService,
            hourlyRate: !formData.hourlyRate || !isHourlyRateValid(formData.hourlyRate),
            acceptedPaymentMethods: formData.acceptedPaymentMethods.length === 0,
            defaultSlotTime: !formData.defaultSlotTime,
            travelTime: !formData.travelTime
        };

        setErrors(newErrors);
        return Object.values(newErrors).every(error => !error);
    };

    const isNumberValid = (value: string, fieldName: string) => {
        const number = Number(value);
        const isValid = !isNaN(number) && isFinite(number);
        if (!isValid) {
            toast.error(`${fieldName} must be a valid number.`);
        }
        return isValid;
    };

    const isHourlyRateValid = (value: string) => {
        const rate = Number(value);
        if (rate < 5 || rate > 500) {
            toast.error("Hourly Rate must be between 5 and 500 euros.");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!isNumberValid(formData.hourlyRate, "Hourly Rate")
            || !isNumberValid(formData.defaultSlotTime, "Default Slot Time")
            || !isNumberValid(formData.travelTime, "Travel Time")) {
            return;
        }

        if (validateForm()) {
            setIsLoading(true);
            const submissionData = {
                ...formData,
                hourlyRate: Number(formData.hourlyRate),
                defaultSlotTime: Number(formData.defaultSlotTime),
                travelTime: Number(formData.travelTime)
            };

            const certificateForm = new FormData();
            if (certificate) {
                certificateForm.append('file', certificate);
            }

            try {
                let response;
                if (isEditMode) {
                    console.log('Editing service:', serviceToEdit._id);
                    response = await axios.put(`/api/services/edit-service/${serviceToEdit._id}`, submissionData, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (certificate && isCertificateUploaded) {
                        response = await axios.post(`/api/certificate/upload/${serviceToEdit._id}`, certificateForm, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                    }
                } else {
                    response = await axios.post('/api/services/add-new-service', submissionData, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.status === 201 && certificate && isCertificateUploaded) {
                        response = await axios.post(`/api/certificate/upload/${response.data._id}`, certificateForm, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                    }
                }
                console.log(`Status: ${response.status}`);
                console.log(response.data);
                setIsLoading(false);
                if (isEditMode) {
                    navigate('/setprofile');
                } else {
                    navigate('/select-availability', { state: { inAddServiceSteps: true } });
                }
            } catch (error: any) {
                console.error('Error submitting service:', error);
                setIsLoading(false);
                if (error.response && error.response.status === 400 && error.response.data === 'You already provide this service') {
                    setErrorMessage('You already provide this service');
                } else {
                    setErrorMessage('An error occurred. Please try again.');
                }
            }
        } else {
            console.log('Form validation failed');
        }
    };

    return (
        <Box className="w-full h-full flex items-center justify-center bg-gray-100" p={3}>
            <Box className="w-full max-w-5xl p=6 bg-white shadow-md rounded-lg">
                {!isEditMode && (
                    <Stepper activeStep={1} alternativeLabel sx={{ mb: 2 }}>
                        <Step>
                            <StepLabel>Check Profile</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Add Service</StepLabel>
                        </Step>
                        <Step disabled>
                            <StepLabel>Add Availability</StepLabel>
                        </Step>
                    </Stepper>
                )}
                <Box className='flex justify-center p-3 py-3 items-center mb=6'>
                    <h4 className="font-bold text-2xl">{isEditMode ? 'Edit Service' : 'Provide Service'}</h4>
                </Box>
                {errorMessage && (
                    <Box className='flex justify-center p-3 py-3 items-center mb=6' color="error.main">
                        <p>{errorMessage}</p>
                    </Box>
                )}
                <Grid container spacing={7} className='p-4'>
                    <Grid item xs={12} md={6}>
                        <Box mb={4}>
                            <Autocomplete
                                options={serviceTypes}
                                getOptionLabel={(option) => option.title}
                                value={formData.selectedService}
                                onChange={(event, newValue) => handleChange('selectedService', newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Choose Service"
                                        variant="outlined"
                                        fullWidth
                                        error={errors.selectedService}
                                        helperText={errors.selectedService ? 'Service is required' : ''}
                                    />
                                )}
                            />
                        </Box>
                        <Box mb={4}>
                            <TextField
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                }}
                                placeholder="Hourly Rate"
                                fullWidth
                                value={formData.hourlyRate}
                                onChange={(e) => handleChange('hourlyRate', e.target.value)}
                                error={errors.hourlyRate}
                                helperText={errors.hourlyRate ? 'Hourly rate is required' : ''}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <Typography variant="caption" color="textSecondary" style={{ marginLeft: '10px' }}>
                                {/* (Range: 15 to 80 euros) */}
                            </Typography>
                        </Box>
                        <Box mb={4}>
                            <Autocomplete
                                multiple
                                options={paymentMethods}
                                getOptionLabel={(option) => option.title}
                                value={formData.acceptedPaymentMethods}
                                onChange={(event, newValue) => handleChange('acceptedPaymentMethods', newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Payment Method"
                                        variant="outlined"
                                        fullWidth
                                        error={errors.acceptedPaymentMethods}
                                        helperText={errors.acceptedPaymentMethods ? 'At least one payment method is required' : ''}
                                    />
                                )}
                            />
                        </Box>
                        <Box mb={4}>
                            <TextField
                                label="Default Slot Time (minutes)"
                                variant="outlined"
                                fullWidth
                                value={formData.defaultSlotTime}
                                onChange={(e) => handleChange('defaultSlotTime', e.target.value)}
                                error={errors.defaultSlotTime}
                                helperText={errors.defaultSlotTime ? 'Default slot time is required' : ''}
                            />
                        </Box>
                        <Box mb={4}>
                            <TextField
                                label="Travel Time (minutes)"
                                variant="outlined"
                                fullWidth
                                value={formData.travelTime}
                                onChange={(e) => handleChange('travelTime', e.target.value)}
                                error={errors.travelTime}
                                helperText={errors.travelTime ? 'Travel time is required' : ''}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box mb={4}>
                            <p className="font-bold mb-2">
                                Add a description to your service (optional)
                            </p>
                            <TextField
                                variant="outlined"
                                multiline
                                rows={4}
                                fullWidth
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                            />
                        </Box>
                        <Box>
                            <p className="font-bold mb-2">
                                Upload professional certificate to your service (optional)
                            </p>
                            {certificate && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>Certificate uploaded</div>
                                    <div>
                                        <a
                                            href={URL.createObjectURL(certificate)}
                                            download
                                            style={{ marginRight: '10px' }}
                                        >
                                            Download
                                        </a>
                                        <button
                                            onClick={handleDeleteCertificate}
                                            style={{ color: 'red', textDecoration: 'underline' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                            <TextField
                                type="file"
                                variant="outlined"
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    accept: 'application/pdf',
                                }}
                                onChange={handleFileChange}
                            />
                        </Box>
                    </Grid>
                </Grid>
                <Box mt={4} className="flex justify-center p-2">
                    <LightBlueButton className="py-2 px-2" text="Submit" onClick={handleSubmit} />
                </Box>
                {isLoading && (
                    <Box mt={2} className="flex justify-center">
                        <CircularProgress />
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default AddServicePage;
