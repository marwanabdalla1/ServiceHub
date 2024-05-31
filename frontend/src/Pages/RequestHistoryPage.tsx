import React from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/Card';
import {users, User} from '../models/Account';
import RequestHistoryTable from '../components/RequestHistoryTable';
import { Request } from '../models/Request';


function RequestHistoryPage() {
  return (
    <div>
      <RequestHistoryTable />
    </div>
  );
}

export default RequestHistoryPage;
