import React, {useEffect, useState} from 'react';
import { useBooking } from '../../contexts/BookingContext';
import StepOne from './CreateAccountOrSignIn';
import StepTwo from './SelectTimeslotPage'; // Component for step 2
import StepThree from './UpdateProfile'; // Component for step 3
import StepFour from './ReviewAndConfirm';
import {useNavigate, useParams} from "react-router-dom"; // Component for step 4

const BookingPage = () => {
    const { offeringId, step: stepParam } = useParams<{ offeringId: string; step?: string }>();
    const navigate = useNavigate();
    const { bookingDetails , fetchAccountDetails, setProvider, fetchOfferingDetails, setSelectedServiceDetails} = useBooking(); // Accessing booking details from contexts

    // Ensure stepParam is a string before processing, default to "step0"
    const safeStepParam = stepParam ?? 'step1';
    const stepNumber = parseInt(safeStepParam.substring(4)) || 1;  // Extract number and default to 0 if undefined
    const [step, setStep] = useState(stepNumber); // Controls which step to display

    //
    // // Fetch provider details based on the ID and set in context
    useEffect(() => {
        const fetchProviderDetails = async () => {
            console.log("BOOKING PAGE!!!")
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
            navigate(`/offerings/${offeringId}/booking/step${step}`);
        }
    }, [step, offeringId, navigate, stepNumber]);

    const nextStep = () => {
        if (step < 4) setStep(step + 1); // Increment step to move to the next
    };

    const previousStep = () => {
        if (step > 1 && step!=2) setStep(step - 1); // Decrement step to go back
        else goToServiceOfferingProfile();
    };

    const goToServiceOfferingProfile = () => {
        navigate(`/offerings/${offeringId}`); //  the route to view a provider's profile on this offering
    };

    const handleBookingComplete = () => {
        console.log('Booking Complete:', bookingDetails);

        //todo: Maybe navigate to a confirmation page or reset the booking process (but it is implemented in the ReviewAndConfirm Page itself)
    };

    const currentStep = () => {switch (step) {
        case 1:
            return <StepOne onNext={nextStep} onBack={previousStep} bookingDetails={bookingDetails}/>;
        case 2:
            return <StepTwo onNext={nextStep} onBack={previousStep} bookingDetails={bookingDetails}/>;
        case 3:
            return <StepThree onNext={nextStep} onBack={previousStep} bookingDetails={bookingDetails} />;
        case 4:
            return <StepFour onComplete={handleBookingComplete} onBack={previousStep} bookingDetails={bookingDetails}/>;
        default:
            return <div>Invalid step</div>;
        }
    };

    return(
        <div>
            {currentStep()}
        </div>
    )
};

export default BookingPage;
