import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PreLoginPage from './pages/PreLoginPage';
import DashboardPage from './pages/DashboardPage';
import AttendanceMarkingPage from './pages/AttendanceMarkingPage';
import StudentDirectoryPage from './pages/StudentDirectoryPage';
import StudentRegistrationPage from './pages/StudentRegistrationPage';
import SettingsPage from './pages/SettingsPage';
import Header from './components/Header';
import NavigationDock from './components/NavigationDock';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  // If not authenticated, show the approved Pre-Login Gate
  if (!isAuthenticated) {
    return <PreLoginPage />;
  }

  const titles = {
    dashboard: 'Dashboard',
    attendance: 'Roll Call',
    students: 'Directory',
    settings: 'Settings'
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-2 sm:p-4 relative overflow-x-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="orb-light-1"></div>
      <div className="orb-light-2"></div>

      {/* Main Container */}
      <div className="w-full max-w-[420px] min-h-[825px] flex flex-col relative z-10 transition-all">
        <Header
          activeTabTitle={titles[activeTab]}
          onOpenNewAdmission={() => setIsRegistrationModalOpen(true)}
        />

        <main className="flex-1 px-4 pt-3.5 relative">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigateTab={setActiveTab}
              onOpenNewAdmission={() => setIsRegistrationModalOpen(true)}
            />
          )}
          {activeTab === 'attendance' && <AttendanceMarkingPage />}
          {activeTab === 'students' && (
            <StudentDirectoryPage
              onOpenNewAdmission={() => setIsRegistrationModalOpen(true)}
            />
          )}
          {activeTab === 'settings' && <SettingsPage />}
        </main>

        <NavigationDock activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Student Registration Modal Overlay */}
      {isRegistrationModalOpen && (
        <StudentRegistrationPage
          onClose={() => setIsRegistrationModalOpen(false)}
          onRegistrationComplete={(student) => {
            setIsRegistrationModalOpen(false);
            setActiveTab('students');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
