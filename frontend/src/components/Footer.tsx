import React from 'react';
import { Box, Container, Link as MuiLink, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'white', color: '#2B2E4A', mt: 'auto', py: 1 }}>
      <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MuiLink component={RouterLink} to="/faq" color='#93C5FD' sx={{ mr: 2 }}>
            FAQs
          </MuiLink>
          <MuiLink href="mailto:servicehub.seba22@gmail.com" color='#93C5FD'>
            Contact Us
          </MuiLink>
        </Box>
        <Typography variant="body2" color='#93C5FD' sx={{ mt: 1 }}>
          © {new Date().getFullYear()} ServiceHub
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
