import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { ServiceOffering } from '../models/ServiceOffering';
import { GoStarFill } from "react-icons/go";
import { Link } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';

interface MediaCardProps {
    offering: ServiceOffering;
    profileImageUrl: string | null;
    loading: boolean;
}

export default function MediaCard({ offering, profileImageUrl, loading }: MediaCardProps) {
    const provider = offering.provider;
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <div className='border margin-4 rounded-2xl overflow-hidden'>
            <Card>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={280}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <CardMedia
                        sx={{ height: 280 }}
                        image={profileImageUrl ? profileImageUrl : provider.profileImageId}
                        title="Service Image"
                    />
                )}
                <CardContent>
                    <div>

                        <div className="flex justify-between items-center">
                            <div>
                                <Typography 
                                    gutterBottom 
                                    variant="h5" 
                                    component="div"
                                    sx={{
                                        maxWidth: '250px', // Set max width to prevent overflow
                                        whiteSpace: 'nowrap', // Prevent text from wrapping
                                        overflow: 'hidden', // Hide overflow text
                                        textOverflow: 'ellipsis' // Add ellipsis if text overflows
                                    }}
                                >
                                    {offering.serviceType}
                                </Typography>
                                <Typography 
                                    variant="h6" 
                                    color="text.secondary" 
                                    sx={{ 
                                        mt: -1,
                                        maxWidth: '250px', // Set max width to prevent overflow
                                        whiteSpace: 'nowrap', // Prevent text from wrapping
                                        overflow: 'hidden', // Hide overflow text
                                        textOverflow: 'ellipsis' // Add ellipsis if text overflows
                                    }}
                                >
                                    {provider.firstName} {provider.lastName}
                                </Typography>
                            </div>

                            <div>
                                <Typography variant="h6" color="text.secondary">
                                    €{offering.hourlyRate}/hr
                                </Typography>
                                {!isSmallScreen && (
                                    <Typography 
                                        variant="body1" 
                                        color="text.secondary" 
                                        sx={{
                                            maxWidth: '150px', // Set max width to prevent overflow
                                            whiteSpace: 'nowrap', // Prevent text from wrapping
                                            overflow: 'hidden', // Hide overflow text
                                            textOverflow: 'ellipsis' // Add ellipsis if text overflows
                                        }}
                                    >
                                        {provider.location}
                                    </Typography>
                                )}
                            </div>

                        </div>

                        <div className='flex items-center space-x-4'>

                            <div className='flex space-x-1 items-center'>
                                {(Number(offering.rating) === 0) ? (
                                    <Typography variant="body2" color="text.secondary">
                                        No reviews
                                    </Typography>) : (
                                    <>
                                        <Typography variant="body2" color="text.secondary">
                                            {offering.rating.toFixed(2)}
                                        </Typography>
                                        <GoStarFill className='text-yellow-500' />
                                    </>)}
                            </div>
                            {offering.isCertified && (
                                <Typography className='text-green-500' variant="body2"
                                    sx={{
                                        fontWeight: 'bold'
                                    }}>
                                    Licensed
                                </Typography>
                            )}
                            {provider.isPremium && (
                                <Typography className='font-extrabold' variant="body2"
                                    sx={{
                                        color: "#5e63b6",
                                        fontWeight: 'bold'
                                    }}>
                                    Promoted
                                </Typography>
                            )}
                        </div>
                    </div>
                </CardContent>
                <div className='flex justify-center'>
                    <CardActions>
                        <Link to={`/offerings/${offering._id}`}>
                            <Button size="small">Book Now</Button>
                        </Link>
                    </CardActions>
                </div>
            </Card>
        </div>
    );
}
