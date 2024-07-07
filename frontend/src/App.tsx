import React, {useEffect, useState} from 'react';
import {BrowserRouter, Routes, Route, useLocation} from "react-router-dom";
import FilterPage from './Pages/FilterPage';
import SignInPage from './Pages/AuthPages/LoginPage';
import SignUpPage from './Pages/AuthPages/SignUpPage';
import NavigationBar from './components/Navbar';
import ReceivedServicesPage from './Pages/ReceivedServicesPage';
import AdminNavbar from "./components/adminComponents/AdminNavbar";
import RequestHistoryPage from './Pages/RequestHistoryPage';
import IncomingRequestsPage from './Pages/IncomingRequestsPage';
import HomePage from './Pages/HomePage';
import AddServicePage from './Pages/AddServicePage';
import ReviewPage from "./Pages/CustomerReviewPage";
import ProviderProfilePage from "./Pages/ProviderProfilePage";
import ProfileSettingPage from "./Pages/ProfileSettingPage";
import SelectAvailabilityPage from './Pages/SelectAvailabilityPage';
import SelectTimeslot from './Pages/bookingSteps/SelectTimeslotPage'
import UpdateTimeslot from './Pages/UpdateTimeslotPage'
import {BookingProvider} from "./contexts/BookingContext";
import UpdateProfile from "./Pages/bookingSteps/UpdateProfile";
import ReviewAndConfirm from "./Pages/bookingSteps/ReviewAndConfirm";
import CreateAccountOrSignIn from "./Pages/bookingSteps/CreateAccountOrSignIn";
import {RequestProvider} from './contexts/RequestContext';
import axios from "axios";
import ProposeNewtimePage from './Pages/ProposeNewTimePage';
import {AccountProvider} from "./contexts/AuthContext";
import BookingPage from "./Pages/bookingSteps/BookingPage";
import ConfirmationPage from "./Pages/bookingSteps/ConfirmationPage";
import FAQPage from "./Pages/FAQPage";

import BecomeProPage from './Pages/BecomePro';
import ResetPasswordPage from "./Pages/AuthPages/ForgetPasswordPages/ResetPasswordPage";
import OTPPage from "./Pages/AuthPages/ForgetPasswordPages/OTPPage";
import ForgetPasswordPage from "./Pages/AuthPages/ForgetPasswordPages/ForgetPasswordPage";
import ResetPasswordSuccessPage from "./Pages/AuthPages/ForgetPasswordPages/ResetPasswordSuccessPage";
import {RecoveryProvider} from './contexts/RecoveryContext';

import OfferedServicesPage from './Pages/OfferedServicesPage';
import ChangeBookingTimePage from './Pages/ChangeBookingTimePage';
// import SelectAvailabilityBooking_temp from "./Pages/SelectAvailabilityBooking_temp";
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Slide} from "react-toastify";
import JobDetailsPage from "./Pages/JobDetailsPage";
import VerifyCertificatePage from "./Pages/AdminPanel/VerifyCertificatePage";
import AdminUserDataPage from "./Pages/AdminPanel/AdminUserDataPage";
import AdminHomePage from "./Pages/AdminPanel/AdminHomePage";
import ErrorPage from "./Pages/ErrorPage";
import CombinedServicePage from "./Pages/CombinedIncomingPage";

function App() {
    const [search, setSearch] = useState('');

    useEffect(() => {
        axios.defaults.baseURL = "http://localhost:8080";
    }, []);

    return (
        <div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                transition={Slide}
            />
            <BrowserRouter>
                <BookingProvider>
                    <RequestProvider>
                        <AccountProvider>
                            <RecoveryProvider>
                                <MainRoutes search={search} setSearch={setSearch}/>
                            </RecoveryProvider>
                        </AccountProvider>
                    </RequestProvider>
                </BookingProvider>
            </BrowserRouter>
        </div>
    );
}

