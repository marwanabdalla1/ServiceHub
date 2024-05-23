import React from 'react';
import {BrowserRouter, Routes, Route, useLocation} from "react-router-dom";
import FilterPage from './Pages/FilterPage';
import ProfilePage from './Pages/ProfilePage';
import SignInPage from './Pages/SignInPage';
import SignUpPage from './Pages/SignUpPage';
import NavigationBar from './components/Navbar';

function MainRoutes() {
    const location = useLocation();
    const showNavBar = location.pathname !== "/signin" && location.pathname !== "/signup";

    return (
        <>
            {showNavBar && <NavigationBar/>}
            <Routes>
                <Route path="/signin" element={<SignInPage/>}/>
                <Route path="/signup" element={<SignUpPage/>}/>
                <Route path="/" element={<FilterPage/>}/>
                <Route path="/profile" element={<ProfilePage/>}/>
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <MainRoutes/>
        </BrowserRouter>
    );
}

export default App;