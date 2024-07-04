import * as React from 'react';
import {createRef, PropsWithChildren} from 'react';
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
import {blue} from "@mui/material/colors";
import {useNavigate} from "react-router-dom";
import {useRecovery} from "../../../contexts/RecoveryContext";
import {toast} from "react-toastify";

function Copyright(props: PropsWithChildren<{}>) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://mui.com/">
                Service Hub
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const defaultTheme = createTheme({
    palette: {
        primary: {
            main: blue[300], // set primary color to blue 300
        },
    },
});

export default function EmailVerification() {
    const navigate = useNavigate();
    const refs = Array.from({length: 4}).map(() => createRef<HTMLInputElement>());
    const {otp, email, resetPasswordEmail} = useRecovery();

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, index: number) => {
        if (event.target.value.length === 1 && index < refs.length - 1) {
            refs[index + 1].current?.focus();
        }
    };

    const handleResendOTP = async () => {
        try {
            await resetPasswordEmail(email);
        } catch (error) {
            console.error('There was an error resending the OTP', error);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const input_otp = Array.from({length: 4}, (_, i) => data.get(`digit-${i + 1}`)).join('');

        try {
            if (input_otp === otp) {
                navigate('/forgetPassword/resetPassword');
            } else {
                console.error("Invalid OTP");
                toast("Invalid OTP");
            }

        } catch (error) {
            console.error("There was an error verifying the OTP", error);
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs" sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh' // Center the container vertically
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
                        Email Verification
                    </Typography>
                    <Typography component="p" variant="body2" align="center">
                        We have sent a code to your email {email}
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
                        <Box sx={{display: 'flex', justifyContent: 'center'}}>
                            {Array.from({length: 4}).map((_, index) => (
                                <TextField
                                    key={index}
                                    margin="normal"
                                    required
                                    id={`digit-${index + 1}`}
                                    name={`digit-${index + 1}`}
                                    inputProps={{maxLength: 1, style: {textAlign: 'center'}}}
                                    sx={{width: '3rem', mx: '0.5rem'}}
                                    inputRef={refs[index]}
                                    onChange={(event) => handleChange(event, index)}
                                />
                            ))}
                        </Box>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                        >
                            Verify Account
                        </Button>
                    </Box>
                    <Grid container justifyContent="center">
                        <Grid item>
                            <Link href="#" variant="body2" onClick={handleResendOTP}>
                                Didn't receive code? Resend OTP
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{mt: 8, mb: 4}}>
                    <Copyright/>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
