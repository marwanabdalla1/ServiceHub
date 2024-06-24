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
import OfferedServicesPage from './Pages/OfferedServicesPage';

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
            {showNavBar && <NavigationBar toggleDrawer={() => {
            }} onChange={() => {
            }} onSearch={() => {
            }} search={""}/>}
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/setprofile" element={<ProfileSettingPage/>}/>
                <Route path="/customer_review" element={<ReviewPage/>}/>
                <Route path="/login" element={<SignInPage/>}/>
                <Route path="/signup" element={<SignUpPage/>}/>
                <Route path="/filter" element={<FilterPage/>}/>
                <Route path="/jobs/jobHistory" element={<JobHistoryPage/>}/>
                <Route path="/jobs/requestHistory" element={<RequestHistoryPage/>}/>
                <Route path="/jobs/offeredServices" element={<OfferedServicesPage/>}/>
                <Route path="/incomingRequests" element={<IncomingRequestsPage/>}/>
                <Route path="/addservice" element={<AddServicePage/>}/>
                <Route path="/provider-profile/:id" element={<ProviderProfilePage/>}/>
                <Route path="select-availability" element={<SelectAvailabilityPage/>}/>
                <Route path="/update-timeslot" element={<UpdateTimeslot/>}/>


                {/*booking*/}
                <Route path="/offerings/:offeringId" element={<ProviderProfilePage />} />
                <Route path="/offerings/:offeringId/booking/:step" element={<BookingPage />} />

                {/*old ones*/}
                {/*<Route path="/create-account-or-sign-in" element={<CreateAccountOrSignIn/>}/>*/}
                {/*<Route path="/update-profile" element={<UpdateProfile/>}/>*/}
                {/*<Route path="/review-and-confirm" element={<ReviewAndConfirm/>}/>*/}

                <Route path="/listsLandingPage" element={<ListsLandingPage/>}/>
                <Route path="/update-timeslot/" element={<UpdateTimeslot/>} />
                <Route path="/proposeNewTime" element={<ProposeNewtimePage />} />
                <Route path="*" element={<h1>Not Found</h1>}/>


            </Routes>
        </div>
    );
}

export default App;
