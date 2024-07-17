import axios from 'axios';

export class BookingError extends Error {
    code: number;

    constructor(message: string, code: number) {
        super(message);
        this.name = "BookingError";
        this.code = code;
    }
}

// export const bookTimeSlot = (timeSlot: any, token: string|null) => {
//     return new Promise((resolve, reject) => {
//         axios.post('/api/timeslots/book', timeSlot, {
//             headers: {'Authorization': `Bearer ${token}`}
//         })
//             .then(response => {
//                 resolve(response.data);
//             })
//             .catch(error => {
//                 if (error.response) {
//                     if (error.response.status === 409) {
//                         reject(new BookingError("Timeslot is no longer available", 409));
//                     } else {
//                         reject(new BookingError("An error occurred while booking the timeslot", error.response.status));
//                     }
//                 } else {
//                     reject(new Error("Network or other error"));
//                 }
//             });
//     });
// };

export const bookTimeSlot = (timeSlot: any, token: string|null): Promise<any> => {
    return new Promise((resolve, reject) => {
        console.log("bookTimeSlot:", timeSlot)
        axios.post('/api/timeslots/book', timeSlot, {
            headers: {'Authorization': `Bearer ${token}`}
        })
            .then(response => {
                console.log("timeslot booked successfully", response.data);
                resolve(response.data);  // Resolve the promise with the response data
            })
            .catch(error => {
                console.error("Error booking timeslot:", error);
                if (error.response) {
                    // Check specific status codes or error messages
                    if (error.response.status === 409) { // Assuming 409 means conflict, e.g., timeslot not available
                        reject(new BookingError("Timeslot is no longer available", 409));
                    } else {
                        reject(new BookingError("An error occurred while booking the timeslot", error.response.status));
                    }
                } else {
                    reject(new Error("Network or other error"));
                }
            });
    });
};

// export const changeTimeSlot = (timeSlot: any, token: string|null) => {
//
//     return new Promise((resolve, reject) => {
//         console.log("changing timeslot to this:", timeSlot)
//
//         // this includes changing timeslot AND sending notification
//         axios.post('/api/requests/change-timeslots', {...timeSlot, isUpdate:true}, {
//             headers: {'Authorization': `Bearer ${token}`}
//         })
//             .then(response => {
//                 resolve(response.data);
//
//             })
//             .catch(error => {
//                 if (error.response) {
//                     if (error.response.status === 409) {
//                         reject(new BookingError("Timeslot is no longer available", 409));
//                     } else {
//                         console.log(error)
//                         reject(new BookingError("An error occurred while booking the timeslot", error.response));
//                     }
//                 } else {
//                     reject(new Error("Network or other error"));
//                 }
//             });
//     });
// };


export const changeTimeSlot = async (timeSlot: any, token: string|null) => {
    // const requestId = timeSlot.requestId;
    try {
        // Proceed to change the timeslot
        const response = await axios.post('/api/requests/change-timeslots', {...timeSlot, isUpdate: true}, {
            headers: {'Authorization': `Bearer ${token}`}
        });

        console.log("change timeslot data", response)
        // Return the successful response data
        return response.data;
    } catch (error: any) {
        console.error("Error in changing timeslot:", error);
        if (error.response && error.response.status === 409) {
            throw new BookingError("Timeslot is no longer available", 409);
        } else if (error.response) {
            throw new BookingError("An error occurred while updating the timeslot", error.response);
        } else {
            throw new Error("Network or other error");
        }
    }
};
