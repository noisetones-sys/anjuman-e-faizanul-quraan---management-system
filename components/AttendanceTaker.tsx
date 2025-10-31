import React, { useState, useEffect, useMemo } from 'react';
import { useMockData } from '../hooks/useMockData';
import { Batch, Student, AttendanceStatus } from '../types';
import { BATCHES } from '../constants';
import Toast from './Toast';

const StatusToggle: React.FC<{
  currentStatus: AttendanceStatus;
  onStatusChange: (status: AttendanceStatus) => void;
}> = ({ currentStatus, onStatusChange }) => {
    const statuses: AttendanceStatus[] = [AttendanceStatus.Present, AttendanceStatus.Absent, AttendanceStatus.Late];
    
    // Fix: Changed JSX.Element to React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
    const statusStyles: Record<AttendanceStatus, { base: string, active: string, icon: React.ReactNode }> = {
        [AttendanceStatus.Present]: {
            base: 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50',
            active: 'bg-accent text-white shadow-lg',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        },
        [AttendanceStatus.Absent]: {
            base: 'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50',
            active: 'bg-danger text-white shadow-lg',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.693a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        },
        [AttendanceStatus.Late]: {
            base: 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50',
            active: 'bg-warning text-white shadow-lg',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
        },
        [AttendanceStatus.Holiday]: { base: '', active: '', icon: <></> }
    };

    return (
        <div className="flex space-x-1 p-1 bg-base-200 dark:bg-d-base-300/70 rounded-full">
            {statuses.map(status => (
                <button
                    key={status}
                    onClick={() => onStatusChange(status)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 transform hover:scale-110
                        ${currentStatus === status 
                            ? statusStyles[status].active 
                            : statusStyles[status].base}`
                        }
                >
                    {statusStyles[status].icon}
                </button>
            ))}
        </div>
    );
};


const AttendanceTaker: React.FC = () => {
    const { students, attendanceRecords, addAttendance, markBatchAsHoliday } = useMockData();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedBatch, setSelectedBatch] = useState<Batch>(Batch.Morning);
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    const activeStudentsInBatch = useMemo(() => {
        return students.filter(s => s.batch === selectedBatch && s.status === 'Active');
    }, [students, selectedBatch]);
    
    useEffect(() => {
        const newAttendanceState: Record<string, AttendanceStatus> = {};
        const recordsForDateAndBatch = attendanceRecords.filter(r => r.date === selectedDate && r.batch === selectedBatch);
        
        activeStudentsInBatch.forEach(student => {
            const existingRecord = recordsForDateAndBatch.find(r => r.student_id === student.student_id);
            newAttendanceState[student.student_id] = existingRecord ? existingRecord.status : AttendanceStatus.Absent;
        });
        setAttendance(newAttendanceState);
    }, [selectedDate, selectedBatch, activeStudentsInBatch, attendanceRecords]);

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };
    
    const handleMarkAsHoliday = () => {
        if (window.confirm(`Are you sure you want to mark ${selectedBatch} batch on ${selectedDate} as a holiday? This will overwrite existing attendance for this day.`)) {
            markBatchAsHoliday(selectedDate, selectedBatch);
            setToastMessage('Batch marked as holiday.');
            setShowToast(true);
        }
    };

    const handleMarkAllPresent = () => {
        const allPresent = activeStudentsInBatch.reduce((acc, student) => {
            acc[student.student_id] = AttendanceStatus.Present;
            return acc;
        }, {} as Record<string, AttendanceStatus>);
        setAttendance(allPresent);
        setToastMessage("All students marked as Present.");
        setShowToast(true);
    };

    const handleSaveAttendance = () => {
        const recordsToSave = Object.entries(attendance).map(([student_id, status]) => ({ student_id, status }));
        addAttendance(recordsToSave, selectedDate, selectedBatch);
        setToastMessage('Attendance saved successfully!');
        setShowToast(true);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white dark:bg-d-base-200 p-6 sm:p-8 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-bold text-text-primary dark:text-d-text-primary mb-6">Take Attendance</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-text-secondary dark:text-d-text-secondary mb-2">Date</label>
                        <input
                            type="date"
                            id="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="w-full p-3 bg-base-200 dark:bg-d-base-300 border-transparent rounded-full focus:ring-2 focus:ring-primary dark:focus:ring-d-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="batch" className="block text-sm font-medium text-text-secondary dark:text-d-text-secondary mb-2">Batch</label>
                        <select
                            id="batch"
                            value={selectedBatch}
                            onChange={e => setSelectedBatch(e.target.value as Batch)}
                            className="w-full p-3 bg-base-200 dark:bg-d-base-300 border-transparent rounded-full focus:ring-2 focus:ring-primary dark:focus:ring-d-primary"
                        >
                            {BATCHES.map(batch => <option key={batch} value={batch}>{batch}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeStudentsInBatch.length > 0 ? activeStudentsInBatch.map(student => {
                        const currentStatus = attendance[student.student_id];
                        const cardStyle = {
                            [AttendanceStatus.Present]: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50',
                            [AttendanceStatus.Absent]: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50',
                            [AttendanceStatus.Late]: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50',
                            [AttendanceStatus.Holiday]: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50',
                        }[currentStatus] || 'bg-base-100 dark:bg-d-base-300 border-base-200 dark:border-d-base-300/50';

                        return (
                            <div key={student.student_id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${cardStyle}`}>
                                <p className="font-semibold text-lg text-text-primary dark:text-d-text-primary">{student.name}</p>
                                <StatusToggle 
                                    currentStatus={currentStatus} 
                                    onStatusChange={(status) => handleStatusChange(student.student_id, status)}
                                />
                            </div>
                        )
                    }) : (
                      <p className="text-center text-text-secondary dark:text-d-text-secondary py-4 md:col-span-2">No active students in this batch.</p>
                    )}
                </div>

                <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center flex-wrap">
                    <button
                        onClick={handleSaveAttendance}
                        className="w-full md:w-auto bg-gradient-to-r from-accent to-green-600 text-white font-bold py-3 px-8 rounded-full hover:shadow-lg transition-all duration-300 shadow-md disabled:opacity-50"
                        disabled={activeStudentsInBatch.length === 0}
                    >
                        Save Attendance
                    </button>
                    <button
                        onClick={handleMarkAllPresent}
                        className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-8 rounded-full hover:shadow-lg transition-all duration-300 shadow-md disabled:opacity-50"
                        disabled={activeStudentsInBatch.length === 0}
                    >
                        Mark All Present
                    </button>
                    <button
                        onClick={handleMarkAsHoliday}
                        className="w-full md:w-auto bg-gradient-to-r from-secondary to-primary text-white font-bold py-3 px-8 rounded-full hover:shadow-lg transition-all duration-300 shadow-md disabled:opacity-50"
                        disabled={activeStudentsInBatch.length === 0}
                    >
                        Mark as Holiday
                    </button>
                </div>
            </div>
            <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
        </div>
    );
};

export default AttendanceTaker;