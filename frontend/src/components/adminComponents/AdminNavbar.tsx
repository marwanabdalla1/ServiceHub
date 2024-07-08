import React, {useState} from 'react';
import {CgProfile} from "react-icons/cg";
import {Link} from "react-router-dom";
import {Menu, MenuItem} from '@mui/material';
import {useAuth} from "../../contexts/AuthContext";
import RequestListButton from "../inputs/requestListButton";

interface AdminNavbarProps {
    toggleDrawer?: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = () => {
    const {isLoggedIn, logoutUser} = useAuth();
    const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setProfileAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setProfileAnchorEl(null);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <nav className="bg-blue-300 shadow-md h-20">
            <div className="flex justify-between items-center h-full">
                {/* Left Section: Logo */}
                <div className="flex justify-between items-center h-full">
                    {/* Left Section: Logo */}
                    <Link to="/">
                        <img src="/images/logo.png" alt="Logo" className=" h-16 ml-4"/>
                    </Link>
                </div>

                {/* Right Section: Icons and Menu */}
                <div className="flex items-center space-x-4 m-4">
                    <RequestListButton className="h-6 w-6" onClick={handleMenuOpen}/>
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
                        {isLoggedIn() ? (
                            <MenuItem key="logout" onClick={logoutUser}>Logout</MenuItem>
                        ) : (
                            <MenuItem component={Link} to="/login" onClick={handleProfileMenuClose}>Login</MenuItem>
                        )}
                    </Menu>
                </div>
            </div>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <MenuItem component={Link} to="/admin/verifyCertificate" onClick={handleProfileMenuClose}>Verify
                    Certificates</MenuItem>
                <MenuItem component={Link} to="/admin/UserData" onClick={handleProfileMenuClose}>User Data</MenuItem>
            </Menu>
        </nav>
    );
};

export default AdminNavbar;
