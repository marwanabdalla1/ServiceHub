import React from 'react';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { Typography, Container } from '@mui/material';

const SelectAvailabilityPage: React.FC = () => {
    return (
        <Container maxWidth="lg">
            <Typography variant="h4" sx={{ marginTop: 4, marginBottom: 4 }}>
                Set Your Weekly Availability
            </Typography>
            <AvailabilityCalendar />
        </Container>
    );
}

export default SelectAvailabilityPage;