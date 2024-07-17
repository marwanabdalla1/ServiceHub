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
    IconButton,
    Grid,
    Tooltip, Card, CardContent,
    Link
} from '@mui/material';

import {Link as RouterLink} from 'react-router-dom';

import BlueButton from "../components/inputs/BlueButton";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import LightBlueFileButton from "../components/inputs/BlueUploadButton";
import {useNavigate} from 'react-router-dom';
import {useAuth} from "../contexts/AuthContext";
import axios from "axios";
import {toast} from "react-toastify";
import DeleteIcon from '@mui/icons-material/Delete';
import AddressDialog from "../components/dialogs/AddressDialog";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import LogoutIcon from '@mui/icons-material/Logout';
import {
    defaultProfileImage,
    deleteProfileImage,
    fetchProfileImageByToken,
    handleProfileImageUpload
} from "../services/fetchProfileImage";
import {deleteAccount, saveAddress, updateAccountFields} from "../services/accountService";
import {deleteService} from "../services/serviceOfferingService";
import ConfirmDeleteDialog from "../components/dialogs/ConfirmDeleteDialog";
import {formatDateTime} from "../utils/dateUtils";
import ListItem from "@mui/joy/ListItem";
import List from "@mui/joy/List";
import {ListItemButton} from "@mui/joy";
import LightBlueButton from "../components/inputs/BlueButton";

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
    const client_reference_id = userAccount?._id;
    const [openAddressDialog, setOpenAddressDialog] = useState(false);
    const [openServiceDeleteDialog, setOpenServiceDeleteDialog] = useState(false);
    const [openDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false);
    const navigate = useNavigate();

    const profileRef = useRef<HTMLDivElement>(null);
    const serviceProviderRef = useRef<HTMLDivElement>(null);
    const dangerZoneRef = useRef<HTMLDivElement>(null);

    const [activeSection, setActiveSection] = useState("profile");

    useEffect(() => {

        const fetchData = async () => {
            let accountResponse, profileImage, servicesResponse, subscriptionResponse;

            try {
                accountResponse = await axios.get('/api/account', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setAccount(accountResponse.data);
            } catch (error) {
                console.error('Error fetching account data:', error);
            }

            try {
                profileImage = await fetchProfileImageByToken(token!);
                setProfileImage(profileImage);
            } catch (error) {
                console.error('Error fetching profile image:', error);
            }

            try {
                servicesResponse = await axios.get('/api/offerings/myoffering', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setServices(servicesResponse.data || []);
            } catch (error) {
                console.error('Error fetching service data:', error);
            }

            try {
                subscriptionResponse = await axios.get('/api/becomepro/subscription', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setSubscriptions(subscriptionResponse.data);
            } catch (error) {
                console.error('Error fetching subscription data:', error);
            }
        };

        if (token) {
            fetchData();
        }

        // scroll listener
        const handleScroll = () => {

            if (!profileRef.current || !serviceProviderRef.current || !dangerZoneRef.current) {
                return;
            }

            const breakpoint = window.innerHeight * 0.4;

            const profileRect = profileRef.current.getBoundingClientRect();
            const serviceProviderRect = serviceProviderRef.current.getBoundingClientRect();
            const dangerZoneRect = dangerZoneRef.current.getBoundingClientRect();


            if (dangerZoneRect.top < breakpoint * 1.5) {
                setActiveSection('dangerZone');
            } else if (profileRect.top <= breakpoint && profileRect.bottom > breakpoint) {
                setActiveSection('profile');
            } else if (serviceProviderRect.top <= breakpoint && serviceProviderRect.bottom > breakpoint) {
                setActiveSection('serviceProvider');
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [token, client_reference_id]);


    const [editMode, setEditMode] = useState<EditModeType>({
        firstName: false,
        lastName: false,
        email: false,
        phoneNumber: false,
        address: false,
        description: false
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
                phoneNumber: account.phoneNumber || "",
                address: concatenatedAddress,
                description: account.description || "",
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
        navigate('/update-sprofile');
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

    const handleDeleteAccountOpenDialog = () => {
        setOpenDeleteAccountDialog(true);
    };

    const handleDeleteAccountCloseDialog = () => {
        setOpenDeleteAccountDialog(false);
    };

    const handleConfirmDeleteAccount = async (email?: string) => {
        if (email === account.email) {
            try {
                if (token) {
                    await deleteAccount(token, null);
                }
                navigate('/login');
            } catch (error) {
                console.error('Error deleting account:', error);
            }
        } else {
            toast("Emails do not match");
            return;
        }
        setOpenDeleteAccountDialog(false);
    };

    const handleViewScheduleClick = () => {
        navigate('/select-availability');
    };

    // navigating to the different page sections
    const handleNavigation = (section: string) => {
        setActiveSection(section);
        let elementRef;
        switch (section) {
            case 'profile':
                elementRef = profileRef;
                break;
            case 'serviceProvider':
                elementRef = serviceProviderRef;
                break;
            case 'dangerZone':
                elementRef = dangerZoneRef;
                break;
            default:
                window.scrollTo({top: 0, behavior: 'smooth'});
                return;
        }

        if (elementRef && elementRef.current) {
            const navbarHeight = 180;
            const elementTop = elementRef.current.getBoundingClientRect().top + window.scrollY - navbarHeight;

            window.scrollTo({
                top: elementTop,
                behavior: 'smooth'
            });
        }
    };
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
            window.location.reload();

        } catch (error) {
            console.error('Error cancelling subscription:', error);
        }
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
                    {isEditable && !editMode[field] && (
                        <Button onClick={() => handleEditClick(field)}>Edit</Button>
                    )}

                    {isEditable && editMode[field] && (
                        <>
                            <Button
                                onClick={() => {
                                    updateAccountFields(account, field, token, null, fieldValue, setFieldValue).then(() => console.log('Field updated'));
                                    handleEditClick(field)
                                }}>Save</Button>
                            {/*<Button onClick={() => {*/}
                            {/*    handleEditClick(field)*/}
                            {/*}}>Cancel</Button>*/}
                        </>
                    )}
                </Box>
            </Box>
        );
    };

    const getFormattedDate = (timestamp: number) => {
        return formatDateTime(new Date(timestamp * 1000));
    };

    return (
        <Container sx={{
            display: 'flex',
            mt: 4,
            minWidth: '85%',
            maxWidth: '95%',
            margin: '10px',
            padding: '10px',
            borderRadius: 0,
            alignItems: 'flex-start',
            flexDirection: 'row',
            justifyContent: 'space-between'
        }}>
            <List sx={{width: '200px', maxWidth: '20%', mr: '2%', ml: '2%', mt: 5, position: 'fixed'}}>
                <ListItem>
                    <ListItemButton selected={activeSection === 'profile'}
                                    onClick={() => handleNavigation('profile')}
                                    sx={{
                                        color: activeSection === 'profile' ? '#64B5F6' : 'black',
                                        backgroundColor: 'transparent !important',
                                        '&:hover': {
                                            backgroundColor: 'transparent',
                                        }
                                    }}
                    >
                        <Typography variant="body2">Public Profile</Typography>
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton selected={activeSection === 'serviceProvider'}
                                    onClick={() => handleNavigation('serviceProvider')}
                                    sx={{
                                        color: activeSection === 'serviceProvider' ? '#64B5F6' : 'black',
                                        backgroundColor: 'transparent !important',
                                        '&:hover': {
                                            backgroundColor: 'transparent',
                                        }
                                    }}

                    >
                        <Typography variant="body2">Service Provider Settings</Typography>
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton selected={activeSection === 'dangerZone'}
                                    onClick={() => handleNavigation('dangerZone')}
                                    sx={{
                                        color: activeSection === 'dangerZone' ? '#f01e2c' : 'black',
                                        backgroundColor: 'transparent !important',
                                        '&:hover': {
                                            backgroundColor: 'transparent',
                                        }
                                    }}
                    >
                        <Typography variant="body2">Danger Zone</Typography>
                    </ListItemButton>
                </ListItem>
            </List>

            <Box component="main"
                 sx={{flex: '1 1 100%', ml: '20%', minWidth: '70%', maxWidth: '75%', mr: "18%", overflowY: 'auto'}}>

                {/*public profile section*/}
                <Paper ref={profileRef} sx={{p: 3, elevation: 0, width: '100%'}}>
                    <Box>
                        <Box sx={{
                            display: 'flex', flexDirection: 'row', alignItems: 'center',
                            justifyContent: 'space-between', width: '100%'
                        }}>
                            <Typography variant="h6" gutterBottom
                                        sx={{fontWeight: 'bold', fontSize: '24px', color: 'black'}}>
                                Public Profile
                            </Typography>

                            <Tooltip title="Logout" placement={'top'}>
                                <IconButton
                                    onClick={logoutUser}
                                    sx={{
                                        color: '#64B5F6',
                                        backgroundColor: 'white',
                                        '&:hover': {
                                            backgroundColor: '#64B5F6',
                                            color: 'white'
                                        },
                                        borderRadius: '50%',
                                    }}
                                >
                                    <LogoutIcon sx={{strokeWidth: 10}}/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Divider orientation="horizontal" sx={{
                            mt: 0,
                            borderBottomWidth: 3,
                            backgroundColor: 'black',
                            borderColor: "black"
                        }}/>
                    </Box>

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, p: 3, justifyContent: "space-between"}}>

                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 2,
                            width: '100%'
                        }}>
                            <Avatar src={profileImage ? profileImage : undefined}
                                    sx={{width: 80, height: 80}}/>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-around',
                                alignItems: 'flex-start',
                                height: '100%',
                            }}>
                                <LightBlueFileButton
                                    text={"Upload Picture"}
                                    onFileChange={handleProfileImageUpload(setProfileImage, token)}
                                    icon={<FileUploadIcon/>}
                                    // sx={{
                                    //     mb: 1,
                                    //     color: 'black',
                                    //     backgroundColor: 'white',
                                    //     borderColor: 'black',
                                    //     '&:hover': {
                                    //         backgroundColor: 'black',
                                    //         color: 'white',
                                    //         borderColor: 'white'
                                    //     },
                                    // }}
                                />

                                {defaultProfileImage !== profileImage && (
                                    <Button
                                        onClick={() => deleteProfileImage(token, setProfileImage)}
                                        variant="outlined"
                                        size="small"
                                        startIcon={<DeleteIcon/>}
                                        sx={{
                                            color: '#f01e2c',
                                            borderColor: '#f01e2c',
                                            '&:hover': {
                                                backgroundColor: '#f01e2c',
                                                color: 'white',
                                                borderColor: '#f01e2c'
                                            },
                                            height: 35,
                                            width: '100%',
                                            textTransform: 'none',
                                            borderRadius: '20px'
                                        }}
                                    >
                                        Delete Picture
                                    </Button>
                                )}
                            </Box>

                            {isProvider &&
                                <Box sx={{marginLeft: 'auto', display: 'flex', alignItems: 'center'}}>
                                    <LightBlueButton icon={<CalendarMonthIcon style={{marginRight: 2}}/>}
                                                     text={"View My Schedule"}
                                                     sx={{
                                                         padding: '8px 8px', backgroundColor: '#93c5fd',
                                                         display: 'flex',
                                                         alignItems: 'center',
                                                         justifyContent: 'center',
                                                         textDecoration: 'none',
                                                         minWidth: '42px',
                                                         minHeight: '25px'
                                                     }}
                                                     onClick={handleViewScheduleClick}></LightBlueButton>
                                </Box>}
                        </Box>
                        {renderField("User ID", "userId", false)}
                        {renderField("First Name", "firstName", false)}
                        {renderField("Last Name", "lastName", false)}
                        {renderField("Email Address", "email", false)}
                        {renderField("Phone Number", "phoneNumber")}
                        {renderField("Address", "address")}
                        {renderField("Description", "description")}
                    </Box>
                </Paper>

                {/*service provider section*/}
                <Paper ref={serviceProviderRef} sx={{p: 3, elevation: 0}}>
                    <Box>
                        <Typography variant="h6" gutterBottom
                                    sx={{fontWeight: 'bold', fontSize: '24px', color: 'black'}}>
                            Service Provider Settings
                        </Typography>
                        <Divider orientation="horizontal" sx={{
                            mt: -1,
                            borderBottomWidth: 3,
                            backgroundColor: 'black',
                            borderColor: "black"
                        }}/>
                    </Box>

                    {isProvider ? (
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, p: 3}}>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: 0
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold'}}>Provided Services:</Typography>
                                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                                    {services.length > 0 ? (
                                        services.map(service => (
                                            <Grid container alignItems="center" spacing={2} key={service._id}>
                                                <Grid item xs>
                                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                        <Typography
                                                            variant="body1">{service.serviceType}</Typography>
                                                        {service.isCertified && (
                                                            <Typography variant="body2" sx={{
                                                                color: '#388e3c',
                                                                fontWeight: 'bold',
                                                                marginLeft: '10px',
                                                                fontSize: '1rem',
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
                                                    <Button
                                                        onClick={() => handleServiceDeleteOpenDialog(service._id)}
                                                        sx={{color: 'red'}}>Delete</Button>
                                                </Grid>
                                            </Grid>

                                        ))
                                    ) : (
                                        <Typography variant="body1">No services provided</Typography>
                                    )}
                                </Box>
                                <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 4}}>
                                    <BlueButton text="Add A Service" sx={{backgroundColor: '#93c5fd'}}
                                                onClick={handleAddServiceClick}/>
                                </Box>
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: 0
                            }}>
                                <Typography variant="h6" sx={{fontWeight: 'bold'}}>Subscription
                                    Information:</Typography>
                                {subscriptions.length > 0 ? (
                                    subscriptions.map((subscription) => (
                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Box key={subscription.id}
                                                 sx={{display: 'flex', flexDirection: 'column', mt: 2}}>
                                                <Typography
                                                    variant="body1"><strong>Status:</strong> {subscription.status}
                                                </Typography>
                                                <Typography variant="body1"><strong>Expiration
                                                    Date:</strong> {getFormattedDate(subscription.current_period_end)}
                                                </Typography>
                                            </Box>
                                            {
                                                subscription.status !== 'canceled' && (
                                                    <Button onClick={() => cancelSubscription(subscription.id)}
                                                            sx={{mt: 1, color: 'red'}}>Cancel Subscription</Button>
                                                )
                                            }
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body1">No active subscriptions</Typography>
                                )}
                            </Box>
                        </Box>) : (
                        <>
                            <Typography variant="h6" sx={{}}>You are not a provider yet.</Typography>
                            <Box sx={{display: 'flex', justifyContent: 'flex-start', mt: 2}}>
                                <BlueButton text="Click here to add your first offering"
                                            onClick={handleAddServiceClick}/>
                            </Box>
                        </>
                    )
                    }
                </Paper>

                <Paper ref={dangerZoneRef} sx={{p: 3, elevation: 0}}>
                    <Box>
                        <Typography variant="h6" gutterBottom
                                    sx={{fontWeight: 'bold', fontSize: '24px', color: '#f01e2c'}}>
                            Danger Zone
                        </Typography>
                        <Divider orientation="horizontal" sx={{
                            mt: -1,
                            borderBottomWidth: 3,
                            backgroundColor: 'black',
                            borderColor: "black"
                        }}/>
                    </Box>

                    <Typography sx={{mt: 2}}>
                        <strong>Heads Up!</strong> Deleting your account is permanent and cannot be reversed. Please be
                        certrain before you proceed.
                    </Typography>

                    <Button onClick={handleDeleteAccountOpenDialog}
                            sx={{
                                backgroundColor: '#f01e2c', color: 'white',
                                '&:hover': {
                                    backgroundColor: '#b71c1c',
                                },
                                fontWeight: 'bold',
                                mt: 2, mb: 10, width: '30%', borderRadius: '20px'
                            }}>
                        Delete Account
                    </Button>
                </Paper>
            </Box>

            <Card sx={{
                maxWidth: '15%',
                mt: 10,
                position: 'fixed',
                top: 80,
                right: '3%',
                width: '15%',
                border: '1px solid #ccc',
                boxShadow: 2
            }}>
                <CardContent>
                    <Box sx={{display: 'flex', alignItems: 'center', marginBottom: 1}}>
                        <HelpOutlineIcon sx={{marginRight: 1, color: 'black', fontSize: '2rem'}}/>
                        <Typography variant="h6" component="div">
                            Need help?
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Check out the <RouterLink to="/faq" style={{color: 'inherit'}}> FAQ page</RouterLink> or <Link
                        href="mailto:servicehub.seba22@gmail.com" style={{color: 'inherit'}}>contact us</Link>.
                    </Typography>
                </CardContent>
            </Card>

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

            <ConfirmDeleteDialog
                open={openServiceDeleteDialog}
                onClose={handleServiceDeleteCloseDialog}
                onConfirm={handleDeleteServiceClick}
                message="Are you sure you want to delete this service?"
                isDeleteAccount={false}
            />

            <ConfirmDeleteDialog
                open={openDeleteAccountDialog}
                onClose={handleDeleteAccountCloseDialog}
                onConfirm={handleConfirmDeleteAccount}
                message="Are you sure you want to delete your account?"
                isDeleteAccount={true}
            />
        </Container>
    );
}

export default UserProfile;
