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
