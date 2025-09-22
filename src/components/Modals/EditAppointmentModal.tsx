import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Calendar, Clock, User, Stethoscope, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
}

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
  createdAt?: string;
  updatedAt?: string;
}

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointmentData: any) => void;
  appointment: Appointment;
  patients: Patient[];
  doctors: Doctor[];
}

interface FormData {
  doctorId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reasonForVisit: string;
  notes: string;
  duration: number;
  isEmergency: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function EditAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  appointment,
  patients,
  doctors,
}: EditAppointmentModalProps) {
  const [formData, setFormData] = useState<FormData>({
    doctorId: appointment.doctorId?._id || '',
    appointmentDate: format(new Date(appointment.appointmentDate), 'yyyy-MM-dd'),
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status,
    reasonForVisit: appointment.reasonForVisit,
    notes: appointment.notes || '',
    duration: appointment.duration,
    isEmergency: appointment.isEmergency,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        doctorId: appointment.doctorId?._id || '',
        appointmentDate: format(new Date(appointment.appointmentDate), 'yyyy-MM-dd'),
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        reasonForVisit: appointment.reasonForVisit,
        notes: appointment.notes || '',
        duration: appointment.duration,
        isEmergency: appointment.isEmergency,
      });
      setErrors({});
    }
  }, [isOpen, appointment]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Appointment date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Appointment time is required';
    }

    if (!formData.reasonForVisit) {
      newErrors.reasonForVisit = 'Reason for visit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const appointmentData = {
        doctorId: formData.doctorId || undefined,
        appointmentDate: formData.appointmentDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: formData.status,
        reasonForVisit: formData.reasonForVisit,
        notes: formData.notes,
        duration: formData.duration,
        isEmergency: formData.isEmergency,
      };

      onSuccess(appointmentData);
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleDurationChange = (duration: number) => {
    const endTime = calculateEndTime(formData.startTime, duration);
    setFormData(prev => ({
      ...prev,
      duration,
      endTime,
    }));
  };

  const handleStartTimeChange = (startTime: string) => {
    const endTime = calculateEndTime(startTime, formData.duration);
    setFormData(prev => ({
      ...prev,
      startTime,
      endTime,
    }));
  };

  const getMinDate = () => {
    return format(new Date(), 'yyyy-MM-dd');
  };

  const getMaxDate = () => {
    return format(addDays(new Date(), 90), 'yyyy-MM-dd');
  };

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'no_show', label: 'No Show', color: 'bg-gray-100 text-gray-800' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Edit Appointment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-medium text-lg">
                    {appointment.patientId.firstName} {appointment.patientId.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {appointment.patientId.email} • {appointment.patientId.phone}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-purple-100 text-purple-800">
                    {appointment.visitType.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {appointment.isEmergency && (
                    <Badge className="bg-red-100 text-red-800">EMERGENCY</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doctorId">Doctor</Label>
                  <Select
                    value={formData.doctorId}
                    onValueChange={(value: string) => handleInputChange('doctorId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No doctor assigned</SelectItem>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor._id} value={doctor._id}>
                          Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: string) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="appointmentDate">Appointment Date *</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className={errors.appointmentDate ? 'border-red-500' : ''}
                  />
                  {errors.appointmentDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.appointmentDate}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select
                    value={formData.duration.toString()}
                    onValueChange={(value: string) => handleDurationChange(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className={errors.startTime ? 'border-red-500' : ''}
                  />
                  {errors.startTime && (
                    <p className="text-sm text-red-500 mt-1">{errors.startTime}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reasonForVisit">Reason for Visit *</Label>
                <Input
                  id="reasonForVisit"
                  value={formData.reasonForVisit}
                  onChange={(e) => handleInputChange('reasonForVisit', e.target.value)}
                  placeholder="e.g., Regular checkup, cleaning, consultation"
                  className={errors.reasonForVisit ? 'border-red-500' : ''}
                />
                {errors.reasonForVisit && (
                  <p className="text-sm text-red-500 mt-1">{errors.reasonForVisit}</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or special instructions"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isEmergency"
                  checked={formData.isEmergency}
                  onCheckedChange={(checked: boolean) => handleInputChange('isEmergency', checked)}
                />
                <Label htmlFor="isEmergency">This is an emergency appointment</Label>
              </div>
            </CardContent>
          </Card>

          {/* Current Status Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge className={statusOptions.find(opt => opt.value === appointment.status)?.color}>
                  {statusOptions.find(opt => opt.value === appointment.status)?.label}
                </Badge>
                <div className="text-sm text-gray-500">
                  Created: {appointment.createdAt ? format(new Date(appointment.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: {appointment.updatedAt ? format(new Date(appointment.updatedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Appointment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
