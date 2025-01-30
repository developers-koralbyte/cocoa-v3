import background from "../../assets/img/SellingPointSection/Vector 10.png";
import section1 from "../../assets/img/SellingPointSection/pro1.png";
import section2 from "../../assets/img/SellingPointSection/pro2.png";
import invoice from "../../assets/img/SellingPointSection/invoice.png";
import rectangle from "../../assets/img/SellingPointSection/rectangle.png";

const ProcurementSection = () => {
  return (
    <section
      className="mt-28 bg-cover max-h-[1250px] w-full"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      {/* Title Section */}
      <div className="flex flex-center font-nunito pt-16 px-40 font-black text-black-900 justify-center leading-[4.5rem]">
        <h1 className="text-[75px] text-center">
          First-ever, all in one <br />
          <span className="text-buttonBg italic">procurement</span>
          <br />
          platform in Canada
        </h1>
      </div>

      {/* Content Section */}
      <section className="container mx-auto px-12 py-24 md:py-26 max-w-[1300px]">
        <div className="md:flex items-center gap-x-12">
          {/* Left Column: Image */}
          <div className="flex justify-center md:justify-start">
            <img
              src={section1}
              alt="Chat bubble design representing procurement features"
              className="max-w-2xl"
            />
          </div>

          {/* Right Column: Text */}
          <div className="mt-8 md:mt-0">
            <h3 className="text-[24px] font-bold leading-[2.75rem]">
              Real-Time Chat with Suppliers
            </h3>
            <p className="font-sourceSans text-[20px]">
              Connect instantly with verified suppliers accross <br />
              Canada through direct messaging. No more <br />
              waiting for emails or phone calls - discuss quotes
              <br />
              negotitate terms, and close deal in real time.
            </p>
          </div>
        </div>
        {/* Second Row */}
        <div className="mt-10 ml-10 md:flex items-center gap-x-12 text-right">
          {/* Left Column: Text */}
          <div className="mt-8  ">
            <h3 className="font-sourceSans  text-[24px] font-bold leading-[0.75rem]">
              Chat-to-Order Conversion
            </h3>
            <p className="font-sourceSans items-end mt-4 text-[20px]">
              Turn chat conversations directly into <br />
              purchase orders with a single click. Maintain <br />
              clear documentation of all negotiations and
              <br />
              agreements through your chat history.
            </p>
          </div>

          {/* Right Column: Image */}
          <div className="flex justify-center md:justify-start">
            <img
              src={section2}
              alt="Match percentage with suppliers bubble image"
              className="max-w-2xl"
            />
          </div>
        </div>

        {/* Third Row - Live Document Sharing */}
        <div className="mt-16 md:flex items-center gap-x-14 font-sourceSans">
          {/* Left Column: Image with Background */}
          <div className="relative flex justify-center md:justify-start">
            {/* White rounded background */}
            <img
              src={rectangle}
              alt="White background bubble"
              className="absolute w-[600px] h-[250px] top-0 left-0"
            />
            {/* Invoice Table - Move it upwards slightly */}
            <img
              src={invoice}
              alt="Invoice History List"
              className="relative w-auto h-auto ml-10 mt-[-31px]" // <-- Added negative margin
            />
          </div>

          {/* Right Column: Text */}
          <div className="mt-[-30px]">
            {" "}
            {/* Slight upward adjustment */}
            <h3 className="text-[24px] font-bold leading-[2.75rem]">
              Live Document Sharing
            </h3>
            <p className="font-sourceSans text-[20px]">
              Share and review crucial documents in real <br />
              time during chat conversations. Instantly
              <br />
              exchange quotes, specifications, and contracts
              <br />
              while discussing details with suppliers.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
};

export default ProcurementSection;
