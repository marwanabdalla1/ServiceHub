import * as React from 'react';
import {useState} from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {blue} from '@mui/material/colors';
import {useNavigate} from 'react-router-dom';
import {useRecovery} from "../../../contexts/RecoveryContext";
import {toast} from "react-toastify";
import axios from "axios";

const defaultTheme = createTheme({
    palette: {
        primary: {
            main: blue[300],
        },
    },
});

export default function ForgetPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const {resetPasswordEmail} = useRecovery();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Check if email is not empty
        if (email.trim() === '') {
            console.log('Email is empty');
            toast.error('Email is required');
            return;
        }

        try {
            resetPasswordEmail(email);
            // Only navigate if resetPasswordEmail does not throw an error
            navigate('/forgetPassword/emailVerification', {state: {email}});
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                toast.error("No account exists with this email.");
            } else {
                toast.error('There was an error sending the reset password email');
            }
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs" sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '40vh'
            }}>
                <CssBaseline/>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{bgcolor: 'primary.main'}}>
                        <img src="/images/logo_short.png" alt="Logo" className="md:h-6"/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Reset Password
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                        >
                            Verify Email
                        </Button>
                    </Box>
                    <Grid container justifyContent="center">
                        <Grid item>
                            <Link href="/login" variant="body2">
                                Back to Login
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
