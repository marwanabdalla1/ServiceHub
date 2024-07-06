import React, {useEffect, useState} from 'react';
import AvailabilityCalendar, { TimeSlot } from '../components/AvailabilityCalendar';
import { Typography, Container, Button, Box } from '@mui/material';
import {useAuth} from "../contexts/AuthContext";
import {useNavigate} from "react-router-dom";
const SelectAvailabilityPage: React.FC = () => {
    const [serviceType, setServiceType] = useState("Babysitting"); // Placeholder for the service type [e.g. "Tutoring"]
    const [defaultSlotDuration, setDefaultSlotDuration] = useState(60); // Placeholder for the default slot duration
    // const [globalAvailabilities, setGlobalAvailabilities] = useState<Event[]>([{start: Date.now(), end: Date.now(), title: "Event"}]); // Placeholder for the global availabilities [e.g. tutor availabilities]
    const {token, account, isProvider} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        console.log("you are in the select availability page:", isProvider(), account, token)
        if (!isProvider() || !token) {
            // If not a provider, redirect to home or another appropriate page
            navigate('/unauthorized'); // Make sure you have a route for '/unauthorized' or change as needed
        }
    }, [isProvider(), token]);

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
            
        </Container>
    );
};

export default SelectAvailabilityPage;
