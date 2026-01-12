// FILE: src/OrganizationApp.jsx
// 🏢 Complete Organization Admin Experience - SEPARATE from user app

import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import AdminDashboard from './enterprise/AdminDashboard';
import TherapistDashboard from './enterprise/TherapistDashboard';
import AdminUserManagement from './enterprise/AdminUserManagement';
import ConsentManager from './enterprise/ConsentManager';
import BillingManagement from './enterprise/BillingManagement';
import ROIDashboard from './enterprise/ROIDashboard';
import { useEnterprise } from './enterprise/EnterpriseContext';

const OrganizationApp = ({ user, setUser }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { organization, isTherapist, therapistId } = useEnterprise();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard organizationId={user.organizationId} />;
      case 'users':
        return <AdminUserManagement onBack={() => setCurrentView('dashboard')} />;
      case 'consents':
        return <ConsentManager onBack={() => setCurrentView('dashboard')} />;
      case 'billing':
        return <BillingManagement onBack={() => setCurrentView('dashboard')} />;
      case 'roi':
        return <ROIDashboard onBack={() => setCurrentView('dashboard')} />;
      case 'therapist':
        return <TherapistDashboard
          organizationId={user.organizationId}
          therapistId={therapistId}
          onBack={() => setCurrentView('dashboard')}
        />;
      default:
        return <AdminDashboard organizationId={user.organizationId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50 to-blue-100">
      {/* Org Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏢</span>
            <div>
              <h1 className="font-bold text-xl">{organization?.name || 'Organization'}</h1>
              <p className="text-purple-200 text-sm">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-mono">
              Code: {organization?.accessCode || 'Loading...'}
            </span>
            <div className="text-right text-sm">
              <p className="font-medium">{user.name || user.displayName}</p>
              <p className="text-purple-200 text-xs">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Org Admin Navigation */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex gap-2 p-2 overflow-x-auto">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'users', icon: '👥', label: 'Members' },
            { id: 'consents', icon: '📋', label: 'Consents' },
            { id: 'billing', icon: '💳', label: 'Billing' },
            { id: 'roi', icon: '📈', label: 'ROI' },
            ...(isTherapist ? [{ id: 'therapist', icon: '👨‍⚕️', label: 'Therapist View' }] : []),
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-2 whitespace-nowrap ${
                currentView === tab.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {renderView()}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-auto p-4 text-center text-gray-500 text-sm">
        <p>YRNAlone Enterprise - You aRe Not Alone 💜</p>
      </div>
    </div>
  );
};

export default OrganizationApp;
