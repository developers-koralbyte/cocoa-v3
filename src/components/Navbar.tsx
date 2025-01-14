import React from 'react';
import logo from '../assets/img/cocoa-logo.png'; // Replace with your actual logo path

const Navbar: React.FC = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-3 bg-[#F4E8FF] shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center">
        <img src={logo} alt="COCOQ Logo" className="h-10 w-auto" />
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-6 items-center">
        <button className="text-purple-900 font-medium hover:text-purple-700 flex items-center">
          Vendors <span className="ml-1 text-sm">&#9662;</span>
        </button>
        <button className="text-purple-900 font-medium hover:text-purple-700 flex items-center">
          Buyers <span className="ml-1 text-sm">&#9662;</span>
        </button>
        <button className="px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 transition">
          Log in
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
