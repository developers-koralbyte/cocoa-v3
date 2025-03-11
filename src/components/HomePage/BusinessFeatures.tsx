import chatImage from "../../assets/img/BusinessFeaturesSection/chat.png";
import dollarImage from "../../assets/img/BusinessFeaturesSection/dollar.png";
import graphImage from "../../assets/img/BusinessFeaturesSection/graph.png";
import rocketImage from "../../assets/img/BusinessFeaturesSection/rocket.png";
import statsImage from "../../assets/img/BusinessFeaturesSection/stats.png";
import workImage from "../../assets/img/BusinessFeaturesSection/work.png";

const features = [
  {
    id: 1,
    title: "Real-Time Procurement Chat",
    description:
      "Transform traditional procurement into instant conversations. Connect and negotiate with verified suppliers through our seamless chat interface, eliminating lengthy email chains and phone calls.",
    image: chatImage, // Updated to use the imported .png image
  },
  {
    id: 2,
    title: "Multi-Solution Integration",
    description:
      "One platform for all your enterprise needs, from complete services to full integration support. Access and manage features through a single integrated marketplace.",
    image: rocketImage, // Updated to use the imported .png image
  },
  {
    id: 3,
    title: "Smart Documentation Flow",
    description:
      "Every deal automatically becomes your procurement record. Convert consultations directly into purchase orders while maintaining complete audit trails.",
    image: dollarImage, // Updated to use the imported .png image
  },
  {
    id: 4,
    title: "Verified Business Work",
    description:
      "Access a curated network of pre-vetted enterprise suppliers. Every participant is certified for reliability, compliance, and business excellence.",
    image: workImage, // Updated to use the imported .png image
  },
  {
    id: 5,
    title: "End-to-End Implementation Support",
    description:
      "Move beyond traditional vendor-client relationships. Get comprehensive support from initial consultation through full solution implementation and ongoing optimization.",
    image: statsImage, // Updated to use the imported .png image
  },
  {
    id: 6,
    title: "Customized Procurement Analytics",
    description:
      "Track and analyze your procurement patterns through intuitive dashboards. Make data-driven decisions with real-time insights into negotiations, spending, and suppliers.",
    image: graphImage, // Updated to use the imported .png image
  },
];

const BusinessFeatures = () => {
  return (
    <div className="bg-gradient-to-b from-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 font-nunito">
            Unleash your business potential <br /> with
            <span className="text-[#6868AC]"> COCOA</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-nunito">
            Showcasing Our Trusted Solutions: Quality, Reliability, and
            Exceptional Service at Your Fingertips!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-[rgba(212,205,244,0.65)] backdrop-blur-sm rounded-3xl p-6 flex flex-col md:flex-row gap-4 group cursor-pointer hover:bg-[#6868AC] transition-all duration-300"
            >
              {/* Text section */}
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 text-purple-800 group-hover:text-white transition-colors duration-300 font-nunito">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300 font-nunito">
                  {feature.description}
                </p>
              </div>

              {/* Image section */}
              <div className="flex-shrink-0 w-16 h-16 md:w-32 md:h-32 mt-auto">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessFeatures;
