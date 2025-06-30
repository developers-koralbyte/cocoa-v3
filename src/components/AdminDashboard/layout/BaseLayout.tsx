import React, { ReactNode, useState, useEffect } from "react";
import SideBarAdmin from "./SideBarAdmin";
import { FiMenu } from "react-icons/fi";
import logo from "../../../assets/img/Dashboard/CocoaLogo.png";

interface BaseLayoutProps {
  children: ReactNode;
}

const BaseLayout = ({ children }: BaseLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen bg-white md:bg-[#D6CFF0]">
      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-[#D6CFF0] 
        transition-transform duration-300 ease-in-out 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:static md:translate-x-0`}
      >
        <SideBarAdmin isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Close button on small screens */}
        <div className="absolute top-3 right-3 md:hidden">
          <button 
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200" 
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* MOBILE/TABLET TOP BAR */}
        <div className="md:hidden bg-white border-b flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 h-12 sm:h-14">
          {/* Sidebar Toggle Button */}
          <button 
            className="text-[#9082C6] flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 hover:bg-gray-100 rounded-lg transition-colors duration-200" 
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            <FiMenu size={20} className="sm:w-6 sm:h-6" />
          </button>
          
          {/* Centered Logo */}
          <div className="flex-1 flex justify-center px-4">
            <img 
              src={logo} 
              alt="Cocoa Logo" 
              className="h-6 sm:h-8 w-auto max-w-[120px] sm:max-w-none" 
            />
          </div>

          {/* Empty space to balance layout */}
          <div className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        {/* MAIN CONTENT AREA */}
        <div
          className="flex-1 bg-white 
          md:mt-4 lg:mt-6 
          md:mr-3 lg:mr-4 xl:mr-5 
          md:rounded-t-2xl lg:rounded-t-3xl xl:rounded-t-[3.5rem] 
          md:shadow-lg 
          overflow-hidden 
          p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8"
        >
          {children}
        </div>
      </div>
      
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
          aria-label="Close sidebar overlay"
        />
      )}
    </div>
  );
};

export default BaseLayout;
