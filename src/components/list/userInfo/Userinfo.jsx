import React, { useState, useRef, useEffect } from 'react'
import './userInfo.css'
import { useUserStore } from '../../../lib/userStore'
import more from '../../../assets/img/chatImages/more.png'
import { auth } from '../../../lib/firebase'
import { useChatStore } from '../../../lib/chatStore'
import { toast } from 'react-toastify'

const Userinfo = ({ currentUser }) => {
    const { resetChat } = useChatStore()

    const [open, setOpen] = useState(false)
    const menuRef = useRef(null)

    // Toggle menu visibility
    const handleToggle = () => {
        setOpen(!open)
    }

    // Close menu if clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleLogout = () => {
        auth.signOut()
        resetChat()
        localStorage.removeItem('user')
        toast.success('Successfully logged out')
    }

    return (
        <div className="userInfo">
            <div className="user">
                <img src={currentUser?.avatar || avatar} alt="" />
                <h2>{currentUser?.username}</h2>
            </div>

            {/* <div className="options-menu" ref={menuRef}>
                <div className="icons" onClick={handleToggle}>
                    <img src={more} alt="More options" />
                </div>

                {open && (
                    <ul className="dropdown-menu1">
                        <li className="dropdown-item" onClick={handleLogout}>
                            <img src={'./logout.png'} alt="Send Image" />
                            <i className="icon-logout"></i> Logout
                        </li>
                    </ul>
                )}
            </div> */}
        </div>
    )
}

export default Userinfo
