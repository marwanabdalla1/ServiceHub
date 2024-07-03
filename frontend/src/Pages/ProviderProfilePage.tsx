// this is more like offering profile page instead of provider profile page

import React, {useEffect, useState} from 'react';
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Avatar,
    Grid,
    Divider,
    TextField,
    IconButton,
    Rating
} from '@mui/material';
import {GoStarFill} from "react-icons/go";
import {Account as ServiceProvider, bikeRepairService } from '../models/Account';
import { DaysOfWeek, ServiceType, JobStatus, ResponseStatus, RequestStatus } from '../models/enums';
import {styled} from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import PinDropIcon from '@mui/icons-material/PinDrop';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Breadcrumb from "../components/Breadcrumb";
import LightBlueButton from "../components/inputs/BlueButton";
import { ServiceOffering } from '../models/ServiceOffering';
import account from '../models/Account';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {useBooking} from "../contexts/BookingContext";


// const mockProvider: ServiceProvider = {
//     _id: '1',
//     firstName: 'Bob',
//     lastName: 'Biker',
//     serviceOfferings: [new ServiceOffering('offering0',
//         ServiceType.bikeRepair, new Date(), new Date(), new File([], "empty.txt", { type: "text/plain" }), 15, 'desc0', true,
//     'Munich', account, 1, 0.5, [], 3, 4.5)],
//     location: 'Munich',
//     availability: [
//         {
//             dayOfWeek: DaysOfWeek.Thursday,
//             timeslots: [
//                 {title: ServiceType.bikeRepair, start: new Date('2024-05-11T15:00:00'), end: new Date('2024-05-11T20:00:00'), isFixed: false}
//             ]
//         },
//         {
//             dayOfWeek: DaysOfWeek.Friday,
//             timeslots: [
//                 {title: ServiceType.babySitting, start: new Date('2024-05-11T15:00:00'), end: new Date('2024-05-11T20:00:00'), isFixed: true}
//             ]
//         },
//         {
//             dayOfWeek: DaysOfWeek.Saturday,
//             timeslots: [
//                 {title: ServiceType.petSitting, start: new Date('2024-05-11T15:00:00'), end: new Date('2024-05-11T20:00:00'), isFixed: true}
//             ]
//         },
//         {
//             dayOfWeek: DaysOfWeek.Sunday,
//             timeslots: [
//                 {title: ServiceType.homeRemodeling, start: new Date('2024-05-11T15:00:00'), end: new Date('2024-05-11T20:00:00'), isFixed: false}
//             ]
//         }
//     ],
//
//     reviews: [
//         {
//             reviewId: '1',
//             rating: 5,
//             content: 'Very friendly, great service. I can definitely recommend!',
//             createdOn: new Date('2024-05-03'),
//             reviewer: account,
//             recipient: account,
//             service: bikeRepairService
//         },
//         {
//             reviewId: '2',
//             rating: 5,
//             content: 'Bob is very competent and quick in his work. I will definitely be using him for all my bike repairs from now on.',
//             createdOn: new Date('2024-05-03'),
//             reviewer: account,
//             recipient: account,
//             service: bikeRepairService
//         },
//         {
//             reviewId: '3',
//             rating: 5,
//             content: 'Great Service!',
//             createdOn: new Date('2024-05-03'),
//             reviewer: account,
//             recipient: account,
//             service: bikeRepairService
//         },
//         {
//             reviewId: '4',
//             rating: 4,
//             content: 'Good',
//             createdOn: new Date('2024-05-03'),
//             reviewer: account,
//             recipient: account,
//             service: bikeRepairService
//         },
//         {
//             reviewId: '5',
//             rating: 4,
//             content: 'Good',
//             createdOn: new Date('2024-05-03'),
//             reviewer: account,
//             recipient: account,
//             service: bikeRepairService
//         },
//
//     ],
//     rating: 4.6,
//     reviewCount: 5,
//     description: 'Having tinkered with bikes since I was 16, I\'ve got the skills to fix yours up good as new.',
//     email: 'bob.biker@biking.com',
//     address: 'Biking Avenue',
//     createdOn: new Date(),
//     phoneNumber: '07775000',
//     isProvider: true,
//     profileImageUrl: '/images/profiles/profile2.png',
//     isPremium: false,
//     notifications: [],
//     requestHistory: [],
//     jobHistory: []
//
// };

