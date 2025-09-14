# MI Dental - New Frontend

A modern React application built with Vite, Tailwind CSS, and Redux Toolkit for the MI Dental Care Management System with role-based authentication.

## Features

- ⚡ **Vite** - Fast build tool and development server
- ⚛️ **React 19** - Latest React with TypeScript support
- 🎨 **Tailwind CSS v4** - Modern utility-first CSS framework
- 🔧 **TypeScript** - Type-safe development
- 📦 **ESLint** - Code linting and formatting
- 🚀 **Hot Module Replacement** - Instant development feedback
- 🏪 **Redux Toolkit** - State management with real API integration
- 🎯 **React Router** - Client-side routing with protected routes
- 🔔 **React Hot Toast** - Beautiful notifications
- 🎨 **React Icons** - Icon library
- 📝 **React Select** - Advanced select components
- 🌐 **Axios** - HTTP client for API calls
- 🔐 **Role-based Authentication** - Multi-role access control
- 🛡️ **Protected Routes** - Secure navigation based on user roles

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Create .env file
VITE_API_BASE_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── assets/              # Static assets
├── components/          # Reusable components
│   ├── Auth/           # Authentication components
│   ├── Sidebar/        # Navigation sidebar
│   └── Topbar/         # Top navigation bar
├── features/           # Feature-based modules
│   └── auth/           # Authentication features
│       └── components/ # Auth-specific components
├── layouts/            # Layout components
├── lib/                # Utilities and configurations
│   ├── api/            # API services and configuration
│   │   ├── services/   # API service modules
│   │   ├── axios.ts    # Axios configuration
│   │   └── endpoints.ts # API endpoints
│   ├── constants/      # Application constants
│   │   └── roles.ts    # Role definitions and permissions
│   ├── store/          # Redux store and slices
│   │   └── slices/     # Redux slices for state management
│   ├── hooks/          # Redux hooks (useAppDispatch, useAppSelector)
│   └── utils/          # Utility functions
├── routes/             # Routing configuration
├── App.tsx             # Main App component
├── main.tsx            # Application entry point
└── index.css           # Global CSS with Tailwind imports
```

## Authentication & Roles

The application supports role-based authentication with the following user roles:

### User Roles
- **Super Admin** - Full system access
- **Organization Admin** - Organization-level management
- **Branch Admin** - Branch-level management
- **Doctor** - Patient care and appointments
- **Receptionist** - Patient management and scheduling
- **Patient** - Personal profile and appointments

### Role Permissions
Each role has specific permissions and access levels:
- **Super Admin**: Manage organizations, view all data, system settings
- **Organization Admin**: Manage branches, users, organization data
- **Branch Admin**: Manage doctors, receptionists, patients, appointments
- **Doctor**: View patients, manage appointments, create treatments
- **Receptionist**: Manage patients, appointments, invoices
- **Patient**: View own profile, appointments, treatments

## API Integration

The application integrates with the backend API using:

### API Services
- **Authentication Service** - Login, logout, profile management
- **User Service** - User CRUD operations
- **Organization Service** - Organization management
- **Branch Service** - Branch management
- **Patient Service** - Patient management
- **Appointment Service** - Appointment scheduling
- **Service Service** - Dental services catalog
- **Treatment Service** - Treatment records
- **Invoice Service** - Billing management
- **Expense Service** - Expense tracking

### API Configuration
- Base URL: `http://localhost:3000` (configurable via environment)
- Authentication: Bearer token in Authorization header
- Error handling: Automatic token refresh and logout on 401
- Request/Response interceptors for consistent API handling

## Redux Store Structure

The application uses Redux Toolkit for state management with the following slices:

- **auth** - Authentication state (login, logout, user profile)
- **doctors** - Doctor management (CRUD operations)
- **patients** - Patient management (CRUD operations)
- **appointments** - Appointment scheduling and management
- **services** - Dental services catalog
- **treatments** - Treatment records
- **profile** - User profile management
- **invoices** - Invoice management
- **expenses** - Expense tracking

## Routing & Navigation

### Protected Routes
All routes except login are protected and require authentication.

### Role-Based Access
Routes are protected based on user roles:
- `/dashboard` - All roles
- `/doctors` - Admin roles only
- `/patients` - Admin, Doctor, Receptionist
- `/appointments` - All roles
- `/services` - Admin, Receptionist
- `/treatments` - All roles
- `/invoices` - Admin, Receptionist
- `/expenses` - Admin, Receptionist
- `/profile` - All roles

### Navigation
- **Sidebar** - Role-based navigation menu
- **Topbar** - User profile, notifications, search
- **Breadcrumbs** - Current page context

## Styling & UI

### Design System
- **Color Scheme**: Professional blue (#0A0F56) with gray accents
- **Typography**: Clean, readable fonts
- **Components**: Consistent design patterns
- **Responsive**: Mobile-first approach

### UI Components
- **Forms** - Consistent form styling with validation
- **Buttons** - Primary, secondary, and action buttons
- **Cards** - Content containers with shadows
- **Modals** - Overlay dialogs for actions
- **Tables** - Data display with sorting and filtering
- **Navigation** - Sidebar and top navigation

## Development

### Key Features Implemented

- ✅ **Role-based Authentication** - Multi-role login system
- ✅ **Protected Routes** - Secure navigation based on roles
- ✅ **Redux Store** - Complete state management with real API
- ✅ **API Integration** - Full backend integration with axios
- ✅ **TypeScript** - Type-safe development
- ✅ **Responsive Design** - Mobile-first Tailwind CSS
- ✅ **Routing** - React Router with protected routes
- ✅ **Toast Notifications** - User feedback system
- ✅ **Icon Integration** - React Icons throughout
- ✅ **Form Components** - Advanced form handling
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Loading States** - User-friendly loading indicators

### Environment Configuration

Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3000
```

### Backend Integration

The frontend is designed to work with the Dental Care Management System backend API. Ensure the backend is running on `http://localhost:3000` before starting the frontend.

### Testing the Login Flow

1. Start the backend server
2. Start the frontend development server
3. Navigate to `http://localhost:5173`
4. Use the role-based login form to test different user types
5. Verify role-based navigation and access control

## API Endpoints

The application integrates with the following backend endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `GET /auth/me` - Get current user
- `POST /auth/token/refresh` - Refresh access token

### User Management
- `GET /users` - Get all users
- `GET /users/doctors` - Get doctors
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Organization Management
- `GET /organizations` - Get organizations
- `POST /organizations` - Create organization
- `PUT /organizations/:id` - Update organization
- `DELETE /organizations/:id` - Delete organization

### Branch Management
- `GET /branches` - Get branches
- `POST /branches` - Create branch
- `PUT /branches/:id` - Update branch
- `DELETE /branches/:id` - Delete branch

## Next Steps

1. ✅ **Complete Authentication System** - Role-based login implemented
2. ✅ **API Integration** - Full backend integration completed
3. ✅ **Protected Routes** - Role-based access control implemented
4. ✅ **UI Components** - Professional design system implemented
5. **Data Management** - Implement CRUD operations for all entities
6. **Advanced Features** - Add search, filtering, pagination
7. **Testing** - Add unit and integration tests
8. **Performance** - Optimize bundle size and loading times
9. **Documentation** - Add comprehensive API documentation
10. **Deployment** - Set up production deployment

## License

Private project for MI Dental Care Management System.