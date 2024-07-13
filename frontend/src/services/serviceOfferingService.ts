import axios from "axios";

export const deleteService = async (serviceToDelete: string, token: string) => {

    // delete the corresponding certificate
    await axios.delete(`/api/certificate/${serviceToDelete}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    // delete the service
    await axios.delete(`/api/services/delete-service/${serviceToDelete}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

};