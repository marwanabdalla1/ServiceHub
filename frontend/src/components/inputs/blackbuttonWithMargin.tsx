import React from 'react';

interface BlackButtonProps {
  text: string;
  className?: string;
  onClick: () => void;
}

function BlackButtonWithMargin({text, className = '', onClick}: Readonly<BlackButtonProps>) {
  return (
    <button
      className={`bg-customBlack text-white font-semibold text-xs px-2 py-1 rounded-full shadow hover:bg-gray-100 max-h-8 whitespace-nowrap ${className}`}
      onClick={onClick}
      style={{ marginRight:"1rem"}}
      
    >
      {text}
    </button>
  );
}


export default BlackButtonWithMargin;
