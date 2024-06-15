import React, { useState } from 'react';
import AvailabilityCalendar, { Event } from '../components/AvailabilityCalendar';
import { Typography, Container, Button, Box } from '@mui/material';
const SelectAvailabilityPage: React.FC = () => {
    const [serviceType, setServiceType] = useState("Babysitting"); // Placeholder for the service type [e.g. "Tutoring"]
    const [defaultSlotDuration, setDefaultSlotDuration] = useState(60); // Placeholder for the default slot duration
    // const [globalAvailabilities, setGlobalAvailabilities] = useState<Event[]>([{start: Date.now(), end: Date.now(), title: "Event"}]); // Placeholder for the global availabilities [e.g. tutor availabilities]

    const saveAvailability = () => {
        console.log("Saving availability...");
        // Placeholder function for saving availability
        // console.log(globalAvailabilities);
    };

    return (
        <Container maxWidth="lg">
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4">
                    Set Your Weekly Availability
                </Typography>
            </Box>
            <AvailabilityCalendar
                Servicetype={serviceType}
                defaultSlotDuration={defaultSlotDuration}
                // globalAvailabilities={globalAvailabilities}
            />
            <Box display="flex" justifyContent="flex-end" sx={{ mt: 4 }}>
                <Button variant="contained" color="primary" onClick={saveAvailability}>
                    Save Availability
                </Button>
            </Box>
        </Container>
    );
};

export default SelectAvailabilityPage;
