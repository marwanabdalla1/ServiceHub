import { Autocomplete, TextField, OutlinedInput, InputAdornment, Typography, Box, Grid } from '@mui/material';
import LightBlueButton from '../components/inputs/BlueButton';

function AddServicePage() {

    const serviceTypes = [{ title: 'Bike Repair' }, { title: 'Moving' }, { title: 'Babysitting' }, { title: 'Tutoring' }, { title: 'Petsetting' }, { title: 'Landscaping' }, { title: 'Remodeling' }, { title: 'Cleaning' }]
    const paymentMethods = [{ title: 'Cash' }, { title: 'Paypal' }, { title: 'Bank Transfer' }]


    return (
        <Box className="w-full h-full flex items-center justify-center bg-gray-100" p={3}>
    <Box className="w-full max-w-4xl p-6 bg-white shadow-md rounded-lg">
        <Box className='flex justify-center items-center mb-6'>
            <h4 className="font-bold text-2xl">Provide Service</h4>
        </Box>
        <Grid container spacing={7}>
            <Grid item xs={12} md={6}>
                <Box mb={4}>
                    <Autocomplete
                        options={serviceTypes}
                        getOptionLabel={(option) => option.title}
                        renderInput={(params) => <TextField {...params} label="Choose Service" variant="outlined" fullWidth />}
                    />
                </Box>
                <Box mb={4}>
                    <OutlinedInput
                        startAdornment={<InputAdornment position="start">$</InputAdornment>}
                        placeholder="Hourly Rate"
                        fullWidth
                    />
                </Box>
                <Box mb={4}>
                    <Autocomplete
                        options={paymentMethods}
                        getOptionLabel={(option) => option.title}
                        renderInput={(params) => <TextField {...params} label="Payment Method" variant="outlined" fullWidth />}
                    />
                </Box>
            </Grid>
            <Grid item xs={12} md={6}>
                <Box mb={4}>
                    <p className="font-bold mb-2">
                        Add a description to your bike repair service (optional)
                    </p>
                    <TextField variant="outlined" multiline rows={4} fullWidth />
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
                    />
                </Box>
            </Grid>
        </Grid>
        <Box mt={4} className="flex justify-center">
            <LightBlueButton className="py-2 px-2" text="Submit" onClick={() => console.log('Submit button pressed')} />
        </Box>
    </Box>
</Box>



    )
}

export default AddServicePage
