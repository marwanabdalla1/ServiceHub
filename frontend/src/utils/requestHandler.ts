import { JobStatus, RequestStatus } from "../models/enums";

import axios from "axios";
import { formatDateTime } from "./dateUtils";
import { ServiceRequest } from "../models/ServiceRequest";
import { NavigateFunction } from "react-router-dom";
import { sendEmailNotification } from './jobHandler'
import { Account } from "../models/Account";

interface RequestHandlerParams {
    selectedRequest: ServiceRequest;
    serviceRequests: ServiceRequest[];
    setServiceRequests: ((requests: ServiceRequest[]) => void) | null;
    token: string | null;
    account?: Account | null;
    setShowMediaCard: (show: boolean) => void;

}

interface TimeChangeHandlerParams extends RequestHandlerParams {
    comment?: string;  // Add any unique parameters needed for special cases
    setTimeChangePopUp: (popup: boolean) => void;
    navigate: NavigateFunction;  // Add navigate to the interface
}


export const handleAccept = async ({
    selectedRequest,
    serviceRequests,
    setServiceRequests,
    token,
    setShowMediaCard
}: RequestHandlerParams) => {



    // get data from the request (selectedRequest)
    const { requestStatus, job, _id, requestedBy, provider, ...rest } = selectedRequest;

    const jobData = {
        status: JobStatus.open,
        request: selectedRequest._id,
        receiver: selectedRequest.requestedBy._id,
        provider: selectedRequest.provider._id,
        ...rest,
    };

    console.log("job data at frontend:", jobData);

    // post new job
    try {
        const jobResponse = await axios.post("api/jobs/", jobData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("job posted!", jobResponse);


        // update the request
        if (jobResponse.data && jobResponse.data._id) {
            const updateRequestData = {
                job: jobResponse.data._id,
                requestStatus: RequestStatus.accepted,
            };
            console.log("selected request id:", selectedRequest._id, updateRequestData);

            const updateResponse = await axios.patch(`/api/requests/${selectedRequest._id}`, updateRequestData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Request Updated:', updateResponse.data);

            // Update local state to reflect these changes
            const updatedServiceRequests = serviceRequests.map(req => {
                if (req._id === selectedRequest._id) {
                    return { ...req, ...updateRequestData, job: jobResponse.data._id };
                }
                return req;
            });

            console.log(updatedServiceRequests);
            if (setServiceRequests) {
                setServiceRequests(updatedServiceRequests);
            }
            setShowMediaCard(false);


            // Prepare notification data
            const notificationData = {
                isViewed: false,
                content: `Your service request for ${selectedRequest.serviceType} on the ${formatDateTime(selectedRequest.timeslot?.start)} has been accepted`,
                serviceRequest: selectedRequest._id,
                job: jobResponse.data._id,
                recipient: selectedRequest.requestedBy._id,
                notificationType: 'Request Status Changed',

                ...rest,
            };


            console.log("notification data at frontend:", notificationData);

            // generate new notification
            try {
                const notification = await axios.post("api/notifications/", notificationData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("Notification sent!", notification);


            } catch (notificationError) {
                console.error('Error sending notification:', notificationError);
            }


        }
    } catch (error) {
        console.error('Error posting job:', error);
    }
}


export const handleDecline = async ({
    selectedRequest,
    serviceRequests,
    setServiceRequests,
    token,
    setShowMediaCard
}: RequestHandlerParams) => {


    // get data from the request (selectedRequest)
    const { requestStatus, job, _id, requestedBy, provider, timeslot, ...rest } = selectedRequest;

    try {

        // update the request
        const updateRequestData = {
            requestStatus: RequestStatus.declined,
        };
        console.log("selected request id:", selectedRequest._id, updateRequestData)
        const updateResponse = await axios.patch(`/api/requests/${selectedRequest._id}`, updateRequestData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Request Updated:', updateResponse.data);


        // Update local state to reflect these changes
        const updatedServiceRequests = serviceRequests.map(req => {
            if (req._id === selectedRequest._id) {
                return { ...req, ...updateRequestData };
            }
            return req;
        });

        console.log(updatedServiceRequests);
        if (setServiceRequests) {
            setServiceRequests(updatedServiceRequests);
        }
        setShowMediaCard(false);
    } catch (error) {
        console.error('Error declining Request:', error);
    }

    // Prepare notification data
    const notificationData = {
        isViewed: false,
        content: `Your service request for ${selectedRequest.serviceType} originally scheduled for ${formatDateTime(timeslot?.start)} has been declined `,
        serviceRequest: selectedRequest._id,
        recipient: selectedRequest.requestedBy._id,
        notificationType: "Request Status Changed",
        ...rest,
    };

    console.log("notification data at frontend:", notificationData);

    // generate new notification
    try {
        const notification = await axios.post("api/notifications/", notificationData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Notification sent!", notification);


    } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
    }


};

// handle cancel initiated by provider
export const handleCancel = async ({
    selectedRequest,
    serviceRequests,
    setServiceRequests,
    token,
    account,
    setShowMediaCard
}: RequestHandlerParams) => {


    // get data from the request (selectedRequest)
    const { requestStatus, job, _id, requestedBy, provider, timeslot, ...rest } = selectedRequest;

    try {

        // update the request
        const updateRequestData = {
            requestStatus: RequestStatus.cancelled,
        };
        console.log("selected request id:", selectedRequest._id, updateRequestData)
        const updateResponse = await axios.patch(`/api/requests/${selectedRequest._id}`, updateRequestData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Request Updated:', updateResponse.data);


        // todo: also cancel the timeslot
        // Update local state to reflect these changes
        const updatedServiceRequests = serviceRequests.map(req => {
            if (req._id === selectedRequest._id) {
                return { ...req, ...updateRequestData };
            }
            return req;
        });

        console.log(updatedServiceRequests);
        if (setServiceRequests) {
            setServiceRequests(updatedServiceRequests);
        }
        setShowMediaCard(false);
    } catch (error) {
        console.error('Error cancelling Request:', error);
    }

    // Prepare notification data
    const notificationDataToProvider = {
        isViewed: false,
        content: `The service request for ${selectedRequest.serviceType} from ${selectedRequest.requestedBy.firstName} ${selectedRequest.requestedBy.lastName} originally scheduled for ${formatDateTime(timeslot? timeslot.start : selectedRequest.appointmentStartTime)} has been cancelled.`,
        serviceRequest: selectedRequest._id,
        recipient: selectedRequest.provider._id,
        notificationType: "Request Status Changed",
        ...rest,
    };

    const notificationDataToConsumer = {
        isViewed: false,
        content: `Your service request for ${selectedRequest.serviceType} to ${selectedRequest.provider.firstName} ${selectedRequest.provider.lastName} originally scheduled for ${formatDateTime(timeslot? timeslot.start : selectedRequest.appointmentStartTime)} has been cancelled`,
        serviceRequest: selectedRequest._id,
        recipient: selectedRequest.requestedBy._id,
        notificationType: "Request Status Changed",
        ...rest,
    };

    console.log("notification data at frontend for provider:", notificationDataToProvider);
    console.log("notification data at frontend for consumer:", notificationDataToConsumer);

    // generate new notification
    try {
        const notificationToProvider = await axios.post("api/notifications/", notificationDataToProvider, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Notification to provider sent!", notificationToProvider);


        const notificationToConsumer = await axios.post("api/notifications/", notificationDataToConsumer, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Notification to consumer sent!", notificationToConsumer);


    } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
    }

    if (selectedRequest) {
        // Send email to the provider if the user is the receiver
        if (account?._id === selectedRequest.requestedBy._id) {
            let receiverEmail = selectedRequest.provider.email;
            let receiverName = selectedRequest.provider.firstName;
            let initiatorEmail = selectedRequest.requestedBy.email;
            let initiatorName = selectedRequest.requestedBy.firstName;
            sendEmailNotification(initiatorEmail, initiatorName, receiverEmail, receiverName, selectedRequest);
        }

        // Send email to the receiver if the user is the provider
        if (account?._id === selectedRequest.provider._id) {
            let receiverEmail = selectedRequest.requestedBy.email;
            let receiverName = selectedRequest.requestedBy.firstName;
            let initiatorEmail = selectedRequest.provider.email;
            let initiatorName = selectedRequest.provider.firstName;
            sendEmailNotification(initiatorEmail, initiatorName, receiverEmail, receiverName, selectedRequest);
        }
    }


};

export const handleTimeChange = async ({
    selectedRequest,
    serviceRequests,
    setServiceRequests,
    token,
    setShowMediaCard,
    setTimeChangePopUp,
    comment,
    navigate
}: TimeChangeHandlerParams) => {
    setTimeChangePopUp(true);
    console.log("handle time change begin");


    console.log("request exists");

    // get data from the request (selectedRequest)
    const { requestStatus, job, _id, requestedBy, provider, ...rest } = selectedRequest;

    console.log(selectedRequest)
    // Prepare notification data
    const notificationData = {
        isViewed: false,
        content: `Please change the booking time for your service request ${selectedRequest.serviceType} originally scheduled on the ${formatDateTime(selectedRequest.timeslot?.start)}.${(comment && comment != "") ? `\n Comment from the provider: ${comment}` : ''
            }`,
        serviceRequest: selectedRequest._id,
        recipient: selectedRequest.requestedBy._id,
        notificationType: 'Timeslot Change Request',
        ...rest,
    };

    console.log("notification data at frontend:", notificationData);

    // generate new notification
    try {
        const notification = await axios.post("api/notifications/", notificationData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Notification sent!", notification);

        //  update request status

    } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
    }

    try {

        // update the request status
        const updateRequestData = {
            requestStatus: RequestStatus.requesterActionNeeded,
        };
        console.log("selected request id:", selectedRequest._id, updateRequestData)
        const updateResponse = await axios.patch(`/api/requests/${selectedRequest._id}`, updateRequestData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Request Updated:', updateResponse.data);

        // Update local state to reflect these changes
        const updatedServiceRequests = serviceRequests.map(req => {
            if (req._id === selectedRequest._id) {
                return { ...req, ...updateRequestData, timeslot: undefined };
            }
            return req;
        });

        console.log("updates after sending timeslot change:", updatedServiceRequests);
        if (setServiceRequests) {
            setServiceRequests(updatedServiceRequests);
        }
        setShowMediaCard(false);
    } catch (error) {
        console.error('Error cancelling Request:', error);
    }
    navigate("/select-availability")
    setTimeChangePopUp(false);
};