const daysOfWeekToString = (day: DaysOfWeek): string => {
    return DaysOfWeek[day];
};

const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
};

function ProviderProfilePage() {
    const { fetchAccountDetails, fetchOfferingDetails } = useBooking();
    const [provider, setProvider] = useState<ServiceProvider | null>(null);
    const [offering, setOffering] = useState<ServiceOffering | null>(null);


    // const provider = mockProvider;
    const {offeringId} = useParams<{offeringId:string}>(); //use this to then make a request to the user with the id to get the user data

    console.log("offeringId", offeringId);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (offeringId) {
                try {
                    const fetchedOffering = await fetchOfferingDetails(offeringId);
                    setOffering(fetchedOffering);
                } catch (error) {
                    console.error("Failed to fetch offering details:", error);
                }
                try {
                    const fetchedProvider = await fetchAccountDetails(offeringId); // Confirm this should use offeringId
                    setProvider(fetchedProvider);
                } catch (error) {
                    console.error("Failed to fetch account details:", error);
                }
            }
        };


        fetchData();
    }, [offeringId]);

    // go to the booking page
    const handleBookNow = () => {
        navigate(`/offerings/${offeringId}/booking/step0`);
    };

    if (!provider || !offering) {
        return <div>Loading...</div>; // You can replace this with a more sophisticated loading indicator if desired
    }

    // handle "book now" button
    return (
        <Container>

            <Box sx={{mt: 4}}>
                <Breadcrumb paths={[
                    // todo: change this!
                    {label: 'Home', href: '/'},
                    {label: 'Munich', href: '/munich'},
                    {label: 'Bike Repair', href: '/munich/bike-repair'},
                    {label: `${provider.firstName} ${provider.lastName}`}
                ]}/>
                <Grid container spacing={4} sx={{mt: 2}}>
                    <Grid item xs={3}>
                        <Avatar variant="square" sx={{width: '100%', height: 200, bgcolor: 'lightblue'}}/>
                    </Grid>
                    <Grid item xs={9}>
                        <Box sx={{display: "flex", alignItems: 'center', justifyContent: 'space-between'}}>
                            <Typography variant="h4" gutterBottom>
                                {provider.firstName} {provider.lastName}
                            </Typography>
                            <Box sx={{ justifyContent: 'space-between'}}>
                                <LightBlueButton className = 'px-3 py-2 rounded bg-white mr-3' text='Contact Information' onClick={() => console.log('booking button pressed')}></LightBlueButton>
                                {/*<Link to={`/select-timeslot/${id}`}>*/}
                                <LightBlueButton className = 'px-3 py-2 rounded' text='Book Now' onClick={handleBookNow}></LightBlueButton>
                                {/*</Link>*/}
                            </Box>
                        </Box>

                        <Box sx={{display: 'flex', alignItems: 'center', mt: 2, justifyContent: 'space-between'}}>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <Typography variant="h5" sx={{mr: 1}}>{offering.rating}</Typography>
                                <GoStarFill className='text-yellow-500'/>
                                <Typography variant="body2" sx={{ml: 1}}>
                                    ({offering.reviewCount} reviews)
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {offering.serviceType}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                {offering.location}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Next Availability: Sat, 11 May
                                {/*//todo: modify availability!*/}
                                {/*{provider.availability}  */}
                            </Typography>
                        </Box>

                        <Divider sx={{mt:2}}/>

                        <Box sx={{display: 'flex', alignItems: 'flex-start', mt: 2, justifyContent: 'space-between'}}>
                            <PinDropIcon sx={{mt:2}}></PinDropIcon>
                            <Box sx={{display: 'flex', flexDirection: 'column', flex: '1 1 40%', alignItems: 'center', mt: 2}}>
                            <Typography variant="body2" color="text.secondary">
                                {offering.description}
                            </Typography>
                            </Box>

                            <AccessTimeIcon sx={{mt:2}}/>
                            <Box sx={{display: 'flex', flexDirection: 'column', flex: '1 1 30%', alignItems: 'left', mt: 2}}>
                                {provider.availability ? provider.availability.map((availability, index) => (
                                    <Typography variant="body2" key={index} color="text.secondary">
                                        {daysOfWeekToString(availability.dayOfWeek)}: {availability.timeslots.map(slot => `${formatTime(slot.start)} - ${formatTime(slot.end)}`).join('\n')}
                                    </Typography>)) : ""}
                            </Box>

                            <AccountBalanceWalletIcon sx={{mb: 1, mt:2}}/>
                            <Box sx={{flex: '1 1 30%', alignItems: 'center', mt:2}}>
                                <Typography variant="body2">
                                    Service Fee: €{offering.hourlyRate}/hour
                                </Typography>
                                <Typography variant="body2">
                                    Payment methods: Cash, PayPal {/*todo: add this to */}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
                <Grid container spacing={4} sx={{mt: 4}}>
                    <Grid item xs={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Customer reviews</Typography>
                                <Typography variant="h4" gutterBottom>
                                    {offering.rating} <Rating precision={0.25} defaultValue={offering.rating} readOnly={true}/>

                                </Typography>
                                <Typography variant="body2">
                                    {offering.reviewCount} global ratings
                                </Typography>
                                <Box sx={{mt: 2}}>
                                    <Typography variant="body2">5 star</Typography>
                                    <Box sx={{backgroundColor: 'black', height: 10, width: '80%'}}></Box>
                                    <Typography variant="body2">80%</Typography>
                                    <Typography variant="body2">4 star</Typography>
                                    <Box sx={{backgroundColor: 'black', height: 10, width: '20%'}}></Box>
                                    <Typography variant="body2">20%</Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        <Box sx={{mt: 5}}>
                            {/*<Typography variant="h6" gutterBottom>*/}
                            {/*    Review this Service</Typography>*/}
                            {/*<Typography variant="body2" gutterBottom>*/}
                            {/*    Share your thought with other customers*/}
                            {/*</Typography>*/}
                            {/*<Button size='small' variant="outlined">Write a customer review</Button>*/}
                        </Box>
                    </Grid>
                    <Grid item xs={9}>

                        <Box sx={{mt: 4}}>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                <TextField
                                    fullWidth
                                    placeholder="Search in reviews"
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton>
                                                <SearchIcon/>
                                            </IconButton>
                                        )
                                    }}
                                />
                            </Box>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                                <Typography variant="body2">Sort by: Top Reviews</Typography>
                            </Box>
                            <Divider sx={{mb: 2}}/>

                            {/*todo: update the reviews part once the review controllers etc. are done!*/}

                            {provider.reviews ? provider.reviews.map((review) => (
                                <Card key={review._id} sx={{mb: 2}}>
                                    <CardContent>
                                        <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                            <Avatar sx={{mr: 2}}/>
                                            <Typography variant="h6">{review.reviewer.firstName + " " + review.reviewer.lastName}</Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                            {/*<GoStarFill className='text-yellow-500'/>*/}
                                            <Rating precision={0.5} defaultValue={review.rating} readOnly={true}/>
                                            <Typography variant="body2" sx={{ml: 1}}>
                                                {review.rating} stars
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {review.content}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Reviewed in Munich on {new Date(review.createdOn).toLocaleDateString()}
                                        </Typography>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2}}>
                                            <Button size="small">Helpful</Button>
                                            <Button size="small">Report Abuse</Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            )) : ""}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}

export default ProviderProfilePage;
