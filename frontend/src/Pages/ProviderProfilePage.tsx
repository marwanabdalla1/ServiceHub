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
    Rating, FormControl, InputLabel, MenuItem,
    SelectChangeEvent
} from '@mui/material';
import {GoStarFill} from "react-icons/go";
import {Account as ServiceProvider} from '../models/Account';
import { DaysOfWeek, ServiceType, JobStatus, ResponseStatus, RequestStatus } from '../models/enums';
import {styled} from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import PinDropIcon from '@mui/icons-material/PinDrop';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import Breadcrumb from "../components/Breadcrumb";
import LightBlueButton from "../components/inputs/BlueButton";
import { ServiceOffering } from '../models/ServiceOffering';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {useBooking} from "../contexts/BookingContext";
import axios from "axios";
import Select from "@mui/material/Select";
import {format} from 'date-fns';


// !todo s
// 1. link reviews
//     if someone has no reviews just don't have the part
// 2. display contact info
// 3. display next availability


const daysOfWeekToString = (day: DaysOfWeek): string => {
    return DaysOfWeek[day];
};

// const formatTime = (date: Date): string => {
//     return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
// };

const formatDate = (date: Date) => {
    // const date = new Date(dateString);
    return format(date, 'dd MMM yyyy, HH:mm');
};

interface Review {
    _id: string;
    reviewer: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string|null;
        profileImageId: string|null;
    };
    recipient: string;
    serviceOffering: string;
    job: string;
    rating: number;
    content: string;
    createdAt: string;
}

