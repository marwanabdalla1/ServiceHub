import React, {useEffect, useState} from 'react';
import {BookingDetails, useBooking} from '../contexts/BookingContext';
import StepOne from '../components/bookingSteps/CreateAccountOrSignIn';
import StepTwo from '../components/bookingSteps/SelectTimeslotPage';
import StepThree from '../components/bookingSteps/UpdateProfile';
import StepFour from '../components/bookingSteps/ReviewAndConfirm';
import {useNavigate, useParams} from 'react-router-dom';
import {Stepper, Step, StepLabel, Box, Container, Grid} from '@mui/material';
import BookingSideCard from "../components/bookingSteps/BookingSideCard";
import {useAuth} from "../contexts/AuthContext";

const BookingPage = () => {
    const {offeringId, step: stepParam} = useParams<{ offeringId: string; step?: string }>();
    const navigate = useNavigate();
    const {token} = useAuth();
    const {
        bookingDetails,
        fetchAccountDetails,
        setProvider,
        fetchOfferingDetails,
        setSelectedServiceDetails,
        resetBookingDetails,
    } = useBooking();

    const safeStepParam = stepParam ?? 'step1';
    const stepNumber = parseInt(safeStepParam.substring(4), 10) || 1;
    const [step, setStep] = useState(stepNumber);
    const steps = ['Sign In', 'Select Timeslot', 'Check Profile', 'Confirm Booking'];



    const areBookingDetailsValid = (bookingDetails: BookingDetails) => {
        const requiredFields = ['location', 'provider', 'price', 'serviceType', 'reqeustedBy', 'serviceOffering', 'timeSlot'];
        return requiredFields.some(field => bookingDetails[field] !== undefined);
    };


    useEffect(() => {
        if(!token && stepParam!== "step1"  && stepParam!== "step0"){
            navigate("/login")
        }
        const fetchProviderDetails = async () => {
            if (offeringId) {
                try {
                    const offering = await fetchOfferingDetails(offeringId);
                    setSelectedServiceDetails(offering, offering.serviceType, offering.hourlyRate);
                    const provider = await fetchAccountDetails(offeringId);
                    setProvider(provider);
                } catch (error) {
                    return;
                }
            }
        };
        fetchProviderDetails();



    }, [offeringId, token]);


    useEffect(() => {
        if (step !== stepNumber) {
            navigate(`/offerings/${offeringId}/booking/step${step}`);
        }
    }, [step, stepNumber, offeringId]);

    // unmount resetting
    useEffect(() => {
        return () => {
            setStep(1);  // Reset step to the first step
            resetBookingDetails(); //reset booking details
        };
    }, []);


    const handleStep = (index: number) => () => {
        if (index < step) { // Only allow navigation to previous steps
            setStep(index + 1);
        }
    };

    const handleCancel = () => {
        setStep(1);
        navigate(`/offerings/${bookingDetails.serviceOffering?._id}`);
    };

    const nextStep = () => {
        if (step < 4) setStep(step + 1);
    };

    const previousStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const currentStep = () => {
        switch (step) {
            case 1:
                return <StepOne onNext={nextStep} bookingDetails={bookingDetails}/>;
            case 2:
                return <StepTwo onNext={nextStep} handleCancel={handleCancel} bookingDetails={bookingDetails}/>;
            case 3:
                return <StepThree onNext={nextStep} handleCancel={handleCancel} bookingDetails={bookingDetails}/>;
            case 4:
                return <StepFour handleCancel={handleCancel} bookingDetails={bookingDetails}/>;
            default:
                return <div>Invalid step</div>;
        }
    };

    return (
        <Container maxWidth="lg" sx={{mt: 4, display: 'flex'}}>
            <Grid container spacing={8}>
                <Grid item xs={9}>
                    {/*stepper on top to see which step we're in*/}
                    <Box display="flex" flexDirection="column" mt={2} width={"100%"} mb={4} mr={10}>
                        <Stepper activeStep={step - 1} alternativeLabel sx={{mb: 2}}>
                            {steps.map((label, index) => (
                                <Step key={label}>
                                    <StepLabel onClick={handleStep(index)}
                                               style={{cursor: index < step ? 'pointer' : 'default'}}
                                               sx={{
                                                   '& .MuiStepLabel-label': {  // Targeting the label text
                                                       fontSize: '0.875rem',
                                                       mt: 1,
                                                   },
                                               }}>
                                        {label}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                        {currentStep()}

                    </Box>
                </Grid>


                <Grid item xs={3} mt={10} width={"20%"}>
                    <BookingSideCard
                        provider={bookingDetails.provider}
                        timeSlot={bookingDetails.timeSlot}
                        serviceOffering={bookingDetails.serviceOffering}
                        price={bookingDetails.price}
                    />
                </Grid>
            </Grid>
        </Container>

    )
        ;
};

export default BookingPage;
