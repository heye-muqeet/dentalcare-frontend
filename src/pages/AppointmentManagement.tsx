import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../lib/store/store';
import { RootState } from '../lib/store/store';
import { fetchAppointments, createAppointment, updateAppointment, cancelAppointment, clearAppointmentErrors } from '../lib/store/slices/appointmentsSlice';
import { fetchPatients } from '../lib/store/slices/patientsSlice';
import { fetchDoctors } from '../lib/store/slices/doctorsSlice';
import CreateAppointmentModal from '../components/Modals/CreateAppointmentModal';
import EditAppointmentModal from '../components/Modals/EditAppointmentModal';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar, Clock, User, Stethoscope, Plus, Search, Filter, MoreVertical } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isYesterday } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Alert, AlertDescription } from '../components/ui/alert';

interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  doctorId?: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  visitType: 'walk_in' | 'scheduled';
  reasonForVisit: string;
  notes?: string;
  duration: number;
  isWalkIn: boolean;
  isEmergency: boolean;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-800',
};

const visitTypeColors = {
  walk_in: 'bg-orange-100 text-orange-800',
  scheduled: 'bg-purple-100 text-purple-800',
};

export default function AppointmentManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { appointments, isLoading, error } = useSelector((state: RootState) => state.appointments);
  const { patients } = useSelector((state: RootState) => state.patients);
  const { doctors } = useSelector((state: RootState) => state.doctors);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchAppointments({}));
    dispatch(fetchPatients());
    dispatch(fetchDoctors());
  }, [dispatch]);

  const handleCreateAppointment = (appointmentData: any) => {
    dispatch(createAppointment(appointmentData));
    setIsCreateModalOpen(false);
  };

  const handleEditAppointment = (appointmentData: any) => {
    if (selectedAppointment) {
      dispatch(updateAppointment({ id: selectedAppointment._id, appointmentData }));
      setIsEditModalOpen(false);
      setSelectedAppointment(null);
    }
  };

  const handleCancelAppointment = (appointmentId: string, reason: string) => {
    dispatch(cancelAppointment({ id: appointmentId, cancellationReason: reason }));
  };

  const handleEditClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = 
      appointment.patientId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reasonForVisit.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    const appointmentDate = new Date(appointment.appointmentDate);
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = isToday(appointmentDate);
    } else if (dateFilter === 'tomorrow') {
      matchesDate = isTomorrow(appointmentDate);
    } else if (dateFilter === 'yesterday') {
      matchesDate = isYesterday(appointmentDate);
    } else if (dateFilter === 'thisWeek') {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      matchesDate = appointmentDate >= weekStart && appointmentDate <= weekEnd;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getDateLabel = (date: string) => {
    const appointmentDate = new Date(date);
    if (isToday(appointmentDate)) return 'Today';
    if (isTomorrow(appointmentDate)) return 'Tomorrow';
    if (isYesterday(appointmentDate)) return 'Yesterday';
    return format(appointmentDate, 'MMM dd, yyyy');
  };

  const getTimeLabel = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-600">Manage patient appointments and schedules</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Appointment
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="thisWeek">This Week</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500 flex items-center">
              {filteredAppointments.length} appointment(s) found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="grid gap-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more appointments.'
                  : 'Get started by creating your first appointment.'}
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {appointment.patientId.firstName} {appointment.patientId.lastName}
                        </span>
                      </div>
                      <Badge className={statusColors[appointment.status]}>
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={visitTypeColors[appointment.visitType]}>
                        {appointment.visitType.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {appointment.isEmergency && (
                        <Badge className="bg-red-100 text-red-800">EMERGENCY</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{getDateLabel(appointment.appointmentDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{getTimeLabel(appointment.startTime, appointment.endTime)}</span>
                      </div>
                      {appointment.doctorId && (
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          <span>
                            Dr. {appointment.doctorId.firstName} {appointment.doctorId.lastName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Reason:</span>
                        <span>{appointment.reasonForVisit}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(appointment)}>
                        Edit Appointment
                      </DropdownMenuItem>
                      {appointment.status === 'scheduled' && (
                        <DropdownMenuItem 
                          onClick={() => handleCancelAppointment(appointment._id, 'Cancelled by user')}
                          className="text-red-600"
                        >
                          Cancel Appointment
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateAppointment}
        patients={patients.map(p => ({
          _id: p.id,
          firstName: p.name.split(' ')[0] || '',
          lastName: p.name.split(' ').slice(1).join(' ') || '',
          email: p.email,
          phone: p.phone || '',
        }))}
        doctors={doctors.map(d => ({
          _id: d.id,
          firstName: d.name.split(' ')[0] || '',
          lastName: d.name.split(' ').slice(1).join(' ') || '',
          specialization: d.specialization || '',
        }))}
      />

      {selectedAppointment && (
        <EditAppointmentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAppointment(null);
          }}
          onSuccess={handleEditAppointment}
          appointment={selectedAppointment}
          patients={patients.map(p => ({
            _id: p.id,
            firstName: p.name.split(' ')[0] || '',
            lastName: p.name.split(' ').slice(1).join(' ') || '',
            email: p.email,
            phone: p.phone || '',
          }))}
          doctors={doctors.map(d => ({
            _id: d.id,
            firstName: d.name.split(' ')[0] || '',
            lastName: d.name.split(' ').slice(1).join(' ') || '',
            specialization: d.specialization || '',
          }))}
        />
      )}
    </div>
  );
}
