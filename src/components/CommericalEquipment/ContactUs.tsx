import React from 'react'

const ContactUs: React.FC = () => {
    return (
        <div className="relative h-[400px]">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage:
                        'url("https://images.unsplash.com/photo-1543269664-76bc3997d9ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")',
                }}
            >
                <div className="absolute inset-0 bg-purple-900/60"></div>
                <div className="relative h-full flex items-center">
                    <div className="container mx-auto px-6">
                        <div className="ml-auto mr-44 max-w-xl text-right">
                            <h1 className="text-white text-6xl font-bold leading-tight font-nunito">
                                Experience
                                <br />
                                COCOA today
                            </h1>
                            <div className="mt-8">
                                <button className="px-6 py-3 bg-white text-purple-900 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                                    Contact Us
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContactUs
