import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import FilterPage from './Pages/FilterPage';
import SignInPage from './Pages/AuthPages/LoginPage';
import SignUpPage from './Pages/AuthPages/SignUpPages/SignUpPage';
import NavigationBar from './components/Navbar';
import AdminNavbar from "./components/adminComponents/AdminNavbar";
import HomePage from './Pages/HomePage';
import ProviderProfilePage from "./Pages/ProviderProfilePage";
import ProfileSettingPage from "./Pages/ProfileSettingPage";
import SelectAvailabilityPage from './Pages/SelectAvailabilityPage';
import { BookingProvider } from "./contexts/BookingContext";
import axios from "axios";
import { AccountProvider } from "./contexts/AuthContext";
import BookingPage from "./Pages/BookingPage";
import ConfirmationPage from "./components/bookingSteps/ConfirmationPage";
import FAQPage from "./Pages/FAQPage";
import BecomeProPage from './Pages/BecomePro';
import ResetPasswordPage from "./Pages/AuthPages/ForgetPasswordPages/ResetPasswordPage";
import OTPPage from "./Pages/AuthPages/ForgetPasswordPages/OTPPage";
import OTPSignUpPage from "./Pages/AuthPages/SignUpPages/OTPSignUpPage";
import ForgetPasswordPage from "./Pages/AuthPages/ForgetPasswordPages/ForgetPasswordPage";
import ResetPasswordSuccessPage from "./Pages/AuthPages/ForgetPasswordPages/ResetPasswordSuccessPage";
import ChangeBookingTimePage from './Pages/ChangeBookingTimePage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Slide } from "react-toastify";
import VerifyCertificatePage from "./Pages/AdminPanel/VerifyCertificatePage";
import AdminUserDataPage from "./Pages/AdminPanel/UserDataPages/AdminUserDataPage";
import AdminHomePage from "./Pages/AdminPanel/AdminHomePage";
import ErrorPage from "./Pages/ErrorPage";
import ViewUserDataPage from "./Pages/AdminPanel/UserDataPages/ViewUserDataPage";
import Footer from './components/Footer';
import { Divider } from '@mui/material';
import UpdateSProfile from './components/UpdateSProfile';
import AddServicePage from './Pages/AddServicePage';
import OfferedServicesTable from "./Pages/TablePages/OfferedServicesPage";
import IncomingRequestsTable from "./Pages/TablePages/IncomingRequestsPage";
import RequestHistoryTable from "./Pages/TablePages/OutgoingRequestsPage";
import ReceivedServiceTable from "./Pages/TablePages/ReceivedServicePage";
import JobDetailsPage from "./Pages/TablePages/DetailPages/JobDetailsPage";
import RequestDetailsPage from "./Pages/TablePages/DetailPages/RequestDetailsPage";
import CombinedOutgoingPage from "./Pages/TablePages/CombinedOutgoingPage";
import CombinedServicePage from "./Pages/TablePages/CombinedIncomingPage";
import { RecoveryProvider } from "./contexts/RecoveryContext";
import { SocketProvider } from './contexts/SocketContext'; // Import the SocketProvider

function App() {
    const [search, setSearch] = useState('');

    useEffect(() => {
        axios.defaults.baseURL = "http://localhost:8080";
    }, []);

    return (
        <div className="h-screen flex flex-col">
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
                    <AccountProvider>
                        <SocketProvider> {/* Ensure that the AccountProvider wraps the SocketProvider */}
                            <RecoveryProvider>
                                <MainRoutes search={search} setSearch={setSearch} />
                            </RecoveryProvider>
                        </SocketProvider>
                    </AccountProvider>
                </BookingProvider>
            </BrowserRouter>
        </div>
    );
}

