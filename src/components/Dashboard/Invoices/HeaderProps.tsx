import React from "react";
import { useUserStore } from "../../../utils/userStore";

interface HeaderProps {
  defaultAvatar?: string;
}

const Header: React.FC<HeaderProps> = ({
  defaultAvatar = "/path-to-default-avatar.jpg",
}) => {
  // Get user data from the Zustand store
  const { currentUser } = useUserStore();
  
  // Use firstName from the store or fallback to username
  const displayName = currentUser?.firstName || currentUser?.username || "User";
  
  // Format the role from the store
  const formattedRole = currentUser?.role ? currentUser.role.toUpperCase() : "GUEST";
  
  // Use avatar from the store or default
  const avatarSrc = currentUser?.avatar && currentUser.avatar.trim() !== ""
    ? currentUser.avatar
    : defaultAvatar;

  return (
    <div className="flex items-center space-x-3">
      {/* User Info Text */}
      <div className="text-right leading-tight">
        <div className="font-semibold text-[20px] md:text-xl font-nunito">
          {displayName}
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