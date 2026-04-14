/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Registry from './components/Registry';
import Triage from './components/Triage';
import Tracking from './components/Tracking';
import Login from './components/Login';
import PatientAdmission from './components/PatientAdmission';
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
  const [isLoading, setIsLoading] = React.useState(true);

  // Supabase Session Listener
  React.useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setUser(data);
        if (data.role === 'reception') setActiveTab('admission');
      }
      setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setActiveTab('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-navy animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse">SISA - Carregando Sistema...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const permissions: Record<string, string[]> = {
    admin: ['dashboard', 'admission', 'registry', 'scheduling', 'triage', 'laboratory', 'beds', 'pharmacy', 'hr', 'tracking', 'stats', 'finance'],
    doctor: ['dashboard', 'registry', 'scheduling', 'triage', 'laboratory', 'beds'],
    nurse: ['dashboard', 'admission', 'registry', 'triage', 'beds', 'pharmacy', 'tracking'],
    reception: ['admission', 'registry', 'scheduling', 'finance']
  };

  const hasPermission = (tab: string) => {
    return permissions[user.role]?.includes(tab);
  };

  const renderContent = () => {
    if (!hasPermission(activeTab)) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
          <div className="p-4 bg-slate-100 rounded-full">
            <Lock className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold">Acesso Restrito</h2>
          <p>Você não tem permissão para acessar este módulo.</p>
          <button 
            onClick={() => setActiveTab(permissions[user.role][0])}
            className="px-6 py-2 bg-navy text-white rounded-xl font-bold"
          >
            Voltar para Início
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'admission':
        return <PatientAdmission />;
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
        return <Dashboard user={user} />;
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

