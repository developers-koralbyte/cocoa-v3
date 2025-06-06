import { User as UserIcon } from 'lucide-react'

export interface User {
  firstName?: string
  businessName?: string
  avatar?: string
  role?: string
  isPremium?: boolean
}

interface UserMenuProps {
  user: User
}

export default function UserMenu({ user }: UserMenuProps) {
  const firstName = user.firstName ?? 'Vendor'
  const businessName = user.businessName ?? ''
  const role = user.role ?? 'vendor'
  const isPremium = user.isPremium ?? false

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center w-full">
      {/* 
        1) Add `min-w-0` so this flex‐item is allowed to shrink below its content.
        2) Keep `truncate` on <h2> so extra text gets ellipsized.
      */}
      <div className="flex flex-col flex-1 mb-4 md:mb-0 md:pr-4 min-w-0">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight truncate">
          {firstName}
          {businessName ? (
            <>
              <span className="hidden sm:inline">, </span>
              <span className="font-light">{businessName}</span>
            </>
          ) : null}
        </h2>
        <span className="mt-1 text-sm sm:text-base md:text-lg text-gray-700 capitalize truncate">
          {role}
        </span>
        {isPremium && (
          <div className="flex items-center text-purple-600 text-sm sm:text-base md:text-lg mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
            <span className="italic truncate">Premium Account</span>
          </div>
        )}
      </div>

      {/* Right: Avatar */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={`${firstName}’s avatar`}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <UserIcon className="text-white w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </div>
        )}
      </div>
    </div>
  )
}
