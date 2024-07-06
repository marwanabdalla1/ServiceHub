import React, { useState } from 'react';
import AvailabilityCalendarBooking, { TimeSlot } from '../components/AvailabilityCalendarBooking';
import { Typography, Container, Button, Box } from '@mui/material';
import {ServiceType} from "../models/enums";
const SelectAvailabilityBooking_temp: React.FC = () => {
    const [serviceType, setServiceType] = useState(ServiceType.babysitting); // Placeholder for the service type [e.g. "Tutoring"]
    const [defaultSlotDuration, setDefaultSlotDuration] = useState(60); // Placeholder for the default slot duration
    // const [globalAvailabilities, setGlobalAvailabilities] = useState<Event[]>([{start: Date.now(), end: Date.now(), title: "Event"}]); // Placeholder for the global availabilities [e.g. tutor availabilities]
    const [defaultTransitTime, setDefaultTransitTime] = useState(15); // Placeholder for the default slot duration

     

    return (
        <Container maxWidth="lg">
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4">
                    Book from provider
                </Typography>
            </Box>
            {/*<AvailabilityCalendarBooking*/}
            {/*    Servicetype={serviceType}*/}
            {/*    defaultSlotDuration={defaultSlotDuration}*/}
            {/*    defaultTransitTime={defaultTransitTime}*/}
            {/*    // globalAvailabilities={globalAvailabilities}*/}

            {/*/>*/}
            
        </Container>
    );
};

export default SelectAvailabilityBooking_temp;
