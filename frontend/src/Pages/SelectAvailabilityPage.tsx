import React, {useEffect, useState} from 'react';
import AvailabilityCalendar, { TimeSlot } from '../components/AvailabilityCalendar';
import { Typography, Container, Button, Box } from '@mui/material';
import {useAuth} from "../contexts/AuthContext";
import {useNavigate} from "react-router-dom";
const SelectAvailabilityPage: React.FC = () => {
    const [serviceType, setServiceType] = useState("Babysitting"); // Placeholder for the service type [e.g. "Tutoring"]
    const [defaultSlotDuration, setDefaultSlotDuration] = useState(60); // Placeholder for the default slot duration
    // const [globalAvailabilities, setGlobalAvailabilities] = useState<Event[]>([{start: Date.now(), end: Date.now(), title: "Event"}]); // Placeholder for the global availabilities [e.g. tutor availabilities]
    const {token, account, isReady, isFetched } = useAuth();
    const navigate = useNavigate();
    const isProvider = account?.isProvider;




    useEffect(() => {
        console.log("you are in the select availability page1:", token, account, isReady, isFetched, isProvider)

        if (!isReady || (token && !isFetched)){
            console.log("not ready!")
            return;
        }
        console.log("you are in the select availability page:", token, account, isReady, isFetched, isProvider)

        if (!token || (account && !isProvider)) {
            // If not a provider, redirect" to home or another appropriate page
            navigate('/unauthorized'); // Make sure you have a route for '/unauthorized' or change as needed
        }
    }, [token, isProvider, account, isReady, isFetched]);

    if (!isReady) {
        return <div>Loading...</div>;  // Or any other loading indicator
    }


    // color legend to be displayed
    const CalendarLegend = () => (
        <Box display="flex" justifyContent="center" alignItems="center" padding={2} bgcolor="background.paper">
            <Box display="flex" alignItems="center" marginRight={2}>
                <Box width={20} height={20} bgcolor="blue" marginRight={1} />
                <Typography>Available Slot (non-repeating)</Typography>
            </Box>
            <Box display="flex" alignItems="center" marginRight={2}>
                <Box width={20} height={20} bgcolor="purple" marginRight={1} />
                <Typography>Available Slot (repeats weekly) </Typography>
            </Box>
            <Box display="flex" alignItems="center" marginRight={2}>
                <Box width={20} height={20} bgcolor="grey" marginRight={1} />
                <Typography>Booked Service Time</Typography>
            </Box>
            <Box display="flex" alignItems="center">
                <Box width={20} height={20} bgcolor="lightblue" marginRight={1} />
                <Typography>Transit Time</Typography>
            </Box>

        </Box>
    );


    return (
        <Container maxWidth="lg">
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 3, mb: 2 }}>
                <Typography variant="h4">
                    Set Your Weekly Availability
                </Typography>
            </Box>
            <AvailabilityCalendar
                Servicetype={serviceType}
                defaultSlotDuration={defaultSlotDuration}
                // globalAvailabilities={globalAvailabilities}
            />
            <CalendarLegend />
        </Container>
    );
};

export default SelectAvailabilityPage;
