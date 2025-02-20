import React from 'react'

const WhyChooseCocoa = () => {
    const features = [
        {
            number: 1,
            title: 'Pre-Qualified Buyers',
            description:
                'Connect with verified enterprise buyers actively seeking solutions',
            image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200&h=200',
        },
        {
            number: 2,
            title: 'Real-Time Negotiations',
            description:
                'Skip lengthy email chains with instant chat No more delayed email chains or missed opportunities.',
            icon: (
                <div className="w-20 h-20 bg-[#6B5BA9]/10 rounded-full flex items-center justify-center">
                    <svg
                        className="w-12 h-12 text-[#6B5BA9]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" />
                    </svg>
                </div>
            ),
        },
        {
            number: 3,
            title: 'Chat to PO Conversion',
            description:
                'Convert chat conversations directly into purchase orders, maintain clear documentation of all negotiations.',
            icon: (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-14 bg-[#6B5BA9] rounded-md rotate-[-15deg]" />
                    <div className="w-10 h-14 bg-[#6B5BA9] rounded-md rotate-[15deg]" />
                </div>
            ),
        },
    ]

    return (
        <div className="relative bg-[#F8F7FF] pt-60 pb-60 px-4 sm:px-6 lg:px-8">
            {/* Top wave */}
            <div className="absolute top-0 left-0 right-0">
                <svg
                    viewBox="0 0 1440 320"
                    className="w-full h-auto"
                    preserveAspectRatio="none"
                >
                    <path
                        fill="#ffffff"
                        d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,181.3C672,192,768,160,864,138.7C960,117,1056,107,1152,117.3C1248,128,1344,160,1392,176L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                    />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto relative">
                <div className="text-center mb-24">
                    <h2 className="text-6xl font-bold text-black mb-6 font-nunito">
                        Why Vendors Choose COCOA?
                    </h2>
                    <p className="text-2xl font-nunito">
                        First-ever, all in one{' '}
                        <span className="text-[#6B5BA9] font-nunito">
                            procurement
                        </span>{' '}
                        platform in Canada
                    </p>
                </div>

                <div className="flex justify-between items-center px-20 max-w-6xl mx-auto">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="relative flex flex-col items-center w-1/3"
                        >
                            {/* Number badge */}
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#6B5BA9] text-white flex items-center justify-center text-lg font-bold z-10 font-nunito">
                                {feature.number}
                            </div>

                            {/* Content */}
                            <div className="flex flex-col items-center text-center">
                                {feature.image ? (
                                    <div className="w-32 h-32 rounded-full overflow-hidden mb-10 bg-[#6B5BA9]/10 flex items-center justify-center">
                                        <img
                                            src={feature.image}
                                            alt={feature.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="mb-10 w-32 h-32 rounded-full bg-[#6B5BA9]/10 flex items-center justify-center">
                                        {feature.icon}
                                    </div>
                                )}
                                <h3 className="text-2xl font-semibold text-[#6B5BA9] mb-4 font-nunito">
                                    {feature.title}
                                </h3>
                                <p className="text-lg text-gray-600 max-w-[250px] font-nunito">
                                    {feature.description}
                                </p>
                            </div>

                            {/* Connector line */}
                            {index < features.length - 1 && (
                                <div className="absolute top-16 left-[calc(50%_+_4rem)] w-[calc(100%_-_8rem)] border-t-2 border-dashed border-[#6B5BA9]" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    viewBox="0 0 1440 240"
                    className="w-full h-auto"
                    preserveAspectRatio="none"
                >
                    <path
                        fill="#ffffff"
                        fillOpacity="1"
                        d="M0,96L40,112C80,128,160,160,240,160C320,160,400,128,480,112C560,96,640,96,720,112C800,128,880,160,960,160C1040,160,1120,128,1200,112C1280,96,1360,96,1400,96L1440,96L1440,240L1400,240C1360,240,1280,240,1200,240C1120,240,1040,240,960,240C880,240,800,240,720,240C640,240,560,240,480,240C400,240,320,240,240,240C160,240,80,240,40,240L0,240Z"
                    ></path>
                </svg>
            </div>
        </div>
    )
}

export default WhyChooseCocoa
