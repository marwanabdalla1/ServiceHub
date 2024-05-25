import React from 'react';
import {BrowserRouter, Routes, Route, useLocation} from "react-router-dom";
import FilterPage from './Pages/FilterPage';
import ProfilePage from './Pages/ProfilePage';
import LoginPage from './Pages/LoginPage';
import SignUpPage from './Pages/SignUpPage';
import NavigationBar from './components/Navbar';
import ProviderProfilePage from './Pages/ProviderProfilePage';
import SelectAvailabilityPage from './Pages/SelectAvailabilityPage';

function App() {
    return (
        <BrowserRouter>
            <MainRoutes/>
        </BrowserRouter>
    );
}

function MainRoutes() {
    const location = useLocation();
    const showNavBar = location.pathname !== "/login" && location.pathname !== "/signup";

    return (
        <>
            {showNavBar && <NavigationBar/>}
            <Routes>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/signup" element={<SignUpPage/>}/>
                <Route path="/" element={<FilterPage/>}/>
                <Route path="/profile" element={<ProfilePage/>}/>
                <Route path="/bob" element={<ProviderProfilePage/>}/>

                <Route path="/select-availability" element={<SelectAvailabilityPage/>}/>


            </Routes>
        </>
    );
}

export default App;