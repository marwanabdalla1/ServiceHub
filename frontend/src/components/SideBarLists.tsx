import React from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';
import JobHistoryPage from '../Pages/JobHistoryPage';
import RequestHistoryPage from '../Pages/RequestHistoryPage';
import IncomingRequestsPage from '../Pages/IncomingRequestsPage';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <Drawer
    variant="permanent"
    sx={{
      width: '10px',
      flexShrink: 0,
      [`& .MuiDrawer-paper`]: { width: '200px', boxSizing: 'border-box', top: '80px' }, // Adjust top for navbar height
    }}>
      <List>
        <ListItem button component={Link} to="/jobs/jobHistory">
          <ListItemText primary="Job History" />
        </ListItem>
        <ListItem button component={Link} to="/jobs/requestHistory">
          <ListItemText primary="Request History" />
        </ListItem>
        <ListItem button component={Link} to="/incomingRequests">
          <ListItemText primary="Incoming Requests" />
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Sidebar;
