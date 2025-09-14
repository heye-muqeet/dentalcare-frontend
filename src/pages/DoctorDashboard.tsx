import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { 
  FiUsers, 
  FiCalendar, 
  FiActivity, 
  FiClock,
  FiTrendingUp,
  FiClipboard,
  FiUserCheck,
  FiAlertCircle,
  FiPlus,
  FiEye,
  FiEdit
} from 'react-icons/fi';

interface DoctorStats {
  todayAppointments: number;
  completedAppointments: number;
  upcomingAppointments: number;
  totalPatients: number;
  monthlyEarnings: number;
  averageRating: number;
}

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const user = useAppSelector((state: RootState) => state.auth.user);
  
  const [stats, setStats] = useState<DoctorStats>({
    todayAppointments: 0,
    completedAppointments: 0,
    upcomingAppointments: 0,
    totalPatients: 0,
    monthlyEarnings: 0,
    averageRating: 0
  });
  
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load doctor data
  useEffect(() => {
    const loadDoctorData = async () => {
      setIsLoading(true);
      
      try {
        // Mock data for now - would be replaced with actual API calls
        setStats({
          todayAppointments: 8,
          completedAppointments: 5,
          upcomingAppointments: 3,
          totalPatients: 124,
          monthlyEarnings: 8500,
          averageRating: 4.8
        });

        setTodayAppointments([
          {
            id: '1',
            patientName: 'John Smith',
            time: '9:00 AM',
            type: 'Consultation',
            status: 'completed'
          },
          {
            id: '2',
            patientName: 'Sarah Johnson',
            time: '10:30 AM',
            type: 'Cleaning',
            status: 'completed'
          },
          {
            id: '3',
            patientName: 'Mike Davis',
            time: '2:00 PM',
            type: 'Check-up',
            status: 'scheduled'
          },
          {
            id: '4',
            patientName: 'Emily Wilson',
            time: '3:30 PM',
            type: 'Filling',
            status: 'scheduled'
          }
        ]);
      } catch (error) {
        console.error('Failed to load doctor data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctorData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getGreeting()}, Dr. {user?.lastName}!
        </h1>
        <p className="text-gray-600">
          Here's your daily overview and schedule
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todayAppointments}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiCalendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completedAppointments}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiUserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiUsers className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageRating}/5.0</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiTrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
            <button
              onClick={() => navigate('/appointments')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiClock className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{appointment.patientName}</h4>
                    <p className="text-sm text-gray-500">{appointment.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900">{appointment.time}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status.replace('-', ' ')}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    <FiEye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/appointments/new')}
              className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiPlus className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">New Appointment</span>
            </button>
            <button
              onClick={() => navigate('/patients')}
              className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiUsers className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">View Patients</span>
            </button>
            <button
              onClick={() => navigate('/appointments')}
              className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiCalendar className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Schedule</span>
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FiClipboard className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium">Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="p-1 rounded-full text-green-500">
              <FiUserCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">Completed appointment with John Smith</p>
              <p className="text-xs text-gray-500 flex items-center">
                <FiClock className="w-3 h-3 mr-1" />
                2 hours ago
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-1 rounded-full text-blue-500">
              <FiActivity className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">New patient registration: Sarah Johnson</p>
              <p className="text-xs text-gray-500 flex items-center">
                <FiClock className="w-3 h-3 mr-1" />
                4 hours ago
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-1 rounded-full text-yellow-500">
              <FiAlertCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">Appointment rescheduled for tomorrow</p>
              <p className="text-xs text-gray-500 flex items-center">
                <FiClock className="w-3 h-3 mr-1" />
                6 hours ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
