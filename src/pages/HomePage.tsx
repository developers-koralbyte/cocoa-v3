import FAQ from "../components/HomePage/FAQ";
import Footer from "../components/HomePage/Footer";
import HowItWorks from "../components/HomePage/HowItWorks";
import LandingPage from "../components/HomePage/LandingPage";
import CollaborationSection from "../components/HomePage/CollaborationSection";
import LatestNews from "../components/HomePage/LatestNews";
import UserTestimonial from "../components/HomePage/UserTestimonial";
import ProcurementSection from "../components/HomePage/ProcurementSection";
import TopSuppliers from "../components/HomePage/TopSuppliers";
import BusinessFeatures from "../components/HomePage/BusinessFeatures";
import Pricing from "../components/HomePage/Pricing";


function App() {
  return (
    <>
      <LandingPage />
      <CollaborationSection />
      <ProcurementSection />
      <BusinessFeatures />
      {/* <TopSuppliers/> */}
      <UserTestimonial />
      <LatestNews />
      <Pricing/>
      <HowItWorks />
      <FAQ />
      <footer>
        <Footer />
      </footer>
    </>
  );
}


export default App;
