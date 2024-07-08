import React, {useState} from 'react';
import {Tabs, Tab, Box} from '@mui/material';
import IncomingRequestsTable from './TablePages/IncomingRequestsTable';
import OfferedServicesTable from './TablePages/OfferedServicesTable';
import {useNavigate, Outlet} from "react-router-dom";

function CombinedServicePage() {
    const [selectedTab, setSelectedTab] = useState(0);
    const navigate = useNavigate();

    const handleChange = (event: any, newValue: any) => {
        setSelectedTab(newValue);

        if (newValue === 0) {
            navigate('/incoming/requests');
        } else if (newValue === 1) {
            navigate('/incoming/jobs');
        }
    };

    return (

        <Box sx={{display: 'flex', height: '100vh'}}>
            <Box sx={{width: '200px', borderRight: 1, borderColor: 'divider', paddingTop: 3}}>
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
                    <Tab label="Incoming Requests"/>
                    <Tab label="Offered Services (Jobs)"/>
                </Tabs>
            </Box>
            <Box sx={{flex: 1, p: 3}}>
            {/*    {selectedTab === 0 && <IncomingRequestsTable/>}*/}
            {/*    {selectedTab === 1 && <OfferedServicesTable/>}*/}
            <Outlet />
            </Box>
        </Box>
    );
}

export default CombinedServicePage;
