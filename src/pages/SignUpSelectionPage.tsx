import SignupSelection from "../components/LoginPage/SignUpSelection";
import bg from "../assets/img/login/bg.png";

const SignupSelectionPage = () => {
  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-no-repeat bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <div className="w-full max-w-4xl p-6">
        <SignupSelection />
      </div>
    </div>
  );
};

export default SignupSelectionPage;
