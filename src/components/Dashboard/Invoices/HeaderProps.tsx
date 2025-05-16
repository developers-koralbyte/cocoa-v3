import React from "react";
import { useUserStore } from "../../../utils/userStore";
import DefaultAvatar from "./DefaultAvatar";

interface HeaderProps {
  defaultAvatar?: string;
  userName?: string;
  userRole?: string;
  userImage?: string;
}

const Header: React.FC<HeaderProps> = ({
  defaultAvatar = "/path-to-default-avatar.jpg",
}) => {
  const { currentUser } = useUserStore();

  // Don't render header at all if there's no user yet
  if (!currentUser) return null;

  const displayName =
    currentUser.firstName || currentUser.username || "User";
  const formattedRole = currentUser.role?.toUpperCase() || "GUEST";

  return (
    <div className="flex items-center space-x-3">
      <div className="text-right leading-tight">
        <div className="font-semibold text-[20px] md:text-xl font-nunito">
          {displayName}
        </div>
        <div className="text-sm md:text-base font-sourceSans text-gray-600">
          {formattedRole}
        </div>
      </div>
      
      <DefaultAvatar 
        user={currentUser}
        size="lg"
        defaultImage={defaultAvatar}
      />
    </div>
  );
};

export default Header;