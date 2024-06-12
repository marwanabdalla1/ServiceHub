import React from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/Card';
import account, {Account} from '../models/Account';
import JobHistoryTable from '../components/JobHistoryTable';


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
