import React from 'react';
import {Container, Button, Box, Typography, Grid, Link as MuiLink, Divider} from '@mui/material';
import FAQAccordion from '../components/FAQAccordion';
import FeedbackForm from "../components/FeedbackForm";

const FAQPage = () => {
    const faqs = [
        {
            question: "What is ServiceHub?",
            answer: "ServiceHub is a platform designed to connect service consumers with service providers. It bridges the gap between the demand and supply of basic services that can be offered by individuals for compensation. By offering a one-stop platform, ServiceHub allows users to list, compare, and book various services with ease."
        },
        {
            question: "Who can be a provider? How to provide a service?",
            answer: "To become a service provider, you have two options: click the 'Provide a Service' button in the navigation bar if you haven't provided a service before, or go to your profile and click 'Add a Service' in the Service Provider Settings section."
        },
        {
            question: "What does it mean to upgrate to Pro?",
            answer: "By upgrading to Pro to make sure that your service offerings get more visibility, by appearing at the top of the search results."
        },
        {
            question: "How do I book an appointment?",
            answer: "To book an appointment, simply click on a service offering, fill out your personal information, and choose an available time slot from the provider and confirm."
        },
        {
            question: "What payment methods are available?",
            answer: "Every provider can indicate which payment methods the prefer. The available options are cash, PayPal and bank transfer."
        },
        {
            question: "Which services can be offered on Service Hub?",
            answer: "The service that are currently available on Service Hub are: petsitting, babysitting, bike repair, cleaning, moving, tutoring, landscaping, and remodeling."
        },
        {
            question: "What does the 'licensed' tag next to a service offering mean?",
            answer: "The 'licensed' tag indicates that the provider has an official certification, enhancing their qualifications for the service they offer."
        },
        {
            question: "Why can't I find my city?",
            answer: "We currently offer services only in specific cities within Germany. If your city does not appear in the filter options, it means we do not provide services in that location at this time. If your city is on the list but there are no service offerings in the area, you can always be the first one to provide a service in the city!"
        },
    ];

    return (
        <Container maxWidth="lg">
            <Grid container spacing={2} sx={{mt: 4, mb: 4}}>
                {/* FAQs Section */}
                <Grid item xs={12}>
                    <Typography variant="h4" gutterBottom>
                        Frequently Asked Questions
                    </Typography>
                    <Divider sx={{mb: 4}}/>
                    {faqs.map((faq, index) => (
                        <FAQAccordion key={index} question={faq.question}
                                      answer={faq.answer.split('\n').map((line, idx) => (
                                          <span key={idx}>{line}<br/></span>
                                      ))}/>
                    ))}
                </Grid>

                {/* Contact Us and Provide Feedback Section */}
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            mt: 4,
                            ml: '0.5cm'
                        }}>
                            <Typography variant="subtitle1" sx={{mb: 2}}>
                                Got more questions? Feel free to contact us for more information.
                            </Typography>
                            <Button variant="contained" color="primary" href="mailto:servicehub.seba22@gmail.com">
                                Contact us
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mt: 4}}>
                            <Typography variant="subtitle1">
                                Enjoyed ServiceHub? Or have some suggestions to tell us? We would love to hear your
                                feedback!
                            </Typography>
                            <FeedbackForm/>
                        </Box>
                    </Grid>
                </Grid>

            </Grid>
        </Container>
    );
};

export default FAQPage;
