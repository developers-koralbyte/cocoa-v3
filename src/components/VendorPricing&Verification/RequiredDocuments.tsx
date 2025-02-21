import React from 'react'
import { IoPersonOutline, IoInformationCircleOutline } from 'react-icons/io5'
import { IoMdBusiness } from 'react-icons/io'
import { BsBank2 } from 'react-icons/bs'
import { TbFileDescription } from 'react-icons/tb'

interface DocumentItem {
    icon: React.ReactNode
    title: string
    description: string
}

const documents: DocumentItem[] = [
    {
        icon: <IoMdBusiness className="w-8 h-8 text-[#6B5BA9]" />,
        title: 'Business',
        description: 'Business registration certificate',
    },
    {
        icon: <IoPersonOutline className="w-8 h-8 text-[#6B5BA9]" />,
        title: 'Taxes',
        description: 'Tax Registration Number (GST/HST)',
    },
    {
        icon: <BsBank2 className="w-8 h-8 text-[#6B5BA9]" />,
        title: 'Bank',
        description: 'Bank account information',
    },
    {
        icon: <TbFileDescription className="w-8 h-8 text-[#6B5BA9]" />,
        title: 'Product/Service',
        description: 'Products and Services documentation',
    },
]

const RequiredDocuments: React.FC = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex gap-12">
                        {/* Left side - Title */}
                        <div className="w-1/3">
                            <h2 className="text-4xl font-bold text-gray-900">
                                Required
                            </h2>
                            <div className="inline-block bg-[#6B5BA9] text-white text-2xl font-semibold px-6 py-2 rounded-lg mt-2">
                                Documents
                            </div>
                        </div>

                        {/* Right side - Document Items */}
                        <div className="w-2/3 space-y-4">
                            {documents.map((doc, index) => (
                                <div
                                    key={index}
                                    className="bg-[#F3F4FF] rounded-lg p-6 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        {doc.icon}
                                        <div>
                                            <h3 className="text-[#6B5BA9] text-xl font-semibold mb-1">
                                                {doc.title}
                                            </h3>
                                            <p className="text-gray-700">
                                                {doc.description}
                                            </p>
                                        </div>
                                    </div>
                                    <IoInformationCircleOutline className="w-6 h-6 text-[#6B5BA9] cursor-pointer" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default RequiredDocuments
