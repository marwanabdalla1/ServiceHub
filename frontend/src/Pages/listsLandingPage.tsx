import React from 'react';
import JobHistoryPage from './ReceivedServicesPage';
import RequestHistoryPage from './RequestHistoryPage';
import { Account } from '../models/Account';
import {useAuth} from "../contexts/AuthContext";

function LandingPage() {
  const {token, account} = useAuth(); // todo: Replace with actual logic

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, padding: '20px', marginLeft: '200px' }}>
        {account?.isProvider ? <JobHistoryPage /> : <RequestHistoryPage />}
      </div>
    </div>
  );
}

export default LandingPage;
