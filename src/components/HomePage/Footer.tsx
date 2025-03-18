import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa'
import { IoLocationSharp } from 'react-icons/io5'
import React from 'react'

import logoImg from '../../assets/img/logoImg.png'

const Footer = () => {
    const navigation = {
        main: [
            { name: 'HOME', href: '/' },
            { name: 'Vendors', href: '/new-vendor' },
            { name: 'Buyers', href: '/new-buyer' },
            { name: 'Marketplace', href: '#' },
        ],
        cocoa: [
            { name: 'COCOA', href: '#' },
            { name: 'Pricing', href: 'vendor-pricing-verification' },
            { name: 'Demo', href: '#' },
            { name: 'Log in', href: '/login' },
        ],
        about: [
            { name: 'About us', href: '#' },
            { name: 'News', href: '#' },
        ],
    }

    return (
        <footer className="bg-[#5D4C7C] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr,1fr,1fr,1fr] gap-8">
                    {/* Logo and Description */}
                    <div className="space-y-8">
                        <div className="flex items-center">
                            <a href="/" className="block">
                                <img
                                    src={logoImg}
                                    alt="Cocoa Logo"
                                    className="w-20 h-21"
                                />
                            </a>
                        </div>
                        <p className="text-lg mt-1">
                            The all-in-one procurement platform
                        </p>

                        <div className="flex space-x-4">
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

                    {/* Navigation Links */}
                    <div>
                        <h3 className="text-xl font-semibold mb-6">HOME</h3>
                        <ul className="space-y-4">
                            {navigation.main.map((item) => (
                                <li key={item.name}>
                                    <a
                                        href={item.href}
                                        className="hover:text-gray-200"
                                    >
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-6">COCOA</h3>
                        <ul className="space-y-4">
                            {navigation.cocoa.map((item) => (
                                <li key={item.name}>
                                    <a
                                        href={item.href}
                                        className="hover:text-gray-200"
                                    >
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-xl font-semibold mb-6">
                            CONTACT US
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <IoLocationSharp className="w-5 h-5" />
                                <span>Malaysia, Canada</span>
                            </div>
                            <div>
                                <a
                                    href="tel:+60152122714"
                                    className="hover:text-gray-200"
                                >
                                    +60152122714
                                </a>
                            </div>
                            <div>
                                <a
                                    href="mailto:ctb@cocoa-app.com"
                                    className="hover:text-gray-200"
                                >
                                    ctb@cocoa-app.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
