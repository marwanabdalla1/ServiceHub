import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface FAQAccordionProps {
    question: string;
    answer: React.ReactNode;  // Update this to accept React nodes
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ question, answer }) => {
    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography style={{ /*fontStyle: 'italic'*/ }}>{question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography>
                    {answer}
                </Typography>
            </AccordionDetails>
        </Accordion>
    );
};

export default FAQAccordion;
