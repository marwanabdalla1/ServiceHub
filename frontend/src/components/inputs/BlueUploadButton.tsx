import React from 'react';
import {ButtonProps} from './blackbutton';

interface LightBlueFileButtonProps{
    text: string;
    className?: string;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function LightBlueFileButton({text, className = '', onFileChange}: Readonly<LightBlueFileButtonProps>) {
    return (
        <label
            className={`bg-blue-300 text-slate-800 font-semibold text-xs px-3 py-2 rounded-full shadow hover:bg-gray-100 hover:text-black max-h-8 whitespace-nowrap ${className}`}
        >
            {text}
            <input type="file" hidden onChange={onFileChange}/>
        </label>
    );
}

export default LightBlueFileButton;