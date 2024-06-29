import React, { useEffect, useRef, useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Avatar, Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import BlueButton from "../components/inputs/BlueButton";
import LightBlueFileButton from "../components/inputs/BlueUploadButton";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { sub } from 'date-fns';

type EditModeType = {
    [key: string]: boolean;
};

type FieldType = {
    [key: string]: string;
};

function UserProfile(): React.ReactElement {

    const [account, setAccount] = useState<any>(null);
    const { token, logoutUser } = useAuth();
    const [services, setServices] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const {account :userAccount  } = useAuth();
    const isProvider = userAccount?.isProvider;
    const isPremium = userAccount?.isPremium;
    const client_reference_id = userAccount?._id;
    console.log(services)
    const fetchSubscriptionData = async (clientReferenceId: string) => {
      try {
        const response = await axios.get('/api/becomepro/subscription', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log(`Status: ${response.status}`);
        console.log(response.data);

        return response.data;
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        throw error;
      }
    };

    function useSkipFirstEffect(effect: React.EffectCallback, deps?: React.DependencyList) {
        const isFirstRender = useRef(true);

        useEffect(() => {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }

            return effect();
        }, deps);
    }

    useSkipFirstEffect(() => {
        (async () => {
            try {
                console.log("token: " + token + '\n' + "isProvider: " + isProvider + '\n' + "isPremium: " + isPremium );

                const response = await axios.get('/api/account', { // replace with your backend endpoint
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });


                if (JSON.stringify(response.data) !== JSON.stringify(account)) {
                    setAccount(response.data);
                }

                // Fetch subscription data
                if (client_reference_id) {
                    const subscriptionData = await fetchSubscriptionData(client_reference_id);
                    setSubscriptions(subscriptionData);
                }
            } catch (error) {
                console.error('Error fetching account details:', error);
            }
        })();
    }, [account]);

    useEffect(() => {
        axios.get('/api/offerings/myoffering', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {

                setServices(response.data || []);
            })
            .catch(error => {
                console.error('Error fetching services:', error);
            });
    }, []);

    const [editMode, setEditMode] = useState<EditModeType>({
        firstName: false,
        lastName: false,
        email: false,
        phone: false,
        address: false,
        description: false,
        service: false
    });

    const [fieldValue, setFieldValue] = useState<FieldType>({
        userId: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        description: "",
    });

    useEffect(() => {
        if (account) {
            setFieldValue({
                userId: account._id,
                firstName: account.firstName,
                lastName: account.lastName,
                email: account.email,
                phone: account.phone ? account.phone : "",
                address: account.address ? account.address : "",
                description: account.description ? account.description : "",
            });
        }
    }, [account]);

    const [userImage, setUserImage] = useState<File | null>(null);

    const handleFileUpload = (setFile: React.Dispatch<React.SetStateAction<File | null>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setFile(file);
    };

    const handleEditClick = (field: string) => {
        setEditMode(prevState => ({ ...prevState, [field]: !prevState[field] }));
    };

    const handleFieldChange = (field: string, newValue: string) => {
        setFieldValue(prevState => ({ ...prevState, [field]: newValue }));
    };

    const handleFieldSave = async (field: string) => {
        const updatedAccount = { ...account, [field]: fieldValue[field] };

        try {
            const response = await axios.put('/api/account', updatedAccount, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(`Status: ${response.status}`);
            console.log(response.data);

            setAccount(response.data);
        } catch (error) {
            console.error('Error updating account details:', error);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent, field: string) => {
        if (event.key === 'Enter') {
            handleFieldSave(field).then(r => console.log('Field saved'));
            handleEditClick(field);
        }
    };

    const navigate = useNavigate();

    const handleAddServiceClick = () => {
        navigate('/addservice');
    };

    const handleEditServiceClick = (service: any) => {
        navigate('/addservice', { state: { service } });
    };

    const handleDeleteServiceClick = async () => {
        if (serviceToDelete) {
            try {
                const response = await axios.delete(`/api/services/delete-service/${serviceToDelete}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log(`Status: ${response.status}`);
                console.log(response.data);

                setServices(services.filter(service => service._id !== serviceToDelete));
            } catch (error) {
                console.error('Error deleting service:', error);
            } finally {
                setOpenDialog(false);
                setServiceToDelete(null);
            }
        }
    };

    const handleOpenDialog = (serviceId: string) => {
        setServiceToDelete(serviceId);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setServiceToDelete(null);
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await axios.delete('/api/account', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(`Status: ${response.status}`);
            console.log(response.data);
            navigate('/login');

        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    const handleViewScheduleClick = () => {
        navigate('/select-availability');
    };

    const renderField = (label: string, field: string) => {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 0 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{label}:</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {field === 'userId' || !editMode[field] ? (
                        <Typography variant="body1">{fieldValue[field]}</Typography>
                    ) : (
                        <TextField
                            fullWidth
                            value={fieldValue[field]}
                            variant="outlined"
                            onChange={(e) => handleFieldChange(field, e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, field)}
                        />
                    )}
                    {field !== 'userId' && <Button onClick={() => handleEditClick(field)}>Edit</Button>}
                </Box>
            </Box>
        );
    };

    return (
        <Container component="main" maxWidth="md" sx={{ mt: 4, backgroundColor: '#f5f5f5', borderRadius: '20px' }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: '20px' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', fontSize: '24px', color: '#007BFF' }}>
                    Public Profile
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Avatar src={userImage ? URL.createObjectURL(userImage) : undefined}
                            sx={{ width: 80, height: 80 }} />
                        <LightBlueFileButton text="Upload Profile Picture"
                            onFileChange={handleFileUpload(setUserImage)} />
                    </Box>
                    {renderField("User ID", "userId")}
                    {renderField("First Name", "firstName")}
                    {renderField("Last Name", "lastName")}
                    {renderField("Email Address", "email")}
                    {renderField("Phone Number", "phone")}
                    {renderField("Address", "address")}
                    {renderField("Description", "description")}
                    <Button onClick={logoutUser}>Logout</Button>
                    {isProvider && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom component="div"
                                sx={{ fontWeight: 'bold', fontSize: '24px', color: '#007BFF' }}>
                                Service Provider Settings
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 0 }}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Provided Services:</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    {services.length > 0 ? (
                                        services.map(service => (
                                            <Box key={service._id} sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                                                <Typography variant="body1">{service.serviceType}</Typography>
                                                <Button onClick={() => handleEditServiceClick(service)}>Edit</Button>
                                                <Button onClick={() => handleOpenDialog(service._id)} sx={{ color: 'red' }}>Delete</Button>
                                                {subscriptions.map((subscription) => (
                                                  <Typography variant="body1" key={subscription.id}>{subscription.id}</Typography>
                                                ))}
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography variant="body1">No services provided</Typography>
                                    )}
                                </Box>
                                <BlueButton text="Add Service" onClick={handleAddServiceClick} sx={{ alignSelf: 'flex-start', width: 'auto', padding: '5px 10px' }} />
                            </Box>
                        </>
                    )}
                    <BlueButton text="View My Schedule" onClick={handleViewScheduleClick} sx={{ backgroundColor: '#ADD8E6', color: 'white', mt: 2 }} />
                    <Button onClick={handleDeleteAccount} sx={{ backgroundColor: 'red', color: 'white', mt: 2 }}>Delete Account</Button>
                </Box>
            </Paper>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{"Confirm Delete"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this service?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteServiceClick} color="primary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default UserProfile;
