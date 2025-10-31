import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AttendanceTaker from './components/AttendanceTaker';
import FeesManager from './components/FeesManager';
import AdminDashboard from './components/AdminDashboard';
import StudentManager from './components/StudentManager';
import ReportsDashboard from './components/ReportsDashboard';
import { DataProvider } from './hooks/useMockData';

type View = 'attendance' | 'students' | 'fees' | 'admin' | 'reports';
export type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [view, setView] = useState<View>('attendance');
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    const renderView = () => {
        switch (view) {
            case 'attendance':
                return <AttendanceTaker />;
            case 'students':
                return <StudentManager />;
            case 'fees':
                return <FeesManager />;
            case 'admin':
                return <AdminDashboard />;
            case 'reports':
                return <ReportsDashboard />;
            default:
                return <AttendanceTaker />;
        }
    };

    return (
        <DataProvider>
            <div className="min-h-screen bg-base-100 dark:bg-d-base-100 text-text-primary dark:text-d-text-primary transition-colors duration-300">
                <Header currentView={view} setView={setView} theme={theme} setTheme={setTheme} />
                <main className="p-4 sm:p-6 lg:p-8">
                    {renderView()}
                </main>
            </div>
        </DataProvider>
    );
};

export default App;