/**
 * This code is derived from the Material-UI template for a sign-in page.
 * The original template can be found in the Material-UI GitHub repository at:
 * https://github.com/mui/material-ui/tree/v5.15.18/docs/data/material/getting-started/templates/sign-in
 *
 * The purpose of this code is to provide a user interface for users to sign in to the application.
 * It includes form fields for user details and a submission button.
 */

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {blue} from "@mui/material/colors";
import axios from 'axios';
import {useAuth} from "../../../contexts/AuthContext";
import {useLocation, useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {useRecovery} from "../../../contexts/RecoveryContext";
import {checkEmptyFields} from "../../../validators/GeneralValidator";
import {isValidEmail, isValidName} from "../../../validators/AccountDataValidator";
import {IconButton, InputAdornment} from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import {useState} from "react";

interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

const defaultTheme = createTheme({
    palette: {
        primary: {
            main: blue[300], // set primary color to blue 300
        },
    },
});

export default function SignUp() {
    const {registerUser} = useAuth();
    const location = useLocation();
    const {from} = location.state || {from: {pathname: "/"}};
    const navigate = useNavigate();
    const {createAccountEmail} = useRecovery();

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const repeatPassword = formData.get('repeatPassword') as string;

        try {
            if (checkEmptyFields(firstName, 'First Name') || checkEmptyFields(lastName, 'Last Name') ||
                checkEmptyFields(email, 'Email') || checkEmptyFields(password, 'Password') ||
                checkEmptyFields(repeatPassword, 'Repeat Password')) {
                return;
            }

            if (!isValidName(firstName)) {
                toast.error('First Name should not contain numbers or invalid characters.');
                return;
            }

            if (!isValidName(lastName)) {
                toast.error('Last Name should not contain numbers or invalid characters.');
                return;
            }

            if (!isValidEmail(email)) {
                toast.error('Invalid email format.');
                return;
            }

            // TODO: Add password validation

            if (password !== repeatPassword) {
                toast.error('Passwords do not match.');
                return;
            }
            const data: UserData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password
            };
            await registerUser(data);
            navigate('/');

        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.error);
            }
        }
    };


    const handleLogoClick = () => {
        navigate('/');  // Navigate to the homepage
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline/>
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{bgcolor: 'primary.main'}} onClick={handleLogoClick}>
                        <img src="/images/logo_short.png" alt="Logo" className="md:h-6"/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign up
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{mt: 3}}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoComplete="given-name"
                                    name="firstName"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="family-name"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    autoComplete="new-password"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="repeatPassword"
                                    label="Repeat Password"
                                    type={showPassword ? "text" : "password"}
                                    id="repeatPassword"
                                    autoComplete="new-password"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                        >
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="login" variant="body2">
                                    Already have an account? Login
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}