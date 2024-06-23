import React, { useState, ChangeEvent } from 'react';
import { Autocomplete, TextField, InputAdornment, Box, Grid } from '@mui/material';
import LightBlueButton from '../components/inputs/BlueButton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface FormData {
    selectedService: { title: string } | null;
    hourlyRate: string;
    selectedPaymentMethods: Array<{ title: string }>;
    description: string;
    certificate: File | null;
    defaultSlotTime: string;
    travelTime: string;
}

function AddServicePage() {
    const navigate = useNavigate();

    const {token} = useAuth();
    console.log(token)

    const serviceTypes = [
        { title: 'Bike Repair' }, 
        { title: 'Moving Services' }, 
        { title: 'Baby Sitting' }, 
        { title: 'Tutoring' }, 
        { title: 'Pet Sitting' }, 
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
        selectedPaymentMethods: [],
        description: '',
        certificate: null,
        defaultSlotTime: '',
        travelTime: ''
    });

    const [errors, setErrors] = useState({
        selectedService: false,
        hourlyRate: false,
        selectedPaymentMethods: false,
        defaultSlotTime: false,
        travelTime: false
    });

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setFormData(prev => ({ ...prev, certificate: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, certificate: null }));
        }
    };

    const handleChange = (key: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const validateForm = () => {
        const newErrors = {
            selectedService: !formData.selectedService,
            hourlyRate: !formData.hourlyRate,
            selectedPaymentMethods: formData.selectedPaymentMethods.length === 0,
            defaultSlotTime: !formData.defaultSlotTime,
            travelTime: !formData.travelTime
        };

        setErrors(newErrors);

        return Object.values(newErrors).every(error => !error);
    };


   

    const handleSubmit = async () => {
        if (validateForm()) {
            console.log('Submit button pressed');
            const submissionData = {
                ...formData,
                defaultSlotTime: Number(formData.defaultSlotTime),
                travelTime: Number(formData.travelTime)
            };
        try {
            console.log(token)
            const response = await axios.post('/api/services/add-new-service', submissionData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(`Status: ${response.status}`);
            console.log(response.data);
        } catch (error) {
            console.error('Error creating service:', error);
        }

            // const { selectedService, travelTime } = submissionData;
            // // navigate('/select-availability', { state: { selectedService, travelTime } });
            // console.log(submissionData);
        } else {
            console.log('Form validation failed');
        }
    };

    return (
        <Box className="w-full h-full flex items-center justify-center bg-gray-100" p={3}>
            <Box className="w-full max-w-5xl p=6 bg-white shadow-md rounded-lg">
                <Box className='flex justify-center p-3 py-3 items-center mb-6'>
                    <h4 className="font-bold text-2xl">Provide Service</h4>
                </Box>
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
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                placeholder="Hourly Rate"
                                fullWidth
                                value={formData.hourlyRate}
                                onChange={(e) => handleChange('hourlyRate', e.target.value)}
                                error={errors.hourlyRate}
                                helperText={errors.hourlyRate ? 'Hourly rate is required' : ''}
                            />
                        </Box>
                        <Box mb={4}>
                            <Autocomplete
                                multiple
                                options={paymentMethods}
                                getOptionLabel={(option) => option.title}
                                value={formData.selectedPaymentMethods}
                                onChange={(event, newValue) => handleChange('selectedPaymentMethods', newValue)}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        label="Payment Method" 
                                        variant="outlined" 
                                        fullWidth 
                                        error={errors.selectedPaymentMethods}
                                        helperText={errors.selectedPaymentMethods ? 'At least one payment method is required' : ''}
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
                                Add a description to your bike repair service (optional)
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
                            <TextField
                                type="file"
                                variant="outlined"
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    accept: 'image/*',
                                }}
                                onChange={handleFileChange}
                            />
                        </Box>
                    </Grid>
                </Grid>
                <Box mt={4} className="flex justify-center p-2">
                    <LightBlueButton className="py-2 px-2" text="Submit" onClick={handleSubmit} />
                </Box>
            </Box>
        </Box>
    );
}

export default AddServicePage;
