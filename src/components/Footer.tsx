import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import logoImg from "../assets/img/logoImg.png"

const Footer = () => {
  return (
    <footer className="bg-[#5D4C7C] text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo and Social Icons */}
          <div className="space-y-8">
            <a href="/" className="block">
              <img
                src={logoImg}
                alt="Cocoa Logo"
                className="w-17 h-20" // Adjust width and height as needed
              />
            </a>
            <div className="flex space-x-8">
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <FaInstagram size={32} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61553620930491"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <FaFacebook size={32} />
              </a>
              <a
                href="https://www.linkedin.com/company/koral-byte/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <FaLinkedin size={32} />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <a href="#" className="block hover:opacity-80 transition-opacity">
                HOME
              </a>
              <a href="#" className="block hover:opacity-80 transition-opacity">
                Vendors
              </a>
              <a href="#" className="block hover:opacity-80 transition-opacity">
                Buyers
              </a>
              <a href="#" className="block hover:opacity-80 transition-opacity">
                Region
              </a>
            </div>
            <div className="space-y-4">
              <a href="#" className="block hover:opacity-80 transition-opacity">
                Restaurants
              </a>
              <a href="#" className="block hover:opacity-80 transition-opacity">
                Pricing
              </a>
              <a href="#" className="block hover:opacity-80 transition-opacity">
                Log in
              </a>
              <a href="#" className="block hover:opacity-80 transition-opacity">
                Our Journey
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
