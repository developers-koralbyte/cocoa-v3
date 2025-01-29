import NewPasswordForm from "../../components/ForgotPassword/NewPasswordForm";
import logo from "../../assets/img/login/cocoaLoginLogo.png";
import background from "../../assets/img/ForgotPassword/New_password.png";
const NewPasswordPage =() =>{

    return (
        <div className="min-h-full flex ">
        {/* Left Section with the Image */}
        <div className="lg:w-1/2 w-full h-[1050px]">
          <img
            src={background}
            alt="Welcome Back Illustration"
            className="w-full h-full object-cover"
          />
        </div>
  
        {/* Right Section */}
        <div className=" lg:w-1/2 h-[1000px] flex justify-center ">
          <div className="mt-28 max-w-md w-full px-8 text-left  ">
            {/* Logo */}
            <img
              src={logo}
              alt="Cocoa Logo"
              className="mx-auto h-auto w-auto"
            />
          <div className="font-black font-nunito text-[65px] leading-[1] text-buttonBg mb-10">
              <h1>Forgot <br/>
                  Password?</h1>
          </div>
            {/* Welcome Text */}
            <div className="font-sourceSans text-[20px] text-gray-700 mb-7">
              <p className="mb-2">Enter your email recovery address, we will</p>
              <p>send you a link to reset your password</p>
            </div>
  
            {/* Login Form */}
            <NewPasswordForm />
          </div>
        </div>
      </div>
    );
}

export default NewPasswordPage;