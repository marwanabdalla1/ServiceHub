import React, { useEffect, useState } from 'react';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import {Typography, Container, Box, Stepper, Step, StepLabel, Popover, Button} from '@mui/material';
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import InfoIcon from "@mui/icons-material/Info";

const SelectAvailabilityPage: React.FC = () => {
    const [serviceType, setServiceType] = useState("Babysitting"); // Placeholder for the service type [e.g. "Tutoring"]
    const [defaultSlotDuration, setDefaultSlotDuration] = useState(60); // Placeholder for the default slot duration
    const {token, account, isReady, isFetched } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isProvider = account?.isProvider || false;
    const inAddServiceSteps = location.state?.inAddServiceSteps || false;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);



    useEffect(() => {

        if (!isReady || (token && !isFetched)){
            console.log("not ready!")
            return;
        }

       
    }, [token, isProvider, account, isReady, isFetched]);

    if (!isReady) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );    }

    if (!token || !account || (account && !isProvider)) {
        // If not a provider, redirect" to home or another appropriate page
        navigate('/unauthorized'); // Make sure you have a route for '/unauthorized' or change as needed
    }
    // color legend to be displayed
    const CalendarLegend = () => (
        <Box display="flex" justifyContent="center" alignItems="center" padding={1} bgcolor="background.paper">
            <Box display="flex" alignItems="center" marginRight={2}>
                <Box width={20} height={20} bgcolor="blue" marginRight={1} />
                <Typography>Available Slot (non-repeating)</Typography>
            </Box>
            <Box display="flex" alignItems="center" marginRight={2}>
                <Box width={20} height={20} bgcolor="purple" marginRight={1} />
                <Typography>Available Slot (repeats weekly) </Typography>
            </Box>
            <Box display="flex" alignItems="center" marginRight={2}>
                <Box width={20} height={20} bgcolor="lightgrey" marginRight={1} />
                <Typography>Booked Service Time</Typography>
            </Box>
            <Box display="flex" alignItems="center">
                <Box width={20} height={20} bgcolor="lightblue" marginRight={1} />
                <Typography>Transit Time</Typography>
            </Box>

        </Box>
    );

    // popover for slot booking information
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'info-popover' : undefined;

    const InfoPopover = () => (
        <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
        }}
    >
        <Box p={2} maxWidth={500}>
            <Typography variant="h6">Availability Selection Instructions</Typography>
            <Typography variant="body1">
                When setting your availability, please keep in mind the following:
            </Typography>
            <Typography variant="body2" paragraph>
                1. <strong>Travel Time Adjustment</strong>: Your available time slots will be adjusted to account for your travel time. For example, if you set your availability from 10:00 to 16:00 and your travel time is 30 minutes, your available slots for customers will be from 10:30 to 15:30.
            </Typography>
            <Typography variant="body2" paragraph>
                2. <strong>Default (Minimum) Slot Duration</strong>: Only slots that are equal to or longer than your default service duration will be shown to customers. Ensure your selected availability can accommodate your default duration to avoid having no visible slots.
            </Typography>
            <Typography variant="body2">
                <em>Example:</em> If you are available from 10:00 to 16:00 with a 30-minute transit time and a 1-hour default duration, the available slots shown to customers will be from 10:30 to 3:30 PM, and they have to book a slot no shorter than 1 hour.
            </Typography>
        </Box>
    </Popover>
    )
    return (
        <Container maxWidth="lg">
            {inAddServiceSteps && (
                <Stepper activeStep={2} alternativeLabel sx={{ mb: 2, mt:2 }}>
                    <Step>
                        <StepLabel>Check Profile</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Add Service</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Add Availability</StepLabel>
                    </Step>
                </Stepper>
            )}
            <Box display="flex" alignItems="center" justifyContent="left" sx={{ mt: 3, mb: 2 }}>
                <Typography variant="h4">
                    Set Your Weekly Availability
                </Typography>
                <Button
                    aria-describedby={id}
                    onClick={handleClick}
                    startIcon={<InfoIcon />}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2, mb: 2, ml: 5, textTransform: 'none', color: 'text.secondary', borderColor: 'text.secondary',
                        '&:hover': {
                            borderColor: 'text.secondary',
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        }}}
                >
                    How is my schedule displayed while booking?
                </Button>
                <InfoPopover/>
            </Box>
            <AvailabilityCalendar
                Servicetype={serviceType}
                defaultSlotDuration={defaultSlotDuration}
            />
            <Box display="flex" justifyContent="space-between" alignItems="start" sx={{ mt: 3, mb: 2 }}>
                <CalendarLegend />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/')}
                    sx={{ ml: 2, backgroundColor: "64B5F6"}}
                >
                    Go to homepage
                </Button>
            </Box>
        </Container>
    );
};

export default SelectAvailabilityPage;
