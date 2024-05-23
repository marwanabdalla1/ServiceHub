import React from 'react';

export interface ButtonProps {
  text: string;
  className?: string;
  onClick: () => void;
}

function BlackButton({text, className = '', onClick}: Readonly<ButtonProps>) {
  return (
    <button
      className={`bg-customBlack text-white font-semibold text-xs px-2 py-2 rounded-full shadow hover:bg-gray-100 hover:text-black max-h-8 whitespace-nowrap ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}


export default BlackButton;
