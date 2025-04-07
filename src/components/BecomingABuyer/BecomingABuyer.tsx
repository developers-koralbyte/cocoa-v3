import LandingPage from "./LandingPage";
import HowItWorks from "./HowItWorks";
import WhyChooseCocoa from "./WhyChooseCocoa";
import Invoices from "./Invoices";
import Industries from "./Industries";
import ReadyToTransform from "./ReadyToTransform";
import FAQ from "./FAQ";
import Footer from "./Footer";

import React from "react";
import { useNavigate } from "react-router-dom"; 


const BecomingABuyer = () => {
    return (
        <div>
            <LandingPage />
            <HowItWorks /> 
            <WhyChooseCocoa/>
            <Invoices />
            <Industries />
            <ReadyToTransform />
            <FAQ />
            <Footer />
        </div>
    )
}


export default BecomingABuyer;