function MainRoutes({search, setSearch}: {search: any, setSearch: any}) {
    const location = useLocation();
    const showNavBar = location.pathname !== "/login"
        && location.pathname !== "/signup"
        && location.pathname !== "/filter"
        && location.pathname !== "/forgetPassword/emailVerification"
        && location.pathname !== "/forgetPassword/resetPassword"
        && location.pathname !== "/forgetPassword"
        && location.pathname !== "/forgetPassword/success"
        && location.pathname !== "/admin/verifyCertificate"
        && location.pathname !== "/admin/UserData";

    const showAdminNavBar = location.pathname.includes("/admin");
    return (
        <div className="h-screen flex flex-col">
            {showNavBar && !showAdminNavBar && <NavigationBar
                toggleDrawer={() => {}}
                onChange={() => {}}
                onSearch={() => {}}
                search={search}
                setSearch={setSearch}/>}
            {showAdminNavBar && <AdminNavbar/>}
            <Routes>
                {/* Home */}
                <Route path="/" element={<HomePage/>}/>

                {/* User Authentication */}
                <Route path="/login" element={<SignInPage/>}/>
                <Route path="/signup" element={<SignUpPage/>}/>

                {/* User Profile */}
                <Route path="/setprofile" element={<ProfileSettingPage/>}/>
                <Route path="/customer_review/:jobId" element={<ReviewPage/>}/>
                <Route path="/forgetPassword" element={<ForgetPasswordPage/>}/>
                <Route path="/forgetPassword/emailVerification" element={<OTPPage/>}/>
                <Route path="/forgetPassword/resetPassword" element={<ResetPasswordPage/>}/>
                <Route path="/forgetPassword/success" element={<ResetPasswordSuccessPage/>}/>
                <Route path="/filter" element={<FilterPage/>}/>

                <Route path="/jobs/receivedServices" element={<ReceivedServicesPage/>}/>
                <Route path="/jobs/requestHistory" element={<RequestHistoryPage/>}/>
                <Route path="/jobs/offeredServices" element={<OfferedServicesPage/>}/>
                <Route path="/incomingRequests" element={<IncomingRequestsPage/>}/>
                {/*<Route path="/incoming" element={<CombinedServicePage/>}/>*/}

                <Route path="/addservice" element={<AddServicePage/>}/>
                {/*<Route path="/provider-profile/:id" element={<ProviderProfilePage/>}/>*/}
                <Route path="/select-availability" element={<SelectAvailabilityPage/>}/>
                <Route path="/change-booking-time/:requestId" element={<ChangeBookingTimePage/>}/>
                {/*<Route path="/select-availability-booking" element={<SelectAvailabilityBooking_temp/>}/>*/}

                {/* Booking */}
                <Route path="/offerings/:offeringId" element={<ProviderProfilePage/>} />
                <Route path="/offerings/:offeringId/booking/:step" element={<BookingPage/>} />
                <Route path="/select-availability" element={<SelectAvailabilityPage/>}/>
                <Route path="/update-timeslot" element={<UpdateTimeslot/>}/>
                <Route path="/becomepro" element={<BecomeProPage/>}/>



                {/*booking*/}
                {/* <Route path="/offerings/:offeringId" element={<ProviderProfilePage/>}/>
                <Route path="/offerings/:offeringId/booking/:step" element={<BookingPage/>}/> */}
                <Route path="/confirmation/:requestId/:type" element={<ConfirmationPage/>}/>

                {/*todo: get this once it's done*/}
                <Route path="/jobs/:jobId" element={<JobDetailsPage />} />

                {/*old ones*/}
                {/*<Route path="/create-account-or-sign-in" element={<CreateAccountOrSignIn/>}/>*/}
                {/*<Route path="/update-profile" element={<UpdateProfile/>}/>*/}
                {/*<Route path="/review-and-confirm" element={<ReviewAndConfirm/>}/>*/}

                {/*<Route path="/listsLandingPage" element={<ListsLandingPage/>}/>*/}
                <Route path="/update-timeslot/" element={<UpdateTimeslot/>}/>
                <Route path="/proposeNewTime" element={<ProposeNewtimePage/>}/>
                <Route path="/write-reviews" element={<ReviewPage/>}/>
                <Route path="/faq" element={<FAQPage/>}/>

                <Route path="/admin" element={<AdminHomePage/>}/>
                <Route path="/admin/verifyCertificate" element={<VerifyCertificatePage/>}/>
                <Route path="/admin/UserData" element={<AdminUserDataPage/>}/>

                <Route path="/unauthorized" element={<ErrorPage title="Unauthorized Access" message="You do not have permission to view this page." />} />
                <Route path="*" element={<ErrorPage title="404 Not Found" message="The page you are looking for does not exist." />} />
                {/*<Route path="*" element={<h1>Not Found</h1>}/>*/}
            </Routes>
        </div>
    );
}

export default App;
