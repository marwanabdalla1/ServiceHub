import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Account } from '../models/Account';
import { GoStarFill } from "react-icons/go";
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import axios from "axios";

export default function MediaCard({ user }: { user: Account }) {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        // Fetch profile image
        const profileImageResponse = await axios.get(`/api/file/profileImage/${user._id}`, {
          responseType: 'blob'
        });

        if (profileImageResponse.status === 200) {
          setProfileImageUrl(URL.createObjectURL(profileImageResponse.data));
          user.profileImageUrl = URL.createObjectURL(profileImageResponse.data);
        }
      } catch (error) {
        // console.error('Error fetching profile image:', error);
      }
    };

    fetchProfileImage().then(r => {
      return r;
    });
  }, [user._id]);

  return (
    <div className='border margin-4  '>
      <Card
        //I want to make the card have rounded corners
        sx={{ borderRadius: '15px' }}

      >
        <CardMedia
          sx={{ height: 280 }}
          image={profileImageUrl ? profileImageUrl : user.profileImageUrl}
          title="Service Image"
        />
        <CardContent>
          <div>
            <Typography gutterBottom variant="h5" component="div">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.serviceOfferings[0]?.serviceType}
            </Typography>

            <div className='flex space-x-4'>
              <Typography variant="body2" color="text.secondary">
                €{user.serviceOfferings[0]?.hourlyRate}/hr
              </Typography>
              <div className='flex space-x-1 items-center'>
                <Typography variant="body2" color="text.secondary">
                  {user.serviceOfferings[0]?.rating}
                </Typography>
                <GoStarFill className='text-yellow-500' />
              </div>
              {user.serviceOfferings[0]?.isCertified && (
                <Typography className='text-green-500' variant="body2">
                  Licensed
                </Typography>
              )}
            </div>
          </div>
        </CardContent>
        <div className='flex justify-center'>
          <CardActions>
            <Link to={`/provider-profile/${user._id}`}>
              <Button size="small">Book Now</Button>
            </Link>
          </CardActions>
        </div>
      </Card>
    </div>
  );
}
