import React, {useEffect, useState} from 'react';
import {Card, CardContent, Typography, Box} from '@mui/material';
import {Timeslot} from "../../models/Timeslot";
import {Account} from "../../models/Account";
import {ServiceOffering} from "../../models/ServiceOffering";
import Avatar from "@mui/material/Avatar";
import {defaultProfileImage, fetchProfileImageById} from "../../services/fetchProfileImage";
import {formatDateTime} from "../../utils/dateUtils";

interface BookingSideCardProps {
    provider?: Account;
    timeSlot?: Timeslot;
    serviceOffering?: ServiceOffering;
    price?: number;
}

// the sidecard throughout the booking steps
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

                    <div style={{display: 'grid', gridTemplateColumns: 'max-content auto', gap: '0.5rem'}}>
                        <Typography variant="body2" color="text.secondary" component="span">Location:</Typography>
                        <Typography variant="body2" color="text.secondary"
                                    component="span">{provider?.location}</Typography>

                        {timeSlot && (
                            <>
                                <Typography variant="body2" color="text.secondary" component="span">Time:</Typography>
                                <Typography variant="body2" color="text.secondary" component="span">
                                    {formatDateTime(timeSlot.start)}
                                </Typography>
                            </>
                        )}
                        {serviceOffering && (
                            <>
                                <Typography variant="body2" color="text.secondary" component="span">Service
                                    Type:</Typography>
                                <Typography variant="body2" color="text.secondary"
                                            component="span">{serviceOffering.serviceType}</Typography>
                            </>
                        )}
                        {price && (
                            <>
                                <Typography variant="body2" color="text.secondary" component="span">Hourly
                                    rate:</Typography>
                                <Typography variant="body2" color="text.secondary" component="span">€{price} per
                                    hour</Typography>
                            </>
                        )}
                    </div>
                </Box>
            </CardContent>
        </Card>
    );
};

export default BookingSideCard;