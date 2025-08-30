<<<<<<< HEAD
import  { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { FaPlus, FaFilter, FaSearch } from "react-icons/fa";
import { AppointmentTable } from "../components/Appointment/AppointmentTable";
// import { Pagination } from "../components/Common/Pagination";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import { fetchAppointments } from "../lib/store/slices/appointmentsSlice";
import { fetchDoctors } from "../lib/store/slices/doctorsSlice";
import { toast } from "react-hot-toast";
import { type Appointment } from "../lib/api/services/appointments";
import type { RootState } from "../lib/store/store";
import type { User } from "../lib/api/services/users";


const AppointmentList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  // const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const { appointments, isLoading, error } = useAppSelector((state: RootState) => state.appointments);
  const { doctors, isLoading: isLoadingDoctors } = useAppSelector((state: RootState) => state.doctors);
  const user = useAppSelector((state: RootState) => state.auth.user);
  
  // Get user role directly from Redux state to avoid function dependency issues
  const userRole = user?.role;
  const isDoctorRole = userRole === 'doctor';

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const doctorIdFromParams = queryParams.get('doctorId');
    if (doctorIdFromParams) {
      setSelectedDoctorId(doctorIdFromParams);
    }
  }, [location.search]);

  const appointmentStatusOptions = [
    { value: "pending", label: "Pending" },
    // { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Complete" },
    { value: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    dispatch(fetchAppointments())
      .unwrap()
      .catch((error) => {
        toast.error(error || 'Failed to fetch appointments');
      });
    
    // Only fetch doctors if user is not a doctor (doctors can't see other doctors)
    if (!isDoctorRole) {
      dispatch(fetchDoctors())
        .unwrap()
        .catch((error) => {
          toast.error(error || 'Failed to fetch doctors');
        });
    }
  }, [dispatch, isDoctorRole]);

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((appointment: Appointment) => {
        if (selectedDoctorId && appointment.doctor.id !== selectedDoctorId) {
          return false;
        }
        if (selectedStatus && appointment.status !== selectedStatus) {
          return false;
        }
        if (searchTerm) {
          const lowerSearchTerm = searchTerm.toLowerCase();
          const patientName = appointment.patient?.name?.toLowerCase() || '';
          const patientEmail = appointment.patient?.email?.toLowerCase() || '';
          const appointmentDate = new Date(appointment.date).toLocaleDateString().toLowerCase();
          return (
            patientName.includes(lowerSearchTerm) ||
            patientEmail.includes(lowerSearchTerm) ||
            appointmentDate.includes(lowerSearchTerm)
          );
        }
        return true;
      });
  }, [appointments, searchTerm, selectedDoctorId, selectedStatus]);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={() => dispatch(fetchAppointments())}
            className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
        <h1 className="text-xl sm:text-3xl font-bold text-[#0A0F56]">Appointment Dashboard</h1>
        <p className="text-gray-500 text-md">
            Manage and track all patient appointments efficiently.
          </p>
        </div>
        <button
          onClick={() => !isDoctorRole && navigate('/add-appointment')}
          disabled={isDoctorRole}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center transition-all duration-300 shadow-lg transform ${
            isDoctorRole 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50' 
              : 'bg-gradient-to-r from-[#0A0F56] to-[#232a7c] text-white hover:from-[#232a7c] hover:to-[#0A0F56] hover:shadow-xl hover:-translate-y-0.5'
          }`}
          title={isDoctorRole ? 'Doctors cannot create appointments' : 'Create a new appointment'}
        >
          <FaPlus className="mr-2 text-base" />
          Add Appointment
        </button>
      </div>

      {/* Filters and Search Section */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className={`grid grid-cols-1 gap-4 items-end ${isDoctorRole ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {/* Search Input */}
          <div className="relative">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                placeholder="Search by patient name, email, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 pl-10 text-sm w-full focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Doctor Filter - Only show for non-doctors */}
          {!isDoctorRole && (
            <div>
              <label htmlFor="doctorFilter" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FaFilter className="text-[#0A0F56] mr-2" /> Doctor
              </label>
              <Select
                id="doctorFilter"
                options={[{ value: '', label: 'All Doctors' }, ...doctors.map((d: User) => ({ value: d.id, label: d.name }))]}
                value={doctors.find((d: User) => d.id === selectedDoctorId) ?
                  { value: selectedDoctorId, label: doctors.find((d: User) => d.id === selectedDoctorId)?.name || '' } :
                  { value: '', label: 'All Doctors' }
                }
                onChange={(selectedOption) => setSelectedDoctorId(selectedOption ? selectedOption.value : null)}
                isClearable
                placeholder="Select Doctor"
                isLoading={isLoadingDoctors}
                className="text-sm"
                styles={{ control: (base) => ({ ...base, minHeight: '42px', borderColor: '#D1D5DB' }), menu: base => ({ ...base, zIndex: 20 }) }}
              />
            </div>
          )}

          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaFilter className="text-[#0A0F56] mr-2" /> Status
            </label>
            <Select
              id="statusFilter"
              options={[{ value: '', label: 'All Statuses' }, ...appointmentStatusOptions]}
              value={appointmentStatusOptions.find(option => option.value === selectedStatus) || { value: '', label: 'All Statuses' }}
              onChange={(selectedOption) => setSelectedStatus(selectedOption ? selectedOption.value : null)}
              isClearable
              placeholder="Select Status"
              className="text-sm"
              styles={{ control: (base) => ({ ...base, minHeight: '42px', borderColor: '#D1D5DB' }), menu: base => ({ ...base, zIndex: 20 }) }}
            />
          </div>
        </div>
      </div>

      <AppointmentTable appointments={filteredAppointments} />

      {/* <Pagination
        currentPage={currentPage}
        totalPages={10}
        onPageChange={setCurrentPage}
      /> */}
=======
import { useState } from "react";
import AddAppointmentModal from "./AddAppointmentModal";

const patients = [
  {
    name: "Olivia Rhyne",
    username: "@olivia",
    id: "#85736733",
    date: "Dec 07, 23",
    sex: "Male",
    age: 70,
    disease: "Diabetes",
    status: "Complete",
    doctor: "Dr. Mohon Roy",
    image: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: "Olivia Rhyne",
    username: "@olivia",
    id: "#85736733",
    date: "Dec 07, 23",
    sex: "Male",
    age: 70,
    disease: "Diabetes",
    status: "In-Treatment",
    doctor: "Dr. Mohon Roy",
    image: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: "Olivia Rhyne",
    username: "@olivia",
    id: "#85736733",
    date: "Dec 07, 23",
    sex: "Male",
    age: 70,
    disease: "Diabetes",
    status: "In-Treatment",
    doctor: "Dr. Mohon Roy",
    image: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: "Olivia Rhyne",
    username: "@olivia",
    id: "#85736733",
    date: "Dec 07, 23",
    sex: "Male",
    age: 70,
    disease: "Diabetes",
    status: "In-Treatment",
    doctor: "Dr. Mohon Roy",
    image: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: "Olivia ",
    username: "@olivia",
    id: "#85736733",
    date: "Dec 07, 23",
    sex: "Male",
    age: 70,
    disease: "Diabetes",
    status: "Complete",
    doctor: "Dr. Mohon Roy",
    image: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: " Rhyne",
    username: "@olivia",
    id: "#85736733",
    date: "Dec 07, 23",
    sex: "Male",
    age: 70,
    disease: "Diabetes",
    status: "In-Treatment",
    doctor: "Dr. Mohon Roy",
    image: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: "Olivia Rhyne",
    username: "@olivia",
    id: "#85736733",
    date: "Dec 07, 23",
    sex: "Male",
    age: 70,
    disease: "Diabetes",
    status: "Complete",
    doctor: "Dr. Mohon Roy",
    image: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: "Olivia Rhyne",
    username: "@olivia",
    id: "#85736733",
    date: "Dec 07, 23",
    sex: "Male",
    age: 70,
    disease: "Diabetes",
    status: "Complete",
    doctor: "Dr. Mohon Roy",
    image: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: "Olivia Rhyne",
    username: "@olivia",
    id: "#85736733",
    date: "Dec 07, 23",
    sex: "Male",
    age: 70,
    disease: "Diabetes",
    status: "Complete",
    doctor: "Dr. Mohon Roy",
    image: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: "Olivia Rhyne",
    username: "@olivia",
    id: "#85736733",
    date: "Dec 07, 23",
    sex: "Male",
    age: 70,
    disease: "Diabetes",
    status: "Complete",
    doctor: "Dr. Mohon Roy",
    image: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: "Phoenix Baker",
    username: "@phoenix",
    id: "#85736733",
    date: "Dec 09, 23",
    sex: "Female",
    age: 63,
    disease: "Blood pressure",
    status: "In-Treatment",
    doctor: "Dr. Imran Ali",
    image: "https://i.pravatar.cc/40?img=2",
  },
];

const AppointmentTable = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="p-6 bg-gray-50 min-h-screen ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Appointment List</h2>
          <p className="text-gray-500 text-xs">
            Showing: All Consultations of All Healthcare Providers
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="olivia@untitledui.com"
            className="border rounded-lg px-3 py-1 text-xs outline-none"
          />
          <button className="bg-blue-900 text-white px-3 py-1 rounded-lg text-xs"
           onClick={() => setIsModalOpen(true)}
          >
            + Add Appointment
          </button>
          <AddAppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center mb-4">
          <h3 className="text-sm font-medium">Patients List</h3>
          <span className="bg-blue-100 ml-2 text-blue-600 text-xs px-2 py-1 rounded-full">
            100 users
          </span>
        </div>

        <table className="w-full border-colla¬pse text-xs">
          <thead>
            <tr className="bg-gray-100 text-gray-600">
              <th className="text-left p-2">Patients name</th>
              <th className="text-left p-2">Patient ID</th>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Sex</th>
              <th className="text-left p-2">Age</th>
              <th className="text-left p-2">Diseases</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Doctor name</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => (
            //   <tr key={index} className="border-t text-gray-500 hover:bg-gray-50">
            <tr key={index} className="border-t border-gray-200 text-gray-700 hover:bg-gray-50">

                <td className="flex items-center space-x-2 p-2 mr-30">
                  <img
                    src={patient.image}
                    alt="profile"
                    className="w-6 h-6 rounded-full"
                  />
                  <div>
                    <p className="font-sm">{patient.name}</p>
                    <p className="text-gray-500 text-xxs">{patient.username}</p>
                  </div>
                </td>
                <td className="p-2">{patient.id}</td>
                <td className="p-2">{patient.date}</td>
                <td className="p-2">{patient.sex}</td>
                <td className="p-2">{patient.age}</td>
                <td className="p-2">{patient.disease}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 text-xxs rounded-full ${
                      patient.status === "Complete"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {patient.status}
                  </span>
                </td>
                <td className="p-2">{patient.doctor}</td>
                <td className="p-2 flex space-x-2">
                  <button className="text-gray-400 hover:text-blue-500 text-xxs">
                    ✏️
                  </button>
                  <button className="text-gray-400 hover:text-red-500 text-xxs">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 text-xs">
          <button className="px-3 py-1 bg-gray-200 rounded-lg">← Previous</button>
          <div className="flex space-x-1">
            <button className="px-2 py-1 bg-blue-500 text-white rounded-lg">1</button>
            <button className="px-2 py-1 bg-gray-200 rounded-lg">2</button>
            <button className="px-2 py-1 bg-gray-200 rounded-lg">3</button>
            <span className="px-2 py-1">...</span>
            <button className="px-2 py-1 bg-gray-200 rounded-lg">10</button>
          </div>
          <button className="px-3 py-1 bg-gray-200 rounded-lg">Next →</button>
        </div>
      </div>
>>>>>>> f838246f65dfb83cf91b3b75bed3392ca020fcac
    </div>
  );
};

<<<<<<< HEAD
export default AppointmentList;

=======
export default AppointmentTable;
>>>>>>> f838246f65dfb83cf91b3b75bed3392ca020fcac
