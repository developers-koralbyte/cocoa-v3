// src/components/AdminDashboard/layout/BaseLayout.tsx
import React, { ReactNode, useState, useEffect } from "react";
import SideBar from "../Dashboard/SideBar";
import { FiMenu, FiUser } from "react-icons/fi";
import logo from "../../assets/img/Dashboard/CocoaLogo.png";
import { useAuth } from "../../utils/AuthContext";
import UnderReview from "./UnderReview";
import RejectedNotice from "./RejectedNotice";

// Firestore imports
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";

interface BaseLayoutProps {
  children: ReactNode;
}

const BaseLayout = ({ children }: BaseLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [profileStatus, setProfileStatus] = useState<
    "loading" | "pending" | "active" | "suspended" | "rejected"
  >("loading");

  useEffect(() => {
    setMounted(true);
  }, []);

  // subscribe to user.status in Firestore
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfileStatus((data.status as any) || "pending");
        } else {
          setProfileStatus("pending");
        }
      } catch {
        setProfileStatus("pending");
      }
    })();
  }, [user]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (isLoading || profileStatus === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600" />
      </div>
    );
  }

  const hasValidAvatar =
    mounted &&
    user?.avatar &&
    user.avatar.trim() !== "" &&
    !imageError;

  const toggleSidebar = () => setSidebarOpen((p) => !p);

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
        <div className="absolute top-3 right-3 md:hidden">
          <button
            onClick={toggleSidebar}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* MOBILE TOP BAR */}
        <div className="md:hidden bg-white border-b flex items-center justify-between px-4 py-2">
          <button
            onClick={toggleSidebar}
            className="text-[#9082C6] p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Open sidebar"
          >
            <FiMenu size={24} />
          </button>
          <img src={logo} alt="Logo" className="h-8" />
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {hasValidAvatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <FiUser size={20} />
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 bg-white md:mt-4 lg:mt-6 md:mr-3 lg:mr-4 xl:mr-5 md:rounded-t-2xl lg:rounded-t-3xl xl:rounded-t-[3.5rem] md:shadow-lg overflow-hidden p-4">
          {profileStatus === "pending" ? (
            <UnderReview />
          ) : (profileStatus === "rejected" || profileStatus === "suspended") ? (
            <RejectedNotice reason="Unfortunately your submitted documents didn't meet our requirements. Please contact Support for more details" />
          ) : (
            children
          )}
        </div>
      </div>

      {/* MOBILE OVERLAY */}
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
