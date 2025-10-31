import React, { useState, useEffect } from 'react';
import { useMockData } from '../hooks/useMockData';
import { Student, Batch, StudentStatus } from '../types';
import Modal from './Modal';
import Toast from './Toast';
import { BATCHES } from '../constants';

const defaultStudentFormData: Omit<Student, 'student_id'> = {
    name: '',
    batch: Batch.Morning,
    parent_contact: '',
    status: StudentStatus.Active,
};

const StudentManager: React.FC = () => {
    const { students, addStudent, updateStudent, deleteStudent } = useMockData();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState<Omit<Student, 'student_id'>>(defaultStudentFormData);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (isModalOpen && editingStudent) {
            setFormData(editingStudent);
        } else {
            setFormData(defaultStudentFormData);
        }
    }, [isModalOpen, editingStudent]);

    const handleOpenModal = (student: Student | null = null) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
    };

    const handleDelete = (studentId: string, studentName: string) => {
        if (window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
            deleteStudent(studentId);
            setToastMessage('Student deleted successfully!');
            setShowToast(true);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingStudent) {
            updateStudent({ ...formData, student_id: editingStudent.student_id });
            setToastMessage('Student updated successfully!');
        } else {
            addStudent(formData);
            setToastMessage('Student added successfully!');
        }
        setShowToast(true);
        handleCloseModal();
    };
    
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white dark:bg-d-base-200 p-6 sm:p-8 rounded-2xl shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-3xl font-bold text-text-primary dark:text-d-text-primary mb-3 sm:mb-0">Manage Students</h2>
                    <button
                        onClick={() => handleOpenModal()}
                        className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transition-all duration-300 shadow-md"
                    >
                        + Add New Student
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-base-200 dark:divide-d-base-300">
                        <thead className="bg-base-100 dark:bg-d-base-300">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-d-text-secondary uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-d-text-secondary uppercase tracking-wider">Batch</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-d-text-secondary uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-d-text-secondary uppercase tracking-wider">Contact</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary dark:text-d-text-secondary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-d-base-200 divide-y divide-base-200 dark:divide-d-base-300">
                            {students.map(s => (
                                <tr key={s.student_id} className="hover:bg-base-100/50 dark:hover:bg-d-base-300/50">
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-text-primary dark:text-d-text-primary">{s.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-d-text-secondary">{s.batch}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${s.status === StudentStatus.Active ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary dark:text-d-text-secondary">{s.parent_contact}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleOpenModal(s)} className="text-primary dark:text-d-primary hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(s.student_id, s.name)} className="text-danger dark:text-d-danger hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingStudent ? 'Edit Student' : 'Add New Student'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-d-text-secondary">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 bg-base-200 dark:bg-d-base-300 border-transparent rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-d-primary"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="batch" className="block text-sm font-medium text-text-secondary dark:text-d-text-secondary">Batch</label>
                        <select
                            name="batch"
                            id="batch"
                            value={formData.batch}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 bg-base-200 dark:bg-d-base-300 border-transparent rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-d-primary"
                            required
                        >
                            {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="parent_contact" className="block text-sm font-medium text-text-secondary dark:text-d-text-secondary">Parent Contact</label>
                        <input
                            type="text"
                            name="parent_contact"
                            id="parent_contact"
                            value={formData.parent_contact}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 bg-base-200 dark:bg-d-base-300 border-transparent rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-d-primary"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="status" className="block text-sm font-medium text-text-secondary dark:text-d-text-secondary">Status</label>
                        <select
                            name="status"
                            id="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 bg-base-200 dark:bg-d-base-300 border-transparent rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-d-primary"
                            required
                        >
                            <option value={StudentStatus.Active}>Active</option>
                            <option value={StudentStatus.Inactive}>Inactive</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-4">
                        <button type="button" onClick={handleCloseModal} className="px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 text-text-secondary dark:text-d-text-secondary hover:bg-base-200 dark:hover:bg-d-base-300">
                            Cancel
                        </button>
                         <button type="submit" className="bg-gradient-to-r from-accent to-green-600 text-white font-bold py-2 px-6 rounded-full hover:shadow-lg transition-all duration-300 shadow-md">
                            {editingStudent ? 'Save Changes' : 'Add Student'}
                        </button>
                    </div>
                </form>
            </Modal>
            <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
        </div>
    );
};

export default StudentManager;