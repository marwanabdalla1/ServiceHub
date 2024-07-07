import React from 'react';
import { Container, Button, Box, Typography, Grid, Link as MuiLink} from '@mui/material';
import FAQAccordion from '../components/FAQAccordion';
import FeedbackForm from "../components/FeedbackForm"; // Import the reusable component

const FAQPage = () => {
    // example FAQs
    const faqs = [
        { question: "What is ServiceHub?", answer: "Service Hub is a platform to help connect service consumers and service providers to bridge the gap between the demand and supply of basic services that can be offered by individuals for compensation by offering a one-stop platform where services can be listed, compared and booked." },
        { question: "Who can be a provider? How to provide a service?", answer: "To become a service provider, you have two options: click the 'Provide a Service' button in the navigation bar if you haven't provided a service before, or go to your profile and click 'Add a Service' in the Service Provider Settings section." },
        { question: "What is upgrading to Pro?", answer: "By upgrading to Pro to make sure that your service offerings get more visibility, by appearing at the top of the search results." },
        { question: "How do I book an appointment?", answer: "To book an appointment, simply click on a service offering, fill out your personal information, and choose an available time slot from the provider and confirm." },
        { question: "What payment methods are available?", answer: "Every provider can indicate which payment methods the prefer. The available options are cash, PayPal and bank transfer." },
        { question: "Which services can be offered on Service Hub?", answer: "The service that are currently available on Service Hub are: petsitting, babysitting, bike repair, cleaning, moving, tutoring, landscaping, and remodeling." },
        { question: "What does the 'licensed' tag next to a service offering mean?", answer: "The 'licensed' tag indicates that the provider has an official certification, enhancing their qualifications for the service they offer." },
    ];

    return (

        <Container maxWidth="lg">
            <Grid container spacing={2} sx={{ mt: 4, mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Typography variant="h4" gutterBottom>
                        Frequently Asked Questions
                    </Typography>
                    {/*todo: change the email*/}
                    <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>
                            Got more questions? Feel free to contact us for more information.
                        </Typography>
                        <Button variant="contained" color="primary" href="mailto:servicehub.seba22@yoursite.com">
                            Contact us
                        </Button>
                    <Box sx={{ mt: 5}}>
                        <Typography variant="subtitle1" sx={{  }}>
                                Enjoyed ServiceHub? Or have some suggestions to tell us? We would love to hear your feedback!
                            </Typography>
                        <FeedbackForm />
                    </Box>

                    </Box>
                </Grid>
                <Grid item xs={12} md={8} sx={{ overflowY: 'auto', maxHeight: '100vh' }}>
                    {/*{faqs.map((faq, index) => (*/}
                    {/*    <FAQAccordion key={index} question={faq.question} answer={faq.answer} />*/}
                    {/*))}*/}
                    {faqs.map((faq, index) => (
                        <FAQAccordion key={index} question={faq.question} answer={faq.answer.split('\n').map((line, idx) => (
                            <span key={idx}>{line}<br /></span>
                        ))} />
                    ))}
                </Grid>
            </Grid>
        </Container>
    );
};

export default FAQPage;
