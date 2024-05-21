import React from 'react';
import { BrowserRouter,Routes, Route } from "react-router-dom";
import FilterPage from './Pages/FilterPage';
import ProfilePage from './Pages/ProfilePage';
import NavigationBar from './components/Navbar';
function App() {

    return <BrowserRouter>
          <NavigationBar />
      <Routes>
          <Route path="/" element={<FilterPage/>} />   
          <Route path="/profile" element={<ProfilePage/>} />
      </Routes>
      </BrowserRouter>
    // <FilterPage/>
  
}

export default App;
