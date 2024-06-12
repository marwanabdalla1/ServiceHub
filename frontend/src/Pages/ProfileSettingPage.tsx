// import React, {useState} from 'react';
// import {Container, Typography, TextField, Button, Box, Paper, Avatar, Divider} from '@mui/material';
// import BlueButton from "../components/inputs/BlueButton";
// import LightBlueFileButton from "../components/inputs/BlueUploadButton";
// import {useNavigate} from 'react-router-dom';
// import account from "../models/Account";

// type EditModeType = {
//     [key: string]: boolean;
// };

// type FieldType = {
//     [key: string]: string;
// };

// function UserProfile(): React.ReactElement {
//     const [editMode, setEditMode] = useState<EditModeType>({
//         firstName: false,
//         lastName: false,
//         email: false,
//         phone: false,
//         address: false,
//         description: false,
//         service: false
//     });
//     const [fieldValue, setFieldValue] = useState<FieldType>({
//         userId: account.id,
//         firstName: account.firstName,
//         lastName: account.lastName,
//         email: account.email,
//         phone: account.phoneNumber,
//         address: account.address,
//         description: account.description,
//         service: account.serviceOfferings.map(service => service.serviceType).join(', '),
//     });
//     const [userImage, setUserImage] = useState<File | null>(null);
//     const [certificate, setCertificate] = useState<File | null>(null);

//     const handleFileUpload = (setFile: React.Dispatch<React.SetStateAction<File | null>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files ? event.target.files[0] : null;
//         setFile(file);
//     };

//     const handleEditClick = (field: string) => {
//         setEditMode(prevState => ({...prevState, [field]: !prevState[field]}));
//     };

//     const handleFieldChange = (field: string, newValue: string) => {
//         setFieldValue(prevState => ({...prevState, [field]: newValue}));
//     };

//     const handleKeyPress = (event: React.KeyboardEvent, field: string) => {
//         if (event.key === 'Enter') {
//             handleEditClick(field);
//         }
//     };

//     const navigate = useNavigate()

//     const handleAddServiceClick = () => {
//         navigate('/addservice');
//     };

//     const renderField = (label: string, field: string) => {
//         return (
//             <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 0}}>
//                 <Typography variant="body1" sx={{fontWeight: 'bold'}}>{label}:</Typography>
//                 <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
//                     {field === 'userId' || !editMode[field] ? (
//                         <Typography variant="body1">{fieldValue[field]}</Typography>
//                     ) : (
//                         <TextField
//                             fullWidth
//                             value={fieldValue[field]}
//                             variant="outlined"
//                             onChange={(e) => handleFieldChange(field, e.target.value)}
//                             onKeyPress={(e) => handleKeyPress(e, field)}
//                         />
//                     )}
//                     {field !== 'userId' && <Button onClick={() => handleEditClick(field)}>Edit</Button>}
//                 </Box>
//             </Box>
//         );
//     };

//     return (
//         <Container component="main" maxWidth="md" sx={{mt: 4, backgroundColor: '#f5f5f5', borderRadius: '20px'}}>
//             <Paper variant="outlined" sx={{p: 3, borderRadius: '20px'}}>
//                 <Typography variant="h6" gutterBottom sx={{fontWeight: 'bold', fontSize: '24px', color: '#007BFF'}}>
//                     Public Profile
//                 </Typography>
//                 <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, p: 3}}>
//                     <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5}}>
//                         <Avatar src={userImage ? URL.createObjectURL(userImage) : undefined}
//                                 sx={{width: 80, height: 80}}/>
//                         <LightBlueFileButton text="Upload Profile Picture"
//                                              onFileChange={handleFileUpload(setUserImage)}/>
//                     </Box>
//                     {renderField("User ID", "userId")}
//                     {renderField("First Name", "firstName")}
//                     {renderField("Last Name", "lastName")}
//                     {renderField("Email Address", "email")}
//                     {renderField("Phone Number", "phone")}
//                     {renderField("Address", "address")}
//                     {renderField("Description", "description")}
//                     <Divider sx={{my: 2}}/>
//                     <Typography variant="h6" gutterBottom component="div"
//                                 sx={{fontWeight: 'bold', fontSize: '24px', color: '#007BFF'}}>
//                         Service Provider Settings
//                     </Typography>
//                     <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 0}}>
//                         <Typography variant="body1" sx={{fontWeight: 'bold'}}>Provided Services:</Typography>
//                         <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
//                             <Typography variant="body1">{fieldValue['service']}</Typography>
//                             <BlueButton text="Add Service" onClick={handleAddServiceClick} sx={{width: '150px'}}/>
//                         </Box>
//                     </Box>
//                     <Box sx={{
//                         display: 'flex',
//                         flexDirection: 'row',
//                         justifyContent: 'space-between',
//                         alignItems: 'center',
//                         gap: 1
//                     }}>
//                         <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1}}>
//                             <Typography variant="body1" sx={{fontWeight: 'bold'}}>Professional Certificate:</Typography>
//                             <Typography variant="body1">{certificate ? certificate.name : "Not provided"}</Typography>
//                         </Box>
//                         <LightBlueFileButton text="Upload" onFileChange={handleFileUpload(setCertificate)}
//                                              sx={{width: '100px'}}/>
//                     </Box>
//                 </Box>
//             </Paper>
//         </Container>
//     );
// }

// export default UserProfile;


export {}