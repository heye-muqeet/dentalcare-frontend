import { useState, useEffect } from 'react';
import { FaPlus } from "react-icons/fa";
import { PatientTable } from '../components/Patient/PatientTable';
// import { Pagination } from '../components/Common/Pagination';
import { AddPatientModal } from '../components/Patient/AddPatientModal';
import { EditPatientModal } from '../components/Patient/EditPatientModal';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { fetchPatients, createPatient, updatePatient } from '../lib/store/slices/patientsSlice';
import type { RootState } from '../lib/store/store';
import type { Patient } from '../lib/api/services/patients';
import { toast } from 'react-hot-toast';

const PatientList = () => {
    const dispatch = useAppDispatch();
    // const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const { patients, isLoading, error, isCreating, isUpdating } = useAppSelector((state: RootState) => state.patients);
    const user = useAppSelector((state: RootState) => state.auth.user);
    
    // Check if user is doctor
    const isDoctorRole = user?.role === 'doctor';

    useEffect(() => {
        console.log('PatientList: Fetching patients...');
        dispatch(fetchPatients());
    }, [dispatch]);
    
    // Debug patients state changes
    useEffect(() => {
        console.log('PatientList: Patients state updated:', patients);
    }, [patients]);

    const handleAddPatient = async (patientData: any) => {
        try {
            await dispatch(createPatient(patientData)).unwrap();
            toast.success('Patient added successfully');
            setIsAddModalOpen(false);
            
            // Refresh the patient list after successful addition
            dispatch(fetchPatients());
        } catch (err: any) {
            console.log('API Error:', err);
            
            // Check for specific error messages
            const errorMessage = typeof err === 'string' ? err : err?.message;
            
            if (errorMessage?.includes('email already exists')) {
                toast.error('A patient with this email already exists in your organization');
            } else {
                toast.error('Failed to add patient');
            }
            
            throw err; // Re-throw to let modal handle loading state
        }
    };

    const handleEditPatient = async (id: string, patientData: any) => {
        try {
            await dispatch(updatePatient({ id, patientData })).unwrap();
            toast.success('Patient updated successfully');
            setIsEditModalOpen(false);
            setSelectedPatient(null);
            
            // Refresh the patient list after successful update
            dispatch(fetchPatients());
        } catch (err: any) {
            console.log('API Error on update:', err);
            
            // Check for specific error messages
            const errorMessage = typeof err === 'string' ? err : err?.message;
            
            if (errorMessage?.includes('email already exists')) {
                toast.error('A patient with this email already exists in your organization');
            } else {
                toast.error('Failed to update patient');
            }
        }
    };

    const handleEditClick = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsEditModalOpen(true);
    };

    // Filter patients based on search term
    const filteredPatients = Array.isArray(patients) ? patients.filter(patient =>
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.phone && patient.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                <h1 className="text-xl sm:text-3xl font-bold text-[#0A0F56]">Patients</h1>
                <p className="text-gray-500 text-md">
                        Showing: All Patients and Their Information
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by email, name, or phone"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 rounded-lg py-2 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-[#0A0F56] focus:border-[#0A0F56] transition-all duration-200 shadow-sm hover:shadow-md w-64"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => !isDoctorRole && setIsAddModalOpen(true)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center transition-all duration-300 shadow-lg transform ${
                            isDoctorRole 
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50' 
                                : 'bg-gradient-to-r from-[#0A0F56] to-[#232a7c] text-white hover:from-[#232a7c] hover:to-[#0A0F56] hover:shadow-xl hover:-translate-y-0.5'
                        }`}
                        disabled={isCreating || isDoctorRole}
                        title={isDoctorRole ? 'Doctors cannot add patients' : 'Add a new patient'}
                    >
                        <FaPlus className="mr-2 text-base" />
                        Add Patient
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A0F56]"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 p-4 bg-red-50 rounded-md">
                    Error loading patients: {error}
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="text-center py-12 px-6 border-2 border-dashed border-gray-300 rounded-lg bg-white shadow-sm mt-8 animate-fadeIn">
                    {searchTerm ? (
                        <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <h3 className="mt-4 text-lg font-semibold text-gray-800">
                                No Patients Found for "{searchTerm}"
                            </h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Try adjusting your search term or clear the search.
                            </p>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="px-5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center mx-auto transition-all duration-300 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                                >
                                    Clear Search
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                            <h3 className="mt-4 text-xl font-semibold text-gray-800">
                                No Patients Registered
                            </h3>
                            <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
                                Your patient list is currently empty. Get started by adding your first patient to begin managing their dental care.
                            </p>
                            {!isDoctorRole && (
                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="px-5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center mx-auto transition-all duration-300 shadow-lg transform bg-gradient-to-r from-[#0A0F56] to-[#232a7c] text-white hover:from-[#232a7c] hover:to-[#0A0F56] hover:shadow-xl hover:-translate-y-0.5"
                                        disabled={isCreating}
                                    >
                                        <FaPlus className="mr-2 text-base" />
                                        Add Your First Patient
                                    </button>
                                </div>
                            )}
                            {isDoctorRole && (
                                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                                    <p className="text-sm text-yellow-700">
                                        As a doctor, you can view patients but cannot add them. Please contact the receptionist or administrator to add new patients.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <>
                    <PatientTable
                        patients={filteredPatients}
                        onEdit={handleEditClick}
                    />

                    {/* <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(filteredPatients.length / 10)}
                        onPageChange={setCurrentPage}
                    /> */}
                </>
            )}

            <AddPatientModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddPatient}
                isSubmitting={isCreating}
            />

            <EditPatientModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedPatient(null);
                }}
                onSubmit={handleEditPatient}
                patient={selectedPatient}
                isSubmitting={isUpdating}
            />
        </div>
    );
};

export default PatientList;