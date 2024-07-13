import React, {useEffect, useState} from 'react';
import {Card, CardContent, Typography, Box} from '@mui/material';
import {Timeslot} from "../models/Timeslot";
import {Account} from "../models/Account";
import {ServiceOffering} from "../models/ServiceOffering";
import Avatar from "@mui/material/Avatar";
import {defaultProfileImage, fetchProfileImageById} from "../services/fetchProfileImage";

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
    const [profileImage, setProfileImage] = useState<string | null>(null);
    useEffect(() => {
        if (provider) {
            fetchProfileImageById(provider._id).then((image) => {
                setProfileImage(image);
            });
        }
    }, [provider]);

    return (
        <Card>
            <CardContent sx={{display: 'flex', alignItems: 'center'}}>
                <Box>

                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem'}}>
                        <Avatar alt={provider?.firstName + " " + provider?.lastName}
                                src={provider ? profileImage || undefined : defaultProfileImage}
                                sx={{width: 60, height: 60, marginRight: '0.5rem'}}/>
                        <div style={{marginRight: '1rem', textAlign: 'left'}}>
                            <Typography variant="h6" color="text.primary">
                                {provider?.firstName + " " + provider?.lastName}
                            </Typography>
                        </div>
                    </div>
                    <Typography variant="body2" color="text.secondary">Location: {provider?.location}</Typography>

                    {timeSlot && timeSlot.start && (
                        <Typography variant="body2" color="text.secondary">
                           {timeSlot.start.toLocaleString()}
                        </Typography>
                    )}
                    {serviceOffering && (
                        <Typography variant="body2"
                                    color="text.secondary">Service provided: {serviceOffering.serviceType}</Typography>
                    )}
                    {price && (
                        <Typography variant="body2" color="text.secondary">Hourly rate: €{price} per hour</Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default BookingSideCard;