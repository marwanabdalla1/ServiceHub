import React, {useEffect, useState} from 'react';
import {Tabs, Tab, Box, Container} from '@mui/material';
import {useNavigate, useLocation, Outlet} from "react-router-dom";

// combined page for the outgoing requests and received jobs table
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

    // go to corresponding table when changing tabs
    const handleChange = (event: any, newValue: any) => {
        setSelectedTab(newValue);

        if (newValue === 0) {
            navigate('/outgoing/requests');
        } else if (newValue === 1) {
            navigate('/outgoing/jobs');
        }
    };

    return (

        <div style={{display: 'flex', width: '100%', overflow: 'hidden'}}>
            <Box sx={{width: '15%', minWidth: '100px', position: 'fixed', flexShrink: 0.5, height:'100vh', overflowY:'hidden', borderRight: 0, borderColor: 'divider', paddingTop: 3, paddingLeft: 2}}>
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
            <Box sx={{
                flex: 1,
                p: 1,
                ml: '15%',
                overflowY: 'hidden', //for independent vertical scrolling
            }}>
                    {/*display the corresponding table*/}
                    <Outlet/>
                </Box>
        </div>
    );
}

export default CombinedOutgoingPage;
