import { Layout, Inbox, FileText, Calendar, LogOut, Grid } from 'lucide-react';
import { useNavigate, useLocation, To } from 'react-router-dom';
import logo from '../../assets/img/Dashboard/CocoaLogo.png';
import { ComponentType } from 'react';

interface MenuItem {
    icon: ComponentType<{ size?: number }>;
    label: string;
    vendorPath?: string;
    buyerPath?: string;
}

interface SideBarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

const SideBar = ({ isOpen, toggleSidebar }: SideBarProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    const userRole = user?.role;  

    if (!userRole) {
        console.error(" User role not found!");
        return null; // Return early if role is missing
    }

    // Define menu items for both roles
    const menuItems: MenuItem[] = [
        { icon: Grid, label: 'Dashboard', vendorPath: '/vendor-dashboard', buyerPath: '/buyer-dashboard' },
        { icon: Inbox, label: 'Inbox', vendorPath: '/inbox', buyerPath: '/buyer-inbox' }, // ✅ Fixed path
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
                            <Icon
                                size={24}
                                className="transition-transform duration-200 group-hover:scale-110"
                            />
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
                        navigate("/login");
                    }}
                    className="flex items-center gap-3 px-5 py-3 text-lg font-medium cursor-pointer transition-all 
                    hover:bg-white/10 rounded-lg group"
                >
                    <LogOut
                        size={24}
                        className="transition-transform duration-200 group-hover:scale-110"
                    />
                    <span className="transition-opacity duration-200 group-hover:opacity-80">
                        Log out
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SideBar;
