import React from "react";
import bg1 from "../assets/img/bg1.png";
import person1 from "../assets/img/person1.png"; // Replace with actual image paths
import person2 from "../assets/img/person2.png";
import person3 from "../assets/img/person3.png";

const HeroSection: React.FC = () => {
  return (
    <section className="px-8 py-16 lg:px-32 lg:py-24 bg-primaryPurple ">
      <div className="lg:flex lg:items-center lg:justify-between">
        {/* Left Content */}
        <div className="lg:w-1/2">
          <h1 className="text-5xl lg:text-6xl font-bold text-buttonBg leading-tight">
            Connecting Vendors & <br /> Buyers Seamlessly
          </h1>
          <p className="mt-6 text-lg text-buttonBg leading-relaxed">
            Welcome to COCOA, the ultimate procurement hub for Restaurants, Cafes, and Caterers for their end-to-end needs. From Routine Kitchen Supplies and Specialized Equipment to Advanced Software and Corporate solutions.
          </p>
          <p className="mt-4 text-lg font-bold text-buttonBg">
                <span className="font-extrabold">COCOA</span>&nbsp;
            connects you directly with top Suppliers & Vendors operating in the F&B industry.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <button className="bg-buttonBg text-white font-medium rounded-full px-6 py-3 hover:bg-gradientStart transition-all">
              START NOW
            </button>
            <a href="#demo" className="text-black-700 underline">
              Want a free demo?
            </a>
          </div>
        </div>

        {/* Right Content */}
        <div className="mt-12 lg:mt-0 lg:w-1/2 relative">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <img
                src={bg1}
                alt="Smiling professional 1"
                className="h-auto w-auto rounded-xl shadow-lg "
              />
            </div>
            <div>
              <img
                src={person2}
                alt="Smiling professional 2"
                className="rounded-xl shadow-lg"
              />
            </div>
            <div>
              <img
                src={person3}
                alt="Smiling professional 3"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
