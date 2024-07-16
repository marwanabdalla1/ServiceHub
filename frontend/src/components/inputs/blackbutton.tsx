import React from 'react';
import { styled } from "@mui/system";
import { ReactNode } from 'react'; // for icon


export interface ButtonProps {
    text: string;
    className?: string;
    onClick: () => void;
    sx?: any;
    style?: React.CSSProperties;
    disabled?: boolean;  // Add disabled property
    icon?: ReactNode;  //  icon property

}

export const StyledButton = styled('button')(({ sx }) => ({
    ...sx
}));

function BlackButton({ text, className = '', icon, onClick, sx = {}, style, disabled }: ButtonProps) {
    return (
        <StyledButton
        className={`bg-customBlack text-white font-semibold text-xs rounded-full shadow hover:bg-gray-500 whitespace-nowrap `}
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
            style={style}
            disabled={disabled}
        >
            {icon}
            {text}
        </StyledButton>
    );
}

export default BlackButton;
