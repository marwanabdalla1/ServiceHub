import React, {useEffect, useState} from 'react';
import AvailabilityCalendarBooking from "../components/calendar/AvailabilityCalendarBooking";
import {Typography, Container, Button, Box} from '@mui/material';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {BookingDetails} from "../contexts/BookingContext";
import {useAuth} from "../contexts/AuthContext";
import axios, {AxiosError} from "axios";
import {RequestStatus} from "../models/enums";
import useAlert from "../hooks/useAlert";
import AlertCustomized from "../components/AlertCustomized";
import ErrorPage from "./ErrorPage";
import useErrorHandler from "../hooks/useErrorHandler";

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
    const {requestId} = useParams();
    const [providerId, setProviderId] = useState<string | null>(null);

    const [requestNotEditable, setRequestNotEditable] = useState(false);

    const [request, setRequest] = useState<ServiceRequest | null>(null);
    // const [loading, setLoading] = useState(true);
    const {error, setError, handleError} = useErrorHandler();
    const {token, account} = useAuth();

    const {alert, triggerAlert, closeAlert} = useAlert(30000);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const commentFromProvider = queryParams.get('comment');
    const navigate = useNavigate();

    // get the booking details
    useEffect(() => {
            const fetchRequest = async () => {
                try {
                    const response = await axios.get(`/api/requests/${requestId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    // make sure only the requester can access this and only upon provider's request
                    if (!response) {
                        navigate("/not-found");
                        return;
                    }
                    if (account && response.data.requestedBy._id.toString() !== account?._id.toString()) {
                        navigate("/unauthorized");
                        return;
                    }

                    // if a new timeslot was already reselected, requester cannot access anymore
                    if (account && response.data.requestStatus.toString() != RequestStatus.requesterActionNeeded.toString()) {
                        setRequestNotEditable(true);
                    }
                    setRequest(response.data);
                    setProviderId(response.data.provider._id)
                } catch (error: any) {
                    navigate("/not-found")
                }
            }

            if (token && account) {
                fetchRequest()
            }
        }, [requestId, token, account]
    );

    // unmount
    useEffect(() => {
        return () => {
            setError(null);
        };
    }, []);

    if (requestNotEditable) {
        return <ErrorPage title={"403 Forbidden"} message={'No action can be made to this request. \n' +
            'If you have already rebooked a timeslot, you can view it in your outgoing requests.'}
                          redirectTitle={"Outgoing Requests"} redirectPath={"/outgoing/requests"}/>;
    }

    const CalendarLegend = () => (
        <Box display="flex" alignItems="center" marginRight={2}>
            <Box width={20} height={20} bgcolor=" #bbf7d0" marginRight={1}/>
            <Typography>Available Time</Typography>
        </Box>);

    return (
        <Container maxWidth="lg">
            <div>
                <AlertCustomized alert={alert} closeAlert={closeAlert}/>
            </div>
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{mt: 4, mb: 4}}>
                <Typography variant="h4">
                    Choose an alternative time for your booking
                </Typography>
            </Box>
            {/*display provider's comment if any*/}
            {commentFromProvider && (
                <Box mt={2} mb={2}>
                    <Typography>{decodeURIComponent(commentFromProvider)}</Typography>

                </Box>
            )}

            {/*info for the consumer*/}
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{mt: 3, mb: 2}}>
                <Typography variant="body2" gutterBottom marginBottom={2} style={{whiteSpace: 'pre-line'}}
                            sx={{flex: 6}}>
                    The default duration for this service
                    is {request?.serviceOffering?.baseDuration || 60} minutes. If you select a slot shorter than
                    this, it will be automatically extended to the default duration.
                    {"\n"}
                    Note that you can only book a slot up to three months in advance.
                </Typography>
                <CalendarLegend/>

            </Box>
            <AvailabilityCalendarBooking
                Servicetype={request?.serviceType}
                providerIdInput={providerId}
                requestIdInput={requestId}
                mode={"change"}
                defaultSlotDuration={request?.serviceOffering.baseDuration || 60}
                defaultTransitTime={request?.serviceOffering?.bufferTimeDuration || 30}
                onNext={() => {}} //no next step needed
            />

        </Container>
    );
};

export default ChangeBookingTimePage;
