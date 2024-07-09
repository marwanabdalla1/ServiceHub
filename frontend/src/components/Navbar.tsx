import React, {useEffect, useState} from 'react';
import {CgProfile} from "react-icons/cg";
import {CiSearch} from "react-icons/ci";
import {FiFilter} from "react-icons/fi";
import {BsQuestionCircle} from "react-icons/bs";
import BlackButton from "./inputs/blackbutton";
import RequestListButton from "./inputs/requestListButton";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {Menu, MenuItem} from '@mui/material';
import {useAuth} from "../contexts/AuthContext";
import NotificationBell from './Notification/NotificationBell';

interface NavbarProps {
    toggleDrawer: () => void;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearch: () => void;
    search: string;
    setSearch: (value: string) => void;
}

interface ServiceButtonProps {
    isLoggedIn: boolean;
    isProvider: boolean;
    isPremium: boolean;
}

const ServiceButton: React.FC<ServiceButtonProps> = ({isLoggedIn, isProvider, isPremium}) => {
    const getButtonText = () => {
        if (isProvider && !isPremium) {
            return "Become Pro";
        }
        return "Provide a Service";
    };

    const getLinkDestination = () => {
        if (isProvider && !isPremium) {
            return "/becomepro";
        }
        return isLoggedIn ? "/update-sprofile" : "/login"; //Redirect to updateprofie before providing service to make sure data is up to date
    };

    return (
        <Link to={getLinkDestination()} className="text-current">
            <BlackButton
                className="py-2"
                text={getButtonText()}
                onClick={() => console.log('Black button pressed')}
            />
        </Link>
    );
};

const Navbar: React.FC<NavbarProps> = ({toggleDrawer, onChange, onSearch, search, setSearch}) => {
    const {token, isLoggedIn, logoutUser, account} = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
    // const [searchTerm, setSearchTerm] = useState(search);
    const navigate = useNavigate();
    const location = useLocation();


    const isPremium = account?.isPremium || false;
    const isProvider = account?.isProvider || false;
    //console.log("token: " + token + '\n' + "isProvider: " + isProvider + '\n' + "isPremium: " + isPremium );

    useEffect(() => {
        setSearch(search);
    }, [search]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        if (!isProvider) {
            navigate("/outgoing");
        } else {
            // Otherwise, show the menu for choosing bookings
            setAnchorEl(event.currentTarget);
        }
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        console.log(token);
        console.log("isLoggedIn: " + isLoggedIn());
        setProfileAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setProfileAnchorEl(null);
    };


    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const handleSearch = () => {
        navigate(`/filter`, {state: {searchTerm: search}});
    };

    return (
        <div style={{
            position: 'fixed', // fixed on top
            top: 0,
            width: '100%',     // takes the full width
            zIndex: 1100,
        }}>
            <div className="bg-blue-300 shadow-md h-20">
                {/* Navbar content */}
                <div className="flex justify-between items-center h-full">
                    {/* Left Section: Logo */}
                    <Link to="/">
                        <img src="/images/logo.png" alt="Logo" className=" h-16 ml-4"/>
                    </Link>

                    {/* Middle Section: Search Bar */}
                    <div className="flex items-center bg-white rounded-full shadow-inner px-2 py-1 w-1/2 ml-2">
                        <div className="flex items-center flex-grow">
                            <input
                                type="text"
                                placeholder={"Search for a service"}
                                className="flex-grow px-2 py-1 rounded-l-full focus:outline-none"
                                value={search}
                                onChange={handleSearchChange}
                            />
                            <button className="text-blue-500" onClick={handleSearch}>
                                <CiSearch className="h-6 w-6"/>
                            </button>
                        </div>
                        {location.pathname === '/filter' && (
                            <button onClick={toggleDrawer}>
                                <FiFilter className="h-6 w-6 text-blue-500 ml-2"/>
                            </button>
                        )}
                    </div>

                    {/* Right Section: Provide Service Button and Icons */}
                    <div className="flex items-center space-x-4 m-4">
                        <ServiceButton
                            isLoggedIn={isLoggedIn()}
                            isProvider={isProvider}
                            isPremium={isPremium}
                        />

                        {
                            isLoggedIn() ? (
                                <div className="flex items-center">
                                    <RequestListButton className="h-6 w-6" onClick={handleMenuOpen}/>
                                    <div className="flex items-center">
                                        <NotificationBell header="Notifications"/>
                                    </div>
                                </div>
                            ) : (<div></div>)}
                        <div onClick={handleProfileMenuOpen}>
                            <CgProfile className="h-6 w-6"/>
                        </div>
                        <Menu
                            anchorEl={profileAnchorEl}
                            open={Boolean(profileAnchorEl)}
                            onClose={handleProfileMenuClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'center',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'center',
                            }}
                        >
                            {isLoggedIn() ? [
                                <MenuItem key="profile" component={Link} to="/setprofile"
                                          onClick={handleProfileMenuClose}>Profile</MenuItem>,
                                <MenuItem key="logout" onClick={logoutUser}>Logout</MenuItem>
                            ] : (
                                <MenuItem component={Link} to="/login" onClick={handleProfileMenuClose}>Login</MenuItem>
                            )}
                        </Menu>
                        <div className="h-6 w-0.5 bg-gray-800"></div>
                        {/*<IoSettingsOutline className="h-6 w-6"/>*/}
                        <Link to="/faq" className="h-6 w-6" style={{outline: 'none'}}>
                            <BsQuestionCircle className="h-6 w-6" style={{color: 'black'}}/>
                        </Link>
                    </div>
                </div>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    {isProvider && (
                        <MenuItem component={Link} to="/incoming" onClick={handleMenuClose}>
                            Incoming Bookings
                        </MenuItem>
                    )}
                    <MenuItem component={Link} to="/outgoing" onClick={handleMenuClose}>
                        Outgoing Bookings
                    </MenuItem>
                </Menu>
            </div>
        </div>
    )
        ;
};

export default Navbar;
