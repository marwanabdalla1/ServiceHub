import { Account } from './Account';

export const users: Account[] = [
    {
        id: '1',
        firstName: "John",
        lastName: "Doe",
        profileImageUrl: "/images/profiles/profile1.png",
        rating: 4.5,
        location: "Berlin, Germany",
        serviceOfferings: [
            {
                serviceType: "Bike Repair",
                hourlyRate: 20.0,
                rating: 4.5,
                isCertified: true,
            }
        ]
    },
    {
        id: '2',
        firstName: "Jane",
        lastName: "Smith",
        profileImageUrl: "/images/profiles/profile2.png",
        rating: 4.8,
        location: "Hamburg, Germany",
        serviceOfferings: [
            {
                serviceType: "House Cleaning",
                hourlyRate: 25.0,
                rating: 4.8,
                isCertified: true,
            }
        ]
    },
    {
        id: '3',
        firstName: "Robert",
        lastName: "Brown",
        profileImageUrl: "/images/profiles/profile3.png",
        rating: 4.3,
        location: "Munich, Germany",
        serviceOfferings: [
            {
                serviceType: "Baby Sitting",
                hourlyRate: 15.0,
                rating: 4.3,
                isCertified: false,
            }
        ]
    },
    {
        id: '4',
        firstName: "Emily",
        lastName: "Davis",
        profileImageUrl: "/images/profiles/profile4.png",
        rating: 4.9,
        location: "Frankfurt, Germany",
        serviceOfferings: [
            {
                serviceType: "Tutoring",
                hourlyRate: 30.0,
                rating: 4.9,
                isCertified: true,
            }
        ]
    },
    {
        id: '5',
        firstName: "Michael",
        lastName: "Wilson",
        profileImageUrl: "/images/profiles/profile5.png",
        rating: 4.6,
        location: "Dresden, Germany",
        serviceOfferings: [
            {
                serviceType: "Pet Sitting",
                hourlyRate: 18.0,
                rating: 4.6,
                isCertified: false,
            }
        ]
    },
    {
        id: '6',
        firstName: "Sarah",
        lastName: "Johnson",
        profileImageUrl: "/images/profiles/profile6.png",
        rating: 4.7,
        location: "Cologne, Germany",
        serviceOfferings: [
            {
                serviceType: "Landscaping Service",
                hourlyRate: 22.0,
                rating: 4.7,
                isCertified: true,
            }
        ]
    },
    {
        id: '7',
        firstName: "David",
        lastName: "Williams",
        profileImageUrl: "/images/profiles/profile7.png",
        rating: 4.4,
        location: "Stuttgart, Germany",
        serviceOfferings: [
            {
                serviceType: "Home Remodeling",
                hourlyRate: 35.0,
                rating: 4.4,
                isCertified: true,
            }
        ]
    },
    {
        id: '8',
        firstName: "Ashley",
        lastName: "Jones",
        profileImageUrl: "/images/profiles/profile8.png",
        rating: 4.8,
        location: "Hanover, Germany",
        serviceOfferings: [
            {
                serviceType: "Moving Service",
                hourlyRate: 28.0,
                rating: 4.8,
                isCertified: true,
            }
        ]
    },
    {
        id: '9',
        firstName: "Bob",
        lastName: "Biker",
        profileImageUrl: "/images/profiles/profile8.png",
        rating: 4.7,
        location: "Mainz, Germany",
        serviceOfferings: [
            {
                serviceType: "Bike Repair",
                hourlyRate: 25.0,
                rating: 4.7,
                isCertified: true,
            }
        ]
    },
];
