import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
    Container, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Typography, TextField, Button, Grid
} from '@mui/material';
import {useAuth} from "../../contexts/AuthContext";

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
    const {token} = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

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

    return (
        <Container component="main" maxWidth="md" sx={{mt: 4}}>
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
                            <TableCell align="center">Role</TableCell>
                            <TableCell align="center">Created At</TableCell>
                            <TableCell align="center">Account ID</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {accounts.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell align="center">{user.email}</TableCell>
                                <TableCell align="center">{user.firstName}</TableCell>
                                <TableCell align="center">{user.lastName}</TableCell>
                                <TableCell align="center">{user.role}</TableCell>
                                <TableCell align="center">{new Date(user.createdOn).toLocaleDateString()}</TableCell>
                                <TableCell align="center">{user._id}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

        </Container>
    );
};

