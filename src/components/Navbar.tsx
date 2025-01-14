import React from "react";
import logo from "../assets/img/cocoa-logo.png"; // Replace with your actual logo path

const Navbar: React.FC = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-primaryPurple shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center">
        <a href="/">
          <img
            src={logo}
            alt="COCOQ - Connecting Vendors & Buyers"
            className="h-10 w-auto"
          />
        </a>
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-6 items-center">
        {/* Vendors Dropdown */}
        <button
          className="text-purple-900 font-medium hover:text-purple-700 focus:outline-none flex items-center"
          aria-haspopup="true"
          aria-expanded="false"
        >
          Vendors <span className="ml-1 text-sm">&#9662;</span>
        </button>

        {/* Buyers Dropdown */}
        <button
          className="text-purple-900 font-medium hover:text-purple-700 focus:outline-none flex items-center"
          aria-haspopup="true"
          aria-expanded="false"
        >
          Buyers <span className="ml-1 text-sm">&#9662;</span>
        </button>

        {/* Login Button */}
        <button className="px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 focus:ring-2 focus:ring-purple-500 focus:outline-none transition">
          Log in
        </button>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden flex items-center">
        <button
          className="text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
