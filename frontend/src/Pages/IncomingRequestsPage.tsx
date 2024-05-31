import React from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/Card';
import {users, User} from '../models/Account';
import IncomingRequestsTable from '../components/IncomingRequestsTable';
import { Request } from '../models/Request';


function IncomingRequestsPage() {
  return (
    <div>
      <IncomingRequestsTable />
    </div>
  );
}

export default IncomingRequestsPage;
