import React from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/ProfileCard';
import {users, User} from '../models/Account';
import RequestHistoryTable from '../components/RequestHistoryTable';


function RequestHistoryPage() {
  return (
    <div style={{ display: 'flex' }}>
    <div style={{ flex: 1, padding: '20px' }}>
    <RequestHistoryTable />
    </div>
    </div>
  );
}

export default RequestHistoryPage;
