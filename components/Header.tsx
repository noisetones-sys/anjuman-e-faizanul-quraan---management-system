import React from 'react';
import { Theme } from '../App';

type View = 'attendance' | 'students' | 'fees' | 'admin' | 'reports';

interface HeaderProps {
    currentView: View;
    setView: (view: View) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const NavLink: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ isActive, onClick, children }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary dark:text-d-text-secondary hover:bg-base-200 dark:hover:bg-d-base-300'
            }`}
        >
            {children}
        </button>
    );
};

const ThemeToggle: React.FC<{ theme: Theme; setTheme: (theme: Theme) => void }> = ({ theme, setTheme }) => {
    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    return (
        <button onClick={toggleTheme} className="p-2 rounded-full bg-base-200 dark:bg-d-base-300 text-text-primary dark:text-d-text-primary hover:bg-base-300 dark:hover:bg-d-base-200 transition-colors">
             {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
        </button>
    );
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, theme, setTheme }) => {
    return (
        <header className="sticky top-0 z-50 bg-base-100/80 dark:bg-d-base-200/80 backdrop-blur-lg shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                         <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full mr-3"></div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-dark to-secondary-dark dark:from-d-primary-light dark:to-d-secondary-light">
                           Anjuman-e-Faizanul Quraan
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex items-baseline space-x-2 bg-base-200 dark:bg-d-base-300 p-1 rounded-full">
                            <NavLink isActive={currentView === 'attendance'} onClick={() => setView('attendance')}>
                                Attendance
                            </NavLink>
                            <NavLink isActive={currentView === 'students'} onClick={() => setView('students')}>
                                Students
                            </NavLink>
                            <NavLink isActive={currentView === 'fees'} onClick={() => setView('fees')}>
                                Fees
                            </NavLink>
                             <NavLink isActive={currentView === 'reports'} onClick={() => setView('reports')}>
                                Reports
                            </NavLink>
                            <NavLink isActive={currentView === 'admin'} onClick={() => setView('admin')}>
                                Admin Dashboard
                            </NavLink>
                        </nav>
                        <ThemeToggle theme={theme} setTheme={setTheme} />
                    </div>
                </div>
                 <nav className="md:hidden pb-4 flex items-baseline justify-center">
                     <div className="flex space-x-2 bg-base-200 dark:bg-d-base-300 p-1 rounded-full">
                        <NavLink isActive={currentView === 'attendance'} onClick={() => setView('attendance')}>
                            Attendance
                        </NavLink>
                        <NavLink isActive={currentView === 'students'} onClick={() => setView('students')}>
                            Students
                        </NavLink>
                        <NavLink isActive={currentView === 'fees'} onClick={() => setView('fees')}>
                            Fees
                        </NavLink>
                         <NavLink isActive={currentView === 'reports'} onClick={() => setView('reports')}>
                            Reports
                        </NavLink>
                        <NavLink isActive={currentView === 'admin'} onClick={() => setView('admin')}>
                            Admin
                        </NavLink>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;