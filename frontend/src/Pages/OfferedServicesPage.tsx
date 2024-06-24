import React from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/ProfileCard';
import {users, User} from '../models/Account';
import OfferedServicesTable from '../components/OfferedServicesTable';


function OfferedServicesPage() {
  return (
  <div style={{ display: 'flex' }}>
  <div style={{ flex: 1, padding: '20px' }}>
  <OfferedServicesTable />
  </div>
</div>
  );
}

export default OfferedServicesPage;
