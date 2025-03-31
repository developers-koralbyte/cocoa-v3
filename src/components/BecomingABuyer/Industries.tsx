import React from 'react'
import { HiCode, HiOfficeBuilding } from 'react-icons/hi'
import { HiComputerDesktop, HiBeaker } from 'react-icons/hi2'

const industries = [
    {
        title: 'SaaS & IT Solutions',
        subtitle: 'Efficiency and Security',
        description:
            'We provide a range of SaaS and IT solutions, including ERP and CRM software, cloud services, IT support, and security solutions, all designed to enhance business efficiency and protect your systems.',
        image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        icon: <HiCode className="w-6 h-6 text-purple-600" />,
        bgColor: 'bg-purple-50',
    },
    {
        title: 'Corporate Solutions',
        subtitle: 'Empowering Businesses',
        description:
            'Our professional services encompass HR and training solutions, financial services, and business consulting, all aimed at helping organizations optimize their operations, enhance employee development, and achieve financial stability and growth.',
        image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        icon: <HiOfficeBuilding className="w-6 h-6 text-purple-600" />,
        bgColor: 'bg-cyan-50',
    },
    {
        title: 'Commercial Equipment',
        subtitle: 'Comprehensive Products',
        description:
            'We provide a wide range of products, including office equipment and supplies, industrial machinery, technical equipment, and safety and management equipment, all designed to support and enhance the efficiency and safety of your operations.',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        icon: <HiComputerDesktop className="w-6 h-6 text-purple-600" />,
        bgColor: 'bg-purple-50',
    },
    {
        title: 'Food & Beverage',
        subtitle: 'Streamlining Food and Beverage Operations',
        description:
            'We offer a comprehensive selection of commercial kitchen equipment, restaurant POS systems, F&B supplier and storage solutions, as well as restaurant management tools, all designed to improve the efficiency and operations of your food and beverage business.',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        icon: <HiBeaker className="w-6 h-6 text-purple-600" />,
        bgColor: 'bg-cyan-50',
    },
]

const Industries = () => {
    return (
        <div className="bg-white py-24">
            <div className="max-w-7xl mx-auto px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Industries We Serve
                    </h2>
                    <div className="flex justify-center mb-2 mt-10">
                        <div className="w-10 h-2 bg-[#19199b96] rounded-full"></div>
                    </div>

                    <p className="text-lg text-gray-600 mt-8">
                        Comprehensive Solutions Across IT, Business, Equipment,
                        and F&B Sectors
                    </p>
                </div>

                <div className="space-y-8">
                    {industries.map((industry, index) => (
                        <div
                            key={index}
                            className={`${industry.bgColor} rounded-2xl overflow-hidden`}
                        >
                            <div
                                className={`flex ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}
                            >
                                <div className="w-2/3 p-12">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-white p-2 rounded-lg">
                                            {industry.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            {industry.title}
                                        </h3>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-700 mb-4">
                                        {industry.subtitle}
                                    </h4>
                                    <p className="text-gray-600 leading-relaxed">
                                        {industry.description}
                                    </p>
                                </div>
                                <div className="w-1/3">
                                    <img
                                        src={industry.image}
                                        alt={industry.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center mb-2 mt-10">
                    <div className="w-10 h-2 bg-[#19199b96] rounded-full"></div>
                </div>
            </div>
        </div>
    )
}

export default Industries
