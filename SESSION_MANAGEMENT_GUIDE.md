# 🔐 Session Management System - Complete Guide

## Overview

The Dental Care Management System now includes a comprehensive session management system that provides secure authentication, automatic token refresh, device management, and session monitoring. This system ensures a seamless user experience while maintaining high security standards.

## 🏗️ Architecture

### Core Components

1. **SessionManager** (`src/lib/services/sessionManager.ts`)
   - Central service for managing user sessions
   - Handles token storage, refresh, and cleanup
   - Provides device tracking and session statistics

2. **Auth Slice** (`src/lib/store/slices/authSlice.ts`)
   - Redux state management for authentication
   - Integrates with SessionManager for state updates
   - Handles login, logout, and session initialization

3. **Axios Interceptor** (`src/lib/api/axios.ts`)
   - Automatic token attachment to requests
   - Automatic token refresh on 401 errors
   - Request queuing during token refresh

4. **Session Hook** (`src/lib/hooks/useSessionManager.ts`)
   - React hook for session management
   - Provides session state and control functions
   - Handles session monitoring and updates

### UI Components

1. **SessionTimeoutWarning** (`src/components/SessionTimeoutWarning.tsx`)
   - Warns users before session expires
   - Provides options to extend or logout
   - Configurable warning threshold

2. **DeviceManagement** (`src/components/DeviceManagement.tsx`)
   - Shows active devices and sessions
   - Allows logout from specific devices
   - Displays device information and usage

3. **SessionStatus** (`src/components/SessionStatus.tsx`)
   - Shows current session status
   - Provides session details and statistics
   - Quick access to device management

4. **SessionInitializer** (`src/components/SessionInitializer.tsx`)
   - Initializes session on app startup
   - Sets up session monitoring
   - Handles session recovery

## 🚀 Features

### 1. Automatic Token Management

- **Access Token**: Short-lived (15 minutes) for API authentication
- **Refresh Token**: Long-lived (7 days) for token renewal
- **Automatic Refresh**: Tokens are refreshed before expiry
- **Request Queuing**: Failed requests are queued during refresh

### 2. Device Management

- **Device Tracking**: Each session is associated with a device
- **Multi-Device Support**: Users can have multiple active sessions
- **Device Information**: Tracks device name, IP, user agent
- **Remember Me**: Extended sessions for trusted devices

### 3. Session Security

- **Secure Storage**: Tokens stored in localStorage with validation
- **Session Timeout**: Automatic logout after inactivity
- **Activity Tracking**: Monitors user activity for session extension
- **Audit Logging**: All session events are logged

### 4. User Experience

- **Seamless Refresh**: Users don't notice token refresh
- **Session Warnings**: Advance warning before session expires
- **Session Recovery**: Automatic session restoration on app reload
- **Device Control**: Users can manage their active devices

## 📋 Usage

### Basic Setup

The session management system is automatically initialized when the app starts:

```tsx
// App.tsx
import SessionInitializer from './components/SessionInitializer';

function App() {
  return (
    <Provider store={store}>
      <SessionInitializer>
        <RouterProvider router={router} />
      </SessionInitializer>
    </Provider>
  );
}
```

### Using the Session Hook

```tsx
import { useSessionManager } from '../lib/hooks/useSessionManager';

function MyComponent() {
  const {
    sessionData,
    isSessionExpiring,
    isAuthenticated,
    refreshToken,
    logout,
    logoutAllDevices,
    getSessionStats
  } = useSessionManager();

  // Use session data and functions
}
```

### Login with Device Information

```tsx
const handleLogin = async (credentials) => {
  const deviceName = navigator.userAgent.includes('Mobile') 
    ? 'Mobile Device' 
    : 'Desktop Computer';
    
  await dispatch(login({
    ...credentials,
    isRememberMe: true,
    deviceName
  }));
};
```

### Session Monitoring

```tsx
// Show session status in header/sidebar
<SessionStatus className="ml-auto" />

// Show device management modal
<DeviceManagement onClose={() => setShowModal(false)} />
```

## ⚙️ Configuration

### Session Settings

```typescript
// Update session configuration
sessionManager.updateConfig({
  autoRefresh: true,
  refreshThreshold: 300, // 5 minutes before expiry
  maxRetries: 3,
  retryDelay: 1000,
  sessionTimeout: 30, // 30 minutes
  rememberMeDuration: 30, // 30 days
});
```

### Environment Variables

```env
# Backend configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
REFRESH_TOKEN_MAX_USAGE=100
MAX_REFRESH_TOKENS_PER_USER=5
```

## 🔧 API Integration

### Backend Endpoints

The session management system integrates with these backend endpoints:

- `POST /auth/login` - User login with device info
- `POST /auth/token/refresh` - Refresh access token
- `POST /auth/token/revoke` - Revoke current refresh token
- `POST /auth/token/revoke-all` - Revoke all refresh tokens
- `GET /auth/token/tokens` - Get active tokens
- `GET /auth/token/stats` - Get token statistics

### Request/Response Format

