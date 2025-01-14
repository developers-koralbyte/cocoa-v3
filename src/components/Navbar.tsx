import React from "react";
import logo from "../assets/img/cocoa-logo.png"; // Replace with your actual logo path

const Navbar: React.FC = () => {
  return (
    <nav className="h-16 flex justify-between items-center px-8 py-2 bg-primaryPurple shadow-lg">
      {/* Logo Section */}
      <div className="mt-10 flex items-center h-full">
        <a href="/">
          <img
            src={logo}
            alt="COCOQ - Connecting Vendors & Buyers"
            className="h-full w-auto" // Ensures the logo takes the full navbar height
          />
        </a>
      </div>

      {/* Navigation Links */}
      <div className="mt-10 flex space-x-8 items-center h-full">
        {/* Vendors Dropdown */}
        <button
          className="bg-buttonBg text-white font-medium hover:bg-purple-800 rounded-full px-4 py-2 h-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gradientStart transition-all"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <span>Vendors</span>
          <span className="ml-1 text-xs">&#9662;</span>
        </button>

        {/* Buyers Dropdown */}
        <button
          className="bg-buttonBg text-white font-medium hover:bg-purple-800 rounded-full px-4 py-2 h-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gradientStart transition-all"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <span>Buyers</span>
          <span className="ml-1 text-xs">&#9662;</span>
        </button>

        {/* Login Button */}
        <button
          className="bg-purple-700 text-white font-medium rounded-full px-4 py-2 h-full flex items-center justify-center hover:bg-purple-800 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
        >
          Log in
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
