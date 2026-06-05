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
import Imaging from './components/Imaging';
import PEP from './components/PEP';
import Telemedicine from './components/Telemedicine';

export default function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isOffline, setIsOffline] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Supabase Session Listener
  React.useEffect(() => {
    const fetchProfile = async (userId: string, sessionUser: any) => {
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // 1. If profile doesn't exist in the database, create one from metadata
      if (error || !profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .update({
            full_name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0],
            role: sessionUser.user_metadata?.role || 'reception',
            hospital: 'Hospital Geral'
          })
          .eq('id', userId)
          .select()
          .single();
        
        // If update failed (non-existent), try insert (upsert)
        if (createError || !newProfile) {
          const { data: upsertedProfile } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              full_name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0],
              role: sessionUser.user_metadata?.role || 'reception',
              hospital: 'Hospital Geral'
            }, { onConflict: 'id' })
            .select()
            .single();
          profile = upsertedProfile;
        } else {
          profile = newProfile;
        }
      }

      // 2. Critical Role Synchronization: Always trust Auth Metadata as the source of truth for Roles
      const metaRole = sessionUser.user_metadata?.role;
      if (profile && metaRole && profile.role !== metaRole) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ role: metaRole })
          .eq('id', userId)
          .select()
          .single();
        
        if (!updateError && updatedProfile) {
          profile = updatedProfile;
        }
      }

      if (profile) {
        setUser(profile);
        if (profile.role === 'reception') setActiveTab('admission');
      } else {
        // 3. Last Resort Fallback (Metadata only)
        setUser({
          id: userId,
          full_name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0],
          role: metaRole || 'reception',
          hospital: 'Hospital Geral'
        });
      }
      setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id, session.user);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id, session.user);
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
    admin: ['dashboard', 'admission', 'registry', 'scheduling', 'triage', 'pep', 'laboratory', 'imaging', 'beds', 'pharmacy', 'hr', 'tracking', 'stats', 'finance', 'telemedicine'],
    doctor: ['dashboard', 'registry', 'scheduling', 'triage', 'pep', 'laboratory', 'imaging', 'beds', 'telemedicine'],
    nurse: ['dashboard', 'admission', 'registry', 'triage', 'pep', 'beds', 'pharmacy', 'tracking'],
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
        return <Dashboard user={user} setActiveTab={setActiveTab} />;
      case 'admission':
        return <PatientAdmission />;
      case 'registry':
        return <Registry setActiveTab={setActiveTab} />;
      case 'scheduling':
        return <Scheduling />;
      case 'triage':
        return <Triage />;
      case 'pep':
        return <PEP />;
      case 'laboratory':
        return <Laboratory />;
      case 'imaging':
        return <Imaging />;
      case 'telemedicine':
        return <Telemedicine />;
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
        return <Dashboard user={user} setActiveTab={setActiveTab} />;
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

