
import FAQ from "./components/HomePage/FAQ";
import Footer from "./components/HomePage/Footer";
import HowItWorks from "./components/HomePage/HowItWorks";
import LandingPage from "./components/HomePage/LandingPage";
import ColaborationSection from "./components/HomePage/CollaborationSection";
import LatestNews from "./components/HomePage/LatestNews";
import UserTestimonial from "./components/HomePage/UserTestimonial";

function App() {
  return (

    <>
      <LandingPage/>
      <ColaborationSection/>
      <UserTestimonial/>
      <LatestNews/>
      <HowItWorks/>
      <FAQ/>
      <footer><Footer/></footer>
      
    </>
  )
}

export default App;
