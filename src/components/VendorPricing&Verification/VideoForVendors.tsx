import React from 'react'
import { IoPlayOutline } from 'react-icons/io5'

const VideoForVendors: React.FC = () => {
    return (
        <section className="bg-[#5F4B8B] py-20">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
                    {/* Video placeholder */}
                    <div className="lg:w-1/2">
                        <div className="bg-white rounded-2xl aspect-video flex items-center justify-center cursor-pointer relative group">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 rounded-full bg-gray-300/80 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                                    <IoPlayOutline className="w-12 h-12 text-white ml-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text content */}
                    <div className="lg:w-1/2 text-white">
                        <h2 className="text-5xl font-bold mb-4">FOR VENDORS</h2>
                        <p className="text-2xl font-light text-center lg:text-left">
                            Join Canada's fastest-growing
                            <br />
                            procurement network.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default VideoForVendors
