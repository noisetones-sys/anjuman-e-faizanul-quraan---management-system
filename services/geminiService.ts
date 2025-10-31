
import { GoogleGenAI } from "@google/genai";
import { Student, FeesPayment, AttendanceRecord } from "../types";

// Fix: Per Gemini API guidelines, initialize GoogleGenAI directly assuming API_KEY is available in process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


interface SummaryData {
    month: string;
    outstandingStudents: Student[];
    feesCollected: FeesPayment[];
    attendance: AttendanceRecord[];
    activeStudents: Student[];
}

export const getAiSummary = async (data: SummaryData): Promise<string> => {
    // Fix: Removed conditional check for `ai` as it is assumed to be initialized per guidelines.
    const totalFees = data.feesCollected.reduce((sum, p) => sum + p.amount_paid, 0);
    const totalAttendanceRecords = data.attendance.length;

    const prompt = `
        You are an administrative assistant for an Islamic institute named "Anjuman-e-Faizanul Quraan".
        Your task is to generate a concise, professional summary of the institute's performance for a given month based on the data provided.
        The summary should be easy to read for the institute director. Use bullet points for key metrics.

        Data for ${data.month}:
        - Total Active Students: ${data.activeStudents.length}
        - Total Fees Collected: $${totalFees.toFixed(2)}
        - Number of Students with Outstanding/Partial Fees: ${data.outstandingStudents.length}
        - Names of Students with Outstanding Fees: ${data.outstandingStudents.map(s => s.name).join(', ') || 'None'}
        - Total Attendance Records Logged: ${totalAttendanceRecords}

        Please provide a summary covering:
        1.  A brief opening statement about the month.
        2.  Key financial highlights (total collection, outstanding fees).
        3.  Key attendance highlights (mention if data is available or not).
        4.  A concluding sentence with a positive or forward-looking note.

        Keep the tone professional and data-driven.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to communicate with Gemini API. Please check your API key and network connection.");
    }
};