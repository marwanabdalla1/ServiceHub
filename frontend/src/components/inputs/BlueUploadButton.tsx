import React from 'react';
import {ButtonProps, StyledButton} from './blackbutton';

interface LightBlueFileButtonProps {
    text: string;
    className?: string;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    sx?: any; // make the Button component accepts a style prop.
}


function LightBlueFileButton({text, className = '', onFileChange, sx}: Readonly<LightBlueFileButtonProps>) {
    return (
        <StyledButton
            className={`bg-blue-300 text-slate-800 font-semibold text-xs px-3 py-2 rounded-full shadow hover:bg-gray-100 hover:text-black max-h-8 whitespace-nowrap ${className}`}
            sx={sx}
        >
            {text}
            <input type="file" hidden onChange={onFileChange}/>
        </StyledButton>
    );
}

export default LightBlueFileButton;