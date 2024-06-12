import React from 'react';
import JobHistoryPage from './JobHistoryPage';
import RequestHistoryPage from './RequestHistoryPage';
import { Account } from '../models/Account';
import account from '../models/Account';
import Sidebar from '../components/SideBarLists';

function LandingPage() {
  const currentUser = account; // Replace with actual logic

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '20px', marginLeft: '200px' }}>
        {currentUser.isProvider ? <JobHistoryPage /> : <RequestHistoryPage />}
      </div>
    </div>
  );
}

export default LandingPage;
