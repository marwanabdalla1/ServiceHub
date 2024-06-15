import * as React from 'react';
import {Box, Typography, Card, CardContent, Avatar} from '@mui/material';
import {Appointment} from "../models/Appointment";

const AppointmentCard: React.FC<Appointment> = ({date, user, service}) => {
    return (
        <Card sx={{mb: 4, height: '80px'}}>
            <CardContent  sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                <Avatar src={user.profileImageUrl} alt={user.firstName} sx={{mr: 2}}/>
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        {date}
                    </Typography>
                    <Typography variant="h6">
                        {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {service}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default AppointmentCard;