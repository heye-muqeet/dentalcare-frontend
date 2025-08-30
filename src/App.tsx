<<<<<<< HEAD
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './lib/store/store';
import { router } from './routes';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { getProfile } from './lib/store/slices/authSlice';
import { useAppDispatch } from './lib/hooks';

// New component to house the logic that depends on Redux store
function AppContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getProfile());
  }, []);

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
=======
import Layout from './pages/layout'
import PatientTable from './pages/PatientList'

function App() {

  return (
    <>
      {/* <Home/> */}
      {/* <PatientTable/> */}
      {/* <Navbar/> */}
      <Layout>
        <PatientTable />
        {/* <AppointmentTable/> */}
        {/* <DoctorTable/> */}
      </Layout>
    </>
  )
}

export default App
>>>>>>> f838246f65dfb83cf91b3b75bed3392ca020fcac
