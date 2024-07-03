import React, {useEffect} from 'react';
import {BrowserRouter, Routes, Route, useLocation} from "react-router-dom";
import FilterPage from './Pages/FilterPage';
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
import UserProfilePage from "./Pages/ProfileSettingPage";
import ProfileSettingPage from "./Pages/ProfileSettingPage";
import SelectAvailabilityPage from './Pages/SelectAvailabilityPage';
import SelectTimeslot from './Pages/bookingSteps/SelectTimeslotPage'
import UpdateTimeslot from './Pages/UpdateTimeslotPage'
import {BookingProvider} from "./contexts/BookingContext";
import UpdateProfile from "./Pages/bookingSteps/UpdateProfile";
import ReviewAndConfirm from "./Pages/bookingSteps/ReviewAndConfirm";
import CreateAccountOrSignIn from "./Pages/bookingSteps/CreateAccountOrSignIn";
import ListsLandingPage from "./Pages/listsLandingPage";
import {RequestProvider} from './contexts/RequestContext';
import axios from "axios";
import ProposeNewtimePage from './Pages/ProposeNewTimePage';
import {AccountProvider} from "./contexts/AuthContext";
import BookingPage from "./Pages/bookingSteps/BookingPage";
import BecomeProPage from './Pages/BecomePro';
// import SelectAvailabilityBooking_temp from "./Pages/SelectAvailabilityBooking_temp";

function App() {

    useEffect(() => {
        axios.defaults.baseURL = "http://localhost:8080";
    }, []);

    return (
        <BrowserRouter>
            <BookingProvider>
                <RequestProvider>
                    <AccountProvider>

                        <MainRoutes/>

                    </AccountProvider>
                </RequestProvider>
            </BookingProvider>
        </BrowserRouter>
    );
}

function MainRoutes() {
    const location = useLocation();
    const showNavBar = location.pathname !== "/login" && location.pathname !== "/signup" && location.pathname !== "/filter";

    return (
        <div className="h-screen flex flex-col">
            {showNavBar && <NavigationBar toggleDrawer={() => {}} onChange={() => {}} onSearch={() => {}} search={""}/>}
            <Routes>
                {/* Home */}
                <Route path="/" element={<HomePage/>}/>

                {/* User Authentication */}
                <Route path="/login" element={<SignInPage/>}/>
                <Route path="/signup" element={<SignUpPage/>}/>

                {/* User Profile */}
                <Route path="/setprofile" element={<ProfileSettingPage/>}/>
                <Route path="/customer_review" element={<ReviewPage/>}/>
                <Route path="/profile-settings" element={<ProfileSettingPage/>}/>

                {/* Provider Related */}
                <Route path="/addservice" element={<AddServicePage/>}/>
                <Route path="/provider-profile/:id" element={<ProviderProfilePage/>}/>
                <Route path="/becomepro" element={<BecomeProPage/>}/>

                {/* Booking */}
                <Route path="/offerings/:offeringId" element={<ProviderProfilePage/>} />
                <Route path="/offerings/:offeringId/booking/:step" element={<BookingPage/>} />
                <Route path="/select-availability" element={<SelectAvailabilityPage/>}/>
                <Route path="/update-timeslot" element={<UpdateTimeslot/>}/>

                {/* Requests */}
                <Route path="/jobs/jobHistory" element={<JobHistoryPage/>}/>
                <Route path="/jobs/requestHistory" element={<RequestHistoryPage/>}/>
                <Route path="/incomingRequests" element={<IncomingRequestsPage/>}/>
                <Route path="/proposeNewTime" element={<ProposeNewtimePage/>}/>

                {/* Lists */}
                <Route path="/listsLandingPage" element={<ListsLandingPage/>}/>

                {/* Filter */}
                <Route path="/filter" element={<FilterPage/>}/>

                {/* Catch All */}
                <Route path="*" element={<h1>Not Found</h1>}/>
            </Routes>
        </div>
    );
}

export default App;
