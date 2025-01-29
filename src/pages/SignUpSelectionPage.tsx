import SignupSelection from "../components/LoginPage/SignUpSelection";
import bg from "../assets/img/login/bg.png";

const SignupSelectionPage = () => {
  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-start bg-no-repeat bg-cover bg-center"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      {/* Wrap the SignupSelection Component */}
      <div className="w-full max-w-4xl mt-10 p-10">
        <SignupSelection />
      </div>
    </div>
  );
};

export default SignupSelectionPage;
