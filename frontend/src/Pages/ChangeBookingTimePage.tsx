import React, { useState } from 'react';
import BookingCalendar, { TimeSlot } from '../components/BookingCalendar'; 
import { Typography, Container, Button, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
const ChangeBookingTimePage: React.FC = () => {
    const { providerId, requestId } = useParams();
    const [serviceType, setServiceType] = useState("Babysitting"); // Placeholder for the service type [e.g. "Tutoring"]
    const [defaultSlotDuration, setDefaultSlotDuration] = useState(60); // Placeholder for the default slot duration
    // const [globalAvailabilities, setGlobalAvailabilities] = useState<Event[]>([{start: Date.now(), end: Date.now(), title: "Event"}]); // Placeholder for the global availabilities [e.g. tutor availabilities]

     

    return (
        <Container maxWidth="lg">
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4">
                    Choose an alternative time for your booking
                </Typography>
            </Box>
            <BookingCalendar
                provider={providerId}
                request={requestId}
                Servicetype={serviceType}
                defaultSlotDuration={defaultSlotDuration}
                // globalAvailabilities={globalAvailabilities}
            />
            
        </Container>
    );
};

export default ChangeBookingTimePage;
