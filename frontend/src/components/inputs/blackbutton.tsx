import React from 'react';
import {styled} from "@mui/system";

export interface ButtonProps {
    text: string;
    className?: string;
    onClick: () => void;
    sx?: any;  // make the Button component accepts a sx prop.
}
export const StyledButton = styled('button')({});

function BlackButton({text, className = '', onClick, sx}: Readonly<ButtonProps>) {
    return (
        <StyledButton
            className={`bg-customBlack text-white font-semibold text-xs px-2 py-2 rounded-full shadow hover:bg-gray-100 hover:text-black max-h-8 whitespace-nowrap ${className}`}
            onClick={onClick}
            sx={sx}
        >
            {text}
        </StyledButton>
    );

}


export default BlackButton;
