import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './lib/store/store';
import { router } from './routes';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { getProfile } from './lib/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from './lib/hooks';
import type { RootState } from './lib/store/store';

// New component to house the logic that depends on Redux store
function AppContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Always try to get profile on app start to verify authentication
    console.log('App startup - calling getProfile');
    dispatch(getProfile());
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
