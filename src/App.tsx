import React from "react";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";

function App() {
  return (

    <>
      <nav><Navbar/></nav>
      <HeroSection/>
      <FAQ></FAQ>
      <footer><Footer/></footer>
      
    </>
  )
}

export default App;
