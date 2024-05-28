import React from 'react';
import {BrowserRouter, Routes, Route, useLocation} from "react-router-dom";
import FilterPage from './Pages/FilterPage';
import ProfilePage from './Pages/ProfilePage';
import SignInPage from './Pages/LoginPage';
import SignUpPage from './Pages/SignUpPage';
import NavigationBar from './components/Navbar';
import JobHistoryPage from './Pages/JobHistoryPage';
import RequestHistoryPage from './Pages/RequestHistoryPage';
import IncomingRequestsPage from './Pages/IncomingRequestsPage';

import HomePage from './Pages/HomePage';
import AddServicePage from './Pages/AddServicePage';
import ReviewPage from "./Pages/CustomerReviewPage";

import ProviderProfilePage from "./Pages/ProviderProfilePage";

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
        <div className="h-screen flex flex-col">
            {showNavBar && <NavigationBar/>}
            <Routes>
                <Route path="/" element={<HomePage/>} />
                <Route path="/customer_review" element={<ReviewPage/>}/>
                <Route path="/login" element={<SignInPage/>}/>
                <Route path="/signup" element={<SignUpPage/>}/>
                <Route path="/filter" element={<FilterPage/>}/>
                <Route path="/profile" element={<ProfilePage/>}/>
                <Route path="/jobs/jobHistory" element={<JobHistoryPage/>} />
                <Route path="/jobs/requestHistory" element={<RequestHistoryPage/>} />
                <Route path="/incomingRequests" element={<IncomingRequestsPage/>} />
                <Route path="/addservice" element={<AddServicePage />} />
                <Route path="*" element={<h1>Not Found</h1>} />
                <Route path="/bob" element={<ProviderProfilePage/>}/>
                <Route path="select-availability" element={<SelectAvailabilityPage/>} />

            </Routes>
        </div>
    );
}

export default App;
