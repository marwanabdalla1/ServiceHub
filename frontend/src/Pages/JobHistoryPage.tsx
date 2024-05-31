import React from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/Card';
import {users, User} from '../models/Account';
import JobHistoryTable from '../components/JobHistoryTable';


function JobHistoryPage() {
  return (
    <div>
    <JobHistoryTable />
  </div>
  );
}

export default JobHistoryPage;
