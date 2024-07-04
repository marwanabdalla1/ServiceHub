import React from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/ProfileCard';
import IncomingRequestsTable from '../components/IncomingRequestsTable';


function IncomingRequestsPage() {
  return (
    <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: '20px' }}>
    <IncomingRequestsTable />
    </div>
  </div>
  );
}

export default IncomingRequestsPage;
