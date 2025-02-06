import { useState, useEffect } from 'react'
import Chat from '../../components/chat/Chat'
import List from '../../components/list/List'
import Homepage from '../HomePage'
import { useUserStore } from '../../utils/userStore'
import { useChatStore } from '../../utils/chatStore'
import BaseLayout from '../../components/Dashboard/BaseLayout'
import Header from '../../components/Dashboard/Invoices/HeaderProps'

const InboxPage = () => {
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
    }, [fetchUserInfo, isLoading])

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

    return (
        <>
            <BaseLayout>
                <div>
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
                            {/* <List currentUser={currentUser} />
                            <Chat /> */}
                            <div className="p-6">
                                {/* Header Section */}
                                <Header
                                    userName={currentUser?.username || 'User'}
                                    userRole={currentUser?.role || 'Buyer'}
                                    userImage={
                                        currentUser?.avatar ||
                                        '/path-to-default-avatar.jpg'
                                    }
                                    title={'Inbox'}
                                />

                                {/* Invoice History Section */}
                                <div className="mt-8">
                                    {/* Invoice Table will go here */}
                                    <div className="container mx-auto shadow-lg rounded-lg border-b-2 flex py-5">
                                        <div className="flex flex-row justify-between bg-white w-full">
                                            <div className="flex flex-col w-2/5 border-r-2 overflow-y-auto">
                                                <List
                                                    className="flex flex-row py-4 px-2 justify-center items-center border-b-2"
                                                    currentUser={currentUser}
                                                />
                                            </div>

                                            <div className="w-full  flex flex-col justify-between">
                                                <Chat />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <></>
            </BaseLayout>

            {/* Chat Image/Button */}
        </>
    )
}

export default InboxPage
