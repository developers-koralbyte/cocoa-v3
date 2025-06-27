import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/img/Dashboard/CocoaLogo.png';
import { useAuth } from "../../../utils/AuthContext";

interface MenuItem {
  label: string;
  path: string;
}

interface SideBarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const SideBarAdmin = ({ isOpen, toggleSidebar }: SideBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 z-50 h-screen w-64 bg-[#D6CFF0] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    console.error("Unauthorized access or user not found!");
    navigate("/unauthorized");
    return null;
  }

  const menuItems: MenuItem[] = [
    { label: 'User & Access Management', path: '/admin/user-access' },
    { label: 'Vendors & Service Oversight', path: '/admin/vendors' },
    { label: 'Analytics & Performance', path: '/admin/analytics' },
    { label: 'Appointments & Chats', path: '/admin/appointments' },
    { label: 'Tools & Utilities', path: '/admin/tools' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 z-50 h-screen w-64 bg-[#D6CFF0] text-white p-6  
        transition-transform duration-300 ease-in-out 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
    >
      {/* Logo */}
      <div className="flex justify-center py-5">
        <img src={logo} alt="Cocoa Logo" className="w-auto" />
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 space-y-6">
        {menuItems.map(({ label, path }, index) => {
          const isActive = location.pathname === path;
          return (
            <div
              key={index}
              onClick={() => handleNavigation(path)}
              onKeyDown={(e) =>
                e.key === 'Enter' || e.key === ' ' ? handleNavigation(path) : null
              }
              aria-label={`Navigate to ${label}`}
              role="button"
              tabIndex={0}
              className={`px-5 py-3 rounded-lg cursor-pointer text-lg font-medium transition-all 
                ${isActive ? 'bg-white text-[#9082C6] shadow-md' : 'hover:bg-white/10 text-white'}`}
            >
              {label}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-6 left-0 w-full flex justify-center">
        <div
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/login");
          }}
          className="px-5 py-3 text-lg font-medium cursor-pointer hover:bg-white/10 rounded-lg transition-all"
        >
          Log out
        </div>
      </div>
    </div>
  );
};

export default SideBarAdmin;
