import React from "react";

interface HeaderProps {
  userName?: string;
  userRole?: string;
  userImage?: string;
}

const Header: React.FC<HeaderProps> = ({
  userName = "User",
  userRole = "Guest",
  userImage = "/path-to-default-avatar.jpg",
}) => {

  const formattedRole = userRole?.toUpperCase();

  const avatarSrc =
    userImage && userImage.trim() !== ""
      ? userImage
      : "/path-to-default-avatar.jpg";

  return (
    <div className="flex items-center space-x-3">
      {/* User Info Text */}
      <div className="text-right leading-tight">
        <div className="font-semibold text-[20px] md:text-xl font-nunito">
          {userName}
        </div>
        <div className="text-sm md:text-base font-sourceSans text-gray-600">
          {formattedRole}
        </div>
      </div>

      {/* Avatar */}
      <img
        src={avatarSrc}
        alt="User Avatar"
        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
      />
    </div>
  );
};

export default Header;
