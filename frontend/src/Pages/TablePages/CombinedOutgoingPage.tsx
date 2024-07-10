import React, {useEffect, useState} from 'react';
import {Tabs, Tab, Box, Container} from '@mui/material';
import IncomingRequestsTable from './IncomingRequestsTable';
import OfferedServicesTable from './OfferedServicesTable';
import {useNavigate, useLocation, Outlet} from "react-router-dom";
import AlertCustomized from "../../components/AlertCustomized";
import useAlert from "../../hooks/useAlert";

function CombinedOutgoingPage() {
    const [selectedTab, setSelectedTab] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    // navigate according to URL path
    useEffect(() => {
        // Adjust the tab index based on the current path
        const path = location.pathname.split('/').pop(); // Gets the last segment of the URL
        if (path === 'requests') {
            setSelectedTab(0);
        } else if (path === 'jobs') {
            setSelectedTab(1);
        }
    }, [location.pathname]);

    const handleChange = (event: any, newValue: any) => {
        setSelectedTab(newValue);

        if (newValue === 0) {
            navigate('/outgoing/requests');
        } else if (newValue === 1) {
            navigate('/outgoing/jobs');
        }
    };

    return (

        // <Container sx={{ p: 0, m: 1 }}>
        <div style={{display: 'flex', width: '100%', overflow: 'hidden'}}>
                <Box sx={{
                    width: '180px',
                    flexShrink: 0,
                    overflowY: 'hidden',
                    position: 'sticky',
                    borderRight: 0,
                    borderColor: 'divider',
                    paddingTop: 3,
                    paddingLeft: 2
                }}>
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={selectedTab}
                        onChange={handleChange}
                        aria-label="Vertical tabs example"
                        sx={{
                            borderRight: 1,
                            borderColor: 'divider',
                            '& .MuiTab-root': {textTransform: 'none', marginTop: 2}
                        }}
                    >
                        <Tab label="Requests Sent"/>
                        <Tab label="Services (Jobs) Received"/>
                    </Tabs>
                </Box>
                <Box sx={{flex: 1, p: 1, overflowY: 'hidden'}}>
                    {/*    {selectedTab === 0 && <IncomingRequestsTable/>}*/}
                    {/*    {selectedTab === 1 && <OfferedServicesTable/>}*/}
                    <Outlet/>
                </Box>
            {/*</Container>*/}
        </div>
    );
}

export default CombinedOutgoingPage;
