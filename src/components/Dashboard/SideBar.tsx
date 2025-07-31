import { Inbox, FileText, Calendar, LogOut, Grid, BookOpen, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/img/Dashboard/CocoaLogo.png';
import { ComponentType, RefAttributes, ForwardRefExoticComponent } from 'react';
import { useUserStore } from '../../utils/userStore';
import Catalogue from "../../assets/icons/catalogue.svg";
import { useAuth } from "../../utils/AuthContext";

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
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div className="fixed top-0 left-0 z-50 h-screen w-48 sm:w-56 md:w-64 bg-[#9082C6] flex items-center justify-center">
                <div className="text-white text-sm sm:text-base">Loading...</div>
            </div>
        );
    }
    
    if (!user) {
        console.error("User not found!");
        navigate("/login");
        return null;
    }
    
    const userRole = user.role;
    if (!userRole) {
        console.error("User role not found!");
        return null;
    }

    // Define menu items for both roles, including Profile
    const menuItems: MenuItem[] = [
        { icon: Grid, label: 'Dashboard', vendorPath: '/vendor-dashboard', buyerPath: '/buyer-dashboard' },
        { icon: Inbox, label: 'Inbox', vendorPath: '/inbox', buyerPath: '/buyer-inbox' },
        { icon: BookOpen, label: 'Catalogue', vendorPath: '/catalogue' },
        { icon: FileText, label: 'Invoices', vendorPath: '/invoices', buyerPath: '/buyer-invoices' },
        { icon: Calendar, label: 'Calendar', vendorPath: '/calendar', buyerPath: '/buyer-calendar' },
        { icon: User, label: 'Profile', vendorPath: '/settings', buyerPath: '/settings' },
    ];

    const handleNavigation = (vendorPath?: string, buyerPath?: string) => {
        const path = userRole === "vendor" ? vendorPath : buyerPath;
        if (path) {
            navigate(path);
            if (window.innerWidth < 768) {
                toggleSidebar();
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        useUserStore.setState({ currentUser: null });
        navigate("/login");
    };

    return (
        <div
            className={`fixed top-0 left-0 z-50 h-screen w-48 sm:w-56 md:w-64 bg-[#9082C6] text-white 
            transition-transform duration-300 ease-in-out 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 
            flex flex-col`}
        >
            {/* Logo Section - Fixed Height */}
             <div className="flex justify-center py-5">
                <img src={logo} alt="Cocoa Logo" className="w-auto" />
            </div>

            {/* Navigation Menu - Scrollable Area */}
            <nav className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 mt-2 sm:mt-4">
                <div className="space-y-1 sm:space-y-2">
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
                                className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 md:py-4 
                                    rounded-lg cursor-pointer transition-all duration-200 
                                    text-base sm:text-lg md:text-xl font-medium relative 
                                    ${isActive ? 'bg-white text-[#9082C6] shadow-md' : 'hover:bg-white/10'} 
                                    group min-h-[48px] sm:min-h-[52px] md:min-h-[56px]`}
                            >
                                <div className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
                                    <Icon size={20} className="sm:hidden" />
                                    <Icon size={22} className="hidden sm:block md:hidden" />
                                    <Icon size={24} className="hidden md:block" />
                                </div>
                                <span className="transition-opacity duration-200 group-hover:opacity-80 truncate">
                                    {label}
                                </span>
                            </div>
                        ) : null;
                    })}
                </div>
            </nav>

            {/* Logout Button - Fixed at Bottom */}
            <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-4 ">
                <div
                    onClick={handleLogout}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleLogout() : null)}
                    role="button"
                    tabIndex={0}
                    aria-label="Log out"
                    className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 md:py-4 
                        text-base sm:text-lg md:text-xl font-medium cursor-pointer transition-all duration-200
                        hover:bg-white/10 rounded-lg group w-full min-h-[48px] sm:min-h-[52px] md:min-h-[56px]"
                >
                    <div className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
                        <LogOut size={20} className="sm:hidden" />
                        <LogOut size={22} className="hidden sm:block md:hidden" />
                        <LogOut size={24} className="hidden md:block" />
                    </div>
                    <span className="transition-opacity duration-200 group-hover:opacity-80 truncate">
                        Log out
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SideBar;