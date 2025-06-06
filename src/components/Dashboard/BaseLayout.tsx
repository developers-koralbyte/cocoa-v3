import React, { ReactNode, useState, useEffect } from "react";
import SideBar from "../Dashboard/SideBar";
import { FiMenu, FiUser } from "react-icons/fi"; // Added FiUser for the default avatar
import logo from "../../assets/img/Dashboard/CocoaLogo.png"; 
import { useUserStore } from "../../utils/userStore";

interface BaseLayoutProps {
  children: ReactNode;
}

const BaseLayout = ({ children }: BaseLayoutProps) => {
  // Local state for sidebar on small screens
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Get user data from the Zustand store
  const { currentUser } = useUserStore();
  // State to prevent flickering
  const [mounted, setMounted] = useState(false);
  // State to track if the image failed to load
  const [imageError, setImageError] = useState(false);
  
  // Wait for component to mount to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Check if we have a valid avatar
  const hasValidAvatar = mounted && currentUser?.avatar && currentUser.avatar.trim() !== "" && !imageError;

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen bg-white md:bg-[#9082C6]">
      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-[#8B85C1] 
        transition-transform duration-300 ease-in-out 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:static md:translate-x-0`}
      >
        <SideBar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

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
          <button 
            className="text-[#9082C6] flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 hover:bg-gray-100 rounded-lg transition-colors duration-200" 
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            <FiMenu size={20} className="sm:w-6 sm:h-6" />
          </button>
          
          {/* Centered logo with responsive sizing */}
          <div className="flex-1 flex justify-center px-4">
            <img 
              src={logo} 
              alt="Cocoa Logo" 
              className="h-6 sm:h-8 w-auto max-w-[120px] sm:max-w-none" 
            />
          </div>
          
          {/* User avatar with responsive sizing */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
            {hasValidAvatar ? (
              <img 
                src={currentUser.avatar}
                alt="User profile"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <FiUser size={16} className="sm:w-5 sm:h-5 text-gray-500" />
            )}
          </div>
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
      
      {/* Overlay when sidebar is open on mobile */}
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