import { Layout, Inbox, FileText, Calendar, LogOut } from 'lucide-react'
import { useNavigate, useLocation, To } from 'react-router-dom'
import logo from '../../assets/img/Dashboard/CocoaLogo.png'

const SideBar = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const menuItems = [
        {
            icon: Layout,
            label: 'Dashboard',
            path: '/dashboard',
        },
        {
            icon: Inbox,
            label: 'Inbox',
            path: '/inbox',
        },
        {
            icon: FileText,
            label: 'Invoices',
            path: '/invoices',
        },
        {
            icon: Calendar,
            label: 'Calendar',
            path: '/calendar',
        },
    ]

    // Handle menu item click
    const handleNavigation = (path: To) => {
        navigate(path)
    }

    return (
        <div className="fixed h-screen w-64 bg-[#8B85C1] text-white p-8 flex flex-col justify-between">
            <div>
                <img
                    src={logo}
                    alt="Logo"
                    className="pt-10 pl-5 h-auto w-auto pb-20"
                />
            </div>

            <nav className="ml-5 font-nunito text-[25px] space-y-14 flex-1">
                {menuItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <div
                            key={index}
                            onClick={() => handleNavigation(item.path)}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer
                        ${
                            isActive
                                ? 'bg-white text-[#8B85C1]'
                                : 'hover:bg-white/10'
                        }`}
                        >
                            <Icon size={30} />
                            <span>{item.label}</span>
                        </div>
                    )
                })}
            </nav>

            <div
                onClick={() => navigate('/login')}
                className="font-nunito text-[20px] flex items-center gap-3 pl-10 rounded-lg cursor-pointer hover:bg-white/10 pb-4"
            >
                <LogOut size={20} />
                <span>Log out</span>
            </div>
        </div>
    )
}

export default SideBar
