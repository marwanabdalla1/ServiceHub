import React from 'react';
// import { Box } from '@mui/material';
//
// const CustomEvent = ({ event:any }) => {
//     const mainEventStyle = {
//         backgroundColor: 'grey',
//         opacity: 0.6,
//         height: '100%',
//         width: '100%',
//         zIndex: 1,
//     };
//
//     const transitEventStyle = {
//         backgroundColor: 'lightgrey',
//         opacity: 0.6,
//         height: '100%',
//         width: '100%',
//         zIndex: 1,
//     };
//
//     const hasTransit = event.transitStart && event.transitEnd;
//
//     return (
//         <div style={{ position: 'relative', height: '100%' }}>
//             {hasTransit && (
//                 <>
//                     {/* Render transit start to event start */}
//                     <Box
//                         sx={{
//                             ...transitEventStyle,
//                             position: 'absolute',
//                             top: 0,
//                             bottom: '50%',
//                         }}
//                     />
//                     {/* Render event end to transit end */}
//                     <Box
//                         sx={{
//                             ...transitEventStyle,
//                             position: 'absolute',
//                             top: '50%',
//                             bottom: 0,
//                         }}
//                     />
//                 </>
//             )}
//             {/* Render main event */}
//             <Box
//                 sx={{
//                     ...mainEventStyle,
//                     position: 'absolute',
//                     top: hasTransit ? '25%' : 0,
//                     bottom: hasTransit ? '25%' : 0,
//                 }}
//             />
//         </div>
//     );
// };
//
// export default CustomEvent;
