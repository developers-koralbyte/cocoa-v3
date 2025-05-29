import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// Import assets (you'll need to add these to your assets folder)
import headerWave from '../../assets/img/News/HeaderWave.png' // Purple wave background
import mobileWave from '../assets/img/News/mobileWave.png' // Mobile wave background
import cocoaLogo from '../../assets/img/cocoa-logo-white.png'
import cocoacloud from '../../assets/img/Aboutus/COCOALOGO1 3.png'

// News topic images
import canadaNewsImg from '../../assets/img/News/cocoa-comes-to-canada.png'
import top10StartupsImg from '../../assets/img/News/top-10-startups.png'
import koralbyteMergeImg from '../../assets/img/News/koralbyte-merge.png'  
import globalExpansionImg from '../../assets/img/News/global-expansion.png'

// Implementation guide image
import implementationGuideImg from '../../assets/img/News/success_guide.png'

import Footer from '../HomePage/Footer'

const News: React.FC = () => {
  const navigate = useNavigate()
  const navRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  
  const ACCENT = '#5F4B8B'

  const links = [
    {
      label: 'Vendors',
      items: [{ label: 'Becoming a Vendor', to: '/become-a-vendor' }],
    },
    {
      label: 'Buyers',
      items: [{ label: 'Becoming a Buyer', to: '/become-a-buyer' }],
    },
    {
      label: 'Marketplace',
      items: [
        { label: 'Corporate Solutions', to: '/corporate-solutions' },
        { label: 'SaaS & ERP Services', to: '/saas-erp' },
        { label: 'Commercial Equipment', to: '/commerical-equipment' },
        { label: 'F&B Suppliers', to: '/f-b-suppliers' },
      ],
    },
  ]

  const toggleDropdown = (type: string) =>
    setActiveDropdown(prev => (prev === type ? null : type))

  return (
    <div className="font-sourceSans text-gray-900">
      {/* Navigation */}
      <nav
        ref={navRef}
        className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 lg:px-16 bg-transparent"
      >
        {/* Logo */}
        <Link to="/">
          <img src={cocoaLogo} alt="COCOA Logo" className="h-12 lg:h-20" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex space-x-8 items-center text-white font-extrabold">
          {links.map(group => (
            <div
              key={group.label}
              className="relative"
              onMouseEnter={() => setActiveDropdown(group.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center hover:text-gray-200 transition">
                {group.label}
                <span className="ml-1 text-sm">▾</span>
              </button>

              {/* Dropdown panel */}
              <div
                className={`
                  absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg
                  transition-all duration-200
                  ${activeDropdown === group.label
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible -translate-y-2'}
                `}
              >
                {group.items.map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block px-4 py-2 text-[#5F4B8B] hover:bg-[#5F4B8B] hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Get Started */}
          <button
            onClick={() => navigate('/login')}
            style={{ backgroundColor: ACCENT }}
            className="text-white px-5 py-2 rounded-full hover:opacity-90 transition"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="lg:hidden text-white text-2xl focus:outline-none"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Mobile Menu */}
        <div
          className={`
            absolute top-full left-0 right-0 bg-white text-gray-800 shadow-lg lg:hidden
            overflow-hidden
            transition-[max-height,opacity] duration-300 ease-in-out
            ${menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}
          `}
        >
          {links.map(group => (
            <div key={group.label} className="border-b last:border-b-0">
              <button className="w-full text-left px-6 py-4 font-semibold">
                {group.label}
              </button>
              {group.items.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block px-12 py-3 text-sm hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}

          <button
            onClick={() => {
              navigate('/login')
              setMenuOpen(false)
            }}
            style={{ backgroundColor: ACCENT }}
            className="block mx-6 my-4 w-auto text-center text-white px-6 py-3 rounded-md"
          >
            Get Started
          </button>
        </div>
      </nav>

{/* Header Hero (Desktop) */}
      <section
        className="hidden lg:block relative w-full h-[600px] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #8B7CB6 0%, #6B5B8D 100%)',
        }}
      >
        {/* Scattered semi-transparent clouds */}
        {[
          { top: '10%', left: '5%', size: 'w-32', opacity: 'opacity-10' },
          { top: '25%', right: '10%', size: 'w-24', opacity: 'opacity-15' },
          { bottom: '30%', left: '20%', size: 'w-28', opacity: 'opacity-10' },
          { bottom: '15%', right: '15%', size: 'w-20', opacity: 'opacity-20' },
        ].map((cfg, i) => (
          <img
            key={i}
            src={cocoacloud}
            alt="cloud"
            className={`absolute ${cfg.size} ${cfg.opacity}`}
            style={{
              top: cfg.top,
              right: cfg.right,
              bottom: cfg.bottom,
              left: cfg.left,
            }}
          />
        ))}

        {/* Centered title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <h1 className="text-white font-nunito text-[100px] font-bold drop-shadow-lg">
            Latest News
          </h1>
        </div>

        {/* Wave shape at bottom */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
  <path
    d="M0,100 C360,-60 1080,220 1440,20 L1440,120 L0,120 Z"
    fill="white"
  />
</svg>


        </div>
      </section>

      {/* Header Hero (Mobile) */}
      <section
        className="block lg:hidden relative w-full overflow-hidden min-h-[300px] pt-16 pb-8"
        style={{
          background: 'linear-gradient(135deg, #8B7CB6 0%, #6B5B8D 100%)',
        }}
      >
        {/* Centered title */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-2 h-full px-4">
          <h1 className="text-white font-nunito text-4xl font-bold drop-shadow-lg text-center">
            Latest News
          </h1>
        </div>

        {/* Wave shape at bottom */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 80" className="w-full h-auto">
            <path
              d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Press Relevant Section */}
      <section className="py-16 bg-white mt-8 mb-8 ">
        <div className="max-w-[800] mx-auto px-6 text-center">
          <h2 className="text-[75px] font-nunito font-black">
            COCOA stays Press relevant
          </h2>
          <p className="text-[30px] mt-[-20px] font-nunito font-bold">
            Follow COCOA on LinkedIn to get the latest updates on this product.
          </p>
        </div>
      </section>

      {/* Popular Topics Section - Updated Layout */}
     {/* Popular Topics Section - Updated Layout */}
<section className="py-16 bg-white">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="font-nunito text-[65px] font-black mb-5">
      Popular Topics
    </h2>
    
    {/* News Grid - Layout matching the image */}
    <div className="flex gap-6 mb-5">
      {/* Left side - Large Canada card */}
      <div className="w-1/2 relative group cursor-pointer">
        <div className="relative h-[400px] rounded-[20px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
          <img 
            src={canadaNewsImg} 
            alt="COCOA comes to Canada"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
          <div className="absolute bottom-8 left-8 text-white">
            <h3 className="text-3xl font-bold drop-shadow-lg">
              COCOA comes to<br />Canada
            </h3>
          </div>
        </div>
      </div>

      {/* Right side - Three cards arranged vertically */}
      <div className="w-1/2 flex flex-col gap-6">
        {/* Top card - TOP 10 Start-ups */}
        <div className="relative group cursor-pointer">
          <div className="relative h-[190px] rounded-[20px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <img 
              src={top10StartupsImg} 
              alt="COCOA among the TOP 10 Start-ups"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-xl font-bold drop-shadow-lg">
                COCOA among the TOP 10 Start-ups
              </h3>
            </div>
          </div>
        </div>

        {/* Bottom row - Two cards side by side */}
        <div className="flex gap-6">
          <div className="w-1/2 relative group cursor-pointer">
            <div className="relative h-[190px] rounded-[20px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src={koralbyteMergeImg} 
                alt="COCOA X Koralbyte"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-lg font-bold drop-shadow-lg leading-tight">
                  COCOA X<br />Koralbyte
                </h3>
              </div>
            </div>
          </div>
          
          <div className="w-1/2 relative group cursor-pointer">
            <div className="relative h-[190px] rounded-[20px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src={globalExpansionImg} 
                alt="COCOA expands Globally"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-lg font-bold drop-shadow-lg leading-tight">
                  COCOA expands<br />Globally
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Recent Posts Section */}
      <section className="py-16 bg-white">
        <div className="max-w-[800] mx-auto px-6 text-center">
          <h2 className="text-[56px] font-nunito font-black mb-8">
            Check our most recent posts!
          </h2>
          
          <div className="mb-8">
            <p className="text-[40px]">
              Canadian Startup Koralbyte Technologies
            </p>
            <p className="text-[40px] font-nunito font-bold">
              <span className="text-[#5F4B8B]">#COCOA</span> is Sweetening Procurement Across Canada!
            </p>
          </div>

          {/* Implementation Success Guide */}
<div className="max-w-[800px] mx-auto mb-8">
  <img 
    src={implementationGuideImg} 
    alt="COCOA Implementation Success Guide" 
    className="w-[767px] h-[644px]"
  />
</div>

          <p className="text-[40px] ont-nunito font-bold">
            More posts and news available in LinkedIn!
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default News