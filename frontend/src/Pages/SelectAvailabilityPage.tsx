import React, { useState } from 'react';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { Typography, Container, Button, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useLocation } from 'react-router-dom';


const SelectAvailabilityPage: React.FC = () => {
    const location = useLocation();
    const { selectedService } = location.state || {};
    const [isFixed, setIsFixed] = useState(false);

    const handleFixedChange = () => {
        setIsFixed(!isFixed);
    };

    // todo: actual save
    const saveAvailability = () => {
        console.log("Saving availability...");
        // Placeholder function for saving availability
    };

    return (
        <Container maxWidth="lg">
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4">
                    Set Your Weekly Availability
                </Typography>
                <ToggleButtonGroup
                    color="primary"
                    value={isFixed ? 'fixed' : 'notFixed'}
                    exclusive
                    onChange={handleFixedChange}
                >
                    <ToggleButton value="fixed">Set as Fixed</ToggleButton>
                    <ToggleButton value="notFixed">Set as Not Fixed</ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <AvailabilityCalendar isFixed={isFixed}/>
            {/* Uncomment the line below once the AvailabilityCalendar2 is fixed or working */}
            {/* <AvailabilityCalendar2 /> */}

            <Box display="flex" justifyContent="flex-end" sx={{ mt: 4 }}>
                <Button variant="contained" color="primary" onClick={saveAvailability}>
                    Save Availability
                </Button>
            </Box>
        </Container>
    );
}

export default SelectAvailabilityPage;
