import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import IncomingRequestsTable from '../components/IncomingRequestsTable';
import ReceivedServiceTable from '../components/ReceivedServiceTable';

function CombinedServicePage() {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChange = (event: any, newValue:any) => {
    setSelectedTab(newValue);
  };

  return (

    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box sx={{ width: '200px', borderRight: 1, borderColor: 'divider' }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={selectedTab}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{ borderRight: 1, borderColor: 'divider' }}
        >
          <Tab label="Incoming Requests" />
          <Tab label="Received Services" />
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, p: 3 }}>
        {selectedTab === 0 && <IncomingRequestsTable />}
        {selectedTab === 1 && <ReceivedServiceTable />}
      </Box>
    </Box>
  );
}

export default CombinedServicePage;
