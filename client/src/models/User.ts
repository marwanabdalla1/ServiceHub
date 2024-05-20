

// Define the type for the service object
export type Service = {
    serviceType: string;
    rating: number;
    hourlyRating: number;
    isLicensed: boolean;
  };
  
  // Define the type for the user object
 export type User = {
    userId: number;
    firstName: string;
    lastName: string;
    service: Service;
  };
export const users = [
    {
        "userId": 1,
        "firstName": "John",
        "lastName": "Doe",
        "service": {
            "serviceType": "bikeRepair",
            "rating": 4.5,
            "hourlyRating": 20.0,
            "isLicensed": true
        }
    },
    {
        "userId": 2,
        "firstName": "Jane",
        "lastName": "Smith",
        "service": {
            "serviceType": "houseCleaning",
            "rating": 4.8,
            "hourlyRating": 25.0,
            "isLicensed": true
        }
    },
    {
        "userId": 3,
        "firstName": "Robert",
        "lastName": "Brown",
        "service": {
            "serviceType": "babySitting",
            "rating": 4.3,
            "hourlyRating": 15.0,
            "isLicensed": false
        }
    },
    {
        "userId": 4,
        "firstName": "Emily",
        "lastName": "Davis",
        "service": {
            "serviceType": "tutoring",
            "rating": 4.9,
            "hourlyRating": 30.0,
            "isLicensed": true
        }
    },
    {
        "userId": 5,
        "firstName": "Michael",
        "lastName": "Wilson",
        "service": {
            "serviceType": "petSitting",
            "rating": 4.6,
            "hourlyRating": 18.0,
            "isLicensed": false
        }
    },
    {
        "userId": 6,
        "firstName": "Sarah",
        "lastName": "Johnson",
        "service": {
            "serviceType": "landScaping",
            "rating": 4.7,
            "hourlyRating": 22.0,
            "isLicensed": true
        }
    },
    {
        "userId": 7,
        "firstName": "David",
        "lastName": "Williams",
        "service": {
            "serviceType": "homeRemodeling",
            "rating": 4.4,
            "hourlyRating": 35.0,
            "isLicensed": true
        }
    },
    {
        "userId": 8,
        "firstName": "Ashley",
        "lastName": "Jones",
        "service": {
            "serviceType": "movingServices",
            "rating": 4.8,
            "hourlyRating": 28.0,
            "isLicensed": true
        }
    },
    {
        "userId": 9,
        "firstName": "Chris",
        "lastName": "Miller",
        "service": {
            "serviceType": "bikeRepair",
            "rating": 4.7,
            "hourlyRating": 20.0,
            "isLicensed": false
        }
    },
    {
        "userId": 10,
        "firstName": "Amanda",
        "lastName": "Garcia",
        "service": {
            "serviceType": "houseCleaning",
            "rating": 4.9,
            "hourlyRating": 25.0,
            "isLicensed": true
        }
    }
]

