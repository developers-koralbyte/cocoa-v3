import React from "react";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
function App() {
  return (

    <>
      <nav><Navbar/></nav>
      <HeroSection/>
      <HowItWorks/>
      <FAQ></FAQ>
      <footer><Footer/></footer>
      
    </>
  )
}

export default App;
