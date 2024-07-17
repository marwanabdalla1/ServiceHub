import axios from 'axios';

export class BookingError extends Error {
    code: number;

    constructor(message: string, code: number) {
        super(message);
        this.name = "BookingError";
        this.code = code;
    }
}

/**
 * book a timeslot from a provider
 * @param timeSlot: the selected time to be booked
 * @param token
 */
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


/**
 * // change the timeslots upon provider's request (request status: action needed from requester)
 * @param timeSlot: new timeslot to book
 * @param token
 */
export const changeTimeSlot = async (timeSlot: any, token: string|null) => {
    try {
        // change the timeslot
        const response = await axios.post('/api/requests/change-timeslots', {...timeSlot, isUpdate: true}, {
            headers: {'Authorization': `Bearer ${token}`}
        });
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
