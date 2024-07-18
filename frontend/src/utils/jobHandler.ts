import {JobStatus} from "../models/enums";
import axios from "axios";
import {formatDateTime} from "./dateUtils";
import {Job} from "../models/Job";
import {Account} from "../models/Account";
import {AlertColor} from "@mui/material";
import moment from 'moment';
import {ServiceRequest} from "../models/ServiceRequest";


interface JobHandlerParams {
    selectedJob: Job;
    jobs: Job[];
    setJobs: ((jobs: Job[]) => void) | null;
    token: string | null;
    account?: Account | null;
    setShowMediaCard: (show: boolean) => void;
    triggerAlert: (title: string, message: string, severity: AlertColor, duration: number, type: string, position: string, redirectUrl?: string) => void;

}


/**
 * Handles the completion of a job from provider's side.
 * @param selectedJob
 * @param jobs
 * @param setJobs
 * @param token
 * @param setShowMediaCard
 * @param triggerAlert
 */
export const handleComplete = async ({
                                         selectedJob,
                                         jobs,
                                         setJobs,
                                         token,
                                         setShowMediaCard,
                                         triggerAlert
                                     }: JobHandlerParams) => {


        //   sanity check: appointment time has to be in the past
        //TODO: uncomment
        // if (!selectedJob.timeslot?.end || moment(selectedJob.timeslot.end).isAfter(moment())) {
        //     console.error('The job cannot be completed, since its appointment is in the future.');
        //     triggerAlert("Job Cannot Be Completed", "The job cannot be completed, since the appointment ends in the future. Please try again after the end time.", "error", 10000000, "dialog", "center", 'none')
        //     return;
        // }

        try {

            // update the job status
            const updateJobData = {
                status: JobStatus.completed,
            };
            const updateJob = await axios.put(`/api/jobs/${selectedJob?._id}`, updateJobData, {
                headers: {Authorization: `Bearer ${token}`}
            });
            // Update local state to reflect these changes
            const updatedOfferedServices = jobs.map(job => {
                if (job._id === selectedJob._id) {
                    return {...job, ...updateJobData};
                }
                return job;
            });

            if (setJobs) {
                setJobs(updatedOfferedServices);
            }
            triggerAlert("Success", "Successfully marked job as completed.", "success", 10000, "dialog", "center")
            setShowMediaCard(false);
        } catch (error) {
            triggerAlert("Error", "An error occurred. Please try again later or refresh the page.", "error", 10000, "dialog", "center")
        }

        const {status, _id, receiver, provider, ...rest} = selectedJob;
// Prepare notification data
        const notificationData = {
            isViewed: false,
            content: `Your service for ${selectedJob.serviceType} on the ${formatDateTime(selectedJob.timeslot?.start)} has been marked as complete`,
            job: selectedJob._id,
            recipient: selectedJob.receiver._id,
            notificationType: "Job Status Changed",
            ...rest,
        };


// generate new notification
        try {
            const notification = await axios.post("api/notifications/", notificationData, {
                headers: {Authorization: `Bearer ${token}`}
            });


        } catch (notificationError) {
        }


    }
;

/**
 * handle revoking completed job (from provider's side)
 * @param selectedJob
 * @param jobs
 * @param setJobs
 * @param token
 * @param setShowMediaCard
 */
export const handleRevoke = async ({
                                       selectedJob,
                                       jobs,
                                       setJobs,
                                       token,
                                       setShowMediaCard,
    triggerAlert,
                                   }: JobHandlerParams) => {


    try {

        // reset the job status to open
        const updateOfferedServiceData = {
            status: JobStatus.open,
        };
        const updateJob = await axios.put(`/api/jobs/${selectedJob?._id}`, updateOfferedServiceData, {
            headers: {Authorization: `Bearer ${token}`}
        });

        // Update local state to reflect these changes
        const updatedOfferedServices = jobs.map(job => {
            if (job._id === selectedJob._id) {
                return {...job, ...updateOfferedServiceData};
            }
            return job;
        });

        if (setJobs) {
            setJobs(updatedOfferedServices);
        }
        triggerAlert("Success", "Successfully revoked job completion.", "success", 10000, "dialog", "center")
        setShowMediaCard(false);
    } catch (error) {
        triggerAlert("Error", "An error occurred. Please try again later or refresh the page.", "error", 10000, "dialog", "center")
    }

    const {status, _id, receiver, provider, ...rest} = selectedJob;
    // Prepare notification data
    const notificationData = {
        isViewed: false,
        content: `The completion of your service for ${selectedJob.serviceType} on the ${formatDateTime(selectedJob.timeslot?.start)} has been revoked`,
        job: selectedJob._id,
        recipient: selectedJob.receiver._id,
        notificationType: "Job Status Changed",
        ...rest,
    };

    // generate new notification
    try {
        const notification = await axios.post("api/notifications/", notificationData, {
            headers: {Authorization: `Bearer ${token}`}
        });

    } catch (notificationError) {
    }


};

