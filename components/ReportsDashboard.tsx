import React, { useState, useMemo } from 'react';
import { useMockData } from '../hooks/useMockData';
import { Batch, AttendanceStatus, AttendanceRecord } from '../types';
import { BATCHES } from '../constants';

type ReportType = 'daily' | 'monthly' | 'yearly';

const ReportsDashboard: React.FC = () => {
    const { students, attendanceRecords } = useMockData();
    
    const [reportType, setReportType] = useState<ReportType>('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedBatch, setSelectedBatch] = useState<Batch | 'All'>('All');

    const studentMap = useMemo(() => {
        return new Map(students.map(s => [s.student_id, s]));
    }, [students]);

    const filteredRecords = useMemo(() => {
        return attendanceRecords
            .map(record => {
                const student = studentMap.get(record.student_id);
                return student ? { ...record, studentName: student.name } : null;
            })
            .filter((record): record is AttendanceRecord & { studentName: string } => {
                if (!record) return false;

                if (selectedBatch !== 'All' && record.batch !== selectedBatch) {
                    return false;
                }

                const recordDate = new Date(record.date);
                const filterDate = new Date(selectedDate);
                
                switch (reportType) {
                    case 'daily':
                        return record.date === selectedDate;
                    case 'monthly':
                        return recordDate.getFullYear() === filterDate.getFullYear() &&
                               recordDate.getMonth() === filterDate.getMonth();
                    case 'yearly':
                         return recordDate.getFullYear() === filterDate.getFullYear();
                    default:
                        return false;
                }
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.studentName.localeCompare(b.studentName));
    }, [attendanceRecords, studentMap, reportType, selectedDate, selectedBatch]);

    const getStatusCellStyle = (status: AttendanceStatus) => {
        switch (status) {
            case AttendanceStatus.Present:
                return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case AttendanceStatus.Absent:
                return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            case AttendanceStatus.Late:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case AttendanceStatus.Holiday:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };
    
    const getDateInputType = () => {
        switch(reportType) {
            case 'daily': return 'date';
            case 'monthly': return 'month';
            case 'yearly': return 'number';
            default: return 'date';
        }
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (reportType === 'yearly') {
            const year = e.target.value;
            // Pad with a valid month/day for Date object consistency
            setSelectedDate(`${year}-01-01`); 
        } else {
             setSelectedDate(e.target.value);
        }
    }

    const getDateValue = () => {
        if (reportType === 'yearly') {
            return selectedDate.substring(0, 4);
        }
        if (reportType === 'monthly') {
            return selectedDate.substring(0, 7);
        }
        return selectedDate;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white dark:bg-d-base-200 p-6 sm:p-8 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-bold text-text-primary dark:text-d-text-primary mb-6">Attendance Reports</h2>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                        <label htmlFor="reportType" className="block text-sm font-medium text-text-secondary dark:text-d-text-secondary mb-2">Report Type</label>
                        <select
                            id="reportType"
                            value={reportType}
                            onChange={e => setReportType(e.target.value as ReportType)}
                            className="w-full p-3 bg-base-200 dark:bg-d-base-300 border-transparent rounded-full focus:ring-2 focus:ring-primary dark:focus:ring-d-primary"
                        >
                            <option value="daily">Daily</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="date" className="block text-sm font-medium text-text-secondary dark:text-d-text-secondary mb-2">
                           {reportType === 'daily' ? 'Date' : reportType === 'monthly' ? 'Month' : 'Year'}
                        </label>
                        <input
                            type={getDateInputType()}
                            id="date"
                            value={getDateValue()}
                            onChange={handleDateChange}
                            {...(reportType === 'yearly' && { placeholder: 'YYYY', min: "2020", max: "2099" })}
                            className="w-full p-3 bg-base-200 dark:bg-d-base-300 border-transparent rounded-full focus:ring-2 focus:ring-primary dark:focus:ring-d-primary"
                        />
                    </div>
                     <div>
                        <label htmlFor="batch" className="block text-sm font-medium text-text-secondary dark:text-d-text-secondary mb-2">Batch</label>
                        <select
                            id="batch"
                            value={selectedBatch}
                            onChange={e => setSelectedBatch(e.target.value as Batch | 'All')}
                            className="w-full p-3 bg-base-200 dark:bg-d-base-300 border-transparent rounded-full focus:ring-2 focus:ring-primary dark:focus:ring-d-primary"
                        >
                            <option value="All">All Batches</option>
                            {BATCHES.map(batch => <option key={batch} value={batch}>{batch}</option>)}
                        </select>
                    </div>
                </div>

                {/* Report Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-base-200 dark:divide-d-base-300">
                        <thead className="bg-base-100 dark:bg-d-base-300">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-d-text-secondary uppercase tracking-wider">Student Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-d-text-secondary uppercase tracking-wider">Batch</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-d-text-secondary uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-d-text-secondary uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-d-base-200 divide-y divide-base-200 dark:divide-d-base-300">
                            {filteredRecords.length > 0 ? filteredRecords.map(record => (
                                <tr key={record.record_id} className="hover:bg-base-100/50 dark:hover:bg-d-base-300/50">
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-text-primary dark:text-d-text-primary">{record.studentName}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-d-text-secondary">{record.batch}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-d-text-secondary">{record.date}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusCellStyle(record.status)}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center py-8 text-text-secondary dark:text-d-text-secondary">No attendance records found for the selected filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsDashboard;
