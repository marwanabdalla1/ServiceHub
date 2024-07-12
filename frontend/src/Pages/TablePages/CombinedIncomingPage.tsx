import React, {useEffect, useState} from 'react';
import {Tabs, Tab, Box, Container} from '@mui/material';
import IncomingRequestsTable from './IncomingRequestsTable';
import OfferedServicesTable from './OfferedServicesPage';
import {useNavigate, useLocation, Outlet} from "react-router-dom";
import AlertCustomized from "../../components/AlertCustomized";
import useAlert from "../../hooks/useAlert";

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


    const handleChange = (event: any, newValue: any) => {
        setSelectedTab(newValue);

        if (newValue === 0) {
            navigate('/incoming/requests');
        } else if (newValue === 1) {
            navigate('/incoming/jobs');
        }
    };

    return (

        // <Container sx={{ p: 0, m: 1 }}>
        <div  style={{display: 'flex', width: '100%'}}>
                <Box sx={{width: '180px', position: 'sticky', flexShrink: 0, height:'100vh', overflowY:'hidden', borderRight: 0, borderColor: 'divider', paddingTop: 3, paddingLeft: 2}}>
                    <Tabs
                        orientation="vertical"
                        // variant="scrollable"
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
                    overflowY: 'hidden', //for independent vertical scrolling
                }}>
                    <Outlet/>
                </Box>
        {/*</Container>*/}
        </div>
    );
}

export default CombinedServicePage;
