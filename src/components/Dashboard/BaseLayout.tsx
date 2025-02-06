import React, { ReactNode, useState } from "react";
import SideBar from "../Dashboard/SideBar";
import { FiMenu } from "react-icons/fi";

interface BaseLayoutProps {
  children: ReactNode;
}

const BaseLayout = ({ children }: BaseLayoutProps) => {
  // Local state for sidebar on small screens
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      {/* SIDEBAR */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 transform bg-[#8B85C1]
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0
        `}
      >
        {/* Make sure to pass the props into SideBar */}
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
        {/* MOBILE TOP BAR (hamburger on the LEFT) */}
        <div className="md:hidden bg-[#8B85C1] text-white flex items-center p-4">
          <button className="text-white" onClick={toggleSidebar}>
            <FiMenu size={24} />
          </button>
          <div className="ml-4 font-bold text-xl">
            COCOA
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseLayout;
