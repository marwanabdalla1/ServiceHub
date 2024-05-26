import React from 'react';
import {BrowserRouter, Routes, Route, useLocation} from "react-router-dom";
import FilterPage from './Pages/FilterPage';
import ProfilePage from './Pages/ProfilePage';
import SignInPage from './Pages/LoginPage';
import SignUpPage from './Pages/SignUpPage';
import NavigationBar from './components/Navbar';
import HomePage from './Pages/HomePage';
import AddServicePage from './Pages/AddServicePage';
import ReviewPage from "./Pages/CustomerReviewPage";

import ProviderProfilePage from "./Pages/ProviderProfilePage";
import UserProfilePage from "./Pages/ProfileSettingPage";

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
        <div className="h-screen flex flex-col">
            {showNavBar && <NavigationBar/>}
            <Routes>
                <Route path="/" element={<HomePage/>} />
                <Route path="/userprofile" element={<UserProfilePage/>} />
                <Route path="/customer_review" element={<ReviewPage/>}/>
                <Route path="/login" element={<SignInPage/>}/>
                <Route path="/signup" element={<SignUpPage/>}/>
                <Route path="/filter" element={<FilterPage/>}/>
                <Route path="/profile" element={<ProfilePage/>}/>
                <Route path="/addservice" element={<AddServicePage />} />
                <Route path="*" element={<h1>Not Found</h1>} />
                <Route path="/bob" element={<ProviderProfilePage/>}/>
            </Routes>
        </div>
    );
}

export default App;