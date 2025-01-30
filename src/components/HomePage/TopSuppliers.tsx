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
  const itemWidth = 220; // width + gap
  const screenWidth = window.innerWidth;
  const duplicateCount = Math.ceil(screenWidth / itemWidth) + 5; // Enough duplicates to fill screen
  const suppliersLoop = Array(duplicateCount)
    .fill(suppliers)
    .flat()
    .map((supplier, index) => ({
      ...supplier,
      uniqueId: `${supplier.id}-${index}`,
    }));

  const totalItems = suppliersLoop.length;
  const containerWidth = totalItems * itemWidth;

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        const newPosition = prev - 2;
        if (Math.abs(newPosition) >= containerWidth / 2) {
          return 0;
        }
        return newPosition;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [containerWidth]);

  return (
    <div
      className="font-nunito min-h-screen overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #D4CDF4A1, white)",
      }}
    >
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="font-nunito text-[56px] font-extrabold mb-4">
          Our Top Suppliers
        </h1>
        <p className="font-nunito text-[25px] mb-16 max-w-2xl mx-auto">
          Showcasing Our Trusted Suppliers: Quality, Reliability, and
          Exceptional Service at Your Fingertips!
        </p>

        <div className="relative w-full h-[200px] overflow-hidden">
          <div
            className="absolute flex gap-8"
            style={{
              transform: `translateX(${position}px)`,
              width: `${containerWidth}px`, // Ensure the moving container is wide enough
            }}
          >
            {suppliersLoop.map((supplier) => (
              <div
                key={supplier.uniqueId}
                className="w-[200px] h-[200px] flex-shrink-0 rounded-full overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300"
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
  );
};

export default TopSuppliers;
