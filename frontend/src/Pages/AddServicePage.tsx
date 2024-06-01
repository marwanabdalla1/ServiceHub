import React, { useState, ChangeEvent } from 'react';
import { Autocomplete, TextField, InputAdornment, Box, Grid } from '@mui/material';
import LightBlueButton from '../components/inputs/BlueButton';

function AddServicePage() {
    const serviceTypes = [
        { title: 'Bike Repair' }, { title: 'Moving' }, { title: 'Babysitting' }, 
        { title: 'Tutoring' }, { title: 'Petsetting' }, { title: 'Landscaping' }, 
        { title: 'Remodeling' }, { title: 'Cleaning' }
    ];
    const paymentMethods = [
        { title: 'Cash' }, { title: 'Paypal' }, { title: 'Bank Transfer' }
    ];

    const [selectedService, setSelectedService] = useState<{ title: string } | null>(null);
    const [hourlyRate, setHourlyRate] = useState<string>('');
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<Array<{ title: string }>>([]);
    const [description, setDescription] = useState<string>('');
    const [certificate, setCertificate] = useState<File | null>(null);
    const [defaultSlotTime, setDefaultSlotTime] = useState<string>('');
    const [travelTime, setTravelTime] = useState<string>('');

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
            setCertificate(files[0]);
        } else {
            setCertificate(null);
        }
    };

    const validateForm = () => {
        const newErrors = {
            selectedService: !selectedService,
            hourlyRate: !hourlyRate,
            selectedPaymentMethods: selectedPaymentMethods.length === 0,
            defaultSlotTime: !defaultSlotTime,
            travelTime: !travelTime
        };

        setErrors(newErrors);
        
        return Object.values(newErrors).every(error => !error);
    };

    const handleSubmit = () => {
        if (validateForm()) {
            console.log('Submit button pressed');
            const formData = {
                selectedService,
                hourlyRate,
                selectedPaymentMethods,
                description,
                certificate,
                defaultSlotTime: Number(defaultSlotTime),
                travelTime: Number(travelTime)
            };
            console.log(formData);
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
                                value={selectedService}
                                onChange={(event, newValue) => setSelectedService(newValue)}
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
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(e.target.value)}
                                error={errors.hourlyRate}
                                helperText={errors.hourlyRate ? 'Hourly rate is required' : ''}
                            />
                        </Box>
                        <Box mb={4}>
                            <Autocomplete
                                multiple
                                options={paymentMethods}
                                getOptionLabel={(option) => option.title}
                                value={selectedPaymentMethods}
                                onChange={(event, newValue) => setSelectedPaymentMethods(newValue)}
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
                                value={defaultSlotTime}
                                onChange={(e) => setDefaultSlotTime(e.target.value)}
                                error={errors.defaultSlotTime}
                                helperText={errors.defaultSlotTime ? 'Default slot time is required' : ''}
                            />
                        </Box>
                        <Box mb={4}>
                            <TextField
                                label="Travel Time (minutes)"
                                variant="outlined"
                                fullWidth
                                value={travelTime}
                                onChange={(e) => setTravelTime(e.target.value)}
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
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
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
