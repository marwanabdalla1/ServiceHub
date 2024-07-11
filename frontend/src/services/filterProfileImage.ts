import axios from 'axios';
import { ServiceOffering } from '../models/ServiceOffering';

const defaultProfileImage = '/images/default-profile.png'; // Use relative path for public folder

export const fetchProfileImage = async (providerId: string): Promise<string> => {
    try {
        const response = await axios.get(`/api/file/profileImage/${providerId}`, {
            responseType: 'blob'
        });
        if (response.status === 200) {
            return URL.createObjectURL(response.data);
        }
    } catch (error) {
        if ((error as any).response && (error as any).response.status === 404) {
            console.log('No profile image found for provider:', providerId);
        } else {
            console.error('Error fetching profile image:', error);
        }
    }
    return defaultProfileImage; // Return default image on error or not found
};

export const fetchProfileImages = async (offerings: ServiceOffering[], setProfileImages: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>, setLoadingImages: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
    const newProfileImages: { [key: string]: string } = {};
    const newLoadingImages: { [key: string]: boolean } = {};
    offerings.forEach(offering => {
        newLoadingImages[offering._id] = true;
    });
    setLoadingImages(newLoadingImages);

    await Promise.all(offerings.map(async (offering) => {
        const imageUrl = await fetchProfileImage(offering.provider._id);
        newProfileImages[offering._id] = imageUrl;
        setProfileImages(prevImages => ({
            ...prevImages,
            [offering._id]: imageUrl,
        }));
        setLoadingImages(prevLoading => ({
            ...prevLoading,
            [offering._id]: false,
        }));
    }));

    setLoading(false);
};
