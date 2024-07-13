import axios from "axios";

export const deleteService = async (serviceToDelete: string, token: string, services: any[], setServices: (value: (((prevState: any[]) => any[]) | any[])) => void) => {

    // delete the service first
    const serviceResponse = await axios.delete(`/api/services/delete-service/${serviceToDelete}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (serviceResponse.status === 200 || serviceResponse.status === 204) {
        // update the services state immediately after successful service deletion
        setServices(services.filter(service => service._id !== serviceToDelete));

        // attempt to delete the corresponding certificate without waiting for the result
        axios.delete(`/api/certificate/${serviceToDelete}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(error => {
            console.error('Error deleting certificate:', error);
        });
    } else {
        console.error('Error deleting service:', serviceResponse.status);
    }

};