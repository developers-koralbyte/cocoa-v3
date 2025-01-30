import checkMark from "../assets/img/Verification/checkmark.png";
import cocoaImg from "../assets/img/cocoa-logo.png";

const VerificationSuccess = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative">
      {/* Cocoa logo in the top-left corner */}
      <div className="absolute top-4 left-4 mb-6">
       <a href="https://cocoa-app.com/" target="_blank" rel="noopener noreferrer">
          <img src={cocoaImg} alt="Cocoa Logo" className="w-[180px] h-[90px]" />
        </a>
      </div>

      {/* Main content */}
      <div className="mb-8">
        <img
          src={checkMark}
          alt="Check Mark"
          className="max-w-[150px] h-auto mb-6"
        />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center font-nunito">
        Your Account has been created! Stay tuned for further updates!
      </h1>

      <p className="text-gray-600 text-center max-w-md mb-12 font-nunito">
      Thanks for signing up! We’re currently reviewing your account information, and it may take a few moments for your email verification to complete.
      </p>

      <button
        className="px-8 py-3 bg-[#7C77C1] text-white rounded-full hover:bg-[#6661B0] transition-colors"
        onClick={() => (window.location.href = "/")}
      >
        Explore Homepage
      </button>
    </div>
  );
};

export default VerificationSuccess;
