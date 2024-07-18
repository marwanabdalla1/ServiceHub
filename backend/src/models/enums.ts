export enum DaysOfWeek {
    Sunday,    // 0
    Monday,    // 1
    Tuesday,   // 2
    Wednesday, // 3
    Thursday,  // 4
    Friday,    // 5
    Saturday   // 6
}

export enum starCount {
    zeroStars,    // 0
    oneStars,    // 1
    twoStars,   // 2
    threeStars, // 3
    fourStars,  // 4
    fiveStars,    // 5

}

export enum JobStatus {
    completed = "completed", // 0
    cancelled = "cancelled", // 1
    open = "open" // 2
}

export enum ResponseStatus {
    accept = "accepted",
    decline = "declined",
    proposeNewTime = "new time proposed"
}

export enum RequestStatus {
    accepted = "accepted",
    pending = "pending",
    cancelled = "cancelled",
    declined = "declined",
    requesterActionNeeded = "action needed from requester"

}

export enum ServiceType {
    bikeRepair = "Bike Repair", // 0
    houseCleaning = "House Cleaning", // 1
    babysitting = "Babysitting", // 2
    tutoring = "Tutoring", // 3
    petsitting = "Petsitting", // 4
    landscapingServices = "Landscaping Services", // 5
    homeRemodeling = "Home Remodeling", // 6
    movingServices = "Moving Services", // 7
}

export enum NotificationType {
    // new request/new job/ (job/request) status changed/ new review/ change time request from provider etc.
    newRequest = "New Request",
    newJob = "New Job",
    JobStatusChanged = "Job Status Changed",
    RequestStatusChanged = "Request Status Changed",
    newReview = "New Review",
    timeRequestChanged = "Request Time Has Changed",
    timeslotChangeRequest = "Timeslot Change Request",
    updatedReview = "Updated Review",
}
