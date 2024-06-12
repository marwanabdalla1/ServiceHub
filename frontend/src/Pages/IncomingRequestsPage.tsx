import React from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/Card';
import account, {Account} from '../models/Account';
import IncomingRequestsTable from '../components/IncomingRequestsTable';
import { Request } from '../models/Request';

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
