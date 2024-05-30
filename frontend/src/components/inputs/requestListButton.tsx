import React from 'react';
import { CiMenuBurger } from 'react-icons/ci';

interface RequestListButtonProps {
  className?: string;
  onClick: () => void;
}

function RequestListButton({className = '', onClick}: Readonly<RequestListButtonProps>) {
  return (
    <button
      className={` ${className}`}
      onClick={onClick}
    >
    <CiMenuBurger className="mr-2" size={20} />
    </button>
  );
}


export default RequestListButton;
