
import bgWave from "../assets/img/MainSection/bgWave.png";
import cocoaLogo from "../assets/img/cocoa-logo.png";

const LandingPage = () => {
  return (
    <>
      <section
        className="relative bg-cover bg-no-repeat min-h-[1200px] w-full" // Updated height
        style={{
          backgroundImage: `url(${bgWave})`,
          backgroundSize: "cover",
          backgroundPosition: "bottom center",
        }}
      >
        {/* Navbar */}
        <nav className=" flex px-16 py-10">
          {/* Logo Section */}
          <div className="flex items-center">
            <a href="/">
              <img src={cocoaLogo} alt="Cocoa Logo" className="h-20 w-auto" />
            </a>
          </div>

          {/* Navigation Links */}
          <div className="font-nunito flex space-x-6 ml-auto font-bold text-xl">
            <button className="text-buttonBg font-large px-4 py-2 ">
              Vendors <span className="ml-1">&#9662;</span>
            </button>
            <button className="text-buttonBg font-large px-4 py-2">
              Buyers <span className="ml-1">&#9662;</span>
            </button>
            <button className="text-buttonBg font-large px-4 py-2">
              Industry <span className="ml-1">&#9662;</span>
            </button>
            <button className="text-buttonBg font-large px-4 py-2 ">
              Services <span className="ml-1">&#9662;</span>
            </button>
            <button className="text-buttonBg font-large px-4 py-2">
              Log in
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-[1200px] pt-32 pl-28">
          <h1 className="font-nunito text-[75px] font-bold leading-[86px] text-left text-buttonBg">
            Real-Time Global <br /> Procurement Through Chat
          </h1>
          <div className="font-sourceSans text-[19px]">
            <p className=" mt-6 text-lg text-buttonBg leading-relaxed">
              Welcome to COCOA, your comprehensive procurement marketplace
              connecting businesses
              <br /> with verified suppliers through instant chat communication.
            </p>
            <p className="mt-4 text-lg text-buttonBg leading-relaxed">
              From enterprise-level corporate services and leading ERP solutions
              (including NetSuite, SAP <br /> S/4HANA, Oracle) to commercial
              equipment and food & beverage procurement, COCOA
              <br /> revolutionizes B2B purchasing by providing real-time
              communication with trusted suppliers <br /> in one integrated
              platform.
            </p>
            <p className="mt-6 text-lg font-bold text-buttonBg">
              Lorem ipsum dolor sit amet consectetur. Purus aliquam sit non amet
              tincidunt
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
            <button className="bg-buttonBg text-white font-medium rounded-full px-6 py-3 hover:bg-gradientStart transition">
              START NOW
            </button>
            <a href="#demo" className="pt-3 text-black underline">
              Want a free demo?
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
