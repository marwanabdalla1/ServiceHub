import React from 'react';
import { Box, Container, Link as MuiLink, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';


const Footer: React.FC = () => {
  return (
      <Box component="footer" sx={{ bgcolor: 'white', color: '#2B2E4A', mt: 'auto', py: 1 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <MuiLink component={RouterLink} to="/faq" color='#000000' sx={{ mr: 2 }}>
              FAQs
            </MuiLink>
            <MuiLink href="mailto:servicehub.seba22@gmail.com" color='#000000'>
              Contact Us
            </MuiLink>
          </Box>
          <Copyright />
        </Container>
      </Box>
  );
};

export default Footer;

export function Copyright(props: React.PropsWithChildren<{}>) {
  return (
      <Typography variant="body2" color="text.secondary" align="center" {...props}>
        {'Copyright © '}
        <MuiLink color="inherit" href="/">
          ServiceHub
        </MuiLink>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
  );
}