import React, {useEffect, useState} from 'react';
import AvailabilityCalendarBooking from "../components/AvailabilityCalendarBooking";
import { Typography, Container, Button, Box } from '@mui/material';
import {useLocation, useParams} from 'react-router-dom';
import {BookingDetails} from "../contexts/BookingContext";
import {useAuth} from "../contexts/AuthContext";
import axios from "axios";
import {RequestStatus} from "../models/enums";

// interface ChangeBookingTimeslotProps {
//     onNext: () => void;
//     onBack: () => void;
//     bookingDetails: BookingDetails;
// }

interface ServiceRequest {
    _id: string;
    serviceType: string;
    serviceOffering: {
        _id: string;
        baseDuration: number;
        bufferTimeDuration: number;
    };
    provider: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    requestedBy: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    appointmentStartTime: Date;
    appointmentEndTime: Date;
}

const ChangeBookingTimePage: React.FC = () => {
    const { requestId } = useParams();
    const [providerId,setProviderId] = useState<string | null>(null);

    const [request, setRequest] = useState<ServiceRequest | null>(null);
    // const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string| null>(null);
    const {token, account} = useAuth();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const commentFromProvider = queryParams.get('comment');

    // get the booking details
    useEffect(() => {
        console.log("change booking:", requestId, token, account)
        const fetchRequest = async () => {
            try {
                const response = await axios.get(`/api/requests/${requestId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Pass the token if authentication is needed
                    },
                });

                console.log("requests response", response.data)
                // make sure only the requestor can access this and only upon request
                if (response.data.requestedBy !== account?._id || response.data.requestStatus.toString()!= RequestStatus.requestorActionNeeded.toString()) {
                    setError('Access Denied...');
                    return;
                }
                setRequest(response.data);
                setProviderId(response.data.provider._id)
                console.log("fetched request when changing booking time:", request)
            } catch (err: any) {
                setError(err.message);
            }
        };

        fetchRequest();
    }, [requestId, token]);

    // const [serviceType, setServiceType] = useState("Babysitting"); // Placeholder for the service type [e.g. "Tutoring"]
    // const [defaultSlotDuration, setDefaultSlotDuration] = useState(60); // Placeholder for the default slot duration
    // const [globalAvailabilities, setGlobalAvailabilities] = useState<Event[]>([{start: Date.now(), end: Date.now(), title: "Event"}]); // Placeholder for the global availabilities [e.g. tutor availabilities]


    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!request) {
        return <div>No request found.</div>;
    }

    return (
        <Container maxWidth="lg">
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4">
                    Choose an alternative time for your booking
                </Typography>
            </Box>
            {commentFromProvider && (
                <Box mt={2} mb={2}>
                    <Typography>Comment from the provider: {decodeURIComponent(commentFromProvider)}</Typography>
                </Box>
            )}
            <AvailabilityCalendarBooking
                Servicetype={request.serviceType}
                providerIdInput={providerId}
                requestIdInput={requestId}
                mode={"change"}
                defaultSlotDuration={request.serviceOffering.baseDuration || 60}
                defaultTransitTime={request.serviceOffering?.bufferTimeDuration || 30}
                onNext={()=>console.log("next")}
            />

        </Container>
    );
};

export default ChangeBookingTimePage;
