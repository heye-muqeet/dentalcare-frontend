import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationScreen from './src/screens/RegistrationScreen/RegistrationScreen';
import SignInScreen from './src/screens/SignInScreen/SignInScreen';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegistrationScreen/>} />
        <Route path="/signin" element={<SignInScreen/>} />
      </Routes>
    </Router>
  );
};

export default App;
