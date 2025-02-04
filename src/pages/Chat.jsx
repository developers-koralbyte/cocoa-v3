import { useState, useEffect } from 'react'
import Chat from '../components/chat/Chat'
import Detail from '../components/detail/Detail'
import List from '../components/list/List'
import Homepage from '../pages/homepage'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../utils/firebase'
import { useUserStore } from '../utils/userStore'
import { useChatStore } from '../utils/chatStore'

const App = () => {
    const { currentUser, isLoading, fetchUserInfo, showDetailPage } =
        useUserStore()
    const { chatId, resetChat } = useChatStore()

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768) // Track if the view is mobile
    const [showChat, setShowChat] = useState(false) // Toggle between chat and chat list on mobile

    // Detect window resize to check if it's mobile or desktop
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect(() => {
        if (localStorage.getItem('user') !== null) {
            const userId = JSON.parse(localStorage.getItem('user'))
            fetchUserInfo(userId)
        } else {
            fetchUserInfo()
        }
    }, [fetchUserInfo])

    // Function to toggle between list and chat views for mobile
    const handleChatClick = () => {
        if (isMobile) {
            setShowChat(true) // On mobile, show chat
        }
    }

    const handleBackClick = () => {
        if (isMobile) {
            setShowChat(false) // On mobile, go back to chat list
            resetChat()
        }
    }

    return currentUser ? (
        <div className="flex justify-center h-screen text-white bg-[rgba(17,25,40,0.75)] backdrop-blur-[2px] backdrop-saturate-[180%] border border-[rgba(255,255,255,0.125)]">
            {isMobile ? (
                <>
                    {!showChat && chatId !== null ? (
                        showDetailPage ? (
                            chatId
                        ) : (
                            <Chat onBackClick={handleBackClick} />
                        ) // On mobile, show chat or back to list
                    ) : (
                        chatId === null && <List />
                    )}
                </>
            ) : (
                <>
                    {/* On desktop, show both chat and chatlist at the same time */}
                    <List currentUser={currentUser} />
                    <Chat />
                    {chatId && showDetailPage}
                </>
            )}
        </div>
    ) : (
        <Homepage />
    )
}

export default App