```typescript
// Login Request
{
  "email": "user@example.com",
  "password": "password123",
  "role": "doctor",
  "deviceName": "Mac Computer",
  "isRememberMe": true
}

// Login Response
{
  "user": { ... },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0...",
  "expires_in": 900,
  "token_type": "Bearer"
}

// Refresh Token Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0...",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

## 🛡️ Security Features

### 1. Token Security

- **JWT Validation**: Access tokens are validated on every request
- **Refresh Token Rotation**: Refresh tokens can be rotated for security
- **Usage Limits**: Refresh tokens have usage limits
- **Automatic Cleanup**: Expired tokens are automatically cleaned up

### 2. Session Security

- **Device Validation**: Sessions are tied to specific devices
- **IP Tracking**: IP addresses are tracked for security
- **User Agent Validation**: User agents are validated
- **Session Timeout**: Automatic logout after inactivity

### 3. Audit Logging

- **Login Events**: All login attempts are logged
- **Token Events**: Token refresh and revocation are logged
- **Security Events**: Suspicious activities are logged
- **Session Events**: Session creation and destruction are logged

## 📊 Monitoring and Analytics

### Session Statistics

```typescript
const stats = sessionManager.getSessionStats();
console.log({
  isActive: stats.isActive,
  timeUntilExpiry: stats.timeUntilExpiry,
  timeSinceLastActivity: stats.timeSinceLastActivity,
  deviceInfo: stats.deviceInfo
});
```

### Device Management

- **Active Devices**: View all active devices
- **Device Details**: See device information and usage
- **Remote Logout**: Logout from specific devices
- **Bulk Logout**: Logout from all devices

## 🚨 Error Handling

### Common Error Scenarios

1. **Token Expired**: Automatic refresh or redirect to login
2. **Refresh Failed**: Clear session and redirect to login
3. **Network Error**: Retry with exponential backoff
4. **Session Timeout**: Show warning and allow extension

### Error Recovery

```typescript
// Handle session expiry
window.addEventListener('auth:session-expired', () => {
  // Redirect to login or show login modal
  navigate('/login');
});

// Handle refresh errors
try {
  await sessionManager.refreshAccessToken();
} catch (error) {
  // Handle refresh failure
  sessionManager.clearSession();
}
```

## 🔄 Migration Guide

### From Legacy Auth System

1. **Update Login Forms**: Add device information to login
2. **Replace Token Storage**: Use SessionManager instead of localStorage
3. **Update API Calls**: Remove manual token handling
4. **Add Session Components**: Include session monitoring components

### Breaking Changes

- **Token Storage**: Tokens are now managed by SessionManager
- **API Interceptors**: Automatic token refresh is handled by axios interceptor
- **State Management**: Auth state is managed by Redux with session integration

## 🧪 Testing

### Unit Tests

```typescript
// Test session creation
const session = await sessionManager.createSession(user, accessToken, refreshToken, 900);

// Test token refresh
const newTokens = await sessionManager.refreshAccessToken();

// Test session cleanup
await sessionManager.clearSession();
```

### Integration Tests

```typescript
// Test login flow
const result = await dispatch(login(credentials));
expect(result.payload).toBeDefined();

// Test automatic refresh
// Make API call that triggers 401
// Verify token is automatically refreshed
```

## 📈 Performance Considerations

### Optimization Tips

1. **Lazy Loading**: Session components are only loaded when needed
2. **Debounced Updates**: Session state updates are debounced
3. **Efficient Storage**: Only necessary data is stored in localStorage
4. **Memory Management**: Timers and listeners are properly cleaned up

### Monitoring

- **Session Duration**: Track average session duration
- **Refresh Frequency**: Monitor token refresh frequency
- **Error Rates**: Track authentication error rates
- **Device Usage**: Monitor device usage patterns

## 🔮 Future Enhancements

### Planned Features

1. **Biometric Authentication**: Support for fingerprint/face ID
2. **SSO Integration**: Single sign-on with external providers
3. **Advanced Analytics**: Detailed session analytics and reporting
4. **Mobile App Support**: Enhanced mobile session management
5. **Session Sharing**: Secure session sharing between devices

### Configuration Options

- **Custom Token Expiry**: Per-role token expiry times
- **Advanced Security**: Additional security measures
- **Custom UI**: Customizable session management UI
- **Webhook Support**: Session event webhooks

## 📚 Additional Resources

- [Backend Token Management Guide](../new-backend/TOKEN_MANAGEMENT_GUIDE.md)
- [API Documentation](../new-backend/API_DOCUMENTATION.md)
- [Audit Logging Guide](../new-backend/AUDIT_LOGGING_GUIDE.md)
- [Postman Collection](../new-backend/Dental_Care_Management_System.postman_collection.json)

## 🤝 Support

For questions or issues with the session management system:

1. Check the console for error messages
2. Review the session statistics
3. Check the audit logs
4. Contact the development team

---

**Note**: This session management system is designed to work seamlessly with the existing backend API. Make sure your backend is properly configured with the token management endpoints before using these features.
