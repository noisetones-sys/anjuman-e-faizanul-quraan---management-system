export enum Batch {
    Morning = 'Morning',
    Afternoon = 'Afternoon',
    Evening = 'Evening'
}

export enum AttendanceStatus {
    Present = 'Present',
    Absent = 'Absent',
    Late = 'Late',
    Holiday = 'Holiday'
}

export enum StudentStatus {
    Active = 'Active',
    Inactive = 'Inactive'
}

export interface Student {
    student_id: string;
    name: string;
    batch: Batch;
    parent_contact: string;
    status: StudentStatus;
}

export interface AttendanceRecord {
    record_id: string;
    student_id: string;
    date: string; // YYYY-MM-DD
    batch: Batch;
    status: AttendanceStatus;
}

export interface FeesPayment {
    payment_id: string;
    student_id: string;
    month_year: string; // YYYY-MM
    amount_due: number;
    amount_paid: number;
    date_paid: string; // YYYY-MM-DD
    recorded_by: string;
}