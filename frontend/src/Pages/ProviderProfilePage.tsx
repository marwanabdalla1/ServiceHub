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
import {Account, Account as ServiceProvider} from '../models/Account';
import SearchIcon from '@mui/icons-material/Search';
import ReviewsIcon from '@mui/icons-material/Reviews';
import PinDropIcon from '@mui/icons-material/PinDrop';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LightBlueButton from "../components/inputs/BlueButton";
import {ServiceOffering} from '../models/ServiceOffering';
import { useParams, useNavigate} from 'react-router-dom';
import {useBooking} from "../contexts/BookingContext";
import axios from "axios";
import Select from "@mui/material/Select";
import StarIcon from '@mui/icons-material/Star';
import {defaultProfileImage, fetchProfileImageById, fetchReviewerProfileImages} from "../services/fetchProfileImage";
import CircularProgress from "@mui/material/CircularProgress";
import ErrorPage from "./ErrorPage";
import {formatDateTime} from "../utils/dateUtils";



export interface Review {
    _id: string;
    reviewer: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        profileImageId: string | null;
    };
    recipient: string;
    serviceOffering: string;
    job: string;
    rating: number;
    content: string;
    createdAt: string;
    updatedAt: string;

}

// a provider offering's public profile page
function ProviderProfilePage() {
    const {fetchAccountDetails, fetchOfferingDetails} = useBooking();
    const [provider, setProvider] = useState<ServiceProvider | null>(null);
    const [offering, setOffering] = useState<ServiceOffering | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortOption, setSortOption] = useState<string>("dateDesc");
    const [filterStars, setFilterStars] = useState<number | null>(null);

    const [nextAvailability, setNextAvailability] = useState<any>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [reviewerProfileImages, setReviewerProfileImages] = useState<{ [key: string]: string }>({});

    // const provider = mockProvider;
    const {offeringId} = useParams<{ offeringId: string }>(); //use this to then make a request to the user with the id to get the user data

    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            if (offeringId) {
                try {
                    const fetchedOffering = await fetchOfferingDetails(offeringId);
                    setOffering(fetchedOffering);

                    // Fetch next availability for the provider
                    try {
                        const response = await axios.get(`/api/timeslots/next-availability/${fetchedOffering.provider}`, {
                            params: {
                                transitTime: fetchedOffering.bufferTimeDuration,
                                defaultDuration: fetchedOffering.baseDuration
                            }
                        });
                        setNextAvailability(response.data.nextAvailability);
                    } catch (error) {
                        console.error("Failed to fetch next availability:", error);
                    }
                } catch (error) {
                    console.error("Failed to fetch offering details:", error);
                }
                // fetch provider's account details
                try {
                    const fetchedProvider = await fetchAccountDetails(offeringId);
                    setProvider(fetchedProvider);
                    fetchProfileImageById(fetchedProvider._id).then(image => {
                        setProfileImage(image);
                    });


                } catch (error) {
                    console.error("Failed to fetch account details:", error);
                }

                // fetch reviews on this offering
                try {
                    const reviewResponse = await axios.get(`/api/reviews/${offeringId}`);
                    setReviews(reviewResponse.data.review);
                    setLoading(false);

                } catch (error) {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchData();
    }, [offeringId]);


    // Fetch reviewer profile images when reviews change
    useEffect(() => {
        if (reviews.length > 0) {
            fetchReviewerProfileImages(reviews).then(images => {
                setReviewerProfileImages(images);
            });
        }
    }, [reviews]);

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

    // handle the searching and filtering of reviews
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
        if(loading){
                return (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                        <CircularProgress />
                    </Box>
                );
        }
        else {
            return <ErrorPage title={"404 Not Found"} message={"The offering you're looking for does not exist."} />
        }
    }

    const styles = {
        nameContainer: {
            display: 'inline-block',
            position: 'relative',
        },
        label: {
            color: '#388e3c', // Color for "Licensed"
            fontWeight: 'bold',
            marginLeft: '10px',
        },
        premiumContainer: {
            display: 'flex',
            alignItems: 'center',
            position: 'absolute',
            top: '0px',
            right: '-90px',
        },
        premiumText: {
            color: '#5e63b6', // Blue color for "Premium"
            fontWeight: 'bold',
            marginRight: '5px',
        },
        starIcon: {
            color: '#ffbf00', // Yellow color for the star
            fontSize: '1.2rem', // Adjust the size as needed
        },
    };

    // Helper function to format address
    function formatAddress(country: any, location: any, postal: any) {
        // Filter out undefined or null values and join with a comma
        return [country, location, postal].filter(Boolean).join(', ');
    }

    return (
        <Container>
            <Box sx={{mt: 4}}>

                {/*providers' general info*/}
                <Grid container spacing={4} sx={{mt: 2}}>
                    <Grid item xs={3}>
                        <Avatar
                            variant="square"
                            sx={{width: '100%', height: 200}}
                            src={profileImage ? profileImage : defaultProfileImage}
                        />
                    </Grid>
                    <Grid item xs={9}>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <Box sx={{position: 'relative'}}>
                                    <Typography variant="h4" gutterBottom>
                                        {provider.firstName} {provider.lastName}
                                    </Typography>
                                    {provider.isPremium && (
                                        <Box sx={styles.premiumContainer}>
                                            <Typography variant="body2" sx={styles.premiumText}>Premium</Typography>
                                            <StarIcon sx={styles.starIcon}/>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                            <LightBlueButton
                                className='px-3 py-2 rounded text-lg'
                                text='BOOK NOW'
                                onClick={handleBookNow}
                            />
                        </Box>

                        <Box sx={{display: 'flex', alignItems: 'flex-end', mt: 2, justifyContent: 'space-between'}}>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <Typography variant="h6" >
                                    {offering.serviceType}
                                </Typography>
                                {offering.isCertified && (
                                    <Typography variant="body1" style={styles.label}>
                                        Licensed
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{display: 'flex', flexDirection: 'row', alignItems:'center'}}>
                                <PinDropIcon sx={{mr: 1}}></PinDropIcon>
                                <Typography variant="body1" gutterBottom>
                                    {formatAddress(provider.country, provider.location, provider.postal)}
                                </Typography>
                            </Box>

                            <Box sx={{display: 'flex', flexDirection: 'row', alignItems:'center'}}>

                            <Typography variant="body1" gutterBottom>
                                <CalendarMonthIcon sx={{mr: 1}}></CalendarMonthIcon>
                                Next Availability: {nextAvailability ? formatDateTime(new Date(nextAvailability.start)) : 'No available times'}
                                {/*{provider.availability}  */}
                            </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{mt: 2}}/>

                        {/*description, contact and payment method*/}
                        <Box sx={{display: 'flex', alignItems: 'flex-start', mt: 2, justifyContent: 'space-between'}}>
                            <Box sx={{flex: '1 1 45%', display: 'flex', flexDirection: 'row'}}>
                                <DescriptionIcon sx={{mt: 2, mr: 1}}></DescriptionIcon>
                                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2}}>
                                    <Typography variant="body2" color="text.secondary">
                                        {offering.description ? offering.description : "Welcome to my service page."}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{mt: 2, flex: '1 1 30%'}}>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 0}}>
                                    <EmailIcon sx={{mr: 1}}/>
                                    <Typography variant="body2" color="text.secondary">
                                        {provider.email}
                                    </Typography>
                                </Box>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                    <PhoneIcon sx={{mr: 1}}/>
                                    <Typography variant="body2" color="text.secondary">
                                        {provider.phoneNumber}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{flex: '1 1 30%', display: 'flex', flexDirection: 'row'}}>
                                <AccountBalanceWalletIcon sx={{mb: 1, mt: 2, mr: 1}}/>
                                <Box sx={{alignItems: 'center', mt: 2}}>
                                    <Typography variant="body2" color="text.secondary">
                                        Service Fee: €{offering.hourlyRate}/hour
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Payment methods: {offering.acceptedPaymentMethods}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                {/*display reviews for the offering*/}
                <Grid container spacing={4} sx={{mt: 4}}>
                    <Grid item xs={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Customer reviews</Typography>

                                {totalReviews > 0 ? (
                                    <>
                                        <Typography variant="h4" gutterBottom>
                                            {offering.rating.toFixed(2)} <Rating precision={0.25}
                                                                                 defaultValue={offering.rating}
                                                                                 readOnly={true}/>

                                        </Typography>
                                        <Typography variant="body2">
                                            {offering.reviewCount} global ratings
                                        </Typography>
                                        <Box sx={{mt: 2}}>
                                            {ratingCounts.map((count, index) => (
                                                <Box key={index} sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                                    <Typography variant="body2"
                                                                sx={{width: '18%'}}>{5 - index} star</Typography>
                                                    <Box sx={{
                                                        backgroundColor: 'black',
                                                        height: 10,
                                                        width: `${ratingPercentages[4 - index] * 0.6}%`,
                                                        marginLeft: 1,
                                                        marginRight: 1
                                                    }}></Box>
                                                    <Typography variant="body2"
                                                                sx={{width: '10%'}}>{ratingPercentages[4 - index].toFixed(2)}%</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </>
                                ) : (
                                    <Typography variant="body2">
                                        No reviews yet.
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>


                    </Grid>

                    {/*if no reviews, display some placeholders to make the aesthetics look better*/}
                    {totalReviews<=0 &&(
                        <Box sx={{ maxWidth: 800, margin: 'auto', padding: 2 }}>


                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                    <ReviewsIcon sx={{
                                        mr: 5,
                                        color: 'white',
                                        backgroundColor: '#93c5fd',
                                        borderRadius: '50%',
                                        p: 2,
                                        fontSize: '5rem' //big icon

                                    }} />
                                    <Box sx={{ display: 'flex', flexDirection: 'column',  textAlign: 'left' }}>
                                    <Typography variant='h6' sx={{mb: 2}}>
                                        There are no reviews yet.
                                    </Typography>
                                    <Typography variant="body2" marginBottom={2} sx={{ whiteSpace: 'pre-line' }}>
                                            Book an appointment now with {provider.firstName} and be the first to leave a review!
                                        </Typography>
                                        <Typography variant="body2" marginBottom={2} sx={{ whiteSpace: 'pre-line' }}>
                                            Already had an appointment with {provider.firstName}? Share your experience to help others make an informed decision!
                                        </Typography>
                                    </Box>
                                </Box>
                        </Box>
                    )

                    }
                    {totalReviews > 0 && (
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

                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 2
                                }}>
                                    <FormControl sx={{display: 'flex', width: "20%"}}>
                                        <InputLabel>Sort by</InputLabel>
                                        <Select
                                            value={sortOption}
                                            onChange={handleSortChange}
                                            label="Sort"
                                            displayEmpty
                                        >
                                            <MenuItem value="starsAsc">Stars Ascending</MenuItem>
                                            <MenuItem value="starsDesc">Stars Descending</MenuItem>
                                            <MenuItem value="dateAsc">Date Oldest</MenuItem>
                                            <MenuItem value="dateDesc">Date Latest</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl sx={{display: 'flex', width: "20%", ml: 2}}>
                                        <InputLabel>Star Rating</InputLabel>
                                        <Select
                                            value={filterStars !== null ? filterStars.toString() : 'all'}
                                            onChange={(event) => handleFilterStars(event.target.value !== 'all' ? parseInt(event.target.value, 10) : null)}
                                            label="Star Rating"
                                            displayEmpty
                                        >
                                            <MenuItem value="all">All Stars</MenuItem>
                                            {[5, 4, 3, 2, 1].map((star) => (
                                                <MenuItem key={star} value={star.toString()}>{star} Stars</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Divider sx={{mb: 2}}/>


                                {reviews ? filteredReviews.map((review) => (
                                    <Card key={review._id} sx={{mb: 2}}>
                                        <CardContent>
                                            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                                <Avatar
                                                    src={reviewerProfileImages[review.reviewer._id] || defaultProfileImage}
                                                    sx={{mr: 2}}
                                                    alt={`${review.reviewer.firstName} ${review.reviewer.lastName}`}
                                                />
                                                <Typography
                                                    variant="h6">{review.reviewer.firstName + " " + review.reviewer.lastName}</Typography>
                                            </Box>
                                            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                                <Rating precision={0.5} defaultValue={review.rating}
                                                        readOnly={true}/>
                                                <Typography variant="body2" sx={{ml: 1}}>
                                                    {review.rating.toFixed(2)} stars
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {review.content}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Reviewed on {new Date(review.updatedAt).toLocaleDateString()}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                )) : ""}
                            </Box>
                        </Grid>)}
                </Grid>
            </Box>
        </Container>
    );
}

export default ProviderProfilePage;
