import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
    Container, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Typography, TextField, Button, Grid, Box
} from '@mui/material';
import {useAuth} from "../../../contexts/AuthContext";
import {useNavigate} from "react-router-dom";
import {deleteAccount} from "../../../services/accountService";
import ConfirmDeleteDialog from "../../../components/dialogs/ConfirmDeleteDialog";
import {toast} from "react-toastify";

interface Account {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdOn: string;
    _id: string;
}

export default function AdminUserData(): React.ReactElement {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [filters, setFilters] = useState({
        email: '',
        firstName: '',
        lastName: '',
        accountId: ''
    });
    const [openDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    const {isAdmin, token, account} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token || !account || !isAdmin()) {
            navigate('/unauthorized');
        }

        fetchUsers();
    }, [token, account]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/account/admin/userdata', {
                params: filters,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setAccounts(response.data);
        } catch (error) {
            console.error('Error fetching user data', error);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleDelete = (account: Account) => {
        setSelectedAccount(account);
        setOpenDeleteAccountDialog(true);
    };

    const handleDeleteAccountCloseDialog = () => {
        setOpenDeleteAccountDialog(false);
        setSelectedAccount(null);
    };

    const handleConfirmDeleteAccount = async (email?: string) => {
        if (email === selectedAccount?.email) {
            try {
                if (token && selectedAccount) {
                    await deleteAccount(token, selectedAccount._id);
                    // Refresh the user list after deletion
                    await fetchUsers();
                }
            } catch (error) {
                toast.error('Error deleting user data.');
            }
        } else {
            toast.error("Emails do not match");
            return;
        }
        setOpenDeleteAccountDialog(false);
        setSelectedAccount(null);
    };

    const handleView = (accountId: string) => {
        console.log('View user data:', accountId);
        navigate('/admin/viewUserData', {state: {accountId}});
    };

    return (
        <Container component="main" maxWidth="lg" sx={{mt: 4}}>
            <Typography variant="h6" gutterBottom sx={{fontWeight: 'bold', fontSize: '30px', color: '#007BFF'}}>
                User Data
            </Typography>
            <form onSubmit={handleFilterSubmit}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3}>
                        <TextField
                            name="email"
                            label="Email"
                            value={filters.email}
                            onChange={handleFilterChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField
                            name="firstName"
                            label="First Name"
                            value={filters.firstName}
                            onChange={handleFilterChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField
                            name="lastName"
                            label="Last Name"
                            value={filters.lastName}
                            onChange={handleFilterChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField
                            name="accountId"
                            label="Account ID"
                            value={filters.accountId}
                            onChange={handleFilterChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary">
                            Filter
                        </Button>
                    </Grid>
                </Grid>
            </form>
            <TableContainer component={Paper} sx={{marginTop: 4}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Email</TableCell>
                            <TableCell align="center">First Name</TableCell>
                            <TableCell align="center">Last Name</TableCell>
                            <TableCell align="center">Created At</TableCell>
                            <TableCell align="center">Account ID</TableCell>
                            <TableCell align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {accounts.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell align="center">{user.email}</TableCell>
                                <TableCell align="center">{user.firstName}</TableCell>
                                <TableCell align="center">{user.lastName}</TableCell>
                                <TableCell align="center">{new Date(user.createdOn).toLocaleDateString()}</TableCell>
                                <TableCell align="center">{user._id}</TableCell>
                                <TableCell align="center">
                                    <Box textAlign="center">
                                        <Button onClick={() => handleView(user._id)} variant="contained" color="primary"
                                                style={{marginRight: '20px'}}>
                                            View
                                        </Button>
                                        <Button onClick={() => handleDelete(user)} variant="contained"
                                                color="error">
                                            Delete
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {selectedAccount && (
                <ConfirmDeleteDialog
                    open={openDeleteAccountDialog}
                    onClose={handleDeleteAccountCloseDialog}
                    onConfirm={handleConfirmDeleteAccount}
                    message="Are you sure you want to delete this account?"
                    isDeleteAccount={true}
                />
            )}
        </Container>
    );
};

