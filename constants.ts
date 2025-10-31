import { Batch, AttendanceStatus } from './types';

export const BATCHES: Batch[] = [Batch.Morning, Batch.Afternoon, Batch.Evening];

export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
    AttendanceStatus.Present,
    AttendanceStatus.Absent,
    AttendanceStatus.Late,
    AttendanceStatus.Holiday,
];

export const MOCK_LOGGED_IN_USER = "Admin Staff";
export const MONTHLY_FEE_DUE = 100;