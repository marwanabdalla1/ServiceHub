import React from 'react';
import { BrowserRouter,Routes, Route } from "react-router-dom";
import FilterPage from './Pages/FilterPage';
import ProfilePage from './Pages/ProfilePage';
import NavigationBar from './components/Navbar';
import SelectTimeslot from './Pages/bookingSteps/SelectTimeslotPage'
import {BookingProvider} from "./context/BookingContext";
import UpdateProfile from "./Pages/bookingSteps/UpdateProfile";
import ReviewAndConfirm from "./Pages/bookingSteps/ReviewAndConfirm";
import CreateAccountOrSignIn from "./Pages/bookingSteps/CreateAccountOrSignIn";
function App() {

    return (
        <BookingProvider>
            <BrowserRouter>
          <NavigationBar />

      <Routes>
          <Route path="/" element={<FilterPage/>} />   
          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/select-timeslot" element={<SelectTimeslot/>} />
          <Route path="/create-account-or-sign-in" element={<CreateAccountOrSignIn />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/review-and-confirm" element={<ReviewAndConfirm />} />

      </Routes>
      </BrowserRouter>

        </BookingProvider>
    )
    // <FilterPage/>
  
}

export default App;
