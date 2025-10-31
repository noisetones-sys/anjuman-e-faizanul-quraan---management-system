import React, { useState, useMemo } from 'react';
import { useMockData } from '../hooks/useMockData';
import { Student, FeesPayment } from '../types';
import { MONTHLY_FEE_DUE } from '../constants';
import Toast from './Toast';

const FeesManager: React.FC = () => {
    const { students, feesPayments, addFeePayment } = useMockData();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [amountPaid, setAmountPaid] = useState<string>(MONTHLY_FEE_DUE.toString());
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMonth, setPaymentMonth] = useState(new Date().toISOString().substring(0, 7));
    const [showToast, setShowToast] = useState(false);

    const filteredStudents = useMemo(() => {
        if (!searchQuery) return [];
        return students.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.student_id.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 5); // Limit results for performance
    }, [searchQuery, students]);

    const studentPaymentHistory = useMemo(() => {
        if (!selectedStudent) return [];
        return feesPayments
            .filter(p => p.student_id === selectedStudent.student_id)
            .sort((a, b) => new Date(b.date_paid).getTime() - new Date(a.date_paid).getTime())
            .slice(0, 6);
    }, [selectedStudent, feesPayments]);

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        setSearchQuery('');
    };

    const handleAddPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent || !amountPaid) return;
        addFeePayment({
            student_id: selectedStudent.student_id,
            month_year: paymentMonth,
            amount_paid: parseFloat(amountPaid),
            date_paid: paymentDate,
        });
        setAmountPaid(MONTHLY_FEE_DUE.toString());
        setShowToast(true);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white dark:bg-d-base-200 p-6 sm:p-8 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-bold text-text-primary dark:text-d-text-primary mb-4">Log Fee Payment</h2>
                <div className="relative">
                    <label htmlFor="student-search" className="block text-sm font-medium text-text-secondary dark:text-d-text-secondary mb-2">Search Student by Name or ID</label>
                    <input
                        id="student-search"
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Start typing..."
                        className="w-full p-3 bg-base-200 dark:bg-d-base-300 border-transparent rounded-full focus:ring-2 focus:ring-primary dark:focus:ring-d-primary"
                    />
                    {filteredStudents.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white dark:bg-d-base-300 border border-base-200 dark:border-d-base-300 rounded-xl mt-1 shadow-lg">
                            {filteredStudents.map(s => (
                                <li
                                    key={s.student_id}
                                    onClick={() => handleSelectStudent(s)}
                                    className="p-3 hover:bg-base-100 dark:hover:bg-d-base-200 cursor-pointer"
                                >
                                    {s.name} ({s.student_id})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {selectedStudent && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Payment Form */}
                    <div className="bg-white dark:bg-d-base-200 p-6 sm:p-8 rounded-2xl shadow-xl">
                        <h3 className="text-xl font-bold text-text-primary dark:text-d-text-primary mb-4">New Payment for <span className="text-primary dark:text-d-primary">{selectedStudent.name}</span></h3>
                        <form onSubmit={handleAddPayment} className="space-y-4">
                             <div>
                                <label htmlFor="month_year" className="block text-sm font-medium text-text-secondary dark:text-d-text-secondary">Month/Year</label>
                                <input
                                    type="month"
                                    id="month_year"
                                    value={paymentMonth}
                                    onChange={e => setPaymentMonth(e.target.value)}
                                    className="mt-1 block w-full p-3 bg-base-200 dark:bg-d-base-300 border-transparent rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-text-secondary dark:text-d-text-secondary">Amount Paid ($)</label>
                                <input
                                    type="number"
                                    id="amount"
                                    value={amountPaid}
                                    onChange={e => setAmountPaid(e.target.value)}
                                    className="mt-1 block w-full p-3 bg-base-200 dark:bg-d-base-300 border-transparent rounded-lg"
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="date_paid" className="block text-sm font-medium text-text-secondary dark:text-d-text-secondary">Date Paid</label>
                                <input
                                    type="date"
                                    id="date_paid"
                                    value={paymentDate}
                                    onChange={e => setPaymentDate(e.target.value)}
                                    className="mt-1 block w-full p-3 bg-base-200 dark:bg-d-base-300 border-transparent rounded-lg"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-4 rounded-full hover:shadow-lg transition-all duration-300 shadow-md">
                                Log Payment
                            </button>
                        </form>
                    </div>

                    {/* Payment History */}
                    <div className="bg-white dark:bg-d-base-200 p-6 sm:p-8 rounded-2xl shadow-xl">
                        <h3 className="text-xl font-bold text-text-primary dark:text-d-text-primary mb-4">Recent Payment History</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-base-200 dark:divide-d-base-300">
                                <thead className="bg-base-100 dark:bg-d-base-300">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-d-text-secondary uppercase">Month</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-d-text-secondary uppercase">Paid</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-d-text-secondary uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-d-base-200 divide-y divide-base-200 dark:divide-d-base-300">
                                    {studentPaymentHistory.length > 0 ? studentPaymentHistory.map(p => (
                                        <tr key={p.payment_id}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">{p.month_year}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">${p.amount_paid.toFixed(2)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">{p.date_paid}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} className="text-center py-4 text-text-secondary dark:text-d-text-secondary">No payment history.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
             <Toast message="Payment logged successfully!" show={showToast} onClose={() => setShowToast(false)} />
        </div>
    );
};

export default FeesManager;