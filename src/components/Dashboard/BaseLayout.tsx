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
        <div className="absolute top-4 right-4 md:hidden">
          <button className="text-white" onClick={toggleSidebar}>
            ✕
          </button>
        </div>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col">
        {/* MOBILE TOP BAR (centered logo with profile) */}
        <div className="md:hidden bg-white border-b flex items-center justify-between px-4 py-3 h-14">
          <button 
            className="text-[#9082C6] flex items-center justify-center w-8 h-8" 
            onClick={toggleSidebar}
          >
            <FiMenu size={24} />
          </button>
          
          <div className="flex-1 flex justify-center">
            <img src={logo} alt="Cocoa Logo" className="h-8" />
          </div>
          
          {/* User avatar with fallback to vector icon */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-500">
            {hasValidAvatar ? (
              <img 
                src={currentUser.avatar}
                alt="User"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <FiUser size={20} className="text-gray-500" />
            )}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div
          className="flex-1 bg-white md:mt-6 md:mr-5 md:rounded-t-[3.5rem] md:shadow-lg overflow-hidden 
          p-4 md:p-6"
        >
          {children}
        </div>
      </div>
      
      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default BaseLayout;