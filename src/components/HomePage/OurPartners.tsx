import React from 'react';
// Import actual partner logos
import adpLogo from '../../assets/Adp_logo.jpg';
import ibmLogo from '../../assets/Ibm_logo.png';
import tbdcLogo from '../../assets/tdbc_logo.png';
import bhiveLogo from '../../assets/bhivelogo.png';
import arrowLogo from '../../assets/arrow_logo.png';

const OurPartners = () => {
    const partners = [
        {
            id: 1,
            name: 'IBM',
            logo: ibmLogo,
        },
        {
            id: 2,
            name: 'ADP',
            logo: adpLogo,
        },
        {
            id: 3,
            name: 'TBDC',
            logo: tbdcLogo,
        },
        {
            id: 4,
            name: 'Bhive',
            logo: bhiveLogo,
        },
        {
            id: 5,
            name: 'Arrow',
            logo: arrowLogo,
        },
        {
            id: 6,
            name: 'IBM',
            logo: ibmLogo,
        },
        {
            id: 7,
            name: 'ADP',
            logo: adpLogo,
        }
    ];

    // Create multiple copies for seamless loop
    const extendedPartners = [
        ...partners,
        ...partners,
        ...partners,
        ...partners
    ].map((partner, index) => ({
        ...partner,
        uniqueId: `${partner.id}-${index}`
    }));

    return (
        <section className="bg-gradient-to-b from-white to-purple-50/30 py-16 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">

                    <h2 className="text-4xl md:text-5xl font-bold mb-4 font-nunito">
                        Our <span className="text-[#6868AC]">Partners</span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-sourceSans">
                        Collaborating with industry leaders to revolutionize procurement across Canada
                    </p>
                </div>

                {/* Running Strip Container */}
                <div className="relative">
                    {/* Gradient Masks for fade effect */}
                    <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
                    
                    {/* Running Strip */}
                    <div className="overflow-hidden py-8">
                        <div 
                            className="flex gap-16 animate-scroll"
                            style={{
                                animation: 'scroll 40s linear infinite',
                                width: 'fit-content'
                            }}
                        >
                            {extendedPartners.map((partner) => (
                                <div
                                    key={partner.uniqueId}
                                    className="flex-shrink-0 group"
                                >
                                    <div className="w-48 h-32 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center p-6 transform group-hover:scale-105 border border-gray-100">
                                        <img
                                            src={partner.logo}
                                            alt={`${partner.name} logo`}
                                            className="max-h-16 max-w-full object-contain transition-all duration-300 opacity-90 group-hover:opacity-100"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Second Strip - Reverse Direction */}
                <div className="relative mt-8">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
                    
                    <div className="overflow-hidden py-4">
                        <div 
                            className="flex gap-16 animate-scroll-reverse"
                            style={{
                                animation: 'scroll-reverse 45s linear infinite',
                                width: 'fit-content'
                            }}
                        >
                            {extendedPartners.reverse().map((partner) => (
                                <div
                                    key={`reverse-${partner.uniqueId}`}
                                    className="flex-shrink-0 group"
                                >
                                    <div className="w-40 h-24 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center p-4 transform group-hover:scale-105 border border-gray-50">
                                        <img
                                            src={partner.logo}
                                            alt={`${partner.name} logo`}
                                            className="max-h-12 max-w-full object-contain transition-all duration-300 opacity-80 group-hover:opacity-100"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                
            </div>

            <style>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                
                @keyframes scroll-reverse {
                    0% {
                        transform: translateX(-50%);
                    }
                    100% {
                        transform: translateX(0);
                    }
                }
                
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
                
                .animate-scroll-reverse {
                    animation: scroll-reverse 45s linear infinite;
                }
            `}</style>
        </section>
    );
};

export default OurPartners;