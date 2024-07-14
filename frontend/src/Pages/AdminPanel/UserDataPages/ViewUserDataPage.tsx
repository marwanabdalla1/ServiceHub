import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Paper,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { isValidPhoneNumber } from '../../../validators/AccountDataValidator';
import AddressDialog from '../../../components/dialogs/AddressDialog';
import { useAuth } from '../../../contexts/AuthContext';
import { loadAccount, saveAddress, updateAccountFields } from '../../../services/accountService';
import { deleteService } from '../../../services/serviceOfferingService';
import BlueButton from "../../../components/inputs/BlueButton";

type EditModeType = {
    [key: string]: boolean;
};

type FieldType = {
    [key: string]: string;
};

export default function ViewUserData(): React.ReactElement {
    const location = useLocation();
    const accountId = location.state?.accountId;
    const [account, setAccount] = useState<any>(null);
    const { token } = useAuth();
    const [services, setServices] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openAddressDialog, setOpenAddressDialog] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
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
        const fetchData = async () => {
            if (token && accountId) {
                try {
                    const data = await loadAccount(token, accountId);
                    if (JSON.stringify(data) !== JSON.stringify(account)) {
                        setAccount(data);
                    }
                } catch (error) {
                    console.error('Error fetching account details:', error);
                }
            }
        };
        fetchData();
    }, [token, accountId, account]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get(`/api/offerings/admin/userServiceOfferings/${accountId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setServices(response.data || []);
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };
        fetchServices();
    }, [token, accountId]);

    useEffect(() => {
        if (account) {
            const { address, postal, location } = account;
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
        setEditMode(prevState => ({ ...prevState, [field]: !prevState[field] }));
    };

    const handleFieldChange = (field: string, newValue: string) => {
        setFieldValue(prevState => ({ ...prevState, [field]: newValue }));
    };

    const handleSaveAddress = async (updatedAddress: {
        address: string;
        postal: string;
        location: string;
    }) => {
        await saveAddress(updatedAddress, account, token, accountId, setAccount);
        setOpenAddressDialog(false);
    };

    const handleKeyPress = (event: React.KeyboardEvent, field: string) => {
        if (event.key === 'Enter') {
            updateAccountFields(account, field, token, accountId, fieldValue, setFieldValue).then(() => console.log('Field saved'));
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
        if (serviceToDelete && token) {
            try {
                await deleteService(serviceToDelete, token, services, setServices);
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

    const renderField = (label: string, field: string, isEditable: boolean = true) => {
        if (field === 'address') {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 0 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{label}:</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1">{fieldValue[field]}</Typography>
                        <Button onClick={() => setOpenAddressDialog(true)}>Edit</Button>
                    </Box>
                </Box>
            );
        }
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
                    {isEditable && (
                        <Button onClick={() => handleEditClick(field)}>Edit</Button>
                    )}
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
                    {renderField("User ID", "userId")}
                    {renderField("First Name", "firstName")}
                    {renderField("Last Name", "lastName")}
                    {renderField("Email Address", "email")}
                    {renderField("Phone Number", "phoneNumber")}
                    {renderField("Address", "address")}
                    {renderField("Description", "description")}
                    {account?.isProvider && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold', fontSize: '24px', color: '#007BFF' }}>
                                Service Provider Settings
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 0 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Provided Services:</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    {services.length > 0 ? (
                                        services.map(service => (
                                            <Grid container alignItems="center" spacing={2} key={service._id}>
                                                <Grid item xs>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                                                    <Button onClick={() => handleOpenDialog(service._id)} sx={{ color: 'red' }}>Delete</Button>
                                                </Grid>
                                            </Grid>
                                        ))
                                    ) : (
                                        <Typography variant="body1">No services provided</Typography>
                                    )}
                                </Box>
                            </Box>
                        </>
                    )}
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
