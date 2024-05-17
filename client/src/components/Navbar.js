import { CgProfile } from "react-icons/cg";
import { IoSettingsOutline, IoNotificationsOutline } from "react-icons/io5";
import { CiSearch, CiMenuBurger } from "react-icons/ci";
import { FiFilter } from "react-icons/fi";
import BlackButton from "./inputs/blackbutton";

const Navbar = () => {
  return (
    <nav className="bg-blue-300 shadow-md h-20">
  <div className="flex justify-between items-center h-full">
    {/* Left Section: Logo and Explore */}
    <div className="flex items-center space-x-4">
      <a href="/" className="flex items-center">
        <img src="/images/logo.png" alt="Logo" className="md:h-32 md:mr-2" />
      </a>
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
      <BlackButton className="py-2" text="Provide a Service" />
      <CiMenuBurger className="h-6 w-6" />
      <IoNotificationsOutline className="h-6 w-6" />
      <CgProfile className="h-6 w-6" />
      <div className="h-6 w-0.5 bg-gray-800"></div>
      <IoSettingsOutline className="h-6 w-6" />
    </div>
  </div>
</nav>

  );
};

export default Navbar;