function MainRoutes({ search, setSearch }: { search: any, setSearch: any }) {
    const location = useLocation();
    const showNavBar = location.pathname !== "/login"
        && location.pathname !== "/signup"
        && location.pathname !== "/filter"
        && location.pathname !== "/forgetPassword/emailVerification"
        && location.pathname !== "/forgetPassword/resetPassword"
        && location.pathname !== "/forgetPassword"
        && location.pathname !== "/forgetPassword/success"

    const showAdminNavBar = location.pathname.includes("/admin");
    return (
        <div className="h-screen flex flex-col">
            {showNavBar && !showAdminNavBar && <NavigationBar
                toggleDrawer={() => { }}
                onChange={() => { }}
                onSearch={() => { }}
                search={search}
                setSearch={setSearch} />}
            {showAdminNavBar && <AdminNavbar />}
            <div className="h-screen flex flex-col" style={{ paddingTop: '80px' }}>
                <div className="flex-grow">
                    <Routes>
                        {/* Home */}
                        <Route path="/" element={<HomePage />} />

                        {/* User Authentication */}
                        <Route path="/login" element={<SignInPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/signup/otp" element={<OTPSignUpPage />} />

                        {/* User Profile settings */}
                        <Route path="/setprofile" element={<ProfileSettingPage />} />
                        <Route path="/forgetPassword" element={<ForgetPasswordPage />} />
                        <Route path="/forgetPassword/emailVerification" element={<OTPPage />} />
                        <Route path="/forgetPassword/resetPassword" element={<ResetPasswordPage />} />
                        <Route path="/forgetPassword/success" element={<ResetPasswordSuccessPage />} />

                        {/*filtering/searching page*/}
                        <Route path="/filter" element={<FilterPage />} />

                        {/* Add another service/become pro*/}
                        <Route path="/update-sprofile" element={<UpdateSProfile />} />
                        <Route path="/addservice" element={<AddServicePage />} />
                        <Route path="/becomepro" element={<BecomeProPage />} />

                        {/*select availability*/}
                        <Route path="/select-availability" element={<SelectAvailabilityPage />} />

                        {/* provider's offering profile & Booking steps */}
                        <Route path="/offerings/:offeringId" element={<ProviderProfilePage />} />
                        <Route path="/offerings/:offeringId/booking/:step" element={<BookingPage />} />
                        <Route path="/confirmation/:requestId" element={<ConfirmationPage />} />
                        <Route path="/change-booking-time/:requestId" element={<ChangeBookingTimePage />} />

                        {/*request/job tables and corresponding details pages*/}
                        <Route path="/incoming" element={<CombinedServicePage />}>
                            <Route index element={<Navigate replace to="requests" />} />
                            <Route path="requests" element={<IncomingRequestsTable />} />
                            <Route path="jobs" element={<OfferedServicesTable />} />
                        </Route>

                        <Route path="/outgoing" element={<CombinedOutgoingPage />}>
                            <Route index element={<Navigate replace to="requests" />} />
                            <Route path="requests" element={<RequestHistoryTable />} />
                            <Route path="jobs" element={<ReceivedServiceTable />} />
                        </Route>
                        <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
                        <Route path="/incoming/jobs/:jobId" element={<JobDetailsPage />} />
                        <Route path="/outgoing/jobs/:jobId" element={<JobDetailsPage />} />


                        <Route path="/requests/:requestId" element={<RequestDetailsPage />} />
                        <Route path="/incoming/requests/:requestId" element={<RequestDetailsPage />} />
                        <Route path="/outgoing/requests/:requestId" element={<RequestDetailsPage />} />

                        {/*faq*/}
                        <Route path="/faq" element={<FAQPage />} />

                        {/*admin pages*/}
                        <Route path="/admin" element={<AdminHomePage />} />
                        <Route path="/admin/verifyCertificate" element={<VerifyCertificatePage />} />
                        <Route path="/admin/UserData" element={<AdminUserDataPage />} />
                        <Route path="/admin/viewUserData" element={<ViewUserDataPage />} />

                        {/*error pages*/}
                        <Route path="/unauthorized" element={<ErrorPage title="Unauthorized Access"
                            message="You do not have permission to view this page." />} />
                        <Route path="/failedpayment" element={<ErrorPage title="Failed payment"
                            message="Your payment did not go through" />} />
                        <Route path="*" element={<ErrorPage title="404 Not Found"
                            message="The page you are looking for does not exist." />} />
                    </Routes>
                </div>
                <div>
                    <Divider variant="middle" style={{ backgroundColor: 'white', height: '50px' }} />
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default App;
