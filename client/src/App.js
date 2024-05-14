import React from 'react';
import NavigationBar from './components/Navbar';
function App() {
  return (
    <div className="text-center p-6">
      <NavigationBar/>
      <header className="bg-blue-500 text-white p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold">Welcome to React with Tailwind CSS</h1>
      </header>      
    </div>
  );
}

export default App;
