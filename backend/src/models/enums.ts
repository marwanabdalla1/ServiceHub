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
    completed, // 0
    cancelled, // 1
    open, // 2
}

export enum ResponseStatus {
    accept, // 0
    decline, // 1
    proposeNewTime // 2
}

export enum RequestStatus {
    accepted, // 0
    pending, // 1
    cancelled, // 2
    declined, // 3
    requestorActionNeeded ,

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
    newRequest = "New Request", // 0
    newJob = "New Job", // 1
    JobStatusChanged = "Job Status Changed", // 2
    RequestStatusChanged = "Request Status Changed", // 3
    newReview = "New Review", // 4
    timeRequestChanged = "Time Request Changed", // 5
}
