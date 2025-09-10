## Dental Care Frontend – React/TypeScript Documentation

### Overview
Modern SPA for the Dental Care system built with React 19, TypeScript, Vite, Redux Toolkit, Tailwind CSS, and Axios. Implements role-based routing, authenticated session via HttpOnly JWT cookies, domain-focused API services, and a dashboard UI for owners, receptionists, and doctors.

### Tech Stack
- React 19 + TypeScript
- Vite build tooling
- React Router 7
- Redux Toolkit (@reduxjs/toolkit + react-redux)
- Axios (with credentials)
- Tailwind CSS

### Quick Start
Environment variables (create `.env` in project root):
```env
VITE_API_BASE_URL=http://localhost:1337
# Optional for AI features:
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Install & run:
```bash
npm install
npm run dev
# App served at http://localhost:5173
```

### Project Structure
- `src/main.tsx` – Vite bootstrap
- `src/App.tsx` – App provider and initial `getProfile()` dispatch
- `src/routes/index.tsx` – Route definitions with guards
- `src/layouts/DashboardLayout.tsx` – Authenticated shell
- `src/pages/*` – Feature screens (Dashboard, Patients, Appointments, Services, Expense, Invoice, Profile, Treatment Details)
- `src/components/*` – Reusable UI (auth guards, avatars, pagination, sliders, modals, etc.)
- `src/lib/api/*` – Axios instance, endpoints map, and domain service modules
- `src/lib/store/*` – Redux store and slices per domain
- `src/lib/utils/rolePermissions.ts` – Role-based route control and helpers
- `src/lib/services/cloudinaryUpload.ts` – Cloudinary upload helper
- `AI_SETUP_GUIDE.md`, `AI_ANALYSIS_GUIDE.md` – Guides for AI features

### Authentication Flow
- On mount (`AppContent` in `App.tsx`), dispatches `getProfile` which calls `GET /api/auth/profile` using Axios with `withCredentials: true`
- If authenticated, Redux `auth` slice sets `isAuthenticated=true` and stores `user`
- `ProtectedRoute` shows loader while `isLoading` then redirects to `/login` if unauthenticated
- `RoleBasedRoute` checks `requiredRoles` vs current user role using `getRedirectPath`

### Routing
Defined in `src/routes/index.tsx` using `createBrowserRouter`:
- Public: `/login`
- Protected + role-restricted: `/dashboard`, `/doctors`, `/appointments`, `/patients`, `/services`, `/add-appointment`, `/patient-profile/:id`, `/appointment-details`, `/treatments/:treatmentId`, `/expense`, `/invoice`, `/account`
- Wrapper `DashboardWrapper` injects `DashboardLayout` with `user` from Redux

### State Management (Redux Toolkit)
- `src/lib/store/store.ts` combines slices: `auth`, `doctors`, `patients`, `appointments`, `services`, `treatments`, `profile`, `invoices`, `expenses`
- Store resets state on `auth/logout/fulfilled`
- Async thunks in slices handle API calls and error propagation (e.g., `authSlice.ts` → `login`, `getProfile`, `logoutUser`)

### API Layer
- `src/lib/api/axios.ts` – Axios instance with `withCredentials: true` and basic interceptors for 401/403
- `src/lib/api/endpoints.ts` – central endpoints using `VITE_API_BASE_URL`
- Domain services under `src/lib/api/services/`:
  - `auth.ts` – `login`, `register`, `getProfile`, `logout`, `getCurrentUser`
  - `users.ts` – `getUsers`, `getDoctors`, `createUser`, `updateUser`, `deleteUser`, `changePassword`
  - `patients.ts` – fetch list/detail/details aggregation, create/update
  - `appointments.ts` – list/detail, available slots, create/update/cancel
  - `treatments.ts`, `services.ts`, `invoices.ts`, `expenses.ts`, `dashboard.ts`, `aiAnalysis.ts`

Usage pattern:
```ts
import { patientService } from '@/lib/api/services/patients';
const details = await patientService.getPatientDetails(patientId);
```

### UI & Components
- Role-based navigation derived from `routePermissions` in `src/lib/utils/rolePermissions.ts`
- Feature components: Appointment tables, Attach Report modal (AI + Cloudinary), Invoice slider, Medicine inputs, etc.
- Styling via Tailwind classes

### AI Features (Optional)
See `AI_SETUP_GUIDE.md` and `AI_ANALYSIS_GUIDE.md` for enabling Google Gemini-based image analysis:
- Add `VITE_GEMINI_API_KEY` to `.env`
- Use analysis buttons in report/appointment flows; AI validates dental image type and returns findings, confidence, recommendations

### Error Handling
- Axios interceptors log API errors; feature pages surface human-friendly messages/toasts
- Auth errors bubble into `authSlice` for login feedback

### Deployment Notes
- Build: `npm run build` (Vite)
- SPA hosting: `vercel.json` provides rewrite to `/index.html`
- Configure `VITE_API_BASE_URL` to production backend (HTTPS). Backend CORS must allow the deployed origin and credentials

### Known Considerations
- App expects backend JWT cookie; ensure backend runs with HTTPS and proper CORS (`allowCredentials: true`, origin whitelisting)
- Route access is enforced in both UI and backend policies; UI redirects to permitted routes via `getRedirectPath`

### References
- Backend API contract: `dentalcare-backend/config/routes.js`, Postman collection `DentalCare_API_Collection.json`
- Expenses API details: `dentalcare-backend/EXPENSE_API_DOCUMENTATION.md`
- AI configuration: `AI_SETUP_GUIDE.md`, `AI_ANALYSIS_GUIDE.md`


