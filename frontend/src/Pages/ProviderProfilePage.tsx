import React from 'react';
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
import {ServiceProvider, DaysOfWeek} from '../models/ServiceProviderPreliminary';
import {styled} from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import PinDropIcon from '@mui/icons-material/PinDrop';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Breadcrumb from "../components/Breadcrumb";

const mockProvider: ServiceProvider = {
    id: '1',
    firstName: 'Bob',
    lastName: 'Biker',
    service: {
        serviceType: 'Bike Repair',
        hourlyRate: 15,
        isCertified: true
    },
    location: 'Munich',
    availability: [
        {
            dayOfWeek: DaysOfWeek.Monday,
            isFixed: true,
            timeslots: [
                {start: new Date('2024-05-11T15:00:00'), end: new Date('2024-05-11T20:00:00')}
            ]
        },
        {
            dayOfWeek: DaysOfWeek.Thursday,
            isFixed: true,
            timeslots: [
                {start: new Date('2024-05-12T10:00:00'), end: new Date('2024-05-12T20:00:00')}
            ]
        }
    ],
    reviews: [
        {
            id: '1',
            rating: 5,
            content: 'Very friendly, great service. I can definitely recommend!',
            createdOn: '2024-05-03',
            reviewer: 'Sebastian Müller'
        },
        {
            id: '2',
            rating: 5,
            content: 'Bob is very competent and quick in his work. I will definitely be using him for all my bike repairs from now on.',
            createdOn: '2024-05-03',
            reviewer: 'Smith Jackson'
        },
        {
            id: '3',
            rating: 5,
            content: 'Great Service!',
            createdOn: '2024-04-03',
            reviewer: 'Anna Schmidt'
        },
        {
            id: '4',
            rating: 4,
            content: 'Good',
            createdOn: '2024-04-02',
            reviewer: 'John Doe'
        },
        {
            id: '5',
            rating: 4,
            content: 'Good',
            createdOn: '2024-03-02',
            reviewer: 'John Doe'
        },

    ],
    rating: 4.6,
    reviewCount: 5,
    description: 'Having tinkered with bikes since I was 16, I\'ve got the skills to fix yours up good as new.'

};

const daysOfWeekToString = (day: DaysOfWeek): string => {
    return DaysOfWeek[day];
};

const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
};

function ProviderProfilePage() {
    const provider = mockProvider;

    return (
        <Container>

            <Box sx={{mt: 4}}>
                <Breadcrumb paths={[
                    {label: 'Home', href: '/'},
                    {label: 'Munich', href: '/munich'},
                    {label: 'Bike Repair', href: '/munich/bike-repair'},
                    {label: 'Bob Biker'}
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
                            <Box>
                                <Button variant="contained" sx={{mr: 5}}>Contact Information</Button>
                                <Button variant="outlined">Book now</Button>
                            </Box>
                        </Box>

                        <Box sx={{display: 'flex', alignItems: 'center', mt: 2, justifyContent: 'space-between'}}>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <Typography variant="h5" sx={{mr: 1}}>{provider.rating}</Typography>
                                <GoStarFill className='text-yellow-500'/>
                                <Typography variant="body2" sx={{ml: 1}}>
                                    ({provider.reviewCount} reviews)
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {provider.service.serviceType}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                {provider.location}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Next Availability: Sat, 11 May
                            </Typography>
                        </Box>

                        <Divider/>

                        <Box sx={{display: 'flex', alignItems: 'center', mt: 2, justifyContent: 'space-between'}}>
                            <PinDropIcon></PinDropIcon>
                            <Box sx={{display: 'flex', flexDirection: 'column', flex: '1 1 40%', alignItems: 'center', mt: 2}}>
                            <Typography variant="body2" color="text.secondary">
                                {provider.description}
                            </Typography>
                            </Box>

                            <AccessTimeIcon/>
                            <Box sx={{display: 'flex', flexDirection: 'column', flex: '1 1 30%', alignItems: 'center', mt: 2}}>
                                {provider.availability.map((availability, index) => (
                                    <Typography variant="body2" key={index} color="text.secondary">
                                        {daysOfWeekToString(availability.dayOfWeek)}: {availability.timeslots.map(slot => `${formatTime(slot.start)} - ${formatTime(slot.end)}`).join('\n')}
                                    </Typography>))}
                            </Box>

                            <AccountBalanceWalletIcon sx={{mb: 1}}/>
                            <Box sx={{flex: '1 1 30%', alignItems: 'center', mt:2}}>
                                <Typography variant="body2">
                                    Service Fee: €{provider.service.hourlyRate}/hour
                                </Typography>
                                <Typography variant="body2">
                                    Payment methods: Cash, PayPal
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
                                    {provider.rating} <Rating precision={0.25} defaultValue={provider.rating} readOnly={true}/>

                                </Typography>
                                <Typography variant="body2">
                                    {provider.reviewCount} global ratings
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
                            <Typography variant="h6" gutterBottom>
                                Review this Service</Typography>
                            <Typography variant="body2" gutterBottom>
                                Share your thought with other customers
                            </Typography>
                            <Button variant="outlined">Write a customer review</Button>
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
                            {provider.reviews.map((review) => (
                                <Card key={review.id} sx={{mb: 2}}>
                                    <CardContent>
                                        <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                            <Avatar sx={{mr: 2}}/>
                                            <Typography variant="h6">{review.reviewer}</Typography>
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
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}

export default ProviderProfilePage;
