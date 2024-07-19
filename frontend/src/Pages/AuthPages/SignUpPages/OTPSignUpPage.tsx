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
import {useLocation, useNavigate} from "react-router-dom";
import {useRecovery} from "../../../contexts/RecoveryContext";
import {toast} from "react-toastify";
import {useAuth} from "../../../contexts/AuthContext";

const defaultTheme = createTheme({
    palette: {
        primary: {
            main: blue[300], // set primary color to blue 300
        },
    },
});

interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export default function EmailVerification() {
    const navigate = useNavigate();
    const location = useLocation();

    const firstName = location.state.firstName;
    const lastName = location.state.lastName;
    const email = location.state.email;
    const password = location.state.password;

    const {registerUser} = useAuth();
    const refs = Array.from({length: 4}).map(() => createRef<HTMLInputElement>());
    const {otp, createAccountEmail, timer} = useRecovery();
    const [isTimerVisible, setIsTimerVisible] = React.useState(true);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, index: number) => {
        if (event.target.value.length === 1 && index < refs.length - 1) {
            refs[index + 1].current?.focus();
        }
    };

    const handleResendOTP = async () => {
        try {
            await createAccountEmail(email, firstName);
            setIsTimerVisible(true);
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
                const data: UserData = {
                    firstName: location.state.firstName,
                    lastName: location.state.lastName,
                    email: location.state.email,
                    password: location.state.password
                };
                await registerUser(data);
                navigate('/');
            } else {
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
                minHeight: '50vh' // Center the container vertically
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
                        We have sent a code to your email {location.state.email}
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
                        {isTimerVisible && timer > 0 && timer < 180 && (
                            <Typography component="p" variant="body2" align="center">
                                Time left for OTP verification: {timer} seconds
                            </Typography>
                        )}
                    </Box>
                    <Grid container justifyContent="center">
                        <Grid item>
                            <Link href="#" variant="body2" onClick={handleResendOTP}>
                                Didn't receive code? Resend OTP
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
