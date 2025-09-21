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
        dispatch(fetchPatients());
    }, [dispatch]);

    const handleAddPatient = async (patientData: any) => {
        try {
            await dispatch(createPatient(patientData)).unwrap();
            toast.success('Patient added successfully');
            setIsAddModalOpen(false);
        } catch (err) {
            toast.error('Failed to add patient');
            throw err; // Re-throw to let modal handle loading state
        }
    };

    const handleEditPatient = async (id: string, patientData: any) => {
        try {
            await dispatch(updatePatient({ id, patientData })).unwrap();
            toast.success('Patient updated successfully');
            setIsEditModalOpen(false);
            setSelectedPatient(null);
        } catch (err) {
            toast.error('Failed to update patient');
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
                <div className="text-center py-12 px-6 border-2 border-dashed border-gray-300 rounded-lg bg-white shadow-sm mt-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-semibold text-gray-800">
                        {searchTerm ? `No Patients Found for "${searchTerm}"` : "No Patients Registered"}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                        {searchTerm ? "Try adjusting your search term or clear the search." : "Get started by adding your first patient."}
                    </p>
                    {!searchTerm && (
                         <div className="mt-6">
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
