
import FAQ from "./components/HomePage/FAQ";
import Footer from "./components/HomePage/Footer";
import HowItWorks from "./components/HomePage/HowItWorks";
import LandingPage from "./components/HomePage/LandingPage";
import ColaborationSection from "./components/HomePage/CollaborationSection";
import ProcurementSection from "./components/HomePage/ProcurementSection";
function App() {
  return (

    <>
      <LandingPage/>
      <ColaborationSection/>
      <ProcurementSection/>
      <HowItWorks/>
      <FAQ/>
      <footer><Footer/></footer>
    </>
  )
}

export default App;
