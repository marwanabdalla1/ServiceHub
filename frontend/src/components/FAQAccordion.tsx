import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface FAQAccordionProps {
    question: string;
    answer: React.ReactNode;  
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ question, answer }) => {
    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography style={{ fontWeight: 'bold' }}>{question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography style={{ wordWrap: 'break-word', maxHeight: '200px', overflowY: 'auto' }}>
                    {answer}
                </Typography>
            </AccordionDetails>
        </Accordion>
    );
};

export default FAQAccordion;
