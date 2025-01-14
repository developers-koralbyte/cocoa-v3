import React from "react";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p>Start prompting (or editing) to see magic happen :)</p>
        </div>
        <div className="relative overflow-hidden">
          <div className="absolute w-full h-96 bg-[#5D4C7C] -skew-y-6 transform origin-top-left -translate-y-24"></div>
          <div className="relative bg-white">
            <FAQ />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
