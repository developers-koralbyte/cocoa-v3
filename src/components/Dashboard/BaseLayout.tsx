import React, { ReactNode } from 'react'
import SideBar from '../Dashboard/SideBar'

interface BaseLayoutProps {
    children: ReactNode
}

const BaseLayout = ({ children }: BaseLayoutProps) => {
    return (
        <div className="min-h-screen bg-[#8B85C1] flex">
            {/* Sidebar */}
            <SideBar />

            {/* Main content area */}
            <div className="flex-1 pl-64">
                <div className="pt-6 pl-10 pr-6 h-full">
                    {/* White background container for content */}
                    <div className="bg-white rounded-t-[3.5rem] h-full relative">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BaseLayout
