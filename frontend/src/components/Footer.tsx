import React from 'react';
import { Box, Container, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ bgcolor: '#90CAF9', color: '#2B2E4A', mt: 'auto', py: 1 }}>
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <MuiLink component={RouterLink} to="/faq" color="inherit" sx={{ mr: 2 }}>
          FAQs
        </MuiLink>
        <MuiLink href="mailto:servicehub.seba22@gmail.com" color="inherit">
          Contact Us
        </MuiLink>
      </Container>
    </Box>
  );
};

export default Footer;
