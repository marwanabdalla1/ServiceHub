import React, {useState} from 'react';
import {Tabs, Tab, Box, Container} from '@mui/material';
import IncomingRequestsTable from './IncomingRequestsTable';
import OfferedServicesTable from './OfferedServicesTable';
import {useNavigate, Outlet} from "react-router-dom";
import AlertCustomized from "../../components/AlertCustomized";
import useAlert from "../../hooks/useAlert";

function CombinedOutgoingPage() {
    const [selectedTab, setSelectedTab] = useState(0);
    const navigate = useNavigate();

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
        <div>
            <Box sx={{display: 'flex', width: '100%', height: '100vh'}}>
                <Box sx={{width: '180px', flexShrink: 0, borderRight: 0, borderColor: 'divider', paddingTop: 3, paddingLeft: 2}}>
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
                        <Tab label="Sent Requests"/>
                        <Tab label="Confirmed Services (Jobs)"/>
                    </Tabs>
                </Box>
                <Box sx={{flex: 1, p: 1}}>
                    {/*    {selectedTab === 0 && <IncomingRequestsTable/>}*/}
                    {/*    {selectedTab === 1 && <OfferedServicesTable/>}*/}
                    <Outlet/>
                </Box>
            </Box>
        {/*</Container>*/}
        </div>
    );
}

export default CombinedOutgoingPage;
