import React from 'react';
import { Container, Button, Box, Typography, Grid, Link as MuiLink} from '@mui/material';
import FAQAccordion from '../components/FAQAccordion';
import FeedbackForm from "../components/FeedbackForm"; // Import the reusable component

const FAQPage = () => {
    // example FAQs
    const faqs = [
        { question: "What is ServiceHub?", answer: "Here's how you can manage..." },
        { question: "Who can be a provider? How to provide a service?", answer: "" },
        { question: "What is upgrading to Pro?", answer: "" },
        { question: "How do I book an appointment?", answer: "" },
        { question: "How do I reschedule or cancel an appointment?",
            answer: "normal way: ... \n" +
                    "in case of emergency, please contact your provider/consumer directly via the number they provide blablablabl"},
        { question: "How do I ?", answer: "" },


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
                        <Button variant="contained" color="primary" href="mailto:support@yoursite.com">
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
