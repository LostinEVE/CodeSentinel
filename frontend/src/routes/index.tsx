import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/Layout';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('../pages/HomePage'));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const ScanHistoryPage = React.lazy(() => import('../pages/ScanHistoryPage'));
const TeamAccessPage = React.lazy(() => import('../pages/TeamAccessPage'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'));
const AboutPage = React.lazy(() => import('../pages/AboutPage'));
const HelpPage = React.lazy(() => import('../pages/HelpPage'));

const LoadingSpinner = (): React.ReactElement => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

export function AppRoutes(): React.ReactElement {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="scans" element={<ScanHistoryPage />} />
          <Route path="team" element={<TeamAccessPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
