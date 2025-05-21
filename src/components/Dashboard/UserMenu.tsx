import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { User as UserIcon, Settings as SettingsIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
  const firstName = user.firstName ?? 'Vendor'
  const businessName = user.businessName ?? ''
  const role = user.role ?? 'vendor'
  const isPremium = user.isPremium ?? false

  return (
    <div className="flex items-center">
      {/* Left side text */}
      <div className="flex flex-col mr-3">
        <h2 className="text-3xl font-bold">
          {firstName}{businessName ? `, ${businessName}` : ''}
        </h2>
        <div className="flex flex-col">
          <span className="text-xl text-gray-600 capitalize">{role}</span>
          {isPremium && (
            <div className="flex items-center text-purple-600 text-xl mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
              </svg>
              <span className="italic">Premium Account</span>
            </div>
          )}
        </div>
      </div>

      {/* Right side avatar */}
      <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center">
        {user.avatar ? (
          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <UserIcon className="text-white w-10 h-10" />
          </div>
        )}
      </div>
    </div>
  )
}