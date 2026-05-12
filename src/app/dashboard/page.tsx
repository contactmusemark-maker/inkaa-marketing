import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardHeader from '../components/DashboardHeader';
import KPIBentoGrid from '../components/KPIBentoGrid';
import RevenueChart from '../components/RevenueChart';
import ProjectStatusChart from '../components/ProjectStatusChart';
import RecentActivity from '../components/RecentActivity';
import RecentQuotations from '../components/RecentQuotations';
import TasksOverview from '../components/TasksOverview';
import AIPromoCard from '../components/AIPromoCard';

export default function DashboardPage() {
  return (
    <AppLayout
      title="Dashboard"
      subtitle="Your live business overview will appear as customer data is added."
    >
      <DashboardHeader />
      <KPIBentoGrid />

      {/* Middle row: Revenue Chart + Project Status + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        <div className="lg:col-span-7">
          <RevenueChart />
        </div>
        <div className="lg:col-span-5 grid grid-rows-1">
          <ProjectStatusChart />
        </div>
      </div>

      {/* Bottom row: Quotations + Tasks + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        <div className="lg:col-span-7">
          <RecentQuotations />
        </div>
        <div className="lg:col-span-5 flex flex-col gap-5">
          <RecentActivity />
          <TasksOverview />
        </div>
      </div>

      <AIPromoCard />
    </AppLayout>
  );
}
