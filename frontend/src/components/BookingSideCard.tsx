import React from 'react';
import {Card, CardContent, Typography, Box} from '@mui/material';
import {Timeslot} from "../models/Timeslot";
import {Account} from "../models/Account";
import {ServiceOffering} from "../models/ServiceOffering";

interface BookingSideCardProps {
    provider?: Account;
    timeSlot?: Timeslot;
    serviceOffering?: ServiceOffering;
    price?: number;
}

const BookingSideCard: React.FC<BookingSideCardProps> = ({
                                                             provider,
                                                             timeSlot,
                                                             serviceOffering,
                                                             price
                                                         }) => {
    return (
        <Card>
            <CardContent sx={{display: 'flex', alignItems: 'center'}}>
                <Box>
                    <Typography variant="h6">{`${provider?.firstName} ${provider?.lastName}`}</Typography>

                    <Typography variant="body2" color="text.secondary">{provider?.location}</Typography>

                    {timeSlot && timeSlot.start && (
                        <Typography variant="body2" color="text.secondary">
                            {timeSlot.start.toLocaleString()}
                        </Typography>
                    )}
                    {serviceOffering && (
                        <Typography variant="body2" color="text.secondary">{serviceOffering.serviceType}</Typography>
                    )}
                    {price && (
                        <Typography variant="body2" color="text.secondary">{price} per hour</Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default BookingSideCard;
