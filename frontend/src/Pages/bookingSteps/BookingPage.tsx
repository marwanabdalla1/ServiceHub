import React, {useEffect, useState} from 'react';
import {useBooking} from '../../contexts/BookingContext';
import StepOne from './CreateAccountOrSignIn';
import StepTwo from './SelectTimeslotPage';
import StepThree from './UpdateProfile';
import StepFour from './ReviewAndConfirm';
import {useNavigate, useParams} from 'react-router-dom';
import {Stepper, Step, StepLabel, Button, Box, Container} from '@mui/material';
import BookingSideCard from "../../components/BookingSideCard";

const BookingPage = () => {
    const {offeringId, step: stepParam} = useParams<{ offeringId: string; step?: string }>();
    const navigate = useNavigate();
    const {
        bookingDetails,
        fetchAccountDetails,
        setProvider,
        fetchOfferingDetails,
        setSelectedServiceDetails
    } = useBooking();

    const safeStepParam = stepParam ?? 'step1';
    const stepNumber = parseInt(safeStepParam.substring(4), 10) || 1;
    const [step, setStep] = useState(stepNumber);
    const steps = ['Sign In', 'Select Timeslot', 'Check Profile', 'Confirm Booking'];

    useEffect(() => {
        const fetchProviderDetails = async () => {
            if (offeringId) {
                try {
                    const offering = await fetchOfferingDetails(offeringId);
                    setSelectedServiceDetails(offering, offering.serviceType, offering.hourlyRate);
                    const provider = await fetchAccountDetails(offeringId);
                    setProvider(provider);
                } catch (error) {
                    console.error('Error fetching provider details:', error);
                }
            }
        };
        fetchProviderDetails();
    }, [offeringId]);

    useEffect(() => {
        if (step !== stepNumber) {
            navigate(`/offerings/${offeringId}/booking/step${step}`);
        }
    }, [step, stepNumber, offeringId]);

    // unmount resetting
    useEffect(() => {
        return () => {
            setStep(1);  // Reset step to the first step
        };
    }, []);


    const handleStep = (index: number) => () => {
        console.log("back step clicked!", index, step)
        if (index < step) { // Only allow navigation to previous steps
            setStep(index + 1);
            // currentStep(index+1)
            // navigate(`/offerings/${offeringId}/booking/step${index + 1}`);
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
        // console.log("go to step:", gotoStep)
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
        <Box>
            <Container sx={{display:"flex", mt: 4, justifyContent:"space-between" }}>
                <Box display="flex" flexDirection="column" mt={2} width={"75%"} mb={4}>
                        <Stepper activeStep={step - 1} alternativeLabel sx={{ mb: 2 }}>
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
                    {/*<Button onClick={previousStep}>Back</Button>*/}
                    {/*<Box sx={{mt: '5'}}>*/}
                    {currentStep()}
                    {/*</Box>*/}

                </Box>

                <Box sx={{width: 250, mt:10}}>
                    <BookingSideCard
                        provider={bookingDetails.provider}
                        timeSlot={bookingDetails.timeSlot}
                        serviceOffering={bookingDetails.serviceOffering}
                        price={bookingDetails.price}
                    />
                </Box>
            </Container>

        </Box>
    );
};

export default BookingPage;
