import React from 'react';
import { BrowserRouter,Routes, Route } from "react-router-dom";

import FilterPage from './Pages/FilterPage';
import ProfilePage from './Pages/ProfilePage';
import RequestHistoryPage from './Pages/RequestHistoryPage';
import JobHistoryPage from './Pages/JobHistoryPage';
import IncomingRequestsPage from './Pages/IncomingRequestsPage';

import NavigationBar from './components/Navbar';



function App() {

    return <BrowserRouter>
          <NavigationBar />
      <Routes>
          <Route path="/" element={<FilterPage/>} />   
          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/jobs/jobHistory" element={<JobHistoryPage/>} />
          <Route path="/jobs/requestHistory" element={<RequestHistoryPage/>} />
          <Route path="/incomingRequests" element={<IncomingRequestsPage/>} />
      </Routes>
      </BrowserRouter>
    // <FilterPage/>
  
}

export default App;
