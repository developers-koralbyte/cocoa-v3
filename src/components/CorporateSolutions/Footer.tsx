import React from 'react'
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa'
import { IoLocationSharp } from 'react-icons/io5'
import { FaLocationDot } from 'react-icons/fa6'
import { FiPhoneCall } from 'react-icons/fi'
import { MdEmail } from 'react-icons/md'

import logoImg from '../../assets/img/logoImg.png'

const Footer = () => {
    const navigation = {
        main: [
            { name: 'Vendors', href: '/new-vendor' },
            { name: 'Buyers', href: '/new-buyer' },
            { name: 'Marketplace', href: '/corporate-solutions' },
        ],
        cocoa: [
            // { name: 'Pricing', href: 'vendor-pricing-verification' },
            { name: 'Demo', href: 'demo' },
            { name: 'Log in', href: '/login' },
        ],
        about: [
            { name: 'About us', href: 'about-us' },
            { name: 'News', href: 'news' },
        ],
    }

    return (
        <footer className="bg-[#5D4C7C] text-white w-full">
            {/* Mobile View */}
            <div className="lg:hidden w-full px-6 py-12">
                <div className="flex flex-col items-center text-center">
                    {/* Navigation Links */}
                    <nav className="w-full mb-12">
                        <h2 className="text-xl font-bold mb-6">HOME</h2>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            {[...navigation.main, ...navigation.about].map(
                                (item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className="text-base hover:text-gray-200"
                                    >
                                        {item.name}
                                    </a>
                                )
                            )}
                        </div>
                    </nav>

                    {/* Logo and Description */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold mb-3 flex items-center justify-center">
                            COCO
                            <img
                                src={logoImg}
                                alt="Cocoa Logo"
                                className="w-10 h-auto ml-0"
                            />
                        </h1>
                        <p className="text-base leading-relaxed">
                            The all-in-one
                            <br />
                            procurement platform
                        </p>
                    </div>

                    {/* Contact Information */}
                    <div className="mb-12">
                        <h3 className="text-xl font-bold mb-4">CONTACT US</h3>
                        <div className="space-y-3 text-base">
                            <p className="flex items-center justify-center gap-2">
                                <IoLocationSharp className="w-5 h-5" />
                                Malaysia, Canada
                            </p>
                            <p>+60152122714</p>
                            <p>ctb@cocoa-app.com</p>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex justify-center space-x-8">
                        <a
                            href="https://www.instagram.com"
                            className="hover:text-gray-200"
                        >
                            <FaInstagram className="w-8 h-8" />
                        </a>
                        <a
                            href="https://www.facebook.com/profile.php?id=61553620930491"
                            className="hover:text-gray-200"
                        >
                            <FaFacebook className="w-8 h-8" />
                        </a>
                        <a
                            href="https://www.linkedin.com/company/koral-byte/posts/?feedView=all"
                            className="hover:text-gray-200"
                        >
                            <FaLinkedin className="w-8 h-8" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Main Content */}
                    <div className="grid grid-cols-2">
                        {/* Left Column */}
                        <div>
                            {/* Logo */}
                            <div className="text-6xl font-bold mb-4">
                                <a href="/" className="block">
                                    <img
                                        src={logoImg}
                                        alt="Cocoa Logo"
                                        className="w-40 h-21"
                                    />
                                </a>
                            </div>

                            {/* Description */}
                            <p className="text-white/80 mb-8">
                                The all-in-one
                                <br />
                                procurement platform
                            </p>
                            {/* Social Links */}
                            <div className="flex gap-4">
                                <a
                                    href="https://instagram.com"
                                    className="hover:text-white/80"
                                >
                                    <FaInstagram size={40} />
                                </a>
                                <a
                                    href="https://www.facebook.com/profile.php?id=61553620930491"
                                    className="hover:text-white/80"
                                >
                                    <FaFacebook size={40} />
                                </a>
                                <a
                                    href="https://www.linkedin.com/company/cocoa-app/posts/?feedView=all"
                                    className="hover:text-white/80"
                                >
                                    <FaLinkedin size={40} />
                                </a>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            {/* Navigation Links */}
                            <div className="grid grid-cols-3 gap-8 mb-20">
                                {/* HOME Section */}
                                <div>
                                    <h3 className="font-medium mb-4">HOME</h3>
                                    <ul className="space-y-2">
                                        {navigation.main.map((item) => (
                                            <li key={item.name}>
                                                <a
                                                    href={item.href}
                                                    className="hover:text-white/80"
                                                >
                                                    {item.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Middle Links */}
                                <div className="mt-8">
                                    <ul className="space-y-2">
                                        {navigation.cocoa.map((item) => (
                                            <li key={item.name}>
                                                <a
                                                    href={item.href}
                                                    className="hover:text-white/80"
                                                >
                                                    {item.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* COCOA Section */}
                                <div>
                                    <h3 className="font-medium mb-4">COCOA</h3>
                                    <ul className="space-y-2">
                                        {navigation.about.map((item) => (
                                            <li key={item.name}>
                                                <a
                                                    href={item.href}
                                                    className="hover:text-white/80"
                                                >
                                                    {item.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="mb-8">
                                <h3 className="font-medium mb-7">CONTACT US</h3>
                                <div className="space-y-3 text-white/90">
                                    <div className="flex items-center gap-2">
                                        <a
                                            href="https://www.google.com/maps?q=111+Peter+St,+Toronto,+ON+M5V+2H1,+Canada"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 hover:text-white"
                                        >
                                            <FaLocationDot />
                                            <span>
                                                111 Peter St, Toronto, ON M5V
                                                2H1 Canada
                                            </span>
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href="tel:+16475189514"
                                            className="flex items-center gap-2 hover:text-white"
                                        >
                                            <FiPhoneCall />
                                            <span>+1 647 518 9514</span>
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href="mailto:Connect@koralbyte.com"
                                            className="flex items-center gap-2 hover:text-white"
                                        >
                                            <MdEmail />
                                            <span>Connect@koralbyte.com</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
