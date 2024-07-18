import React, {useRef} from 'react';
import {ButtonProps, StyledButton} from './blackbutton';

interface UploadFileButtonProps {
    text: string;
    className?: string;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    sx?: any; // make the Button component accepts a style prop.
    icon?: React.ReactNode
}

function UploadFileButton({text, className = '', onFileChange, sx, icon}: Readonly<UploadFileButtonProps>) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <StyledButton
            className={`bg-blue-300 sm:text-sm px-3 py-2 rounded-full ${className}`}
            onClick={handleClick}
            sx={{
                ...sx,
                size: 'small',
                mb: 1,
                color: 'black',
                backgroundColor: 'white',
                border: '1px solid black',
                '&:hover': {
                    backgroundColor: 'black',
                    color: 'white',
                    borderColor: 'white'
                            },
                fontSize: '13px',
                maxHeight: 35,
                width: '100%',
                display: 'flex',
                height: 'auto',
                verticalAlign: 'top',
                lineHeight: 'normal',
                alignItems: 'flex-start',
                justifyContent:'flex-start'
            }}
        >
            {icon}
            {text}
            <input type="file" hidden ref={fileInputRef} onChange={onFileChange}/>
        </StyledButton>
    );
}

export default UploadFileButton;