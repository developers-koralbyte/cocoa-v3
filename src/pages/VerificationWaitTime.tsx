import cocoaImg from "../assets/img/cocoa-logo.png";
import verificationWait from "../assets/img/Verification/verificationWait.png"


const VerificationWait = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative">
      {/* Cocoa logo in the top-left corner */}
      <div className="absolute top-4 left-4 mb-6">
        <a href="https://cocoa-app.com/" target="_blank" rel="noopener noreferrer">
          <img src={cocoaImg} alt="Cocoa Logo" className="w-[140px] h-[100px]" />
        </a>
      </div>

      {/* Main content */}
      <div className="mb-8">
        <img
          src={verificationWait}
          alt="Verification Wait"
          className="max-w-[150px] h-auto mb-6"
        />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
        Verification in Progress
      </h1>

      <p className="text-gray-600 text-center max-w-md mb-12 font-nunito">
        Thanks for signing up! We're currently reviewing your account information, 
        and may take a few momemnts for your email verification to complete.
      </p>

      <button
        className="px-8 py-3 bg-[#7C77C1] text-white rounded-full hover:bg-[#6661B0] transition-colors"
        onClick={() => (window.location.href = "/dashboard")}
      >
        Explore homepage 
      </button>
    </div>
  );
};

export default VerificationWait;
