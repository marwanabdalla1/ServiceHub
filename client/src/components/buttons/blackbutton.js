import React from 'react';

const BlackButton = ({ text, className = '', onClick }) => {
  return (
    <button
      className={`bg-customBlack text-white font-semibold text-xs px-2 py-1 rounded-full shadow hover:bg-gray-100 max-h-8 whitespace-nowrap ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default BlackButton;
