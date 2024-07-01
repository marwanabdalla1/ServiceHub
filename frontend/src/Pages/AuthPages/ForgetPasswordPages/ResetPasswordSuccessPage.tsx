import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {blue} from '@mui/material/colors';
import {useNavigate} from 'react-router-dom';

const defaultTheme = createTheme({
    palette: {
        primary: {
            main: blue[300],
        },
    },
});

export default function ResetPasswordSuccess() {
    const navigate = useNavigate();

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs" sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh'
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
                    <Typography component="h1" variant="h5" sx={{mt: 2}}>
                        Password Reset Successful
                    </Typography>
                    <Typography component="p" variant="body2" align="center" sx={{mt: 1}}>
                        Your password has been successfully reset. You can now use your new password to log in.
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{mt: 3, mb: 2, height: '40px', width: '80%'}}
                        onClick={handleLoginRedirect}
                    >
                        Go to Login
                    </Button>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
