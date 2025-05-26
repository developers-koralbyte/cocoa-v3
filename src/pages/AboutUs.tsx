import React, { useState,useRef } from 'react'

// --- Import your Figma-exported assets from /assets/img/Aboutus ---
import headerWave from '../assets/img/Aboutus/Vector 12.png'               // the top purple shape
import ourStoryImg from '../assets/img/Aboutus/1.png'                     // “Our story & Mission” photo
import ourVisionImg from '../assets/img/Aboutus/Artboard 7 1.png'         // “Our Vision” photo
import mobileWave from '../assets/img/Aboutus/Vector 16.png'

import iconChat from '../assets/img/Aboutus/2 301.png'                    // chat-based icon
import iconAI from '../assets/img/Aboutus/2 306.png'                      // AI icon
import iconClock from '../assets/img/Aboutus/2 307.png'                   // clock icon
import iconGrowth from '../assets/img/Aboutus/2 308.png'                  // growth arrow
import cocoacloud from '../assets/img/Aboutus/COCOALOGO1 3.png'         

import successOnboarding from '../assets/img/Aboutus/1001.png'            // onboarding photo
import successTraining from '../assets/img/Aboutus/Artboard 7 2.png'      // training photo
import successCommunity from '../assets/img/Aboutus/Artboard 7 3.png'     // community photo

import iconAuditTrail from '../assets/img/Aboutus/Audit Trail 1.png'      // audit trail icon
import iconSecurity from '../assets/img/Aboutus/data-protection_7517138 1.png'
import iconMonitoring from '../assets/img/Aboutus/monitoring (1) 1.png'
import iconVerification from '../assets/img/Aboutus/user-privileges 1.png' // “compliance monitoring” check

import globeImg from '../assets/img/Aboutus/planet-earth_921490 1.png'    // globe in Global Impact

import { Link,useNavigate } from 'react-router-dom'
import cocoaLogo from '../assets/img/cocoa-logo-white.png'
import Footer from '../components/HomePage/Footer'



import erpLogo from '../assets/img/Aboutus/erp-systems.png'
import paymentLogo from '../assets/img/Aboutus/payment-processors.png'
import documentLogo from '../assets/img/Aboutus/document-management.png'
import commsLogo from '../assets/img/Aboutus/communication-platforms.png'

// Tailwind color from your design: hsla(240,29%,54%,0.68)
const purpleOverlay = { backgroundColor: 'hsla(240, 29%, 54%, 0.68)' }

const FAQs = [
  'Lorem ipsum dolor sit amet?',
  'Consectetur adipiscing elit?',
  'Sed do eiusmod tempor incididunt?',
  'Ut labore et dolore magna aliqua?',
]

