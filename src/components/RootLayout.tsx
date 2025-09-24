import React from 'react';
import { Outlet } from 'react-router-dom';
import SessionExpiryHandler from './SessionExpiryHandler';

const RootLayout: React.FC = () => {
  return (
    <SessionExpiryHandler>
      <Outlet />
    </SessionExpiryHandler>
  );
};

export default RootLayout;
