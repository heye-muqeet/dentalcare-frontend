# 🔄 Loading System - Complete Guide

## Overview

The Dental Care Management System includes a comprehensive loading system that provides various loading states, animations, and user feedback mechanisms. This system ensures a smooth user experience during data fetching, form submissions, and other asynchronous operations.

## 🏗️ Architecture

### Core Components

1. **Loader Component** (`src/components/Loader/Loader.tsx`)
   - Multiple loader variants (spinner, dots, pulse, bars, skeleton)
   - Various sizes (xs, sm, md, lg, xl)
   - Color themes (primary, secondary, success, warning, error, info, white, gray)
   - Flexible positioning and styling options

2. **Loading Hooks** (`src/lib/hooks/useLoading.ts`)
   - `useLoading` - Basic loading state management
   - `useAsyncLoading` - Async operation loading with error handling
   - `useMultipleLoading` - Multiple loading states management

3. **Loading Context** (`src/lib/contexts/LoadingContext.tsx`)
   - Global loading state management
   - Progress tracking
   - Error handling

4. **Specialized Components**
   - `LoadingButton` - Button with loading state
   - `LoadingWrapper` - Wrapper for conditional loading
   - `GlobalLoadingOverlay` - Full-screen loading overlay

## 🚀 Features

### 1. Multiple Loader Variants

- **Spinner**: Classic rotating spinner
- **Dots**: Bouncing dots animation
- **Pulse**: Pulsing circle animation
- **Bars**: Animated bars
- **Skeleton**: Content placeholder loading

### 2. Flexible Sizing

- **xs**: 16x16px - For small buttons and inline elements
- **sm**: 24x24px - For buttons and small components
- **md**: 32x32px - For cards and medium components
- **lg**: 48x48px - For page sections
- **xl**: 64x64px - For full-page loading

### 3. Color Themes

- **primary**: Blue theme for main actions
- **secondary**: Gray theme for secondary actions
- **success**: Green theme for success states
- **warning**: Yellow theme for warnings
- **error**: Red theme for errors
- **info**: Light blue theme for information
- **white**: White theme for dark backgrounds
- **gray**: Gray theme for subtle loading

### 4. Loading States

- **Local Loading**: Component-level loading states
- **Global Loading**: App-wide loading states
- **Progress Tracking**: Progress percentage display
- **Error Handling**: Error state display and recovery

## 📋 Usage

### Basic Loader

```tsx
import { Loader } from '../components/Loader';

// Basic spinner
<Loader />

// Customized loader
<Loader
  variant="dots"
  size="lg"
  color="primary"
  text="Loading data..."
  className="my-4"
/>
```

### Loading Button

```tsx
import { LoadingButton } from '../components/Loader';

<LoadingButton
  loading={isLoading}
  loadingText="Saving..."
  variant="primary"
  size="md"
  onClick={handleSave}
>
  Save Changes
</LoadingButton>
```

### Loading Wrapper

```tsx
import { LoadingWrapper, DataTableLoadingWrapper } from '../components/Loader';

// Basic wrapper
<LoadingWrapper
  loading={isLoading}
  error={error}
  loader="skeleton"
  text="Loading user data..."
>
  <UserProfile user={user} />
</LoadingWrapper>

// Table wrapper
<DataTableLoadingWrapper
  loading={isLoading}
  error={error}
  rows={5}
>
  <DataTable data={data} />
</DataTableLoadingWrapper>
```

### Using Loading Hooks

