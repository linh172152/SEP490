'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { CaregiverDashboard } from '@/components/dashboard/CaregiverDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard'; // Fixed import
import { FamilyDashboard } from '@/components/dashboard/FamilyDashboard'; // Will rename component later
import { elderlyService } from '@/services/api/elderlyService';
import { caregiverService } from '@/services/api/caregiverService';
import { reminderService } from '@/services/api/reminderService';

function ApiTestPanel() {
  const [data, setData] = useState<{ elderly?: any, caregiver?: any, reminders?: any, logs?: any }>({});
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      const elderly = await elderlyService.getAll();
      const caregiver = await caregiverService.getById(11).catch(() => 'Access Denied');
      const reminders = await reminderService.getAll().catch(() => 'Access Denied / Not Created');
      const logs = await reminderService.getAllLogs().catch(() => 'Access Denied / No Logs');
      
      setData({ elderly, caregiver, reminders, logs });
    } catch (err: any) {
      setData({ elderly: 'Error', caregiver: err.message, reminders: 'Error', logs: 'Error' });
    }
    setLoading(false);
  };

  return (
    <div className="mb-4 rounded-lg bg-white p-4 shadow">
      <h3 className="mb-2 font-bold text-lg text-primary">API Verification Panel</h3>
      <button 
        onClick={testApi} 
        disabled={loading}
        className="rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? 'Testing API...' : 'Run API Test'}
      </button>
      {Object.keys(data).length > 0 && (
        <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded bg-gray-100 p-2 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const currentUser = useAuthStore((state) => state.user);

  if (!currentUser) return null;

  let dashboardComponent = null;

  switch (currentUser.role) {
    case 'CAREGIVER':
      dashboardComponent = <CaregiverDashboard />;
      break;
    case 'ADMIN':
      dashboardComponent = <AdminDashboard />;
      break;
    case 'MANAGER':
      dashboardComponent = <ManagerDashboard />;
      break;
    case 'ELDERLY':
      dashboardComponent = <FamilyDashboard />; // To be renamed to ElderlyDashboard
      break;
    default:
      dashboardComponent = <div>Role "{currentUser.role}" not recognized</div>;
  }

  return (
    <>
      <ApiTestPanel />
      {dashboardComponent}
    </>
  );
}
