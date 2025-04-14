import { useEffect, useState } from 'react'
import koralbyteImg from '../HomePage/Koralbyte Vertical logo.png'

const suppliers = [
    {
        id: 1,
        image: koralbyteImg,
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=200&h=200',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&q=80&w=200&h=200',
    },
]

const TopSuppliers = () => {
    const [position, setPosition] = useState(0)
    const itemWidth = 220
    const screenWidth = window.innerWidth
    const duplicateCount = Math.ceil(screenWidth / itemWidth) + 5

    const suppliersLoop = Array(duplicateCount)
        .fill(suppliers)
        .flat()
        .map((supplier, index) => ({
            ...supplier,
            uniqueId: `${supplier.id}-${index}`,
        }))

    const totalItems = suppliersLoop.length
    const containerWidth = totalItems * itemWidth

    useEffect(() => {
        const interval = setInterval(() => {
            setPosition((prev) => {
                const newPosition = prev - 2
                if (Math.abs(newPosition) >= containerWidth / 2) {
                    return 0
                }
                return newPosition
            })
        }, 20)

        return () => clearInterval(interval)
    }, [containerWidth])

    return (
        <div className="bg-gradient-to-b from-purple-50 to-white pt-20 pb-10">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-5xl font-bold mb-4 font-nunito">
                    Our Top Suppliers
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 font-sourceSans">
                    Showcasing Our Trusted Suppliers: Quality, Reliability, and
                    Exceptional Service at Your Fingertips!
                </p>

                <div
                    className="relative w-full h-[200px] overflow-hidden"
                    style={{
                        WebkitMaskImage:
                            'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                        maskImage:
                            'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                    }}
                >
                    <div
                        className="absolute flex gap-8"
                        style={{
                            transform: `translateX(${position}px)`,
                            width: `${containerWidth}px`,
                        }}
                    >
                        {suppliersLoop.map((supplier) => (
                            <div
                                key={supplier.uniqueId}
                                className="w-[200px] h-[200px] flex-shrink-0 rounded-full overflow-hidden transform hover:scale-105 transition-transform duration-300"
                            >
                                <img
                                    src={supplier.image}
                                    alt={`Supplier ${supplier.uniqueId}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TopSuppliers
