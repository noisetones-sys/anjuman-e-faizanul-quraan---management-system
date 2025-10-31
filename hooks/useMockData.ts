import React, { createContext, useContext, useState } from 'react';
import { Student, AttendanceRecord, FeesPayment, Batch, StudentStatus, AttendanceStatus } from '../types';
import { MOCK_LOGGED_IN_USER, MONTHLY_FEE_DUE } from '../constants';

interface DataContextProps {
    students: Student[];
    attendanceRecords: AttendanceRecord[];
    feesPayments: FeesPayment[];
    addAttendance: (records: { student_id: string; status: AttendanceStatus }[], date: string, batch: Batch) => void;
    addFeePayment: (payment: Omit<FeesPayment, 'payment_id' | 'recorded_by' | 'amount_due'>) => void;
    markBatchAsHoliday: (date: string, batch: Batch) => void;
    addStudent: (studentData: Omit<Student, 'student_id'>) => void;
    updateStudent: (studentData: Student) => void;
    deleteStudent: (studentId: string) => void;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

const initialStudents: Student[] = [
    // Morning Batch
    { student_id: 'S001', name: 'Ahmed Khan', batch: Batch.Morning, parent_contact: '111-222-3333', status: StudentStatus.Active },
    { student_id: 'S002', name: 'Fatima Ali', batch: Batch.Morning, parent_contact: '111-222-3334', status: StudentStatus.Active },
    { student_id: 'S003', name: 'Zainab Omar', batch: Batch.Morning, parent_contact: '111-222-3335', status: StudentStatus.Active },
    { student_id: 'S004', name: 'Yusuf Ibrahim', batch: Batch.Morning, parent_contact: '111-222-3336', status: StudentStatus.Active },
    { student_id: 'S005', name: 'Mariam Hassan', batch: Batch.Morning, parent_contact: '111-222-3337', status: StudentStatus.Inactive },

    // Afternoon Batch
    { student_id: 'S006', name: 'Bilal Ahmed', batch: Batch.Afternoon, parent_contact: '222-333-4444', status: StudentStatus.Active },
    { student_id: 'S007', name: 'Aisha Siddiqui', batch: Batch.Afternoon, parent_contact: '222-333-4445', status: StudentStatus.Active },
    { student_id: 'S008', name: 'Omar Farooq', batch: Batch.Afternoon, parent_contact: '222-333-4446', status: StudentStatus.Active },
    { student_id: 'S009', name: 'Hafsa Rahman', batch: Batch.Afternoon, parent_contact: '222-333-4447', status: StudentStatus.Active },

    // Evening Batch
    { student_id: 'S010', name: 'Ali Raza', batch: Batch.Evening, parent_contact: '333-444-5555', status: StudentStatus.Active },
    { student_id: 'S011', name: 'Samira Begum', batch: Batch.Evening, parent_contact: '333-444-5556', status: StudentStatus.Active },
    { student_id: 'S012', name: 'Tariq Mehmood', batch: Batch.Evening, parent_contact: '333-444-5557', status: StudentStatus.Active },
];

const initialFees: FeesPayment[] = [
    { payment_id: 'P001', student_id: 'S001', month_year: '2024-06', amount_due: 100, amount_paid: 100, date_paid: '2024-06-05', recorded_by: 'Admin Staff' },
    { payment_id: 'P002', student_id: 'S001', month_year: '2024-07', amount_due: 100, amount_paid: 100, date_paid: '2024-07-03', recorded_by: 'Admin Staff' },
    { payment_id: 'P003', student_id: 'S002', month_year: '2024-07', amount_due: 100, amount_paid: 100, date_paid: '2024-07-08', recorded_by: 'Admin Staff' },
    { payment_id: 'P004', student_id: 'S006', month_year: '2024-07', amount_due: 100, amount_paid: 50, date_paid: '2024-07-10', recorded_by: 'Admin Staff' },
];


export const DataProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [feesPayments, setFeesPayments] = useState<FeesPayment[]>(initialFees);

    const addAttendance = (records: { student_id: string; status: AttendanceStatus }[], date: string, batch: Batch) => {
        setAttendanceRecords(prev => {
            // Filter out any existing records for this date and batch to prevent duplicates
            const otherRecords = prev.filter(r => !(r.date === date && r.batch === batch));
            const newRecords: AttendanceRecord[] = records.map(rec => ({
                ...rec,
                record_id: `ATT-${Date.now()}-${rec.student_id}`,
                date,
                batch,
            }));
            return [...otherRecords, ...newRecords];
        });
    };

    const markBatchAsHoliday = (date: string, batch: Batch) => {
        setAttendanceRecords(prev => {
            const otherRecords = prev.filter(r => !(r.date === date && r.batch === batch));
            const holidayRecords: AttendanceRecord[] = students
                .filter(s => s.batch === batch && s.status === StudentStatus.Active)
                .map(student => ({
                    record_id: `ATT-${Date.now()}-${student.student_id}`,
                    student_id: student.student_id,
                    date,
                    batch,
                    status: AttendanceStatus.Holiday,
                }));
            return [...otherRecords, ...holidayRecords];
        });
    };
    
    const addFeePayment = (payment: Omit<FeesPayment, 'payment_id' | 'recorded_by' | 'amount_due'>) => {
        const newPayment: FeesPayment = {
            ...payment,
            payment_id: `PAY-${Date.now()}`,
            recorded_by: MOCK_LOGGED_IN_USER,
            amount_due: MONTHLY_FEE_DUE
        };
        setFeesPayments(prev => [...prev, newPayment]);
    };

    const addStudent = (studentData: Omit<Student, 'student_id'>) => {
        const newStudent: Student = {
            ...studentData,
            student_id: `S${Date.now().toString().slice(-6)}`,
        };
        setStudents(prev => [...prev, newStudent]);
    };

    const updateStudent = (updatedStudent: Student) => {
        setStudents(prev => prev.map(s => (s.student_id === updatedStudent.student_id ? updatedStudent : s)));
    };

    const deleteStudent = (studentId: string) => {
        setStudents(prev => prev.filter(s => s.student_id !== studentId));
    };

    return React.createElement(DataContext.Provider, {
        value: { students, attendanceRecords, feesPayments, addAttendance, addFeePayment, markBatchAsHoliday, addStudent, updateStudent, deleteStudent }
    }, children);
};

export const useMockData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useMockData must be used within a DataProvider');
    }
    return context;
};