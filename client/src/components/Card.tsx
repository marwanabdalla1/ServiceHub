import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { User } from '../models/User';


export default function MediaCard({ user } : {user : User} ) {
  return (
    <div className='border margin-4'>
       <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        sx={{ height: 140 }}
        image="/static/images/cards/contemplative-reptile.jpg"
        title="Service Image"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {user.firstName} {user.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Service Type: {user.service.serviceType}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Rating: {user.service.rating}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Hourly Rate: ${user.service.hourlyRating}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Licensed: {user.service.isLicensed ? "Yes" : "No"}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Share</Button>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
    </div>
   
  );
}