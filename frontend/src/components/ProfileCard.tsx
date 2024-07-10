// MediaCard component
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

interface MediaCardProps {
  offering: ServiceOffering;
  profileImageUrl: string | null;
  loading: boolean;
}

export default function MediaCard({ offering, profileImageUrl, loading }: MediaCardProps) {
  const provider = offering.provider;
  return (
    <div className='border margin-4'>
      <Card sx={{ borderRadius: '15px' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={280}>
            <CircularProgress />
          </Box>
        ) : (
          <CardMedia
            sx={{ height: 280 }}
            image={profileImageUrl ? profileImageUrl : provider.profileImageUrl}
            title="Service Image"
          />
        )}
        <CardContent>
          <div>
            <Typography gutterBottom variant="h5" component="div">
              {provider.firstName} {provider.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {offering.serviceType}
            </Typography>

            <div className='flex space-x-4'>
              <Typography variant="body2" color="text.secondary">
                €{offering.hourlyRate}/hr
              </Typography>
              <div className='flex space-x-1 items-center'>
                <Typography variant="body2" color="text.secondary">
                  {offering.rating}
                </Typography>
                <GoStarFill className='text-yellow-500' />
              </div>
              {offering.isCertified && (
                <Typography className='text-green-500' variant="body2">
                  Licensed
                </Typography>
              )}
              {provider.isPremium && (
                <Typography className='text-slate-500 font-extrabold' variant="body2">
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