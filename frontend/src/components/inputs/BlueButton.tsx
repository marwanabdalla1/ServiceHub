import React from 'react';
import { ButtonProps } from './blackbutton';
import { StyledButton } from './blackbutton';

interface LightBlueButtonProps extends ButtonProps {}

const LightBlueButton: React.FC<LightBlueButtonProps> = ({ text, className = '', onClick, sx, disabled }) => {
    return (
        <StyledButton
            className={`bg-blue-300 text-slate-800 font-semibold text-xs px-3 py-2 rounded-full shadow hover:bg-gray-100 hover:text-black max-h-8 whitespace-nowrap ${className}`}
            onClick={onClick}
            sx={sx}
            disabled={disabled}
        >
            {text}
        </StyledButton>
    );
};

export default LightBlueButton;
