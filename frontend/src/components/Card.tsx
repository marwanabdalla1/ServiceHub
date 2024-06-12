import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Account as User } from '../models/Account';
import { GoStarFill } from "react-icons/go";


export default function MediaCard({ user } : {user : User} ) {
  return (
    <div className='border margin-4'>
       <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        sx={{ height: 220 }}
        image={user.profileImageUrl}
        title="Service Image"
      />
      <CardContent>
        <div>
        <Typography gutterBottom variant="h5" component="div">
          {user.firstName} {user.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
         {user.serviceOfferings[0].serviceType}
        </Typography>

        <div className='flex space-x-4'>
        <Typography variant="body2" color="text.secondary">
           €{user.serviceOfferings[0].hourlyRate}/hr
        </Typography>
        <div className='flex space-x-1 items-center'>
        <Typography variant="body2" color="text.secondary">
          {user.serviceOfferings[0].rating} 
        </Typography>
        <GoStarFill className='text-yellow-500'/>
        </div>
        {user.serviceOfferings[0].isCertified && (
            <Typography className='text-green-500' variant="body2">
              Licensed
            </Typography>
          )}
        
        </div>
        </div>
       
      
      </CardContent>
      <div className='flex justify-center'>
      <CardActions>
        <Button size="small">Book Now</Button>
      </CardActions>
      </div>
      
    </Card>
    </div>
   
  );
}