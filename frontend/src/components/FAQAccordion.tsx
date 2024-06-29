import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface FAQAccordionProps {
    question: string;
    answer: string;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ question, answer }) => {
    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>{question}</Typography>
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