function ProviderProfilePage() {
    const { fetchAccountDetails, fetchOfferingDetails } = useBooking();
    const [provider, setProvider] = useState<ServiceProvider | null>(null);
    const [offering, setOffering] = useState<ServiceOffering | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortOption, setSortOption] = useState<string>("stars");
    const [filterStars, setFilterStars] = useState<number | null>(null);

    const [nextAvailability, setNextAvailability] = useState<any>(null);


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

                    try {
                        console.log("fetched Offering:", fetchedOffering);
                        const response = await axios.get(`/api/timeslots/next-availability/${fetchedOffering.provider}`, {
                            params: { transitTime: fetchedOffering.bufferTimeDuration,
                                    defaultDuration: fetchedOffering.baseDuration}
                        });
                        console.log("next availability:", response.data);
                        setNextAvailability(response.data.nextAvailability);
                    } catch (error) {
                        console.error("Failed to fetch next availability:", error);
                    }
                } catch (error) {
                    console.error("Failed to fetch offering details:", error);
                }
                try {
                    const fetchedProvider = await fetchAccountDetails(offeringId); // Confirm this should use offeringId
                    console.log("fetched provider:", fetchedProvider)

                    setProvider(fetchedProvider);



                } catch (error) {
                    console.error("Failed to fetch account details:", error);
                }
                try {
                    const reviewResponse = await axios.get(`/api/reviews/${offeringId}`);
                    console.log("reviews: ", reviewResponse.data);
                    setReviews(reviewResponse.data.review);
                } catch (error) {
                    console.error("Failed to fetch reviews:", error);
                }


            }
        };


        fetchData();
    }, [offeringId]);

    // Calculate rating distribution
    const ratingCounts = [0, 0, 0, 0, 0];
    reviews.forEach((review) => {
        if (review.rating >= 1 && review.rating <= 5) {
            ratingCounts[review.rating - 1]++;
        }
    });

    const totalReviews = reviews.length;
    const ratingPercentages = ratingCounts.map((count) => (totalReviews ? (count / totalReviews) * 100 : 0));

    // go to the booking page
    const handleBookNow = () => {
        navigate(`/offerings/${offeringId}/booking/step0`);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSortChange = (event: SelectChangeEvent<string>) => {
        setSortOption(event.target.value);
    };

    const handleFilterStars = (stars: number | null) => {
        setFilterStars(stars);
    };

    const filteredReviews = reviews
        .filter((review) =>
            review.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterStars === null || review.rating === filterStars)
        )
        .sort((a, b) => {
            if (sortOption === "starsAsc") {
                return a.rating - b.rating;
            } else if (sortOption === "starsDesc") {
                return b.rating - a.rating;
            } else if (sortOption === "dateAsc") {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else if (sortOption === "dateDesc") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return 0;
        });

    if (!provider || !offering) {
        return <div>Loading...</div>; // You can replace this with a more sophisticated loading indicator if desired
    }

    // handle "book now" button
    return (
        <Container>

            <Box sx={{mt: 4}}>
                <Breadcrumb paths={[
                    // todo: change breadcrumb!
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
                                {/*<LightBlueButton className = 'px-3 py-2 rounded bg-white mr-3' text='Check Next Availability' onClick={() => console.log('booking button pressed')}></LightBlueButton>*/}
                                {/*<Link to={`/select-timeslot/${id}`}>*/}
                                <LightBlueButton className = 'px-3 py-2 rounded' text='Book Now' onClick={handleBookNow}></LightBlueButton>
                                {/*</Link>*/}
                            </Box>
                        </Box>

                        <Box sx={{display: 'flex', alignItems: 'center', mt: 2, justifyContent: 'space-between'}}>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <Typography variant="h5" sx={{mr: 1}}>{offering.rating.toFixed(2)}</Typography>
                                {/*<GoStarFill className='text-yellow-500'/>*/}
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
                                Next Availability: {nextAvailability ? formatDate(new Date(nextAvailability.start)) : 'No available times'}
                                {/*//todo: modify availability!*/}
                                {/*{provider.availability}  */}
                            </Typography>
                        </Box>

                        <Divider sx={{mt:2}}/>

                        <Box sx={{display: 'flex', alignItems: 'flex-start', mt: 2, justifyContent: 'space-between'}}>
                            <Box sx ={{flex: '1 1 45%', display: 'flex', flexDirection: 'row'}}  >
                            <PinDropIcon sx={{mt:2, mr:1}}></PinDropIcon>
                            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2}}>
                            <Typography variant="body2" color="text.secondary">
                                {offering.description}
                            </Typography>
                            </Box>
                            </Box>

                            {/*<AccessTimeIcon sx={{mt:2}}/>*/}
                            {/*<Box sx={{display: 'flex', flexDirection: 'column', flex: '1 1 30%', alignItems: 'left', mt: 2}}>*/}
                            {/*    <Typography variant="body2" color="text.secondary">*/}
                            {/*        {provider.email} </Typography>*/}
                            {/*    <Typography variant="body2" color="text.secondary">*/}
                            {/*        {provider.phoneNumber} </Typography>*/}
                            {/*</Box>*/}
                            <Box sx={{ mt: 2, flex: '1 1 30%'}}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0 }}>
                                    <EmailIcon sx={{ mr: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {provider.email}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <PhoneIcon sx={{ mr: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {provider.phoneNumber}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx ={{flex: '1 1 30%', display: 'flex', flexDirection: 'row'}}  >
                            <AccountBalanceWalletIcon sx={{mb: 1, mt:2, mr: 1}}/>
                            <Box sx={{alignItems: 'center', mt:2}}>
                                <Typography variant="body2">
                                    Service Fee: €{offering.hourlyRate}/hour
                                </Typography>
                                <Typography variant="body2">
                                    Payment methods: {offering.acceptedPaymentMethods}{/*todo: add this to */}
                                </Typography>
                            </Box>
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
                                    {offering.rating.toFixed(2)} <Rating precision={0.25} defaultValue={offering.rating} readOnly={true}/>

                                </Typography>
                                <Typography variant="body2">
                                    {offering.reviewCount} global ratings
                                </Typography>
                                {/*<Box sx={{mt: 2}}>*/}
                                {/*    <Typography variant="body2">5 star</Typography>*/}
                                {/*    <Box sx={{backgroundColor: 'black', height: 10, width: '80%'}}></Box>*/}
                                {/*    <Typography variant="body2">80%</Typography>*/}
                                {/*    <Typography variant="body2">4 star</Typography>*/}
                                {/*    <Box sx={{backgroundColor: 'black', height: 10, width: '20%'}}></Box>*/}
                                {/*    <Typography variant="body2">20%</Typography>*/}
                                {/*</Box>*/}
                                <Box sx={{ mt: 2 }}>
                                    {ratingCounts.map((count, index) => (
                                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="body2" sx={{ width: '18%' }}>{5 - index} star</Typography>
                                            <Box sx={{ backgroundColor: 'black', height: 10, width: `${ratingPercentages[4 - index] * 0.6}%`, marginLeft: 1, marginRight: 1 }}></Box>
                                            <Typography variant="body2" sx={{ width: '10%' }}>{ratingPercentages[4 - index].toFixed(2)}%</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>



                    </Grid>
                    <Grid item xs={9}>



                        <Box sx={{mt: 4}}>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                <TextField
                                    fullWidth
                                    placeholder="Search in reviews"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
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
                                <FormControl sx={{ display: 'flex', width: "20%"}}>
                                    <InputLabel sx={{mb:2}}>Sort by</InputLabel>
                                    <Select
                                        value={sortOption}
                                        onChange={handleSortChange}
                                        label="Sort"
                                        displayEmpty
                                    >
                                        <MenuItem value="starsAsc">Stars Ascending</MenuItem>
                                        <MenuItem value="starsDesc">Stars Descending</MenuItem>
                                        <MenuItem value="dateAsc">Date Ascending</MenuItem>
                                        <MenuItem value="dateDesc">Date Descending</MenuItem>
                                    </Select>
                                </FormControl>
                            {/*</Box>*/}
                            <Box sx={{ display: 'flex', mb: 2 }}>
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <Button
                                        key={star}
                                        variant={filterStars === star ? 'contained' : 'outlined'}
                                        onClick={() => handleFilterStars(star)}
                                        // fullWidth
                                        sx={{ mr: 1 }}
                                    >
                                        {star} Stars
                                    </Button>
                                ))}
                                <Button
                                    sx={{ mr: 1 }}
                                    variant={filterStars === null ? 'contained' : 'outlined'}
                                    onClick={() => handleFilterStars(null)}
                                    // fullWidth
                                >
                                    All Stars
                                </Button>

                            </Box>
                            </Box>

                            <Divider sx={{mb: 2}}/>

                            {/*todo: update the reviews part once the review controllers etc. are done!*/}

                            {reviews ? filteredReviews.map((review) => (
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
                                                {review.rating.toFixed(2)} stars
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {review.content}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                                        </Typography>
                                        {/*<Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2}}>*/}
                                        {/*    <Button size="small">Helpful</Button>*/}
                                        {/*    <Button size="small">Report Abuse</Button>*/}
                                        {/*</Box>*/}
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
