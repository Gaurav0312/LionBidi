// components/Layout.js
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer'; // if you have one

const Layout = () => {
  const location = useLocation();
  
  // Check if current path is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <>
      {/* Conditionally render header - hide on admin pages */}
      {!isAdminRoute && <Header />}
      
      {/* Main content area */}
      <main>
        <Outlet />
      </main>
      
      {/* Conditionally render footer if you have one */}
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default Layout;
