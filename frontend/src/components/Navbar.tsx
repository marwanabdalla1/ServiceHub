import React, { useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline, IoNotificationsOutline } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import { FiFilter } from "react-icons/fi";
import BlackButton from "./inputs/blackbutton";
import RequestListButton from "./inputs/requestListButton";
import Modal from "./inputs/Modal";
import { Link } from "react-router-dom";
import { Menu, MenuItem } from '@mui/material';
import {useAuth} from "../contexts/AuthContext";



interface NavbarProps {
  toggleDrawer: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  search: string;
}

const Navbar : React.FC<NavbarProps> = ({toggleDrawer, onChange, onSearch, search}) => {
  const { isLoggedIn } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);



  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
              placeholder={ "Search for a service" }
              className="flex-grow px-2 py-1 rounded-l-full focus:outline-none"
              value={search}
              onChange={onChange}
            />
            <button className="text-blue-500" onClick={onSearch}>
              <CiSearch className="h-6 w-6" />
            </button>
          </div>
          <button onClick={toggleDrawer} >
          <FiFilter className="h-6 w-6 text-blue-500 ml-2" />
          </button>
        </div>

        {/* Right Section: Provide Service Button and Icons */}
        <div className="flex items-center space-x-4 m-4">
          <BlackButton className="py-2" text="Provide a Service" onClick={()=> console.log('Black button pressed')} />
          <RequestListButton className="h-6 w-6" onClick={handleMenuOpen} />
          <IoNotificationsOutline className="h-6 w-6" />
          <Link to={isLoggedIn() ? "/setprofile" : "/login"} className="text-current">
            <CgProfile className="h-6 w-6" />
          </Link>
          <div className="h-6 w-0.5 bg-gray-800"></div>
          <IoSettingsOutline className="h-6 w-6" />
        </div>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem component={Link} to="/jobs/jobHistory" onClick={handleMenuClose}>Job History</MenuItem>
        <MenuItem component={Link} to="/jobs/requestHistory" onClick={handleMenuClose}>Request History</MenuItem>
        <MenuItem component={Link} to="/incomingRequests" onClick={handleMenuClose}>Incoming Requests</MenuItem>
      </Menu>

    </nav>
  );
};

export default Navbar;
