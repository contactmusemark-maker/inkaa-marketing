import React from 'react';
import AppLayout from '@/components/AppLayout';
import ClientManagementScreen from './components/ClientManagementScreen';

export default function ClientManagementPage() {
  return (
    <AppLayout title="Clients" subtitle="Manage your agency's client relationships and accounts.">
      <ClientManagementScreen />
    </AppLayout>
  );
}
