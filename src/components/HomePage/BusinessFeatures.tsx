import chatImage from "../../assets/img/BusinessFeaturesSection/chat.png";
import dollarImage from "../../assets/img/BusinessFeaturesSection/dollar.png";
import graphImage from "../../assets/img/BusinessFeaturesSection/graph.png";
import rocketImage from "../../assets/img/BusinessFeaturesSection/rocket.png";
import statsImage from "../../assets/img/BusinessFeaturesSection/stats.png";
import workImage from "../../assets/img/BusinessFeaturesSection/work.png";

const features = [
    {
        id: 1,
        title: 'Real-Time Procurement Chat',
        description:
            'Connect and negotiate with suppliers through a unified chat interface, replacing emails and calls.',
        image: chatImage, // Updated to use the imported .png image
    },
    {
        id: 2,
        title: 'Multi-Solution Integration',
        description:
            'One platform for all enterprise needs with complete marketplace integration.',
        image: rocketImage, // Updated to use the imported .png image
    },
    {
        id: 3,
        title: 'Smart Documentation Flow',
        description:
            'Auto-generate procurement records from conversations and convert chats directly to purchase orders with full audit trails.',
        image: dollarImage, // Updated to use the imported .png image
    },
    {
        id: 4,
        title: 'Verified Business Work',
        description:
            'Access pre-vetted suppliers certified for reliability, compliance, and business excellence.',
        image: workImage, // Updated to use the imported .png image
    },
    {
        id: 5,
        title: 'Easy Implementation',
        description:
            'Get started in days, not months, with our no-code setup. Includes personalized onboarding, data migration, and seamless integration with your existing systems.',
        image: statsImage, // Updated to use the imported .png image
    },
    {
        id: 6,
        title: 'Customized Procurement Analytics',
        description:
            'Make data-driven decisions with real-time procurement insights and dashboards.',
        image: graphImage, // Updated to use the imported .png image
    },
]

const BusinessFeatures = () => {
  return (
      <div className="bg-gradient-to-b from-white to-purple-50 py-16">
          <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 font-nunito">
                      Unleash your business potential <br /> with
                      <span className="text-[#6868AC]"> COCOA</span>
                  </h1>
                  <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto font-sourceSans">
                      Showcasing Our Trusted Solutions: Quality, Reliability,
                      and Exceptional Service at Your Fingertips!
                  </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {features.map((feature) => (
                      <div
                          key={feature.id}
                          className="relative rounded-3xl overflow-hidden h-[260px] flex items-start justify-start p-6 md:p-8 shadow-md bg-[#6868AC]"
                      >
                          {/* Background Image */}
                          <div className="absolute inset-0 flex items-center justify-center">
                              <img
                                  src={feature.image}
                                  alt={feature.title}
                                  className="max-w-[80%] max-h-[80%] object-contain opacity-20"
                              />
                          </div>

                          {/* Overlay (optional for contrast) */}
                          <div className="absolute inset-0 bg-[#6868AC] opacity-60" />

                          {/* Content */}
                          <div className="relative z-10">
                              <h3 className="text-lg md:text-xl font-bold text-white font-nunito mb-2">
                                  {feature.title}
                              </h3>
                              <p className="text-white text-sm md:text-base leading-relaxed font-nunito">
                                  {feature.description}
                              </p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  )
};

export default BusinessFeatures;
