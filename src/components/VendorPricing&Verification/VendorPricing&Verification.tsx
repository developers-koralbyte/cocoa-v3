import PricingAndVerification from "./Pricing&Verifiction";
import VideoForVendors from "./VideoForVendors";
import RequiredDocuments from "./RequiredDocuments";
import VerificationProcess from "./VerificationProcess";
import BenefitsOfVerification from "./BenefitsOfVerification";
import FAQ from "./FAQ";
import Footer from "./Footer";

const VendorPricingVerification = () => {
    return (
        <>
            <PricingAndVerification />
            <VideoForVendors />
            <RequiredDocuments />
            <VerificationProcess />
            <BenefitsOfVerification />
            <FAQ/>
            <Footer />
        </>
    )
}

export default VendorPricingVerification;