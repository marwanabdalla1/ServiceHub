import React from 'react';
import {ButtonProps, StyledButton} from './blackbutton';

function LightBlueButton({text, className = '', onClick}: Readonly<ButtonProps>) {
    return (
        <StyledButton
            className={` bg-blue-300 text-slate-800 font-semibold text-xs px-3 py-2 rounded-full shadow hover:bg-gray-100 hover:text-black max-h-8 whitespace-nowrap ${className}`}
            onClick={onClick}
        >
            {text}
        </StyledButton>
    );
}


export default LightBlueButton;
