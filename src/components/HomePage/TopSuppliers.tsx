import { useEffect, useState } from "react";

const suppliers = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&q=80&w=200&h=200",
  },
];

const TopSuppliers = () => {
  const [position, setPosition] = useState(0);
  const itemWidth = 208; // width + gap
  const duplicateCount = 5; // Number of times to duplicate suppliers
  const suppliersLoop = Array(duplicateCount)
    .fill(suppliers)
    .flat() // Create a looped array
    .map((supplier, index) => ({
      ...supplier,
      uniqueId: `${supplier.id}-${index}`, // Ensure unique id for each supplier in the loop
    }));

  const totalItems = suppliersLoop.length; // Total items including duplicates
  const containerWidth = totalItems * itemWidth;

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        const newPosition = prev - 2; // Speed of the scrolling
        // Reset position when it reaches the end of the first loop
        if (newPosition <= -containerWidth / duplicateCount) {
          return 0; // Reset scroll to the start
        }
        return newPosition;
      });
    }, 20); // Adjust speed interval

    return () => clearInterval(interval);
  }, [containerWidth]);

  return (
    <div className="font-nunito min-h-screen bg-gradient-to-b from-purple-200 to-white overflow-hidden">
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-5xl font-bold mb-4">Our Top Suppliers</h1>
        <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">
          Showcasing Our Trusted Suppliers: Quality, Reliability, and
          Exceptional Service at Your Fingertips!
        </p>

        <div className="relative h-[200px] md:h-[300px] lg:h-[400px] overflow-hidden">
          <div
            className="absolute flex gap-8"
            style={{
              transform: `translateX(${position}px)`,
              transition: "transform 0s ease-in-out", // Remove the transition delay when scrolling
            }}
          >
            {/* Render the looped suppliers array */}
            {suppliersLoop.map((supplier) => (
              <div
                key={supplier.uniqueId} // Use the unique id for each supplier
                className="w-[200px] h-[200px] flex-shrink-0 rounded-full overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300"
              >
                <img
                  src={supplier.image}
                  alt={`Supplier ${supplier.uniqueId}`} // Use the unique id in the alt text
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSuppliers;
