import React from 'react';
import { IoClose } from "react-icons/io5";
import IncomingRequestTable  from "../../Pages/TablePages/IncomingRequestsTable";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <div className="relative w-full max-w-lg mx-auto">
        {/* Adjust max-w-lg to the desired maximum width */}
        <div className="absolute top-0 left-0 w-full h-full" onClick={onClose}></div>
        <div className="bg-white p-4 rounded shadow-lg w-full max-w-lg">
          <button className="absolute top-2 right-2" onClick={onClose}>
            <IoClose className="text-gray-600" />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
