import { FaPlay } from "react-icons/fa";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 relative">
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-left mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-800 bg-clip-text text-transparent">
            How Does It Work?
          </h2>
          <p className="text-purple-400/80 text-lg">
            Interested in COCOA? Here is how we will help you!
          </p>
        </div>

        {/* Video Section */}
        <div className="relative max-w-4xl mx-auto group cursor-pointer mb-16">
          <video
            src="your-video-url.mp4" // Replace with the actual video URL
            className="w-full rounded-xl shadow-xl"
            poster="your-poster-image.jpg" // Optional: Add a poster image
          >
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center group-hover:bg-black/30 transition-colors">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <FaPlay className="w-8 h-8 text-purple-900 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Wave Decoration */}
      <div className="absolute bottom-[-30px] left-0 right-0">
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
  );
};

export default HowItWorks;
