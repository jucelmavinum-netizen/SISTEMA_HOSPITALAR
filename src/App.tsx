/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Registry from './components/Registry';
import Triage from './components/Triage';
import Tracking from './components/Tracking';
import Login from './components/Login';
import BedsManagement from './components/BedsManagement';
import PharmacyStock from './components/PharmacyStock';
import HumanResources from './components/HumanResources';
import Statistics from './components/Statistics';
import Finance from './components/Finance';
import Scheduling from './components/Scheduling';
import Laboratory from './components/Laboratory';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isOffline, setIsOffline] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);

  // Simulate offline status toggle for demo purposes
  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'registry':
        return <Registry />;
      case 'scheduling':
        return <Scheduling />;
      case 'triage':
        return <Triage />;
      case 'laboratory':
        return <Laboratory />;
      case 'beds':
        return <BedsManagement />;
      case 'pharmacy':
        return <PharmacyStock />;
      case 'hr':
        return <HumanResources />;
      case 'tracking':
        return <Tracking />;
      case 'stats':
        return <Statistics />;
      case 'finance':
        return <Finance />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isOffline={isOffline}
      user={user}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}