const AboutUs: React.FC = () => {
  // track which FAQ is open
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const toggleFaq = (i: number) =>
    setOpenFaq(prev => (prev === i ? null : i))

    const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
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


  // track which dropdown is open
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const toggleDropdown = (type: string) =>
    setActiveDropdown(prev => (prev === type ? null : type))

  return (
    <div className="font-sourceSans text-gray-900">

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
{/* ========== Header Hero (Desktop) ========== */}
<section
  className="hidden lg:block relative w-full h-[700px] pt-32 pb-[200px] overflow-hidden"
  style={{
    backgroundImage: `url(${headerWave})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% auto',
    backgroundPosition: 'bottom center',
  }}
>
  {/* scattered semi-transparent clouds */}
  {[
    { top: '10%', left: '5%',  size: 'w-48', opacity: 'opacity-20' },
    { top: '25%', right: '10%', size: 'w-32', opacity: 'opacity-15' },
    { bottom: '30%', left: '20%', size: 'w-40', opacity: 'opacity-20' },
    { bottom: '30%', left: '10%', size: 'w-40', opacity: 'opacity-20' },
    { bottom: '10%', right: '15%', size: 'w-36', opacity: 'opacity-10' },
  ].map((cfg, i) => (
    <img
      key={i}
      src={cocoacloud}
      alt="cloud"
      className={`absolute ${cfg.size} ${cfg.opacity}`}
      style={{
        top:    cfg.top,
        right:  cfg.right,
        bottom: cfg.bottom,
        left:   cfg.left,
      }}
    />
  ))}

  {/* centered title + logo */}
  <div className="absolute inset-0 flex flex-col pt-10 items-center justify-center space-y-1 z-10">
    <h1 className="text-white font-nunito text-6xl font-bold drop-shadow-lg">
      About Us
    </h1>
    <img src={cocoaLogo} alt="COCOAQ Logo" className="w-65" />
  </div>
</section>

{/* ========== Header Hero (Mobile) ========== */}
{/* ========== Header Hero (Mobile) ========== */}
<section
  className="block lg:hidden relative w-full overflow-hidden min-h-[240px] pt-16 pb-8"
  style={{
    backgroundImage: `url(${mobileWave})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% auto',
    backgroundPosition: 'bottom center',
  }}
>


  {/* Centered title + logo */}
  <div className="relative z-10 flex flex-col items-center justify-center space-y-2 h-full px-4">
    <h1 className="text-white font-nunito text-3xl font-bold drop-shadow-lg">
      About Us
    </h1>
    <img src={cocoaLogo} alt="Cocoa Logo" className="w-32" />
  </div>
</section>



{/* ====================
     Story + Vision Combined
==================== */}
{/* ====================
     Story + Vision Compact Centered
==================== */}
<section className="py-16 bg-white">
  <div className="max-w-5xl mx-auto px-6 space-y-24">
    {/** Row 1: Story **/}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
      <img
        src={ourStoryImg}
        alt="Our story & Mission"
        className="w-full rounded-lg shadow-lg"
      />
      <div>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          Our story &amp; Mission
        </h2>
        <div className="space-y-3">
          <p className="text-sm md:text-base text-gray-700">
            <b>COCOA</b>  is revolutionising digital procurement, transforming how businesses connect and transact – from ERP implementations to corporate solutions. Our all-in-one platform seamlessly integrates real-time chat, smart documentation, and automated verification across multiple industries.
          </p>
          <p className="text-sm md:text-base text-gray-700">
          <b>COCOA</b>  eliminates procurement complexity with verified technology vendors and automated processes. We also specialise in streamlining customer acquisition while enabling an efficient showcase of SaaS solutions and services.
          </p>
        </div>
      </div>
    </div>

    {/** Row 2: Vision **/}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div className="order-2 md:order-1 pt-8 md:pt-0">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          Our Vision
        </h2>
        <div className="space-y-3">
          <p className="text-sm md:text-base italic text-gray-700">
            “To become the global standard for digital procurement, where every business transaction starts with a simple chat.”
          </p>
        
        </div>
      </div>
      <img
        src={successOnboarding}
        alt="Our Vision"
        className="w-full rounded-lg shadow-lg order-1 md:order-2"
      />
    </div>
  </div>
</section>

      {/* ====================
          Why COCOA? — Innovation, Trust, Success
      ==================== */}
      <section className="container mx-auto px-6 py-16">
      
   {/* ====================
   Why COCOA? — Professional Cards
==================== */}
<section className="py-16 bg-white">
  <div className="max-w-5xl mx-auto px-6">
    {/* Section title */}
    <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-12">
      Why <span className="text-buttonBg">COCOA?</span>
    </h2>

    {/* Innovation at its core */}
    <div className="mb-16">
      <h3 className="text-2xl font-semibold text-center text-gray-800 mb-8">
        Innovation at its core
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[iconChat, iconAI, iconClock, iconGrowth].map((src, i) => (
          <div
            key={i}
            className="flex flex-col items-center p-6 bg-[#8EDCE6 ] rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-4 bg-buttonBg bg-opacity-10 rounded-full mb-4">
              <img src={src} alt="" className="h-8 w-8" />
            </div>
            <p className="text-center text-gray-700 font-medium">
              {{
                0: 'First chat-based procurement platform in Canada',
                1: 'AI-powered matching algorithm',
                2: 'Real-time transaction capabilities',
                3: 'Continuous platform evolution',
              }[i]}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* Trust & Security */}
    <div>
      <h3 className="text-2xl font-semibold text-center text-gray-800 mb-8">
        Trust &amp; Security
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[iconVerification, iconSecurity, iconAuditTrail, iconMonitoring].map(
          (src, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4 bg-buttonBg bg-opacity-10 rounded-full mb-4">
                <img src={src} alt="" className="h-8 w-8" />
              </div>
              <p className="text-center text-gray-700 font-medium">
                {{
                  0: 'Rigorous verification processes',
                  1: 'Enterprise-grade security',
                  2: 'Complete audit trails',
                  3: 'Compliance monitoring',
                }[i]}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  </div>
</section>


        {/* Customer Success */}
        <div>
          <h3 className="text-2xl font-semibold text-center mb-8">
            Customer Success
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[successOnboarding, successTraining, successCommunity].map(
              (src, i) => (
                <div
                  key={i}
                  className="rounded-lg overflow-hidden shadow-lg"
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-48 object-cover"
                  />
                  <p className="p-4 font-medium text-center">
                    {{
                      0: 'Dedicated onboarding specialists',
                      1: 'Regular training sessions',
                      2: 'Community-driven improvements',
                    }[i]}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ====================
          Leadership & Team
      ==================== */}
      {/* ====================
    Leadership Team
==================== */}
<section className="bg-gray-100 py-16">
  <div className="max-w-5xl mx-auto px-6">
    <h2 className="text-4xl font-bold text-center mb-12">
      Our Leadership Team
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 justify-items-center">
      {[
        ['Syed Ibn E Ali', 'CEO'],
        ['Penka Sevova', 'Head of Partnerships'],
        ['Bilal Arif', 'Engineering Head'],
      ].map(([name, role]) => (
        <div key={name} className="text-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full mb-4 mx-auto" />
          <p className="font-semibold text-lg">{name}</p>
          <p className="text-gray-600">{role}</p>
        </div>
      ))}
    </div>
  </div>
</section>

{/* ====================
    Team Members
==================== */}
<section className="py-16">
  <div className="max-w-6xl mx-auto px-6">
    <h2 className="text-4xl font-bold text-center mb-12">
      Team Members
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-12 justify-items-center">
      {[
        ['Harsh Dugar', 'Junior Product Lead'],
        ['Luca Garib', 'Graphic Designer & UI/UX Designer'],
        ['Yihao Heliu', 'Graphic Designer & UI/UX Designer'],
        ['Cristina Valencia', 'Videographer & Marketing Specialist'],
        ['Abishek Priyan Kabilan', 'Software Developer'],
        ['Kate Nguyen', 'Marketing Specialist'],
        ['Binte Zehra', 'Content Writer'],
      ].map(([name, role]) => (
        <div key={name} className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 mx-auto" />
          <p className="font-medium">{name}</p>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* ====================
          Global Impact
      ==================== */}
     <section className="py-16 bg-white">
  <div className="max-w-5xl mx-auto px-6 text-center">
    <h2 className="text-4xl font-bold mb-12 text-gray-900">Global Impact</h2>

    <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0">
      {/** Left tags **/}
      <div className="flex flex-col space-y-6">
        <span className="inline-block bg-purple-200 text-purple-800 font-medium px-6 py-2 rounded-full">
          500+ Active Buyers
        </span>
        <span className="inline-block bg-purple-200 text-purple-800 font-medium px-6 py-2 rounded-full">
          24h Avg. Response Time
        </span>
      </div>

      {/** Globe in the middle **/}
      <div className="flex-shrink-0">
        <img
          src={globeImg}
          alt="Global network"
          className="w-[250px] h-[250px]"
        />
      </div>

      {/** Right tags **/}
      <div className="flex flex-col space-y-6">
        <span className="inline-block bg-purple-200 text-purple-800 font-medium px-6 py-2 rounded-full">
          3000+ Verified Vendors
        </span>
        <span className="inline-block bg-purple-200 text-purple-800 font-medium px-6 py-2 rounded-full">
          70% Faster Deal Closure
        </span>
      </div>
    </div>
  </div>
</section>


      {/* ====================
          Partners & Integrations
      ==================== */}
      {/* <section className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-8">
          Partners &amp; Integrations
        </h2>
        <p className="text-center text-gray-500 mb-12">
          COCOA works seamlessly with leading enterprise systems, Inc.
        </p>
        <div className="flex justify-center flex-wrap gap-12">
          {[erpLogo, paymentLogo, documentLogo, commsLogo].map((src, i) => (
            <img key={i} src={src} alt="" className="h-12" />
          ))}
        </div>
      </section> */}

      {/* ====================
          FAQ accordion
      ==================== */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="text-4xl font-bold text-center mb-8">FAQ</h2>
          {FAQs.map((q, i) => (
            <div key={i} className="mb-4 border-b border-gray-300 pb-4">
              <button
                className="w-full text-left flex justify-between items-center font-medium"
                onClick={() => toggleFaq(i)}
              >
                <span>{q}</span>
                <span className="ml-2 text-2xl">
                  {openFaq === i ? '–' : '+'}
                </span>
              </button>
              {openFaq === i && (
                <p className="mt-2 text-gray-700">
                  This is the answer to "{q}"—you can fill in real content here.
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
      <Footer/>

    </div>
    
  )
}

export default AboutUs