```tsx
import { useLoading, useAsyncLoading } from '../lib/hooks/useLoading';

// Basic loading hook
function MyComponent() {
  const { isLoading, startLoading, stopLoading, setError } = useLoading({
    onError: (error) => console.error('Loading failed:', error),
    onSuccess: () => console.log('Loading completed'),
    timeout: 10000, // 10 second timeout
  });

  const handleLoadData = async () => {
    startLoading();
    try {
      const data = await fetchData();
      setData(data);
      stopLoading();
    } catch (error) {
      stopLoading(error.message);
    }
  };

  return (
    <div>
      {isLoading && <Loader text="Loading..." />}
      <button onClick={handleLoadData}>Load Data</button>
    </div>
  );
}

// Async loading hook
function AsyncComponent() {
  const { isLoading, execute } = useAsyncLoading(async () => {
    const response = await fetch('/api/data');
    return response.json();
  });

  const handleLoad = () => {
    execute().then(result => {
      console.log('Data loaded:', result);
    });
  };

  return (
    <LoadingButton
      loading={isLoading}
      onClick={handleLoad}
    >
      Load Data
    </LoadingButton>
  );
}
```

### Global Loading

```tsx
import { useGlobalLoading } from '../lib/contexts/LoadingContext';

function MyComponent() {
  const { startGlobalLoading, stopGlobalLoading, setGlobalProgress } = useGlobalLoading();

  const handleLongOperation = async () => {
    startGlobalLoading('Processing your request...');
    
    for (let i = 0; i <= 100; i += 10) {
      setGlobalProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    stopGlobalLoading();
  };

  return (
    <button onClick={handleLongOperation}>
      Start Long Operation
    </button>
  );
}
```

### Multiple Loading States

```tsx
import { useMultipleLoading } from '../lib/hooks/useLoading';

function ComplexComponent() {
  const {
    loadingStates,
    startLoading,
    stopLoading,
    isAnyLoading,
    hasAnyError
  } = useMultipleLoading(['user', 'posts', 'comments']);

  const loadUser = () => startLoading('user');
  const loadPosts = () => startLoading('posts');
  const loadComments = () => startLoading('comments');

  return (
    <div>
      {loadingStates.user.isLoading && <Loader text="Loading user..." />}
      {loadingStates.posts.isLoading && <Loader text="Loading posts..." />}
      {loadingStates.comments.isLoading && <Loader text="Loading comments..." />}
      
      {isAnyLoading && <p>Something is loading...</p>}
      {hasAnyError && <p>An error occurred</p>}
    </div>
  );
}
```

## 🎨 Styling and Customization

### Custom Styling

```tsx
// Custom className
<Loader
  className="my-custom-loader"
  variant="spinner"
  size="lg"
/>

// Custom colors using CSS variables
<Loader
  style={{
    '--loader-color': '#ff6b6b',
    '--loader-size': '2rem'
  }}
/>
```

### Theme Integration

```tsx
// Using Tailwind classes
<Loader
  className="text-blue-600"
  variant="dots"
  size="md"
/>

// Custom positioning
<Loader
  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
  variant="spinner"
  size="lg"
/>
```

## 🔧 Configuration

### Global Configuration

```tsx
// In your app setup
import { LoadingProvider } from './lib/contexts/LoadingContext';

function App() {
  return (
    <LoadingProvider>
      <YourApp />
    </LoadingProvider>
  );
}
```

### Component Configuration

```tsx
// Default props for all loaders
const defaultLoaderProps = {
  size: 'md',
  variant: 'spinner',
  color: 'primary',
  centered: true,
};
```

## 📊 Performance Considerations

### Optimization Tips

1. **Lazy Loading**: Only render loaders when needed
2. **Memoization**: Use React.memo for loader components
3. **Debouncing**: Debounce rapid loading state changes
4. **Cleanup**: Properly cleanup timers and intervals

### Best Practices

```tsx
// Use React.memo for performance
const MemoizedLoader = React.memo(Loader);

// Debounce loading states
const debouncedLoading = useDebounce(isLoading, 300);

// Cleanup on unmount
useEffect(() => {
  return () => {
    // Cleanup timers, intervals, etc.
  };
}, []);
```

## 🧪 Testing

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react';
import { Loader } from '../components/Loader';

