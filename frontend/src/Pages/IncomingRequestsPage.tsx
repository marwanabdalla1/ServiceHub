import React from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/Card';
import {users, User} from '../models/Account';
import IncomingRequestsTable from '../components/IncomingRequestsTable';
import Sidebar from '../components/SideBarLists';


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
