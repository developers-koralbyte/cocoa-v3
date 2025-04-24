import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { User as UserIcon, Settings as SettingsIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export interface User {
  firstName?: string
  avatar?: string
  role?: string
}

interface UserMenuProps {
  user: User
}

export default function UserMenu({ user }: UserMenuProps) {
  const navigate = useNavigate()
  const name = user.firstName ?? 'Vendor'
  const role = user.role ?? 'Vendor'

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center gap-3 p-2 rounded">
        <div className="flex flex-col justify-center leading-tight">
          <h2 className="font-bold font-nunito text-sm">{name}</h2>
          <span className="text-xs text-gray-600 font-nunito">{role}</span>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {user.avatar
            ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            : <UserIcon className="text-gray-400 w-6 h-6" />
          }
        </div>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-44 bg-white shadow-lg ring-1 ring-black/5 rounded-md">
          <div className="py-1">
            {/* Manage Profile */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => navigate('/settings')}
                  style={{ color: 'hsla(240,29%,54%,1)' }}
                  className={`flex items-center w-full px-4 py-2 text-sm ${
                    active ? 'bg-gray-100' : ''
                  }`}
                >
                  <UserIcon className="w-5 h-5 mr-2" />
                  Manage Profile
                </button>
              )}
            </Menu.Item>

            {/* Settings */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => navigate('/settings')}
                  className={`flex items-center w-full px-4 py-2 text-sm ${
                    active ? 'bg-gray-100' : ''
                  }`}
                >
                  <SettingsIcon className="w-5 h-5 mr-2" />
                  Settings
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
