// components/list/chatList/ChatList.jsx
import { useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../../'

import { useUserStore } from '../../../utils/userStore'
import { useChatStore } from '../../../utils/chatStore'
import AddUser from './addUser/addUser' // if you have a "plus" button to add new contacts
import searchIcon from '../../../assets/img/chatImages/search.png'
import DefaultAvatar from '../../Dashboard/Invoices/DefaultAvatar'
const ChatList = () => {
  const [chats, setChats] = useState([])
  const [addMode, setAddMode] = useState(false)
  const [input, setInput] = useState('')

  // The user store, which includes docId & other fields
  const { currentUser } = useUserStore()
  const { changeChat } = useChatStore()

  useEffect(() => {
    // If we have no docId, skip
    if (!currentUser?.docId) {
      return
    }

    // Listen for changes in userchats/{currentUser.docId}
    const unSub = onSnapshot(doc(db, 'userchats', currentUser.docId), async (res) => {
      if (!res.exists()) {
        setChats([])
        return
      }

      const items = res.data().chats || []
      // For each chat item, we fetch the user doc by `receiverId`
      const promises = items.map(async (item) => {
        try {
          const userDocRef = doc(db, 'users', item.receiverId)
          const userDocSnap = await getDoc(userDocRef)

          if (!userDocSnap.exists()) {
            // If the user doc doesn't exist, embed the ID anyway
            return { ...item, user: { id: item.receiverId } }
          }

          const userData = userDocSnap.data()
          const user = {
            docId: userDocSnap.id, // the doc ID (random)
            ...userData,          // includes .id => the “auth ID”
          }
          return { ...item, user }
        } catch (err) {
          console.error('Error fetching user data:', err)
          return item
        }
      })

      const chatData = await Promise.all(promises)
      // Sort by updatedAt descending
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt))
    })

    return () => unSub()
  }, [currentUser?.docId])

  const handleSelect = async (chat) => {
    // Mark as seen locally
    const updatedChats = chats.map((c) =>
      c.chatId === chat.chatId ? { ...c, isSeen: true } : c
    )

    try {
      // Save to Firestore, removing the user object
      await updateDoc(doc(db, 'userchats', currentUser.docId), {
        chats: updatedChats.map(({ user, ...rest }) => rest),
      })
      // Switch the store to this chat
      changeChat(chat.chatId, chat.user)
    } catch (error) {
      console.error(error)
    }
  }

  // Filter by user’s username
  const filteredChats = chats.filter((chat) =>
    chat.user?.username?.toLowerCase().includes(input.toLowerCase())
  )

  return (
    <>
      <div className="border-b-2 py-4 px-2 border-t-2">
        <input
          type="text"
          placeholder="Search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="py-2 px-2 border-2 border-gray-200 rounded-2xl w-full"
        />
      </div>

      {!addMode ? (
        filteredChats.map((chat) => (
          <div
            key={chat.chatId}
            className="flex flex-row py-4 px-2 items-center border-b-2"
            onClick={() => handleSelect(chat)}
          >
            <div className="w-1/4">
             <DefaultAvatar
    user={chat.user}
    size="lg"
    className="h-12 w-12"
    defaultImage="./avatar.png"
/>
            </div>
            <div className="w-full">
              <div className="text-lg font-semibold">
                {/* If blocked includes currentUser.id, show 'User' instead of username */}
                {chat.user?.blocked?.includes(currentUser?.id)
                  ? 'User'
                  : chat.user?.username || 'Unknown'}
              </div>
              <span className="text-gray-500">{chat.lastMessage}</span>
            </div>
            {!chat.isSeen && (
              <div
                style={{
                  width: '15px',
                  height: '15px',
                  backgroundColor: '#17b617',
                  borderRadius: '50%',
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              ></div>
            )}
          </div>
        ))
      ) : (
        <AddUser setAddMode={setAddMode} searchIcon={searchIcon} />
      )}
    </>
  )
}

export default ChatList
