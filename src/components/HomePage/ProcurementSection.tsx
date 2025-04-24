import background from '../../assets/img/SellingPointSection/Vector 10.png'
import section1 from '../../assets/img/SellingPointSection/pro1.png'
import section2 from '../../assets/img/SellingPointSection/pro2.png'
import invoice from '../../assets/img/SellingPointSection/invoice.png'
import rectangle from '../../assets/img/SellingPointSection/rectangle.png'

import imageOne from '../../assets/img/SellingPointSection/imageOne.png'
import imageTwo from '../../assets/img/SellingPointSection/imageTwo.png'

import bgImageMobile from '../../assets/img/SellingPointSection/bgImageMobile.png'

import newInvoiceImage from '../HomePage/invoiceNewImage.png'
import aiPowerImg from '../../assets/img/SellingPointSection/aiPowerImg.png'
import newAiPowerImg from '../../assets/img/SellingPointSection/newAiPowerImg.png'
import latestAiPwerImg from '../../assets/img/SellingPointSection/latestAiPowerImg.png'

const ProcurementSection = () => {
    return (
        <>
            {/* Laptop Layout - Only visible on large screens */}
            <section
                className="lg:block hidden mt-28 bg-cover max-h-[1250px] w-full"
                style={{
                    backgroundImage: `url(${background})`,
                }}
            >
                {/* Title Section */}
                <div className="font-nunito pt-0 px-40 font-black text-black-900 leading-[4.5rem]">
                    <h1 className="text-[75px] text-left pl-10 md:pl-20 font-nunito font-bold max-w-5xl">
                        Canada's Chat-Based <br />
                        <span className="text-buttonBg">procurement</span>
                        <br />
                        Revolution
                    </h1>
                </div>

                {/* Content Section */}
                <section className="container mx-auto px-12 py-12 md:py-26 max-w-[1300px]">
                    <div className="md:flex items-center gap-x-12">
                        {/* Left Column: Image */}
                        <div className="flex justify-center md:justify-start">
                            <img
                                src={imageOne}
                                alt="Chat bubble design representing procurement features"
                                className="max-w-2xl"
                            />
                        </div>

                        {/* Right Column: Text */}
                        <div className="mt-8 md:mt-0">
                            <h3 className="text-[24px] font-bold leading-[2.75rem] font-nunito">
                                Real-Time Chat with Suppliers
                            </h3>
                            <p className="font-sourceSans text-[20px] max-w-[820px]">
                                Instantly connect with verified suppliers across
                                Canada via direct messaging. Skip the wait—chat,
                                negotiate, and close deals in real time.
                            </p>
                        </div>
                    </div>
                    {/* Second Row */}
                    <div className="mt-10 ml-10 md:flex items-center gap-x-12 text-right">
                        {/* Left Column: Text */}
                        <div className="mt-8 max-w-xl text-right">
                            <h3 className="font-nunito  text-[22px] font-bold leading-[0.75rem]">
                                AI-Powered Buyers / Vendors Matching
                                <br /> <br />{' '}
                            </h3>
                            <p className="font-sourceSans place-items-start mt-4 text-[20px]">
                                AI/ML driven model to match you with the most
                                compatible business partners and opportunities
                                in the market.
                            </p>
                        </div>

                        {/* Right Column: Image */}
                        <div className="flex justify-center md:justify-start">
                            <img
                                src={latestAiPwerImg}
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
                                src={newInvoiceImage}
                                alt="Invoice History List"
                                className="relative w-[550px] h-auto"
                            />
                        </div>

                        {/* Right Column: Text */}
                        <div className="mt-[-30px]">
                            {' '}
                            {/* Slight upward adjustment */}
                            <h3 className="text-[24px] font-bold leading-[2.75rem] font-nunito">
                                Document Sharing
                            </h3>
                            <p className="font-sourceSans text-[20px] max-w-[800px]">
                                Share and review crucial documents in real time
                                during chat <br /> conversations. Instantly
                                exchange quotes, specifications, and contracts
                                while discussing details with suppliers.
                            </p>
                        </div>
                    </div>
                </section>
                {/* Fade-out gradient for seamless transition to next section */}
                <div className="hidden lg:block h-20 w-full bg-gradient-to-b from-transparent to-white"></div>
            </section>

            {/* Mobile Layout - Only visible on small screens */}
            <section
                className="lg:hidden mt-28 bg-cover w-full"
                style={{ backgroundImage: `url(${bgImageMobile})` }}
            >
                {/* Title Section */}
                <div className="flex flex-center font-nunito pt-16 px-12 font-black text-black-900 justify-center leading-[3.5rem]">
                    <h1 className="text-[40px] text-center">
                        First-ever, all in one <br />
                        <span className="text-buttonBg italic">
                            procurement
                        </span>
                        <br />
                        platform in Canada
                    </h1>
                </div>

                {/* Content Section */}
                <section className="container mx-auto px-6 py-12 max-w-[1300px]">
                    <div className="flex flex-col items-center gap-y-12">
                        {/* Left Column: Image */}
                        <div className="flex justify-center">
                            <img
                                src={section1}
                                alt="Chat bubble design representing procurement features"
                                className="max-w-[320px]"
                            />
                        </div>

                        {/* Right Column: Text */}
                        <div className="mt-8 text-center">
                            <h3 className="text-[22px] font-bold leading-[2.75rem]">
                                Real-Time Chat with Suppliers
                            </h3>
                            <p className="font-sourceSans text-[18px]">
                                Connect instantly with verified suppliers across{' '}
                                <br />
                                Canada through direct messaging. No more <br />
                                waiting for emails or phone calls - discuss
                                quotes, negotiate terms, and close deals in real
                                time.
                            </p>
                        </div>
                    </div>

                    {/* Second Row */}
                    <div className="mt-10 flex flex-col items-center gap-y-8">
                        {/* Left Column: Text */}
                        <div className="text-center">
                            <h3 className="font-sourceSans text-[22px] font-bold leading-[1.5rem]">
                                Chat-to-Order Conversion
                            </h3>
                            <p className="font-sourceSans mt-4 text-[18px]">
                                Turn chat conversations directly into <br />
                                purchase orders with a single click. Maintain{' '}
                                <br />
                                clear documentation of all negotiations and{' '}
                                <br />
                                agreements through your chat history.
                            </p>
                        </div>

                        {/* Right Column: Image */}
                        <div className="flex justify-center">
                            <img
                                src={section2}
                                alt="Match percentage with suppliers bubble image"
                                className="max-w-[320px]"
                            />
                        </div>
                    </div>

                    {/* Third Row - Live Document Sharing */}
                    <div className="mt-16 flex flex-col items-center gap-y-8 font-sourceSans">
                        {/* Left Column: Image with Background */}
                        <div className="relative flex justify-center">
                            {/* White rounded background */}
                            <img
                                src={rectangle}
                                alt="White background bubble"
                                className="absolute w-[280px] h-[140px] top-0 left-0"
                            />
                            {/* Invoice Table */}
                            <img
                                src={invoice}
                                alt="Invoice History List"
                                className="relative w-auto h-auto ml-10 mt-[-31px]"
                            />
                        </div>

                        {/* Right Column: Text */}
                        <div>
                            <h3 className="text-[22px] font-bold leading-[2.75rem] text-center">
                                Live Document Sharing
                            </h3>
                            <p className="font-sourceSans text-[18px] text-center">
                                Share and review crucial documents in real-time
                                during chat conversations. Instantly exchange
                                quotes, specifications, and contracts while
                                discussing details with suppliers.
                            </p>
                        </div>
                    </div>
                </section>
            </section>
        </>
    )
}

export default ProcurementSection
