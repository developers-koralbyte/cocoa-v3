import React, { useState } from 'react';

// Define interface for user properties
interface User {
  id?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  username?: string;
  avatar?: string;
  role?: string;
}

interface DefaultAvatarProps {
  user?: User | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  defaultImage: string; // Making this required since we always want to use it
}

/**
 * DefaultAvatar component - displays either:
 * 1. User's profile image if available
 * 2. Default image from assets as the standard fallback
 * 3. Only uses initials if both images fail to load
 */
const DefaultAvatar: React.FC<DefaultAvatarProps> = ({
  user,
  size = 'md',
  className = '',
  defaultImage
}) => {
  const [userImgError, setUserImgError] = useState<boolean>(false);
  const [defaultImgError, setDefaultImgError] = useState<boolean>(false);
  
  // Get initials from user data
  const getInitials = (): string => {
    if (!user) return '?';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user.firstName) {
      return user.firstName[0].toUpperCase();
    } else if (user.businessName && user.businessName.length > 0) {
      return user.businessName[0].toUpperCase();
    } else if (user.username && user.username.length > 0) {
      return user.username[0].toUpperCase();
    } else {
      return '?';
    }
  };
  
  // Get background color based on user id or name
  const getBackgroundColor = (): string => {
    if (!user) return '#5F4B8B'; // Default purple
    
    // Use any identifier available
    const identifier = user.id || user.username || user.firstName || user.businessName || '';
    
    if (!identifier) return '#5F4B8B';
    
    // Simple hash function to generate color from string
    const hash = identifier.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Generate HSL color with fixed saturation and lightness for good contrast
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 70%, 60%)`;
  };
  
  // Determine size class
  const sizeClass = {
    'xs': 'w-6 h-6 text-xs',
    'sm': 'w-8 h-8 text-xs',
    'md': 'w-10 h-10 text-sm',
    'lg': 'w-12 h-12 text-base',
    'xl': 'w-16 h-16 text-lg'
  }[size] || 'w-10 h-10 text-sm';

  // If user has avatar and it hasn't errored
  const hasAvatar = user?.avatar && user.avatar.trim() !== '' && !userImgError;
  
  // Only use initials if both user avatar and default image failed
  if (hasAvatar) {
    // User has an avatar, show it
    return (
      <img 
        src={user.avatar} 
        alt={user.firstName || user.businessName || 'User'} 
        className={`${sizeClass} rounded-full object-cover ${className}`}
        onError={() => setUserImgError(true)}
      />
    );
  } else if (!defaultImgError) {
    // Always try the default image if user avatar not available or failed
    return (
      <img 
        src={defaultImage} 
        alt="Default avatar" 
        className={`${sizeClass} rounded-full object-cover ${className}`}
        onError={() => setDefaultImgError(true)}
      />
    );
  } else {
    // Last resort: only if both images failed, show initials
    return (
      <div 
        className={`${sizeClass} rounded-full flex items-center justify-center text-white font-medium ${className}`}
        style={{ backgroundColor: getBackgroundColor() }}
      >
        {getInitials()}
      </div>
    );
  }
};

export default DefaultAvatar;