export const handleCancel = async ({
                                       selectedJob,
                                       jobs,
                                       setJobs,
                                       token,
                                       account,
                                       setShowMediaCard,
    triggerAlert,
                                   }: JobHandlerParams) => {


    try {

        // update the request
        const updateOfferedServiceData = {
            status: JobStatus.cancelled,
        };
        const updateResponse = await axios.put(`/api/jobs/${selectedJob?._id}`, updateOfferedServiceData, {
            headers: {Authorization: `Bearer ${token}`}
        });


        // Update local state to reflect these changes
        if (jobs && setJobs) {
            const updatedOfferedServices = jobs.map(job => {
                if (job._id === selectedJob._id) {
                    return {...job, ...updateOfferedServiceData};
                }
                return job;
            });

            setJobs(updatedOfferedServices);
        }
        setShowMediaCard(false);
    } catch (error) {
        triggerAlert("Error cancelling request", "An error occurred. Please try again later or refresh the page.", "error", 10000, "dialog", "center")
    }

    const {status, _id, receiver, provider, ...rest} = selectedJob;
    // Prepare notification data
    const notificationDataToConsumer = {
        isViewed: false,
        content: `Your scheduled service for ${selectedJob.serviceType} to ${selectedJob.provider.firstName} ${selectedJob.provider.lastName} on the ${formatDateTime(selectedJob.timeslot?.start)} has been cancelled`,
        job: selectedJob._id,
        recipient: selectedJob.receiver._id,
        notificationType: "Job Status Changed",
        ...rest,
    };


    const notificationDataToProvider = {
        isViewed: false,
        content: `The scheduled service for ${selectedJob.serviceType} from ${selectedJob.receiver.firstName} ${selectedJob.receiver.lastName} on the ${formatDateTime(selectedJob.timeslot?.start)} has been cancelled`,
        job: selectedJob._id,
        recipient: selectedJob.provider._id,
        notificationType: "Job Status Changed",
        ...rest,
    };


    // generate new notification
    try {
        const notificationToConsumer = await axios.post("api/notifications/", notificationDataToConsumer, {
            headers: {Authorization: `Bearer ${token}`}
        });

        const notificationToProvider = await axios.post("api/notifications/", notificationDataToProvider, {
            headers: {Authorization: `Bearer ${token}`}
        });


    } catch (notificationError) {
    }

    if (selectedJob) {
        // Send email to the provider if the user is the receiver
        if (account?._id === selectedJob.receiver._id) {
            let receiverEmail = selectedJob.provider.email;
            let receiverName = selectedJob.provider.firstName;
            let initiatorEmail = selectedJob.receiver.email;
            let initiatorName = selectedJob.receiver.firstName;
            sendEmailNotification(initiatorEmail, initiatorName, receiverEmail, receiverName, selectedJob);
        }

        // Send email to the receiver if the user is the provider
        if (account?._id === selectedJob.provider._id) {
            let receiverEmail = selectedJob.receiver.email;
            let receiverName = selectedJob.receiver.firstName;
            let initiatorEmail = selectedJob.provider.email;
            let initiatorName = selectedJob.provider.firstName;
            sendEmailNotification(initiatorEmail, initiatorName, receiverEmail, receiverName, selectedJob);
        }
    }
};


export const sendEmailNotification = async (initiatorEmail: string,
                                            initiatorName: string,
                                            receiverEmail: string,
                                            receiverName: string, selectedJob: Job | ServiceRequest) => {
    try {
        await axios.post('/api/email/cancelNotification', {
            initiatorEmail: initiatorEmail,
            initiatorName: initiatorName,
            receiverEmail: receiverEmail,
            receiverName: receiverName,
            serviceType: selectedJob.serviceType,
            startTime: selectedJob.timeslot?.start,
        }).then((res) => {
            console.log(`Email sent to ${receiverEmail} and ${initiatorEmail}:`, res);
        }).catch((err) => {
            console.error(`Error sending email to ${receiverEmail} or ${initiatorEmail}:`, err);
        });
    } catch (error) {
        console.error("There was an error sending the email", error);
    }
};

