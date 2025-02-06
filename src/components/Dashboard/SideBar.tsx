import { Layout, Inbox, FileText, Calendar, LogOut } from 'lucide-react';
import { useNavigate, useLocation, To } from 'react-router-dom';
import logo from '../../assets/img/Dashboard/CocoaLogo.png';
import { ComponentType } from 'react';

// Define Type for Menu Items
interface MenuItem {
  icon: ComponentType<{ size?: number }>;
  label: string;
  path: string;
}

// Define Props for Sidebar
interface SideBarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const SideBar = ({ isOpen, toggleSidebar }: SideBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation Items
  const menuItems: MenuItem[] = [
    { icon: (props) => <Layout {...props} />, label: 'Dashboard', path: '/dashboard' },
    { icon: (props) => <Inbox {...props} />, label: 'Inbox', path: '/dashboard/inbox' },
    { icon: (props) => <FileText {...props} />, label: 'Invoices', path: '/dashboard/invoices' },
    { icon: (props) => <Calendar {...props} />, label: 'Calendar', path: '/dashboard/calendar' },
  ];


  // Function to Handle Navigation
  const handleNavigation = (path: To) => {
    navigate(path);
    toggleSidebar(); // Close Sidebar on Mobile after Navigation
  };

  return (
    <div
      className={`top-0 left-0 z-50 h-screen w-64 bg-[#8B85C1] text-white p-8
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:static md:translate-x-0`}
    >
      {/* Logo */}
      <div>
        <img src={logo} alt="Cocoa Logo" className="pt-10 pl-5 h-auto w-auto pb-20" />
      </div>

      {/* Navigation Menu */}
      <nav className="ml-5 font-nunito text-[25px] space-y-14">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <div
              key={index}
              onClick={() => handleNavigation(item.path)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNavigation(item.path);
                }
              }}
              aria-label={`Navigate to ${item.label}`}
              role="button"
              tabIndex={0}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer
                ${isActive ? 'bg-white text-[#8B85C1]' : 'hover:bg-white/10'}`}
            >
              <Icon size={30} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="absolute bottom-8 left-8">
        <div
          onClick={() => navigate('/login')} // Replace with actual logout logic
          className="pb-4 font-nunito text-[20px] flex items-center gap-3 pl-10 rounded-lg cursor-pointer hover:bg-white/10"
        >
          <LogOut size={20} />
          <span>Log out</span>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
