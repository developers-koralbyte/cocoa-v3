
import FAQ from "./components/Landing Page/FAQ";
import Footer from "./components/Landing Page/Footer";
import HowItWorks from "./components/Landing Page/HowItWorks";
import LandingPage from "./components/Landing Page/LandingPage";
import ColaborationSection from "./components/Landing Page/CollaborationSection";
import LatestNews from "./components/Landing Page/LatestNews";
import UserTestimonial from "./components/Landing Page/UserTestimonial";

function App() {
  return (

    <>
      <LandingPage/>
      <ColaborationSection/>
      <UserTestimonial/>
      <LatestNews/>
      <HowItWorks/>
      <FAQ></FAQ>
      <footer><Footer/></footer>
      
    </>
  )
}

export default App;
