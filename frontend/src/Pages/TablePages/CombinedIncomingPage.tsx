import React, {useEffect, useState} from 'react';
import {Tabs, Tab, Box, Container} from '@mui/material';
import {useNavigate, useLocation, Outlet} from "react-router-dom";

function CombinedServicePage() {
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


    // go to the corresponding table when changing tabs
    const handleChange = (event: any, newValue: any) => {
        setSelectedTab(newValue);

        if (newValue === 0) {
            navigate('/incoming/requests');
        } else if (newValue === 1) {
            navigate('/incoming/jobs');
        }
    };

    return (

        <div  style={{display: 'flex', width: '100%'}}>
                <Box sx={{width: '15%', minWidth: '100px', position: 'fixed', flexShrink: 0.5, height:'100vh', overflowY:'hidden', borderRight: 0, borderColor: 'divider', paddingTop: 3, paddingLeft: 2}}>
                    <Tabs
                        orientation="vertical"
                        value={selectedTab}
                        onChange={handleChange}
                        aria-label="Vertical tabs"

                        sx={{
                            borderRight: 1,
                            borderColor: 'divider',
                            '& .MuiTab-root': {textTransform: 'none', marginTop: 2}
                        }}
                    >
                        <Tab label="Incoming Requests"/>
                        <Tab label="Offered Services (Jobs)"/>
                    </Tabs>
                </Box>
                <Box sx={{
                    flex: 1,
                    p: 1,
                    ml: '15%',
                    overflowY: 'hidden', //for independent vertical scrolling
                }}>
                    {/*the two incoming pages*/}
                    <Outlet/>
                </Box>
        </div>
    );
}

export default CombinedServicePage;
