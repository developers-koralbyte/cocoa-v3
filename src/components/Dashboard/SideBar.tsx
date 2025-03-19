import { Inbox, FileText, Calendar, LogOut, Grid, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/img/Dashboard/CocoaLogo.png';
import { ComponentType, RefAttributes, ForwardRefExoticComponent } from 'react';
import { useUserStore } from '../../utils/userStore'; // Import userStore
import Catalogue from "../../assets/icons/catalogue.svg";

// Define type for Lucide icons
type LucideIcon = ForwardRefExoticComponent<
  Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  } & RefAttributes<SVGSVGElement>
>;

interface MenuItem {
    icon: LucideIcon;
    label: string;
    vendorPath?: string;
    buyerPath?: string;
}

interface SideBarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

// Define UserStore type to fix the 'unknown' type error
interface UserStoreState {
    currentUser: {
        id?: string;
        role?: string;
        [key: string]: any;
    } | null;
    isLoading: boolean;
    fetchUserInfo: (uid: string) => Promise<void>;
}

const SideBar = ({ isOpen, toggleSidebar }: SideBarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    // Cast the useUserStore hook to the correct type
    const { currentUser, isLoading } = useUserStore() as UserStoreState;
    
    // Wait for user data to load
    if (isLoading) {
        return <div className="fixed top-0 left-0 z-50 h-screen w-64 bg-[#9082C6] flex items-center justify-center">
            <div className="text-white">Loading...</div>
        </div>;
    }
    
    if (!currentUser) {
        console.error("User not found!");
        navigate("/login");
        return null;
    }

    const userRole = currentUser.role;

    if (!userRole) {
        console.error("User role not found!");
        return null; // Return early if role is missing
    }

    // Define menu items for both roles
    const menuItems: MenuItem[] = [
        { icon: Grid, label: 'Dashboard', vendorPath: '/vendor-dashboard', buyerPath: '/buyer-dashboard' },
        { icon: Inbox, label: 'Inbox', vendorPath: '/inbox', buyerPath: '/buyer-inbox' },
        { icon: BookOpen, label: 'Catalogue', vendorPath: '/catalogue' },
        { icon: FileText, label: 'Invoices', vendorPath: '/invoices', buyerPath: '/buyer-invoices' },
        { icon: Calendar, label: 'Calendar', vendorPath: '/calendar', buyerPath: '/buyer-calendar' },
    ];

    const handleNavigation = (vendorPath?: string, buyerPath?: string) => {
        const path = userRole === "vendor" ? vendorPath : buyerPath;
        if (path) {
            navigate(path);
            if (window.innerWidth < 768) {
                toggleSidebar(); // Close sidebar only on mobile
            }
        }
    };

    return (
        <div
            className={`fixed top-0 left-0 z-50 h-screen w-64 bg-[#9082C6] text-white p-6 shadow-lg 
            transition-transform duration-300 ease-in-out 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        >
            {/* Logo */}
            <div className="flex justify-center py-5">
                <img src={logo} alt="Cocoa Logo" className="w-auto" />
            </div>

            {/* Navigation Menu */}
            <nav className="mt-6 space-y-6">
                {menuItems.map(({ icon: Icon, label, vendorPath, buyerPath }, index) => {
                    const path = userRole === "vendor" ? vendorPath : buyerPath;
                    const isActive = location.pathname === path;

                    return path ? (
                        <div
                            key={index}
                            onClick={() => handleNavigation(vendorPath, buyerPath)}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleNavigation(vendorPath, buyerPath) : null)}
                            aria-label={`Navigate to ${label}`}
                            role="button"
                            tabIndex={0}
                            className={`flex items-center gap-3 px-5 py-3 rounded-lg cursor-pointer 
                                transition-all duration-200 text-lg font-medium relative 
                                ${isActive ? 'bg-white text-[#9082C6] shadow-md' : 'hover:bg-white/10'} 
                                group`}
                        >
                            <div className="transition-transform duration-200 group-hover:scale-110">
                                <Icon size={24} />
                            </div>
                            <span className="transition-opacity duration-200 group-hover:opacity-80">
                                {label}
                            </span>
                        </div>
                    ) : null;
                })}
            </nav>

            {/* Logout */}
            <div className="absolute bottom-6 left-0 w-full">
                <div
                    onClick={() => {
                        localStorage.removeItem("user");
                        // Reset the userStore state as well
                        useUserStore.setState({ currentUser: null });
                        navigate("/login");
                    }}
                    className="flex items-center gap-3 px-5 py-3 text-lg font-medium cursor-pointer transition-all 
                    hover:bg-white/10 rounded-lg group"
                >
                    <div className="transition-transform duration-200 group-hover:scale-110">
                        <LogOut size={24} />
                    </div>
                    <span className="transition-opacity duration-200 group-hover:opacity-80">
                        Log out
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SideBar;