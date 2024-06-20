import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

// todo: make the side card in the booking steps reusable
//
// const BookingDetailsCard = ({ provider:Account, location: string, service, price, ...otherDetails }) => {
//     return (
//         <Card>
//             <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
//                 <Box>
//                     {provider && (
//                         <Typography variant="h6">
//                             {`${provider.firstName} ${provider.lastName}`}
//                         </Typography>
//                     )}
//                     {location && (
//                         <Typography variant="body2" color="text.secondary">
//                             {location}
//                         </Typography>
//                     )}
//                     {service && (
//                         <Typography variant="body2" color="text.secondary">
//                             {service}
//                         </Typography>
//                     )}
//                     {price && (
//                         <Typography variant="body2" color="text.secondary">
//                             {price}
//                         </Typography>
//                     )}
//                     {Object.entries(otherDetails).map(([key, value]) => (
//                         value && (
//                             <Typography key={key} variant="body2" color="text.secondary">
//                                 {value}
//                             </Typography>
//                         )
//                     ))}
//                 </Box>
//             </CardContent>
//         </Card>
//     );
// };
//
// export default BookingDetailsCard;
