import React, { useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline, IoNotificationsOutline } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { FiFilter } from "react-icons/fi";
import BlackButton from "./inputs/blackbutton";
import RequestListButton from "./inputs/requestListButton";
import Modal from "./inputs/Modal";
import { Link } from "react-router-dom";
import './Navbar.css';

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <nav className="bg-blue-300 shadow-md h-20">
      {/* Navbar content */}
      <div className="flex justify-between items-center h-full">
        {/* Left Section: Logo and Explore */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center">
            <img src="/images/logo.png" alt="Logo" className="md:h-32 md:mr-2" />
          </Link>
          <div className="relative">
            <button className="text-customBlack font-semibold text-sm">EXPLORE</button>
            {/* Dropdown content */}
            <div className="absolute hidden bg-white text-black rounded shadow-md mt-2">
              <a href="/option1" className="block px-4 py-2 hover:bg-gray-200">Option 1</a>
              <a href="/option2" className="block px-4 py-2 hover:bg-gray-200">Option 2</a>
            </div>
          </div>
        </div>

        {/* Middle Section: Search Bar */}
        <div className="flex items-center bg-white rounded-full shadow-inner px-2 py-1 w-1/2 ml-2">
          <div className="flex items-center flex-grow">
            <input
              type="text"
              placeholder="Search for a service"
              className="flex-grow px-2 py-1 rounded-l-full focus:outline-none"
            />
            <button className="text-blue-500">
              <CiSearch className="h-6 w-6" />
            </button>
          </div>
          <FiFilter className="h-6 w-6 text-blue-500 ml-2" />
        </div>

        {/* Right Section: Provide Service Button and Icons */}
        <div className="flex items-center space-x-4 m-4">
          <BlackButton className="py-2" text="Provide a Service" onClick={()=> console.log('Black button pressed')} />
          <RequestListButton className="h-6 w-6" onClick={openModal}/>
          <IoNotificationsOutline className="h-6 w-6" />
          <Link to="/profile" className="text-current">
            <CgProfile className="h-6 w-6" />
          </Link>
          <div className="h-6 w-0.5 bg-gray-800"></div>
          <IoSettingsOutline className="h-6 w-6" />
        </div>
      </div>
      <Modal show={isModalOpen} onClose={closeModal}>
        <div className='modal-content'>
          <h1 className = 'modalTitle'>Incoming Requests</h1>
          <div className = 'lineItem'>
            <div className='ServiceDescription'> 
              <p className = 'columnHeader'> Service Description</p> 
              <p className = 'ServiceDescriptionElement'>Bike Repair: Seeking an experienced bike mechanic to fix gear and..</p>
              <p className = 'ServiceDescriptionElement'>Nadine1</p>
              <p className = 'ServiceDescriptionElement'>Nadine2</p>
            </div>
            <div className = 'PublishDate'>
              <p className = 'columnHeader'> Publish Date</p>
              <p className = 'PublishDateElement'>08.05.2024</p>
              <p className = 'PublishDateElement'>21.08.2001</p>
              <p className = 'PublishDateElement'>21.10.2021</p>
            </div>
            <div className = 'ViewButtons'>
              <p className = 'emptyColumnHeader'> View Buttons</p>
              <p className='PublishDateElement'>A<BlackButton text="View>" onClick={()=> console.log('Black button pressed')} /></p>
              <p className='PublishDateElement'>B<BlackButton text="View>" onClick={()=> console.log('Black button pressed')} /></p>
              <p className='PublishDateElement'>C<BlackButton text="View>" onClick={()=> console.log('Black button pressed')} /></p>
              </div>
          </div>
        </div>
      </Modal>
    </nav>
  );
};

export default Navbar;
