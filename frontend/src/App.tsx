import React from 'react';
import {BrowserRouter, Routes, Route, useLocation} from "react-router-dom";
import FilterPage from './Pages/FilterPage';
import ProfilePage from './Pages/ProfilePage';
import SignInPage from './Pages/LoginPage';
import SignUpPage from './Pages/SignUpPage';
import NavigationBar from './components/Navbar';
import ProviderProfilePage from "./Pages/ProviderProfilePage";

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
                <Route path="/login" element={<SignInPage/>}/>
                <Route path="/signup" element={<SignUpPage/>}/>
                <Route path="/" element={<FilterPage/>}/>
                <Route path="/profile" element={<ProfilePage/>}/>
                <Route path="/bob" element={<ProviderProfilePage/>}/>

            </Routes>
        </>
    );
}

export default App;