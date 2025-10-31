import React, { useState, useMemo } from 'react';
import { useMockData } from '../hooks/useMockData';
import { generateCsv } from '../utils/csvExporter';
import { getAiSummary } from '../services/geminiService';
import { Student, AttendanceStatus, Batch } from '../types';
import { MONTHLY_FEE_DUE, BATCHES } from '../constants';
import Toast from './Toast';

const AdminDashboard: React.FC = () => {
    const { students, feesPayments, attendanceRecords } = useMockData();
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().substring(0, 7));
    const [aiSummary, setAiSummary] = useState<string>('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    const outstandingStudents = useMemo(() => {
        const activeStudents = students.filter(s => s.status === 'Active');
        return activeStudents.filter(student => {
            const payment = feesPayments.find(p => p.student_id === student.student_id && p.month_year === filterMonth);
            return !payment || payment.amount_paid < MONTHLY_FEE_DUE;
        });
    }, [students, feesPayments, filterMonth]);

    const handleGenerateReports = () => {
        const lastMonth = new Date();
        lastMonth.setDate(1); // Go to the first of the current month
        lastMonth.setMonth(lastMonth.getMonth() - 1); // Go to the previous month
        const reportMonth = lastMonth.toISOString().substring(0, 7);
        const reportMonthName = lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

        // Calculate total class days for each batch, excluding holidays
        const classDaysByBatch = BATCHES.reduce((acc, batch) => {
            const uniqueDates = new Set<string>();
            attendanceRecords.forEach(record => {
                if (record.date.startsWith(reportMonth) && record.batch === batch && record.status !== AttendanceStatus.Holiday) {
                    uniqueDates.add(record.date);
                }
            });
            acc[batch] = uniqueDates.size;
            return acc;
        }, {} as Record<Batch, number>);

        const attendanceData = students.map(student => {
            const records = attendanceRecords.filter(r => r.student_id === student.student_id && r.date.startsWith(reportMonth));
            const present = records.filter(r => r.status === AttendanceStatus.Present).length;
            const late = records.filter(r => r.status === AttendanceStatus.Late).length;
            const holidays = records.filter(r => r.status === AttendanceStatus.Holiday).length;
            
            const attendedDays = present + late;
            const totalClassDaysForBatch = classDaysByBatch[student.batch] || 0;
            const percentage = totalClassDaysForBatch > 0 ? (attendedDays / totalClassDaysForBatch) * 100 : 0;

            return {
                'Student Name': student.name,
                'Month': reportMonthName,
                'Total Attended Days': attendedDays,
                'Total Holidays': holidays,
                'Attendance Percentage': `${percentage.toFixed(1)}%`,
            };
        });
        generateCsv(attendanceData, `attendance-summary-${reportMonth}.csv`);

        const feesData = feesPayments
            .filter(p => p.month_year === reportMonth)
            .map(p => ({
                'Payment ID': p.payment_id,
                'Student ID': p.student_id,
                'Student Name': students.find(s => s.student_id === p.student_id)?.name || 'N/A',
                'Month Covered': p.month_year,
                'Amount Paid': p.amount_paid,
                'Date Paid': p.date_paid,
                'Recorded By': p.recorded_by,
            }));
        generateCsv(feesData, `fees-collection-log-${reportMonth}.csv`);

        setToastMessage("Reports generated successfully!");
        setShowToast(true);
    };

    const handleGetAiSummary = async () => {
        setIsLoadingSummary(true);
        setAiSummary('');
        try {
            const feesForMonth = feesPayments.filter(p => p.month_year === filterMonth);
            const attendanceForMonth = attendanceRecords.filter(r => r.date.startsWith(filterMonth));
            const summary = await getAiSummary({
                month: filterMonth,
                outstandingStudents,
                feesCollected: feesForMonth,
                attendance: attendanceForMonth,
                activeStudents: students.filter(s=> s.status === 'Active')
            });
            setAiSummary(summary);
        } catch (error) {
            console.error("Error fetching AI summary:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setAiSummary(`Failed to generate AI summary: ${errorMessage}`);
        } finally {
            setIsLoadingSummary(false);
        }
    };


    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Reports Section */}
                <div className="bg-white dark:bg-d-base-200 p-6 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-text-primary dark:text-d-text-primary mb-4">Monthly Reports</h2>
                    <p className="text-text-secondary dark:text-d-text-secondary mb-6">Generate and download CSV reports for the previous calendar month's attendance and fee collections.</p>
                    <button
                        onClick={handleGenerateReports}
                        className="w-full bg-gradient-to-r from-accent to-green-600 text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transition-all duration-300 shadow-md"
                    >
                        Generate & Download Last Month's Reports
                    </button>
                </div>
                {/* AI Summary Section */}
                <div className="bg-white dark:bg-d-base-200 p-6 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-text-primary dark:text-d-text-primary mb-4">AI-Powered Monthly Summary</h2>
                    <p className="text-text-secondary dark:text-d-text-secondary mb-6">Get a quick, insightful summary of the selected month's data, generated by Gemini.</p>
                    <button
                        onClick={handleGetAiSummary}
                        disabled={isLoadingSummary}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transition-all duration-300 shadow-md disabled:opacity-50"
                    >
                        {isLoadingSummary ? 'Generating...' : `Generate Summary for ${filterMonth}`}
                    </button>
                    {aiSummary && (
                        <div className="mt-6 p-4 bg-base-100 dark:bg-d-base-300 border border-base-200 dark:border-d-base-300 rounded-xl">
                            <h3 className="font-semibold text-primary dark:text-d-primary mb-2">Summary:</h3>
                            <p className="text-sm text-text-secondary dark:text-d-text-secondary whitespace-pre-wrap">{aiSummary}</p>
                        </div>
                    )}
                </div>
            </div>


            {/* Outstanding Fees Section */}
            <div className="bg-white dark:bg-d-base-200 p-6 rounded-2xl shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h2 className="text-2xl font-bold text-text-primary dark:text-d-text-primary mb-2 sm:mb-0">Outstanding Fees</h2>
                    <div className="flex items-center gap-2">
                        <label htmlFor="month_filter" className="text-sm font-medium">Month:</label>
                        <input
                            type="month"
                            id="month_filter"
                            value={filterMonth}
                            onChange={e => setFilterMonth(e.target.value)}
                            className="p-2 bg-base-200 dark:bg-d-base-300 border-transparent rounded-full focus:ring-2 focus:ring-primary dark:focus:ring-d-primary"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-base-200 dark:divide-d-base-300">
                        <thead className="bg-base-100 dark:bg-d-base-300">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-d-text-secondary uppercase tracking-wider">Student Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-d-text-secondary uppercase tracking-wider">Batch</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-d-text-secondary uppercase tracking-wider">Parent Contact</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-d-base-200 divide-y divide-base-200 dark:divide-d-base-300">
                            {outstandingStudents.length > 0 ? outstandingStudents.map(s => (
                                <tr key={s.student_id} className="hover:bg-red-50 dark:hover:bg-red-900/20">
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-text-primary dark:text-d-text-primary">{s.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-d-text-secondary">{s.batch}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-d-text-secondary">{s.parent_contact}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} className="text-center py-4 text-text-secondary dark:text-d-text-secondary">No outstanding fees for {filterMonth}.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
        </div>
    );
};

export default AdminDashboard;