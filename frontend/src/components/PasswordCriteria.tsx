import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface PasswordCriteriaProps {
    password: string;
}

const PasswordCriteria: React.FC<PasswordCriteriaProps> = ({password}) => {
    const criteria = [
        {label: 'At least 6 characters long', regex: /.{6,}/},
        {label: 'At least 1 number (0-9)', regex: /\d/},
        {label: 'At least 1 lowercase letter (a-z)', regex: /[a-z]/},
        {label: 'At least 1 uppercase letter (A-Z)', regex: /[A-Z]/},
        {label: 'At least 1 special symbol (!@#$%^&*?)', regex: /[!@#$%^&*? ]/},
    ];

    return (
        <Box sx={{mt: 2}}>
            <Typography variant="subtitle1" gutterBottom>Password should be:</Typography>
            <ul style={{listStyleType: 'none', padding: 0, margin: 0}}>
                {criteria.map((criterion, index) => (
                    <li key={index} style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                        {criterion.regex.test(password) ? (
                            <CheckIcon style={{color: 'green', marginRight: '8px'}}/>
                        ) : (
                            <CloseIcon style={{color: 'red', marginRight: '8px'}}/>
                        )}
                        <Typography variant="body2">{criterion.label}</Typography>
                    </li>
                ))}
            </ul>
        </Box>
    );
};

export default PasswordCriteria;
