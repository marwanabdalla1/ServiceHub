import React, {useEffect} from 'react';
import {Container, Typography, Grid, Paper, Button} from '@mui/material';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from "../../contexts/AuthContext";

const AdminHomePage: React.FC = () => {

    const {isAdmin, token, account} = useAuth();
    const navigate = useNavigate();

    // admin panel
    useEffect(() => {
        if (!token || (account && !isAdmin())) {
            navigate('/unauthorized');
        }
    }, [token, account]);

    return (
        <Container component="main" maxWidth="md" sx={{mt: 4}}>
            <Typography variant="h6" gutterBottom sx={{fontWeight: 'bold', fontSize: '36px', color: '#007BFF'}}>
                Welcome Admin
            </Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Paper className="p-4">
                        <Typography variant="h5" component="h2" gutterBottom>
                            Verify Certificates
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            View and verify user certificates.
                        </Typography>
                        <Button variant="contained" color="primary" component={Link} to="/admin/verifyCertificate">
                            Go to Verify Certificates
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper className="p-4">
                        <Typography variant="h5" component="h2" gutterBottom>
                            User Data
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            View and manage user data.
                        </Typography>
                        <Button variant="contained" color="primary" component={Link} to="/admin/userData">
                            Go to User Data
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminHomePage;
