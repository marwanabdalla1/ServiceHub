import React from 'react';
import { styled } from "@mui/system";

export interface ButtonProps {
    text: string;
    className?: string;
    onClick: () => void;
    sx?: any;
    disabled?: boolean;  // Add disabled property
}

export const StyledButton = styled('button')(({ sx }) => ({
    ...sx
}));

function BlackButton({ text, className = '', onClick, sx, disabled }: ButtonProps) {
    return (
        <StyledButton
        className={`bg-customBlack text-white font-semibold text-xs rounded-full shadow hover:bg-gray-500 max-h-8 whitespace-nowrap `}
        onClick={onClick}
        sx={{
            ...sx,
            display: 'flex', // Use flexbox for centering
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none', // Ensure no underline
            minWidth: '42px',
            minHeight: '25px',
        }}
            disabled={disabled}
        >
            {text}
        </StyledButton>
    );
}

export default BlackButton;
