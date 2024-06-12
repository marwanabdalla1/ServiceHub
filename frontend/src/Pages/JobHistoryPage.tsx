import React from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/Card';
import {users, User} from '../models/Account';
import JobHistoryTable from '../components/JobHistoryTable';
import Sidebar from '../components/SideBarLists';


function JobHistoryPage() {
  return (
  <div style={{ display: 'flex' }}>
  <div style={{ flex: 1, padding: '20px' }}>
  <JobHistoryTable />
  </div>
</div>
  );
}

export default JobHistoryPage;
