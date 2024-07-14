import React, {useEffect, useRef, useState} from 'react';
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Paper,
    Avatar,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Grid
} from '@mui/material';
import BlueButton from "../components/inputs/BlueButton";
import LightBlueFileButton from "../components/inputs/BlueUploadButton";
import {useNavigate} from 'react-router-dom';
import {useAuth} from "../contexts/AuthContext";
import axios from "axios";
import {toast} from "react-toastify";
import DeleteIcon from '@mui/icons-material/Delete';
import AddressDialog from "../components/dialogs/AddressDialog";
import {isValidPhoneNumber} from "../validators/AccountDataValidator";
import {
    defaultProfileImage,
    deleteProfileImage,
    fetchProfileImageByToken,
    handleProfileImageUpload
} from "../services/fetchProfileImage";
import {deleteAccount, saveAddress, updateAccountFields} from "../services/accountService";
import {deleteService} from "../services/serviceOfferingService";

type EditModeType = {
    [key: string]: boolean;
};

type FieldType = {
    [key: string]: string;
};

function UserProfile(): React.ReactElement {

    const [account, setAccount] = useState<any>(null);
    const {token, logoutUser} = useAuth();
    const [services, setServices] = useState<any[]>([]);

    const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const {account: userAccount} = useAuth();
    const isProvider = userAccount?.isProvider;
    const isPremium = userAccount?.isPremium;
    const client_reference_id = userAccount?._id;
    const [openAddressDialog, setOpenAddressDialog] = useState(false);
    const [openServiceDeleteDialog, setOpenServiceDeleteDialog] = useState(false);
    const navigate = useNavigate();

    const fetchSubscriptionData = async (clientReferenceId: string) => {
        try {
            const response = await axios.get('/api/becomepro/subscription', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching subscription data:', error);
            throw error;
        }
    };
    //TODO: Implement cancelSubscription backend
    const cancelSubscription = async (subscriptionId: string) => {
        try {
            const response = await axios.post(`/api/becomepro/subscription/cancel`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log(`Status: ${response.status}`);
            console.log(response.data);

            // Update the subscriptions state after cancellation
            setSubscriptions(subscriptions.map(sub => sub.id === subscriptionId ? {...sub, status: 'canceled'} : sub));
        } catch (error) {
            console.error('Error cancelling subscription:', error);
        }
    };


    /**
     * Custom hook to skip the first render of a component
     * @param effect
     * @param deps
     */
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

    /**
     * Fetch account details from the backend everytime the account state changes
     *
     */
    useSkipFirstEffect(() => {
        (async () => {
            try {
                const response = await axios.get('/api/account', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (JSON.stringify(response.data) !== JSON.stringify(account)) {
                    setAccount(response.data);
                }

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
        if (token) {
            fetchProfileImageByToken(token).then(image => setProfileImage(image));
        }
    }, [token]);

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
        phoneNumber: false,
        address: false,
        description: false,
        service: false
    });

    const [fieldValue, setFieldValue] = useState<FieldType>({
        userId: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        description: "",
    });

    useEffect(() => {
        if (account) {
            const {address, postal, location} = account;
            const concatenatedAddress = [address, postal, location]
                .filter(field => field !== null && field !== undefined && field.trim() !== "")
                .join(", ");
            setFieldValue({
                userId: account._id,
                firstName: account.firstName,
                lastName: account.lastName,
                email: account.email,
                phoneNumber: account.phoneNumber ? account.phoneNumber : "",
                address: concatenatedAddress,
                description: account.description ? account.description : "",
            });
        }
    }, [account]);

    const handleEditClick = (field: string) => {
        setEditMode(prevState => ({...prevState, [field]: !prevState[field]}));
    };

    const handleFieldChange = (field: string, newValue: string) => {
        setFieldValue(prevState => ({...prevState, [field]: newValue}));
    };

    const handleSaveAddress = async (updatedAddress: {
        address: string;
        postal: string;
        location: string;
    }) => {
        await saveAddress(updatedAddress, account, token, null, setAccount);

        setOpenAddressDialog(false);
    };


    const handleKeyPress = (event: React.KeyboardEvent, field: string) => {
        if (event.key === 'Enter') {
            updateAccountFields(account, field, token, null, fieldValue, setFieldValue).then(() => console.log('Field saved'));
            handleEditClick(field);
        }
    };


    const handleAddServiceClick = () => {
        navigate('/addservice');
    };

    const handleEditServiceClick = (service: any) => {
        navigate('/addservice', {state: {service}});
    };
    const handleDeleteServiceClick = async () => {
        if (serviceToDelete && token) {
            try {
                await deleteService(serviceToDelete, token, services, setServices);
                setServices(services.filter(service => service._id !== serviceToDelete));
            } catch (error) {
                console.error('Error deleting service:', error);
            } finally {
                setOpenServiceDeleteDialog(false);
                setServiceToDelete(null);
            }
        }
    };


    const handleServiceDeleteOpenDialog = (serviceId: string) => {
        setServiceToDelete(serviceId);
        setOpenServiceDeleteDialog(true);
    };

    const handleServiceDeleteCloseDialog = () => {
        setOpenServiceDeleteDialog(false);
        setServiceToDelete(null);
    };

    const handleDeleteAccount = async () => {
        try {
            if (token) {
                deleteAccount(token, null);
            }
            navigate('/login');
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    const handleViewScheduleClick = () => {
        navigate('/select-availability');
    };

    const renderField = (label: string, field: string, isEditable: boolean = true) => {
        if (field === 'address') {
            return (
                <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 0}}>
                    <Typography variant="body1" sx={{fontWeight: 'bold'}}>{label}:</Typography>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant="body1">{fieldValue[field]}</Typography>
                        <Button onClick={() => setOpenAddressDialog(true)}>Edit</Button>
                    </Box>
                </Box>
            );
        }
        return (
            <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 0}}>
                <Typography variant="body1" sx={{fontWeight: 'bold'}}>{label}:</Typography>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
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
                    {isEditable && (
                        <Button onClick={() => handleEditClick(field)}>Edit</Button>
                    )}
                </Box>
            </Box>
        );
    };

    const getFormattedDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    return (
        <Container component="main" maxWidth="md" sx={{mt: 4, backgroundColor: '#f5f5f5', borderRadius: '20px'}}>
            <Paper variant="outlined" sx={{p: 3, borderRadius: '20px'}}>
                <Typography variant="h6" gutterBottom sx={{fontWeight: 'bold', fontSize: '24px', color: '#007BFF'}}>
                    Public Profile
                </Typography>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, p: 3}}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                        position: 'relative'
                    }}>
                        {defaultProfileImage !== profileImage && (
                            <IconButton
                                onClick={() => deleteProfileImage(token, setProfileImage)}
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: 5,
                                    right: 305,
                                    transform: 'translate(50%, -50%)',
                                    backgroundColor: 'white',
                                    border: '1px solid #ccc',
                                    padding: '2px',
                                    '&:hover': {
                                        backgroundColor: 'red',
                                        color: 'white',
                                    },
                                }}
                            >
                                <DeleteIcon sx={{fontSize: 16}}/>
                            </IconButton>
                        )}
                        <Avatar src={profileImage ? profileImage : undefined}
                                sx={{width: 80, height: 80}}/>
                        <LightBlueFileButton text="Upload Profile Picture"
                                             onFileChange={handleProfileImageUpload(setProfileImage, token)}/>
                    </Box>
                    {renderField("User ID", "userId", false)}
                    {renderField("First Name", "firstName", false)}
                    {renderField("Last Name", "lastName", false)}
                    {renderField("Email Address", "email", false)}
                    {renderField("Phone Number", "phoneNumber")}
                    {renderField("Address", "address")}
                    {renderField("Description", "description")}
                    <Button onClick={logoutUser}>Logout</Button>
                    {isProvider && (
                        <>
                            <Divider sx={{my: 2}}/>
                            <Typography variant="h6" gutterBottom component="div"
                                        sx={{fontWeight: 'bold', fontSize: '24px', color: '#007BFF'}}>
                                Service Provider Settings
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: 0
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold'}}>Provided Services:</Typography>
                                {/*<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>*/}
                                {/*    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Provided Services:</Typography>*/}
                                {/*    <BlueButton text="Add Service" onClick={handleAddServiceClick} />*/}
                                {/*</Box>*/}
                                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                                    {services.length > 0 ? (
                                        services.map(service => (
                                            <Grid container alignItems="center" spacing={2} key={service._id}>
                                                <Grid item xs>
                                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                        <Typography variant="body1">{service.serviceType}</Typography>
                                                        {service.isCertified && (
                                                            <Typography variant="body2" sx={{
                                                                color: '#388e3c', // Color for "Licensed"
                                                                fontWeight: 'bold',
                                                                marginLeft: '10px',
                                                                fontSize: '1rem', // Adjust the font size to match the service type
                                                            }}>
                                                                [Licensed]
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Grid>
                                                <Grid item>
                                                    <Button
                                                        onClick={() => handleEditServiceClick(service)}>Edit</Button>
                                                </Grid>
                                                <Grid item>
                                                    <Button onClick={() => handleServiceDeleteOpenDialog(service._id)}
                                                            sx={{color: 'red'}}>Delete</Button>
                                                </Grid>
                                            </Grid>

                                        ))
                                    ) : (
                                        <Typography variant="body1">No services provided</Typography>
                                    )}
                                </Box>
                                <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3}}>
                                    <BlueButton text="Add Service" onClick={handleAddServiceClick}/>
                                </Box>
                            </Box>
                        </>
                    )}

                    <Box sx={{mt: 3}}>
                        <Typography variant="h6" sx={{fontWeight: 'bold'}}>Subscription Information:</Typography>
                        {subscriptions.length > 0 ? (
                            subscriptions.map((subscription) => (
                                <Box key={subscription.id} sx={{display: 'flex', flexDirection: 'column', mt: 2}}>
                                    <Typography variant="body1"><strong>Status:</strong> {subscription.status}
                                    </Typography>
                                    <Typography variant="body1"><strong>Expiration
                                        Date:</strong> {getFormattedDate(subscription.current_period_end)}</Typography>
                                    {subscription.status !== 'canceled' && (
                                        <Button onClick={() => cancelSubscription(subscription.id)}
                                                sx={{mt: 1, color: 'red'}}>Cancel Subscription</Button>
                                    )}
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body1">No active subscriptions</Typography>
                        )}
                    </Box>
                    {isProvider ? (
                        <BlueButton
                            text="View My Work Schedule"
                            onClick={handleViewScheduleClick}
                            sx={{
                                backgroundColor: '#93c5fd',
                                color: 'black',
                                mt: 2
                            }}
                        />
                    ) : (
                        <div></div>
                    )}
                    <Button onClick={handleDeleteAccount} sx={{backgroundColor: 'red', color: 'white', mt: 2}}>Delete
                        Account</Button>
                </Box>
            </Paper>
            <AddressDialog
                open={openAddressDialog}
                onClose={() => setOpenAddressDialog(false)}
                onSave={handleSaveAddress}
                initialAddress={{
                    address: account?.address || '',
                    postal: account?.postal || '',
                    location: account?.location || ''
                }}
            />

            <Dialog open={openServiceDeleteDialog} onClose={handleServiceDeleteCloseDialog}>
                <DialogTitle>{"Confirm Delete"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this service?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleServiceDeleteCloseDialog} color="primary">
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
