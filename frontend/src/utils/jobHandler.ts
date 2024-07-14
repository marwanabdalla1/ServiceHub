import {JobStatus, RequestStatus} from "../models/enums";
import axios from "axios";
import {formatDateTime} from "./dateUtils";
import {NavigateFunction} from "react-router-dom";
import {Job} from "../models/Job";
import {Account} from "../models/Account";
import useAlert from "../hooks/useAlert";
import {useCallback} from "react";
import {AlertColor} from "@mui/material";
import moment from 'moment';
import {ServiceRequest} from "../models/ServiceRequest";
import {isPast, isFuture, parseISO, compareAsc, compareDesc} from 'date-fns';


interface JobHandlerParams {
    selectedJob: Job;
    jobs: Job[];
    setJobs: ((jobs: Job[]) => void) | null;
    token: string | null;
    account?: Account | null;
    setShowMediaCard: (show: boolean) => void;

}

interface JobHandlerParamsWithAlert extends JobHandlerParams {
    triggerAlert: (title: string, message: string, severity: AlertColor, duration: number, type: string, position: string, redirectUrl?: string) => void;
}


export const handleComplete = async ({
                                         selectedJob,
                                         jobs,
                                         setJobs,
                                         token,
                                         setShowMediaCard,
                                         triggerAlert
                                     }: JobHandlerParamsWithAlert) => {


        //   sanity check: appointment time has to be in the past
        console.log("dates:", selectedJob.timeslot?.end, "\n date 2", new Date(), formatDateTime(selectedJob.timeslot?.end) > formatDateTime(new Date()))
        //TODO: delete the comment
        // if (!selectedJob.timeslot?.end || moment(selectedJob.timeslot.end).isAfter(moment())) {
        //     //     //TODO: add modal to let user know
        //     console.error('The job cannot be completed, since its appointment is in the future.');
        //     triggerAlert("Job Cannot Be Completed", "The job cannot be completed, since the appointment ends in the future. Please try again after the end time.", "error", 100000, "dialog", "center")
        //     return;
        // }

        try {

            // update the job
            const updateJobData = {
                status: JobStatus.completed,
            };
            console.log("selected request id:", selectedJob?._id, updateJobData)
            const updateJob = await axios.put(`/api/jobs/${selectedJob?._id}`, updateJobData, {
                headers: {Authorization: `Bearer ${token}`}
            });
            console.log('Job Updated:', updateJob.data);
            console.log("jobs: " + jobs[0]);
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
            setShowMediaCard(false);
        } catch (error) {
            console.error('Error completing job:', error);
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

        console.log("notification data at frontend:", notificationData);

// generate new notification
        try {
            const notification = await axios.post("api/notifications/", notificationData, {
                headers: {Authorization: `Bearer ${token}`}
            });
            console.log("Notification sent!", notification);


        } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
        }


    }
;

// handle revoking completed job
export const handleRevoke = async ({
                                       selectedJob,
                                       jobs,
                                       setJobs,
                                       token,
                                       setShowMediaCard
                                   }: JobHandlerParams) => {


    try {

        // update the job
        const updateOfferedServiceData = {
            status: JobStatus.open,
        };
        console.log("selected job id:", selectedJob?._id, updateOfferedServiceData)
        const updateJob = await axios.put(`/api/jobs/${selectedJob?._id}`, updateOfferedServiceData, {
            headers: {Authorization: `Bearer ${token}`}
        });
        console.log('Job Updated:', updateJob.data);
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
        setShowMediaCard(false);
    } catch (error) {
        console.error('Error completing job:', error);
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

    console.log("notification data at frontend:", notificationData);

    // generate new notification
    try {
        const notification = await axios.post("api/notifications/", notificationData, {
            headers: {Authorization: `Bearer ${token}`}
        });
        console.log("Notification sent!", notification);


    } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
    }


};

export const handleCancel = async ({
                                       selectedJob,
                                       jobs,
                                       setJobs,
                                       token,
                                       account,
                                       setShowMediaCard
                                   }: JobHandlerParams) => {


    try {

        // update the request
        const updateOfferedServiceData = {
            status: JobStatus.cancelled,
        };
        console.log("selected job id:", selectedJob?._id, updateOfferedServiceData)
        const updateResponse = await axios.put(`/api/jobs/${selectedJob?._id}`, updateOfferedServiceData, {
            headers: {Authorization: `Bearer ${token}`}
        });
        console.log('Job Updated:', updateResponse.data);


        // Update local state to reflect these changes
        if (jobs && setJobs) {
            const updatedOfferedServices = jobs.map(job => {
                if (job._id === selectedJob._id) {
                    return {...job, ...updateOfferedServiceData};
                }
                return job;
            });

            console.log(updatedOfferedServices);
            setJobs(updatedOfferedServices);
        }
        setShowMediaCard(false);
    } catch (error) {
        console.error('Error cancelling Request:', error);
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

    console.log("notification data at frontend to consumer:", notificationDataToConsumer);

    const notificationDataToProvider = {
        isViewed: false,
        content: `The scheduled service for ${selectedJob.serviceType} from ${selectedJob.receiver.firstName} ${selectedJob.receiver.lastName} on the ${formatDateTime(selectedJob.timeslot?.start)} has been cancelled`,
        job: selectedJob._id,
        recipient: selectedJob.provider._id,
        notificationType: "Job Status Changed",
        ...rest,
    };

    console.log("notification data at frontend to provider:", notificationDataToProvider);

    // generate new notification
    try {
        const notificationToConsumer = await axios.post("api/notifications/", notificationDataToConsumer, {
            headers: {Authorization: `Bearer ${token}`}
        });
        console.log("Notification sent to consumer!", notificationToConsumer);

        const notificationToProvider = await axios.post("api/notifications/", notificationDataToProvider, {
            headers: {Authorization: `Bearer ${token}`}
        });
        console.log("Notification sent to provider!", notificationToProvider);


    } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
    }

    // let email = "";
    // let addressee = "";
    //
    // if (account?._id === selectedJob.provider._id) {
    //
    //     email = selectedJob.receiver.email;
    //     addressee = selectedJob.receiver.firstName + " " + selectedJob.receiver.lastName;
    //
    // } else if (account?._id === selectedJob.receiver._id) {
    //     email = selectedJob.provider.email;
    //     addressee = selectedJob.provider.firstName + " " + selectedJob.provider.lastName;
    // }

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

    // send Email notification
    // try {
    //     await axios.post('/api/email/cancelNotification', {
    //         email: email, serviceType: selectedJob.serviceType,
    //         startTime: selectedJob.timeslot?.start, name: addressee
    //     }).then(
    //         (res) => {
    //             console.log(res);
    //         }
    //     ).catch((err) => {
    //             console.error(err);
    //         }
    //     );
    //
    // } catch (error) {
    //     console.error("There was an error sending the email", error);
    // }

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

