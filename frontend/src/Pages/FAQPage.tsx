import React from 'react';
import { Container, Button, Box, Typography, Grid, Link as MuiLink} from '@mui/material';
import FAQAccordion from '../components/FAQAccordion';
import FeedbackForm from "../components/FeedbackForm"; // Import the reusable component

const FAQPage = () => {
    // example FAQs
    const faqs = [
        { question: "What is ServiceHub?", answer: "Here's how you can manage..." },
        { question: "What does it mean to be a part of our booking platform?", answer: "Being a part of our platform means..." },
        // Add more FAQs as needed
    ];

    return (
        // <Container maxWidth="md">
        //     <Box sx={{ my: 4, textAlign: 'center' }}>
        //         <Typography variant="h4" component="h1" gutterBottom>
        //             FAQs
        //         </Typography>
        //         <Typography variant="subtitle1" color="textSecondary">
        //             Have questions? Here you'll find the answers most valued by our users.
        //         </Typography>
        //     </Box>
        //     <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        //         <Button variant="outlined" color="primary" href="/feedback-form">
        //             Provide Feedback
        //         </Button>
        //
        //
        //     </Box>
        //     <Box sx={{ my: 4 }}>
        //         {faqs.map((faq, index) => (
        //             <FAQAccordion key={index} question={faq.question} answer={faq.answer} />
        //         ))}
        //     </Box>
        //
        //     <Typography variant="subtitle1" color="textSecondary">
        //         Couldn't find your question? Feel free to <MuiLink href="mailto:support@example.com" underline="hover">
        //         contact us! </MuiLink>
        //     </Typography>
        //     {/*<Button variant="contained" color="primary" href="mailto:support@yoursite.com">*/}
        //     {/*    Contact Us*/}
        //     {/*</Button>*/}
        // </Container>

        <Container maxWidth="lg">
            <Grid container spacing={2} sx={{ mt: 4, mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Typography variant="h4" gutterBottom>
                        Frequently Asked Questions
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Got more questions? Feel free to contact us for more information.
                    </Typography>
                    {/*todo: change the email*/}
                    <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Button variant="contained" color="primary" href="mailto:support@yoursite.com">
                        Contact us
                    </Button>
                    <FeedbackForm />
                    </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                    {faqs.map((faq, index) => (
                        <FAQAccordion key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </Grid>
            </Grid>
        </Container>
    );
};

export default FAQPage;
