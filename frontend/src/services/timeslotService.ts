import axios from 'axios';

export class BookingError extends Error {
    code: number;

    constructor(message: string, code: number) {
        super(message);
        this.name = "BookingError";
        this.code = code;
    }
}

export const bookTimeSlot = (timeSlot: any, token: string|null) => {
    return new Promise((resolve, reject) => {
        axios.post('/api/timeslots/book', timeSlot, {
            headers: {'Authorization': `Bearer ${token}`}
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                if (error.response) {
                    if (error.response.status === 409) {
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

export const changeTimeSlot = (timeSlot: any, token: string|null) => {
    return new Promise((resolve, reject) => {
        console.log("changing timeslot to this:", timeSlot)
        axios.post('/api/requests/change-timeslots', timeSlot, {
            headers: {'Authorization': `Bearer ${token}`}
        })
            .then(response => {
                resolve(response.data);

            })
            .catch(error => {
                if (error.response) {
                    if (error.response.status === 409) {
                        reject(new BookingError("Timeslot is no longer available", 409));
                    } else {
                        console.log(error)
                        reject(new BookingError("An error occurred while booking the timeslot", error.response));
                    }
                } else {
                    reject(new Error("Network or other error"));
                }
            });
    });
};