test('renders loader with text', () => {
  render(<Loader text="Loading..." />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

test('shows loading state', () => {
  const { isLoading } = useLoading();
  expect(isLoading).toBe(false);
});
```

### Integration Tests

```tsx
test('loading button shows loading state', async () => {
  render(<LoadingButton loading={true}>Save</LoadingButton>);
  expect(screen.getByRole('button')).toBeDisabled();
});
```

## 🚨 Error Handling

### Error States

```tsx
<LoadingWrapper
  loading={isLoading}
  error={error}
  fallback={<CustomErrorComponent />}
>
  <DataComponent />
</LoadingWrapper>
```

### Error Recovery

```tsx
const { setError, clearError } = useLoading();

const handleRetry = () => {
  clearError();
  // Retry the operation
};
```

## 📱 Responsive Design

### Mobile Optimization

```tsx
// Responsive loader sizes
<Loader
  size={window.innerWidth < 768 ? 'sm' : 'md'}
  variant="spinner"
/>
```

### Touch-Friendly

```tsx
// Larger touch targets for mobile
<LoadingButton
  size="lg"
  className="min-h-[44px] min-w-[44px]"
>
  Save
</LoadingButton>
```

## 🔮 Advanced Features

### Custom Animations

```tsx
// Custom CSS animations
const customLoader = {
  animation: 'customSpin 1s linear infinite',
  '@keyframes customSpin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  }
};
```

### Progress Tracking

```tsx
const { setProgress } = useLoading();

const trackProgress = (progress) => {
  setProgress(progress);
  // Update UI with progress
};
```

## 📚 Examples

### Complete Data Loading Example

```tsx
import React, { useState, useEffect } from 'react';
import { 
  LoadingWrapper, 
  LoadingButton, 
  useAsyncLoading 
} from '../components/Loader';

function UserList() {
  const [users, setUsers] = useState([]);
  const { isLoading, execute, error } = useAsyncLoading(async () => {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  });

  const loadUsers = async () => {
    const result = await execute();
    if (result) {
      setUsers(result);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Users</h2>
        <LoadingButton
          loading={isLoading}
          onClick={loadUsers}
        >
          Refresh
        </LoadingButton>
      </div>

      <LoadingWrapper
        loading={isLoading}
        error={error}
        loader="table"
      >
        <table className="w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </LoadingWrapper>
    </div>
  );
}
```

## 🤝 Integration with Other Systems

### Redux Integration

```tsx
// Using with Redux loading states
const { isLoading } = useSelector(state => state.data);
<LoadingWrapper loading={isLoading}>
  <DataComponent />
</LoadingWrapper>
```

### API Integration

```tsx
// Using with API calls
const { data, loading, error } = useQuery('/api/users');
<LoadingWrapper loading={loading} error={error}>
  <UserList data={data} />
</LoadingWrapper>
```

## 📈 Monitoring and Analytics

### Loading Metrics

```tsx
// Track loading performance
const startTime = Date.now();
const { stopLoading } = useLoading({
  onSuccess: () => {
    const duration = Date.now() - startTime;
    analytics.track('loading_completed', { duration });
  }
});
```

## 🔧 Troubleshooting

### Common Issues

1. **Loader not showing**: Check if loading state is properly set
2. **Animation not smooth**: Ensure CSS transitions are enabled
3. **Performance issues**: Use React.memo and avoid unnecessary re-renders
4. **Styling conflicts**: Check for CSS specificity issues

### Debug Mode

```tsx
// Enable debug logging
const { isLoading } = useLoading({
  onError: (error) => console.error('Loading error:', error),
  onSuccess: () => console.log('Loading success'),
});
```

## 📚 Additional Resources

- [React Loading Patterns](https://reactpatterns.com/)
- [CSS Animation Best Practices](https://web.dev/animations/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Performance Optimization](https://reactjs.org/docs/optimizing-performance.html)

---

**Note**: This loading system is designed to be flexible and performant. Choose the appropriate loader variant and size based on your specific use case and design requirements.
