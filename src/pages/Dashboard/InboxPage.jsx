// pages/Dashboard/InboxPage.jsx
import { useState, useEffect } from 'react'
import Chat from '../../components/chat/Chat'
import List from '../../components/list/List'
import { useUserStore } from '../../utils/userStore'
import { useChatStore } from '../../utils/chatStore'
import BaseLayout from '../../components/Dashboard/BaseLayout'
import Header from '../../components/Dashboard/Invoices/HeaderProps'

const InboxPage = () => {
  const { currentUser, isLoading, fetchUserInfo, showDetailPage } = useUserStore()
  const { chatId, resetChat } = useChatStore()

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [showChat, setShowChat] = useState(false)

  // Listen for resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch user info from localStorage or some logic
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser !== null) {
      const userId = JSON.parse(storedUser)
      fetchUserInfo(userId)
    } else {
      fetchUserInfo()
    }
  }, [fetchUserInfo, isLoading])

  // When user clicks a chat in the list
  const handleChatClick = () => {
    if (isMobile) {
      setShowChat(true)
    }
  }

  // Mobile "Back" to chat list
  const handleBackClick = () => {
    if (isMobile) {
      setShowChat(false)
      resetChat()
    }
  }

  return (
    <BaseLayout>
      {isMobile ? (
        showChat ? (
          showDetailPage ? (
            <div className="p-4">
              <button onClick={handleBackClick} className="mb-2 text-blue-500">
                Back
              </button>
              <h2 className="text-lg font-semibold">Detail Page Placeholder</h2>
              {/* If you had a detail component, you'd show it here */}
            </div>
          ) : (
            // Show the Chat in mobile mode
            <Chat onBackClick={handleBackClick} />
          )
        ) : (
          // Show the list in mobile mode
          <List onChatSelect={handleChatClick} currentUser={currentUser} />
        )
      ) : (
        // DESKTOP layout
        <div className="p-6">
          {/* Example Header */}
          <Header
            userName={currentUser?.firstName || 'User'}
            userRole={currentUser?.role || 'Buyer'}
            userImage={currentUser?.avatar || '/path-to-default-avatar.jpg'}
            title="Inbox"
          />

          <div className="mt-8">
            <div className="container mx-auto shadow-lg rounded-lg border-b-2 flex py-5">
              {/* Left side: Chat List */}
              <div className="flex flex-col w-2/5 border-r-2 overflow-y-auto">
                <List onChatSelect={handleChatClick} currentUser={currentUser} />
              </div>

              {/* Right side: Chat or detail */}
              <div className="w-full flex flex-col justify-between">
                {showDetailPage ? (
                  <div className="p-4">
                    <h2 className="text-lg font-semibold">Detail Page Placeholder</h2>
                    {/* <SomeDetailComponent /> */}
                  </div>
                ) : (
                  <Chat />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </BaseLayout>
  )
}

export default InboxPage
