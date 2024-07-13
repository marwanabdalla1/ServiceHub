import axios from 'axios';
import {ServiceOffering} from '../models/ServiceOffering';
import React from "react";
import {Review} from '../Pages/ProviderProfilePage';
import {Feedback} from "../models/Feedback";
import {toast} from "react-toastify";

export const defaultProfileImage = '/images/default-profile.png'; // Use relative path for public folder

export const fetchProfileImageByToken = async (token: string): Promise<string> => {
    try {
        const response = await axios.get(`/api/file/profileImage`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            responseType: 'blob'
        });
        if (response.status === 200) {
            return URL.createObjectURL(response.data);
        }
    } catch (error) {
        if ((error as any).response && (error as any).response.status === 404) {
            console.log('No profile image found for current user');
        } else {
            console.error('Error fetching profile image:', error);
        }
    }
    return defaultProfileImage; // Return default image on error or not found
};

export const fetchProfileImageById = async (providerId: string): Promise<string> => {
    try {
        const response = await axios.get(`/api/file/profileImage/${providerId}`);
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

export const fetchProfileImagesForServiceOffering = async (offerings: ServiceOffering[], setProfileImages: React.Dispatch<React.SetStateAction<{
    [key: string]: string
}>>, setLoadingImages: React.Dispatch<React.SetStateAction<{
    [key: string]: boolean
}>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
    const newProfileImages: { [key: string]: string } = {};
    const newLoadingImages: { [key: string]: boolean } = {};
    offerings.forEach(offering => {
        newLoadingImages[offering._id] = true;
    });
    setLoadingImages(newLoadingImages);

    await Promise.all(offerings.map(async (offering) => {
        const imageUrl = await fetchProfileImageById(offering.provider._id);
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

export const fetchReviewerProfileImages = async (reviews: Review[]) => {
    const newProfileImages: { [key: string]: string } = {};

    await Promise.all(reviews.map(async (review) => {
        console.log("current review: ", review);
        try {
            const profileImageResponse = await axios.get(`/api/file/profileImage/${review.reviewer._id}`, {
                responseType: 'blob'
            });
            if (profileImageResponse.status === 200) {
                newProfileImages[review.reviewer._id] = URL.createObjectURL(profileImageResponse.data);
            }
        } catch (error) {
            console.error('Error fetching profile image:', error);
        }
    }));

    return newProfileImages;
};

export const fetchFeedbackProfileImages = async (feedbacks: Feedback[]) => {
    const newProfileImages: { [key: string]: string } = {};

    await Promise.all(feedbacks.map(async (feedback) => {
        console.log("current feedback: ", feedback);
        try {
            const profileImageResponse = await axios.get(`/api/file/profileImage/${feedback.givenBy._id}`, {
                responseType: 'blob'
            });
            if (profileImageResponse.status === 200) {
                newProfileImages[feedback.givenBy._id] = URL.createObjectURL(profileImageResponse.data);
            }
        } catch (error) {
            console.error('Error fetching profile image:', error);
        }
    }));
    return newProfileImages;
};

export const deleteProfileImage = async (token: string | null, setProfileImage: React.Dispatch<React.SetStateAction<string | null>>): Promise<void> => {
    if (!token) {
        console.error('No Auth token provided to delete profile image!');
        return;

    }
    await axios.delete(`/api/file/profileImage/`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    setProfileImage(defaultProfileImage);
}

export const handleProfileImageUpload = (setImage: React.Dispatch<React.SetStateAction<string | null>>, token: string | null) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files ? event.target.files[0] : null;
    if (!image) {
        console.error('No image selected');
        return;
    }
    if (!token) {
        toast.error("You need to login to upload profile image");
        return;
    }
    setImage(URL.createObjectURL(image));
    handleProfileImageUploadByToken(image, token).then(() => {
        toast.success("Image uploaded successfully");
    });
    console.log("set file finished: ", image);
};

export const handleProfileImageUploadByToken = async (image: File | null, token: string) => {
    if (!image) {
        console.error('No image selected');
        return;
    }
    const formData = new FormData();
    formData.append('file', image);

    try {
        await axios.post(`/api/file/upload/profileImage`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Error uploading image:', error);
    }
};
