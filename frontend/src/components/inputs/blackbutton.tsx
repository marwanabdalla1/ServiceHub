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
            className={`bg-customBlack text-white font-semibold text-xs px-2 py-2 rounded-full shadow hover:bg-gray-500 hover:text-customBlack! max-h-8 whitespace-nowrap ${className}`}
            onClick={onClick}
            sx={sx}
            disabled={disabled}
        >
            {text}
        </StyledButton>
    );
}

export default BlackButton;
