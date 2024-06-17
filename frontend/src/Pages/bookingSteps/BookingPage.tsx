import React, {useEffect, useState} from 'react';
import { useBooking } from '../../contexts/BookingContext';
import StepOne from './CreateAccountOrSignIn';
import StepTwo from './SelectTimeslotPage'; // Component for step 2
import StepThree from './UpdateProfile'; // Component for step 3
import StepFour from './ReviewAndConfirm';
import {useNavigate, useParams} from "react-router-dom"; // Component for step 4

const BookingPage = () => {
    const { providerId, offeringId, step: stepParam } = useParams<{ providerId: string; offeringId: string; step?: string }>();
    const navigate = useNavigate();
    const { bookingDetails , fetchAccountDetails} = useBooking(); // Accessing booking details from contexts

    // Ensure stepParam is a string before processing, default to "step0"
    const safeStepParam = stepParam ?? 'step1';
    const stepNumber = parseInt(safeStepParam.substring(4)) || 1;  // Extract number and default to 0 if undefined
    const [step, setStep] = useState(stepNumber); // Controls which step to display

    //
    // // Fetch provider details based on the ID and set in context
    useEffect(() => {
        const fetchProvider = async () => {
            if (providerId && offeringId) {
                const provider = await fetchAccountDetails(providerId);
            }
        };
        fetchProvider();
    }, [providerId, offeringId, fetchAccountDetails]);

    // const fetchProviderDetails = async (providerId: string) => {
    //     // Placeholder for fetchuseEffect(() => {
    //         // Update URL if step state changes and doesn't match the URL
    //         if (step !== stepNumber) {
    //             navigate(`/provider/${providerId}/offering/${offeringId}/booking/step${step}`);
    //         }
    //     }, [step, providerId, offeringId, navigate, stepNumber]);
    //     // Assume an API call fetches the provider details
    //     const response = await fetch(`/api/providers/${providerId}`);
    //     const providerData = await response.json();
    //     setProvider(providerData);
    // };

    useEffect(() => {
        // Update URL if step state changes and doesn't match the URL
        if (step !== stepNumber) {
            navigate(`/provider/${providerId}/offering/${offeringId}/booking/step${step}`);
        }
    }, [step, providerId, offeringId, navigate, stepNumber]);

    const nextStep = () => {
        if (step < 4) setStep(step + 1); // Increment step to move to the next
    };

    const previousStep = () => {
        if (step > 1) setStep(step - 1); // Decrement step to go back
        else goToProviderProfile();
    };

    const goToProviderProfile = () => {
        navigate(`/provider/${providerId}/offering/${offeringId}`); //  the route to view a provider's profile on this offering
    };

    const handleBookingComplete = () => {
        console.log('Booking Complete:', bookingDetails);

        //todo: Maybe navigate to a confirmation page or reset the booking process (but it is implemented in the ReviewAndConfirm Page itself)
    };

    switch (step) {
        case 1:
            return <StepOne onNext={nextStep} onBack={previousStep}/>;
        case 2:
            return <StepTwo onNext={nextStep} onBack={previousStep} />;
        case 3:
            return <StepThree onNext={nextStep} onBack={previousStep} />;
        case 4:
            return <StepFour onComplete={handleBookingComplete} onBack={previousStep} />;
        default:
            return <div>Invalid step</div>;
    }
};

export default BookingPage;
