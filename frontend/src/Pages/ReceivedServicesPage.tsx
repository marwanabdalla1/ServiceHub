import React from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/ProfileCard';
import ReceivedServiceTable from '../components/ReceivedServiceTable';


function ReceivedServicePage() {
  return (
  <div style={{ display: 'flex' }}>
  <div style={{ flex: 1, padding: '20px' }}>
  <ReceivedServiceTable />
  </div>
</div>
  );
}

export default ReceivedServicePage;
